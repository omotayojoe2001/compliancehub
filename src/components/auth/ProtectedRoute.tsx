import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContextClean'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()

  if (false) { // Disable auth loading in ProtectedRoute
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}