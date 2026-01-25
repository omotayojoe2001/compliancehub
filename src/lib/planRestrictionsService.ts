interface PlanLimits {
  maxObligations: number;
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
    hasWhatsAppReminders: false,
    hasEmailReminders: false,
    hasAdvancedCalculator: false,
    hasReminderHistory: false,
    hasApiAccess: false,
    hasMultiUserAccess: false,
    hasPrioritySupport: false,
  },
  test100: {
    maxObligations: 1,
    hasWhatsAppReminders: false,
    hasEmailReminders: true,
    hasAdvancedCalculator: false,
    hasReminderHistory: false,
    hasApiAccess: false,
    hasMultiUserAccess: false,
    hasPrioritySupport: false,
  },
  test200: {
    maxObligations: 2,
    hasWhatsAppReminders: false,
    hasEmailReminders: true,
    hasAdvancedCalculator: false,
    hasReminderHistory: false,
    hasApiAccess: false,
    hasMultiUserAccess: false,
    hasPrioritySupport: false,
  },
  basic: {
    maxObligations: 3,
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
    hasWhatsAppReminders: true,
    hasEmailReminders: true,
    hasAdvancedCalculator: true,
    hasReminderHistory: true,
    hasApiAccess: true,
    hasMultiUserAccess: true,
    hasPrioritySupport: true,
  },
  annual: {
    maxObligations: -1, // unlimited
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
    
    if (plan === 'free' || plan === 'test100' || plan === 'test200') {
      return `Upgrade to Basic plan to access ${featureName}`;
    } else if (plan === 'basic') {
      return `Upgrade to Pro plan to access ${featureName}`;
    } else if (plan === 'pro') {
      return `Upgrade to Enterprise plan to access ${featureName}`;
    }
    
    return `This feature requires a paid plan`;
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
