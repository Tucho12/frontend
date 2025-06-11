import React, { useState } from "react";

const PropertyUpload = () => {
  const [property, setProperty] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    propertyType: "apartment",
    bedrooms: "",
    bathrooms: "",
    amenities: {
      washerDryer: false,
      heatingCooling: false,
      secureBuilding: false,
      parking: false,
      gymPool: false,
      nearShopsTransit: false,
    },
    images: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProperty((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAmenityChange = (e) => {
    const { name, checked } = e.target;
    setProperty((prevData) => ({
      ...prevData,
      amenities: {
        ...prevData.amenities,
        [name]: checked,
      },
    }));
  };
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files); 
    console.log("Selected files:", files);
    setProperty((prevData) => ({
      ...prevData,
      images: files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to upload a property.");
      return;
    }

    const formData = new FormData();
    formData.append("title", property.title);
    formData.append("description", property.description);
    formData.append("location", property.location);
    formData.append("price", property.price);
    formData.append("propertyType", property.propertyType);
    formData.append("bedrooms", property.bedrooms);
    formData.append("bathrooms", property.bathrooms);

    Object.entries(property.amenities).forEach(([key, value]) => {
      formData.append(`amenities[${key}]`, value);
    });

    // Append multiple images
    if (property.images.length > 0) {
      property.images.forEach((image, index) => {
        formData.append(`images`, image);
      });
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/properties`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (response.status === 201) {
        alert("Property uploaded successfully!");

        // Reset form after successful upload
        setProperty({
          title: "",
          description: "",
          location: "",
          price: "",
          propertyType: "apartment",
          bedrooms: "",
          bathrooms: "",
          amenities: {
            washerDryer: false,
            heatingCooling: false,
            secureBuilding: false,
            parking: false,
            gymPool: false,
            nearShopsTransit: false,
          },
          images: [],
        });
      } else {
        alert("Failed to upload property: " + data.message);
      }
    } catch (error) {
      console.error("Error uploading property:", error);
      alert("An error occurred while uploading the property: " + error.message);
    }
  };

  return (
    <div className="container">
      <h2 className="mt-5 text-center mb-4">Upload Property</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={property.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control"
            value={property.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Location</label>
          <input
            type="text"
            className="form-control"
            name="location"
            value={property.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            className="form-control"
            name="price"
            value={property.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Type</label>
          <select
            name="propertyType"
            className="form-select"
            value={property.propertyType}
            onChange={handleChange}
            required
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="office">Office</option>
            <option value="condo">Condo</option>
            <option value="studio">Office</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Bedrooms</label>
          <input
            type="number"
            className="form-control"
            name="bedrooms"
            value={property.bedrooms}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Bathrooms</label>
          <input
            type="number"
            className="form-control"
            name="bathrooms"
            value={property.bathrooms}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Amenities</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="washerDryer"
              checked={property.amenities.washerDryer}
              onChange={handleAmenityChange}
            />
            <label className="form-check-label">In-Unit Washer & Dryer</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="heatingCooling"
              checked={property.amenities.heatingCooling}
              onChange={handleAmenityChange}
            />
            <label className="form-check-label">
              Central Heating & Cooling
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="secureBuilding"
              checked={property.amenities.secureBuilding}
              onChange={handleAmenityChange}
            />
            <label className="form-check-label">
              Secure Building with Elevator Access
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="parking"
              checked={property.amenities.parking}
              onChange={handleAmenityChange}
            />
            <label className="form-check-label">1 Reserved Parking Spot</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="gymPool"
              checked={property.amenities.gymPool}
              onChange={handleAmenityChange}
            />
            <label className="form-check-label">Access to Gym & Pool</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="nearShopsTransit"
              checked={property.amenities.nearShopsTransit}
              onChange={handleAmenityChange}
            />
            <label className="form-check-label">
              Close to Shopping, Transit, and Restaurants
            </label>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Images</label>
          <input
            type="file"
            className="form-control"
            name="images"
            onChange={handleImageChange}
            accept="image/*"
            multiple
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Upload
        </button>
      </form>
    </div>
  );
};

export default PropertyUpload;
