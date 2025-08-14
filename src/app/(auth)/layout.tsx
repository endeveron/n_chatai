import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Games',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="layout">{children}</div>;
}
