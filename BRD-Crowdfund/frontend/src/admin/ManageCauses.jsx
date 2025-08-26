// src/admin/ManageCauses.jsx
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
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    category: "",
    location: "",
    targetAmount: "",
    endDate: "",
    status: "ACTIVE",
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [videoFiles, setVideoFiles] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [causeToView, setCauseToView] = useState(null);

  const navigate = useNavigate();

  const getImageUrl = (relativePath) => `${API_BASE}/api/images/${relativePath}`;

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
      endDate: causeToEdit.endDate ? causeToEdit.endDate.slice(0, 16) : "",
      status: causeToEdit.status || "ACTIVE",
    });

    setImagePreviews(causeToEdit.imageUrls?.map((url) => getImageUrl(url)) || []);
    setVideoPreviews(causeToEdit.videoUrls?.map((url) => getImageUrl(url)) || []);

    setEditId(causeToEdit.id || causeToEdit._id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateForm = () => {
    console.log('=== FORM VALIDATION DEBUG ===');
    console.log('Current formData:', formData);

    const newErrors = {};

    // Title validation
    console.log('Validating title:', { value: formData.title, trimmed: formData.title?.trim(), isEmpty: !formData.title?.trim() });
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = "Title is required";
      console.log('❌ Title validation failed');
    } else {
      console.log('✅ Title validation passed');
    }

    // Short description validation
    console.log('Validating shortDescription:', { value: formData.shortDescription, trimmed: formData.shortDescription?.trim(), isEmpty: !formData.shortDescription?.trim() });
    if (!formData.shortDescription || !formData.shortDescription.trim()) {
      newErrors.shortDescription = "Short description is required";
      console.log('❌ Short description validation failed');
    } else {
      console.log('✅ Short description validation passed');
    }

    // Description validation
    console.log('Validating description:', { value: formData.description, trimmed: formData.description?.trim(), isEmpty: !formData.description?.trim(), length: formData.description?.length });
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = "Description is required";
      console.log('❌ Description validation failed - empty');
    } else if (formData.description.length < 20) {
      newErrors.description = "Description should be at least 20 characters";
      console.log('❌ Description validation failed - too short');
    } else {
      console.log('✅ Description validation passed');
    }

    // Category validation
    console.log('Validating category:', { value: formData.category, trimmed: formData.category?.trim(), isEmpty: !formData.category?.trim() });
    if (!formData.category || !formData.category.trim()) {
      newErrors.category = "Category is required";
      console.log('❌ Category validation failed');
    } else {
      console.log('✅ Category validation passed');
    }

    // Location validation
    console.log('Validating location:', { value: formData.location, trimmed: formData.location?.trim(), isEmpty: !formData.location?.trim() });
    if (!formData.location || !formData.location.trim()) {
      newErrors.location = "Location is required";
      console.log('❌ Location validation failed');
    } else {
      console.log('✅ Location validation passed');
    }

    // Target amount validation
    console.log('Validating targetAmount:', { value: formData.targetAmount, number: Number(formData.targetAmount), isValid: formData.targetAmount && Number(formData.targetAmount) > 0 });
    if (!formData.targetAmount || Number(formData.targetAmount) <= 0) {
      newErrors.targetAmount = "Target amount must be greater than 0";
      console.log('❌ Target amount validation failed');
    } else {
      console.log('✅ Target amount validation passed');
    }

    // End date validation
    console.log('Validating endDate:', { value: formData.endDate, isEmpty: !formData.endDate, date: new Date(formData.endDate), now: new Date(), isPast: formData.endDate ? new Date(formData.endDate) < new Date() : null });
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
      console.log('❌ End date validation failed - empty');
    } else if (new Date(formData.endDate) < new Date()) {
      newErrors.endDate = "End date cannot be in the past";
      console.log('❌ End date validation failed - past date');
    } else {
      console.log('✅ End date validation passed');
    }

    // File validation
    console.log('Validating files:', { imageFiles: imageFiles.length, videoFiles: videoFiles.length });
    imageFiles.forEach((file, index) => {
      if (file && !file.type.startsWith("image/")) {
        newErrors.images = "All files must be images";
        console.log(`❌ Image file ${index} validation failed:`, file.type);
      }
    });
    videoFiles.forEach((file, index) => {
      if (file && !file.type.startsWith("video/")) {
        newErrors.videos = "All files must be videos";
        console.log(`❌ Video file ${index} validation failed:`, file.type);
      }
    });

    setErrors(newErrors);
    console.log('=== VALIDATION SUMMARY ===');
    console.log('Errors found:', newErrors);
    console.log('Validation passed:', Object.keys(newErrors).length === 0);
    console.log('============================');

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    if (!validateForm()) {
      console.log('Form validation failed');
      Swal.fire({
        title: "Validation Error",
        text: "Please fill in all required fields correctly",
        icon: "error",
        confirmButtonText: "OK"
      });
      return;
    }

    // Show loading indicator
    Swal.fire({
      title: isEditing ? 'Updating Cause...' : 'Creating Cause...',
      text: 'Please wait while we process your request',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    console.log('Form validation passed, creating FormData...');
    const formPayload = new FormData();

    // Add form fields to FormData
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        if (key === "endDate") {
          // Convert to ISO string for backend compatibility
          const endDateFormatted = new Date(formData[key]).toISOString().slice(0, 19);
          formPayload.append(key, endDateFormatted);
          console.log(`Added ${key}:`, endDateFormatted);
        } else {
          formPayload.append(key, formData[key].toString());
          console.log(`Added ${key}:`, formData[key].toString());
        }
      }
    });

    // Add image files
    imageFiles.forEach((file, index) => {
      formPayload.append("images", file);
      console.log(`Added image ${index}:`, file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    });

    // Add video files
    videoFiles.forEach((file, index) => {
      formPayload.append("videos", file);
      console.log(`Added video ${index}:`, file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    });

    // Log FormData contents for debugging
    console.log('FormData entries:');
    for (let [key, value] of formPayload.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.type}, ${(value.size / 1024).toFixed(2)}KB)`);
      } else {
        console.log(`${key}:`, value);
      }
    }

    try {
      console.log('Sending API request...');
      let response;

      if (isEditing) {
        console.log('Updating cause with ID:', editId);
        response = await AdminApi.updateCauseWithMedia(editId, formPayload);
        console.log('Update response:', response);
      } else {
        console.log('Creating new cause via /admin/causes/with-media endpoint...');
        response = await AdminApi.createCauseWithMedia(formPayload);
        console.log('Create response:', response);
      }

      // Success - close loading and show success message
      Swal.close();

      await Swal.fire({
        title: "Success!",
        text: isEditing ? "Cause updated successfully" : "Cause created successfully",
        icon: "success",
        confirmButtonText: "OK"
      });

      // Reset form and refresh data
      console.log('Resetting form and refreshing data...');
      setFormData({ title: "", shortDescription: "", description: "", category: "", location: "", targetAmount: "", endDate: "", status: "ACTIVE" });
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFiles([]);
      setVideoPreviews([]);
      setIsEditing(false);
      setEditId(null);
      setErrors({}); // Clear errors

      // Refresh the causes list
      await fetchCauses();

    } catch (err) {
      // Close loading indicator
      Swal.close();

      console.error("Submit error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        config: err.config,
        url: err.config?.url
      });

      let errorMessage = 'Failed to submit cause';

      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please check your admin credentials.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid data provided. Please check your inputs.';
      } else if (err.response?.status === 413) {
        errorMessage = 'File size too large. Please use smaller files.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check if the backend server is running on http://localhost:8080';
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const newFiles = Array.from(files || []);

    if (name === "images") {
      setImageFiles((prev) => [...prev, ...newFiles]);
      setImagePreviews((prev) => [...prev, ...newFiles.map((file) => URL.createObjectURL(file))]);
    }

    if (name === "videos") {
      setVideoFiles((prev) => [...prev, ...newFiles]);
      setVideoPreviews((prev) => [...prev, ...newFiles.map((file) => URL.createObjectURL(file))]);
    }
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will be deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

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

  const handleShowSingleCause = (cause) => setCauseToView(cause);

  return (
    <div className="manage-causes">
      {causeToView ? (
        <div className="single-cause-view">
          <button onClick={() => setCauseToView(null)} className="back-button">← Back to All Causes</button>
          <h2>Cause Details</h2>
          <div className="cause-item">
            <h3>{causeToView.title}</h3>
            <p><strong>Description:</strong> {causeToView.description}</p>
            <p><strong>Short Description:</strong> {causeToView.shortDescription}</p>
            <p><strong>Target Amount:</strong> ₹{causeToView.targetAmount?.toLocaleString() || 0}</p>
            <p><strong>Category:</strong> {causeToView.category || "Not set"}</p>
            <p><strong>Location:</strong> {causeToView.location || "Not set"}</p>
            <p><strong>End date:</strong> {causeToView.endDate ? new Date(causeToView.endDate).toLocaleString() : "Not set"}</p>

            <div className="media-container" style={{ marginTop: "10px" }}>
              {causeToView.imageUrls?.map((img, i) => (
                <img key={i} src={getImageUrl(img)} alt={`image-${i}`} style={{ width: "200px", margin: "5px", borderRadius: "8px" }} />
              ))}
              {causeToView.videoUrls?.map((vid, i) => (
                <video key={i} src={getImageUrl(vid)} controls style={{ width: "200px", margin: "5px", borderRadius: "8px" }} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <button onClick={() => navigate(-1)} className="back-button">← Back</button>
          <h2>Manage Causes</h2>

          <form className="cause-form" onSubmit={handleSubmit} noValidate>
            <label>
              Cause Title: <span style={{ color: "red" }}>*</span>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter cause title" />
              {errors.title && <p className="error">{errors.title}</p>}
            </label>

            <label>
              Short Description: <span style={{ color: "red" }}>*</span>
              <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="Enter short description" />
              {errors.shortDescription && <p className="error">{errors.shortDescription}</p>}
            </label>

            <label>
              Description: <span style={{ color: "red" }}>*</span>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Enter detailed description" />
              {errors.description && <p className="error">{errors.description}</p>}
            </label>

            <label>
              Target Amount: <span style={{ color: "red" }}>*</span>
              <input type="number" name="targetAmount" value={formData.targetAmount} onChange={handleChange} min="1" placeholder="Enter target amount" />
              {errors.targetAmount && <p className="error">{errors.targetAmount}</p>}
            </label>

            <label>
              Category: <span style={{ color: "red" }}>*</span>
              <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Enter category" />
              {errors.category && <p className="error">{errors.category}</p>}
            </label>

            <label>
              Location: <span style={{ color: "red" }}>*</span>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Enter location" />
              {errors.location && <p className="error">{errors.location}</p>}
            </label>

            <label>
              End Date Time: <span style={{ color: "red" }}>*</span>
              <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} min={new Date().toISOString().slice(0, 16)} />
              {errors.endDate && <p className="error">{errors.endDate}</p>}
            </label>

            <div className="form-group file-upload-group">
              <label htmlFor="images">Upload Images</label>
              <input type="file" id="images" name="images" multiple accept="image/*" onChange={handleFileChange} />
              {errors.images && <p className="error">{errors.images}</p>}
              <div className="preview-list">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="image-preview-container">
                    <img src={src} alt="preview" className="form-image-preview" />
                    <button type="button" className="remove-file-btn" onClick={() => removeImage(i)}>X</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group file-upload-group">
              <label htmlFor="videos">Upload Videos</label>
              <input type="file" id="videos" name="videos" multiple accept="video/*" onChange={handleFileChange} />
              {errors.videos && <p className="error">{errors.videos}</p>}
              <div className="preview-list">
                {videoPreviews.map((src, i) => (
                  <div key={i} className="video-preview-container">
                    <video src={src} controls className="form-video-preview" />
                    <button type="button" className="remove-file-btn" onClick={() => removeVideo(i)}>X</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              {/* <button type="button" onClick={() => console.log('Current form state:', formData)} style={{ background: '#2196F3', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>Debug Form Data</button> */}
              {/* <button
                type="button"
                onClick={async () => {
                  try {
                    console.log('Testing API connection...');
                    const testData = new FormData();
                    testData.append('title', 'Test Cause');
                    testData.append('description', 'This is a test cause to check API integration');
                    testData.append('targetAmount', '1000');

                    console.log('Sending test request to:', `${import.meta.env.VITE_API_BASE_URL}/admin/causes/with-media`);
                    const response = await AdminApi.createCauseWithMedia(testData);
                    console.log('✅ Test API call successful:', response.data);
                    Swal.fire('Success', 'API test successful! Backend is working.', 'success');
                    fetchCauses(); // Refresh the list
                  } catch (error) {
                    console.error('❌ Test API call failed:', error);
                    console.error('Error details:', {
                      status: error.response?.status,
                      statusText: error.response?.statusText,
                      data: error.response?.data,
                      message: error.message
                    });
                    Swal.fire('Error', `API test failed: ${error.response?.status || error.message}`, 'error');
                  }
                }}
                style={{ background: '#FF9800', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
              >
                🧪 Test API
              </button> */}
              <button type="submit">{isEditing ? "Update Cause" : "Add Cause"}</button>
              {isEditing && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setEditId(null);
                    setFormData({ title: "", shortDescription: "", description: "", category: "", location: "", targetAmount: "", endDate: "", status: "ACTIVE" });
                    setImageFiles([]);
                    setImagePreviews([]);
                    setVideoFiles([]);
                    setVideoPreviews([]);
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className="cause-list">
            {causes.map((cause) => (
              <div className="cause-item" key={cause.id || cause._id}>
                <h3>{cause.title}</h3>
                <p><strong>End date:</strong> {cause.endDate ? new Date(cause.endDate).toLocaleString() : "Not set"}</p>
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
