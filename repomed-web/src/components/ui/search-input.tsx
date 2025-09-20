'use client';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  className?: string;
  showClearButton?: boolean;
}

export function SearchInput({
  value = '',
  placeholder = 'Pesquisar...',
  onSearch,
  onClear,
  debounceMs = 300,
  className,
  showClearButton = true
}: SearchInputProps) {
  const [searchValue, setSearchValue] = useState(value);
  
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, onSearch, debounceMs]);

  const handleClear = () => {
    setSearchValue('');
    onClear?.();
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {showClearButton && searchValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}