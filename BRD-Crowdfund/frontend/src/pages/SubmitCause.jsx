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

  // File states
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [documentPreviews, setDocumentPreviews] = useState([]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation for fields
  const validateField = (name, value) => {
    switch (name) {
      case "title":
        if (!value.trim()) return "Title is required";
        return "";
      case "description":
        if (!value.trim()) return "Description is required";
        return "";
      case "shortDescription":
        if (value.length > 100) return "Short description cannot exceed 100 characters";
        return "";
      case "targetAmount":
        if (!value) return "Target amount is required";
        if (isNaN(Number(value)) || Number(value) <= 0)
          return "Target amount must be positive";
        return "";
      case "submitterName":
        if (!value.trim()) return "Your name is required";
        if (!/^[A-Za-z\s]*$/.test(value))
          return "Name can only contain letters and spaces";
        return "";
      case "submitterEmail":
        if (!value.trim()) return "Your email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email format";
        return "";
      case "submitterPhone":
        if (!value.trim()) return "Phone number is required";
        if (!/^\d{10}$/.test(value)) return "Phone number must be 10 digits";
        return "";
      case "endDate":
        if (value && isNaN(new Date(value).getTime()))
          return "Invalid end date/time format";
        if (value && new Date(value) <= new Date())
          return "End date must be in the future";
        return "";
      default:
        return "";
    }
  };

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "submitterName")
      processedValue = value.replace(/[^A-Za-z\s]/g, "");
    if (name === "submitterPhone")
      processedValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    if (name === "targetAmount")
      processedValue = value.replace(/[^0-9]/g, "");

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    const error = validateField(name, processedValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const newErrors = { ...errors };

    if (!files || files.length === 0) {
      if (name === "images") {
        setImageFiles([]); setImagePreviews([]);
      }
      if (name === "videos") {
        setVideoFiles([]); setVideoPreviews([]);
      }
      if (name === "documents") {
        setDocumentFiles([]); setDocumentPreviews([]);
      }
      newErrors[name] = "";
      setErrors(newErrors);
      return;
    }

    if (name === "images") {
      const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const valid = [], previews = [];
      let hasError = false;

      Array.from(files).forEach((file, i) => {
        if (allowed.includes(file.type)) {
          if (file.size > 5 * 1024 * 1024) {
            newErrors.images = `Image ${i + 1} must be <5MB`; hasError = true;
          } else {
            valid.push(file);
            previews.push(URL.createObjectURL(file));
          }
        } else {
          newErrors.images = `File ${i + 1} must be JPG, PNG, GIF, WEBP`; hasError = true;
        }
      });

      if (hasError) { setImageFiles([]); setImagePreviews([]); }
      else { setImageFiles(valid); setImagePreviews(previews); newErrors.images = ""; }
    }

    if (name === "videos") {
      const allowed = ["video/mp4", "video/webm", "video/ogg", "video/avi", "video/mov"];
      const valid = [], previews = [];
      let hasError = false;

      Array.from(files).forEach((file, i) => {
        if (allowed.includes(file.type)) {
          if (file.size > 20 * 1024 * 1024) {
            newErrors.videos = `Video ${i + 1} must be <20MB`; hasError = true;
          } else {
            valid.push(file);
            previews.push(URL.createObjectURL(file));
          }
        } else {
          newErrors.videos = `File ${i + 1} must be MP4, WEBM, OGG, AVI, MOV`; hasError = true;
        }
      });

      if (hasError) { setVideoFiles([]); setVideoPreviews([]); }
      else { setVideoFiles(valid); setVideoPreviews(previews); newErrors.videos = ""; }
    }

    if (name === "documents") {
      const allowed = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/jpeg",
        "image/png",
        "application/zip"
      ];
      const valid = [], previews = [];
      let hasError = false;

      Array.from(files).forEach((file, i) => {
        if (allowed.includes(file.type) || file.name.endsWith(".zip")) {
          if (file.size > 10 * 1024 * 1024) {
            newErrors.documents = `Document ${i + 1} must be <10MB`; hasError = true;
          } else {
            valid.push(file);
            previews.push(URL.createObjectURL(file));
          }
        } else {
          newErrors.documents = `File ${i + 1} must be PDF, DOC, DOCX, TXT, JPG, PNG, ZIP`;
          hasError = true;
        }
      });

      if (hasError) { setDocumentFiles([]); setDocumentPreviews([]); }
      else { setDocumentFiles(valid); setDocumentPreviews(previews); newErrors.documents = ""; }
    }

    setErrors(newErrors);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (imageFiles.length === 0 && videoFiles.length === 0)
      newErrors.media = "At least one image or video is required";
    if (documentFiles.length === 0)
      newErrors.documents = "At least one proof document is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire("Validation Error", "Please fill all required fields and correct the errors.", "error");
      return;
    }

    setIsSubmitting(true);
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) form.append(key, key === "targetAmount" ? Number(value) : value);
    });

    imageFiles.forEach((file) => form.append("images", file));
    videoFiles.forEach((file) => form.append("videos", file));
    documentFiles.forEach((file) => form.append("documents", file));

    try {
      Swal.fire({ title: "Sending...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await submitPersonalCauseApi(form);
      Swal.fire("Success", "Your cause has been submitted for review!", "success");

      // Reset all
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
      setImageFiles([]); setImagePreviews([]);
      setVideoFiles([]); setVideoPreviews([]);
      setDocumentFiles([]); setDocumentPreviews([]);
      setErrors({});
      document.getElementById("images").value = "";
      document.getElementById("videos").value = "";
      document.getElementById("documents").value = "";
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
        {/* --- Form Fields (title, desc, etc.) --- */}

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
          <input type="datetime-local" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} min={new Date().toISOString().split("T")[0]} />
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

        {/* Images */}
        <div className="form-group file-upload-group">
          <label htmlFor="images">Upload Images</label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
          />
          {errors.images && <p className="error-message">{errors.images}</p>}
          {imagePreviews.map((src, i) => (
            <div key={i}>
              <img src={src} alt="preview" width="100" />
              <button type="button" onClick={() => {
                setImageFiles(imageFiles.filter((_, idx) => idx !== i));
                setImagePreviews(imagePreviews.filter((_, idx) => idx !== i));
              }}>X</button>
            </div>
          ))}
        </div>

        {/* Videos */}
        <div className="form-group file-upload-group">
          <label htmlFor="videos">Upload Videos</label>
          <input
            type="file"
            id="videos"
            name="videos"
            multiple
            accept="video/mp4,video/webm,video/ogg,video/avi,video/mov"
            onChange={handleFileChange}
          />
          {errors.videos && <p className="error-message">{errors.videos}</p>}
          {videoPreviews.map((src, i) => (
            <div key={i}>
              <video src={src} width="100" controls />
              <button type="button" onClick={() => {
                setVideoFiles(videoFiles.filter((_, idx) => idx !== i));
                setVideoPreviews(videoPreviews.filter((_, idx) => idx !== i));
              }}>X</button>
            </div>
          ))}
        </div>

        {/* Documents */}
        <div className="form-group file-upload-group">
          <label htmlFor="documents">Upload Documents (PDF/DOC/TXT/IMG/ZIP)</label>
          <input
            type="file"
            id="documents"
            name="documents"
            multiple
            accept=".pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/jpeg,image/png,.zip"
            onChange={handleFileChange}
          />
          {errors.documents && <p className="error-message">{errors.documents}</p>}
          {documentFiles.map((file, i) => (
            <div key={i} style={{ position: "relative", marginTop: "10px" }}>
              {file.type === "application/pdf" ? (
                <iframe src={documentPreviews[i]} width="100" height="120" />
              ) : file.type.startsWith("image/") ? (
                <img src={documentPreviews[i]} width="100" alt="doc" />
              ) : (
                <p>{file.name}</p>
              )}
              <button type="button" style={{
                position: "absolute",
                top: 0,
                right: 0,
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                cursor: "pointer",
              }} onClick={() => {
                setDocumentFiles(documentFiles.filter((_, idx) => idx !== i));
                setDocumentPreviews(documentPreviews.filter((_, idx) => idx !== i));
              }}>X</button>
            </div>
          ))}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Cause for Review"}
        </button>
      </form>
    </div>
  );
};

export default SubmitCause;
