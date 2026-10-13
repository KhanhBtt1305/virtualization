// src/api/goongGeocode.js
import GoongClient from "./GoongClient";

export async function geocodeAddress(address) {
  const res = await GoongClient.get("/Geocode", {
    params: { address },
  });
  return res.data.results;
}
