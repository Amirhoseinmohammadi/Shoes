"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface VariantForm {
  color: string;
  images: File[];
  previewUrls: string[];
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
          فقط کاربران ادمین می‌توانند محصول جدید اضافه کنند.
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

export default function NewProductPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

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
  const [formLoading, setFormLoading] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const loading = false;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      console.warn("❌ Non-admin user tried to access new product page");
    }
  }, [loading, isAdmin]);

  const addVariant = () => {
    setVariants([...variants, { color: "", images: [], previewUrls: [] }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
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

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`خطا در آپلود: ${res.status}`);
        }

        const result = await res.json();

        if (result.success) {
          uploadedUrls.push(result.imageUrl);
        } else {
          setError(result.message || "خطا در آپلود عکس");
        }
      }

      if (uploadedUrls.length > 0) {
        const updated = [...variants];
        updated[variantIndex].previewUrls = [
          ...updated[variantIndex].previewUrls,
          ...uploadedUrls,
        ];
        setVariants(updated);
      }
    } catch (err) {
      console.error("خطا در آپلود عکس:", err);
      setError("خطا در آپلود عکس‌ها. لطفاً دوباره تلاش کنید.");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    const updated = [...variants];
    updated[variantIndex].previewUrls = updated[
      variantIndex
    ].previewUrls.filter((_, i) => i !== imageIndex);
    setVariants(updated);
  };

  const validateForm = (): boolean => {
    if (
      !form.name.trim() ||
      !form.brand.trim() ||
      !form.price ||
      !form.category
    ) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormLoading(true);
    setError(null);

    try {
      const productData = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        variants: variants.map((variant) => ({
          color: variant.color,
          images: variant.previewUrls.map((url) => ({ url })),
        })),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "خطا در ایجاد محصول");
      }

      const result = await res.json();
      

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("خطا:", err);
      setError(err.message || "خطا در افزودن محصول");
    } finally {
      setFormLoading(false);
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
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!isAdmin) {
    return <AccessDeniedPage />;
  }

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
            ➕ افزودن محصول جدید
          </h1>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
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
                    دسته‌بندی *
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-800"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    required
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

            {/* واریانت‌ها */}
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
                  <span>+</span>
                  افزودن رنگ
                </button>
              </div>

              <div className="space-y-6">
                {variants.map((variant, variantIndex) => (
                  <div
                    key={variantIndex}
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
                          <span>🗑️</span>
                          حذف
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
                          className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                            uploading === variantIndex
                              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                          }`}
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

                    {/* پیشنمایش عکس‌ها */}
                    {variant.previewUrls.length > 0 && (
                      <div className="mt-6">
                        <label className="mb-3 block text-sm font-medium text-gray-600 dark:text-gray-400">
                          عکس‌های آپلود شده ({variant.previewUrls.length})
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {variant.previewUrls.map((url, imgIndex) => (
                            <div key={imgIndex} className="group relative">
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

            <button
              type="submit"
              disabled={formLoading || uploading !== null}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {formLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  در حال افزودن محصول...
                </span>
              ) : (
                "✅ افزودن محصول"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
