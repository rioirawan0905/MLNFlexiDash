import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    // Usually we'd use a toast, but console log for now
    console.log('Copied to clipboard:', text);
  });
}
