import { ERROR_MESSAGES } from '@/core/features/chat/constants';
import { SpeechType } from '@/core/features/speech/useSpeech';
import { ErrorWithCode, ServerActionError } from '@/core/types/common';
import { getRandom } from '@/core/utils';

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
): ServerActionError | undefined => {
  const error =
    err instanceof Error ? err : err ? new Error(String(err)) : undefined;
  const code =
    error && 'code' in error ? (error as ErrorWithCode).code : undefined;
  const info = error?.message;
  const message =
    msg && info ? `${msg}. ${info}` : msg || info || 'Unknown error';

  if (isThrow) throw new Error(message);

  return {
    success: false,
    error: { message, code },
  };
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

/**
 * Generates a casual error message for user engagement when handling server action errors.
 * @param {unknown} [err] - If an error is provided, it will be logged to the console using
 * `console.error(err).
 * @returns a `ServerActionError` object with the properties `success` set to `false` and
 * `error` set to an object with a `message` property containing a random error message.
 */
export const configureCasualServerActionError = (
  err?: unknown
): ServerActionError => {
  if (err) console.error(err);

  // Use a casual error message to improve user engagement
  const randomErrMsg = getRandom<string>(ERROR_MESSAGES);

  return {
    success: false,
    error: { message: randomErrMsg },
  };
};

/**
 * Generates a casual error message for user engagement.
 * @param {unknown} [err] - If an error is provided, it will be logged to the console using
 * `console.error(err).
 * @returns a random casual error message.
 */
export const getCasualErrorMessage = (err?: unknown): string => {
  if (err) console.error(err);

  // Use a casual error message to improve user engagement
  const randomErrMsg = getRandom<string>(ERROR_MESSAGES);
  return randomErrMsg;
};
