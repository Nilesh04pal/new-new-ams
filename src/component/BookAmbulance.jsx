import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase"; // Adjust the import based on your export

// Custom marker icons
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
  iconSize: [40, 40],
});

const locationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/535/535239.png",
  iconSize: [30, 30],
});

// Haversine formula to calculate distance (in KM) between two coordinates
const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (angle) => (angle * Math.PI) / 180;
  const R = 6371; // Earth's radius in KM
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
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [locations, setLocations] = useState([]);

  // Fetch ambulances from Firestore
  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ambulances"));
        const ambulancesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id, // Include unique ID for each document
            ...data,
            location: {
              lat: Number(data.location.lat),
              lng: Number(data.location.lng),
            },
          };
        });
        console.log("Fetched ambulances:", ambulancesData);
        setLocations(ambulancesData);
      } catch (error) {
        console.error("Error fetching ambulances:", error);
      }
    };

    fetchAmbulances();
  }, []);

  // Get user's current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const loc = { lat: latitude, lng: longitude };
          console.log("User location:", loc);
          setUserLocation(loc);
        },
        (error) => console.error("Error fetching location:", error),
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  // Calculate nearby ambulance locations within 10 km and remove duplicates
  useEffect(() => {
    if (userLocation && locations.length > 0) {
      const filteredLocations = locations
        .map((ambulance) => {
          const distance = getDistance(
            userLocation.lat,
            userLocation.lng,
            ambulance.location.lat,
            ambulance.location.lng
          );
          console.log(
            `Distance for ${ambulance.name}: ${distance.toFixed(2)} km`
          );
          return { ...ambulance, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .filter((ambulance) => ambulance.distance <= 10);
        
      console.log("Locations within 10km before deduplication:", filteredLocations);

   
      const proximityThreshold = 0.05;
      const uniqueLocations = [];
      filteredLocations.forEach((ambulance) => {
        const duplicateFound = uniqueLocations.some((uniqueAmb) => {
          // Check if these two ambulances are within the threshold
          const distBetween = getDistance(
            ambulance.location.lat,
            ambulance.location.lng,
            uniqueAmb.location.lat,
            uniqueAmb.location.lng
          );
          return distBetween < proximityThreshold;
        });
        if (!duplicateFound) {
          uniqueLocations.push(ambulance);
        }
      });

      console.log("Filtered unique locations within 10km:", uniqueLocations);
      setNearbyLocations(uniqueLocations);
    }
  }, [userLocation, locations]);

  // Remove the ambulance from "locations" based on its unique ID
  const handleClick = (id) => {
    alert("Ambulance Booked Successfully!!")
    setLocations((prevLocations) =>
      prevLocations.filter((ambulance) => ambulance.id !== id)
    );

  };

  return (
    <div>
      {userLocation && (
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={12}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* User Location Marker */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>You are here!</Popup>
          </Marker>

          {/* Nearby Ambulance Markers */}
          {nearbyLocations.map((ambulance) => (
            <Marker
              key={ambulance.id}
              position={[ambulance.location.lat, ambulance.location.lng]}
              icon={locationIcon}
            >
              <Popup>
                <b>{ambulance.name}</b> <br />
                Distance: {ambulance.distance.toFixed(2)} km <br />
                Contact: {ambulance.contact}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
      <div className="w-full flex justify-center items-center flex-col p-2">
        <h2 className="font-[Header] text-3xl p-2 text-red-600">
          Nearby Ambulance Locations (within 10km)
        </h2>
        {nearbyLocations.length > 0 ? (
          <ul>
            {nearbyLocations.map((ambulance) => (
              <li
                key={ambulance.id}
                className="p-2 font-[Header] cursor-pointer text-2xl font-light"
                onClick={() => handleClick(ambulance.id)}
              >
                {ambulance.name} - {ambulance.distance.toFixed(2)} km away
              </li>
            ))}
          </ul>
        ) : (
          <p>No nearby locations found.</p>
        )}
      </div>
    </div>
  );
};

export default BookAmbulance;
