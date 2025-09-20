'use client';
import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  className,
  disabled = false,
  minDate,
  maxDate
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR');
  };

  const handleDateSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const getDaysInMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setViewDate(newDate);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Input
          value={formatDate(value || null)}
          placeholder={placeholder}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          readOnly
          disabled={disabled}
          className="cursor-pointer pr-10"
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-lg shadow-lg p-4 min-w-[280px]">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <h3 className="font-medium">
              {viewDate.toLocaleDateString('pt-BR', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h3>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-xs text-gray-500 text-center py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((date, index) => {
              const isCurrentMonth = date.getMonth() === viewDate.getMonth();
              const isSelected = value && 
                date.toDateString() === value.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              const disabled = isDateDisabled(date);

              return (
                <Button
                  key={index}
                  variant={isSelected ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleDateSelect(date)}
                  disabled={disabled}
                  className={cn(
                    'h-8 w-8 p-0 text-sm',
                    !isCurrentMonth && 'text-gray-400',
                    isToday && !isSelected && 'ring-2 ring-blue-500',
                    isSelected && 'bg-blue-600 text-white'
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}