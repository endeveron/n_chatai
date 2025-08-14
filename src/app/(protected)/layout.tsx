export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
