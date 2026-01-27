class SubscriptionChecker:
    """Direct subscription access control"""
    
    PLAN_LIMITS = {
        'free': {
            'business_profiles': 0,
            'features': ['view_compliance_guides', 'basic_tax_info']
        },
        'basic': {
            'business_profiles': 1,
            'features': ['email_reminders', 'tax_calculator', 'filing_guides', 'tax_obligations_limit_3']
        },
        'pro': {
            'business_profiles': 5,
            'features': ['whatsapp_reminders', 'email_reminders', 'advanced_tax_calculator', 
                        'filing_guides', 'unlimited_tax_obligations', 'priority_support']
        },
        'enterprise': {
            'business_profiles': -1,  # unlimited
            'features': ['unlimited_profiles', 'whatsapp_reminders', 'email_reminders', 
                        'advanced_tax_calculator', 'api_access', 'multi_user_access', 
                        'dedicated_account_manager', 'custom_integrations']
        }
    }
    
    @classmethod
    def get_user_access(cls, plan_type):
        """Get what user can access based on subscription"""
        return cls.PLAN_LIMITS.get(plan_type.lower(), cls.PLAN_LIMITS['free'])
    
    @classmethod
    def can_create_profile(cls, plan_type, current_profiles):
        """Check if user can create another business profile"""
        limits = cls.get_user_access(plan_type)
        max_profiles = limits['business_profiles']
        
        if max_profiles == -1:  # unlimited
            return True
        return current_profiles < max_profiles
    
    @classmethod
    def has_feature(cls, plan_type, feature):
        """Check if user has access to specific feature"""
        limits = cls.get_user_access(plan_type)
        return feature in limits['features']