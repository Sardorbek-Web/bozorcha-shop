export default function CategoryCard({ title, subtitle, icon: Icon }) {
  return (
    <button className="card card-dark w-full p-4 text-left transition hover:-translate-y-0.5">
      <div className="icon-wrap">
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
    </button>
  );
}