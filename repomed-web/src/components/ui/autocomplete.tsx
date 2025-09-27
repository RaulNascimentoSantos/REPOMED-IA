'use client';
import { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value?: string;
  onSelect: (option: AutocompleteOption) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  allowCustom?: boolean;
  maxHeight?: number;
  debounceMs?: number;
}

export function Autocomplete({
  options,
  value,
  onSelect,
  onSearch,
  placeholder = 'Digite para buscar...',
  className,
  disabled = false,
  loading = false,
  allowCustom = false,
  maxHeight = 200,
  debounceMs = 300
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  // Debounced search
  useEffect(() => {
    if (!onSearch) return;
    
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [query, onSearch, debounceMs]);

  // Filter options based on query
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(query.toLowerCase()) ||
    option.value.toLowerCase().includes(query.toLowerCase()) ||
    (option.description && option.description.toLowerCase().includes(query.toLowerCase()))
  );

  // Reset selected index when filtered options change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredOptions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (!isOpen && newQuery) {
      setIsOpen(true);
    }
  };

  const handleOptionSelect = (option: AutocompleteOption) => {
    if (option.disabled) return;
    
    onSelect(option);
    setQuery(option.label);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleOptionSelect(filteredOptions[selectedIndex]);
        } else if (allowCustom && query) {
          onSelect({ value: query, label: query });
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current && 
      !dropdownRef.current.contains(e.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update query when value changes externally
  useEffect(() => {
    if (selectedOption && !isOpen) {
      setQuery(selectedOption.label);
    }
  }, [selectedOption, isOpen]);

  const displayValue = selectedOption?.label || query;

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
          )}
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )} style={{ color: 'var(--text-aaa-secondary)' }} />
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg overflow-hidden"
          style={{ maxHeight }}
        >
          {filteredOptions.length > 0 ? (
            <div className="overflow-y-auto" style={{ maxHeight }}>
              {filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option)}
                  disabled={option.disabled}
                  className={cn(
                    'w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                    'flex items-center justify-between',
                    selectedIndex === index && 'bg-blue-50',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    selectedOption?.value === option.value && 'bg-blue-100'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{option.label}</div>
                    {option.description && (
                      <div className="text-xs truncate" style={{ color: 'var(--text-aaa-secondary)' }}>
                        {option.description}
                      </div>
                    )}
                  </div>
                  
                  {selectedOption?.value === option.value && (
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-4 text-center text-sm" style={{ color: 'var(--text-aaa-secondary)' }}>
              {loading ? 'Carregando...' : (
                <>
                  {query ? (
                    <>
                      Nenhum resultado encontrado
                      {allowCustom && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onSelect({ value: query, label: query });
                            setIsOpen(false);
                          }}
                          className="w-full mt-2"
                        >
                          Criar "{query}"
                        </Button>
                      )}
                    </>
                  ) : (
                    'Digite para buscar'
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}