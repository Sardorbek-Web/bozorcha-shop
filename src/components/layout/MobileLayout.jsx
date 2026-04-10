import { Link, useLocation } from "react-router-dom";
import { House, Grid2x2, ShoppingCart, Heart, User } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";

export default function MobileLayout({ title, children }) {
  const location = useLocation();
  const { getCount } = useCartStore();

  const cartCount = getCount();

  const navItems = [
    { to: "/", label: "Home", icon: House },
    { to: "/catalog", label: "Katalog", icon: Grid2x2 },
    { to: "/cart", label: "Savatcha", icon: ShoppingCart },
    { to: "/favorites", label: "Sevimli", icon: Heart },
    { to: "/profile", label: "Profil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-gray-900 dark:bg-neutral-950 dark:text-white">
      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/80 px-4 py-4 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">{title}</h1>
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </div>
      </header>

      <main className="p-4 pb-28">{children}</main>

      <nav className="fixed bottom-3 left-0 right-0 z-40">
        <div className="px-3">
          <div className="grid grid-cols-5 rounded-[28px] border border-white/70 bg-white/90 p-2 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/90">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              const isCart = item.to === "/cart";

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] transition ${
                    active
                      ? "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <div className="relative">
                    <Icon size={20} />
                    {isCart && cartCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}