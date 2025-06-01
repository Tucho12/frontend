import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BookProperty = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/properties/${propertyId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!res.ok) {
          if (res.status === 404) {
            setErrorMessage("Property not found.");
            return;
          }
          throw new Error("Failed to fetch property details");
        }

        const data = await res.json();
        setProperty(data);
      } catch (error) {
        console.error("Error fetching property details:", error);
        setErrorMessage("An error occurred while fetching property details.");
      }
    };

    fetchPropertyDetails();
  }, [propertyId]);

  const handleBooking = async (e) => {
    e.preventDefault();

    // Validate input fields
    if (!checkInDate || !checkOutDate) {
      setErrorMessage("Both check-in and check-out dates are required.");
      return;
    }

    // Ensure check-out date is after check-in date
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkOut <= checkIn) {
      setErrorMessage("Check-out date must be after check-in date.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ propertyId, checkInDate, checkOutDate }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        navigate("/tenant/bookings");
      } else {
        setErrorMessage(data.message || "Booking failed.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while making the booking.");
    }
  };

  if (!property) return <p>{errorMessage || "Loading property details..."}</p>;

  return (
    <div className="container mt-5">
      <h2>Book Property: {property.title}</h2>
      <div className="row">
        <div className="col-md-6">
          <img
            src={property.images}
            alt={property.title}
            style={{ width: "100%", height: "300px", objectFit: "cover" }}
          />
        </div>
        <div className="col-md-6">
          <p>
            <strong>Location:</strong> {property.location}
          </p>
          <p>
            <strong>Description:</strong> {property.description}
          </p>
          <p>
            <strong>Price:</strong> ${property.price} per month
          </p>

          <form onSubmit={handleBooking}>
            <div className="mb-3">
              <label htmlFor="checkIn" className="form-label">
                Check-In Date
              </label>
              <input
                type="date"
                id="checkIn"
                className="form-control"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="checkOut" className="form-label">
                Check-Out Date
              </label>
              <input
                type="date"
                id="checkOut"
                className="form-control"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            <button type="submit" className="btn btn-primary">
              Book Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookProperty;
