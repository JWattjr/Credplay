"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Bell,
  ChevronDown,
  Crosshair,
  Home,
  LineChart,
  Target,
  Trophy,
  User,
  Wallet,
} from "lucide-react";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { useWalletProfile } from "@/hooks/useWalletProfile";
import { displayName } from "@/lib/credplay";

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Target, label: "Prediction Arena", href: "/explore" },
  { icon: LineChart, label: "Live Markets", href: "/markets" },
  { icon: Trophy, label: "Standings", href: "/standings" },
  { icon: Award, label: "Trophies", href: "/trophies" },
  { icon: Bell, label: "Notifications", href: "/notifications", badge: "3" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: User, label: "Fan Passport", href: "/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { formatted, balance } = useUsdcBalance();
  const { profile, isConnected } = useWalletProfile();

  return (
    <div className="flex h-full flex-col px-4 py-7 xl:px-6">
      <Link href="/" className="flex items-center gap-3">
        <span aria-hidden="true" className="cp-logo-mark shrink-0" />
        <span className="hidden xl:block">
          <span className="block text-3xl font-black tracking-[-0.02em] text-white">CredPlay</span>
          <span className="block text-xs font-bold text-white">
            Predict. <span className="cp-green-text">Rank.</span> Win.
          </span>
        </span>
      </Link>

      <nav className="mt-14 flex-1 space-y-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              className={`group relative flex h-14 items-center gap-4 rounded-[8px] px-4 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[linear-gradient(90deg,rgba(0,224,88,0.9),rgba(0,224,88,0.36))] text-white shadow-[0_12px_30px_rgba(0,224,88,0.18)]"
                  : "text-[#c7cbd2] hover:bg-white/5 hover:text-white"
              }`}
              href={item.href}
              key={item.label}
            >
              <item.icon className="h-6 w-6 shrink-0 xl:h-5 xl:w-5" />
              <span className="hidden xl:block">{item.label}</span>
              {item.badge && (
                <span className="ml-auto hidden h-5 min-w-5 items-center justify-center rounded-full bg-brand-secondary px-1.5 text-[10px] font-black text-black xl:flex">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="hidden xl:block">
        <div className="cp-panel rounded-[8px] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-brand-secondary/30 bg-white/10 font-bold text-white">
              {isConnected ? displayName(profile).slice(0, 2).toUpperCase() : "FP"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">
                {isConnected ? displayName(profile) : "Fan Player"}
              </p>
              <p className="text-xs font-bold text-brand-secondary">Pro Predictor</p>
            </div>
            <ChevronDown className="h-4 w-4 text-[var(--muted)]" />
          </div>
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-mono text-xs text-white">
                <Crosshair className="h-4 w-4 text-brand-secondary" />
                {balance.isLoading ? "..." : formatted} CP
              </span>
              <span className="text-[var(--muted)]">Wallet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
