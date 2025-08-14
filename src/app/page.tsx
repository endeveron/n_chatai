import { SIGNIN_REDIRECT } from '@/core/constants';
import { redirect } from 'next/navigation';

export default async function Welcome() {
  return redirect(SIGNIN_REDIRECT);
}
