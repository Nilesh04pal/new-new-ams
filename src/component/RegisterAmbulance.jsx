import { addDoc, collection } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';

function RegisterAmbulance() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [ambulanceName, setAmbulanceName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validate = () => {
    const errs = {};
    if (!ambulanceName.trim()) errs.ambulanceName = "Hospital name is required.";
    if (!driverName.trim()) errs.driverName = "Driver name is required.";
    if (!contactNumber.trim()) {
      errs.contactNumber = "Contact number is required.";
    } else if (!/^\d{10}$/.test(contactNumber)) {
      errs.contactNumber = "Contact number must be 10 digits.";
    }
    return errs;
  };

  const handleRegister = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true); // Disable button

    try {
      await addDoc(collection(db, "ambulances"), {
        name: ambulanceName,
        driver: driverName,
        contact: contactNumber,
        location: location
      });

      alert("Ambulance added successfully!");
      navigate('/');
    } catch (err) {
      console.error("Error adding ambulance:", err);
      alert("Error occurred while registering ambulance.");
      setIsSubmitting(false); // Re-enable button if there's an error
    }
  };

  return (
    <div className="register min-h-[92vh] relative w-full bg-black rounded-3xl p-8 flex flex-col items-center justify-evenly">
      <img src="/ambulance.png" className="h-[80vh] w-full object-cover" />
      <div className="absolute h-full w-full flex flex-col items-center justify-evenly rounded-3xl p-8 bg-[rgba(0,0,0,0.7)]">
        <h1 className="text-[5vw] font-[header] text-white">
          Register the Ambulance
        </h1>

        {/* Hospital/Ambulance Name */}
        <input
          type="text"
          placeholder="Hospital Name"
          className="w-1/2 mb-2 p-2 px-4 rounded bg-white"
          value={ambulanceName}
          onChange={(e) => {
            setAmbulanceName(e.target.value);
            setErrors({ ...errors, ambulanceName: "" });
          }}
        />
        {errors.ambulanceName && (
          <p className="text-red-500 text-sm">{errors.ambulanceName}</p>
        )}

        {/* Driver Name */}
        <input
          type="text"
          placeholder="Driver Name"
          className="w-1/2 mb-2 p-2 px-4 rounded bg-white"
          value={driverName}
          onChange={(e) => {
            setDriverName(e.target.value);
            setErrors({ ...errors, driverName: "" });
          }}
        />
        {errors.driverName && (
          <p className="text-red-500 text-sm">{errors.driverName}</p>
        )}

        {/* Contact Number */}
        <input
          type="text"
          placeholder="Contact Number"
          className="w-1/3 mb-2 p-2 px-5 rounded bg-white"
          value={contactNumber}
          onChange={(e) => {
            setContactNumber(e.target.value);
            setErrors({ ...errors, contactNumber: "" });
          }}
        />
        {errors.contactNumber && (
          <p className="text-red-500 text-sm">{errors.contactNumber}</p>
        )}

        <button
          className={`bg-red-500 text-white py-2 px-4 rounded font-[header] text-[2vw] transition-all duration-200 ease-in-out ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-600'
            }`}
          onClick={handleRegister}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registering..." : "Register Ambulance"}
        </button>
      </div>
    </div>
  );
}

export default RegisterAmbulance;
