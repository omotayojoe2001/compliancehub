import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fyhhcqjclcedpylhyjwy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8'

// Create new client with minimal configuration
export const supabaseNew = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  db: {
    schema: 'public'
  }
})

// Test function to verify connection
export const testNewClient = async () => {
  try {
    console.log('🔧 Testing new Supabase client...')
    
    // Simple test query
    const { data, error } = await supabaseNew
      .from('profiles')
      .select('count(*)', { count: 'exact' })
    
    console.log('🔧 New client test result:', { data, error })
    return { success: !error, data, error }
  } catch (err) {
    console.error('🔧 New client test failed:', err)
    return { success: false, error: err }
  }
}