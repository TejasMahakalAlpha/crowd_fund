import React, { useEffect, useState } from "react";
import API, { AdminApi } from "../services/api";
import "./ManageCauses.css";
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

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  
  // ===== NEW/CHANGED CODE START =====
  // This new state will hold the cause we want to view alone.
  // If it's null, we show the list. If it has a cause object, we show only that cause.
  const [causeToView, setCauseToView] = useState(null); 
  // ===== NEW/CHANGED CODE END =====

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
        setCauses([]);
      }
    } catch (err) {
      Swal.fire("Error", "Failed to fetch causes.", "error");
    }
  };

  // Other functions like validateForm, handleChange, handleUpdate, etc. remain the same.
  // ... (Your existing functions: validateForm, handleChange, handleUpdate, handleSubmit, handleImageChange, handleDelete)
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.targetAmount === "") {
      newErrors.targetAmount = "Target Amount is required";
    } else if (isNaN(formData.targetAmount) || Number(formData.targetAmount) <= 0) {
      newErrors.targetAmount = "Target Amount must be a positive number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        endDate: causeToEdit.endDate ? new Date(causeToEdit.endDate).toISOString().slice(0, 10) : "",
        status: causeToEdit.status || "ACTIVE",
      });
      setImagePreview(causeToEdit.imageUrl ? getImageUrl(causeToEdit.imageUrl) : null);
      setEditId(id);
      setIsEditing(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const form = new FormData();
    // ... appending form data ...
    form.append("title", formData.title);
    form.append("shortDescription", formData.shortDescription);
    form.append("description", formData.description);
    form.append("category", formData.category);
    form.append("location", formData.location);
    form.append("targetAmount", formData.targetAmount);
    form.append("endDate", formData.endDate ? `${formData.endDate}T00:00:00` : "");
    form.append("status", formData.status);
    if (imageFile) {
      form.append("image", imageFile);
    }
    try {
      if (isEditing) {
        await AdminApi.updateCauses(editId, form);
        Swal.fire("Updated", "Cause updated successfully", "success");
      } else {
        await AdminApi.createCauses(form);
        Swal.fire("Success", "Cause created successfully", "success");
      }
      // Reset form and state
      setFormData({ title: "", shortDescription: "", description: "", category: "", location: "", targetAmount: "", endDate: "", status: "ACTIVE" });
      setImageFile(null);
      setImagePreview(null);
      setIsEditing(false);
      setEditId(null);
      fetchCauses();
    } catch (err) {
      Swal.fire("Error", "Failed to submit cause", "error");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: "Are you sure?", text: "This will be deleted.", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      try {
        await AdminApi.deleteCauses(id);
        Swal.fire("Deleted!", "Cause has been deleted.", "success");
        fetchCauses();
      } catch (err) {
        Swal.fire("Error", "Failed to delete cause", "error");
      }
    }
  };
  
  // ===== NEW/CHANGED CODE START =====
  // This function will now set the cause to be viewed alone
  const handleShowSingleCause = (cause) => {
    setCauseToView(cause);
  };
  // ===== NEW/CHANGED CODE END =====

  return (
    <div className="manage-causes">
      
      {/* ===== NEW/CHANGED CODE START ===== */}
      {/* We will check if a cause has been selected to be viewed */}
      {causeToView ? (
        // If YES, show only the selected cause's details
        <div className="single-cause-view">
          <button onClick={() => setCauseToView(null)} className="back-button">
             ← Back to All Causes
          </button>
          <h2>Cause Details</h2>
          <div className="cause-item">
              <h3>{causeToView.title}</h3>
              <p><strong>Short Description:</strong> {causeToView.shortDescription}</p>
              <p><strong>Description:</strong> {causeToView.description}</p>
              <p><strong>Category:</strong> {causeToView.category}</p>
              <p><strong>Location:</strong> {causeToView.location}</p>
              <p><strong>Status:</strong> {causeToView.status}</p>
              <p><strong>Target Amount:</strong> ₹{causeToView.targetAmount?.toLocaleString()}</p>
              <p><strong>Current Amount:</strong> ₹{causeToView.currentAmount?.toLocaleString()}</p>
              <p><strong>End Date:</strong> {new Date(causeToView.endDate).toLocaleDateString()}</p>
              {causeToView.imageUrl && (
                <img src={getImageUrl(causeToView.imageUrl)} alt={causeToView.title} style={{ width: "100%", maxWidth: "400px", marginTop: "10px", borderRadius: "8px" }}/>
              )}
          </div>
        </div>
      ) : (
        // If NO, show the normal page with the form and the list
        <>
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>

          <h2>Manage Causes</h2>

          <form className="cause-form" onSubmit={handleSubmit} noValidate>
             {/* Your entire form JSX here... */}
             <input type="text" name="title" placeholder="Cause Title" value={formData.title} onChange={handleChange}/>
             <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows={3}/>
             <input type="number" name="targetAmount" placeholder="Target Amount" value={formData.targetAmount} onChange={handleChange} min="1"/>
             <input type="text" name="shortDescription" placeholder="Short Description" value={formData.shortDescription} onChange={handleChange}/>
             <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange}/>
             <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange}/>
             <input type="date" name="endDate" placeholder="End Date" value={formData.endDate} onChange={handleChange}/>
             <input type="file" accept="image/*" onChange={handleImageChange} />
             {imagePreview && ( <img src={imagePreview} alt="Preview" style={{ width: "200px", marginTop: "10px", borderRadius: "8px" }} /> )}
             <button type="submit">{isEditing ? "Update Cause" : "Add Cause"}</button>
          </form>

          <div className="cause-list">
            {Array.isArray(causes) && causes.length > 0 ? (
              causes.map((cause) => (
                <div className="cause-item" key={cause.id || cause._id}>
                  <div>
                    <h3>{cause.title}</h3>
                    {/* ... other details ... */}
                    <p><strong>Status:</strong> {cause.status}</p>
                  </div>
                  <div className="cause-actions">
                    <button className="edit-button" onClick={() => handleUpdate(cause.id || cause._id)}>Edit</button>
                    <button className="delete-button" onClick={() => handleDelete(cause.id || cause._id)}>Delete</button>
                    
                    {/* The "Copy" button now calls the new function */}
                    <button className="copy-button" onClick={() => handleShowSingleCause(cause)}>Copy</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No causes available.</p>
            )}
          </div>
        </>
      )}
      {/* ===== NEW/CHANGED CODE END ===== */}
    </div>
  );
};

export default ManageCauses;