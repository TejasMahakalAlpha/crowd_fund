import React, { useEffect, useState } from "react";
import { AdminApi } from "../services/api";
import "./ManageBlogs.css";
import Swal from "sweetalert2";

const ManageCauses = () => {
  const [causes, setCauses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
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
        title: formData.title,
        description: formData.description,
        targetAmount: Number(formData.targetAmount),
      });

      Swal.fire("Success", "Cause created successfully", "success");
      setFormData({
        title: "",
        description: "",
        targetAmount: "",
      });
      setErrors({});
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

        <button type="submit">Add Cause</button>
      </form>


      <div className="blog-list">
        {Array.isArray(causes) && causes.length > 0 ? (
          causes.map((cause) => (
            <div className="blog-item" key={cause.id || cause._id}>
              <div>
                <h3>{cause.title}</h3>
                <p><strong>Description:</strong> {cause.description}</p>
                <p><strong>Target Amount:</strong> ₹{cause.targetAmount?.toLocaleString()}</p>
              </div>
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
