
"use client";
import React, { useState, useEffect } from "react";
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
  // Adjust for Monday-first week (getDay() is 0 for Sunday)
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
  // Internal state for month/year navigation
  const [currentDate, setCurrentDate] = useState(value || today);

  // Update internal state only if the external value changes
  useEffect(() => {
    if (value && value.getTime() !== currentDate.getTime()) {
      setCurrentDate(value);
    }
  }, [value, currentDate]);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  function handleSelect(day: number) {
    const date = new Date(year, month, day);
    onChange?.(date);
  }

  function setDisplayMonth(newDate: Date) {
    setCurrentDate(newDate);
  }

  function prevMonth() {
    setDisplayMonth(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setDisplayMonth(new Date(year, month + 1, 1));
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
        {Array(firstDay).fill(null).map((_, i) => (
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
            value &&
            date.getDate() === value.getDate() &&
            date.getMonth() === value.getMonth() &&
            date.getFullYear() === value.getFullYear();
          return (
            <button
              key={day}
              onClick={() => handleSelect(day)}
              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-base transition-all duration-200 m-1
                ${isSelected ? "bg-green-500 text-white shadow-lg scale-110 border-2 border-green-400" : "bg-slate-700 text-white hover:bg-green-700 hover:scale-105"}
                ${isToday && !isSelected ? "border-2 border-green-400 font-extrabold" : ""}
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
