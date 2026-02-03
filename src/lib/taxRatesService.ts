import { supabase } from './supabase';

interface TaxRate {
  id: string;
  tax_type: string;
  rate_name: string;
  rate_percentage: number;
  description: string;
  is_active: boolean;
}

export const taxRatesService = {
  async getAllTaxRates(): Promise<TaxRate[]> {
    const { data, error } = await supabase
      .from('tax_rates')
      .select('*')
      .eq('is_active', true)
      .order('tax_type', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getTaxRate(taxType: string): Promise<number> {
    const { data, error } = await supabase
      .from('tax_rates')
      .select('rate_percentage')
      .eq('tax_type', taxType)
      .eq('is_active', true)
      .single();

    if (error) {
      console.warn(`Tax rate not found for ${taxType}, using default`);
      return this.getDefaultRate(taxType);
    }

    return data?.rate_percentage || this.getDefaultRate(taxType);
  },

  async getWithholdingTaxRates(): Promise<{ [key: string]: number }> {
    const { data, error } = await supabase
      .from('tax_rates')
      .select('tax_type, rate_percentage')
      .like('tax_type', 'WHT_%')
      .eq('is_active', true);

    if (error) {
      console.warn('Withholding tax rates not found, using defaults');
      return {
        WHT_PROFESSIONAL: 5,
        WHT_DIVIDEND: 10,
        WHT_CONSTRUCTION: 2.5
      };
    }

    const rates: { [key: string]: number } = {};
    data?.forEach(rate => {
      rates[rate.tax_type] = rate.rate_percentage;
    });

    return rates;
  },

  getDefaultRate(taxType: string): number {
    const defaults: { [key: string]: number } = {
      VAT: 7.5,
      PAYE: 24,
      CIT: 30,
      WHT_PROFESSIONAL: 5,
      WHT_DIVIDEND: 10,
      WHT_CONSTRUCTION: 2.5,
      CGT: 10
    };

    return defaults[taxType] || 0;
  },

  // Cache for better performance
  _cache: new Map<string, { data: any; timestamp: number }>(),
  _cacheTimeout: 5 * 60 * 1000, // 5 minutes

  async getCachedTaxRate(taxType: string): Promise<number> {
    // Always fetch fresh data for admin changes
    const rate = await this.getTaxRate(taxType);
    
    const cacheKey = `rate_${taxType}`;
    this._cache.set(cacheKey, { data: rate, timestamp: Date.now() });
    return rate;
  },

  clearCache() {
    this._cache.clear();
  }
};