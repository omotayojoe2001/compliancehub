import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Check if this is a password reset URL that got lost
    const hash = window.location.hash;
    const search = window.location.search;
    
    if ((hash.includes('access_token') && hash.includes('refresh_token')) || 
        (search.includes('access_token') && search.includes('refresh_token'))) {
      console.log('Redirecting password reset URL to correct page');
      navigate('/reset-password' + search + hash, { replace: true });
      return;
    }
    
    if ((hash.includes('type=signup') || search.includes('type=signup')) &&
        (hash.includes('access_token') || search.includes('access_token'))) {
      console.log('Redirecting email confirmation URL to correct page');
      navigate('/confirm-email' + search + hash, { replace: true });
      return;
    }
  }, [location.pathname, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
