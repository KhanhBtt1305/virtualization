// File: src/frontend/scheduler/SchedulerTabDetailed.js

import React, { useState, useMemo } from "react";

// Component con cho tab xếp lịch chi tiết
export default function SchedulerTabDetailed({
    vehicles,
    drivers,
    daysOfWeek,
    scheduleMatrix,
    isLoading,
    getAvailableDrivers,
    handleMatrixChange
}) {

    // State của filter nên được đặt ở đây, vì nó chỉ ảnh hưởng đến tab này
    const [filterRoute, setFilterRoute] = useState("Tất cả");
    const [filterStatus, setFilterStatus] = useState("Tất cả"); 
    
    const filteredVehicles = useMemo(() => {
        return vehicles.filter(vehicle => {
            if (filterRoute === "Tất cả") return true;
            return vehicle.route && vehicle.route.includes(filterRoute);
        });
    }, [vehicles, filterRoute]);

    return (
        <div className="tab-content full-height">
            <div className="scheduler-filters">
                <div className="form-group"><label htmlFor="filter-route">Lọc theo Tuyến</label><select id="filter-route" value={filterRoute} onChange={(e) => setFilterRoute(e.target.value)}><option value="Tất cả">Tất cả Tuyến</option><option value="q1->q5">Tuyến csc-cs2</option><option value="q1->q3">Tuyến cs1-cs2</option><option value="q3->q5">cs1-csc</option><option value="sgu->ktx">ktx-csc</option></select></div>
                <div className="form-group"><label htmlFor="filter-status">Trạng thái Xe</label><select id="filter-status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}><option value="Tất cả">Hiển thị Tất cả</option><option value="Chưa xếp">Chỉ xe chưa xếp lịch</option><option value="Đã xếp">Chỉ xe đã xếp lịch</option></select></div>
            </div>

            <div className="scheduler-matrix-container">
                <table className="scheduler-matrix-table">
                    <thead>
                        <tr>
                            <th className="sticky-col">Xe / Tuyến</th>
                            {daysOfWeek.map(day => (<th key={day.key}>{day.label}</th>))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={8} style={{textAlign: "center", padding: "20px"}}>Đang tải dữ liệu...</td></tr>
                        ) : (
                            filteredVehicles.map(vehicle => (
                                <tr key={vehicle.id}>
                                    <td className="sticky-col">
                                        <strong>{vehicle.id}</strong>
                                        <span>{vehicle.route || 'Chưa gán tuyến'}</span>
                                    </td>
                                    {daysOfWeek.map(day => {
                                        const availableDrivers = getAvailableDrivers(vehicle.id, day.key);
                                        const assignedDriverId = scheduleMatrix[vehicle.id]?.[day.key] || "";
                                        const assignedDriver = drivers.find(d => d.id === assignedDriverId);
                                        
                                        return (
                                            <td key={`${vehicle.id}-${day.key}`} className="cell-dropdown">
                                                <select 
                                                    className={`scheduler-select ${assignedDriverId ? 'assigned' : ''}`}
                                                    value={assignedDriverId} 
                                                    onChange={(e) => handleMatrixChange(vehicle.id, day.key, e.target.value)}
                                                >
                                                    <option value="">-- Chọn tài xế --</option>
                                                    
                                                    {assignedDriverId && !availableDrivers.some(d => d.id === assignedDriverId) && assignedDriver && (
                                                        <option key={assignedDriverId} value={assignedDriverId}>
                                                            {assignedDriver.name}
                                                        </option>
                                                    )}
                                                    
                                                    {availableDrivers.map(d => (
                                                        <option key={d.id} value={d.id}>
                                                            {d.name} ({d.id})
                                                        </option>
                                                    ))}
                                                    
                                                    {assignedDriverId && (
                                                        <option value="">-- Bỏ gán --</option>
                                                    )}
                                                </select>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}