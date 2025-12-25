import { supabase } from '@/lib/supabase';

export default function DatabaseTest() {
  const testConnection = async () => {
    console.log('Testing database connection...');
    
    try {
      // Test 1: Simple query
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
        
      console.log('Database test result:', { data, error });
      
      if (error) {
        console.error('Database error:', error);
        return `❌ Database Error: ${error.message}`;
      }
      
      return '✅ Database connection working';
      
    } catch (err) {
      console.error('Connection failed:', err);
      return `❌ Connection failed: ${err.message}`;
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      <button 
        onClick={async () => {
          const result = await testConnection();
          alert(result);
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Database
      </button>
    </div>
  );
}