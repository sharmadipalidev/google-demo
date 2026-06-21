"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area"; // We might not have this, we can just use native scroll

export function DateTimePicker({
  value,
  onChange,
}: {
  value: string; // ISO string
  onChange: (value: string) => void;
}) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [time, setTime] = React.useState<string>(
    value ? format(new Date(value), "HH:mm") : "00:00"
  );

  React.useEffect(() => {
    if (value) {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        setDate(parsedDate);
        setTime(format(parsedDate, "HH:mm"));
      }
    }
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    
    // Merge selected date with current time
    const [hours, minutes] = time.split(":").map(Number);
    const newDateTime = new Date(selectedDate);
    newDateTime.setHours(hours || 0, minutes || 0, 0, 0);
    
    // Return ISO format but adjust to local time to act like datetime-local
    // datetime-local expects "YYYY-MM-DDThh:mm" format, not full ISO with Z
    const yyyy = newDateTime.getFullYear();
    const mm = String(newDateTime.getMonth() + 1).padStart(2, '0');
    const dd = String(newDateTime.getDate()).padStart(2, '0');
    const hh = String(newDateTime.getHours()).padStart(2, '0');
    const min = String(newDateTime.getMinutes()).padStart(2, '0');
    
    onChange(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    
    if (date) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDateTime = new Date(date);
      newDateTime.setHours(hours || 0, minutes || 0, 0, 0);
      
      const yyyy = newDateTime.getFullYear();
      const mm = String(newDateTime.getMonth() + 1).padStart(2, '0');
      const dd = String(newDateTime.getDate()).padStart(2, '0');
      const hh = String(newDateTime.getHours()).padStart(2, '0');
      const min = String(newDateTime.getMinutes()).padStart(2, '0');
      
      onChange(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
    }
  };

  // Generate 24h time options in 15 minute intervals
  const timeOptions = React.useMemo(() => {
    const options = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 15) {
        const hour = i.toString().padStart(2, "0");
        const minute = j.toString().padStart(2, "0");
        options.push(`${hour}:${minute}`);
      }
    }
    return options;
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-[#1a1a1a] dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-[#1a1a1a] dark:text-white hover:bg-black/5 dark:hover:bg-white/5",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") + " " + time : <span>Pick date & time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-[#1a1a1a] border-black/10 dark:border-white/10">
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-black/10 dark:divide-white/10">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            className="p-3"
          />
          <div className="p-3 flex flex-col justify-center items-center bg-gray-50 dark:bg-zinc-900/50">
            <span className="text-xs font-semibold mb-2 text-[#1a1a1a] dark:text-white/70 uppercase tracking-wider">Time</span>
            <select
              value={time}
              onChange={handleTimeChange}
              className="p-2 bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 rounded-md text-sm outline-none focus:ring-2 focus:ring-brand-green w-[100px] text-center"
              size={5}
              style={{ overflowY: 'auto' }}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t} className="p-1 cursor-pointer">
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
