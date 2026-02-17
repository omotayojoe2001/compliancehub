export const validation = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^234[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
  },

  isStrongPassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain number' };
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return { valid: false, message: 'Password must contain special character (!@#$%^&*)' };
    }
    return { valid: true, message: 'Password is strong' };
  },

  sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  isValidBusinessName(name: string): boolean {
    return name.length >= 2 && name.length <= 100 && /^[a-zA-Z0-9\s&.-]+$/.test(name);
  },

  isValidRCNumber(rc: string): boolean {
    return /^RC[0-9]{6,}$/i.test(rc);
  },

  isValidTIN(tin: string): boolean {
    return /^[0-9]{8,10}$/.test(tin);
  }
};
