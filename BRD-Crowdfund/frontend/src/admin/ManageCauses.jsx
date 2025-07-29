import React, { useEffect, useState } from "react";
import API, { AdminApi } from "../services/api"; // Ensure AdminApi is correctly imported
import "./ManageCauses.css"; // ⭐ Changed import from ManageBlogs.css to ManageCauses.css if that's the correct name for this component's CSS
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ManageCauses = () => {
  const [causes, setCauses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    category: "",
    location: "",
    targetAmount: "",
    currentAmount: "",
    endDate: "",
    status: "ACTIVE",
  });

  const [imagePreview, setImagePreview] = useState(null); // for showing selected image
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);

  const getImageUrl = (relativePath) => {
    return `${API_BASE}/api/images/${relativePath}`;
  };
  const navigate = useNavigate();

  useEffect(() => {
    fetchCauses();
  }, []);

  const fetchCauses = async () => {
    try {
      const res = await AdminApi.getAllCauses();
      if (Array.isArray(res.data)) {
        setCauses(res.data);
      } else {
        console.warn("Unexpected response format", res.data);
        setCauses([]);
      }
    } catch (err) {
      console.error("Error fetching causes", err);
      Swal.fire("Error", "Failed to fetch causes. Please check your network or API.", "error");
    }
  };

  // Validation logic
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.targetAmount === "") {
      newErrors.targetAmount = "Target Amount is required";
    } else if (isNaN(formData.targetAmount) || Number(formData.targetAmount) <= 0) {
      newErrors.targetAmount = "Target Amount must be a positive number";
    }

    // if (formData.currentAmount === "") {
    //   newErrors.currentAmount = "Current Amount is required";
    // } else if (isNaN(formData.currentAmount) || Number(formData.currentAmount) < 0) {
    //   newErrors.currentAmount = "Current Amount must be zero or a positive number";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "targetAmount" || name === "currentAmount" ? value : value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const handleUpdate = (id) => {
    const causeToEdit = causes.find((cause) => cause.id === id || cause._id === id);
    if (causeToEdit) {
      setFormData({
        title: causeToEdit.title || "",
        shortDescription: causeToEdit.shortDescription || "",
        description: causeToEdit.description || "",
        category: causeToEdit.category || "",
        location: causeToEdit.location || "",
        targetAmount: causeToEdit.targetAmount || "",
        // currentAmount: causeToEdit.currentAmount || "",
        endDate: causeToEdit.endDate ? new Date(causeToEdit.endDate).toISOString().slice(0, 10) : "", // format YYYY-MM-DD
        status: causeToEdit.status || "ACTIVE",
      });
      // ⭐ Removed the incorrect if(imageFile) block from here
      setImagePreview(causeToEdit.imageUrl ? getImageUrl(causeToEdit.imageUrl) : null); // Show current image
      setEditId(id);
      setIsEditing(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const form = new FormData();
    form.append("title", formData.title);
    form.append("shortDescription", formData.shortDescription);
    form.append("description", formData.description);
    form.append("category", formData.category);
    form.append("location", formData.location);
    form.append("targetAmount", formData.targetAmount);
    // form.append("currentAmount", formData.currentAmount);
    form.append("endDate", formData.endDate ? `${formData.endDate}T00:00:00` : "");
    form.append("status", formData.status);

    if (imageFile) {
      form.append("image", imageFile); // must match @RequestParam("image") on backend
    }

    try {
      if (isEditing) {
        await AdminApi.updateCauses(editId, form);
        Swal.fire("Updated", "Cause updated successfully", "success");
      } else {
        await AdminApi.createCauses(form);
        Swal.fire("Success", "Cause created successfully", "success");
      }

      // Reset form
      setFormData({
        title: "",
        shortDescription: "",
        description: "",
        category: "",
        location: "",
        targetAmount: "",
        // currentAmount: "",
        endDate: "",
        status: "ACTIVE",
      });
      setImageFile(null);
      setImagePreview(null);
      setIsEditing(false);
      setEditId(null);
      fetchCauses(); // Re-fetch causes to update the list
    } catch (err) {
      console.error("Error submitting cause", err);
      Swal.fire("Error", "Failed to submit cause", "error");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the cause.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await AdminApi.deleteCauses(id);
        Swal.fire("Deleted!", "Cause has been deleted.", "success");
        fetchCauses(); // Re-fetch causes to update the list
      } catch (err) {
        console.error("Error deleting cause", err);
        Swal.fire("Error", "Failed to delete cause", "error");
      }
    }
  };

  return (
    <div className="manage-causes"> {/* ⭐ Changed from manage-blogs to manage-causes */}
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>

      <h2>Manage Causes</h2>

      <form className="cause-form" onSubmit={handleSubmit} noValidate> {/* ⭐ Changed from blog-form to cause-form */}
        <input
          type="text"
          name="title"
          placeholder="Cause Title"
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <p style={{ color: "red" }}>{errors.title}</p>}

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
        {errors.description && <p style={{ color: "red" }}>{errors.description}</p>}

        <input
          type="number"
          name="targetAmount"
          placeholder="Target Amount"
          value={formData.targetAmount}
          onChange={handleChange}
          min="1"
        />
        {errors.targetAmount && <p style={{ color: "red" }}>{errors.targetAmount}</p>}

        {/* <input
          type="number"
          name="currentAmount"
          placeholder="Current Amount"
          value={formData.currentAmount}
          onChange={handleChange}
          min="0"
        />
        {errors.currentAmount && <p style={{ color: "red" }}>{errors.currentAmount}</p>} */}

        <input
          type="text"
          name="shortDescription"
          placeholder="Short Description"
          value={formData.shortDescription}
          onChange={handleChange}
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
        />

        <input
          type="date"
          name="endDate"
          placeholder="End Date"
          value={formData.endDate}
          onChange={handleChange}
        />

        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            style={{ width: "200px", marginTop: "10px", borderRadius: "8px" }}
          />
        )}

        <button type="submit">{isEditing ? "Update Cause" : "Add Cause"}</button>
      </form>

      <div className="cause-list"> {/* ⭐ Changed from blog-list to cause-list */}
        {Array.isArray(causes) && causes.length > 0 ? (
          causes.map((cause) => (
            <div className="cause-item" key={cause.id || cause._id}> {/* ⭐ Changed from blog-item to cause-item */}
              <div>
                <h3>{cause.title}</h3>
                <p><strong>Short Description:</strong> {cause.shortDescription}</p>
                <p><strong>Description:</strong> {cause.description}</p>
                <p><strong>Category:</strong> {cause.category}</p>
                <p><strong>Location:</strong> {cause.location}</p>
                <p><strong>Status:</strong> {cause.status}</p>
                <p><strong>Target Amount:</strong> ₹{cause.targetAmount?.toLocaleString()}</p>
                <p><strong>Current Amount:</strong> ₹{cause.currentAmount?.toLocaleString()}</p>
                <p><strong>End Date:</strong> {new Date(cause.endDate).toLocaleDateString()}</p>
                {cause.imageUrl && ( // Only render image if imageUrl exists
                  <img
                    src={getImageUrl(cause.imageUrl)}
                    alt={cause.title}
                    // Added height: auto and object-fit for better image handling
                    style={{ width: "100%", maxWidth: "300px", marginTop: "10px", height: "auto", objectFit: "cover", borderRadius: "8px" }}
                  />
                )}
              </div>
              {/* ⭐ Wrapped buttons in a new div */}
              <div className="cause-actions">
                <button className="edit-button" onClick={() => handleUpdate(cause.id || cause._id)}>Edit</button>
                <button className="delete-button" onClick={() => handleDelete(cause.id || cause._id)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>No causes available.</p>
        )}
      </div>
    </div>
  );
};

export default ManageCauses;
