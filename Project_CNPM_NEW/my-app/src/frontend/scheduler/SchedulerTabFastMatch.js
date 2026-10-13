import React from "react";

// (Hàm getShortDayLabel giữ nguyên)
const getShortDayLabel = (label) => {
    const parts = label.split(' '); 
    if (parts[0] === 'Chủ') return 'CN';
    if (parts[0] === 'Thứ' && parts.length > 1) return 'T' + parts[1];
    return parts[0]; 
};

export default function SchedulerTabFastMatch({
    vehicles,
    totalBusShifts,
    totalDriverShifts,
    shiftDifference,
    handleFullWeekMatch,
    fastAssignSummary,
    daysOfWeek,
    isGenerating // <-- 🔹 NHẬN PROP MỚI
}) {

    return (
        <div className="tab-content">
            <div className="fast-match-container">
                <h3>Tự động xếp lịch cho Toàn Tuần</h3>
                <p>Hệ thống sẽ tự động gán tài xế (đã đăng ký) cho xe (chưa có lịch) dựa trên số ngày đăng ký của tài xế để đảm bảo công bằng.</p>
                <div className="fast-match-stats">
                    <div><span>Tổng số ca cần gán ({vehicles.length} xe x 7 ngày):</span><strong>{totalBusShifts}</strong></div>
                    <div><span>Tổng số ca tài xế đã đăng ký:</span><strong>{totalDriverShifts}</strong></div>
                    <div className={shiftDifference < 0 ? "status-warning" : "status-ok"}>
                        <span>Trạng thái:</span>
                        <strong>
                        {shiftDifference < 0 ? `Cảnh báo: Thiếu ${Math.abs(shiftDifference)} ca!` : `Đủ ca (Dư ${shiftDifference} ca)`}
                        </strong>
                    </div>
                </div>
                <button 
                    className="btn-save btn-fast-match" 
                    onClick={handleFullWeekMatch}
                    disabled={isGenerating} // <-- 🔹 SỬ DỤNG PROP
                >
                    {isGenerating ? 'Đang xếp lịch...' : 'Tự động gán'}
                </button>
            </div>
            
            {fastAssignSummary && (
                <div className="fast-assign-summary">
                    <hr />
                    <h4>Kết quả xếp lịch nhanh (Tổng quan tài xế theo ngày)</h4>
                    <p>Đây là danh sách các tài xế đã được gán vào lịch. Vui lòng kiểm tra "Tab 2. Xếp lịch chi tiết" để xem chi tiết xe và điều chỉnh nếu cần.</p>
                    
                    <table className="fast-summary-table">
                        <thead>
                            <tr>
                                {daysOfWeek.map(day => (
                                    <th key={day.key}>{getShortDayLabel(day.label)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {daysOfWeek.map(day => {
                                    // === 🔹 CẬP NHẬT LOGIC ĐỌC ===
                                    const assignedDrivers = fastAssignSummary[day.key] || []; 
                                    
                                    return (
                                        <td key={day.key}>
                                            <ul>
                                                {assignedDrivers.length > 0 ? (
                                                    assignedDrivers.map(driver => (
                                                        <li key={driver.id}>{driver.name}</li>
                                                    ))
                                                ) : (
                                                    <li className="no-assign">--</li>
                                                )}
                                            </ul>
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}