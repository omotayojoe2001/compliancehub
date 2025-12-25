import { twilioWhatsAppService } from './twilioWhatsAppService';

export async function testWhatsAppSend() {
  console.log('🧪 Testing WhatsApp send...');
  
  // Replace with your actual WhatsApp number
  const testPhone = '+2347016190271'; // UPDATE THIS WITH YOUR NUMBER
  
  const result = await twilioWhatsAppService.sendTaxReminder(
    testPhone,
    'VAT',
    'March 21, 2024',
    3
  );
  
  console.log('WhatsApp test result:', result);
  return result;
}

export async function testWelcomeMessage() {
  console.log('🧪 Testing Welcome message...');
  
  // Replace with your actual WhatsApp number
  const testPhone = '+2347016190271'; // UPDATE THIS WITH YOUR NUMBER
  
  const result = await twilioWhatsAppService.sendWelcomeMessage(
    testPhone,
    'Test Business'
  );
  
  console.log('Welcome message test result:', result);
  return result;
}

// Quick test function you can call from browser console
(window as any).testWhatsApp = testWhatsAppSend;
(window as any).testWelcome = testWelcomeMessage;