import React, { useEffect, useState } from "react";
import API, { AdminApi } from "../services/api"; // ✅ Correct path to your configured Axios instance
import "./ManageBlogs.css"; // Reusing styles

const ManageCauses = () => {
  const [causes, setCauses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goalAmount: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchCauses();
  }, []);

  const fetchCauses = async () => {
    try {
      // const res = await API.get("/causes"); // ✅ Uses baseURL + /causes
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // await API.post("/causes", {
      //   ...formData,
      //   goalAmount: parseFloat(formData.goalAmount),
      // });
      await AdminApi.createCauses(formData, 'goalAmount: parseFloat(formData.goalAmount)');
      setFormData({ title: "", description: "", goalAmount: "", imageUrl: "" });
      fetchCauses();
    } catch (err) {
      console.error("❌ Error creating cause", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      // await API.delete(`/causes/${id}`);
      await AdminApi.deleteCauses(id);
      fetchCauses();
    } catch (err) {
      console.error("❌ Error deleting cause", err);
    }
  };

  return (
    <div className="manage-blogs">
      <h2>Manage Causes</h2>

      <form className="blog-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Cause Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          required
        />
        <input
          type="number"
          name="goalAmount"
          placeholder="Goal Amount"
          value={formData.goalAmount}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL (optional)"
          value={formData.imageUrl}
          onChange={handleChange}
        />
        <button type="submit">Add Cause</button>
      </form>

      <div className="blog-list">
        {Array.isArray(causes) &&
          causes.map((cause) => (
            <div className="blog-item" key={cause._id}>
              <div>
                <h3>{cause.title}</h3>
                <p>₹{cause.goalAmount?.toLocaleString()}</p>
                <p>{cause.description}</p>
              </div>
              <button onClick={() => handleDelete(cause._id)}>Delete</button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ManageCauses;
