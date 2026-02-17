import { useState, useEffect } from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function PhoneInput({ value, onChange, className = '', placeholder = '8012345678' }: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Extract digits after 234
    if (value && value.startsWith('234')) {
      setDisplayValue(value.substring(3));
    } else if (value && value.startsWith('0')) {
      setDisplayValue(value.substring(1));
    } else {
      setDisplayValue(value.replace(/[^0-9]/g, ''));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/[^0-9]/g, '');
    
    // Remove leading 0 if present
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    
    // Limit to 10 digits
    if (digits.length <= 10) {
      setDisplayValue(digits);
      onChange('234' + digits);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex items-center px-3 py-2 border border-border bg-gray-50 text-sm text-foreground rounded">
        +234
      </div>
      <input
        type="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={10}
        className={`flex-1 border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
      />
    </div>
  );
}
