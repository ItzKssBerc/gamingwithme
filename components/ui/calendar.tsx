
"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["H", "K", "Sz", "Cs", "P", "Szo", "V"];
const MONTHS = [
  "Január", "Február", "Március", "Április", "Május", "Június",
  "Július", "Augusztus", "Szeptember", "Október", "November", "December"
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
}

export function Calendar({ value, onChange, className }: CalendarProps) {
  const today = new Date();
  const [selected, setSelected] = useState<Date | undefined>(value);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  function handleSelect(day: number) {
    const date = new Date(year, month, day);
    setSelected(date);
    onChange?.(date);
  }

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  return (
  <div className={`rounded-xl border-2 border-green-500 shadow-green-500/20 shadow-lg bg-slate-900 p-4 w-full max-w-sm mx-auto ${className ?? ""}`}> 
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-primary/20 transition">
          <ChevronLeft className="h-5 w-5 text-primary" />
        </button>
  <div className="text-lg font-bold text-green-400">
          {MONTHS[month]} {year}
        </div>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-primary/20 transition">
          <ChevronRight className="h-5 w-5 text-primary" />
        </button>
      </div>
  <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-green-400 font-semibold">{wd}</div>
        ))}
      </div>
  <div className="grid grid-cols-7 gap-1">
        {Array(firstDay === 0 ? 6 : firstDay - 1).fill(null).map((_, i) => (
          <div key={"empty-" + i}></div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
          const isSelected =
            selected &&
            date.getDate() === selected.getDate() &&
            date.getMonth() === selected.getMonth() &&
            date.getFullYear() === selected.getFullYear();
          return (
            <button
              key={day}
              onClick={() => handleSelect(day)}
              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-base transition-all duration-200 m-1
                ${isSelected ? "bg-green-500 text-white shadow-lg scale-110 border-2 border-green-400" : "bg-slate-700 text-white hover:bg-green-700 hover:scale-105"}
                ${isToday ? "border-2 border-green-400 font-extrabold" : ""}
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
