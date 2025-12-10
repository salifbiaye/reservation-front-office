"use client"

import * as React from "react"
import { DayPicker, DayPickerProps } from "react-day-picker"
import { fr } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import "react-day-picker/dist/style.css"

import { cn } from "@/lib/utils"

export type CalendarProps = DayPickerProps

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={fr}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "space-y-4",
        month: "space-y-3",
        caption: "flex justify-center relative items-center mb-3",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-background hover:bg-accent hover:text-accent-foreground rounded-md inline-flex items-center justify-center",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 mb-1",
        head_cell: "text-muted-foreground text-center text-xs font-medium",
        row: "grid grid-cols-7",
        cell: "p-0",
        day: "h-9 w-full p-0 font-normal text-sm rounded-sm hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium",
        day_today: "bg-accent text-accent-foreground font-medium",
        day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
