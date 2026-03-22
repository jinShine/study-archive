import { WATCH_COLLECTION } from "@/app/_lib/store";
import ThemeWrapper from "@/components/ThemeWrapper";
import AddToCart from "@/components/AddToCart";
export default async function ShopPage() {
  return (
    <ThemeWrapper>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {WATCH_COLLECTION.map(watch => (
          <div key={watch.id} className="p-10 border-2 border-slate-100 rounded-[3rem]">
            <p className="text-xs font-bold text-blue-500 mb-2">{watch.spec}</p>
            <h3 className="text-3xl font-black mb-2">{watch.name}</h3>
            <p className="text-xl italic opacity-50">{watch.price}</p>
            <AddToCart />
          </div>
        ))}
      </div>
    </ThemeWrapper>
  );
}
