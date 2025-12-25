import { ReactNode } from "react";
import { useHelp } from "./HelpProvider";
import { HelpPopup } from "./HelpPopup";

interface HelpWrapperProps {
  children: ReactNode;
  helpTitle: string;
  helpContent: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function HelpWrapper({ 
  children, 
  helpTitle, 
  helpContent, 
  position = "bottom",
  className = ""
}: HelpWrapperProps) {
  const { isHelpMode } = useHelp();

  return (
    <div className={`relative ${className}`}>
      {children}
      {isHelpMode && (
        <HelpPopup
          title={helpTitle}
          content={helpContent}
          position={position}
          showCloseButton={false}
        />
      )}
    </div>
  );
}