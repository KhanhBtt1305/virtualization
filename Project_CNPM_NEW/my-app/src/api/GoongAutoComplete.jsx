// src/api/goongAutocomplete.js
import GoongClient from "./GoongClient";

export async function autocompletePlace(input) {
  if (!input || input.length < 2) return [];
  
  try {
    const res = await GoongClient.get("/Place/AutoComplete", {
      params: { input },
    });
    return res.data.predictions;
  } catch (error) {
    console.error("Autocomplete API error:", error);
    
    // Xử lý các loại lỗi khác nhau
    if (error.response) {
      // Lỗi từ phía server (4xx, 5xx)
      console.error("Server error:", error.response.status, error.response.data);
      throw new Error(`Autocomplete failed: ${error.response.status} - ${error.response.data?.message || 'Server error'}`);
    } else if (error.request) {
      // Không nhận được response từ server
      console.error("Network error:", error.message);
      throw new Error("Network error: Cannot connect to autocomplete service");
    } else {
      // Lỗi khác
      console.error("Unexpected error:", error.message);
      throw new Error(`Autocomplete failed: ${error.message}`);
    }
  }
}