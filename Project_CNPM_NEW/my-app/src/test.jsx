import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const GOONG_API_KEY = process.env.REACT_APP_GOONG_API_KEY;

export default function SearchSuggestAddress({ 
  placeholderinput, 
  className, 
  styleInputMain, 
  onAddressSelect // Thêm prop callback
}) {
  const styleInputdefault = {
    width: "100%",
    padding: "8px 10px",
    fontSize: "1em",
    borderRadius: 4,
    border: "1px solid #ccc",
  };

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null); // Lưu địa chỉ đã chọn
  const timeoutRef = useRef(null);

  const handleInput = (e) => {
    const input = e.target.value;
    setQuery(input);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await axios.get("https://rsapi.goong.io/Place/AutoComplete", {
          params: { api_key: GOONG_API_KEY, input },
        });
        setSuggestions(res.data.predictions || []);
      } catch (err) {
        console.error("Lỗi gọi API Goong:", err);
      }
    }, 600);
  };

  const handleSelect = async (item) => {
    setQuery(item.description);
    setSuggestions([]);
    setSelectedAddress(item); // Lưu địa chỉ đã chọn

    try {
      const res = await axios.get("https://rsapi.goong.io/Place/Detail", {
        params: { place_id: item.place_id, api_key: GOONG_API_KEY },
      });
      const loc = res.data.result.geometry.location;
      
      // Gọi callback với thông tin đầy đủ
      if (onAddressSelect) {
        onAddressSelect({
          description: item.description,
          place_id: item.place_id,
          location: {
            lng: loc.lng,
            lat: loc.lat
          },
          fullAddress: res.data.result
        });
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết địa điểm:", err);
      
      // Vẫn gọi callback với thông tin cơ bản nếu có lỗi
      if (onAddressSelect) {
        onAddressSelect({
          description: item.description,
          place_id: item.place_id,
          location: null
        });
      }
    }
  };

  return (
    <div 
      className={className}
      style={{
        position: "relative",
        zIndex: 10,
        background: "white",
        width: "auto",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <input
        type="text"
        value={query}
        onChange={handleInput}
        placeholder={placeholderinput}
        style={{ ...styleInputdefault, ...styleInputMain }}
      />
      {suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ccc",
            borderTop: "none",
            maxHeight: 200,
            overflowY: "auto",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}
        >
          {suggestions.map((s) => (
            <div
              key={s.place_id}
              onClick={() => handleSelect(s)}
              style={{
                padding: 10,
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {s.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}