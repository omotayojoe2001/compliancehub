import { useState, useEffect } from "react";
import { X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome popup before
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hasSeenWelcome", "true");
  };

  const handleTurnOnHelp = () => {
    handleClose();
    // This would trigger help mode - for now just close
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="max-w-md mx-4 p-6 bg-white">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Welcome! Let me explain this app
            </h2>
            
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Think of this like a robot assistant for your taxes.</strong>
              </p>
              
              <p>
                The robot:
                <br />• Watches your tax deadlines
                <br />• Sends you WhatsApp and email reminders
                <br />• Shows you simple instructions
              </p>
              
              <p>
                The robot does NOT:
                <br />• Do your taxes for you
                <br />• Talk to the government
                <br />• Replace your accountant
              </p>
              
              <p>
                <strong>It just reminds you and guides you.</strong>
              </p>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button onClick={handleTurnOnHelp} className="flex-1">
                Show me around
              </Button>
              <Button variant="outline" onClick={handleClose}>
                I understand
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}