import React, { useEffect, useState } from "react";
import API, { PublicApi } from "../services/api";
import "./Events.css";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await PublicApi.getEvents();
        console.log(res)
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

      {loading && <p>Loading events...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="events-list">
        {!loading && events.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            Currently, there are no events available.
          </p>
        ) : (
          events.map((event, index) => {
            const dateObj = new Date(event.date);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString("default", { month: "short" });
            const year = dateObj.getFullYear();

            return (
              <div className="event-card" key={event._id || index}>
                <div className="event-date">
                  <span className="day">{day}</span>
                  <span className="month">{month}</span>
                  <span className="year">{year}</span>
                </div>
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p className="time">{typeof event.eventDatedate === "number" ? event.eventDatedate.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }) : "12:00PM - 4:00PM"}</p>
                  <p className="description">{event.description}</p>
                  <p className="location">{event.location}</p>

                  {event.imageUrl && (
                    <img
                      src={`http://localhost:5000${event.imageUrl}`}
                      alt={event.title}
                      className="event-image"
                      style={{
                        width: "100%",
                        maxHeight: "250px",
                        objectFit: "cover",
                        marginTop: "10px",
                        borderRadius: "8px",
                      }}
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
