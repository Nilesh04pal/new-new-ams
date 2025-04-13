import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";
import "leaflet/dist/leaflet.css";
import Model from "./Model";
// Custom marker icons
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
  iconSize: [40, 40],
});
const locationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/535/535239.png",
  iconSize: [30, 30],
});

// Haversine formula
const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (angle) => (angle * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const BookAmbulance = () => {
  const [ShowModel, setShowModel] = useState(false);
  const [CurrentRemovedAmbulance, setCurrentRemovedAmbulance] = useState(-1);
  const [userLocation, setUserLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [nearbyLocations, setNearbyLocations] = useState([]);

  // 1) Fetch ambulances from Firestore
  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        const qs = await getDocs(collection(db, "ambulances"));
        const data = qs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          location: {
            lat: Number(doc.data().location.lat),
            lng: Number(doc.data().location.lng),
          }
        }));
        setLocations(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAmbulances();
  }, []);

  // 2) Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setUserLocation({ lat: coords.latitude, lng: coords.longitude }),
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  }, []);

  // 3) Filter all ambulances within 10 km—no deduplication
  useEffect(() => {
    if (!userLocation || locations.length === 0) return;

    const filtered = locations
      .map((amb) => {
        const distance = getDistance(
          userLocation.lat,
          userLocation.lng,
          amb.location.lat,
          amb.location.lng
        );
        return { ...amb, distance };
      })
      .filter((amb) => amb.distance <= 10)
      .sort((a, b) => a.distance - b.distance);

    setNearbyLocations(filtered);
  }, [userLocation, locations]);
  console.log(locations);

  const handleClick = (ambulanceId) => {
    setShowModel(true);
    setCurrentRemovedAmbulance(ambulanceId);
  };

  return (
    <div className="relative">
      {userLocation && (
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={12}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>You are here!</Popup>
          </Marker>

          {nearbyLocations.map((amb) => (
            <Marker
              key={amb.id}
              position={[amb.location.lat, amb.location.lng]}
              icon={locationIcon}
            >
              <Popup>
                <b>{amb.name}</b>
                <br />
                {amb.distance.toFixed(2)} km away
                <br />
                Contact: {amb.contact}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      <div className="w-full flex flex-col items-center p-2 font-[Header]">
        <h2 className="text-3xl text-red-600 p-2">
          Nearby Ambulance Locations (within 10 km)
        </h2>

        {nearbyLocations.length > 0 ? (
          <ul>
            {nearbyLocations.map((amb, id) => (
              <li
                key={amb.id}
                className="p-2 text-2xl cursor-pointer"
                onClick={() => handleClick(amb.id)}
              >
                {amb.name} — {amb.distance.toFixed(2)} km
              </li>
            ))}
          </ul>
        ) : (
          <p>No nearby locations found.</p>
        )}
      </div>

      {ShowModel && (
        <Model
          setShowModel={setShowModel}
          setLocations={setLocations}
          id={CurrentRemovedAmbulance}
          locations={locations}
        />
      )}
    </div>
  );
};

export default BookAmbulance;
