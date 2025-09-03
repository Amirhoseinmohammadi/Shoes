import Image from "next/image";
import { Shoe } from "@/types/shoe";

const SingleShoe = ({ shoe }: { shoe: Shoe }) => {
  const { name, brand, color, size, price, image } = shoe;

  return (
    <div className="w-full">
      <div className="wow fadeInUp" data-wow-delay=".15s">
        {/* تصویر کفش */}
        <div className="relative mb-6 h-[200px] w-full overflow-hidden rounded-xl">
          <Image
            src={image}
            alt={name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* اطلاعات کفش */}
        <h3 className="mb-2 text-lg font-bold text-black dark:text-white">
          {name}
        </h3>
        <p className="mb-1 text-sm text-gray-500">
          {brand} • {color}
        </p>
        <p className="mb-2 text-sm text-gray-600">سایز: {size.join("، ")}</p>
        <p className="text-base font-semibold text-indigo-600">{price}</p>
      </div>
    </div>
  );
};

export default SingleShoe;
