import { ReactElement } from 'react';

export type PageParams = Promise<{ slug: string }>;

export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export type TWithChildren<T = object> = T & { children?: React.ReactNode };

export type ErrorWithCode = { code?: number; message: string };

export type ServerActionError = {
  success: false;
  error: Error | ErrorWithCode;
};

export type ServerActionResult<T = unknown> =
  | {
      success: true;
      data?: T;
    }
  | ServerActionError;

export type APIResult<T> = {
  data: T | null;
  error?: string;
};

export type NavbarItem = {
  id: string;
  icon: ReactElement;
  path?: string;
};

export type NavbarState = {
  translation: Map<string, string> | null;
  pathname: string;
};

export enum EmailType {
  'CONFIRMATION' = 'CONFIRMATION',
  'PROMOTION' = 'PROMOTION',
}

export type StoreActionResult<T = unknown> =
  | {
      success: true;
      data?: T;
    }
  | {
      success: false;
      error?: string;
    };
