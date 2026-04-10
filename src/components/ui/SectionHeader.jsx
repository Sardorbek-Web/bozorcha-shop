import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function SectionHeader({ title, to = "/catalog", actionText = "Barchasi" }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-lg font-bold tracking-tight">{title}</h3>
      <Link
        to={to}
        className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600"
      >
        {actionText}
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}