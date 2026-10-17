export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#07080f] font-['Inter','Plus_Jakarta_Sans',sans-serif]">
      {children}
    </div>
  );
}
