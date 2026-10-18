"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNavigation } from "../hooks/useNavigation";
import { AdminDashboard } from "../components/pages/AdminDashboard";
import { ShieldCheck, Loader2 } from "lucide-react";

export interface CurrentAdmin {
  id: number;
  name: string;
  email: string;
  role: string;
  last_login?: string;
}

export default function Admin() {
  const router = useRouter();
  const { setPage } = useNavigation();
  const [checking, setChecking] = useState(true);
  const [admin, setAdmin] = useState<CurrentAdmin | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth/me");
        const data = await res.json();

        if (!res.ok || !data.authenticated) {
          if (isMounted) {
            router.replace("/admin/login");
          }
          return;
        }

        if (isMounted) {
          setAdmin(data.admin);
          setChecking(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        if (isMounted) {
          router.replace("/admin/login");
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-[#009966]/20 border border-[#009966]/40 flex items-center justify-center mb-4 text-[#009966] animate-pulse">
          <ShieldCheck size={28} />
        </div>
        <div className="flex items-center gap-2 text-white font-bold text-base mb-1">
          <Loader2 size={18} className="animate-spin text-[#009966]" />
          <span>Verifying Admin Credentials...</span>
        </div>
        <p className="text-slate-500 text-xs font-mono">Querying Neon Database session</p>
      </div>
    );
  }

  return <AdminDashboard setPage={setPage} currentAdmin={admin} />;
}
