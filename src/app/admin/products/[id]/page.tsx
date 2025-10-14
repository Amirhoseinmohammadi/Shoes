"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        if (!res.ok) throw new Error("محصول یافت نشد");
        const data = await res.json();
        setForm({
          name: data.name,
          description: data.description || "",
          price: data.price || "",
          image: data.image || "",
        });
      } catch (err) {
        console.error(err);
        alert("خطا در دریافت اطلاعات محصول");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("خطا در ویرایش محصول");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("خطا در ویرایش محصول");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("آیا از حذف این محصول مطمئنی؟")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("خطا در حذف محصول");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("خطا در حذف محصول");
    }
  }

  if (loading)
    return <div className="p-6 text-gray-500">در حال بارگذاری محصول...</div>;

  return (
    <div className="mx-auto mt-10 max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">✏️ ویرایش محصول</h1>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
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
          placeholder="قیمت"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          className="rounded-lg border p-2"
          placeholder="لینک تصویر"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            حذف محصول
          </button>
        </div>
      </form>
    </div>
  );
}
