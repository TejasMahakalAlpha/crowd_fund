import React, { useEffect, useState } from "react";
import API, { PublicApi } from "../services/api";
import "./Events.css";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Events = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Function to get image URL from backend (for event.imageUrl if it exists)
  const getImageUrl = (relativePath) => {
    return `${API_BASE}/api/images/${relativePath}`;
  };

  // ⭐ Dummy images for the event thumbnails (since backend provides only one imageUrl) ⭐
  const dummyThumbnails = [
    "https://via.placeholder.com/80/00796b/FFFFFF?text=Img1",
    "https://via.placeholder.com/80/004d40/FFFFFF?text=Img2",
    "https://via.placeholder.com/80/26a69a/FFFFFF?text=Img3",
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await PublicApi.getEvents();
        if (Array.isArray(res.data)) {
          setEvents(res.data);
        } else {
          console.warn("Unexpected response:", res.data);
          setError("Unexpected response format");
        }
      } catch (err) {
        console.error("Failed to fetch events", err);
        setError("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="events-page">
      <section className="events-hero">
        <h1>Upcoming Events</h1>
        <p>Join us in making a difference through impactful initiatives and events.</p>
      </section>

      {loading && <p className="loading-text">Loading events...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="events-list-wrapper"> {/* ⭐ NEW: Wrapper for the list ⭐ */}
        {!loading && events.length === 0 ? (
          <p className="no-events-text">Currently, there are no events available.</p>
        ) : (
          <div className="events-list"> {/* Existing events-list, now inside wrapper */}
            {events.map((event, index) => {
              const dateObj = new Date(event.date || event.eventDate);
              const day = dateObj.getDate();
              const month = dateObj.toLocaleString("default", { month: "short" });
              const year = dateObj.getFullYear();
              const dayOfWeek = dateObj.toLocaleString("default", { weekday: "long" }); // e.g., "Monday"
              const time = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
              // If you have an end time for events, you'd add it here
              const endTime = ""; // Example: event.endTime ? new Date(event.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }) : "";
              const fullTimeRange = `${dayOfWeek} ${time}${endTime ? ' - ' + endTime : ''}`; // "Monday 12:00 PM - 1:00 PM"

              return (
                <div className="event-card" key={event.id || event._id || index}>
                  {/* ⭐ Left Column: Date Info ⭐ */}
                  <div className="event-date-col">
                    <span className="month-day">{month} {day}</span> {/* Eg: Jul 28 */}
                    <span className="year">{year}</span>
                  </div>

                  {/* ⭐ Right Column: Event Info & Thumbnails ⭐ */}
                  <div className="event-details-col">
                    <p className="event-datetime">{fullTimeRange}</p> {/* Eg: Monday 12:00 PM */}
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                    {/* <p className="event-location">{event.location}</p> // Location can be added if needed */}

                    {/* ⭐ Image Thumbnails Gallery ⭐ */}
                    <div className="event-thumbnails">
                      {dummyThumbnails.map((imgSrc, imgIdx) => (
                        <img
                          key={imgIdx}
                          src={imgSrc} // Using dummy image for now
                          alt={`Event thumbnail ${imgIdx + 1}`}
                          className="event-thumbnail"
                        />
                      ))}
                    </div>

                    {/* <button className="join-btn">Join Event</button> */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;