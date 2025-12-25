import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  title?: string;
}

export function HelpTooltip({ content, title }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-80 p-3 bg-white border border-gray-200 rounded-lg shadow-lg -top-2 left-6">
          {title && (
            <h4 className="font-semibold text-sm text-gray-900 mb-2">{title}</h4>
          )}
          <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  );
}