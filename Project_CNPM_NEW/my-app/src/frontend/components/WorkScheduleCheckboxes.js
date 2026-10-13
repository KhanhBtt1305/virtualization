// File: src/frontend/components/WorkScheduleCheckboxes.js
import React from 'react';
import "../QuanLyTaiXe.css"; // Dùng chung CSS

// Xuất các hằng số này để file khác dùng
export const DAYS_OF_WEEK_MAP = {
  MON: "T2", TUE: "T3", WED: "T4", THU: "T5", FRI: "T6", SAT: "T7", SUN: "CN"
};
export const DAYS_OF_WEEK_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function WorkScheduleCheckboxes({ selectedDays, onChange, disabled = false }) {
  const selectedSet = new Set(selectedDays ? selectedDays.split(',') : []);

  const handleCheck = (e) => {
    const { value, checked } = e.target;
    const currentSet = new Set(selectedSet);
    if (checked) {
      currentSet.add(value);
    } else {
      currentSet.delete(value);
    }
    const sortedDays = DAYS_OF_WEEK_ORDER.filter(day => currentSet.has(day));
    onChange(sortedDays.join(',')); 
  };

  return (
    <div className="form-group-checkbox-row">
      {DAYS_OF_WEEK_ORDER.map(dayKey => (
        <label key={dayKey}>
          <input
            type="checkbox"
            value={dayKey}
            checked={selectedSet.has(dayKey)}
            onChange={handleCheck}
            disabled={disabled}
          /> {DAYS_OF_WEEK_MAP[dayKey]}
        </label>
      ))}
    </div>
  );
}