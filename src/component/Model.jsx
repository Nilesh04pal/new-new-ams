import React, { useState } from "react";

const Model = ({ setShowModel, setLocations, id: ambulanceId, locations })  => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    contact: "",
  });
  const ModelClose = () => {
      setShowModel(false);
  }

  const [errors, setErrors] = useState({});

  // Validate all fields; returns an object with any errors
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = "Patient name is required";
    }
    if (!form.address.trim()) {
      errs.address = "Patient address is required";
    }
    if (!form.contact.trim()) {
      errs.contact = "Contact details are required";
    } else if (!/^\d{10}$/.test(form.contact.trim())) {
      errs.contact = "Contact must be a 10‑digit phone number";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // clear error as user types
    setErrors((errs) => ({ ...errs, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
    } else {
      console.log("Submitting:", form);
      alert(`
        Ambulance Booked Successfully!
        !!Please Keep The Note Of Below Details!!
  
        driverName : ${locations.find((amb) => amb.id === ambulanceId)?.name},
        driverContact : ${locations.find((amb) => amb.id === ambulanceId)?.contact}
      `);
      setLocations((prev) => prev.filter((amb) => amb.id !== ambulanceId));
      setShowModel(false);
    }
  };
  

  return (
    <div className=" w-full rounded-3xl absolute  top-[40%] left-1/2 z-[999] -translate-x-[50%] -translate-y-[50%] flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white relative p-6 rounded-xl w-1/3 shadow-black shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-4">Patient Details</h2>
        <h1 className="absolute top-4 right-5 text-2xl font-[Header] font-extrabold cursor-pointer" onClick={ModelClose}>X</h1>
        {/* Patient Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1 font-medium">
            Patient Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.name ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Patient Address */}
        <div className="mb-4">
          <label htmlFor="address" className="block mb-1 font-medium">
            Patient Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.address ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>

        {/* Patient Contact */}
        <div className="mb-6">
          <label htmlFor="contact" className="block mb-1 font-medium">
            Contact Details
          </label>
          <input
            type="text"
            id="contact"
            name="contact"
            placeholder="10‑digit phone number"
            value={form.contact}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.contact ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.contact && (
            <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Model;
