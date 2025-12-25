// Test basic network connectivity to Supabase
export const testSupabaseConnectivity = async () => {
  const supabaseUrl = 'https://fyhhcqjclcedpylhyjwy.supabase.co';
  
  console.log('🌐 Testing basic connectivity to Supabase...');
  
  try {
    // Test 1: Basic fetch to Supabase URL
    console.log('📡 Testing basic HTTP connection...');
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8'
      }
    });
    
    console.log('📡 HTTP Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (response.ok) {
      const text = await response.text();
      console.log('📡 Response body:', text.substring(0, 200));
    }
    
    return {
      httpConnection: response.ok,
      status: response.status,
      statusText: response.statusText
    };
    
  } catch (error: any) {
    console.error('❌ Network test failed:', error);
    return {
      httpConnection: false,
      error: error.message,
      networkError: true
    };
  }
};

// Test environment variables
export const testEnvironmentVariables = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('🔧 Environment Variables Test:', {
    hasUrl: !!url,
    hasKey: !!key,
    urlValue: url,
    keyLength: key?.length
  });
  
  return {
    hasUrl: !!url,
    hasKey: !!key,
    urlCorrect: url === 'https://fyhhcqjclcedpylhyjwy.supabase.co',
    keyLength: key?.length
  };
};