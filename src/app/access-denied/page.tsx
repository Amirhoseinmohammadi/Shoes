export default function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg p-8 text-center shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-red-600">دسترسی غیرمجاز</h1>
        <p className="text-gray-600">
          شما دسترسی لازم برای مشاهده این صفحه را ندارید.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          فقط کاربران مجاز می‌توانند به پنل مدیریت دسترسی داشته باشند.
        </p>
      </div>
    </div>
  );
}
