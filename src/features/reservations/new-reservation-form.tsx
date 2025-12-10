"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createReservationSchema, type CreateReservationInput } from "@/schemas/reservation"
import { createReservation } from "@/actions/reservations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { calculateMaxEndTime, calculateMinEndTime } from "@/lib/date-helpers"

interface Location {
  id: string
  name: string
  maxDurationHours: number | null
  commission: {
    id: string
    name: string
    color: string
  }
}

interface NewReservationFormProps {
  locations: Location[]
}

export function NewReservationForm({ locations }: NewReservationFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<CreateReservationInput>({
    resolver: zodResolver(createReservationSchema)
  })

  const selectedLocationId = watch("locationId")
  const selectedLocation = locations.find(l => l.id === selectedLocationId)
  const maxDurationHours = selectedLocation?.maxDurationHours

  // Calculate max end time based on start and location's maxDurationHours
  const maxEndTime = useMemo(() => {
    if (!startDate || !maxDurationHours) return undefined
    return calculateMaxEndTime(startDate, maxDurationHours)
  }, [startDate, maxDurationHours])

  // Calculate min end time (start + 15 min)
  const minEndTime = useMemo(() => {
    if (!startDate) return undefined
    return calculateMinEndTime(startDate)
  }, [startDate])

  // Auto-adjust end time when constraints change
  useEffect(() => {
    if (endDate && maxEndTime && endDate > maxEndTime) {
      setEndDate(maxEndTime)
      setValue("end", maxEndTime)
    }
    if (endDate && minEndTime && endDate < minEndTime) {
      setEndDate(minEndTime)
      setValue("end", minEndTime)
    }
  }, [maxEndTime, minEndTime, endDate, setValue])

  // When start changes, ensure end is still valid
  useEffect(() => {
    if (startDate && endDate && endDate <= startDate) {
      const newEndDate = calculateMinEndTime(startDate)
      setEndDate(newEndDate)
      setValue("end", newEndDate)
    }
  }, [startDate, endDate, setValue])

  // Auto-fill end date when start is selected and maxDurationHours exists
  useEffect(() => {
    if (startDate && !endDate && maxDurationHours) {
      const autoEndDate = calculateMaxEndTime(startDate, maxDurationHours)
      setEndDate(autoEndDate)
      setValue("end", autoEndDate)
    }
  }, [startDate, endDate, maxDurationHours, setValue])

  const onSubmit = async (data: CreateReservationInput) => {
    setError(null)
    setSuccess(false)

    const result = await createReservation(data)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => router.push("/reservations"), 2000)
    } else {
      setError(result.error || "Erreur lors de la création")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de la réservation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
              ✅ Demande créée avec succès ! Redirection...
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Titre de la réservation</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Ex: Réunion du club robotique"
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnelle)</Label>
            <textarea
              id="description"
              {...register("description")}
              placeholder="Détails supplémentaires..."
              className="w-full min-h-[100px] px-3 py-2 text-sm border border-border rounded-lg bg-background"
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationId">Lieu</Label>
            <select
              id="locationId"
              {...register("locationId")}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
            >
              <option value="">Sélectionner un lieu</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} - {location.commission.name}

                </option>
              ))}
            </select>
            {errors.locationId && (
              <p className="text-xs text-red-500">{errors.locationId.message}</p>
            )}
           
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Date et heure de début</Label>
              <DateTimePicker
                date={startDate}
                setDate={(date) => {
                  setStartDate(date)
                  setValue("start", date, { shouldValidate: true })
                }}
                placeholder="Sélectionner la date de début"
                minDate={new Date()}
                disabled={isSubmitting}
                minuteIncrement={5}
              />
              {errors.start && (
                <p className="text-xs text-red-500">{errors.start.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end">Date et heure de fin</Label>
              <DateTimePicker
                date={endDate}
                setDate={(date) => {
                  setEndDate(date)
                  setValue("end", date, { shouldValidate: true })
                }}
                placeholder="Sélectionner la date de fin"
                minDate={startDate}
                minTime={minEndTime}
                maxTime={maxEndTime}
                disabled={!startDate || isSubmitting}
                minuteIncrement={5}
              />
              {errors.end && (
                <p className="text-xs text-red-500">{errors.end.message}</p>
              )}
              {maxDurationHours && startDate && (
                <p className="text-xs text-muted-foreground">
                  Durée maximum: {maxDurationHours}h
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/reservations")}
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
