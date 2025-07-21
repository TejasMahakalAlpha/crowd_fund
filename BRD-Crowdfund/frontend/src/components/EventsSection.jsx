// src/components/EventsSection.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";
import "./EventsSection.css";

const EventsSection = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get("/events");
        if (Array.isArray(res.data)) {
          // Show latest 3 events
          setEvents(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching events in EventsSection", err);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section className="events-section" id="events">
      <h2 className="section-title">Upcoming Events</h2>
      <div className="events-container">
        {events.map((event, index) => {
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
                <p className="time">{event.time || "12:00PM - 4:00PM"}</p>
                <p className="description">{event.description}</p>
                <p className="location">{event.location}</p>

                {event.imageUrl && (
                  <img
                    src={`http://localhost:5000${event.imageUrl}`}
                    alt={event.title}
                    className="event-image"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginTop: "10px",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default EventsSection;
