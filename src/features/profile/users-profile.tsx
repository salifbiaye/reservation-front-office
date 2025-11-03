import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface UserProfileCardProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  role: "ADMIN" | "CEE" | "USER"
  commissionName?: string | null
  commissionColor?: string | null
}

export function UserProfileCard({
  user,
  role,
  commissionName,
  commissionColor
}: UserProfileCardProps) {
  // Générer les initiales pour l'avatar
  const getInitials = (name?: string | null) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Labels des rôles
  const roleLabels = {
    ADMIN: "Administrateur",
    CEE: "Membre CEE",
    USER: "Utilisateur"
  }

  // Couleurs des badges selon le rôle
  const roleColors = {
    ADMIN: "bg-red-500 text-white hover:bg-red-600",
    CEE: "bg-blue-500 text-white hover:bg-blue-600",
    USER: "bg-gray-500 text-white hover:bg-gray-600"
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      {/* Avatar */}
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>

      {/* Infos utilisateur */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <p className="font-semibold text-sm truncate">
          {user.name || "Utilisateur"}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {user.email}
        </p>

        {/* Badge rôle */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge
            variant="secondary"
            className={`text-xs px-2 py-0 ${roleColors[role]}`}
          >
            {roleLabels[role]}
          </Badge>

          {/* Badge commission pour CEE */}
          {role === "CEE" && commissionName && (
            <Badge
              variant="outline"
              className="text-xs px-2 py-0 border-2"
              style={{
                borderColor: commissionColor || undefined,
                color: commissionColor || undefined
              }}
            >
              {commissionName}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}