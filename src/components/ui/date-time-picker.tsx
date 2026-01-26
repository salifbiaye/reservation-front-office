"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { TimePicker } from "./time-picker"

interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  minTime?: Date
  maxTime?: Date
  showClearButton?: boolean
  minuteIncrement?: 5 | 15
}

function DateTimePicker({
  date,
  setDate,
  placeholder = "Sélectionner date et heure",
  disabled = false,
  minDate,
  maxDate,
  minTime,
  maxTime,
  showClearButton = true,
  minuteIncrement = 5,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)

  React.useEffect(() => {
    setSelectedDate(date)
  }, [date])

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return

    // Preserve time if date already exists, otherwise set to current time rounded by increment
    if (selectedDate) {
      newDate.setHours(selectedDate.getHours())
      newDate.setMinutes(selectedDate.getMinutes())
    } else {
      const now = new Date()
      newDate.setHours(now.getHours())
      const roundedMinutes = Math.ceil(now.getMinutes() / minuteIncrement) * minuteIncrement
      newDate.setMinutes(roundedMinutes)
    }

    setSelectedDate(newDate)
  }

  const handleTimeChange = (newDate: Date | undefined) => {
    setSelectedDate(newDate)
  }

  const handleApply = () => {
    setDate(selectedDate)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDate(undefined)
    setDate(undefined)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPP 'à' HH:mm", { locale: fr })
          ) : (
            <span>{placeholder}</span>
          )}
          {showClearButton && date && (
            <X
              className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="space-y-3 p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true
              if (maxDate && date > maxDate) return true
              return false
            }}
            initialFocus
          />
          <div className="border-t pt-3">
            <div className="flex items-center justify-between px-3">
              <p className="text-sm font-medium">Heure</p>
              <TimePicker
                date={selectedDate}
                setDate={handleTimeChange}
                minTime={minTime}
                maxTime={maxTime}
                minuteIncrement={minuteIncrement}
              />
            </div>
          </div>
          <div className="flex gap-2 border-t pt-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={handleApply}
              disabled={!selectedDate}
            >
              Appliquer
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateTimePicker }
