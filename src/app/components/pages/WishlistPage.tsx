import { Heart } from "lucide-react";
import { CardGrid } from "../cards/CardGrid";
import { PRODUCTS } from "../data/index";
import type { Prod } from "../types/index";

export function WishlistPage({ wish, onWish, onAdd, onView }: {
  wish:Set<number>; onWish:(id:number)=>void; onAdd:(p:Prod)=>void; onView:(p:Prod)=>void;
}) {
  const items = PRODUCTS.filter(p => wish.has(p.id));
  if (items.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Heart size={64} strokeWidth={1} className="text-muted-foreground"/>
      <h2 className="text-xl font-black text-foreground">Your Wishlist is Empty</h2>
      <p className="text-muted-foreground text-sm">Save items you love for later</p>
    </div>
  );
  return (
    <div>
      <h2 className="text-xl font-black text-foreground mb-5">❤️ My Wishlist ({items.length} items)</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(p => <CardGrid key={p.id} p={p} onAdd={onAdd} onWish={onWish} wished={true} onView={onView}/>)}
      </div>
    </div>
  );
}
