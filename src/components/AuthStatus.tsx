import { useAuth } from '@/contexts/AuthContextClean';
import { Button } from '@/components/ui/button';
import { LogOut, User, AlertCircle } from 'lucide-react';

export function AuthStatus() {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <span className="text-sm text-red-700">Not signed in</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-green-600" />
        <div>
          <div className="text-sm font-medium text-green-900">
            Signed in as: {user.email}
          </div>
          <div className="text-xs text-green-700">
            ID: {user.id.substring(0, 8)}...
          </div>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={signOut}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        <LogOut className="h-3 w-3 mr-1" />
        Logout
      </Button>
    </div>
  );
}