import React, { useEffect, useState } from "react";
import { PublicApi } from "../services/api";
import "./Events.css";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  // You can keep this block for fallback data (for dev/demo)
  // useEffect(() => {
  //   setEvents([...staticEvents]);
  // }, []);

  return (
    <div className="events-page">
      <section className="events-hero">
        <h1>Upcoming Events</h1>
        <p>Join us in making a difference through impactful initiatives and events.</p>
      </section>

      {loading && <p className="loading-text">Loading events...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="events-list">
        {!loading && events.length === 0 ? (
          <p className="no-events-text">Currently, there are no events available.</p>
        ) : (
          events.map((event, index) => {
            const dateObj = new Date(event.date || event.eventDate);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString("default", { month: "short" });
            const year = dateObj.getFullYear();
            const time = dateObj.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true, // Set to false if you want 24-hour format
            });

            return (
              <div className="event-card" key={event.id || event._id || index}>
                <div className="event-date">
                  <span className="day">{day}</span>
                  <span className="month">{month}</span>
                  <span className="year">{year}</span>

                  <span>{event.status}</span>
                </div>

                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p className="time">{time || "Time not specified"}</p>
                  <p className="description">{event.description}</p>
                  <p className="location">{event.location}</p>

                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="event-image"
                    />
                  )}

                  <button className="join-btn">Join Event</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Events;
