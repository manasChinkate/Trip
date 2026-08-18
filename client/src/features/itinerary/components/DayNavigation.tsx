import type { ItineraryDay } from "../services/itineraryApi";

interface DayNavigationProps {
  days: ItineraryDay[];
  activeDayId: number | null;
  onSelectDay: (dayId: number) => void;
}

export function DayNavigation({
  days,
  activeDayId,
  onSelectDay,
}: DayNavigationProps) {
  if (!days || days.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2.5 min-w-max">
        {days.map((day) => {
          const isActive = day.id === activeDayId;
          const formattedDate = day.date
            ? new Date(day.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                weekday: "short",
              })
            : `Day ${day.dayNumber}`;

          return (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                  : "bg-card hover:bg-muted/60 text-muted-foreground border-border/60 hover:text-foreground"
              }`}
            >
              <div
                className={`size-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                D{day.dayNumber}
              </div>
              <div className="flex flex-col text-left">
                <span className="leading-tight font-bold">{day.title || `Day ${day.dayNumber}`}</span>
                <span className="text-[11px] opacity-80 font-normal">{formattedDate}</span>
              </div>
              {day.items && day.items.length > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {day.items.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
