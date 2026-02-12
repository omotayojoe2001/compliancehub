import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Pencil, Save, X } from 'lucide-react';

interface PricingConfig {
  id: string;
  service_name: string;
  price_kobo: number;
  description: string;
  is_active: boolean;
}

export default function AdminPricing() {
  const [prices, setPrices] = useState<PricingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    const { data, error } = await supabase
      .from('pricing_config')
      .select('*')
      .eq('service_name', 'filing_service')
      .order('service_name');

    if (!error && data) {
      setPrices(data);
    }
    setLoading(false);
  };

  const startEdit = (price: PricingConfig) => {
    setEditing(price.id);
    setEditValue(price.price_kobo / 100); // Convert kobo to naira
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValue(0);
  };

  const savePrice = async (id: string) => {
    const { error } = await supabase
      .from('pricing_config')
      .update({
        price_kobo: editValue * 100, // Convert naira to kobo
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (!error) {
      alert('Price updated successfully!');
      setEditing(null);
      loadPrices();
    } else {
      alert('Failed to update price');
    }
  };

  const formatServiceName = (name: string) => {
    return name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) return <AdminLayout><div>Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pricing Management</h1>
          <p className="text-muted-foreground">Manage service prices and subscription fees</p>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Service</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Price (₦)</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {prices.map((price) => (
                <tr key={price.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {formatServiceName(price.service_name)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {price.description}
                  </td>
                  <td className="px-4 py-3">
                    {editing === price.id ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(parseFloat(e.target.value))}
                        className="w-32 border rounded px-2 py-1"
                        step="100"
                      />
                    ) : (
                      <span className="text-lg font-semibold">
                        ₦{(price.price_kobo / 100).toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {price.is_active ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editing === price.id ? (
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" onClick={() => savePrice(price.id)}>
                          <Save className="h-3 w-3 mr-1" /> Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={cancelEdit}>
                          <X className="h-3 w-3 mr-1" /> Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => startEdit(price)}>
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Prices are stored in kobo (₦1 = 100 kobo) for accuracy</li>
            <li>• Changes take effect immediately for new transactions</li>
            <li>• Existing subscriptions are not affected by price changes</li>
            <li>• Filing service price applies to professional tax filing requests</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
