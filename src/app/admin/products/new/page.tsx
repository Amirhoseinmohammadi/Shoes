"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to create product");

      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("خطا در افزودن محصول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">🛍 افزودن محصول جدید</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="rounded-lg border p-2"
          placeholder="نام محصول"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          className="rounded-lg border p-2"
          placeholder="توضیحات محصول"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="rounded-lg border p-2"
          placeholder="قیمت (تومان)"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          className="rounded-lg border p-2"
          placeholder="لینک تصویر (اختیاری)"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "در حال افزودن..." : "افزودن محصول"}
        </button>
      </form>
    </div>
  );
}
