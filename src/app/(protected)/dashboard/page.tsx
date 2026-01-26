import { getCachedSession } from "@/lib/session"
import { LayoutDashboard } from "lucide-react"
import { PageHeader } from "@/components"
import { PageHeroSection } from "@/components/page-hero"
import { DashboardLoader } from "@/features/dashboard/dashboard-loader"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Dashboard - ESP Réservation",
  description: "Tableau de bord étudiant",
}

export default async function DashboardPage() {
  const session = await getCachedSession()

  return (
    <div>
      <PageHeader />

      <div className="flex-1 space-y-6 p-6">
        <PageHeroSection
          icon={LayoutDashboard}
          title={`Bienvenue, ${session!.user.name}!`}
          description="Voici un aperçu complet de vos réservations et activités"
          visualIcon={LayoutDashboard}
        />

        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardLoader />
        </Suspense>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>

      {/* Bottom Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-96 w-full md:col-span-2" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}