import React, { useEffect, useState } from "react";
import API, { PublicApi } from "../services/api";
import "./EventsSection.css";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const getImageUrl = (relativePath) => {
    return `${API_BASE}/api/images/${relativePath}`;
  };
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await PublicApi.getEvents();
        if (Array.isArray(res.data)) {
          setEvents(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching events", err);
        // Fallback static data
        // setEvents([
        //   {
        //     id: 1,
        //     title: "Health Check-up Camp",
        //     description: "Free general health check-up and consultations by certified doctors.",
        //     date: "2025-08-05T10:00:00",
        //     time: "10:00 AM - 2:00 PM",
        //     location: "Community Center, Pune",
        //     imageUrl: "healthcamp.jpeg",
        //   },
        //   {
        //     id: 2,
        //     title: "Tree Plantation Drive",
        //     description: "Join us to plant 500+ trees in the city outskirts to promote greenery.",
        //     date: "2025-08-10T08:30:00",
        //     time: "8:30 AM - 12:00 PM",
        //     location: "Outskirts of Nagpur",
        //     imageUrl: "treeplantation.jpeg",
        //   },
        //   {
        //     id: 3,
        //     title: "Blood Donation Drive",
        //     description: "Donate blood and save lives. A small act of kindness goes a long way.",
        //     date: "2025-08-15T09:00:00",
        //     time: "9:00 AM - 1:00 PM",
        //     location: "Red Cross Hall, Mumbai",
        //     imageUrl: "blooddonation.jpeg",
        //   },
        // ]);
      }
    };

    fetchEvents();
  }, []);

  const handleCardClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };



  return (
    <section className="events-section" id="events">
      <h2 className="section-title">Upcoming Events</h2>
      <div className="events-container">
        {events.map((event, idx) => {
          const dateObj = new Date(event.date || event.eventDate);
          const day = dateObj.getDate();
          const month = dateObj.toLocaleString("default", { month: "short" });
          const year = dateObj.getFullYear();
          const time = dateObj.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // Set to false if you want 24-hour format
          })
          return (
            <div
              className="event-card"
              key={event._id || idx}
              onClick={() => handleCardClick(event)}
            >
              <div className="event-date">
                <span className="day">{day}</span>
                <span className="month">{month}</span>
                <span className="year">{year}</span>
              </div>
              <div className="event-info">
                <h3>{event.title}</h3>
                <p className="time">{time}</p>
                <p className="description">{event.description}</p>
                <p className="location">{event.location}</p>
                {event.imageUrl && (
                  <img
                    src={getImageUrl(event.imageUrl)}
                    alt={event.title}
                    className="event-image"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-header">
              <img
                src={getImageUrl(selectedEvent.imageUrl)}
                alt={selectedEvent.title}
                className="cause-image"
                style={{ width: "100%", borderRadius: "8px", objectFit: "cover", maxHeight: "200px" }}
              />
            </div>
            <div className="modal-body">
              <h2>{selectedEvent.title}</h2>
              <p className="modal-description">{selectedEvent.description}</p>
              <div className="modal-details">
                <p><strong>Date:</strong> {new Date(selectedEvent.date || selectedEvent.eventDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(selectedEvent.date || selectedEvent.eventDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true
                })}</p>
                <p><strong>Location:</strong> {selectedEvent.location}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventsSection;
