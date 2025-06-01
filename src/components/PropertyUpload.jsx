import React, { useState } from "react";

const PropertyUpload = () => {
  const [property, setProperty] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    propertyType: "apartment",
    images: [], 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProperty((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to array
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
          </select>
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
