import { addDoc, collection } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';

function RegisterAmbulance() {

  const [location, setLocation] = useState({ lat: null, lng: null });
  

  const [ambulanceName, setAmbulanceName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  

  const navigate = useNavigate();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });

        
          localStorage.setItem("userLocation", JSON.stringify({ latitude, longitude }));
  
          console.log("Location saved:", latitude, longitude);
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);


  const handleRegister = async() => {

    console.log("Ambulance Name:", ambulanceName);
    console.log("Contact Number:", contactNumber);
    console.log("Location:", location);

    const cur= await addDoc(collection(db,"ambulances"),{
      name:ambulanceName,
      contact:contactNumber,
      location:location
    })
    
    navigate('/');
  };

  return (
    <div className="min-h-[92vh] w-full bg-black rounded-3xl p-8 flex flex-col items-center justify-evenly">
      <h1 className="text-[5vw] font-[header] text-white">Register the Ambulance</h1>
      
      <input 
        type="text" 
        placeholder="Hospital Name" 
        className="w-1/2 mb-4 p-2 px-4 rounded bg-white" 
        value={ambulanceName} 
        onChange={(e) => setAmbulanceName(e.target.value)} 
      />

      {/* 
        If you want to show the auto-fetched location, you might render it read-only.
        Otherwise, you can convert it to a string (for example, "lat, lng").
      */}
     

      <input 
        type="text" 
        placeholder="Contact Number" 
        className="w-1/3 mb-4 p-2 px-5 rounded bg-white" 
        value={contactNumber} 
        onChange={(e) => setContactNumber(e.target.value)} 
      />

      <button 
        className="bg-red-500 text-white py-2 px-4 rounded font-[header] text-[2vw]" 
        onClick={handleRegister}
      >
        Register Ambulance
      </button>
    </div>
  );
}

export default RegisterAmbulance;
