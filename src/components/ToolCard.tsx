import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}

export default function ToolCard({
  href,
  icon: Icon,
  title,
  desc,
  color,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-card rounded-2xl no-underline active:scale-[0.98] transition-transform"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: color + "18" }}
      >
        <Icon size={24} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-text">{title}</h3>
        <p className="text-xs text-text-secondary mt-0.5 truncate">{desc}</p>
      </div>
      <svg
        width="8"
        height="14"
        viewBox="0 0 8 14"
        fill="none"
        className="text-text-secondary shrink-0"
      >
        <path
          d="M1 1L7 7L1 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
