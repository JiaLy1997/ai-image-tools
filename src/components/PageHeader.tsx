import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Link href="/" className="p-1">
        <ChevronLeft size={24} />
      </Link>
      <h1 className="text-lg font-bold">{title}</h1>
    </div>
  );
}
