import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SingleShoe from "@/components/Products/SingleShoe";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    }

    if (id) fetchProduct();
  }, [id]);

  if (!product)
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        در حال بارگذاری محصول...
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mt-15">
        <SingleShoe shoe={product} />
      </div>
    </div>
  );
}
