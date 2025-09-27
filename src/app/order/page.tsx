"use client";

import { useEffect, useState } from "react";

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
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      const res = await fetch("/api/orders?userId=1");
      const data = await res.json();
      setOrders(data);
    };
    loadOrders();
  }, []);

  return (
    <div className="mx-auto mt-14 max-w-4xl p-4">
      {orders.length === 0 && <p>شما هنوز سفارشی ثبت نکرده‌اید.</p>}

      {orders.map((order) => (
        <div key={order.id} className="mb-4 rounded border p-4">
          <h2 className="font-semibold">سفارش #{order.id}</h2>
          <p>وضعیت: {order.status}</p>
          <p>تاریخ: {new Date(order.createdAt).toLocaleString()}</p>
          <ul className="mt-2">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.product.name} - تعداد: {item.quantity} - قیمت:{" "}
                {item.price} تومان
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default OrdersPage;
