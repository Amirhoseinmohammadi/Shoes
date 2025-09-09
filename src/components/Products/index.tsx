import SectionTitle from "../Common/SectionTitle";
import SingleShoe from "./SingleShoe.tsx";
import shoesData from "./shoesData";

const Shoes = () => {
  return (
    <section
      id="shoes"
      className="bg-white py-16 md:py-20 lg:py-28 dark:bg-gray-900"
    >
      <div className="container">
        <SectionTitle
          title="لیست کفش‌ها"
          paragraph="در این بخش می‌توانید جدیدترین مدل‌های کفش ورزشی و روزمره را مشاهده کنید."
          center
        />

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {shoesData.map((shoe) => (
            <SingleShoe key={shoe.id} shoe={shoe} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Shoes;
