"use client";

import { useTelegramAuth } from "@/hooks/useTelegramAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">در حال بررسی دسترسی...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">دسترسی غیرمجاز</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">پنل مدیریت</h1>
              <span className="mr-4 text-sm text-gray-500">
                ({user.first_name} {user.last_name})
              </span>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
