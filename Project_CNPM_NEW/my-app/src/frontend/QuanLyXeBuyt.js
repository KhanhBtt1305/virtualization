import React, { useState, useEffect, useCallback } from "react"; 
import "./QuanLyXeBuyt.css";
import BusFormPopup from "./components/BusFormPopup";
import { apiUrl } from "../api/apiConfig";


const API_URL = apiUrl("buses");
const ROUTES_API_URL = apiUrl("routes");

function QuanLyXeBuyt() {
  const [busData, setBusData] = useState([]); 
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(""); 
  const [formData, setFormData] = useState({ id: "", license: "", route: "", status: "", driver: "", departure: "", registry: "" });
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDeparture, setFilterDeparture] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [allRoutes, setAllRoutes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const fetchBuses = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterStatus) {
      params.append("status", filterStatus);
    }
    if (filterDeparture) {
      params.append("departure", filterDeparture);
    }
    
    try {
      setErrorMessage(""); 
      const response = await fetch(`${API_URL}?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Lỗi khi tải dữ liệu");
      }
      const data = await response.json();
      setBusData(data); 
    } catch (error) {
      console.error("Fetch error:", error);
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    }
  }, [filterStatus, filterDeparture]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  useEffect(() => {
    const fetchAllRoutes = async () => {
      try {
        const response = await fetch(ROUTES_API_URL);
        if (!response.ok) throw new Error("Không thể tải danh sách tuyến");
        const data = await response.json();
        setAllRoutes(data); 
      } catch (error) {
        console.error(error.message);
      }
    };
    
    fetchAllRoutes();
  }, []); 
  
  const handleAdd = () => {
    const allNumbers = busData.map(bus => 
        parseInt(bus.id.replace("XE", ""), 10)
    ).filter(num => !isNaN(num)); 

    const maxIdNumber = allNumbers.length > 0 ? Math.max(...allNumbers) : 0;
    const nextIdNumber = maxIdNumber + 1;
    const nextId = "XE" + String(nextIdNumber).padStart(3, '0');

    setFormType("add");
    setFormData({ 
        id: nextId, 
        license: "", 
        route: "", 
        status: "Đang hoạt động", 
        departure: "Chưa xuất phát", 
        registry: "" 
    });
    setErrorMessage("");
    setSuggestions([]); 
    setShowForm(true);
  };
  
  const handleEdit = (bus) => {
    setFormType("edit");
    setFormData(bus);
    setErrorMessage("");
    setSuggestions([]); 
    setShowForm(true);
  };

  const handleView = (bus) => {
    setFormType("view");
    setFormData(bus);
    setErrorMessage("");
    setSuggestions([]); 
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    
    const dataToSubmit = {
        id: formData.id,
        license: formData.license,
        route: formData.route, 
        status: formData.status,
        departure: formData.departure,
        registry: formData.registry,
    };

    const url = (formType === "add") ? API_URL : `${API_URL}/${formData.id}`;
    const method = (formType === "add") ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi không xác định");
      }
      
      setShowForm(false);
      fetchBuses(); 

    } catch (error) {
      console.error("Submit error:", error);
      setErrorMessage(error.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa xe buýt này không?")) {
      try {
        setErrorMessage("");
        const response = await fetch(`${API_URL}/${formData.id}`, {
          method: "DELETE",
        });
        
        if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.error || errorData.message || "Lỗi khi xóa");
        }
        
        setShowForm(false);
        fetchBuses(); 
        
      } catch (error) {
        console.error("Delete error:", error);
        setErrorMessage(error.message);
      }
    }
  };
  
  const handleEditFirst = () => {
    setFormType("edit");
    setFormData({ 
        id: "", 
        license: "", 
        route: "", 
        status: "", 
        departure: "", 
        registry: "" 
    });
    setErrorMessage(""); 
    setSuggestions([]);
    setShowForm(true);
  };
  
  const handleIdChange = (idValue) => {
    setFormData({ ...formData, id: idValue });

    if (formType !== 'edit') return; 

    if (idValue.length === 0) {
        setSuggestions([]);
        setErrorMessage("");
        setFormData({
            id: "", 
            license: "", 
            route: "", 
            status: "", 
            departure: "", 
            registry: ""
        });
        return;
    }

    const filteredSuggestions = busData.filter(bus => 
        bus.id.toLowerCase().startsWith(idValue.toLowerCase())
    );
    
    setSuggestions(filteredSuggestions);

    if (filteredSuggestions.length === 0) {
        setErrorMessage("Không tìm thấy kết quả hợp lệ");
    } else {
        setErrorMessage("");
    }
  };

  const handleSuggestionClick = (bus) => {
    setFormData(bus); 
    setSuggestions([]); 
    setErrorMessage("");
  };

  const filteredBusData = busData.filter(bus => {
    const term = searchTerm.toLowerCase();
    return (
      bus.id.toLowerCase().includes(term) ||
      bus.license.toLowerCase().includes(term) ||
      (bus.driver && bus.driver.toLowerCase().includes(term)) 
    );
  });

  // --- SỬA LẠI PHẦN RENDER ---
  return (
    // Xóa thẻ <div className="dashboard"> và <aside> và <header>
    // Chỉ giữ nội dung chính
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "10px" }}>
        
        <div className="toolbar">
          <input 
            className="search-box" 
            type="text" 
            placeholder="🔍 Tìm theo mã xe, biển số, tên tài xế..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="toolbar-buttons">
            <button onClick={handleEditFirst}>
              Chỉnh sửa
            </button>
            <button onClick={handleAdd}>+ Thêm xe buýt</button>
          </div>
        </div>
        
        <table className="bus-table">
          <thead>
            <tr>
              <th>MÃ SỐ XE</th>
              <th>TUYẾN ĐƯỜNG</th>
              <th>
                TÌNH TRẠNG XE{" "}
                <select
                  className="header-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Đang bảo trì">Đang bảo trì</option>
                  <option value="Ngưng hoạt động">Ngưng hoạt động</option>
                </select>
              </th>
              
              <th>TÀI XẾ</th>
              
              <th>
                TÌNH TRẠNG XUẤT PHÁT{" "}
                <select
                  className="header-filter"
                  value={filterDeparture}
                  onChange={(e) => setFilterDeparture(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="Đã xuất phát">Đã xuất phát</option>
                  <option value="Chưa xuất phát">Chưa xuất phát</option>
                  <option value="Đã kết thúc">Đã kết thúc</option>
                </select>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBusData.map((bus) => (
              <tr key={bus.id} onClick={() => handleView(bus)} className="clickable-row">
                <td>
                  <strong>{bus.id}</strong>
                  <small>{bus.license}</small>
                </td>
                <td className="wide-column">{bus.route}</td>
                <td>
                  <span
                    className={`status-badge ${
                      bus.status === "Đang hoạt động"
                        ? "active"
                        : bus.status === "Đang bảo trì"
                        ? "maintenance"
                        : "inactive"
                    }`}
                  >
                    {bus.status}
                  </span>
                </td>
                
                <td className="medium-column">{bus.driver}</td>
                
                <td>
                  <span
                    className={`departure-badge ${
                      bus.departure === "Đã xuất phát"
                        ? "active"
                        : bus.departure === "Đã kết thúc"
                        ? "maintenance" 
                        : "inactive"
                    }`}
                  >
                    {bus.departure}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      {/* === COMPONENT POPUP === */}
      <BusFormPopup
        show={showForm}
        formType={formType}
        formData={formData}
        allRoutes={allRoutes}
        errorMessage={errorMessage}
        suggestions={suggestions}
        
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onIdChange={handleIdChange}
        onSuggestionClick={handleSuggestionClick}
        setFormData={setFormData}
      />
    </div>
  );
}

export default QuanLyXeBuyt;