"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface VariantForm {
  color: string;
  images: File[];
  previewUrls: string[];
}

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
  });
  const [variants, setVariants] = useState<VariantForm[]>([
    { color: "", images: [], previewUrls: [] },
  ]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addVariant = () => {
    setVariants([...variants, { color: "", images: [], previewUrls: [] }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof VariantForm,
    value: any,
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleVariantImageUpload = async (
    variantIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();

        if (result.success) {
          uploadedUrls.push(result.imageUrl);
        }
      } catch (err) {
        console.error("خطا در آپلود عکس:", err);
      }
    }

    const updated = [...variants];
    updated[variantIndex].previewUrls = [
      ...updated[variantIndex].previewUrls,
      ...uploadedUrls,
    ];
    setVariants(updated);
    setUploading(false);
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    const updated = [...variants];
    updated[variantIndex].previewUrls = updated[
      variantIndex
    ].previewUrls.filter((_, i) => i !== imageIndex);
    setVariants(updated);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...form,
        price: Number(form.price),
        variants: variants.map((variant) => ({
          color: variant.color,
          images: variant.previewUrls.map((url) => ({ url })),
        })),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error("Failed to create product");

      const result = await res.json();
      console.log("محصول ایجاد شد:", result);

      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("خطا در افزودن محصول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dark:bg-gray-dark mx-auto max-w-4xl p-6">
      <div className="rounded-2xl p-8 shadow-lg">
        <h1 className="mb-8 text-center text-3xl font-bold">
          ➕ افزودن محصول جدید
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="rounded-xl p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">
              📋 اطلاعات اصلی محصول
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  نام محصول
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="مثال: کفش ورزشی مردانه"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  برند
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="مثال: نایک"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                توضیحات
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="توضیحات کامل محصول..."
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                قیمت (تومان)
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="مثال: 2500000"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="rounded-xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-700">
                🎨 رنگ‌بندی و عکس‌ها
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <span>+</span>
                افزودن رنگ
              </button>
            </div>

            <div className="space-y-6">
              {variants.map((variant, variantIndex) => (
                <div
                  key={variantIndex}
                  className="rounded-xl border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-gray-400"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-700">
                      رنگ {variantIndex + 1}
                    </h3>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(variantIndex)}
                        className="flex items-center gap-1 text-red-500 transition-colors hover:text-red-700"
                      >
                        <span>🗑️</span>
                        حذف
                      </button>
                    )}
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-600">
                        نام رنگ
                      </label>
                      <input
                        className="w-full rounded-lg border border-gray-300 p-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="مثلاً: سفید، مشکی، آبی"
                        value={variant.color}
                        onChange={(e) =>
                          updateVariant(variantIndex, "color", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-600">
                        عکس‌های این رنگ
                      </label>
                      <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="mb-4 h-8 w-8 text-gray-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              برای آپلود کلیک کنید
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, JPEG
                          </p>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) =>
                            handleVariantImageUpload(variantIndex, e)
                          }
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                      {uploading && (
                        <div className="mt-2 text-center text-sm text-blue-600">
                          📤 در حال آپلود...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* پیشنمایش عکس‌ها */}
                  {variant.previewUrls.length > 0 && (
                    <div className="mb-6">
                      <label className="mb-3 block text-sm font-medium text-gray-600">
                        عکس‌های آپلود شده:
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {variant.previewUrls.map((url, imgIndex) => (
                          <div key={imgIndex} className="group relative">
                            <img
                              src={url}
                              alt={`عکس ${imgIndex + 1}`}
                              className="h-24 w-24 rounded-lg border-2 border-gray-200 object-cover transition-colors group-hover:border-gray-400"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeImage(variantIndex, imgIndex)
                              }
                              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
          >
            {loading ? "⏳ در حال افزودن محصول..." : "✅ افزودن محصول"}
          </button>
        </form>
      </div>
    </div>
  );
}
