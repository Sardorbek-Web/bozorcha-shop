import { ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function PromoBanner() {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 p-5 text-white shadow-soft">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-8 left-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%)]" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
          <Sparkles size={14} />
          Bozorcha Premium
        </div>

        <h2 className="mt-4 text-2xl font-bold leading-tight">
          Trend mahsulotlarni
          <br />
          qulay narxda toping
        </h2>

        <p className="mt-2 max-w-[270px] text-sm leading-5 text-white/85">
          Kiyimlar, krossovkalar, elektronika va aksessuarlar bir joyda.
        </p>

        <Link
          to="/catalog"
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-semibold text-violet-700"
        >
          Xaridni boshlash
          <ChevronRight size={18} />
        </Link>
      </div>
    </section>
  );
}