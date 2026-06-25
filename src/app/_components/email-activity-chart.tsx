import { useState, useRef, useEffect, useMemo } from "react";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

export function EmailActivityChart() {
  const [data, setData] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDemo(localStorage.getItem("isDemoMode") === "true");
    }
  }, []);

  const mockActivityData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (13 - i));
      const counts = [12, 18, 5, 22, 14, 9, 15, 20, 11, 16, 7, 24, 19, 15];
      return {
        date: d.toISOString(),
        count: counts[i] || 10
      };
    });
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const activityQueryReal = api.gmail.getEmailActivity.useQuery(undefined, {
    enabled: mounted && !isDemo,
    staleTime: 5 * 60 * 1000,
  });

  const activityQuery = (isDemo ? {
    isLoading: false,
    error: null,
    data: mockActivityData,
    refetch: () => Promise.resolve()
  } : activityQueryReal) as typeof activityQueryReal;

  useEffect(() => {
    if (activityQuery.data) {
      const processedData = activityQuery.data.map((item, index, arr) => {
        const d = new Date(item.date);
        return {
          date: d,
          dayName: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()],
          fullDayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()],
          dateString: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          emails: item.count,
          heightPercentage: 0,
          isToday: index === arr.length - 1
        };
      });

      const max = Math.max(...processedData.map(d => d.emails), 10); // at least 10 for visual scale
      processedData.forEach(d => {
        d.heightPercentage = Math.round((d.emails / max) * 100);
      });

      setData(processedData);
      if (selectedIndex === null) {
        setSelectedIndex(processedData.length - 1);
      }
    }
  }, [activityQuery.data]);
  
  useEffect(() => {
    if (scrollRef.current && data.length > 0) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [data]);

  const selectedDay = selectedIndex !== null && data[selectedIndex] ? data[selectedIndex] : null;

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Email Activity</h3>
        </div>
      </div>

      <div className="flex-1 flex flex-col mt-auto border-b border-border/50 relative overflow-hidden">
        <div className="absolute left-0 right-0 top-1/4 h-px bg-border/50 pointer-events-none z-0"></div>
        <div className="absolute left-0 right-0 top-2/4 h-px bg-border/50 pointer-events-none z-0"></div>
        <div className="absolute left-0 right-0 top-3/4 h-px bg-border/50 pointer-events-none z-0"></div>
        
        {activityQuery.isLoading ? (
          <div className="flex items-center justify-center flex-1 h-full min-h-[150px] z-10 relative bg-bg-elevated">
            <Loader2 className="w-10 h-10 animate-spin text-text-secondary opacity-50" />
          </div>
        ) : (
          <div 
            ref={scrollRef}
            className="flex items-end gap-6 px-4 pt-12 pb-6 overflow-x-auto scrollbar-thin relative z-10 w-full group/chart"
          >
            {data.map((day, i) => {
              const isSelected = selectedIndex === i;
              return (
              <div 
                key={i} 
                onClick={() => setSelectedIndex(i)}
                className="flex flex-col items-center gap-3 group relative flex-shrink-0 cursor-pointer"
              >
                <div className="flex justify-center h-32 relative w-6">
                  <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1c1c28] dark:bg-zinc-800 text-white text-[10px] py-1.5 px-2 rounded-lg whitespace-nowrap shadow-md flex flex-col gap-0.5 z-50 transition-opacity pointer-events-none items-center ${isSelected ? 'opacity-100 group-hover/chart:opacity-0 group-hover:!opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <span className="font-bold flex items-center gap-1">{day.emails} Emails</span>
                    <span className="text-zinc-400">{day.isToday ? "Today" : day.dateString}</span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1c1c28] dark:bg-zinc-800 rotate-45"></div>
                  </div>
                  
                  <div 
                    className={`w-3.5 rounded-t-full transition-all mt-auto shadow-sm group-hover:!bg-[#7b8bc6] ${isSelected ? 'bg-[#7b8bc6]' : 'bg-black/10 dark:bg-white/10'}`} 
                    style={{ height: `${Math.max(10, day.heightPercentage)}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-medium w-6 text-center transition-colors group-hover:text-text-primary ${isSelected ? 'text-text-primary font-bold' : 'text-text-secondary'}`}>
                  {day.dayName}
                </span>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
