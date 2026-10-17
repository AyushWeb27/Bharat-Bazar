export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f4f6f8] font-['Plus_Jakarta_Sans',sans-serif]">
      {children}
    </div>
  );
}
