import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa"; // Import delete icon

const Listings = () => {
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch properties on mount
  useEffect(() => {
    const fetchMyProperties = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to view your listings.");
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/properties/my-properties`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch properties.");
        }

        const data = await res.json();

        if (data.length === 0) {
          setError("You have not uploaded any properties yet.");
        } else {
          setMyProperties(data);
        }
      } catch (error) {
        setError(error.message);
        console.error("Failed to fetch your properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, []);

  // Handle delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this property?"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/properties/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete property");

      // Remove from state
      setMyProperties((prev) => prev.filter((prop) => prop._id !== id));
    } catch (error) {
      alert("Error deleting property: " + error.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Your Listings</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : myProperties.length === 0 ? (
        <p>You have not uploaded any properties yet.</p>
      ) : (
        <div className="row">
          {myProperties.map((prop) => (
            <div className="col-md-4 mb-4" key={prop._id}>
              <div className="card h-100">
                {/* Image section */}
                {prop.images && prop.images.length > 0 ? (
                  <img
                    src={prop.images[0]}
                    alt={`${prop.title || "Property"} - Image`}
                    className="img-fluid rounded mt-3"
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <img
                    src="/default-image-path.jpg"
                    alt="No image available"
                    style={{
                      display: "flex",
                      width: "320px",
                      margin: "15px auto 0",
                      height: "250px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                )}

                {/* Property info */}
                <div className="card-body">
                  <h5 className="card-title">
                    <strong>Title:</strong> {prop.title}
                  </h5>
                  <p className="card-text">
                    <strong>Descriptions:</strong> {prop.description}
                  </p>
                  <p>
                    <strong>Type:</strong> {prop.propertyType}
                  </p>
                  <p>
                    <strong>Location:</strong> {prop.location}
                  </p>
                  <p>
                    <strong>Price:</strong> ${prop.price} ETB
                  </p>
                </div>

                {/* Delete Icon */}
                <div className="card-footer d-flex justify-content-end p-3">
                  <FaTrash
                    style={{ cursor: "pointer", color: "red" }}
                    title="Delete Property"
                    onClick={() => handleDelete(prop._id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Listings;
