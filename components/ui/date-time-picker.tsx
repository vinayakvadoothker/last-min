'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  value?: string // ISO datetime string
  onChange?: (value: string) => void
  min?: string // ISO datetime string
  max?: string // ISO datetime string
  disabled?: boolean
  placeholder?: string
  required?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  min,
  max,
  disabled,
  placeholder = 'Pick a date and time',
  required,
}: DateTimePickerProps) {
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const [time, setTime] = useState<string>(
    value ? format(new Date(value), 'HH:mm') : ''
  )

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return
    
    // Check max date constraint
    if (maxDate && selectedDate > maxDate) {
      return // Don't allow selection beyond max
    }
    
    // If time is already set, combine date and time
    if (time) {
      const [hours, minutes] = time.split(':')
      const combined = new Date(selectedDate)
      combined.setHours(parseInt(hours), parseInt(minutes))
      // Check if combined datetime exceeds max
      if (maxDate && combined > maxDate) {
        return // Don't allow selection beyond max
      }
      setDate(combined)
      onChange?.(combined.toISOString())
    } else {
      setDate(selectedDate)
      // Set to start of day if no time selected
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      // Check if start of day exceeds max
      if (maxDate && startOfDay > maxDate) {
        return // Don't allow selection beyond max
      }
      onChange?.(startOfDay.toISOString())
    }
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    if (date && newTime) {
      const [hours, minutes] = newTime.split(':')
      const combined = new Date(date)
      combined.setHours(parseInt(hours), parseInt(minutes))
      // Check if combined datetime exceeds max
      if (maxDate && combined > maxDate) {
        // Reset to max if exceeded
        setTime(format(maxDate, 'HH:mm'))
        setDate(maxDate)
        onChange?.(maxDate.toISOString())
        return
      }
      setDate(combined)
      onChange?.(combined.toISOString())
    }
  }

  const minDate = min ? new Date(min) : undefined
  const maxDate = max ? new Date(max) : undefined
  
  // Build disabled dates object - react-day-picker requires both properties to be Date if present
  let disabledDates: { before: Date; after: Date } | { before: Date } | { after: Date } | undefined = undefined
  if (minDate && maxDate) {
    disabledDates = { before: minDate, after: maxDate }
  } else if (minDate) {
    disabledDates = { before: minDate }
  } else if (maxDate) {
    disabledDates = { after: maxDate }
  }

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={disabledDates}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      <div className="relative">
        <Input
          type="time"
          value={time}
          onChange={(e) => handleTimeChange(e.target.value)}
          placeholder="HH:MM"
          disabled={disabled || !date}
          className="pl-10"
          required={required}
          min={min && date && new Date(min).toDateString() === date.toDateString() ? format(new Date(min), 'HH:mm') : undefined}
          max={max && date && new Date(max).toDateString() === date.toDateString() ? format(new Date(max), 'HH:mm') : undefined}
        />
        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
    </div>
  )
}

