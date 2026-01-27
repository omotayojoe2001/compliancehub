import { supabase } from './supabase';
import { supabaseService } from './supabaseService';
import { paymentService } from './paymentService';

interface FilingRequestData {
  companyProfileId: string;
  filingType: string;
  filingPeriod: string;
  amount?: number;
}

interface FilingDataSnapshot {
  profile: any;
  transactions: any[];
  cashbookSummary: any;
  companyDetails: any;
}

export const filingService = {
  // Create a new filing request with data snapshot
  async createFilingRequest(userId: string, requestData: FilingRequestData): Promise<string> {
    try {
      console.log('📋 Creating filing request:', requestData);

      // Collect all relevant data for filing
      const dataSnapshot = await this.collectFilingData(userId, requestData.companyProfileId);
      
      // Create filing request record
      const { data: filingRequest, error } = await supabase
        .from('filing_requests')
        .insert({
          user_id: userId,
          company_profile_id: requestData.companyProfileId,
          filing_type: requestData.filingType,
          filing_period: requestData.filingPeriod,
          amount: requestData.amount || 10000,
          status: 'pending',
          payment_status: 'pending',
          profile_data: dataSnapshot.profile,
          transactions_data: dataSnapshot.transactions,
          cashbook_summary: dataSnapshot.cashbookSummary
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Filing request created:', filingRequest.id);
      return filingRequest.id;
    } catch (error) {
      console.error('❌ Error creating filing request:', error);
      throw error;
    }
  },

  // Collect all data needed for filing
  async collectFilingData(userId: string, companyProfileId: string): Promise<FilingDataSnapshot> {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Get company profile details
      const { data: companyProfile } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('id', companyProfileId)
        .single();

      // Get all cashbook entries for this company
      const cashbookEntries = await supabaseService.getCashbookEntries(userId, companyProfileId);

      // Calculate cashbook summary from cashbook entries
      const totalIncome = cashbookEntries?.filter(entry => entry.entry_type === 'income')
        .reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0;
      
      const totalExpenses = cashbookEntries?.filter(entry => entry.entry_type === 'expense')
        .reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0;

      const totalVAT = cashbookEntries?.filter(entry => entry.vat_applicable && entry.entry_type === 'income')
        .reduce((sum, entry) => sum + (entry.vat_amount || 0), 0) || 0;

      const cashbookSummary = {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        totalVAT,
        transactionCount: cashbookEntries?.length || 0,
        lastTransactionDate: cashbookEntries?.[0]?.date,
        generatedAt: new Date().toISOString(),
        period: {
          from: cashbookEntries?.[cashbookEntries.length - 1]?.date,
          to: cashbookEntries?.[0]?.date
        }
      };

      return {
        profile,
        transactions: cashbookEntries || [],
        cashbookSummary,
        companyDetails: companyProfile
      };
    } catch (error) {
      console.error('❌ Error collecting filing data:', error);
      throw error;
    }
  },

  // Process payment for filing service
  async processFilingPayment(filingRequestId: string, userEmail: string): Promise<string> {
    try {
      // Get filing request details
      const { data: filingRequest } = await supabase
        .from('filing_requests')
        .select('*')
        .eq('id', filingRequestId)
        .single();

      if (!filingRequest) throw new Error('Filing request not found');

      // Initialize payment and return the payment URL or reference
      const paymentResult = await paymentService.initializePayment({
        email: userEmail,
        amount: filingRequest.amount * 100, // Convert to kobo
        plan: 'filing_service',
        businessName: `Filing Service - ${filingRequest.filing_type}`,
        filingRequestId
      });

      return paymentResult;
    } catch (error) {
      console.error('❌ Error processing filing payment:', error);
      throw error;
    }
  },

  // Update filing request after successful payment
  async updateFilingRequestPayment(filingRequestId: string, paymentReference: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('filing_requests')
        .update({
          payment_reference: paymentReference,
          payment_status: 'paid',
          payment_date: new Date().toISOString(),
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', filingRequestId);

      if (error) throw error;

      console.log('✅ Filing request payment updated:', filingRequestId);
    } catch (error) {
      console.error('❌ Error updating filing request payment:', error);
      throw error;
    }
  },

  // Get user's filing requests
  async getUserFilingRequests(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('filing_requests')
        .select(`
          *,
          company_profiles (
            name,
            tin
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error getting filing requests:', error);
      return [];
    }
  },

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  }
};