import React, { useEffect, useState } from "react";
import { PublicApi } from "../services/api";
import "./Events.css";
import { FaShareAlt } from "react-icons/fa";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 For Modal
  const [selectedEvent, setSelectedEvent] = useState(null);

  const getImageUrl = (relativePath) => {
    if (!relativePath) return "";
    return `${API_BASE}/api/images/${relativePath}`;
  };

  const handleShare = async (event) => {
    const eventSlug = slugify(event.title);
    const shareData = {
      title: event.title,
      text: event.description,
      url: `${window.location.origin}/events/${eventSlug}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== "AbortError") {
          Swal.fire("Error", "Could not share this event.", "error");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Link copied to clipboard!",
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (err) {
        Swal.fire("Error", "Could not copy link.", "error");
      }
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await PublicApi.getEvents();
        if (Array.isArray(res.data)) {
          setEvents(res.data);
        } else {
          setError("Unexpected response format");
        }
      } catch (err) {
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

      <div className="events-list-wrapper">
        {!loading && events.length === 0 ? (
          <p className="no-events-text">Currently, there are no events available.</p>
        ) : (
          <div className="events-list">
            {events.sort((a, b) => new Date(a.date || a.eventDate) - new Date(b.date || b.eventDate)).map((event, index) => {
              const dateObj = new Date(event.date || event.eventDate);
              const day = dateObj.getDate();
              const month = dateObj.toLocaleString("default", { month: "short" });
              const year = dateObj.getFullYear();
              const dayOfWeek = dateObj.toLocaleString("default", { weekday: "long" });
              const time = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              return (
                <div
                  className="event-card"
                  key={event._id || event.id || index}

                >
                  <div className="event-date-col">
                    <span className="month-day">{month} {day}</span>
                    <span className="year">{year}</span>
                  </div>

                  <div className="event-details-col">
                    <p className="event-datetime">{dayOfWeek} {time}</p>
                    <h3 className="event-title" >{event.title}</h3>
                    <p className="description" onClick={() => setSelectedEvent(event)} // 🔥 Open modal on click
                      style={{ cursor: "pointer" }}>{
                        event.description?.length > 200
                          ? event.description.slice(0, 200) + "..."
                          : event.description
                      }</p>
                    <button
                      className="share-button"
                      onClick={() => handleShare(event)}
                    >
                      Share <FaShareAlt />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🔥 Event Details Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
          >
            <button className="modal-close" onClick={() => setSelectedEvent(null)}>
              ✖
            </button>
            {selectedEvent.imageUrl && (
              <img
                src={getImageUrl(selectedEvent.imageUrl)}
                alt={selectedEvent.title}
                className="modal-image"
                onError={(e) => {
                  e.currentTarget.src = "/crowdfund_logo.png";
                  e.currentTarget.onerror = null;
                }}
              />
            )}
            <div className="modal-header">
              <h2>{selectedEvent.title}</h2>
              <p className={`status ${selectedEvent.status?.toLowerCase()}`}>
                {selectedEvent.status}
              </p>
            </div>
            <p>{selectedEvent.description}</p>
            <div className="modal-details">
              <p><strong>Date:</strong> {new Date(selectedEvent.date || selectedEvent.eventDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(selectedEvent.date || selectedEvent.eventDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })}</p>
              <p><strong>Location:</strong> {selectedEvent.location}</p>
              <p><strong>Max participant :</strong> {selectedEvent.maxParticipants}</p>
            </div>
            <button
              className="share-button"
              onClick={() => handleShare(selectedEvent)}
            >
              Share <FaShareAlt />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
