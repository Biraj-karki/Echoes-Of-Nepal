"use client";

import Link from "next/link";
import { useAuth } from "@/app/AuthProvider";
import { useLanguage } from "@/app/LanguageProvider";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { LogOut, User, Settings, Bookmark, BookOpen, ShoppingBag } from "lucide-react";
import SOSButton from "./SOSButton";
import NotificationBell from "./NotificationBell";

const navLinkBase =
  "px-4 py-2 rounded-full text-sm font-medium transition-all border border-transparent";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };
  const profileImage = user?.profileImage || user?.profile_image;

  if (isAdminRoute) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#020617]/82 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-11 w-11 overflow-hidden rounded-full border border-white/10 shadow-lg shadow-black/30 ring-1 ring-white/5">
            <img src="/logo.png" alt="Echoes of Nepal Logo" className="h-full w-full object-cover" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-black tracking-tight text-white group-hover:text-blue-300 transition-colors">
              {t("brand.name")}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-500">
              {t("brand.tagline")}
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/" label={t("nav.home")} active={isActive("/")} />
          <NavLink href="/explore" label={t("nav.explore")} active={isActive("/explore")} />
          <NavLink href="/explore/vendors" label={t("nav.stays")} active={isActive("/explore/vendors")} />
          <NavLink href="/dashboard" label={t("nav.feed")} active={isActive("/dashboard")} />
          <NavLink href="/assistant" label={t("nav.assistant")} active={isActive("/assistant")} />
          {user ? (
            user.verification_status === "approved" ? (
              <Link
                href="/vendor/dashboard"
                className="ml-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-300 transition-all hover:bg-blue-500/18 hover:border-blue-400/30"
              >
                {t("nav.vendorHub")}
              </Link>
            ) : null
          ) : (
            <div className="relative ml-1 group">
              <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-200 transition-colors group-hover:border-white/20 group-hover:bg-white/8">
                {t("nav.forVendors")}
              </button>
              <div className="absolute left-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl opacity-0 invisible scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:scale-100">
                <Link href="/vendor/apply" className="block px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                  {t("nav.listBusiness")}
                </Link>
                <Link href="/vendor/login" className="block px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                  {t("nav.vendorLogin")}
                </Link>
              </div>
            </div>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user && <SOSButton />}
          {user && <NotificationBell />}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 transition-all hover:border-white/15 hover:bg-white/8"
              >
                <span className="hidden lg:block text-sm font-semibold text-slate-200">{user.name}</span>
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xs font-black text-white shadow-lg">
                  {profileImage ? (
                    <img src={profileImage} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl">
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="truncate text-sm font-bold text-white">{user.name}</p>
                    <p className="truncate text-xs text-slate-400">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <DropdownLink href="/profile" icon={<User size={16} />} label={t("nav.profile")} onClick={() => setDropdownOpen(false)} />
                    <DropdownLink href="/my-bookings" icon={<ShoppingBag size={16} />} label={t("nav.myBookings")} onClick={() => setDropdownOpen(false)} />
                    <DropdownLink href="/profile?tab=stories" icon={<BookOpen size={16} />} label={t("nav.myStories")} onClick={() => setDropdownOpen(false)} />
                    <DropdownLink href="/profile?tab=saved" icon={<Bookmark size={16} />} label={t("nav.saved")} onClick={() => setDropdownOpen(false)} />
                    <DropdownLink href="/profile?tab=settings" icon={<Settings size={16} />} label={t("nav.settings")} onClick={() => setDropdownOpen(false)} />
                  </div>
                  <div className="border-t border-white/10 py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                    >
                      <LogOut size={16} />
                      <span>{t("nav.logout")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white">
                {t("nav.login")}
              </Link>
              <Link href="/login" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500">
                {t("nav.signUp")}
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden rounded-full border border-white/10 bg-white/5 p-3 text-slate-200" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-5 bg-current transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-current transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#020617] px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            <MobileNavLink href="/" label={t("nav.home")} onClick={() => setMenuOpen(false)} />
            <MobileNavLink href="/explore" label={t("nav.explore")} onClick={() => setMenuOpen(false)} />
            <MobileNavLink href="/dashboard" label={t("nav.feed")} onClick={() => setMenuOpen(false)} />
            <MobileNavLink href="/assistant" label={t("nav.assistant")} onClick={() => setMenuOpen(false)} />
            <MobileNavLink href="/my-bookings" label={t("nav.myBookings")} onClick={() => setMenuOpen(false)} />
          </nav>
          <div className="mt-4 border-t border-white/10 pt-4">
            {user ? (
              <div className="space-y-4">
                <SOSButton />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <User size={16} />
                    <span>{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="text-xs font-semibold text-red-400">
                    {t("nav.signOut")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white">
                  {t("nav.login")}
                </Link>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white">
                  {t("nav.signUp")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${navLinkBase} ${active ? "bg-white/10 text-white border-white/10" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
    >
      {label}
    </Link>
  );
}

function DropdownLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
    >
      {icon}
      {label}
    </Link>
  );
}
