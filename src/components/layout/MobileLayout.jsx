import { Home, Grid2x2, ShoppingCart, Heart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/catalog", label: "Katalog", icon: Grid2x2 },
  { to: "/cart", label: "Savatcha", icon: ShoppingCart },
  { to: "/favorites", label: "Sevimli", icon: Heart },
  { to: "/profile", label: "Profil", icon: User },
];

export default function MobileLayout({ title, children }) {
  const location = useLocation();

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-white text-gray-900 dark:bg-[#0b0b0f] dark:text-white">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-neutral-800 dark:bg-[#0b0b0f]/90">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
      </header>

      <main className="px-4 py-4">{children}</main>

      <nav className="fixed bottom-3 left-1/2 z-30 w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-[28px] border border-gray-200 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-neutral-800 dark:bg-[#111115]/95">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center rounded-2xl px-2 py-3 text-xs transition ${
                  active
                    ? "bg-violet-600 text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <Icon size={18} />
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}