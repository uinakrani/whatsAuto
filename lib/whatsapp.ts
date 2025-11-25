// WhatsApp automation utilities

import { Contact, PDF, Assignment } from '@/types';
import { updateContactStatus } from './storage';

export function generateWhatsAppURL(phone: string, message?: string): string {
  // Remove + and spaces, keep only digits
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const encodedMessage = message ? encodeURIComponent(message) : '';
  const url = `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
  return url;
}

export function generateWhatsAppWebURL(phone: string): string {
  // WhatsApp Web uses the same format
  return generateWhatsAppURL(phone);
}

export async function openWhatsAppForContact(
  contact: Contact,
  pdf: PDF | null,
  version: '2-members' | 'all-members'
): Promise<void> {
  const phone = contact.phone;
  const url = generateWhatsAppWebURL(phone);
  
  // Open in new tab/window
  window.open(url, '_blank');
  
  // Update status to assigned (waiting for user to send)
  await updateContactStatus(contact.id, 'assigned');
}

export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export async function shareViaWhatsApp(
  contact: Contact,
  pdf: PDF | null,
  version: '2-members' | 'all-members'
): Promise<boolean> {
  if (!('share' in navigator)) {
    return false;
  }

  try {
    // For mobile, we can use Web Share API
    // Note: WhatsApp doesn't support direct PDF sharing via Web Share API
    // So we'll open WhatsApp Web URL instead
    const url = generateWhatsAppWebURL(contact.phone);
    
    if (navigator.share) {
      await navigator.share({
        title: `Send invitation to ${contact.name}`,
        text: `Open WhatsApp to send invitation to ${contact.name}`,
        url: url,
      });
      await updateContactStatus(contact.id, 'assigned');
      return true;
    }
  } catch (error: any) {
    // User cancelled or error occurred
    if (error.name !== 'AbortError') {
      console.error('Share failed:', error);
    }
    return false;
  }
  
  return false;
}

export function getDelayBetweenMessages(): number {
  // Random delay between 60-120 seconds (conservative rate limiting)
  return Math.floor(Math.random() * 60000) + 60000; // 60-120 seconds in milliseconds
}

