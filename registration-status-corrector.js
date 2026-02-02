// Registration Status Auto-Corrector
// Detects registration status based on system activity data

const TAX_TYPES = ['paye', 'vat', 'cit', 'wht', 'pit'];

class RegistrationStatusCorrector {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    // Determine actual registration status based on system data
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

    // Get reason for status correction
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

    // Auto-correct registration status for all tax types
    async autoCorrectRegistrationStatus(userId) {
        try {
            // Get user's tax data
            const { data: userTaxData, error } = await this.supabase
                .from('user_tax_data')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;

            const corrections = [];

            // Check each tax type
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

            // Apply corrections
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

                // Log corrections
                await this.logCorrections(userId, corrections);
            }

            return corrections;

        } catch (error) {
            console.error('Auto-correction failed:', error);
            return [];
        }
    }

    // Log corrections for audit trail
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

    // Run correction for all users (batch process)
    async batchCorrectAllUsers() {
        const { data: users, error } = await this.supabase
            .from('user_tax_data')
            .select('user_id');

        if (error) throw error;

        const results = [];
        for (const user of users) {
            const corrections = await this.autoCorrectRegistrationStatus(user.user_id);
            if (corrections.length > 0) {
                results.push({ userId: user.user_id, corrections });
            }
        }

        return results;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegistrationStatusCorrector;
}