"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Minimize2, RefreshCw, Crop, Type } from "lucide-react";

const tabs = [
  { href: "/", label: "首页", icon: Home },
  { href: "/compress", label: "压缩", icon: Minimize2 },
  { href: "/convert", label: "转换", icon: RefreshCw },
  { href: "/crop", label: "裁剪", icon: Crop },
  { href: "/watermark", label: "水印", icon: Type },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-border z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1 no-underline"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? "text-primary" : "text-text-secondary"}
              />
              <span
                className={`text-[11px] ${active ? "text-primary font-semibold" : "text-text-secondary"}`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
