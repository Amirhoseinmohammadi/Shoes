"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTelegram } from "@/hooks/useTelegram";

interface VariantForm {
  id?: number;
  color: string;
  images: File[];
  previewUrls: string[]; // urls from server or object URLs for local previews
}

interface ProductForm {
  name: string;
  brand: string;
  description: string;
  price: string;
  category: string;
  stock: string;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 pt-20 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-gray-800">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500"></div>
            <p className="text-gray-600 dark:text-gray-400">
              در حال بررسی دسترسی...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-gray-800">
        <div className="mb-4 text-6xl">🚫</div>
        <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
          دسترسی غیرمجاز
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          فقط کاربران ادمین می‌توانند محصولات را ویرایش کنند.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition-all hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}

export default function EditProductPage() {
  const { user: telegramUser, loading: authLoading, isAdmin } = useTelegram();
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState<ProductForm>({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const [variants, setVariants] = useState<VariantForm[]>([
    { color: "", images: [], previewUrls: [] },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect non-admin as soon as we know auth state
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      console.warn("❌ Non-admin user tried to access edit product page");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) {
        setError("شناسه محصول نامعتبر است");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          credentials: "include",
        });
        if (!res.ok) {
          if (res.status === 404) throw new Error("محصول یافت نشد");
          throw new Error(`خطای HTTP! وضعیت: ${res.status}`);
        }

        const data = await res.json();
        setForm({
          name: data.name || "",
          brand: data.brand || "",
          description: data.description || "",
          price: data.price != null ? String(data.price) : "",
          category: data.category || "",
          stock: data.stock != null ? String(data.stock) : "0",
        });

        if (
          data.variants &&
          Array.isArray(data.variants) &&
          data.variants.length > 0
        ) {
          setVariants(
            data.variants.map((v: any) => ({
              id: v.id,
              color: v.color || "",
              images: [],
              previewUrls: v.images ? v.images.map((img: any) => img.url) : [],
            })),
          );
        } else {
          setVariants([{ color: "", images: [], previewUrls: [] }]);
        }
      } catch (err: any) {
        console.error("خطا در دریافت محصول:", err);
        setError(err.message || "خطا در دریافت اطلاعات محصول");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const addVariant = () =>
    setVariants([...variants, { color: "", images: [], previewUrls: [] }]);

  const removeVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof VariantForm,
    value: any,
  ) => {
    const copy = [...variants];
    copy[index] = { ...copy[index], [field]: value };
    setVariants(copy);
  };

  const handleVariantImageUpload = async (
    variantIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(variantIndex);
    setError(null);

    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setError("لطفاً فقط فایل‌های تصویری آپلود کنید");
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError("حجم فایل نباید بیشتر از ۵ مگابایت باشد");
          continue;
        }

        const formData = new FormData();
        formData.append("image", file);

        try {
          const res = await fetch("/api/admin/upload", {
            method: "POST",
            credentials: "include",
            body: formData,
          });

          if (!res.ok) {
            throw new Error(`خطا در آپلود: ${res.status}`);
          }

          const result = await res.json();

          if (result.success && result.imageUrl) {
            // ✅ imageUrl میتواند:
            // 1. Cloud URL باشد (اگر cloud storage استفاده کنید)
            // 2. Base64 (فعلاً - لکن بعداً بهتر شود)
            uploadedUrls.push(result.imageUrl);
          } else {
            setError(result.message || "خطا در آپلود عکس");
          }
        } catch (uploadErr: any) {
          console.error("خطا در آپلود این فایل:", uploadErr);
          setError(`خطا در آپلود ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        const copy = [...variants];
        copy[variantIndex].previewUrls = [
          ...copy[variantIndex].previewUrls,
          ...uploadedUrls,
        ];
        setVariants(copy);
      }
    } catch (err: any) {
      console.error("خطا در آپلود عکس:", err);
      setError("خطا در آپلود عکس‌ها. لطفاً دوباره تلاش کنید.");
    } finally {
      setUploading(null);
      if (e.target) e.target.value = ""; // reset file input
    }
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    const copy = [...variants];
    copy[variantIndex].previewUrls = copy[variantIndex].previewUrls.filter(
      (_, i) => i !== imageIndex,
    );
    setVariants(copy);
  };

  const validateForm = (): boolean => {
    if (!form.name.trim() || !form.brand.trim() || !form.price) {
      setError("لطفاً فیلدهای ضروری را پر کنید");
      return false;
    }

    if (Number(form.price) <= 0) {
      setError("قیمت باید بیشتر از صفر باشد");
      return false;
    }

    if (variants.some((variant) => !variant.color.trim())) {
      setError("لطفاً نام رنگ را برای همه واریانت‌ها وارد کنید");
      return false;
    }

    if (variants.some((variant) => variant.previewUrls.length === 0)) {
      setError("لطفاً حداقل یک عکس برای هر واریانت آپلود کنید");
      return false;
    }

    setError(null);
    return true;
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      const productData = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category || null,
        stock: Number(form.stock) || 0,
        variants: variants.map((variant) => ({
          id: variant.id,
          color: variant.color.trim(),
          images: variant.previewUrls.map((url) => ({ url })),
        })),
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || errorData.message || "خطا در ویرایش محصول",
        );
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("خطا در ویرایش:", err);
      setError(err.message || "خطا در ویرایش محصول");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm("آیا از حذف این محصول مطمئن هستید؟ این عمل غیرقابل بازگشت است.")
    )
      return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || errorData.message || "خطا در حذف محصول",
        );
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("خطا در حذف:", err);
      setError(err.message || "خطا در حذف محصول");
    } finally {
      setSaving(false);
    }
  }

  const categories = [
    "کفش ورزشی",
    "کفش روزمره",
    "کفش رسمی",
    "کفش کودک",
    "کفش زنانه",
    "کفش مردانه",
  ];

  if (authLoading || loading) return <LoadingSkeleton />;
  if (!isAdmin) return <AccessDeniedPage />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 pt-20 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← بازگشت به مدیریت محصولات
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <h1 className="mb-8 text-center text-3xl font-bold text-gray-800 dark:text-white">
            ✏️ ویرایش محصول
          </h1>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="flex flex-col gap-8">
            {/* main info */}
            <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-700">
              <h2 className="mb-6 border-b pb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
                📋 اطلاعات اصلی محصول
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                    نام محصول *
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 transition-all placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:ring-blue-800"
                    placeholder="مثال: کفش ورزشی مردانه"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                    برند *
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 transition-all placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:ring-blue-800"
                    placeholder="مثال: نایک"
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                    دسته‌بندی
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-800"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="">انتخاب دسته‌بندی</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                    موجودی انبار
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 transition-all placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:ring-blue-800"
                    placeholder="تعداد موجودی"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                    توضیحات
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 transition-all placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:ring-blue-800"
                    placeholder="توضیحات کامل محصول..."
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                    قیمت (تومان) *
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 transition-all placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:ring-blue-800"
                    placeholder="مثال: 2500000"
                    type="number"
                    min="0"
                    step="1000"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* variants */}
            <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-700">
              <div className="mb-6 flex items-center justify-between border-b pb-2 dark:border-gray-600">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  🎨 رنگ‌بندی و عکس‌ها
                </h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                >
                  <span>+</span> افزودن رنگ
                </button>
              </div>

              <div className="space-y-6">
                {variants.map((variant, variantIndex) => (
                  <div
                    key={variant.id || variantIndex}
                    className="rounded-xl border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        رنگ {variantIndex + 1}
                      </h3>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(variantIndex)}
                          className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-1 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        >
                          <span>🗑️</span> حذف
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                          نام رنگ *
                        </label>
                        <input
                          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 transition-all placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:ring-blue-800"
                          placeholder="مثلاً: سفید، مشکی، آبی"
                          value={variant.color}
                          onChange={(e) =>
                            updateVariant(variantIndex, "color", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                          عکس‌های این رنگ *
                        </label>
                        <label
                          className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${uploading === variantIndex ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"}`}
                        >
                          <div className="flex flex-col items-center justify-center">
                            {uploading === variantIndex ? (
                              <>
                                <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent dark:border-blue-400"></div>
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                  در حال آپلود...
                                </p>
                              </>
                            ) : (
                              <>
                                <svg
                                  className="mb-3 h-8 w-8 text-gray-500 dark:text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                  />
                                </svg>
                                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold">
                                    برای آپلود کلیک کنید
                                  </span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  PNG, JPG, JPEG (حداکثر ۵MB)
                                </p>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) =>
                              handleVariantImageUpload(variantIndex, e)
                            }
                            disabled={uploading !== null}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {variant.previewUrls.length > 0 && (
                      <div className="mt-6">
                        <label className="mb-3 block text-sm font-medium text-gray-600 dark:text-gray-400">
                          عکس‌های آپلود شده ({variant.previewUrls.length})
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {variant.previewUrls.map((url, imgIndex) => (
                            <div key={imgIndex} className="group relative">
                              {/* ✅ Image component استفاده کن */}
                              <Image
                                src={url}
                                alt={`عکس ${imgIndex + 1}`}
                                width={96}
                                height={96}
                                className="rounded-lg border-2 border-gray-200 object-cover transition-colors group-hover:border-gray-400 dark:border-gray-600 dark:group-hover:border-gray-500"
                                quality={75}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeImage(variantIndex, imgIndex)
                                }
                                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white opacity-0 transition-all group-hover:opacity-100"
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

            {/* actions */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white transition-all hover:bg-blue-700 disabled:opacity-50 md:w-auto"
              >
                {saving ? "در حال ذخیره..." : "✅ ذخیره تغییرات"}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="w-full rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700 disabled:opacity-50 md:w-auto"
              >
                🗑 حذف محصول
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
