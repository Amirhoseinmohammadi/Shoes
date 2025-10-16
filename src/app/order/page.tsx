"use client";
import { useApi } from "@/hooks/useApi";
import { useTelegram } from "@/hooks/useTelegram";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  product: { name: string };
}

interface Order {
  id: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const OrdersPage = () => {
  const { user: telegramUser, loading: telegramLoading } = useTelegram();

  const { data: orders, error, isLoading } = useApi.useOrders(telegramUser?.id);

  if (error) return <div>خطا در بارگذاری سفارشات</div>;
  if (telegramLoading || isLoading) return <div>در حال بارگذاری...</div>;
  if (!telegramUser) return <div>لطفاً از طریق تلگرام وارد شوید</div>;

  return (
    <div className="mx-auto mt-14 max-w-4xl p-4">
      <div className="mb-6 rounded-lg bg-blue-50 p-4">
        <h1 className="text-xl font-bold text-blue-800">سفارش‌های من</h1>
        <p className="text-blue-600">خوش آمدید، {telegramUser.first_name}!</p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">شما هنوز سفارشی ثبت نکرده‌اید.</p>
          <a
            href="/"
            className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            بازگشت به فروشگاه
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-lg font-semibold">سفارش #{order.id}</h2>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "processing"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.status === "delivered"
                    ? "تحویل شده"
                    : order.status === "processing"
                      ? "در حال پردازش"
                      : order.status === "pending"
                        ? "در انتظار"
                        : "لغو شده"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
                <p>
                  تاریخ ثبت:{" "}
                  {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                </p>
                <p>
                  ساعت: {new Date(order.createdAt).toLocaleTimeString("fa-IR")}
                </p>
              </div>

              <div className="mt-4">
                <h3 className="font-medium text-gray-700">محصولات:</h3>
                <ul className="mt-2 space-y-2">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between border-b pb-2 last:border-b-0"
                    >
                      <div>
                        <span className="font-medium">{item.product.name}</span>
                        {item.color && (
                          <span className="mr-2 text-sm text-gray-500">
                            رنگ: {item.color}
                          </span>
                        )}
                        {item.size && (
                          <span className="mr-2 text-sm text-gray-500">
                            سایز: {item.size}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          تعداد: {item.quantity}
                        </span>
                      </div>
                      <span className="font-medium">
                        {item.price.toLocaleString()} تومان
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 border-t pt-3">
                <p className="text-lg font-bold">
                  جمع کل:{" "}
                  {order.items
                    .reduce(
                      (total, item) => total + item.price * item.quantity,
                      0,
                    )
                    .toLocaleString()}{" "}
                  تومان
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
