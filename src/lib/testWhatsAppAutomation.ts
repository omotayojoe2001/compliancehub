import { reminderService } from './reminderService';
import { supabase } from './supabase';

export async function testWhatsAppAutomation() {
  console.log('🧪 Testing WhatsApp automation...');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user logged in');
      return;
    }

    // Create a test tax obligation due in 3 days
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    
    const { error } = await supabase
      .from('tax_obligations')
      .insert({
        user_id: user.id,
        obligation_type: 'VAT',
        frequency: 'monthly',
        next_due_date: dueDate.toISOString().split('T')[0],
        tax_period: '2024-12',
        is_active: true
      });

    if (error) {
      console.error('Failed to create test obligation:', error);
      return;
    }

    console.log('✅ Test obligation created');

    // Trigger reminder check
    await reminderService.checkAndScheduleReminders();
    
    console.log('✅ Automation test complete - check your WhatsApp!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Make available in browser console
(window as any).testWhatsAppAutomation = testWhatsAppAutomation;