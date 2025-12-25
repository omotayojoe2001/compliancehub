import { createContext, useContext, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, X } from "lucide-react";

interface HelpContextType {
  isHelpMode: boolean;
  toggleHelpMode: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export function useHelp() {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error("useHelp must be used within HelpProvider");
  }
  return context;
}

interface HelpProviderProps {
  children: ReactNode;
}

export function HelpProvider({ children }: HelpProviderProps) {
  const [isHelpMode, setIsHelpMode] = useState(false);

  const toggleHelpMode = () => {
    setIsHelpMode(!isHelpMode);
  };

  return (
    <HelpContext.Provider value={{ isHelpMode, toggleHelpMode }}>
      {children}
      <HelpToggleButton />
    </HelpContext.Provider>
  );
}

function HelpToggleButton() {
  const { isHelpMode, toggleHelpMode } = useHelp();

  return (
    <Button
      onClick={toggleHelpMode}
      className={`fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 p-0 shadow-lg ${
        isHelpMode 
          ? "bg-red-600 hover:bg-red-700 text-white" 
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
      title={isHelpMode ? "Turn off help" : "Turn on help"}
    >
      {isHelpMode ? (
        <X className="h-5 w-5" />
      ) : (
        <HelpCircle className="h-5 w-5" />
      )}
    </Button>
  );
}