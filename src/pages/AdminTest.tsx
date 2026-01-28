import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminTest() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">🎉 Admin Panel Access Test</h1>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Success!</strong> You can access the admin area.
        </div>
        <p className="text-lg mb-4">If you can see this page, the admin routing is working correctly.</p>
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-semibold mb-2">Next Steps:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>The comprehensive admin panel should load at /admin</li>
            <li>Check browser console for any errors</li>
            <li>Verify all admin features are accessible</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}