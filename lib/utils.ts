import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, try to add country code
  if (!cleaned.startsWith('+')) {
    // Default to +1 if no country code (can be customized)
    return `+1${cleaned}`;
  }
  
  return cleaned;
}

export function formatPhoneDisplay(phone: string): string {
  const cleaned = formatPhoneNumber(phone);
  
  // Format for display (e.g., +1 234 567 8900)
  if (cleaned.startsWith('+')) {
    const countryCode = cleaned.substring(1, 2);
    const number = cleaned.substring(2);
    
    if (number.length === 10) {
      return `+${countryCode} ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
  }
  
  return cleaned;
}

