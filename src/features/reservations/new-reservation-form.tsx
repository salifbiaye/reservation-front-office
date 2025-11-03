"use client"

import { useState } from "react"
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

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<CreateReservationInput>({
    resolver: zodResolver(createReservationSchema)
  })

  const selectedLocationId = watch("locationId")
  const selectedLocation = locations.find(l => l.id === selectedLocationId)

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
                  {location.maxDurationHours && ` (max ${location.maxDurationHours}h)`}
                </option>
              ))}
            </select>
            {errors.locationId && (
              <p className="text-xs text-red-500">{errors.locationId.message}</p>
            )}
            {selectedLocation?.maxDurationHours && (
              <p className="text-xs text-muted-foreground">
                ⏱️ Durée maximale: {selectedLocation.maxDurationHours}h
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Date et heure de début</Label>
              <Input
                id="start"
                type="datetime-local"
                {...register("start", {
                  setValueAs: (value) => value ? new Date(value) : undefined
                })}
              />
              {errors.start && (
                <p className="text-xs text-red-500">{errors.start.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end">Date et heure de fin</Label>
              <Input
                id="end"
                type="datetime-local"
                {...register("end", {
                  setValueAs: (value) => value ? new Date(value) : undefined
                })}
              />
              {errors.end && (
                <p className="text-xs text-red-500">{errors.end.message}</p>
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
