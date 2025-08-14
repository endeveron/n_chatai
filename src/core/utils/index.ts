import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { LangCode, Phrase } from '@/core/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Delays execution for a specified amount of time.
 * @param {number} delay - the delay in milliseconds.
 */
export async function wait(delay: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Takes a language code and an array of phrases, and returns a random
 * phrase in the specified language.
 * @param {Phrase[]} phrases - an array of objects that contain phrases in
 * different languages.
 * @param {LangCode} [langCode] - an optional parameter that specifies the
 * language code to use when retrieving a random phrase. If no `langCode`
 * is provided, the default code is set to English (`LangCode.en`).
 * @returns a random phrase in the specified language.
 */
export const getRandomPhrase = (
  phrases: Phrase[],
  langCode?: LangCode
): string => {
  const lang = (langCode || LangCode.en).split('-')[0];
  const object = phrases[Math.floor(Math.random() * phrases.length)];
  return object[lang as keyof Phrase];
};

/**
 * Generates a random referral code of a specified length using alphanumeric characters.
 * @param [length=10] - The referral code length. Default is 10 characters.
 * @returns A randomly generated referral code.
 */
export function generateReferralCode(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Scales a number by a given factor and rounds it to a specified number of decimal places.
 *
 * @param value - The original number to be scaled and rounded.
 * @param scaleFactor - The factor by which to divide the original number (default is 1000).
 * @param decimals - The number of decimal places to round to (default is 1).
 * @returns The scaled and rounded number.
 *
 * @example
 * scaleAndRound(6200.000286102295); // Returns 6.2
 */
export function scaleAndRound(
  value: number,
  scaleFactor: number = 1000,
  decimals: number = 1
): number {
  const scaled = value / scaleFactor;
  const rounded = parseFloat(scaled.toFixed(decimals));
  return rounded;
}

/**
 * Rounds a value to a specified number of decimal places.
 *
 * @param value - The original number to be scaled and rounded.
 * @param decimals - The number of decimal places to round to (default is 2).
 * @returns The scaled and rounded number.
 *
 * @example
 * round(6200.000286102295); // Returns 6200
 */
export function round(value: number, decimals: number = 2): number {
  const rounded = parseFloat(value.toFixed(decimals));
  return rounded;
}

/**
 * Returns a random element from that array.
 * @param {T[]} array - An array of type `T`.
 * @param {number} length - The length of the array.
 * @returns A random element from the input array is being returned.
 */
export const getRandom = <T>(array: T[], length?: number) => {
  return array[Math.floor(Math.random() * (length ?? array.length))];
};
