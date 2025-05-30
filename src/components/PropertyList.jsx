import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PropertyList = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/properties`
        );
        const data = await res.json();
        setProperties(data);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    };

    fetchProperties();
  }, []);

  const visibleProperties = properties.filter(
    (prop) => prop.paymentStatus !== "paid"
  );
  return (
    <div className="container mt-5">
      <h2>Available Properties</h2>
      <div className="row">
        {visibleProperties.map((prop) => (
          <div className="col-md-4 mb-4" key={prop._id}>
            <div className="card h-100">
              <div className="card-img-top" style={{ position: "relative" }}>
                {prop.images.length > 0 ? (
                  prop.images.map((image, index) => (
                    <img
                      key={index}
                      src={`${import.meta.env.VITE_API_BASE_URL}${image}`}
                      alt={`${prop.title} - Image ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                  ))
                ) : (
                  <img
                    src="/placeholder.jpg"
                    alt="Placeholder"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                )}
                <p
                  style={{
                    position: "absolute",
                    bottom: "1px",
                    left: "10px",
                    fontWeight: "bold",
                    color: "#F5C518",
                  }}
                >
                  {prop.price} ETB
                </p>
                <Link
                  to={`/tenant/book/${prop._id}`}
                  className="btn btn-outline-primary book-btn"
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    borderRadius: "20px",
                    padding: "8px 16px",
                    fontWeight: "bold",
                    transition: "background-color 0.3s",
                  }}
                >
                  Book
                </Link>
              </div>
              <div className="card-body">
                <h3 style={{ color: "blue" }}>{prop.propertyType}</h3>
                <p className="card-text">{prop.description}</p>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    prop.location
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#2c3e50",
                    display: "flex",
                    alignItems: "center",
                    textDecoration: "none",
                  }}
                >
                  <i
                    className="fas fa-map-marker-alt"
                    style={{ marginRight: "8px", color: "#007bff" }}
                  ></i>
                  {prop.location}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyList;
