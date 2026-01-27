interface PlanLimits {
  maxObligations: number;
  maxCompanyProfiles: number;
  hasWhatsAppReminders: boolean;
  hasEmailReminders: boolean;
  hasAdvancedCalculator: boolean;
  hasReminderHistory: boolean;
  hasApiAccess: boolean;
  hasMultiUserAccess: boolean;
  hasPrioritySupport: boolean;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxObligations: 0,
    maxCompanyProfiles: 1,
    hasWhatsAppReminders: false,
    hasEmailReminders: false,
    hasAdvancedCalculator: false,
    hasReminderHistory: false,
    hasApiAccess: false,
    hasMultiUserAccess: false,
    hasPrioritySupport: false,
  },
  basic: {
    maxObligations: 3,
    maxCompanyProfiles: 1,
    hasWhatsAppReminders: false,
    hasEmailReminders: true,
    hasAdvancedCalculator: true,
    hasReminderHistory: false,
    hasApiAccess: false,
    hasMultiUserAccess: false,
    hasPrioritySupport: false,
  },
  pro: {
    maxObligations: -1, // unlimited
    maxCompanyProfiles: 5,
    hasWhatsAppReminders: true,
    hasEmailReminders: true,
    hasAdvancedCalculator: true,
    hasReminderHistory: true,
    hasApiAccess: false,
    hasMultiUserAccess: false,
    hasPrioritySupport: true,
  },
  enterprise: {
    maxObligations: -1, // unlimited
    maxCompanyProfiles: -1, // unlimited
    hasWhatsAppReminders: true,
    hasEmailReminders: true,
    hasAdvancedCalculator: true,
    hasReminderHistory: true,
    hasApiAccess: true,
    hasMultiUserAccess: true,
    hasPrioritySupport: true,
  },
};

export const planRestrictionsService = {
  getPlanLimits(plan: string): PlanLimits {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  },

  canCreateCompanyProfile(plan: string, currentProfileCount: number): boolean {
    const limits = this.getPlanLimits(plan);
    if (limits.maxCompanyProfiles === -1) return true; // unlimited
    return currentProfileCount < limits.maxCompanyProfiles;
  },

  canCreateObligation(plan: string, currentObligationCount: number): boolean {
    const limits = this.getPlanLimits(plan);
    if (limits.maxObligations === -1) return true; // unlimited
    return currentObligationCount < limits.maxObligations;
  },

  canAccessFeature(plan: string, feature: keyof PlanLimits): boolean {
    const limits = this.getPlanLimits(plan);
    return limits[feature] as boolean;
  },

  getUpgradeMessage(plan: string, feature: keyof PlanLimits): string {
    const featureNames = {
      hasWhatsAppReminders: 'WhatsApp reminders',
      hasAdvancedCalculator: 'advanced tax calculator',
      hasReminderHistory: 'reminder history',
      hasApiAccess: 'API access',
      hasMultiUserAccess: 'multi-user access',
      hasPrioritySupport: 'priority support'
    };

    const featureName = featureNames[feature] || feature;
    
    if (plan === 'free') {
      return `Upgrade to Basic plan to access ${featureName}`;
    } else if (plan === 'basic') {
      return `Upgrade to Pro plan to access ${featureName}`;
    } else if (plan === 'pro') {
      return `Upgrade to Enterprise plan to access ${featureName}`;
    }
    
    return `This feature requires a paid plan`;
  },

  getCompanyProfileLimitMessage(plan: string): string {
    const limits = this.getPlanLimits(plan);
    
    if (limits.maxCompanyProfiles === 1) {
      return plan === 'free' 
        ? 'Free plan includes 1 company profile. Upgrade to manage more businesses'
        : 'You can manage 1 company profile. Upgrade to Pro for up to 5 profiles';
    } else if (limits.maxCompanyProfiles > 1) {
      return `You can manage up to ${limits.maxCompanyProfiles} company profiles. Upgrade to Enterprise for unlimited`;
    }
    
    return 'Unlimited company profiles';
  },

  getObligationLimitMessage(plan: string): string {
    const limits = this.getPlanLimits(plan);
    
    if (limits.maxObligations === 0) {
      return 'Subscribe to any plan to start tracking tax obligations';
    } else if (limits.maxObligations === 1) {
      return 'You can track 1 tax obligation. Upgrade to track more';
    } else if (limits.maxObligations > 1) {
      return `You can track up to ${limits.maxObligations} tax obligations. Upgrade to Pro for unlimited`;
    }
    
    return 'Unlimited tax obligations';
  }
};
