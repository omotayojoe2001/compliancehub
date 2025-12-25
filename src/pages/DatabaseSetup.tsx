import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function DatabaseSetup() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const checkTables = async () => {
    setLoading(true);
    setResult('Checking if new tables exist...');
    
    try {
      // Test if user_profiles table exists
      const response = await fetch('https://fyhhcqjclcedpylhyjwy.supabase.co/rest/v1/user_profiles?limit=1', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8'
        }
      });
      
      if (response.ok) {
        setResult('✅ New tables exist! Database is ready to use.');
      } else {
        setResult('❌ New tables do not exist. You need to run the SQL script first.');
      }
    } catch (error) {
      setResult(`❌ Error checking tables: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Setup</h1>
        
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Check Database Tables</h2>
            <p className="mb-4">
              This will check if the new database tables have been created.
            </p>
            
            <Button 
              onClick={checkTables} 
              disabled={loading}
              className="w-full mb-4"
            >
              {loading ? 'Checking...' : 'Check Tables'}
            </Button>

            {result && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className={result.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {result}
                </p>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">If tables don't exist:</h3>
            <ol className="text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Go to your Supabase dashboard</li>
              <li>Click "SQL Editor" in the sidebar</li>
              <li>Copy the SQL from fresh_schema.sql file</li>
              <li>Paste it and click "Run"</li>
              <li>Come back and test again</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">New Tables:</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• user_profiles (for saving profile data)</li>
              <li>• user_tax_obligations (for tax obligations)</li>
              <li>• user_reminder_logs (for tracking reminders)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}