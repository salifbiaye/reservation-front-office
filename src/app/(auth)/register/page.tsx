import Link from "next/link"
import { RegisterForm } from "@/features/auth/register-form"
import { GoogleButton } from "@/features/auth/google-button"

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
          Créer un compte
        </h1>
        <p className="text-muted-foreground">
          Rejoignez la plateforme de réservation ESP
        </p>
      </div>

      <RegisterForm />

      <div className="relative flex items-center justify-center">
        <span className="w-full border-t border-border"></span>
        <span className="px-4 text-sm text-muted-foreground bg-background absolute">
          Ou continuer avec
        </span>
      </div>

      <GoogleButton />

      <p className="text-center text-sm text-muted-foreground">
        Vous avez déjà un compte ?{" "}
        <Link href="/login" className="text-violet-400 hover:underline transition-colors">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
