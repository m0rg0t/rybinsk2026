import { Search, Star } from "lucide-react";
import { FilterType } from "@/types";
import { ViewMode } from "./EventList";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  statusFilter: FilterType;
  onStatusFilterChange: (filter: FilterType) => void;
  locations: Array<{ id: string; name: string; count: number }>;
  currentEventsCount: number;
  futureEventsCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  favoritesCount: number;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
}

function chipClass(active: boolean): string {
  return cn(
    "px-3 py-1.5 font-mono text-xs transition-colors border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
    active
      ? "border-ink bg-ink text-paper"
      : "border-gold-soft bg-transparent text-ink hover:bg-paper-deep"
  );
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  statusFilter,
  onStatusFilterChange,
  locations,
  currentEventsCount,
  futureEventsCount,
  viewMode,
  onViewModeChange,
  favoritesCount,
  showFavoritesOnly,
  onToggleFavoritesOnly,
}: FilterBarProps) {
  return (
    <div className="space-y-4 border border-gold-soft bg-paper-card p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          placeholder="Поиск по программе…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border border-gold-soft bg-paper py-2 pl-10 pr-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex" role="group" aria-label="Вид программы">
          <button
            className={cn(chipClass(viewMode === "byPlace"), "border-r-0")}
            onClick={() => onViewModeChange("byPlace")}
          >
            По площадкам
          </button>
          <button
            className={chipClass(viewMode === "byTime")}
            onClick={() => onViewModeChange("byTime")}
          >
            По времени
          </button>
        </div>

        <button
          className={cn(
            chipClass(showFavoritesOnly),
            "flex items-center gap-1.5",
            !showFavoritesOnly && "text-gold"
          )}
          onClick={onToggleFavoritesOnly}
          aria-pressed={showFavoritesOnly}
        >
          <Star className={cn("h-3 w-3", !showFavoritesOnly && "fill-gold")} />
          Моё{favoritesCount > 0 && ` · ${favoritesCount}`}
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Фильтр по времени">
        <button className={chipClass(statusFilter === "all")} onClick={() => onStatusFilterChange("all")}>
          Вся программа
        </button>
        <button className={chipClass(statusFilter === "current")} onClick={() => onStatusFilterChange("current")}>
          <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle", statusFilter === "current" ? "bg-paper" : "bg-kinovar")} />
          Сейчас{currentEventsCount > 0 && ` · ${currentEventsCount}`}
        </button>
        <button className={chipClass(statusFilter === "future")} onClick={() => onStatusFilterChange("future")}>
          <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle", statusFilter === "future" ? "bg-paper" : "bg-river")} />
          Скоро{futureEventsCount > 0 && ` · ${futureEventsCount}`}
        </button>
      </div>

      {viewMode === "byPlace" && (
        <div className="rule-hairline pt-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Фильтр по площадкам">
            <button className={chipClass(selectedLocation === "all")} onClick={() => onLocationChange("all")}>
              Все площадки
            </button>
            {locations.map((location) => (
              <button
                key={location.id}
                className={chipClass(selectedLocation === location.id)}
                onClick={() => onLocationChange(location.id)}
              >
                {location.name}
                {location.count > 0 && (
                  <span className={cn("ml-1.5", selectedLocation === location.id ? "text-gold-soft" : "text-ink-muted")}>
                    {location.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
