import React, { useEffect, useState } from "react";
import API, { AdminApi } from "../services/api";
import "./ManageEvents.css";
import Swal from "sweetalert2";
import { Navigate, useNavigate } from "react-router-dom";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    eventDate: "",
    location: "",
    status: "UPCOMING",
    maxParticipants: "",
    currentParticipants: "",
    imageUrl: "",
  });
  const getImageUrl = (relativePath) => {
    return `${API}/api/images/${relativePath}`;
  };
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate()

  // Validate fields and set errors state
  const validateForm = () => {
    const {
      title,
      shortDescription,
      description,
      eventDate,
      location,
      status,
      maxParticipants,
      currentParticipants,
    } = formData;

    const newErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!shortDescription.trim())
      newErrors.shortDescription = "Short Description is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!eventDate) newErrors.eventDate = "Event Date is required";
    if (!location.trim()) newErrors.location = "Location is required";
    if (!status) newErrors.status = "Status is required";

    if (maxParticipants === "") {
      newErrors.maxParticipants = "Max Participants is required";
    } else if (isNaN(maxParticipants) || Number(maxParticipants) <= 0) {
      newErrors.maxParticipants = "Max Participants must be a positive number";
    }

    if (currentParticipants === "") {
      newErrors.currentParticipants = "Current Participants is required";
    } else if (
      isNaN(currentParticipants) ||
      Number(currentParticipants) < 0
    ) {
      newErrors.currentParticipants =
        "Current Participants must be a non-negative number";
    }


    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetchEvents();
  }, []);



  const fetchEvents = async () => {
    try {
      const res = await AdminApi.getAllEvents();
      setEvents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch events", err);
      Swal.fire("Error", "Failed to fetch events", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For number inputs, keep string to allow partial input and validation
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };
  const handleEdit = (id) => {
    const eventToEdit = events.find((e) => e.id === id);
    if (!eventToEdit) return;

    setFormData({
      title: eventToEdit.title || "",
      shortDescription: eventToEdit.shortDescription || "",
      description: eventToEdit.description || "",
      eventDate: eventToEdit.eventDate ? eventToEdit.eventDate.slice(0, 16) : "", // keep "YYYY-MM-DDTHH:mm"
      location: eventToEdit.location || "",
      status: eventToEdit.status || "UPCOMING",
      maxParticipants: eventToEdit.maxParticipants?.toString() || "",
      currentParticipants: eventToEdit.currentParticipants || "",
      imageUrl: eventToEdit.imageUrl || "",
    });
    setImagePreview(
      eventToEdit.imageUrl?.startsWith("http")
        ? eventToEdit.imageUrl
        : `${API}/${eventToEdit.imageUrl}`
    );

    setEditId(id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("shortDescription", formData.shortDescription);
      form.append("description", formData.description);
      form.append("eventDate", formData.eventDate);
      form.append("location", formData.location);
      form.append("status", formData.status);
      form.append("maxParticipants", formData.maxParticipants);
      form.append("currentParticipants", formData.currentParticipants);

      if (imageFile) {
        form.append("image", imageFile); // 🔥 include image file
      }

      if (isEditing) {
        await AdminApi.updateEvents(editId, form); // You’ll need to handle multipart PUT in backend
        Swal.fire("Success", "Event updated successfully", "success");
      } else {
        await AdminApi.createEvents(form); // Multipart POST request
        Swal.fire("Success", "Event created successfully", "success");
      }

      // Reset state
      setFormData({
        title: "",
        shortDescription: "",
        description: "",
        eventDate: "",
        location: "",
        status: "UPCOMING",
        maxParticipants: "",
        currentParticipants: "",
        imageUrl: "",
      });
      setImageFile(null);
      setIsEditing(false);
      setEditId(null);
      setErrors({});
      fetchEvents();
    } catch (err) {
      console.error("❌ Error submitting event", err);
      Swal.fire("Error", isEditing ? "Failed to update event" : "Failed to create event", "error");
    }
  };



  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This event will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await AdminApi.deleteEvents(id);
        Swal.fire("Deleted!", "The event has been deleted.", "success");
        fetchEvents();
      } catch (err) {
        console.error("Error deleting event", err);
        Swal.fire("Error", "Failed to delete event", "error");
      }
    }
  };

  return (
    <div className="manage-blogs">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>

      <h2>Manage Events</h2>

      <form className="blog-form" onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          name="title"
          placeholder="Title"
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
        {errors.description && <p style={{ color: "red" }}>{errors.description}</p>}

        <input
          type="datetime-local"
          name="eventDate"
          value={formData.eventDate}
          onChange={handleChange}
        />
        {errors.eventDate && <p style={{ color: "red" }}>{errors.eventDate}</p>}

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
        />
        {errors.location && <p style={{ color: "red" }}>{errors.location}</p>}

        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="">Select Status</option>
          <option value="UPCOMING">UPCOMING</option>
          <option value="ONGOING">ONGOING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        {errors.status && <p style={{ color: "red" }}>{errors.status}</p>}

        <input
          type="number"
          name="maxParticipants"
          placeholder="Max Participants"
          value={formData.maxParticipants}
          onChange={handleChange}
        />
        {errors.maxParticipants && (
          <p style={{ color: "red" }}>{errors.maxParticipants}</p>
        )}

        <input
          type="number"
          name="currentParticipants"
          placeholder="Current Participants"
          value={formData.currentParticipants}
          onChange={handleChange}
        />
        {errors.currentParticipants && (
          <p style={{ color: "red" }}>{errors.currentParticipants}</p>
        )}
        <input
          type="file"
          name="image"
          accept=".png,.jpg,.jpeg,.gif,.webp"
          onChange={(e) => {
            const file = e.target.files[0];
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];

            if (file && !allowedTypes.includes(file.type)) {
              Swal.fire("Invalid File", "Only PNG, JPEG, JPG, GIF, and WEBP formats are allowed.", "error");
              e.target.value = null;
              setImageFile(null);
              setImagePreview(null);
            } else {
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file)); // 🔥 preview
            }
          }}
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            style={{ width: "200px", marginTop: "10px", borderRadius: "8px" }}
          />
        )}



        <button type="submit">{isEditing ? "Update Event" : "Add Event"}</button>

      </form>

      <div className="blog-list">
        {events.length > 0 ? (
          events.map((event) => (
            <div className="blog-item" key={event.id}>
              <h3>{event.title}</h3>
              <p>{new Date(event.eventDate).toLocaleString()}</p>
              <p>{event.shortDescription}</p>
              <p>{event.description}</p>
              <p>
                <strong>Location:</strong> {event.location}
              </p>
              <p>
                <strong>Status:</strong> {event.status}
              </p>
              <p>
                <strong>Max Participants:</strong> {event.maxParticipants}
              </p>
              <p>
                <strong>Current Participants:</strong> {event.currentParticipants}
              </p>
              {event.imageUrl && (
                <img
                  src={getImageUrl(event.imageUrl)}
                  alt={event.imageUrl}
                  style={{ width: "100%", maxWidth: "300px", marginTop: "10px" }}
                />
              )}
              <button onClick={() => handleDelete(event.id)}>Delete</button>
              <button onClick={() => handleEdit(event.id)}>Edit</button>

            </div>
          ))
        ) : (
          <p>No events yet.</p>
        )}
      </div>
    </div>
  );
};

export default ManageEvents;
