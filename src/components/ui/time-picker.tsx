"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  minTime?: Date
  maxTime?: Date
}

function TimePicker({ date, setDate, minTime, maxTime }: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = [0, 15, 30, 45]

  const handleHourChange = (hour: string) => {
    const newDate = date ? new Date(date) : new Date()
    newDate.setHours(parseInt(hour))
    setDate(newDate)
  }

  const handleMinuteChange = (minute: string) => {
    const newDate = date ? new Date(date) : new Date()
    newDate.setMinutes(parseInt(minute))
    setDate(newDate)
  }

  // Filter hours based on min/max time constraints
  const getAvailableHours = () => {
    if (!date) return hours

    return hours.filter(hour => {
      if (!minTime && !maxTime) return true

      const testDate = new Date(date)
      testDate.setHours(hour, 0, 0, 0)

      if (minTime) {
        const minWithSameDay = new Date(date)
        minWithSameDay.setHours(minTime.getHours(), minTime.getMinutes(), 0, 0)
        if (testDate < minWithSameDay) return false
      }

      if (maxTime) {
        const maxWithSameDay = new Date(date)
        maxWithSameDay.setHours(maxTime.getHours(), maxTime.getMinutes(), 0, 0)
        if (testDate > maxWithSameDay) return false
      }

      return true
    })
  }

  // Filter minutes based on min/max time constraints
  const getAvailableMinutes = () => {
    if (!date) return minutes

    const currentHour = date.getHours()

    return minutes.filter(minute => {
      if (!minTime && !maxTime) return true

      const testDate = new Date(date)
      testDate.setHours(currentHour, minute, 0, 0)

      if (minTime) {
        const minWithSameDay = new Date(date)
        minWithSameDay.setHours(minTime.getHours(), minTime.getMinutes(), 0, 0)
        if (testDate < minWithSameDay) return false
      }

      if (maxTime) {
        const maxWithSameDay = new Date(date)
        maxWithSameDay.setHours(maxTime.getHours(), maxTime.getMinutes(), 0, 0)
        if (testDate > maxWithSameDay) return false
      }

      return true
    })
  }

  const availableHours = getAvailableHours()
  const availableMinutes = getAvailableMinutes()

  return (
    <div className="flex items-center gap-2">
      <Select
        value={date?.getHours().toString()}
        onValueChange={handleHourChange}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {availableHours.map(hour => (
            <SelectItem key={hour} value={hour.toString()}>
              {hour.toString().padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select
        value={date?.getMinutes().toString()}
        onValueChange={handleMinuteChange}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {availableMinutes.map(minute => (
            <SelectItem key={minute} value={minute.toString()}>
              {minute.toString().padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { TimePicker }
