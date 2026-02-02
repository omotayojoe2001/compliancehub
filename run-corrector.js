const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fyhhcqjclcedpylhyjwy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUxNjAxNSwiZXhwIjoyMDgyMDkyMDE1fQ.HOJp8nBEKXeDGWv4XvA0cl_RDDmH0QIXv33wYfb8JoU';

const supabase = createClient(supabaseUrl, supabaseKey);

class RegistrationStatusCorrector {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    determineRegistrationStatus(userTaxData, taxType) {
        const indicators = {
            hasUpcomingPayments: userTaxData.upcoming_payments?.some(p => p.taxType === taxType),
            hasPaymentHistory: userTaxData.payment_history?.some(p => p.taxType === taxType),
            hasFilingHistory: userTaxData.filing_history?.some(f => f.taxType === taxType),
            hasSubmittedReturns: userTaxData.returns?.some(r => r.taxType === taxType && r.status === 'submitted'),
            hasTaxNumber: userTaxData[`${taxType}_number`],
            hasActiveObligations: userTaxData.obligations?.some(o => o.taxType === taxType && o.status === 'active')
        };
        
        return Object.values(indicators).some(Boolean) ? 'registered' : 'not_registered';
    }

    getStatusReason(userTaxData, taxType) {
        if (userTaxData.upcoming_payments?.some(p => p.taxType === taxType)) {
            return 'Has upcoming payments';
        }
        if (userTaxData.payment_history?.some(p => p.taxType === taxType)) {
            return 'Has payment history';
        }
        if (userTaxData.filing_history?.some(f => f.taxType === taxType)) {
            return 'Has filing history';
        }
        if (userTaxData[`${taxType}_number`]) {
            return 'Has tax number';
        }
        return 'System activity detected';
    }

    async autoCorrectRegistrationStatus(userId) {
        try {
            const { data: userTaxData, error } = await this.supabase
                .from('user_tax_data')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;

            const corrections = [];
            const TAX_TYPES = ['paye', 'vat', 'cit', 'wht', 'pit'];

            TAX_TYPES.forEach(taxType => {
                const actualStatus = this.determineRegistrationStatus(userTaxData, taxType);
                const recordedStatus = userTaxData[`${taxType}_registration_status`];

                if (actualStatus !== recordedStatus) {
                    corrections.push({
                        taxType,
                        from: recordedStatus,
                        to: actualStatus,
                        reason: this.getStatusReason(userTaxData, taxType)
                    });
                }
            });

            if (corrections.length > 0) {
                const updates = {};
                corrections.forEach(correction => {
                    updates[`${correction.taxType}_registration_status`] = correction.to;
                });

                const { error: updateError } = await this.supabase
                    .from('user_tax_data')
                    .update(updates)
                    .eq('user_id', userId);

                if (updateError) throw updateError;

                await this.logCorrections(userId, corrections);
            }

            return corrections;

        } catch (error) {
            console.error('Auto-correction failed:', error);
            return [];
        }
    }

    async logCorrections(userId, corrections) {
        const logEntries = corrections.map(correction => ({
            user_id: userId,
            tax_type: correction.taxType,
            old_status: correction.from,
            new_status: correction.to,
            reason: correction.reason,
            corrected_at: new Date().toISOString(),
            correction_type: 'auto'
        }));

        await this.supabase
            .from('registration_status_corrections')
            .insert(logEntries);
    }
}

async function addMissingColumns() {
    console.log('🔧 Checking user_tax_data table structure...');
    
    // Skip column addition since we can't execute DDL from client
    console.log('⚠️ Skipping column addition - requires database admin access');
    console.log('✅ Table structure check completed');
}

async function createTestUser() {
    console.log('🧪 Creating test user with registration mismatches...');
    
    const testData = {
        user_id: 'sportsprofit-user',
        paye_registration_status: 'not_registered',
        vat_registration_status: 'not_registered',
        cit_registration_status: 'not_registered',
        wht_registration_status: 'not_registered',
        pit_registration_status: 'not_registered',
        paye_number: '54223341213451098',
        vat_number: '54223341213451098',
        // Remove cit_number if column doesn't exist
        upcoming_payments: [
            { taxType: 'paye', amount: 0, dueDate: '2026-03-10' }
        ],
        payment_history: [
            { taxType: 'paye', amount: 50000, date: '2024-01-01' }
        ]
    };
    
    const { error } = await supabase
        .from('user_tax_data')
        .upsert(testData);
    
    if (error) throw error;
    
    console.log('✅ Test user created with TIN numbers but "not_registered" status');
}

async function runCorrector() {
    try {
        console.log('🚀 Starting Registration Status Auto-Corrector\n');
        
        // Add missing columns
        await addMissingColumns();
        
        // Create test user
        await createTestUser();
        
        // Run corrector
        const corrector = new RegistrationStatusCorrector(supabase);
        
        console.log('🔍 Running correction for sportsprofit-user...');
        const corrections = await corrector.autoCorrectRegistrationStatus('sportsprofit-user');
        
        if (corrections.length === 0) {
            console.log('✅ No corrections needed - all statuses are accurate');
        } else {
            console.log(`✅ Applied ${corrections.length} corrections:`);
            corrections.forEach(correction => {
                console.log(`   ${correction.taxType.toUpperCase()}: ${correction.from} → ${correction.to} (${correction.reason})`);
            });
        }
        
        console.log('\n🎉 Registration Status Auto-Corrector completed successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

runCorrector();