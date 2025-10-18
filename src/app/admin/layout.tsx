"use client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-16 min-h-screen">
      <nav className="shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              {/* <h1 className="text-xl font-bold">پنل مدیریت</h1> */}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
