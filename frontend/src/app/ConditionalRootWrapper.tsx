"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ConditionalRootWrapper({ 
  children
}: { 
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isVendorRoute = pathname?.startsWith("/vendor");

  if (isVendorRoute) {
    return (
      <body className="font-sans flex flex-col min-h-screen bg-[#020617]">
        <div className="flex-grow flex flex-col">
          {children}
        </div>
      </body>
    );
  }

  const noFooterRoutes = ["/assistant", "/login", "/register", "/map"];
  const showFooter = !noFooterRoutes.some(route => pathname?.startsWith(route));

  return (
    <body className="font-sans flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow flex flex-col">
        {children}
      </div>
      {showFooter && <Footer />}
    </body>
  );
}
