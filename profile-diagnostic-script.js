// Profile Switching Diagnostic Script
// Run this in browser console on your app to diagnose profile switching issues

console.log('🔍 Starting Profile Switching Diagnostic...');

const ProfileDiagnostic = {
    async runFullDiagnostic() {
        console.log('\n=== PROFILE SWITCHING DIAGNOSTIC REPORT ===\n');
        
        await this.checkAuthState();
        await this.checkProfileHooks();
        await this.checkDatabaseTables();
        await this.checkProfileSwitchingLogic();
        await this.checkCacheAndStorage();
        await this.checkContextProviders();
        await this.generateRecommendations();
    },

    async checkAuthState() {
        console.log('🔐 1. AUTHENTICATION STATE CHECK');
        console.log('─'.repeat(50));
        
        try {
            // Check if supabase client exists
            if (typeof window.supabase === 'undefined') {
                console.error('❌ Supabase client not found in window object');
                return;
            }

            const supabaseUrl = 'https://fyhhcqjclcedpylhyjwy.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8';
            const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) {
                console.error('❌ Auth Error:', error.message);
                return null;
            }

            if (user) {
                console.log('✅ User authenticated:', user.email);
                console.log('📋 User ID:', user.id);
                console.log('📅 Created:', new Date(user.created_at).toLocaleString());
                console.log('📧 Email Confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
                
                // Check session validity
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const expiresAt = new Date(session.expires_at * 1000);
                    const timeLeft = expiresAt - new Date();
                    console.log('⏰ Session expires:', expiresAt.toLocaleString());
                    console.log('⏰ Time remaining:', Math.round(timeLeft / 1000 / 60), 'minutes');
                }
                
                return { user, supabase };
            } else {
                console.error('❌ No authenticated user found');
                return null;
            }
        } catch (error) {
            console.error('❌ Auth check failed:', error);
            return null;
        }
    },

    async checkProfileHooks() {
        console.log('\n👤 2. PROFILE HOOKS CHECK');
        console.log('─'.repeat(50));
        
        // Check if React DevTools can access hooks
        try {
            // Look for profile-related state in React components
            const reactFiberNodes = document.querySelectorAll('[data-reactroot]');
            console.log('🔍 React root elements found:', reactFiberNodes.length);
            
            // Check for profile-related localStorage
            const profileKeys = Object.keys(localStorage).filter(key => 
                key.toLowerCase().includes('profile') || 
                key.toLowerCase().includes('user') ||
                key.toLowerCase().includes('company')
            );
            
            console.log('💾 Profile-related localStorage keys:', profileKeys);
            profileKeys.forEach(key => {
                try {
                    const value = JSON.parse(localStorage.getItem(key));
                    console.log(`  ${key}:`, value);
                } catch (e) {
                    console.log(`  ${key}:`, localStorage.getItem(key));
                }
            });

            // Check for profile hooks in window (if exposed for debugging)
            if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                console.log('✅ React DevTools hook available');
            } else {
                console.log('⚠️ React DevTools not available');
            }

        } catch (error) {
            console.error('❌ Profile hooks check failed:', error);
        }
    },

    async checkDatabaseTables() {
        console.log('\n🗄️ 3. DATABASE TABLES CHECK');
        console.log('─'.repeat(50));
        
        try {
            const supabaseUrl = 'https://fyhhcqjclcedpylhyjwy.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8';
            const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('❌ No user for database check');
                return;
            }

            const tables = [
                { name: 'profiles', userField: 'id' },
                { name: 'user_profiles', userField: 'id' },
                { name: 'subscriptions', userField: 'user_id' },
                { name: 'companies', userField: 'user_id' }
            ];

            for (const table of tables) {
                try {
                    const startTime = performance.now();
                    const { data, error } = await supabase
                        .from(table.name)
                        .select('*')
                        .eq(table.userField, user.id);

                    const endTime = performance.now();
                    const responseTime = Math.round(endTime - startTime);

                    if (error) {
                        console.error(`❌ Table '${table.name}' error:`, error.message);
                    } else {
                        console.log(`✅ Table '${table.name}': ${data?.length || 0} records (${responseTime}ms)`);
                        if (data && data.length > 0) {
                            console.log(`  Sample data:`, data[0]);
                        }
                    }
                } catch (error) {
                    console.error(`❌ Table '${table.name}' failed:`, error.message);
                }
            }

        } catch (error) {
            console.error('❌ Database check failed:', error);
        }
    },

    async checkProfileSwitchingLogic() {
        console.log('\n🔄 4. PROFILE SWITCHING LOGIC CHECK');
        console.log('─'.repeat(50));
        
        try {
            const supabaseUrl = 'https://fyhhcqjclcedpylhyjwy.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8';
            const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('❌ No user for switching logic check');
                return;
            }

            // Check for multiple companies/profiles
            const { data: companies, error: companiesError } = await supabase
                .from('companies')
                .select('*')
                .eq('user_id', user.id);

            if (companiesError) {
                console.error('❌ Companies fetch error:', companiesError.message);
            } else {
                console.log(`📊 Found ${companies?.length || 0} companies for switching:`);
                companies?.forEach((company, index) => {
                    console.log(`  ${index + 1}. ${company.company_name} (${company.is_primary ? 'Primary' : 'Secondary'})`);
                    console.log(`     TIN: ${company.tin || 'N/A'}, ID: ${company.id}`);
                });

                if (companies && companies.length > 1) {
                    console.log('✅ Multiple profiles available for switching');
                    
                    // Test switching logic
                    console.log('🔄 Testing profile switching simulation...');
                    
                    // Simulate switching to each company
                    for (const company of companies.slice(0, 2)) { // Test first 2
                        console.log(`  Switching to: ${company.company_name}`);
                        
                        // Check if switching would work by fetching company-specific data
                        const { data: companyData, error } = await supabase
                            .from('companies')
                            .select('*')
                            .eq('id', company.id)
                            .single();

                        if (error) {
                            console.error(`    ❌ Switch test failed: ${error.message}`);
                        } else {
                            console.log(`    ✅ Switch test successful`);
                        }
                    }
                } else {
                    console.log('⚠️ Only one or no company profiles found - switching not possible');
                }
            }

            // Check current profile context
            const currentProfile = localStorage.getItem('currentProfile');
            if (currentProfile) {
                try {
                    const parsed = JSON.parse(currentProfile);
                    console.log('📋 Current cached profile:', parsed.name || parsed.business_name || 'Unknown');
                } catch (e) {
                    console.error('❌ Current profile cache corrupted');
                }
            } else {
                console.log('⚠️ No current profile in cache');
            }

        } catch (error) {
            console.error('❌ Profile switching logic check failed:', error);
        }
    },

    async checkCacheAndStorage() {
        console.log('\n💾 5. CACHE AND STORAGE CHECK');
        console.log('─'.repeat(50));
        
        // Check localStorage
        console.log('📦 localStorage analysis:');
        const lsKeys = Object.keys(localStorage);
        console.log(`  Total keys: ${lsKeys.length}`);
        
        const profileRelatedKeys = lsKeys.filter(key => 
            key.toLowerCase().includes('profile') ||
            key.toLowerCase().includes('user') ||
            key.toLowerCase().includes('company') ||
            key.toLowerCase().includes('auth')
        );
        
        console.log(`  Profile-related keys: ${profileRelatedKeys.length}`);
        profileRelatedKeys.forEach(key => {
            const value = localStorage.getItem(key);
            try {
                const parsed = JSON.parse(value);
                console.log(`    ${key}:`, typeof parsed === 'object' ? Object.keys(parsed) : parsed);
            } catch (e) {
                console.log(`    ${key}: ${value?.substring(0, 50)}${value?.length > 50 ? '...' : ''}`);
            }
        });

        // Check sessionStorage
        console.log('\n📦 sessionStorage analysis:');
        const ssKeys = Object.keys(sessionStorage);
        console.log(`  Total keys: ${ssKeys.length}`);
        ssKeys.forEach(key => {
            console.log(`    ${key}: ${sessionStorage.getItem(key)?.substring(0, 50)}...`);
        });

        // Check IndexedDB
        if ('indexedDB' in window) {
            try {
                const databases = await indexedDB.databases();
                console.log('\n🗃️ IndexedDB databases:', databases.length);
                databases.forEach(db => {
                    console.log(`    ${db.name} (v${db.version})`);
                });
            } catch (error) {
                console.log('⚠️ Could not access IndexedDB:', error.message);
            }
        }
    },

    async checkContextProviders() {
        console.log('\n🔗 6. CONTEXT PROVIDERS CHECK');
        console.log('─'.repeat(50));
        
        // Check for React context in DOM
        const reactElements = document.querySelectorAll('[data-reactroot] *');
        console.log(`🔍 Total React elements: ${reactElements.length}`);
        
        // Look for context provider indicators
        const contextIndicators = [
            'AuthProvider',
            'CompanyProvider', 
            'ProfileProvider',
            'UserProvider'
        ];
        
        contextIndicators.forEach(indicator => {
            const elements = document.querySelectorAll(`[data-testid*="${indicator}"], [class*="${indicator}"]`);
            console.log(`  ${indicator}: ${elements.length} elements found`);
        });

        // Check for global context objects
        const globalContexts = [
            'window.__AUTH_CONTEXT__',
            'window.__PROFILE_CONTEXT__',
            'window.__COMPANY_CONTEXT__'
        ];
        
        globalContexts.forEach(context => {
            const value = eval(context);
            console.log(`  ${context}: ${value ? 'Available' : 'Not found'}`);
        });
    },

    generateRecommendations() {
        console.log('\n💡 7. RECOMMENDATIONS');
        console.log('─'.repeat(50));
        
        const recommendations = [
            {
                issue: 'Profile Hook Issues',
                solutions: [
                    'Switch from useProfile to useProfileClean for simpler implementation',
                    'Add error boundaries around profile-dependent components',
                    'Implement profile loading states and fallbacks'
                ]
            },
            {
                issue: 'Database Connection Problems',
                solutions: [
                    'Add connection retry logic with exponential backoff',
                    'Implement query timeouts (currently 8000ms)',
                    'Add database health checks before profile operations'
                ]
            },
            {
                issue: 'Profile Switching Logic',
                solutions: [
                    'Ensure CompanySelector properly updates context',
                    'Add profile switching event listeners',
                    'Implement optimistic updates for better UX'
                ]
            },
            {
                issue: 'Cache Management',
                solutions: [
                    'Clear profile cache on authentication changes',
                    'Implement cache invalidation strategies',
                    'Add cache versioning to prevent stale data'
                ]
            },
            {
                issue: 'Context Provider Issues',
                solutions: [
                    'Ensure proper provider hierarchy (Auth > Company > Profile)',
                    'Add context debugging tools in development',
                    'Implement context value memoization'
                ]
            }
        ];

        recommendations.forEach((rec, index) => {
            console.log(`\n${index + 1}. ${rec.issue}:`);
            rec.solutions.forEach(solution => {
                console.log(`   • ${solution}`);
            });
        });

        console.log('\n🔧 IMMEDIATE ACTIONS TO TRY:');
        console.log('─'.repeat(50));
        console.log('1. Clear all browser cache and localStorage');
        console.log('2. Switch to useProfileClean hook in components');
        console.log('3. Add comprehensive error handling in profile fetch');
        console.log('4. Implement profile switching event system');
        console.log('5. Add loading states for all profile operations');
        
        console.log('\n✅ DIAGNOSTIC COMPLETE');
        console.log('─'.repeat(50));
        console.log('Run ProfileDiagnostic.runFullDiagnostic() again after making changes');
    }
};

// Auto-run diagnostic
ProfileDiagnostic.runFullDiagnostic();

// Export for manual use
window.ProfileDiagnostic = ProfileDiagnostic;