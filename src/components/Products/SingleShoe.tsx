"use client";

import { useState, useMemo, memo } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Shoe } from "@/types/shoe";
import { ShoppingCartIcon, EyeIcon } from "@heroicons/react/24/outline";

interface AugmentedShoe extends Shoe {
  color?: string;
  images?: { url: string }[];
}

interface SingleShoeProps {
  shoe: AugmentedShoe;
}

const colorMap: Record<string, string> = {
  سفید: "#FFFFFF",
  مشکی: "#000000",
  کرم: "#F5F5DC",
  آبی: "#007BFF",
  قرمز: "#EF4444",
};

const ColorButton = memo(
  ({
    color,
    isActive,
    onClick,
  }: {
    color: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`h-5 w-5 rounded-full border-2 transition-all ${
        isActive ? "border-cyan-500 ring-2 ring-cyan-300" : "border-gray-300"
      }`}
      style={{ backgroundColor: colorMap[color] || "#ccc" }}
      aria-label={`انتخاب رنگ ${color}`}
    />
  ),
);

ColorButton.displayName = "ColorButton";

const ViewButton = memo(({ shoeId }: { shoeId: number }) => (
  <Link
    href={`/products/${shoeId}`}
    className="flex items-center justify-center rounded-lg border px-2.5 py-2 text-gray-600 hover:border-cyan-400 hover:text-cyan-600"
    aria-label="مشاهده محصول"
  >
    <EyeIcon className="h-5 w-5" />
  </Link>
));

ViewButton.displayName = "ViewButton";

const AddToCartButton = memo(
  ({ loading, onClick }: { loading: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <ShoppingCartIcon className="h-5 w-5" />
      )}
    </button>
  ),
);

AddToCartButton.displayName = "AddToCartButton";

export default memo(function SingleShoe({ shoe }: SingleShoeProps) {
  const { addItem, loading: cartLoading } = useCart();
  const params = useParams();

  const [selectedVariant, setSelectedVariant] = useState(0);

  const currentShoe = shoe as AugmentedShoe;

  const variants = useMemo(() => currentShoe?.variants ?? [], [currentShoe]);

  const hasVariants = variants.length > 0;
  const variant = hasVariants ? variants[selectedVariant] : null;

  const selectedColor = variant?.color || currentShoe?.color || undefined;

  const images = useMemo(
    () =>
      variant?.images?.map((i) => i.url) ||
      currentShoe?.images?.map((i) => i.url) ||
      [],
    [variant, currentShoe],
  );

  const selectedImage = images[0] || "/images/default-shoe.png";

  const displayPrice = variant?.price ?? currentShoe?.price ?? 0;

  const isCurrentPage = params?.id?.toString() === currentShoe?.id?.toString();

  const handleAddToCart = async () => {
    if (!currentShoe?.id) return;

    await addItem({
      productId: currentShoe.id,
      quantity: 1,
      color: selectedColor,
    });
  };

  if (!currentShoe?.id) return null;

  return (
    <article className="rounded-2xl bg-white shadow dark:bg-gray-800">
      <div className="relative aspect-square">
        <Image
          src={selectedImage}
          alt={currentShoe.name}
          fill
          className="object-cover"
        />

        {!isCurrentPage && (
          <Link
            href={`/products/${currentShoe.id}`}
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100"
          >
            <EyeIcon className="h-8 w-8 text-white" />
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <h3 className="text-sm font-bold">{currentShoe.name}</h3>

        {hasVariants && (
          <div className="flex gap-2">
            {variants.map((v, idx) => (
              <ColorButton
                key={v.id ?? idx}
                color={v.color}
                isActive={idx === selectedVariant}
                onClick={() => setSelectedVariant(idx)}
              />
            ))}
          </div>
        )}

        <div className="font-bold">{displayPrice.toLocaleString()} تومان</div>

        <div className="flex gap-2">
          <AddToCartButton loading={cartLoading} onClick={handleAddToCart} />
          {!isCurrentPage && <ViewButton shoeId={currentShoe.id} />}
        </div>
      </div>
    </article>
  );
});
