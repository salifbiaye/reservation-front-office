"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DateTimeInputProps {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  min?: Date
  max?: Date
  disabled?: boolean
  className?: string
}

function DateTimeInput({
  value,
  onChange,
  min,
  max,
  disabled = false,
  className,
}: DateTimeInputProps) {
  // Convertir Date en string format datetime-local (YYYY-MM-DDTHH:mm)
  const dateToInputValue = (date: Date | undefined) => {
    if (!date) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Convertir string datetime-local en Date
  const inputValueToDate = (value: string) => {
    if (!value) return undefined
    return new Date(value)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = inputValueToDate(e.target.value)
    onChange(newDate)
  }

  return (
    <input
      type="datetime-local"
      value={dateToInputValue(value)}
      onChange={handleChange}
      min={min ? dateToInputValue(min) : undefined}
      max={max ? dateToInputValue(max) : undefined}
      disabled={disabled}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  )
}

export { DateTimeInput }
