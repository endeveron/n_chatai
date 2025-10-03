const APP_ID = process.env.NEXT_PUBLIC_APP_ID as string;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL as string;
const STATS_URL = process.env.NEXT_PUBLIC_STATS_URL as string;
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL as string;

const API_ACCESS_TOKEN = process.env.API_ACCESS_TOKEN as string;
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING as string;

const AUTH_SECRET = process.env.DB_CONNECTION_STRING as string;
const ENCRYPTION_PASSPHRASE = process.env.ENCRYPTION_PASSPHRASE as string;

const EMAIL_JWT = process.env.EMAIL_JWT as string;
const NODEMAILER_USER = process.env.NODEMAILER_USER as string;
const NODEMAILER_PASSWORD = process.env.NODEMAILER_PASSWORD as string;

const APP_NAME = 'Chat AI';

// LocalStorage keys
const LANG_CODE_KEY = 'lang-code';

// Routes
const SIGNIN_REDIRECT = '/signin';
const SIGNUP_REDIRECT = '/signup';
const DEFAULT_REDIRECT = '/'; // Redirect URL after successful sign-in

export {
  APP_ID,
  BASE_URL,
  ASSET_URL,
  STATS_URL,
  AUTH_URL,
  API_ACCESS_TOKEN,
  DB_CONNECTION_STRING,
  AUTH_SECRET,
  ENCRYPTION_PASSPHRASE,
  EMAIL_JWT,
  NODEMAILER_USER,
  NODEMAILER_PASSWORD,
  APP_NAME,
  LANG_CODE_KEY,
  SIGNIN_REDIRECT,
  SIGNUP_REDIRECT,
  DEFAULT_REDIRECT,
};
