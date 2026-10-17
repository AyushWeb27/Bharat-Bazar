export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-['Plus_Jakarta_Sans',sans-serif]">
      {children}
    </div>
  );
}
