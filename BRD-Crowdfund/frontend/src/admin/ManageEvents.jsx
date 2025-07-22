import React, { useEffect, useState } from "react";
import API, { AdminApi } from "../services/api";
import "./ManageBlogs.css";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
    location: "",
    image: null,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // const res = await API.get("/events");
      const res = await AdminApi.getAllEvents();
      setEvents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("date", formData.date);
      form.append("description", formData.description);
      form.append("location", formData.location);
      if (formData.image) form.append("image", formData.image);

      await API.post("/events", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData({
        title: "",
        date: "",
        description: "",
        location: "",
        image: null,
      });

      fetchEvents();
    } catch (err) {
      console.error("Error creating event", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event", err);
    }
  };

  return (
    <div className="manage-blogs">
      <h2>Manage Events</h2>

      <form className="blog-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="title" placeholder="Event Title" value={formData.title} onChange={handleChange} required />
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows={3} required />
        <input type="file" name="image" accept="image/*" onChange={handleChange} />
        <button type="submit">Add Event</button>
      </form>

      <div className="blog-list">
        {events.length > 0 ? (
          events.map((event) => (
            <div className="blog-item" key={event._id}>
              <div>
                <h3>{event.title}</h3>
                <p>{new Date(event.date).toLocaleDateString()}</p>
                <p>{event.location}</p>
                <p>{event.description}</p>
                {event.imageUrl && (
                  <img
                    src={`http://localhost:5000/uploads/${event.imageUrl}`}
                    alt="event"
                    style={{ width: "100%", maxWidth: "300px", marginTop: "10px" }}
                  />
                )}
              </div>
              <button onClick={() => handleDelete(event._id)}>Delete</button>
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
