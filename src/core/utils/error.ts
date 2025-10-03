import { SpeechType } from '@/core/features/speech/useSpeech';
import { ErrorWithCode, ServerActionError } from '@/core/types';

export async function logErrorAndSpeak(
  error: unknown,
  speak: (type?: SpeechType) => Promise<void>
) {
  console.error(error);
  await speak('error');
}

/**
 * Handles server action errors by returning an object with an error message and code, or throwing an error if specified.
 *
 * @param {string} [msg] - an optional string that represents a custom error message.
 * @param {unknown} [err] - an optional parameter that represents the error object.
 * @param {boolean} [isThrow=false] - a boolean flag set to false by default indicating whether to throw an error or return an object with error information.
 * @returns an object with a property "error" which has a value of type ServerActionError.
 */
export const handleActionError = (
  msg?: string,
  err?: unknown,
  isThrow: boolean = false
): ServerActionError => {
  const error =
    err instanceof Error ? err : err ? new Error(String(err)) : undefined;
  const code =
    error && 'code' in error ? (error as ErrorWithCode).code : undefined;
  const info = error?.message;
  const message =
    msg && info ? `${msg}. ${info}` : msg || info || 'Unknown error';

  const serverActionError: ServerActionError = {
    success: false,
    error: { message, code },
  };

  if (isThrow) {
    throw new Error(message);
  }

  return serverActionError;
};

/**
 * Takes in search parameters and an error code map, and returns the corresponding error message.
 *
 * @param {SearchParams} searchParams - an interface that represents the search parameters.
 * @param errCodeMap - a `Map` object that maps error codes (numbers) to error messages (strings).
 * @returns the error message corresponding to the error code provided in the search parameters.
 */
export const getErrorMessageFromSearchParams = (
  errCodeStr: string,
  errCodeMap: Map<number, string>
) => {
  if (!errCodeStr) throw new Error('Invalid search params.');
  const errCodeNum = parseInt(errCodeStr);
  const isErrCodeExist = errCodeMap.has(errCodeNum);
  if (!isErrCodeExist) throw new Error('Invalid error code.');
  return errCodeMap.get(errCodeNum);
};
