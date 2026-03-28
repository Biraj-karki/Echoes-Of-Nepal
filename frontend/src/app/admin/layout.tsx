"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Users, Images, LogOut, Shield, MapPin, MountainSnow, Map, Globe, Briefcase } from "lucide-react";


const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);

  // ✅ SSR-safe auth state
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const isLoginPage = useMemo(
    () => pathname?.includes("/admin/login"),
    [pathname]
  );

  useEffect(() => {
    setMounted(true);

    // Read localStorage ONLY on client
    const t = localStorage.getItem("admin_token");
    setToken(t);

    // Guard: if not logged in, kick to login (but never block login page itself)
    if (!t && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [isLoginPage, router]);

  const logout = async () => {
    try {
      const t = localStorage.getItem("admin_token");
      if (t) {
        await fetch(`${API_BASE}/api/admin/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${t}` },
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem("admin_token");
      setToken(null);
      router.replace("/admin/login");
    }
  };

  const NavItem = ({
    href,
    icon,
    label,
  }: {
    href: string;
    icon: React.ReactNode;
    label: string;
  }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={[
          "group flex items-center gap-3 rounded-2xl px-3 py-3 transition",
          active
            ? "bg-white/10 border border-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
            : "hover:bg-white/5 border border-transparent",
        ].join(" ")}
      >
        <span
          className={[
            "grid place-items-center rounded-xl w-10 h-10",
            active ? "bg-emerald-500/15" : "bg-white/5 group-hover:bg-white/10",
          ].join(" ")}
        >
          {icon}
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-extrabold leading-5">{label}</div>
            <div className="text-xs text-slate-400 truncate">
              {active ? "You are here" : "Open section"}
            </div>
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#060a16] text-slate-100">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-40 -right-40 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative flex">
        {/* SIDEBAR */}
        <aside
          className={[
            "sticky top-0 h-screen border-r border-white/10 bg-white/[0.03] backdrop-blur-xl",
            collapsed ? "w-[88px]" : "w-[280px]",
            "transition-all duration-200",
          ].join(" ")}
        >
          <div className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 grid place-items-center border border-emerald-500/20">
                  <Shield className="text-emerald-300" size={20} />
                </div>
                {!collapsed && (
                  <div>
                    <div className="font-black text-lg leading-5">
                      Echoes Admin
                    </div>
                    <div className="text-xs text-slate-400">
                      Analytics & moderation
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setCollapsed((p) => !p)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-extrabold hover:bg-white/10"
                title={collapsed ? "Expand" : "Collapse"}
              >
                {collapsed ? "»" : "«"}
              </button>
            </div>

            <div className="mt-6 grid gap-2">
              <NavItem
                href="/admin/dashboard"
                icon={<LayoutDashboard size={18} />}
                label="Dashboard"
              />
              <NavItem href="/admin/users" icon={<Users size={18} />} label="Users" />
              <NavItem
                href="/admin/stories"
                icon={<Images size={18} />}
                label="Stories"
              />
              <NavItem
                href="/admin/destinations"
                icon={<MapPin size={18} />}
                label="Destinations"
              />
              <NavItem
                href="/admin/treks"
                icon={<MountainSnow size={18} />}
                label="Treks"
              />
              <NavItem
                href="/admin/districts"
                icon={<Map size={18} />}
                label="Districts"
              />
              <NavItem
                href="/admin/vendors"
                icon={<Briefcase size={18} />}
                label="Vendors"
              />
            </div>


            <div className="mt-6">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-extrabold hover:bg-white/10"
              >
                <LogOut size={18} />
                {!collapsed && "Logout"}
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1">
          {/* Top bar */}
          <div className="sticky top-0 z-10 border-b border-white/10 bg-[#060a16]/60 backdrop-blur-xl">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80 mb-0.5">Admin Workspace</div>
                  <div className="text-xl font-black text-white">
                    {pathname?.includes("/admin/users") ? "Users"
                      : pathname?.includes("/admin/stories") ? "Stories"
                      : pathname?.includes("/admin/destinations") ? "Destinations"
                      : pathname?.includes("/admin/treks") ? "Treks"
                      : pathname?.includes("/admin/districts") ? "Districts"
                      : pathname?.includes("/admin/vendors") ? "Vendors"
                      : "Dashboard"}
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>
                <Link 
                  href="/" 
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all text-slate-400 hover:text-white"
                >
                  <Globe size={14} />
                  View Site
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                    <div className="text-xs font-black text-white">Administrator</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">System Root</div>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px]">
                    <div className="w-full h-full rounded-[15px] bg-[#060a16] flex items-center justify-center font-black text-emerald-400">
                        A
                    </div>
                </div>
              </div>
            </div>
          </div>


          <div className="mx-auto max-w-6xl px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
