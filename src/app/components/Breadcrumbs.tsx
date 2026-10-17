import { ChevronRight } from "lucide-react";

export function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; onClick?: () => void }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1 min-w-0">
            {i > 0 && (
              <ChevronRight
                size={12}
                className="text-muted-foreground shrink-0"
                aria-hidden
              />
            )}
            {isLast ? (
              <span
                className="text-xs font-black text-foreground truncate max-w-[180px] sm:max-w-xs"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="text-xs font-semibold text-muted-foreground hover:text-[#009966] transition-colors truncate max-w-[120px] sm:max-w-xs"
              >
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
