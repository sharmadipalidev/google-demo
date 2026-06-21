import { useState, useRef, useEffect } from "react";

// Generate 30 days of mock data
const generateMockData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    data.push({
      date: d,
      dayName: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()],
      fullDayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()],
      dateString: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      emails: Math.floor(Math.random() * 80) + 20, // 20 to 100
      heightPercentage: 0, // Will calculate based on max
      isToday: i === 0
    });
  }
  
  const max = Math.max(...data.map(d => d.emails));
  data.forEach(d => {
    d.heightPercentage = Math.round((d.emails / max) * 100);
  });
  
  return data;
};

export function EmailActivityChart() {
  const [data, setData] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  useEffect(() => {
    const mockData = generateMockData();
    setData(mockData);
    setSelectedIndex(mockData.length - 1); // Select today by default
  }, []);
  
  useEffect(() => {
    // Scroll to the rightmost (latest day) when data loads
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
          <p className="text-sm font-medium text-text-secondary flex items-center gap-1 mt-1">
            <span className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded p-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black dark:text-white"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg></span>
            <span className="text-text-primary">+3%</span> <span className="text-text-secondary text-xs font-normal">Increase than last week</span>
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col mt-auto border-b border-border/50 relative overflow-hidden">
        {/* Y Axis Lines */}
        <div className="absolute left-0 right-0 top-1/4 h-px bg-border/50 pointer-events-none z-0"></div>
        <div className="absolute left-0 right-0 top-2/4 h-px bg-border/50 pointer-events-none z-0"></div>
        <div className="absolute left-0 right-0 top-3/4 h-px bg-border/50 pointer-events-none z-0"></div>
        
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
                {/* Tooltip */}
                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1c1c28] dark:bg-zinc-800 text-white text-[10px] py-1.5 px-2 rounded-lg whitespace-nowrap shadow-md flex flex-col gap-0.5 z-50 transition-opacity pointer-events-none items-center ${isSelected ? 'opacity-100 group-hover/chart:opacity-0 group-hover:!opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <span className="font-bold flex items-center gap-1">{day.emails} Emails</span>
                  <span className="text-zinc-400">{day.isToday ? "Today" : day.dateString}</span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1c1c28] dark:bg-zinc-800 rotate-45"></div>
                </div>
                
                {/* Bar */}
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
      </div>
    </div>
  );
}
