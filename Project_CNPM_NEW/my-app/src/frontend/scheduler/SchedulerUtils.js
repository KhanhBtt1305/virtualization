// File: src/frontend/scheduler/schedulerUtils.js

export const DAY_KEY_MAP = [
    'CN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'
];

export const generateWeekDays = (weekOffset = 0) => {
    const days = [];
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (weekOffset * 7));
    
    // Logic tính toán start of week (Thứ 2)
    const currentDayOfWeek = targetDate.getDay(); // 0 = CN, 1 = T2, ...
    const dayOffset = (currentDayOfWeek === 0) ? -6 : (1 - currentDayOfWeek);
    
    const start = new Date(targetDate);
    start.setDate(targetDate.getDate() + dayOffset); 
    
    const dayOfWeekNames = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

    for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i); 
        
        const d = String(day.getDate()).padStart(2, '0');
        const m = String(day.getMonth() + 1).padStart(2, '0');
        const dayName = dayOfWeekNames[day.getDay()];
        const key = DAY_KEY_MAP[day.getDay()];
        
        // Tạo ISO date string mà không bị ảnh hưởng bởi múi giờ (YYYY-MM-DD)
        const year = day.getFullYear();
        const dateISO = `${year}-${m}-${d}`;
        
        days.push({ label: `${dayName} (${d}/${m})`, key: key, dateISO: dateISO });
    }
    return days;
};