import React, { useEffect, useState } from "react";
import { AdminApi } from "../services/api";
import "./ManageBlogs.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";


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
    imageUrl: "",
    status: "ACTIVE",
  });
  const navigate = useNavigate();



  const [errors, setErrors] = useState({});

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

    if (formData.currentAmount === "") {
      newErrors.currentAmount = "Current Amount is required";
    } else if (isNaN(formData.currentAmount) || Number(formData.currentAmount) < 0) {
      newErrors.currentAmount = "Current Amount must be zero or a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        currentAmount: causeToEdit.currentAmount || 0,
        endDate: causeToEdit.endDate ? causeToEdit.endDate.slice(0, 10) : "", // format YYYY-MM-DD
        imageUrl: causeToEdit.imageUrl || "",
        status: causeToEdit.status || "ACTIVE",
      });
      setEditId(id);
      setIsEditing(true);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "targetAmount" ? value : value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {

      const payload = {
        ...formData,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount),
        endDate: formData.endDate ? `${formData.endDate}T00:00:00` : null,
      };

      if (isEditing) {
        await AdminApi.updateCauses(editId, payload);
        Swal.fire("Updated", "Cause updated successfully", "success");
      } else {
        await AdminApi.createCauses(payload);
        Swal.fire("Success", "Cause created successfully", "success");
      }

      Swal.fire("Success", "Cause created successfully", "success");
      setFormData({
        title: "",
        shortDescription: "",
        description: "",
        category: "",
        location: "",
        targetAmount: "",
        currentAmount: "",
        endDate: "",
        imageUrl: "",
        status: "ACTIVE",
      });
      setErrors({});
      setIsEditing(false);
      setEditId(null);
      fetchCauses();
    } catch (err) {
      console.error("Error creating cause", err);
      Swal.fire("Error", "Failed to create cause", "error");
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
        fetchCauses();
      } catch (err) {
        console.error("Error deleting cause", err);
        Swal.fire("Error", "Failed to delete cause", "error");
      }
    }
  };


  return (
    <div className="manage-blogs">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>

      <h2>Manage Causes</h2>

      <form className="blog-form" onSubmit={handleSubmit} noValidate>
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

        <input
          type="number"
          name="currentAmount"
          placeholder="Current Amount"
          value={formData.currentAmount}
          onChange={handleChange}
          min="0"
        />
        {errors.currentAmount && <p style={{ color: "red" }}>{errors.currentAmount}</p>}

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

        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL"
          value={formData.imageUrl}
          onChange={handleChange}
        />


        <button type="submit">{isEditing ? "Update Cause" : "Add Cause"}</button>

      </form>


      <div className="blog-list">
        {Array.isArray(causes) && causes.length > 0 ? (
          causes.map((cause) => (
            <div className="blog-item" key={cause.id || cause._id}>
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
                <img src={cause.imageUrl} alt={cause.title} style={{ width: "100%", maxWidth: "300px", marginTop: "10px" }} />
              </div>
              <button className="edit-button" onClick={() => handleUpdate(cause.id || cause._id)}>Edit</button>
              <button onClick={() => handleDelete(cause.id || cause._id)}>Delete</button>
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
