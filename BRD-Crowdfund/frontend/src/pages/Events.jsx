import React, { useEffect, useState } from "react";
import { PublicApi } from "../services/api";
import "./Events.css";
import { FaShareAlt } from 'react-icons/fa';
import Swal from 'sweetalert2'; // ✨ 1. Swal इम्पोर्ट किया गया

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getImageUrl = (relativePath) => {
    if (!relativePath) return "";
    return `${API_BASE}/api/images/${relativePath}`;
  };

  // ✨ 2. handleShare फंक्शन को CausesSection जैसा बनाया गया
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
        if (error.name !== 'AbortError') {
          console.error("Error sharing:", error);
          Swal.fire("Error", "Could not share this event.", "error");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Link copied to clipboard!',
          showConfirmButton: false,
          timer: 2000
        });
      } catch (err) {
        console.error("Failed to copy link: ", err);
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

      <div className="events-list-wrapper">
        {!loading && events.length === 0 ? (
          <p className="no-events-text">Currently, there are no events available.</p>
        ) : (
          <div className="events-list">
            {events.map((event, index) => {
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
              const endTime = "";
              const fullTimeRange = `${dayOfWeek} ${time}${endTime ? ' - ' + endTime : ''}`;

              return (
                <div className="event-card" key={event._id || event.id || index}>
                  <div className="event-date-col">
                    <span className="month-day">{month} {day}</span>
                    <span className="year">{year}</span>
                  </div>

                  <div className="event-details-col">
                    <p className="event-datetime">{fullTimeRange}</p>
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-description">{event.description}</p>

                    {event.imageUrl && (
                      <div className="event-image-container">
                        <img
                          src={getImageUrl(event.imageUrl)}
                          alt={event.title}
                          className="event-main-image"
                        />
                      </div>
                    )}
                    <div className="share-container">
                      <button
                        // ✨ 3. onClick को सरल बनाया गया
                        onClick={() => handleShare(event)}
                        className="share-button"
                        title="Share this event"
                      >
                        Share <FaShareAlt />
                      </button>
                    </div>

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