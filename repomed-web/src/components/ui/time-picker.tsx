'use client';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string; // Format: "HH:MM"
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  format24h?: boolean;
  step?: number; // Minutes step (5, 10, 15, etc)
}

export function TimePicker({
  value = '',
  onChange,
  placeholder = 'Selecione um horário',
  className,
  disabled = false,
  format24h = true,
  step = 15
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(
    value ? parseInt(value.split(':')[0]) : 9
  );
  const [selectedMinute, setSelectedMinute] = useState(
    value ? parseInt(value.split(':')[1]) : 0
  );

  const formatTime = (hour: number, minute: number) => {
    if (format24h) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    } else {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    }
  };

  const handleTimeSelect = () => {
    const timeString = formatTime(selectedHour, selectedMinute);
    onChange(format24h ? `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}` : timeString);
    setIsOpen(false);
  };

  const generateHours = () => {
    const hours: number[] = [];
    const maxHour = format24h ? 23 : 11;
    for (let i = 0; i <= maxHour; i++) {
      hours.push(i);
    }
    return hours;
  };

  const generateMinutes = () => {
    const minutes: number[] = [];
    for (let i = 0; i < 60; i += step) {
      minutes.push(i);
    }
    return minutes;
  };

  const displayValue = value ? (format24h ? value : formatTime(
    parseInt(value.split(':')[0]), 
    parseInt(value.split(':')[1])
  )) : '';

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Input
          value={displayValue}
          placeholder={placeholder}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          readOnly
          disabled={disabled}
          className="cursor-pointer pr-10"
        />
        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-aaa-secondary)' }} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-lg shadow-lg p-4 min-w-[200px]">
          <div className="flex gap-2 mb-4">
            {/* Hours */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                {format24h ? 'Hora' : 'Hora'}
              </label>
              <div className="max-h-32 overflow-y-auto border rounded">
                {generateHours().map(hour => (
                  <Button
                    key={hour}
                    variant={selectedHour === hour ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedHour(hour)}
                    className="w-full justify-start"
                  >
                    {format24h ? hour.toString().padStart(2, '0') : (hour === 0 ? 12 : hour)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Minutos
              </label>
              <div className="max-h-32 overflow-y-auto border rounded">
                {generateMinutes().map(minute => (
                  <Button
                    key={minute}
                    variant={selectedMinute === minute ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedMinute(minute)}
                    className="w-full justify-start"
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
            </div>

            {/* AM/PM for 12h format */}
            {!format24h && (
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Período
                </label>
                <div className="space-y-1">
                  <Button
                    variant={selectedHour < 12 ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedHour(selectedHour >= 12 ? selectedHour - 12 : selectedHour)}
                    className="w-full"
                  >
                    AM
                  </Button>
                  <Button
                    variant={selectedHour >= 12 ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedHour(selectedHour < 12 ? selectedHour + 12 : selectedHour)}
                    className="w-full"
                  >
                    PM
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTimeSelect}
              className="flex-1"
            >
              Confirmar
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
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