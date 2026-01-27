from subscription_checker import SubscriptionChecker

def check_user_access(user_id, db_connection):
    """
    Direct check: user logs in, system checks subscription, returns access
    """
    # Get user's current subscription and profile count
    cursor = db_connection.cursor()
    
    query = """
    SELECT s.plan_type, COUNT(cp.id) as profile_count
    FROM subscriptions s
    LEFT JOIN company_profiles cp ON s.user_id = cp.user_id AND cp.is_active = true
    WHERE s.user_id = %s
    GROUP BY s.plan_type
    """
    
    cursor.execute(query, (user_id,))
    result = cursor.fetchone()
    
    if not result:
        plan_type = 'free'  # default
        profile_count = 0
    else:
        plan_type, profile_count = result
    
    # Get access permissions
    access = SubscriptionChecker.get_user_access(plan_type)
    
    return {
        'plan': plan_type.upper(),
        'max_profiles': access['business_profiles'],
        'current_profiles': profile_count or 0,
        'can_create_profile': SubscriptionChecker.can_create_profile(plan_type, profile_count or 0),
        'features': access['features']
    }

# Usage example:
# user_access = check_user_access(user_id, db_conn)
# if user_access['can_create_profile']:
#     # allow profile creation
# if SubscriptionChecker.has_feature(user_access['plan'].lower(), 'whatsapp_reminders'):
#     # show whatsapp reminder option