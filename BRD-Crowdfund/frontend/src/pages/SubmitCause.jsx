// src/pages/SubmitCause.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import "./SubmitCause.css";
import { PublicApi } from "../services/api";

// This part is unchanged
const submitPersonalCauseApi = async (formData) => {
  try {
    const response = await PublicApi.submitCauseWithImageVideoAndDocumnent(formData);
    return response.data;
  } catch (error) {
    console.error("Error response from API:", error?.response?.data || error.message);

    throw new Error(
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Submission failed. Please check your files and try again."
    );
  }
};


const SubmitCause = () => {
  // State definitions are unchanged
  const [formData, setFormData] = useState({
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
  const [mediaFiles, setMediaFiles] = useState([]);             // array of selected media files
  const [mediaPreviews, setMediaPreviews] = useState([]);       // array of URLs for preview

  const [proofDocumentFiles, setProofDocumentFiles] = useState([]);  // array of selected docs
  const [proofDocumentPreviews, setProofDocumentPreviews] = useState([]); // array of preview URLs or nulls

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time validation function for a single field
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return "Title is required";
        return "";
      case 'description':
        if (!value.trim()) return "Description is required";
        return "";
      case 'shortDescription':
        if (value.length > 100) return "Short description cannot exceed 100 characters";
        return "";
      case 'targetAmount':
        if (!value) return "Target amount is required";
        if (isNaN(Number(value)) || Number(value) <= 0) return "Target amount must be a positive number";
        return "";
      case 'submitterName':
        if (!value.trim()) return "Your name is required";
        if (!/^[A-Za-z\s]*$/.test(value)) return "Name can only contain alphabets and spaces";
        return "";
      case 'submitterEmail':
        if (!value.trim()) return "Your email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email format";
        return "";
      case 'submitterPhone':
        // UPDATED: Phone number is now required
        if (!value.trim()) return "Phone number is required";
        if (!/^\d{10}$/.test(value)) return "Phone number must be exactly 10 digits";
        return "";
      case 'endDate':
        if (value && isNaN(new Date(value).getTime())) return "Invalid end date/time format";
        if (value && new Date(value) <= new Date()) return "End date must be in the future";
        return "";
      default:
        return "";
    }
  };

  // Updated handleChange to include real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Real-time input filtering
    if (name === "submitterName") {
      processedValue = value.replace(/[^A-Za-z\s]/g, ''); // Allow only letters and spaces
    } else if (name === "submitterPhone") {
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 10); // Allow only numbers, max 10 digits
    } else if (name === "targetAmount") {
      processedValue = value.replace(/[^0-9]/g, ''); // Allow only numbers
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: processedValue,
    }));

    // Set error for the field being changed
    const error = validateField(name, processedValue);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const validateFile = (fileObj, type) => {
    const fileErrors = [];
    if (!fileObj) return [];

    if (type === "document") {
      const docTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      if (!docTypes.includes(fileObj.type)) fileErrors.push('Document must be PDF, DOC, DOCX, JPG, or PNG');
      if (fileObj.size > 10 * 1024 * 1024) fileErrors.push('Document must be less than 10MB');
    }
    // You can add more validations for other types if needed
    return fileErrors;
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const newErrors = { ...errors };

    if (name === "media") {
      if (!files.length) {
        setMediaFiles([]);
        setMediaPreviews([]);
        newErrors.media = "";
        setErrors(newErrors);
        return;
      }

      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      const maxImageSize = 5 * 1024 * 1024;  // 5MB
      const maxVideoSize = 20 * 1024 * 1024; // 20MB

      let fileErrors = [];
      const validFiles = [];
      const previews = [];

      for (let file of files) {
        if (allowedImageTypes.includes(file.type)) {
          if (file.size > maxImageSize) {
            fileErrors.push(`Image "${file.name}" must be less than 5MB`);
            continue;
          }
        } else if (allowedVideoTypes.includes(file.type)) {
          if (file.size > maxVideoSize) {
            fileErrors.push(`Video "${file.name}" must be less than 20MB`);
            continue;
          }
        } else {
          fileErrors.push(`File "${file.name}" must be an image (JPG, PNG, GIF, WebP) or a video (MP4, WebM, Ogg)`);
          continue;
        }

        validFiles.push(file);
        previews.push(URL.createObjectURL(file));
      }

      if (fileErrors.length > 0) {
        newErrors.media = fileErrors.join(", ");
        setMediaFiles([]);
        setMediaPreviews([]);
        e.target.value = null;
      } else {
        newErrors.media = "";
        setMediaFiles(validFiles);
        setMediaPreviews(previews);
      }
    } else if (name === "proofDocument") {
      if (!files.length) {
        setProofDocumentFiles([]);
        setProofDocumentPreviews([]);
        newErrors.proofDocument = "";
        setErrors(newErrors);
        return;
      }

      const docTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];

      let fileErrors = [];
      const validFiles = [];
      const previews = [];

      for (let file of files) {
        if (!docTypes.includes(file.type)) {
          fileErrors.push(`Document "${file.name}" must be PDF, DOC, DOCX, JPG, or PNG`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          fileErrors.push(`Document "${file.name}" must be less than 10MB`);
          continue;
        }
        validFiles.push(file);
        if (file.type === "application/pdf" || file.type.startsWith("image/")) {
          previews.push(URL.createObjectURL(file));
        } else {
          previews.push(null); // no preview for DOC/DOCX
        }
      }

      if (fileErrors.length > 0) {
        newErrors.proofDocument = fileErrors.join(", ");
        setProofDocumentFiles([]);
        setProofDocumentPreviews([]);
        e.target.value = null;
      } else {
        newErrors.proofDocument = "";
        setProofDocumentFiles(validFiles);
        setProofDocumentPreviews(previews);
      }
    }
    setErrors(newErrors);
  };


  // This function validates the entire form on submission
  const validateForm = () => {
    const newErrors = {};

    // Validate all text fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    // Final check for required fields that might be empty
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.targetAmount) newErrors.targetAmount = "Target amount is required";
    if (!formData.submitterEmail.trim()) newErrors.submitterEmail = "Your email is required";
    if (!formData.submitterName.trim()) newErrors.submitterName = "Your name is required";
    // UPDATED: Added check for phone number
    if (!formData.submitterPhone.trim()) newErrors.submitterPhone = "Phone number is required";

    // File upload checks
    if (mediaFiles.length === 0) newErrors.media = "At least one display image or video is required";
    if (proofDocumentFiles.length === 0) newErrors.proofDocument = "At least one supporting proof document is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire("Validation Error", "Please fill all required fields and correct the errors.", "error");
      return;
    }

    setIsSubmitting(true);

    const form = new FormData();

    // Append other form fields
    for (const key in formData) {
      if (formData[key]) {
        if (key === "targetAmount") {
          form.append(key, Number(formData[key]));
        } else {
          form.append(key, formData[key]);
        }
      }
    }

    // Append multiple media files
    if (mediaFiles && mediaFiles.length > 0) {
      mediaFiles.forEach((file) => {
        form.append("media", file);
      });
    }

    // Append multiple proof document files
    if (proofDocumentFiles && proofDocumentFiles.length > 0) {
      proofDocumentFiles.forEach((file) => {
        form.append("proofDocument", file);
      });
    }

    try {
      await submitPersonalCauseApi(form);
      Swal.fire("Success", "Your cause has been submitted for review!", "success");

      // Reset form fields and file states
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

      setProofDocumentFiles([]);
      setProofDocumentPreviews([]);
      setMediaFiles([]);
      setMediaPreviews([]);
      setErrors({});

      // Reset input file elements
      document.getElementById('media').value = '';
      document.getElementById('proofDocument').value = '';

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
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Help a local school, Medical aid for a child" required />
          {errors.title && <p className="error-message">{errors.title}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="shortDescription">Short Description</label>
          <input type="text" id="shortDescription" name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="A brief summary of your cause (max 100 chars)" maxLength="100" />
          {errors.shortDescription && <p className="error-message">{errors.shortDescription}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Detailed Description <span className="required-star">*</span></label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Provide full details about your cause, why it's important, and how funds will be used." rows="5" required ></textarea>
          {errors.description && <p className="error-message">{errors.description}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="targetAmount">Target Amount (₹) <span className="required-star">*</span></label>
          <input type="text" id="targetAmount" name="targetAmount" value={formData.targetAmount} onChange={handleChange} placeholder="e.g., 50000" required />
          {errors.targetAmount && <p className="error-message">{errors.targetAmount}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Education, Health, Environment" />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., City, State, Country" />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">Expected End Date & Time</label>
          <input type="datetime-local" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} />
          {errors.endDate && <p className="error-message">{errors.endDate}</p>}
        </div>

        <h3>Your Contact Information</h3>
        <div className="form-group">
          <label htmlFor="submitterName">Your Full Name <span className="required-star">*</span></label>
          <input type="text" id="submitterName" name="submitterName" value={formData.submitterName} onChange={handleChange} placeholder="e.g., John Doe" required />
          {errors.submitterName && <p className="error-message">{errors.submitterName}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="submitterEmail">Your Email <span className="required-star">*</span></label>
          <input type="email" id="submitterEmail" name="submitterEmail" value={formData.submitterEmail} onChange={handleChange} placeholder="e.g., you@example.com" required />
          {errors.submitterEmail && <p className="error-message">{errors.submitterEmail}</p>}
        </div>

        <div className="form-group">
          {/* UPDATED: Added required star and attribute */}
          <label htmlFor="submitterPhone">Your Phone Number <span className="required-star">*</span></label>
          <input type="text" id="submitterPhone" name="submitterPhone" value={formData.submitterPhone} onChange={handleChange} placeholder="Enter your 10-digit mobile number" required />
          {errors.submitterPhone && <p className="error-message">{errors.submitterPhone}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="submitterMessage">Additional Message to Admin</label>
          <textarea id="submitterMessage" name="submitterMessage" value={formData.submitterMessage} onChange={handleChange} placeholder="Any extra notes or requests for the admin." rows="3" ></textarea>
        </div>

        <h3>Supporting Files</h3>
        <div className="form-group file-upload-group">
          <label htmlFor="media">Cause Display Image or Video <span className="required-star">*</span> (Max 5MB for images, 20MB for videos)</label>
          <input
            type="file"
            id="media"
            name="media"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg"
            onChange={handleFileChange}
          />
          {errors.media && <p className="error-message">{errors.media}</p>}

          {mediaPreviews.length > 0 && (
            <div className="media-preview-container" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {mediaFiles.map((file, index) => (
                <div key={index} style={{ position: "relative" }}>
                  {file.type.startsWith("image/") ? (
                    <img
                      src={mediaPreviews[index]}
                      alt={`Cause Preview ${index + 1}`}
                      className="form-image-preview"
                      style={{ width: "150px", height: "auto", borderRadius: "8px" }}
                    />
                  ) : (
                    <video
                      src={mediaPreviews[index]}
                      controls
                      width="150"
                      height="100"
                      style={{ borderRadius: "8px" }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => {
                      // Remove this file
                      const newFiles = [...mediaFiles];
                      const newPreviews = [...mediaPreviews];
                      newFiles.splice(index, 1);
                      newPreviews.splice(index, 1);
                      setMediaFiles(newFiles);
                      setMediaPreviews(newPreviews);
                      // Reset input if empty
                      if (newFiles.length === 0) {
                        document.getElementById('media').value = '';
                      }
                    }}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      cursor: "pointer"
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>


        <div className="form-group file-upload-group">
          <label htmlFor="proofDocument">Proof Document <span className="required-star">*</span> (Max 10MB)</label>
          <input type="file" id="proofDocument" name="proofDocument" multiple accept=".pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png" onChange={handleFileChange} />
          {errors.proofDocument && <p className="error-message">{errors.proofDocument}</p>}
          {proofDocumentFiles.length > 0 && (
            <div className="file-preview-container" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {proofDocumentFiles.map((file, index) => (
                <div key={index} style={{ position: "relative", maxWidth: "150px" }}>
                  {/* PDF preview */}
                  {proofDocumentPreviews[index] && file.type === "application/pdf" && (
                    <iframe
                      src={proofDocumentPreviews[index]}
                      title={`PDF Preview ${index + 1}`}
                      width="150"
                      height="200"
                      style={{ border: "1px solid #ccc", borderRadius: "4px", marginBottom: "8px" }}
                    ></iframe>
                  )}
                  {/* Image preview */}
                  {proofDocumentPreviews[index] && file.type.startsWith("image/") && (
                    <img
                      src={proofDocumentPreviews[index]}
                      alt={`Document Preview ${index + 1}`}
                      className="form-image-preview"
                      style={{ maxHeight: "200px", marginBottom: "8px" }}
                    />
                  )}
                  {/* Filename if no preview */}
                  {!proofDocumentPreviews[index] && (
                    <p className="uploaded-file-name" style={{ wordBreak: "break-word" }}>{file.name}</p>
                  )}
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => {
                      const newFiles = [...proofDocumentFiles];
                      const newPreviews = [...proofDocumentPreviews];
                      newFiles.splice(index, 1);
                      newPreviews.splice(index, 1);
                      setProofDocumentFiles(newFiles);
                      setProofDocumentPreviews(newPreviews);
                      if (newFiles.length === 0) {
                        document.getElementById('proofDocument').value = '';
                      }
                    }}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      cursor: "pointer"
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
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
