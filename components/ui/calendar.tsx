"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
}

export function Calendar({ value, onChange, className }: CalendarProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(value || today);

  useEffect(() => {
    if (value && value.getTime() !== currentDate.getTime()) {
      setCurrentDate(value);
    }
  }, [value]);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  function handleSelect(day: number) {
    const date = new Date(year, month, day);
    onChange?.(date);
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  return (
    <div className={`w-full bg-transparent ${className ?? ""}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-200">
          {MONTHS[month]} <span className="text-gray-400">{year}</span>
        </h3>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-[10px] uppercase font-black text-gray-500 py-1">
            {wd}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array(firstDay).fill(null).map((_, i) => (
          <div key={"empty-" + i} className="aspect-square"></div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
          const isSelected =
            value &&
            date.getDate() === value.getDate() &&
            date.getMonth() === value.getMonth() &&
            date.getFullYear() === value.getFullYear();

          return (
            <button
              key={day}
              onClick={() => handleSelect(day)}
              className={`
                aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all relative group
                ${isSelected
                  ? "bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)] z-10 scale-105"
                  : "text-gray-300 hover:bg-white/5 hover:text-white hover:scale-105"}
                ${isToday && !isSelected ? "after:content-[''] after:absolute after:bottom-1.5 after:w-1 after:h-1 after:bg-green-500 after:rounded-full" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
