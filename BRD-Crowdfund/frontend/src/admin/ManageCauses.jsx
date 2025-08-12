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
    title: "", shortDescription: "", description: "", category: "",
    location: "", targetAmount: "", endDate: "", status: "ACTIVE",
  });

  const [imagePreview, setImagePreview] = useState([]);
  const [imageFile, setImageFile] = useState([]);
  const [displayFileType, setDisplayFileType] = useState('');
  const [causeToView, setCauseToView] = useState(null);

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
      setCauses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch causes.", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = (causeToEdit) => {
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

    const mediaPath = causeToEdit.mediaType === "VIDEO" ? causeToEdit.videoUrl : causeToEdit.imageUrl;
    if (mediaPath) {
      setImagePreview(getImageUrl(mediaPath));
      setDisplayFileType(causeToEdit.mediaType === "VIDEO" ? "video" : "image");
    } else {
      setImagePreview(null);
      setDisplayFileType('');
    }

    setEditId(causeToEdit.id || causeToEdit._id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  // --- YEH FUNCTION THEEK KIYA GAYA HAI ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formPayload = new FormData();
    for (const key in formData) {
      formPayload.append(key, formData[key]);
    }
    if (imageFile) {
      formPayload.append(displayFileType === 'video' ? "video" : "image", imageFile);
    }

    console.log(displayFileType)
    try {
      if (isEditing) {
        // UPDATE LOGIC
        if (displayFileType === 'video') {
          await AdminApi.updateCauseWithVideo(editId, formPayload);
        } else {
          await AdminApi.updateCauseWithImage(editId, formPayload);
        }
        Swal.fire("Updated", "Cause updated successfully", "success");
      } else {
        // CREATE LOGIC
        if (displayFileType === 'video') {
          await AdminApi.createCauseWithVideo(formPayload);
        } else {
          await AdminApi.createCauseWithImage(formPayload);
        }
        Swal.fire("Success", "Cause created successfully", "success");
      }
      // Reset form
      setFormData({ title: "", shortDescription: "", description: "", category: "", location: "", targetAmount: "", endDate: "", status: "ACTIVE" });
      setImageFile(null);
      setImagePreview(null);
      setDisplayFileType('');
      setIsEditing(false);
      setEditId(null);
      fetchCauses();
    } catch (err) {
      console.error("Submit error:", err.response ? err.response.data : err);
      Swal.fire("Error", "Failed to submit cause", "error");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setDisplayFileType('image');
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else if (file.type.startsWith('video/')) {
        setDisplayFileType('video');
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        Swal.fire("Error", "Unsupported file type. Please select an image or video.", "error");
        e.target.value = null;
      }
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

  const handleShowSingleCause = (cause) => {
    setCauseToView(cause);
  };

  return (
    <div className="manage-causes">
      {causeToView ? (
        <div className="single-cause-view">
          <button onClick={() => setCauseToView(null)} className="back-button">
            ← Back to All Causes
          </button>
          <h2>Cause Details</h2>
          <div className="cause-item">
            <h3>{causeToView.title}</h3>
            <p><strong>Description:</strong> {causeToView.description}</p>
            <p><strong>Target Amount:</strong> ₹{causeToView.targetAmount?.toLocaleString()}</p>
            {(causeToView.imageUrl || causeToView.videoUrl) && (
              <div className="media-container" style={{ marginTop: "10px" }}>
                {causeToView.mediaType === "VIDEO" ? (
                  <video
                    src={getImageUrl(causeToView.videoUrl)}
                    controls
                    style={{ width: "100%", maxWidth: "400px", borderRadius: "8px" }}
                  />
                ) : (
                  <img
                    src={getImageUrl(causeToView.imageUrl)}
                    alt={causeToView.title}
                    style={{ width: "100%", maxWidth: "400px", borderRadius: "8px" }}
                  />
                )}
              </div>
            )}

          </div>
        </div>
      ) : (
        <>
          <button onClick={() => navigate(-1)} className="back-button">← Back</button>
          <h2>Manage Causes</h2>
          <form className="cause-form" onSubmit={handleSubmit} noValidate>
            <input type="text" name="title" placeholder="Cause Title" value={formData.title} onChange={handleChange} />
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows={3} />
            <input type="number" name="targetAmount" placeholder="Target Amount" value={formData.targetAmount} onChange={handleChange} min="1" />
            <input type="text" name="shortDescription" placeholder="Short Description" value={formData.shortDescription} onChange={handleChange} />
            <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} />
            <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
            <input type="date" name="endDate" placeholder="End Date" value={formData.endDate} onChange={handleChange} />

            <label>Display Image or Video:</label>
            <input type="file" accept="image/*,video/*" multiple onChange={handleImageChange} key={imageFile || ''} />

            {imagePreview && (
              <div className="preview-container" style={{ marginTop: "10px" }}>
                {displayFileType === 'image' && (
                  <img src={imagePreview} alt="Preview" style={{ width: "200px", borderRadius: "8px" }} />
                )}
                {displayFileType === 'video' && (
                  <video src={imagePreview} controls autoPlay muted loop style={{ width: "200px", borderRadius: "8px" }} />
                )}
              </div>
            )}

            <button type="submit">{isEditing ? "Update Cause" : "Add Cause"}</button>
            {isEditing && <button type="button" onClick={() => { setIsEditing(false); setEditId(null); setFormData({ title: "", shortDescription: "", description: "", category: "", location: "", targetAmount: "", endDate: "", status: "ACTIVE" }); setImagePreview(null); setDisplayFileType(''); }}>Cancel Edit</button>}
          </form>

          <div className="cause-list">
            {causes.map((cause) => (
              <div className="cause-item" key={cause.id || cause._id}>
                <div>
                  <h3>{cause.title}</h3>
                  <p><strong>Status:</strong> {cause.status}</p>
                </div>
                <div className="cause-actions">
                  <button className="edit-button" onClick={() => handleUpdate(cause)}>Edit</button>
                  <button className="delete-button" onClick={() => handleDelete(cause.id || cause._id)}>Delete</button>
                  <button className="copy-button" onClick={() => handleShowSingleCause(cause)}>View</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ManageCauses;