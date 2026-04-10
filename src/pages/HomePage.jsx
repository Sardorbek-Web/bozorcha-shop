import { Footprints, Shirt, Smartphone, Watch, Flame } from "lucide-react";
import MobileLayout from "../components/layout/MobileLayout";
import PromoBanner from "../components/ui/PromoBanner";
import SectionHeader from "../components/ui/SectionHeader";
import CategoryCard from "../components/ui/CategoryCard";
import ProductCard from "../components/ui/ProductCard";

const categories = [
  { id: 1, name: "Kiyimlar", subtitle: "Trend kolleksiya", icon: Shirt },
  { id: 2, name: "Oyoq kiyim", subtitle: "Qulay va zamonaviy", icon: Footprints },
  { id: 3, name: "Elektronika", subtitle: "Smart texnika", icon: Smartphone },
  { id: 4, name: "Aksessuarlar", subtitle: "Ko'rinishni to'ldiradi", icon: Watch },
];

const products = [
  {
    id: 1,
    name: "Nike uslubidagi zamonaviy krossovka",
    price: 299000,
    oldPrice: 359000,
    image: "https://placehold.co/400x400",
  },
  {
    id: 2,
    name: "Ayollar uchun premium sumka",
    price: 189000,
    oldPrice: 229000,
    image: "https://placehold.co/400x400",
  },
  {
    id: 3,
    name: "Wireless quloqchin",
    price: 149000,
    oldPrice: 179000,
    image: "https://placehold.co/400x400",
  },
  {
    id: 4,
    name: "Erkaklar oversize futbolkasi",
    price: 119000,
    oldPrice: 149000,
    image: "https://placehold.co/400x400",
  },
];

export default function HomePage() {
  return (
    <MobileLayout title="Bozorcha">
      <div className="space-y-6">
        <PromoBanner />

        <section>
          <SectionHeader title="Kategoriyalar" />
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                title={category.name}
                subtitle={category.subtitle}
                icon={category.icon}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight">Aksiya</h3>
            <div className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500">
              <Flame size={16} />
              Hot
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}