declare global {
  interface Window {
    fbq: any;
  }
}

export const metaPixel = {
  track: (event: string, data?: any) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', event, data);
    }
  },
  
  trackPurchase: (value: number, currency = 'NGN') => {
    metaPixel.track('Purchase', { value, currency });
  },
  
  trackLead: () => {
    metaPixel.track('Lead');
  },
  
  trackCompleteRegistration: () => {
    metaPixel.track('CompleteRegistration');
  },
  
  trackSubscribe: (value: number) => {
    metaPixel.track('Subscribe', { value, currency: 'NGN' });
  }
};
