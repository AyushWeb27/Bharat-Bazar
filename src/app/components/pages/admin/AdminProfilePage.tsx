import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  User, Mail, Phone, Shield, KeyRound, Lock, Eye, EyeOff,
  CheckCircle2, AlertCircle, RefreshCw, Calendar, Clock,
  Sparkles, Database, BadgeCheck, HardDrive, ShieldCheck,
  Save, Building, FileText, ArrowRight
} from "lucide-react";
import { PageHeader, SectionCard } from "./shared/ui";
import { G, GD, inp } from "./shared/constants";

interface AdminProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  designation: string;
  bio: string;
  avatar_url: string;
  role: string;
  status: string;
  last_login: string | null;
  created_at: string;
  updated_at?: string;
}

interface AdminProfilePageProps {
  currentAdmin?: any;
  onProfileUpdated?: (updated: { name: string; email: string; role: string }) => void;
}

export function AdminProfilePage({ currentAdmin, onProfileUpdated }: AdminProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"general" | "security" | "system">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Profile fields
  const [profile, setProfile] = useState<AdminProfileData>({
    id: currentAdmin?.id || 1,
    name: currentAdmin?.name || "Bharat Super Admin",
    email: currentAdmin?.email || "admin@bharatbazar.com",
    phone: "",
    designation: "Super Administrator",
    bio: "Head Administrator managing BharatBazar core commerce platforms and marketplace infrastructure.",
    avatar_url: "",
    role: currentAdmin?.role || "superadmin",
    status: "active",
    last_login: null,
    created_at: new Date().toISOString(),
  });

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passSaving, setPassSaving] = useState(false);

  // Fetch full profile from Neon DB
  const loadProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch("/api/admin/profile");
      const data = await res.json();
      if (res.ok && data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (err: any) {
      console.error("Failed to load admin profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Save general profile details
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile.name.trim() || !profile.email.trim()) {
      setErrorMsg("Name and email are required fields.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
          designation: profile.designation.trim(),
          bio: profile.bio.trim(),
          avatar_url: profile.avatar_url.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to update profile.");
        setSaving(false);
        return;
      }

      setProfile(data.profile);
      setSuccessMsg("Profile details successfully updated in Neon Database!");

      if (onProfileUpdated) {
        onProfileUpdated({
          name: data.profile.name,
          email: data.profile.email,
          role: data.profile.role,
        });
      }

      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to connect to profile server.");
    } finally {
      setSaving(false);
    }
  };

  // Save new password
  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentPassword) {
      setErrorMsg("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }

    setPassSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to change password.");
        setPassSaving(false);
        return;
      }

      setSuccessMsg("Password changed and hashed in Neon database successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Error updating password.");
    } finally {
      setPassSaving(false);
    }
  };

  const initials = profile.name
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SA";

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        breadcrumb="System / Profile"
        title="View & Edit Profile"
        subtitle="Manage your personal administrator identity, contact information, and security credentials"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={loadProfile}
            title="Reload from Neon DB"
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-emerald-600" : ""} />
            <span className="hidden sm:inline">Sync DB</span>
          </button>
          <button
            onClick={() => handleSaveProfile()}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-95 transition-all"
            style={{ background: G }}
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={15} />}
            <span>Save Profile</span>
          </button>
        </div>
      </PageHeader>

      {/* Notifications */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 font-semibold text-sm shadow-sm"
        >
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <p>{successMsg}</p>
        </motion.div>
      )}

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-600 font-semibold text-sm shadow-sm"
        >
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <p>{errorMsg}</p>
        </motion.div>
      )}

      {/* ── PROFILE HERO CARD ── */}
      <div
        className="relative rounded-3xl overflow-hidden p-6 md:p-8 text-white border border-white/10 shadow-xl"
        style={{
          background: "linear-gradient(135deg, #050f0a 0%, #0c261b 50%, #081610 100%)",
        }}
      >
        {/* Glow Effects */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ background: G }}
        />
        <div
          className="absolute bottom-0 right-1/3 w-64 h-32 rounded-full pointer-events-none opacity-15 blur-2xl"
          style={{ background: "#3b82f6" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar / Initials */}
            <div className="relative group">
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black text-white shadow-2xl border-2 border-white/20"
                style={{ background: `linear-gradient(135deg, ${G}, #00cc88)` }}
              >
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#050f0a] flex items-center justify-center" title="Account Active">
                <BadgeCheck size={14} className="text-white" />
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                  {profile.role === "superadmin" ? "Super Admin" : profile.role}
                </span>
                <span className="text-[11px] text-white/50 flex items-center gap-1">
                  <Database size={11} className="text-emerald-400" /> Neon PostgreSQL
                </span>
                <span className="text-[11px] text-white/40 font-mono">
                  ID: #{profile.id}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {profile.name}
              </h2>
              <p className="text-emerald-400 text-xs md:text-sm font-semibold mt-0.5">
                {profile.designation || "Super Administrator"}
              </p>
              <p className="text-white/50 text-xs mt-1">
                {profile.email}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md min-w-[130px]">
              <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Calendar size={11} /> Joined
              </div>
              <p className="text-sm font-bold text-white">
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })
                  : "Recent"}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md min-w-[130px]">
              <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Clock size={11} /> Last Login
              </div>
              <p className="text-sm font-bold text-emerald-400 truncate">
                {profile.last_login
                  ? new Date(profile.last_login).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Active Now"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        {[
          { id: "general", label: "Profile Information", icon: User },
          { id: "security", label: "Security & Password", icon: KeyRound },
          { id: "system", label: "Access & System Details", icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap"
              style={
                active
                  ? { background: G, color: "#fff", boxShadow: `0 4px 14px ${G}30` }
                  : { background: "#fff", color: "#6b7280", border: "1px solid #e5e7eb" }
              }
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: GENERAL INFORMATION ── */}
      {activeTab === "general" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            <SectionCard>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-black text-gray-900">Personal & Contact Details</h3>
                  <p className="text-xs text-gray-500">Update how your administrator identity appears across BharatBazar</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                  <Database size={12} /> Neon Table
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        placeholder="e.g. Bharat Super Admin"
                        className={`${inp} pl-10`}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        placeholder="admin@bharatbazar.com"
                        className={`${inp} pl-10`}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className={`${inp} pl-10`}
                      />
                    </div>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Designation / Role Title
                    </label>
                    <div className="relative">
                      <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={profile.designation}
                        onChange={e => setProfile({ ...profile, designation: e.target.value })}
                        placeholder="e.g. Chief Executive / Super Administrator"
                        className={`${inp} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                {/* Bio / Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Administrative Bio & Responsibility Notes
                  </label>
                  <div className="relative">
                    <FileText size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <textarea
                      rows={3}
                      value={profile.bio}
                      onChange={e => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Brief description of administrative oversight..."
                      className={`${inp} pl-10 resize-none`}
                    />
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-95 transition-all"
                    style={{ background: G }}
                  >
                    {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </SectionCard>
          </div>

          {/* Side Info Cards */}
          <div className="space-y-6">
            <SectionCard>
              <h3 className="text-sm font-black text-gray-900 mb-3">Profile Summary</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Account Type</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {profile.role}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Account Status</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Database Record</span>
                  <span className="font-mono text-gray-700">admins table # {profile.id}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-500">Security Standard</span>
                  <span className="font-bold text-gray-700">Bcrypt + HMAC-SHA256</span>
                </div>
              </div>
            </SectionCard>

            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/60 text-xs text-blue-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-800">
                <Sparkles size={16} />
                <span>Synchronized Session</span>
              </div>
              <p className="text-blue-700 leading-relaxed">
                Saving updates will automatically refresh your active session cookie so the top navbar, initials, and email update instantly.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB 2: SECURITY & PASSWORD ── */}
      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Change Password Form */}
          <div className="lg:col-span-2">
            <SectionCard>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-black text-gray-900">Change Admin Password</h3>
                  <p className="text-xs text-gray-500">
                    Re-encrypt your database password with bcrypt cost factor 10
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <KeyRound size={16} />
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Current Admin Password *
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className={`${inp} pl-10 pr-12`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className={`${inp} pl-10 pr-12`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className={`${inp} pl-10 pr-12`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={passSaving}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-95 transition-all"
                    style={{ background: G }}
                  >
                    {passSaving ? <RefreshCw size={15} className="animate-spin" /> : <KeyRound size={15} />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </SectionCard>
          </div>

          {/* Security Standards Card */}
          <div className="space-y-5">
            <SectionCard>
              <h3 className="text-sm font-black text-gray-900 mb-3">Security Checklist</h3>
              <div className="space-y-3">
                {[
                  { title: "Bcrypt Hashing", desc: "Password stored with salt rounds (10)", ok: true },
                  { title: "HTTP-Only Cookie", desc: "Prevents XSS session hijacking", ok: true },
                  { title: "HMAC-SHA256 Token", desc: "Tamper-proof payload verification", ok: true },
                  { title: "Neon SSL Mode", desc: "Enforced TLS 1.3 encryption in transit", ok: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-800">{item.title}</p>
                      <p className="text-[11px] text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </motion.div>
      )}

      {/* ── TAB 3: ACCESS & SYSTEM DETAILS ── */}
      {activeTab === "system" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SectionCard>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Database size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900">Database Engine</h4>
                  <p className="text-[11px] text-gray-500">PostgreSQL (Neon Serverless)</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Connected pooler running on AWS us-east-2 region with automated pooling and scaling.
              </p>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900">Role Authority</h4>
                  <p className="text-[11px] text-gray-500">Super Administrator</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Full privileges across order management, seller KYC approvals, tax rates, inventory, and system settings.
              </p>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <HardDrive size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900">Session Lifecycle</h4>
                  <p className="text-[11px] text-gray-500">7-Day Rolling Expiry</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Session automatically validates database identity on every administrative page transition.
              </p>
            </SectionCard>
          </div>

          {/* Permissions Matrix */}
          <SectionCard>
            <h3 className="text-sm font-black text-gray-900 mb-4">Privilege & Scope Access</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[
                "Product Catalog & Requests",
                "Orders & Bulk Dispatch",
                "Seller KYC & Payouts",
                "Coupon & Flash Sales",
                "Inventory Restock Alerts",
                "Customer Analytics & Insights",
                "Audit Logs & Admin Users",
                "Database & System Config",
              ].map((perm, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50/70">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span className="font-semibold text-gray-800">{perm}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>
      )}
    </div>
  );
}

export default AdminProfilePage;
