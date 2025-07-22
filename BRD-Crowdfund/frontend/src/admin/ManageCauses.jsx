import React, { useEffect, useState } from "react";
import { AdminApi } from "../services/api";
import "./ManageBlogs.css";
import Swal from "sweetalert2";

const ManageCauses = () => {
  const [causes, setCauses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    targetAmount: "",
    currentAmount: 0, // always 0 on creation
    imageUrl: "",
    status: "ACTIVE",
    category: "",
    location: "",
    endDate: "",
  });

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
    if (!formData.shortDescription.trim())
      newErrors.shortDescription = "Short Description is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.targetAmount === "") {
      newErrors.targetAmount = "Target Amount is required";
    } else if (isNaN(formData.targetAmount) || Number(formData.targetAmount) <= 0) {
      newErrors.targetAmount = "Target Amount must be a positive number";
    }
    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.endDate) newErrors.endDate = "End Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      await AdminApi.createCauses({
        ...formData,
        targetAmount: Number(formData.targetAmount),
        currentAmount: 0,
      });
      Swal.fire("Success", "Cause created successfully", "success");
      setFormData({
        title: "",
        shortDescription: "",
        description: "",
        targetAmount: "",
        currentAmount: 0,
        imageUrl: "",
        status: "ACTIVE",
        category: "",
        location: "",
        endDate: "",
      });
      setErrors({});
      fetchCauses();
    } catch (err) {
      console.error("Error creating cause", err);
      Swal.fire("Error", "Failed to create cause", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await AdminApi.deleteCauses(id);
      Swal.fire("Deleted!", "Cause has been deleted.", "success");
      fetchCauses();
    } catch (err) {
      console.error("Error deleting cause", err);
      Swal.fire("Error", "Failed to delete cause", "error");
    }
  };

  return (
    <div className="manage-blogs">
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

        <input
          type="text"
          name="shortDescription"
          placeholder="Short Description"
          value={formData.shortDescription}
          onChange={handleChange}
        />
        {errors.shortDescription && (
          <p style={{ color: "red" }}>{errors.shortDescription}</p>
        )}

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
        {errors.description && (
          <p style={{ color: "red" }}>{errors.description}</p>
        )}

        <input
          type="number"
          name="targetAmount"
          placeholder="Target Amount"
          value={formData.targetAmount}
          onChange={handleChange}
          min="1"
        />
        {errors.targetAmount && (
          <p style={{ color: "red" }}>{errors.targetAmount}</p>
        )}

        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL (optional)"
          value={formData.imageUrl}
          onChange={handleChange}
        />

        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="">Select Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
        {errors.status && <p style={{ color: "red" }}>{errors.status}</p>}

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
        {errors.endDate && <p style={{ color: "red" }}>{errors.endDate}</p>}

        <button type="submit">Add Cause</button>
      </form>

      <div className="blog-list">
        {Array.isArray(causes) && causes.length > 0 ? (
          causes.map((cause) => (
            <div className="blog-item" key={cause.id || cause._id}>
              <div>
                <h3>{cause.title}</h3>
                <p>
                  <strong>Short Description:</strong> {cause.shortDescription}
                </p>
                <p>
                  <strong>Target Amount:</strong> ₹
                  {cause.targetAmount?.toLocaleString()}
                </p>
                <p>
                  <strong>Current Amount:</strong> ₹
                  {cause.currentAmount?.toLocaleString()}
                </p>
                <p>
                  <strong>Description:</strong> {cause.description}
                </p>
                <p>
                  <strong>Status:</strong> {cause.status}
                </p>
                <p>
                  <strong>Category:</strong> {cause.category}
                </p>
                <p>
                  <strong>Location:</strong> {cause.location}
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  {new Date(cause.endDate).toLocaleDateString()}
                </p>
                {cause.imageUrl && (
                  <img
                    src={cause.imageUrl}
                    alt={cause.title}
                    style={{ maxWidth: "100%", maxHeight: 200 }}
                  />
                )}
              </div>
              <button onClick={() => handleDelete(cause.id || cause._id)}>
                Delete
              </button>
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
