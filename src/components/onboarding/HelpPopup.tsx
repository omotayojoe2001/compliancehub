import { useState } from "react";
import { X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface HelpPopupProps {
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function HelpPopup({ 
  title, 
  content, 
  position = "bottom", 
  onClose,
  showCloseButton = true 
}: HelpPopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2", 
    left: "right-full mr-2",
    right: "left-full ml-2"
  };

  return (
    <div className={`absolute z-50 w-80 ${positionClasses[position]}`}>
      <Card className="p-4 bg-blue-50 border-blue-200 shadow-lg">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-2">{title}</h3>
            <p className="text-sm text-blue-800 leading-relaxed">{content}</p>
          </div>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}