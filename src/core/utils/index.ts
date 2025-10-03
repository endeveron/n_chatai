import { type ClassValue, clsx } from 'clsx';
import crypto from 'crypto';
import { twMerge } from 'tailwind-merge';

const alphanumCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Custom error class for timeout scenarios
export class TimeoutError extends Error {
  constructor(message: string, public readonly timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}
// Configuration interface for the timeout function
interface TimeoutConfig {
  timeoutMs: number;
  errorMessage?: string;
}

// Generic utility function that works with any async operation
export async function runWithTimeoutAsync<T>(
  operation: () => Promise<T>,
  config: TimeoutConfig
): Promise<T> {
  const { timeoutMs, errorMessage } = config;

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () =>
        reject(
          new TimeoutError(
            errorMessage ?? `Operation timed out after ${timeoutMs}ms`,
            timeoutMs
          )
        ),
      timeoutMs
    );
  });

  try {
    return await Promise.race([operation(), timeoutPromise]);
  } catch (error) {
    // Re-throw the error to let the caller handle it
    throw error;
  }
}

/**
 * Generates a cryptographically secure random code of a specified length using alphanumeric characters.
 * @param [length=8] - The code length. Default is 8 characters.
 * @returns A randomly generated code.
 */
export function generateCode(length = 8) {
  const bytes = crypto.randomBytes(length);
  let code = '';

  for (let i = 0; i < length; i++) {
    const index = bytes[i] % alphanumCharset.length;
    code += alphanumCharset[index];
  }
  return code;
}

/**
 * Delays execution for a specified amount of time.
 * @param {number} delay - the delay in milliseconds.
 */
export async function wait(delay: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delay));
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

/**
 * Converts a camelCase or lowercase string into a properly formatted title.
 * - Splits camelCase into separate words.
 * - Converts all words to lowercase.
 * - Capitalizes only the first word.
 * @param input - The input string to convert (e.g., "someCollection", "collection").
 * @returns A properly formatted title string (e.g., "Some collection", "Collection").
 */
export const toProperTitle = (input: string): string => {
  // Split camelCase into words
  const words = input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(' ');
  // Capitalize the first word
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ');
};
