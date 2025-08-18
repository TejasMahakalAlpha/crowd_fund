import React, { useState } from "react";
import Swal from "sweetalert2";
import "./SubmitCause.css";
import { PublicApi } from "../services/api";

// API submission function
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

  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [proofDocumentFiles, setProofDocumentFiles] = useState([]);
  const [proofDocumentPreviews, setProofDocumentPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time field validation
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
        if (isNaN(Number(value)) || Number(value) <= 0) return "Target amount must be positive";
        return "";
      case 'submitterName':
        if (!value.trim()) return "Your name is required";
        if (!/^[A-Za-z\s]*$/.test(value)) return "Name can only contain letters and spaces";
        return "";
      case 'submitterEmail':
        if (!value.trim()) return "Your email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email format";
        return "";
      case 'submitterPhone':
        if (!value.trim()) return "Phone number is required";
        if (!/^\d{10}$/.test(value)) return "Phone number must be 10 digits";
        return "";
      case 'endDate':
        if (value && isNaN(new Date(value).getTime())) return "Invalid end date/time format";
        if (value && new Date(value) <= new Date()) return "End date must be in the future";
        return "";
      default:
        return "";
    }
  };

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "submitterName") processedValue = value.replace(/[^A-Za-z\s]/g, '');
    if (name === "submitterPhone") processedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    if (name === "targetAmount") processedValue = value.replace(/[^0-9]/g, '');

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    const error = validateField(name, processedValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const newErrors = { ...errors };

    if (!files.length) {
      if (name === "media[]") { setMediaFiles([]); setMediaPreviews([]); }
      if (name === "proofDocument[]") { setProofDocumentFiles([]); setProofDocumentPreviews([]); }
      newErrors[name] = "";
      setErrors(newErrors);
      return;
    }

    if (name === "media[]") {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      const maxImageSize = 5 * 1024 * 1024;
      const maxVideoSize = 20 * 1024 * 1024;

      const validFiles = [];
      const previews = [];
      const fileErrors = [];

      Array.from(files).forEach(file => {
        if (allowedImageTypes.includes(file.type)) {
          if (file.size > maxImageSize) fileErrors.push(`Image "${file.name}" must be <5MB`);
          else { validFiles.push(file); previews.push(URL.createObjectURL(file)); }
        } else if (allowedVideoTypes.includes(file.type)) {
          if (file.size > maxVideoSize) fileErrors.push(`Video "${file.name}" must be <20MB`);
          else { validFiles.push(file); previews.push(URL.createObjectURL(file)); }
        } else fileErrors.push(`File "${file.name}" must be image or video`);
      });

      if (fileErrors.length) { newErrors.media = fileErrors.join(", "); setMediaFiles([]); setMediaPreviews([]); e.target.value = null; }
      else { newErrors.media = ""; setMediaFiles(validFiles); setMediaPreviews(previews); }
    }

    if (name === "proofDocument[]") {
      const docTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      const validFiles = [];
      const previews = [];
      const fileErrors = [];

      Array.from(files).forEach(file => {
        if (!docTypes.includes(file.type)) fileErrors.push(`Document "${file.name}" must be PDF, DOC, DOCX, JPG, or PNG`);
        else if (file.size > 10 * 1024 * 1024) fileErrors.push(`Document "${file.name}" must be <10MB`);
        else {
          validFiles.push(file);
          if (file.type === "application/pdf" || file.type.startsWith("image/")) previews.push(URL.createObjectURL(file));
          else previews.push(null);
        }
      });

      if (fileErrors.length) { newErrors.proofDocument = fileErrors.join(", "); setProofDocumentFiles([]); setProofDocumentPreviews([]); e.target.value = null; }
      else { newErrors.proofDocument = ""; setProofDocumentFiles(validFiles); setProofDocumentPreviews(previews); }
    }

    setErrors(newErrors);
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.targetAmount) newErrors.targetAmount = "Target amount is required";
    if (!formData.submitterName.trim()) newErrors.submitterName = "Name required";
    if (!formData.submitterEmail.trim()) newErrors.submitterEmail = "Email required";
    if (!formData.submitterPhone.trim()) newErrors.submitterPhone = "Phone required";
    if (!mediaFiles.length) newErrors["media[]"] = "At least one image/video required";
    if (!proofDocumentFiles.length) newErrors["proofDocument[]"] = "At least one proof document required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire("Validation Error", "Please fill all required fields and correct the errors.", "error");
      return;
    }

    setIsSubmitting(true);
    const form = new FormData();

    // Append text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value) form.append(key, key === "targetAmount" ? Number(value) : value);
    });

    // Append files as arrays
    mediaFiles.forEach(file => form.append("media[]", file));
    proofDocumentFiles.forEach(file => form.append("proofDocument[]", file));

    // Debug
    for (let [key, value] of form.entries()) {
      if (value instanceof File) console.log(`${key}: ${value.name} (${value.type}, ${value.size} bytes)`);
      else console.log(`${key}: ${value}`);
    }

    try {
      Swal.fire({ title: 'Sending...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await submitPersonalCauseApi(form);
      Swal.fire("Success", "Your cause has been submitted for review!", "success");

      // Reset form
      setFormData({ title: "", description: "", shortDescription: "", targetAmount: "", category: "", location: "", endDate: "", submitterName: "", submitterEmail: "", submitterPhone: "", submitterMessage: "" });
      setMediaFiles([]); setMediaPreviews([]);
      setProofDocumentFiles([]); setProofDocumentPreviews([]);
      setErrors({});
      document.getElementById('media').value = '';
      document.getElementById('proofDocument').value = '';
    } catch (error) {
      Swal.fire("Submission Failed", error.message || "Something went wrong.", "error");
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
