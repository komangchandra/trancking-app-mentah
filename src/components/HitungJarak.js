import React, { useState } from "react";

const DistanceCalculator = () => {
  const [lat1, setLat1] = useState("");
  const [lon1, setLon1] = useState("");
  const [lat2, setLat2] = useState("");
  const [lon2, setLon2] = useState("");
  const [distance, setDistance] = useState(null);

  const calculateDistance = () => {
    const d = haversine(
      parseFloat(lat1),
      parseFloat(lon1),
      parseFloat(lat2),
      parseFloat(lon2)
    );
    setDistance(d);
  };

  return (
    <div>
      <h1>Distance Calculator</h1>
      <div>
        <label>
          Latitude 1:
          <input
            type="text"
            value={lat1}
            onChange={(e) => setLat1(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Longitude 1:
          <input
            type="text"
            value={lon1}
            onChange={(e) => setLon1(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Latitude 2:
          <input
            type="text"
            value={lat2}
            onChange={(e) => setLat2(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Longitude 2:
          <input
            type="text"
            value={lon2}
            onChange={(e) => setLon2(e.target.value)}
          />
        </label>
      </div>
      <button onClick={calculateDistance}>Calculate Distance</button>
      {distance !== null && (
        <div>
          <h2>Distance: {distance.toFixed(2)} km</h2>
        </div>
      )}
    </div>
  );
};

// Fungsi Haversine
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam kilometer
  const toRadians = (degree) => degree * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

export default DistanceCalculator;
