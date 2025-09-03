// const API_URL = process.env.NEXT_PUBLIC_API_URL as string;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL as string;

const STATE_KEY = process.env.NEXT_PUBLIC_STATE_KEY as string;

const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING as string;

const AUTH_SECRET = process.env.DB_CONNECTION_STRING as string;
const ENCRYPTION_PASSPHRASE = process.env.ENCRYPTION_PASSPHRASE as string;
// const FIXED_SALT = process.env.FIXED_SALT as string;

const EMAIL_JWT = process.env.EMAIL_JWT as string;
const NODEMAILER_USER = process.env.NODEMAILER_USER as string;
const NODEMAILER_PASSWORD = process.env.NODEMAILER_PASSWORD as string;

const APP_NAME = 'Chat AI';

// LocalStorage keys
const LANG_CODE_KEY = 'lang-code';

// Routes
const SIGNIN_REDIRECT = '/signin';
const SIGNUP_REDIRECT = '/signup';
const DEFAULT_REDIRECT = '/'; // after user signed in.

export {
  // API_URL,
  BASE_URL,
  ASSET_URL,
  STATE_KEY,
  DB_CONNECTION_STRING,
  AUTH_SECRET,
  ENCRYPTION_PASSPHRASE,
  // FIXED_SALT,
  EMAIL_JWT,
  NODEMAILER_USER,
  NODEMAILER_PASSWORD,
  APP_NAME,
  LANG_CODE_KEY,
  SIGNIN_REDIRECT,
  SIGNUP_REDIRECT,
  DEFAULT_REDIRECT,
};
