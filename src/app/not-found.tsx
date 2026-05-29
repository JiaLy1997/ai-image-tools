import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-background">
      <p className="text-6xl font-bold text-text-secondary">404</p>
      <p className="text-sm text-text-secondary mt-3">页面不存在</p>
      <Link
        href="/"
        className="mt-6 px-6 py-3 bg-primary text-white rounded-xl text-sm font-medium no-underline"
      >
        回到首页
      </Link>
    </div>
  );
}
