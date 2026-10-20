"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    __googleGsiLoaded?: boolean;
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (user: any) => void;
  onError: (message: string) => void;
  buttonText?: string;
  className?: string;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  buttonText = "Continue with Google",
  className = "",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const hiddenBtnRef = useRef<HTMLDivElement>(null);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "470811948482-mca375qbpj3pkjjmso3ranuahjqssfpt.apps.googleusercontent.com";

  useEffect(() => {
    // Load Google Identity Services script if not already present
    if (!document.getElementById("google-gsi-script")) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.__googleGsiLoaded = true;
        initGsi();
      };
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initGsi();
    }

    function initGsi() {
      if (!window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (hiddenBtnRef.current) {
          window.google.accounts.id.renderButton(hiddenBtnRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            width: 320,
          });
        }
      } catch (err) {
        console.warn("GSI init warning:", err);
      }
    }
  }, [clientId]);

  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      onError("No credential received from Google.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        onError(data.message || "Google sign-in verification failed.");
        setLoading(false);
        return;
      }

      onSuccess(data.user);
    } catch (err: any) {
      onError(err?.message || "Failed to communicate with authentication server.");
      setLoading(false);
    }
  };

  const handleCustomClick = () => {
    if (loading) return;

    if (window.google?.accounts?.id) {
      // Prompt user or click underlying GSI button
      const googleIframeBtn = hiddenBtnRef.current?.querySelector("div[role=button]") as HTMLElement;
      if (googleIframeBtn) {
        googleIframeBtn.click();
      } else {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log("One-tap dismissed/suppressed, retrying button click");
            const btn = hiddenBtnRef.current?.querySelector("div[role=button]") as HTMLElement;
            if (btn) btn.click();
          }
        });
      }
    } else {
      onError("Google Services are loading. Please try again in a moment.");
    }
  };

  return (
    <div className="relative w-full">
      {/* Hidden container where official Google rendered button sits for reliable click delegation */}
      <div
        ref={hiddenBtnRef}
        className="absolute inset-0 opacity-0 overflow-hidden pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Styled BharatBazar Google Button */}
      <motion.button
        type="button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCustomClick}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-border bg-card text-sm font-bold text-foreground hover:border-[#009966]/50 hover:bg-muted/50 transition-all shadow-sm ${className}`}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin text-[#009966]" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span>{loading ? "Verifying with Google..." : buttonText}</span>
      </motion.button>
    </div>
  );
}

export default GoogleSignInButton;
