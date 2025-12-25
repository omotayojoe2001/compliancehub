import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { notificationServiceFixed } from '@/lib/notificationServiceFixed';

export default function ScheduledNotificationTest() {
  const [email, setEmail] = useState('omotayojoshua10@gmail.com');
  const [phone, setPhone] = useState('07049163283');
  const [businessName, setBusinessName] = useState('Test Business');
  const [minutes, setMinutes] = useState(5);
  const [scheduledJobs, setScheduledJobs] = useState([]);

  const scheduleNotification = (type: string, delayMinutes: number) => {
    const scheduledTime = new Date(Date.now() + delayMinutes * 60 * 1000);
    
    console.log(`📅 Scheduling ${type} notification for ${scheduledTime.toLocaleTimeString()}`);
    
    const jobId = setTimeout(async () => {
      console.log(`🚀 Sending scheduled ${type} notification now!`);
      
      try {
        if (type === 'welcome') {
          await notificationServiceFixed.sendWelcomeNotifications(email, businessName, phone);
        } else if (type === 'tax-reminder') {
          await notificationServiceFixed.sendTaxDeadlineReminder(
            email, businessName, phone, 'VAT', 3, 
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          );
        } else if (type === 'subscription') {
          await notificationServiceFixed.sendSubscriptionExpiryReminder(
            email, businessName, phone, 'Pro', 7
          );
        }
        
        alert(`✅ ${type} notification sent successfully!`);
        console.log(`✅ ${type} notification sent at ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        alert(`❌ ${type} notification failed: ${error.message}`);
        console.error(`❌ ${type} notification failed:`, error);
      }
      
      // Remove from scheduled jobs
      setScheduledJobs(prev => prev.filter(job => job.id !== jobId));
    }, delayMinutes * 60 * 1000);

    // Add to scheduled jobs list
    const newJob = {
      id: jobId,
      type,
      scheduledTime: scheduledTime.toLocaleTimeString(),
      delayMinutes
    };
    
    setScheduledJobs(prev => [...prev, newJob]);
    
    alert(`📅 ${type} notification scheduled for ${scheduledTime.toLocaleTimeString()} (${delayMinutes} minutes from now)`);
  };

  const cancelJob = (jobId) => {
    clearTimeout(jobId);
    setScheduledJobs(prev => prev.filter(job => job.id !== jobId));
    alert('❌ Scheduled notification cancelled');
  };

  const scheduleWelcome = () => scheduleNotification('welcome', minutes);
  const scheduleTaxReminder = () => scheduleNotification('tax-reminder', minutes);
  const scheduleSubscription = () => scheduleNotification('subscription', minutes);

  // Quick schedule buttons
  const scheduleIn1Min = (type) => scheduleNotification(type, 1);
  const scheduleIn5Min = (type) => scheduleNotification(type, 5);
  const scheduleIn10Min = (type) => scheduleNotification(type, 10);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Scheduled Notification Test</h1>
          <p className="text-muted-foreground">Schedule automatic email and WhatsApp notifications</p>
        </div>

        {/* Settings */}
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-4">Notification Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Phone (WhatsApp)</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label>Business Name</Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>
            <div>
              <Label>Custom Minutes</Label>
              <Input 
                type="number" 
                value={minutes} 
                onChange={(e) => setMinutes(parseInt(e.target.value))} 
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Quick Schedule Buttons */}
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-4">Quick Schedule (1, 5, 10 minutes)</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Welcome Notification</h4>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => scheduleIn1Min('welcome')}>1 Min</Button>
                <Button size="sm" onClick={() => scheduleIn5Min('welcome')}>5 Min</Button>
                <Button size="sm" onClick={() => scheduleIn10Min('welcome')}>10 Min</Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Tax Reminder (VAT due in 3 days)</h4>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => scheduleIn1Min('tax-reminder')}>1 Min</Button>
                <Button size="sm" onClick={() => scheduleIn5Min('tax-reminder')}>5 Min</Button>
                <Button size="sm" onClick={() => scheduleIn10Min('tax-reminder')}>10 Min</Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Subscription Reminder (Pro expires in 7 days)</h4>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => scheduleIn1Min('subscription')}>1 Min</Button>
                <Button size="sm" onClick={() => scheduleIn5Min('subscription')}>5 Min</Button>
                <Button size="sm" onClick={() => scheduleIn10Min('subscription')}>10 Min</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Schedule */}
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-4">Custom Schedule ({minutes} minutes)</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button onClick={scheduleWelcome}>Schedule Welcome</Button>
            <Button onClick={scheduleTaxReminder}>Schedule Tax Reminder</Button>
            <Button onClick={scheduleSubscription}>Schedule Subscription</Button>
          </div>
        </div>

        {/* Scheduled Jobs */}
        {scheduledJobs.length > 0 && (
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-4">Scheduled Notifications ({scheduledJobs.length})</h3>
            <div className="space-y-2">
              {scheduledJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <span className="font-medium capitalize">{job.type}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      at {job.scheduledTime} ({job.delayMinutes} min)
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => cancelJob(job.id)}
                  >
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">How it works:</h4>
          <ul className="text-sm space-y-1">
            <li>• Click any schedule button to set a timer</li>
            <li>• Notifications will be sent automatically at the scheduled time</li>
            <li>• You'll get both email and WhatsApp (if phone is verified)</li>
            <li>• Check console for detailed logs</li>
            <li>• Cancel scheduled jobs anytime</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}