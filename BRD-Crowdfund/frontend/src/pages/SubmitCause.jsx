// src/pages/SubmitCause.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import "./SubmitCause.css"; 
// Ensure API_BASE is available from your environment variables, e.g., VITE_API_BASE_URL=http://localhost:8080
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Helper for API calls (using direct fetch, assuming PublicApi is integrated elsewhere)
// If you want to use PublicApi.submitPersonalCauseWithFiles from src/services/api.js,
// then import { PublicApi } from '../services/api'; and call PublicApi.submitPersonalCauseWithFiles(form)
const submitPersonalCauseApi = async (formData) => {
  try {
    const response = await fetch(`${API_BASE}/api/personal-cause-submissions/with-files`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error or non-JSON response' })); // Handle non-JSON error response
      throw new Error(errorData.error || response.statusText || 'Submission failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Submission API error:', error);
    throw error; // Re-throw to be caught by handleSubmit
  }
};

const SubmitCause = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    targetAmount: "", // Number type
    category: "",
    location: "",
    endDate: "", // datetime-local format
    submitterName: "",
    submitterEmail: "",
    submitterPhone: "",
    submitterMessage: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [proofDocumentFile, setProofDocumentFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [proofDocumentPreview, setProofDocumentPreview] = useState(null); // Not visually used for docs, but holds URL.createObjectURL result
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear error on change
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    const newErrors = { ...errors };

    // --- File Validation Logic (from API docs) ---
    const validateFile = (fileObj, type) => {
      const fileErrors = [];
      if (!fileObj) return [];

      if (type === "image") {
        const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!imageTypes.includes(fileObj.type)) {
          fileErrors.push('Image must be JPG, PNG, GIF, or WebP');
        }
        if (fileObj.size > 5 * 1024 * 1024) { // 5MB
          fileErrors.push('Image must be less than 5MB');
        }
      } else if (type === "document") {
        const docTypes = [
          'application/pdf',
          'application/msword', // .doc
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
          'image/jpeg',
          'image/png'
        ];
        if (!docTypes.includes(fileObj.type)) {
          fileErrors.push('Document must be PDF, DOC, DOCX, JPG, or PNG');
        }
        if (fileObj.size > 10 * 1024 * 1024) { // 10MB
          fileErrors.push('Document must be less than 10MB');
        }
      }
      return fileErrors;
    };
    // --- End File Validation Logic ---

    if (name === "image") {
      const fileErrors = validateFile(file, "image");
      if (fileErrors.length > 0) {
        newErrors.image = fileErrors.join(", ");
        setImageFile(null);
        setImagePreview(null);
        e.target.value = null; // Clear input
      } else {
        setImageFile(file);
        setImagePreview(file ? URL.createObjectURL(file) : null);
        newErrors.image = "";
      }
    } else if (name === "proofDocument") {
      const fileErrors = validateFile(file, "document");
      if (fileErrors.length > 0) {
        newErrors.proofDocument = fileErrors.join(", ");
        setProofDocumentFile(null);
        setProofDocumentPreview(null);
        e.target.value = null; // Clear input
      } else {
        setProofDocumentFile(file);
        setProofDocumentPreview(file ? URL.createObjectURL(file) : null); 
        newErrors.proofDocument = "";
      }
    }
    setErrors(newErrors);
  };

  const validateFormFields = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.targetAmount || isNaN(Number(formData.targetAmount)) || Number(formData.targetAmount) <= 0) {
      newErrors.targetAmount = "Target amount must be a positive number";
    }
    if (!formData.submitterName.trim()) newErrors.submitterName = "Your Name is required";
    if (!formData.submitterEmail.trim()) {
      newErrors.submitterEmail = "Your Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.submitterEmail)) {
      newErrors.submitterEmail = "Invalid email format";
    }
    // Optional fields can be validated for format if present
    if (formData.endDate && isNaN(new Date(formData.endDate).getTime())) {
        newErrors.endDate = "Invalid end date/time";
    }

    setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formFieldsValid = validateFormFields();
    const filesValid = !errors.image && !errors.proofDocument; // Check if file errors exist from handleFileChange

    if (!formFieldsValid || !filesValid) {
      Swal.fire("Validation Error", "Please correct the errors in the form.", "error");
      return;
    }

    setIsSubmitting(true);
    const form = new FormData();
    for (const key in formData) {
      if (formData[key] !== "") { // Only append non-empty fields
        if (key === "targetAmount") {
          form.append(key, Number(formData[key])); // Ensure number type for API
        } else {
          form.append(key, formData[key]);
        }
      }
    }

    if (imageFile) {
      form.append("image", imageFile);
    }
    if (proofDocumentFile) {
      form.append("proofDocument", proofDocumentFile);
    }

    try {
      await submitPersonalCauseApi(form); // Call the API helper
      Swal.fire("Success", "Your cause has been submitted for review!", "success");
      // Reset form
      setFormData({
        title: "",
        description: "",
        shortDescription: "",
        targetAmount: "",
        category: "",
        location: "",
        endDate: "",
        submitterName: "",
        submitterEmail: "",
        submitterPhone: "",
        submitterMessage: "",
      });
      setImageFile(null);
      setProofDocumentFile(null);
      setImagePreview(null);
      setProofDocumentPreview(null);
      setErrors({});
    } catch (error) {
      Swal.fire("Submission Failed", error.message || "Something went wrong. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="submit-cause-container">
      <h2>Submit Your Personal Cause</h2>
      <p className="intro-text">
        Do you have a cause close to your heart that needs support?
        Fill out this form to submit your personal cause for our admin review.
        Once approved, it can be listed on our platform for donations and support.
      </p>

      <form className="cause-submission-form" onSubmit={handleSubmit} noValidate>
        <h3>Cause Details</h3>
        <div className="form-group">
          <label htmlFor="title">Cause Title <span className="required-star">*</span></label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Help a local school, Medical aid for a child"
            required
          />
          {errors.title && <p className="error-message">{errors.title}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="shortDescription">Short Description</label>
          <input
            type="text"
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="A brief summary of your cause (max 100 chars)"
            maxLength="100"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Detailed Description <span className="required-star">*</span></label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide full details about your cause, why it's important, and how funds will be used."
            rows="5"
            required
          ></textarea>
          {errors.description && <p className="error-message">{errors.description}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="targetAmount">Target Amount (₹) <span className="required-star">*</span></label>
          <input
            type="number"
            id="targetAmount"
            name="targetAmount"
            value={formData.targetAmount}
            onChange={handleChange}
            placeholder="e.g., 50000.00"
            step="0.01"
            min="0"
            required
          />
          {errors.targetAmount && <p className="error-message">{errors.targetAmount}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Education, Health, Environment"
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., City, State, Country"
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">Expected End Date & Time</label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />
          {errors.endDate && <p className="error-message">{errors.endDate}</p>}
        </div>

        <h3>Your Contact Information</h3>
        <div className="form-group">
          <label htmlFor="submitterName">Your Full Name <span className="required-star">*</span></label>
          <input
            type="text"
            id="submitterName"
            name="submitterName"
            value={formData.submitterName}
            onChange={handleChange}
            placeholder="e.g., John Doe"
            required
          />
          {errors.submitterName && <p className="error-message">{errors.submitterName}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="submitterEmail">Your Email <span className="required-star">*</span></label>
          <input
            type="email"
            id="submitterEmail"
            name="submitterEmail"
            value={formData.submitterEmail}
            onChange={handleChange}
            placeholder="e.g., you@example.com"
            required
          />
          {errors.submitterEmail && <p className="error-message">{errors.submitterEmail}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="submitterPhone">Your Phone Number</label>
          <input
            type="tel"
            id="submitterPhone"
            name="submitterPhone"
            value={formData.submitterPhone}
            onChange={handleChange}
            placeholder="e.g., +1234567890"
          />
        </div>

        <div className="form-group">
          <label htmlFor="submitterMessage">Additional Message to Admin</label>
          <textarea
            id="submitterMessage"
            name="submitterMessage"
            value={formData.submitterMessage}
            onChange={handleChange}
            placeholder="Any extra notes or requests for the admin."
            rows="3"
          ></textarea>
        </div>

        <h3>Supporting Files</h3>
        <div className="form-group file-upload-group">
          <label htmlFor="image">Cause Display Image (Max 5MB - JPG, PNG, GIF, WebP)</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
          />
          {errors.image && <p className="error-message">{errors.image}</p>}
          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Cause Preview" className="form-image-preview" />
              <button type="button" className="remove-file-btn" onClick={() => {setImageFile(null); setImagePreview(null); document.getElementById('image').value = '';}}>X</button>
            </div>
          )}
        </div>

        <div className="form-group file-upload-group">
          <label htmlFor="proofDocument">Proof Document (Max 10MB - PDF, DOC, DOCX, JPG, PNG)</label>
          <input
            type="file"
            id="proofDocument"
            name="proofDocument"
            accept=".pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
            onChange={handleFileChange}
          />
          {errors.proofDocument && <p className="error-message">{errors.proofDocument}</p>}
          {proofDocumentFile && (
            <div className="file-preview-container">
              <p className="uploaded-file-name">{proofDocumentFile.name}</p>
              <button type="button" className="remove-file-btn" onClick={() => {setProofDocumentFile(null); setProofDocumentPreview(null); document.getElementById('proofDocument').value = '';}}>X</button>
            </div>
          )}
        </div>

        <button type="submit" className="submit-cause-btn" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Cause for Review"}
        </button>
      </form>
    </div>
  );
};

export default SubmitCause;