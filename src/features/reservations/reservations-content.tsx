"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable, ColumnDef, RowAction } from "@/components/data-table"
import { DataSearch } from "@/components/data-search"
import { DataFilter } from "@/components/data-filter"
import { DataPagination } from "@/components/data-pagination"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cancelReservation } from "@/actions/reservations"
import { toast } from "sonner"

interface Reservation {
  id: string
  title: string
  description: string | null
  start: Date
  end: Date
  status: string
  rejectionReason: string | null
  location: {
    id: string
    name: string
    commission: {
      id: string
      name: string
      color: string
    }
  }
  createdAt: Date
}

interface ReservationsContentProps {
  result: {
    data: Reservation[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

const statusConfig = {
  PENDING: { label: "En attente", variant: "secondary" as const },
  ACCEPTED: { label: "Acceptée", variant: "default" as const },
  REJECTED: { label: "Refusée", variant: "destructive" as const },
  CANCELLED: { label: "Annulée", variant: "outline" as const },
}

export function ReservationsContent({ result }: ReservationsContentProps) {
  const router = useRouter()

  const handleCancel = async (reservation: Reservation) => {
    if (!confirm(`Annuler la réservation "${reservation.title}" ?`)) return

    const res = await cancelReservation(reservation.id)

    if (res.success) {
      toast.success("Réservation annulée")
      router.refresh()
    } else {
      toast.error(res.error || "Erreur")
    }
  }

  const columns: ColumnDef<Reservation>[] = [
    {
      key: "title",
      label: "Titre",
      className: "font-medium",
    },
    {
      key: "location",
      label: "Lieu",
      render: (_, item) => item.location.name,
    },
    {
      key: "commission",
      label: "Commission",
      render: (_, item) => item.location.commission.name,
    },
    {
      key: "start",
      label: "Date & Heure",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="text-sm">
            {format(new Date(item.start), "PPP", { locale: fr })}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(item.start), "HH:mm")} - {format(new Date(item.end), "HH:mm")}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (value) => {
        const status = statusConfig[value as keyof typeof statusConfig]
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
  ]

  const actions: RowAction<Reservation>[] = [
    {
      label: "Annuler",
      onClick: handleCancel,
      variant: "destructive",
      show: (item) => item.status === "PENDING",
    },
  ]

  return (
    <DataTable
      data={result.data}
      columns={columns}
      actions={actions}
      headerContent={
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <DataSearch placeholder="Rechercher une réservation..." />
          </div>
          <DataFilter
            extraFilters={[
              {
                type: "select",
                name: "status",
                label: "Statut",
                options: [
                  { label: "Tous", value: "" },
                  { label: "En attente", value: "PENDING" },
                  { label: "Acceptée", value: "ACCEPTED" },
                  { label: "Refusée", value: "REJECTED" },
                  { label: "Annulée", value: "CANCELLED" },
                ],
              },
            ]}
          />
        </div>
      }
      footerContent={
        <DataPagination totalItems={result.pagination.total} />
      }
      emptyState={
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucune réservation trouvée</p>
        </div>
      }
    />
  )
}
