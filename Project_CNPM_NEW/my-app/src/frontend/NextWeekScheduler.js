

import React, { useState, useEffect, useMemo } from "react";
import "./NextWeekScheduler.css"; 

import { generateWeekDays } from "./scheduler/SchedulerUtils";
import SchedulerTabFastMatch from "./scheduler/SchedulerTabFastMatch";
import SchedulerTabDetailed from "./scheduler/SchedulerTabDetailed";
import SchedulerTabSummary from "./scheduler/SchedulerTabSummary";


export default function NextWeekScheduler({ isOpen, onClose, drivers = [] }) {

    // 1. STATE CHÍNH 
    const [mainTab, setMainTab] = useState('currentWeek');
    const [subTab, setSubTab] = useState('detailed-matrix');

    const [daysOfWeek, setDaysOfWeek] = useState(() => generateWeekDays(0)); 
    
    const [vehicles, setVehicles] = useState([]);
    const [scheduleResult, setScheduleResult] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [scheduleMatrix, setScheduleMatrix] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    
    const [fastAssignSummary, setFastAssignSummary] = useState(null);
    
    // === 🔹 STATE MỚI: Theo dõi trạng thái "Đang xếp lịch" ===
    const [isGenerating, setIsGenerating] = useState(false);
    // =====================================================

    // 2. LOGIC TÍNH TOÁN 
    const totalBusShifts = vehicles.length * 7;
    const totalDriverShifts = useMemo(() => {
      if (!drivers) return 0;
      return drivers.reduce((sum, driver) => {
        if (driver.work_schedule) {
          return sum + driver.work_schedule.split(',').length;
        }
        return sum;
      }, 0);
    }, [drivers]); 
    const shiftDifference = totalDriverShifts - totalBusShifts;

    // 3. CÁC HÀM XỬ LÝ STATE 
    
    useEffect(() => {
        if (mainTab === 'currentWeek') {
            setDaysOfWeek(generateWeekDays(0)); 
        } else { 
            setDaysOfWeek(generateWeekDays(1)); 
        }
        setFastAssignSummary(null);
    }, [mainTab]); 
    
    
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setScheduleMatrix({}); 
            setFastAssignSummary(null); 

            const startDate = daysOfWeek[0].dateISO; 
            const endDate = daysOfWeek[6].dateISO; 

            const secureFetch = (url) => {
                return fetch(url).then(res => {
                    if (!res.ok) {
                        throw new Error(`Server error: ${res.status}`);
                    }
                    return res.json();
                });
            };

            const fetchVehicles = secureFetch('http://localhost:5000/api/buses');
            const fetchSchedules = secureFetch(`http://localhost:5000/api/schedules?startDate=${startDate}&endDate=${endDate}`);

            Promise.all([fetchVehicles, fetchSchedules])
                .then(([vehiclesData, schedulesData]) => {
                    let loadedVehicles = [];
                    if (Array.isArray(vehiclesData)) {
                        loadedVehicles = vehiclesData;
                        setVehicles(vehiclesData);
                    } else {
                        setVehicles([]);
                    }
                    
                    const newMatrix = {};
                    for (const vehicle of loadedVehicles) {
                        newMatrix[vehicle.id] = {};
                        for (const day of daysOfWeek) {
                            newMatrix[vehicle.id][day.key] = ""; 
                        }
                    }

                    if (typeof schedulesData === 'object' && !Array.isArray(schedulesData)) {
                        setScheduleResult(schedulesData);
                        for (const dayLabel in schedulesData) { 
                            const dayObj = daysOfWeek.find(d => d.label === dayLabel);
                            if (dayObj) {
                                const dayKey = dayObj.key; 
                                const schedulesOnDay = schedulesData[dayLabel];
                                for (const schedule of schedulesOnDay) {
                                    if (newMatrix[schedule.busId]) {
                                        newMatrix[schedule.busId][dayKey] = schedule.driverId || "";
                                    }
                                }
                            }
                        }
                    } else {
                        setScheduleResult({});
                    }
                    setScheduleMatrix(newMatrix);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Lỗi khi fetch data cho Scheduler:", err);
                    alert("Không thể tải dữ liệu lịch. Vui lòng kiểm tra terminal backend.");
                    setIsLoading(false);
                });
        }
    }, [isOpen, daysOfWeek]); 

    if (!isOpen) {
        return null;
    }

    const getAvailableDrivers = (currentBusId, dayKey) => {
        if (!drivers || drivers.length === 0) {
            return [];
        }
        const baseAvailableDrivers = drivers.filter(d => 
            d.work_schedule && d.work_schedule.includes(dayKey) && d.status === 'Rảnh'
        );
        const assignedDriversInColumn = new Set();
        for (const vehicle of vehicles) {
            if (vehicle.id !== currentBusId) {
                const assignedDriverId = scheduleMatrix[vehicle.id]?.[dayKey];
                if (assignedDriverId) {
                    assignedDriversInColumn.add(assignedDriverId);
                }
            }
        }
        return baseAvailableDrivers.filter(driver => !assignedDriversInColumn.has(driver.id));
    };

    const handleMatrixChange = (busId, dayKey, driverId) => {
        setScheduleMatrix(prevMatrix => ({
            ...prevMatrix,
            [busId]: {
                ...prevMatrix[busId],
                [dayKey]: driverId
            }
        }));
        setFastAssignSummary(null); 
    };

    // === 🔹 CẬP NHẬT: HÀM NÀY SẼ GỌI API BACKEND ===
    const handleFullWeekMatch = async () => {
        console.log("Bắt đầu gọi API xếp lịch nhanh...");
        setIsGenerating(true); // Bật loading
        setFastAssignSummary(null); 

        try {
            const response = await fetch('http://localhost:5000/api/schedules/generate-fast-match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    daysOfWeek: daysOfWeek // Gửi 7 ngày trong tuần lên cho backend
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Lỗi từ server');
            }

            const data = await response.json();

            // 5. Cập nhật state ma trận (cho Tab 2)
            setScheduleMatrix(data.newMatrix);

            // 6. Cập nhật state tóm tắt (cho Tab 1)
            setFastAssignSummary(data.fastAssignSummary);

            setIsGenerating(false); // Tắt loading

        } catch (err) {
            console.error("Lỗi khi gọi API xếp lịch nhanh:", err);
            alert(`Xếp lịch nhanh thất bại: ${err.message}`);
            setIsGenerating(false); // Tắt loading khi lỗi
        }
    };
    // ===========================================

    // (selectMainTab - giữ nguyên)
    const selectMainTab = (tab) => {
        setMainTab(tab);
        setFastAssignSummary(null); 
        if (tab === 'currentWeek') {
            setSubTab('detailed-matrix');
        } else {
            setSubTab('fast-match');
        }
    }
    
    const handleSaveSchedule = async () => {
        setIsSaving(true);
        try {
            const startDate = daysOfWeek[0].dateISO;
            const endDate = daysOfWeek[6].dateISO;
            
            const schedulesToSave = [];
            for (const busId in scheduleMatrix) {
                if (vehicles.some(v => v.id === busId)) {
                    for (const dayKey in scheduleMatrix[busId]) {
                        const driverId = scheduleMatrix[busId][dayKey];
                        const dayObj = daysOfWeek.find(d => d.key === dayKey);
                        
                        // CHỈ LƯU KHI CÓ DRIVER ID ===
                        // Kiểm tra: Phải có dayObj VÀ driverId không được rỗng
                        if (dayObj && driverId && driverId !== "") {
                            schedulesToSave.push({
                                bus_id: busId,
                                driver_id: driverId, 
                                schedule_date: dayObj.dateISO
                            });
                        }
                    }
                }
            }

            const response = await fetch('http://localhost:5000/api/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: startDate,
                    endDate: endDate,
                    schedules: schedulesToSave
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Lỗi từ server');
            }

            alert("Lưu lịch tuần thành công!");
            setIsSaving(false);
            onClose(); 

        } catch (err) {
            console.error("Lỗi khi lưu lịch:", err);
            alert(`Lưu thất bại: ${err.message}`);
            setIsSaving(false);
        }
    };

    // 4. JSX (VỎ)
    return (
        <div className="popup-overlay">
            <div className="popup scheduler-popup">
                <div className="popup-header">
                    <h2>Gán tài xế</h2>
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>

                <div className="scheduler-tabs-main">
                    <button className={`main-tab ${mainTab === 'currentWeek' ? 'active' : ''}`} onClick={() => selectMainTab('currentWeek')}>Thay đổi lịch Hiện Tại</button>
                    <button className={`main-tab ${mainTab === 'nextWeek' ? 'active' : ''}`} onClick={() => selectMainTab('nextWeek')}>Xếp lịch Tuần Tới</button>
                </div>
                
                <div className="scheduler-tabs-sub">
                    {mainTab === 'currentWeek' && (<>
                        <button className={`scheduler-tab ${subTab === 'detailed-matrix' ? 'active' : ''}`} onClick={() => setSubTab('detailed-matrix')}>Xếp lịch chi tiết </button>
                        <button className={`scheduler-tab ${subTab === 'bus-summary' ? 'active' : ''}`} onClick={() => setSubTab('bus-summary')}>Tổng quan </button>
                    </>)}
                    {mainTab === 'nextWeek' && (<>
                        <button className={`scheduler-tab ${subTab === 'fast-match' ? 'active' : ''}`} onClick={() => setSubTab('fast-match')}>1. Xếp lịch nhanh</button>
                        <button className={`scheduler-tab ${subTab === 'detailed-matrix' ? 'active' : ''}`} onClick={() => setSubTab('detailed-matrix')}>2. Xếp lịch chi tiết </button>
                        <button className={`scheduler-tab ${subTab === 'bus-summary' ? 'active' : ''}`} onClick={() => setSubTab('bus-summary')}>3. Tổng quan </button>
                    </>)}
                </div>

                {/* --- RENDER COMPONENT CON --- */}

                {mainTab === 'nextWeek' && subTab === 'fast-match' && (
                    <SchedulerTabFastMatch
                        vehicles={vehicles}
                        totalBusShifts={totalBusShifts}
                        totalDriverShifts={totalDriverShifts}
                        shiftDifference={shiftDifference}
                        handleFullWeekMatch={handleFullWeekMatch}
                        fastAssignSummary={fastAssignSummary}
                        daysOfWeek={daysOfWeek}
                        isGenerating={isGenerating} // <-- 🔹 TRUYỀN PROP MỚI
                    />
                )}

                {subTab === 'detailed-matrix' && (
                    <SchedulerTabDetailed
                        vehicles={vehicles}
                        drivers={drivers}
                        daysOfWeek={daysOfWeek}
                        scheduleMatrix={scheduleMatrix}
                        isLoading={isLoading}
                        getAvailableDrivers={getAvailableDrivers}
                        handleMatrixChange={handleMatrixChange}
                    />
                )}

                {subTab === 'bus-summary' && (
                    <SchedulerTabSummary
                        scheduleResult={scheduleResult}
                        scheduleMatrix={scheduleMatrix}
                        vehicles={vehicles}
                        drivers={drivers}
                        daysOfWeek={daysOfWeek}
                        isLoading={isLoading}
                    />
                )}

                {/* --- FOOTER --- */}
                <div className="popup-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
                    <button 
                        type="button" 
                        className="btn-save" 
                        onClick={handleSaveSchedule}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Đang lưu...' : 'Lưu Lịch Tuần'}
                    </button>
                </div>
            </div>
        </div>
    );
}