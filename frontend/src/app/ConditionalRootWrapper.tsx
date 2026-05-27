"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ConditionalRootWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isVendorRoute = pathname?.startsWith("/vendor");
  const isVendorPortalRoute =
    pathname?.startsWith("/vendor/dashboard") ||
    pathname?.startsWith("/vendor/listings") ||
    pathname?.startsWith("/vendor/bookings") ||
    pathname?.startsWith("/vendor/profile");
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password") ||
    pathname?.startsWith("/verify-email") ||
    pathname?.startsWith("/vendor/login") ||
    pathname?.startsWith("/admin/login");
  const isAppRoute =
    pathname?.startsWith("/explore") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/assistant") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/my-bookings") ||
    pathname?.startsWith("/booking") ||
    pathname?.startsWith("/sos");
  const shouldShowNavbar = !isAdminRoute && !isVendorPortalRoute;
  const shouldShowFooter = !isVendorRoute && !isAdminRoute && !isAuthRoute && !isAppRoute;

  if (isAdminRoute) {
    return <div className="min-h-screen bg-[#020617] text-white">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-white">
      {shouldShowNavbar ? <Navbar /> : null}
      <main className="flex-1">{children}</main>
      {shouldShowFooter ? <Footer /> : null}
    </div>
  );
}
