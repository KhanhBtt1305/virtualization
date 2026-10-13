// src/api/goongPlaceDetail.js
import GoongClient from "./GoongClient";

export async function getPlaceDetail(place_id) {
  const res = await GoongClient.get("/Place/Detail", {
    params: { place_id },
  });
  return res.data.result;
}
