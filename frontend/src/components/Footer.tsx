import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-white/8 bg-[#020617]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <h3 className="mb-4 flex items-center gap-3 text-lg font-black text-white">
            <div className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-sm font-black">
              E
            </div>
            Echoes of Nepal
          </h3>
          <p className="text-sm leading-relaxed text-slate-400">
            Discover, plan and share your adventures across Nepal with a single, cohesive travel experience.
          </p>
        </div>

        <FooterCol
          title="Explore"
          links={[
            { href: "/explore", label: "Destinations" },
            { href: "/explore", label: "Treks" },
            { href: "/dashboard", label: "Travel Stories" },
          ]}
        />
        <FooterCol
          title="For Businesses"
          links={[
            { href: "/vendor/apply", label: "Become a Partner" },
            { href: "/vendor/login", label: "Vendor Login" },
            { href: "/vendor/login", label: "Vendor Dashboard" },
          ]}
        />
        <FooterCol
          title="Travelers"
          links={[
            { href: "/login", label: "User Login" },
            { href: "/login", label: "Sign Up" },
            { href: "/profile", label: "My Profile" },
          ]}
        />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/5 px-5 py-6 text-xs font-bold uppercase tracking-widest text-slate-500 md:flex-row">
        <p>&copy; {new Date().getFullYear()} Echoes of Nepal. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="#" className="transition-colors hover:text-slate-300">
            Privacy
          </Link>
          <Link href="#" className="transition-colors hover:text-slate-300">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
        {title}
      </h4>
      <ul className="space-y-2 text-sm text-slate-400">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
