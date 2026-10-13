import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import GoongMapReact from "@goongmaps/goong-map-react";
import { getPlaceDetail } from "../../api/GoongPlaceDetail";
import PointLocation from "./PointLocation";
const GOONG_API_KEY = process.env.REACT_APP_GOONG_API_KEY;
let count = 0
function get3character(address){
  // Tách thành các từ, lọc chỉ lấy chữ cái
const words = address.split(' ')
                    .filter(word => /[a-zA-ZÀ-ỹ]/.test(word))
                    .map(word => word.replace(/[^a-zA-ZÀ-ỹ]/g, ''))
                    .filter(word => word.length > 0);

// Lấy 3 chữ cái đầu từ các từ
const firstThreeCharsFromWords = words.slice(0, 3)
                                    .map(word => word.charAt(0))
                                    .join('');
  return firstThreeCharsFromWords.toUpperCase();
                                  }
export default function SearchSuggestAddress({placeholderinput,className,styleInputMain,onAddressSelect=null}) {
  const styleInputdefault = {
            width:"100%",
            padding: "8px 10px",
            fontSize: "1em",
            borderRadius: 4,
            border: "1px solid #ccc",
          }
    
    const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const timeoutRef = useRef(null);

  // Xử lý gõ địa chỉ với debounce
  const handleInput = (e) => {
    const input = e.target.value;
    setQuery(input);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    // Debounce 600ms
    timeoutRef.current = setTimeout(async () => {
        
        
      try {
        const res = await axios.get("https://rsapi.goong.io/Place/AutoComplete", {
          params: { api_key: GOONG_API_KEY, input },
        });
        
        setSuggestions(res.data.predictions || []);
        console.log(suggestions)
        
        
      } catch (err) {
        console.error("Lỗi gọi API Goong:", err);
        if (err.response?.status === 429) {
          console.warn("Bạn đang gọi API quá nhanh. Hãy giảm tốc độ nhập.");
        }
      }
    }, 600);
  };

  // Khi chọn gợi ý
  const handleSelect = async (item) => {
    setQuery(item.description);
    setSuggestions([]);
    
    try {
      const res = await getPlaceDetail(item.place_id)
      const loc = res.geometry;
      
      loc.location.address = res.formatted_address
      loc.location.name = get3character(loc.location.address);
      if(onAddressSelect)
        onAddressSelect(
          loc.location
        )
      
      
    } catch (err) {
      console.error("Lỗi lấy chi tiết địa điểm:", err);
    }
  };

  return (
      <div className={className}
        style={{
        position:"relative",
          zIndex: 10,
          background: "white",
          width:"auto",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder={placeholderinput}
          style={{...styleInputdefault,styleInputMain}}
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
                onMouseDown={(e) => e.preventDefault()} // Giữ input không mất focus
              >
                {s.description}
              </div>
            ))}
          </div>
        )}
      </div>

  );
}
