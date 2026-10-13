import React, { useState, useEffect } from "react";

// Component con cho tab Tổng quan
export default function SchedulerTabSummary({
    scheduleResult,
    scheduleMatrix,
    vehicles,
    drivers,
    daysOfWeek,
    isLoading
}) {

    // State cho tab (Ngày/Tuần) và ngày đang chọn là của riêng component này
    const [summaryViewTab, setSummaryViewTab] = useState('byDay');
    const [summaryDay, setSummaryDay] = useState(daysOfWeek[0].label);

    // Cập nhật ngày mặc định khi tuần thay đổi
    useEffect(() => {
        setSummaryDay(daysOfWeek[0].label);
    }, [daysOfWeek]);

    return (
        <div className="tab-content full-height">
            
            {/* 1. Thanh sub-tab mới (Ngày / Tuần) */}
            <div className="bus-summary-controls">
                <button 
                    className={`summary-view-tab ${summaryViewTab === 'byDay' ? 'active' : ''}`}
                    onClick={() => setSummaryViewTab('byDay')}
                >
                    Xem theo ngày
                </button>
                <button 
                    className={`summary-view-tab ${summaryViewTab === 'byWeek' ? 'active' : ''}`}
                    onClick={() => setSummaryViewTab('byWeek')}
                >
                    Xem cả tuần
                </button>
            </div>
            
            {/* 2. Nội dung xem theo NGÀY */}
            {summaryViewTab === 'byDay' && (
                <>
                    <div className="form-group-inline">
                        <label htmlFor="summary-day-select">Xem tổng quan cho ngày:</label>
                        <select id="summary-day-select" value={summaryDay} onChange={(e) => setSummaryDay(e.target.value)}>
                            {daysOfWeek.map(day => (<option key={day.key} value={day.label}>{day.label}</option>))} 
                        </select>
                    </div>
                    <div className="bus-summary-list">
                        <div className="bus-summary-header"><div className="summary-col-bus">Xe buýt</div><div className="summary-col-route">Tuyến đường</div><div className="summary-col-driver">Tài xế phụ trách</div><div className="summary-col-time">Giờ hoạt động</div></div>
                        <div className="bus-summary-body">
                            {isLoading ? (<div style={{textAlign: "center", padding: "20px"}}>Đang tải dữ liệu...</div>) : (
                                (scheduleResult[summaryDay] || []).length > 0 ? (
                                    (scheduleResult[summaryDay] || []).map(bus => (
                                        <div key={bus.busId} className="bus-summary-row">
                                            <div className="summary-col-bus"><div className="cell-stacked"><strong>{bus.busId}</strong><span>{bus.plate}</span></div></div>
                                            <div className="summary-col-route">{bus.route}</div>
                                            <div className="summary-col-driver">{bus.driverName ? (<div className="cell-stacked"><strong>{bus.driverName}</strong><span>{bus.driverId}</span></div>) : (<span className="unassigned">Chưa gán</span>)}</div>
                                            <div className="summary-col-time"><div className="cell-stacked"><strong>{bus.startTime}</strong><span>{bus.endTime}</span></div></div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{textAlign: "center", padding: "20px", fontStyle: "italic"}}>Không có lịch cho ngày này.</div>
                                )
                            )}
                        </div>
                    </div>
                </>
            )}
            
            {/* 3. Nội dung xem theo TUẦN */}
            {summaryViewTab === 'byWeek' && (
                <div className="scheduler-matrix-container summary-week-view">
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
                                vehicles.map(vehicle => ( 
                                    <tr key={vehicle.id}>
                                        <td className="sticky-col">
                                            <strong>{vehicle.id}</strong>
                                            <span>{vehicle.route || 'Chưa gán tuyến'}</span>
                                        </td>
                                        {daysOfWeek.map(day => {
                                            const assignedDriverId = scheduleMatrix[vehicle.id]?.[day.key];
                                            const driver = drivers.find(d => d.id === assignedDriverId);
                                            
                                            return (
                                                <td key={`${vehicle.id}-${day.key}`} className="cell-summary">
                                                    {driver ? (
                                                        <div className="cell-stacked">
                                                            <strong>{driver.name}</strong>
                                                            <span>{driver.id}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="unassigned">--</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}