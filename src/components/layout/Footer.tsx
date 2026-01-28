import { Link } from "react-router-dom";
import { Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-8">
      <div className="px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground mb-4">
          <div>
            © 2026 TaxandCompliance T&C. All rights reserved.
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <h4 className="font-medium text-foreground mb-2">Resources</h4>
            <div className="space-y-1">
              <a href="#" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                NRS Portal <ExternalLink className="h-3 w-3" />
              </a>
              <a href="#" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                CAC Portal <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-2">Support</h4>
            <div className="space-y-1">
              <a href="#" className="text-muted-foreground hover:text-foreground">Help Center</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Contact Us</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-2">Legal</h4>
            <div className="space-y-1">
              <a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground">
                Terms and Conditions
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-2">Company</h4>
            <div className="space-y-1">
              <a href="#" className="text-muted-foreground hover:text-foreground">About Us</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Blog</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
