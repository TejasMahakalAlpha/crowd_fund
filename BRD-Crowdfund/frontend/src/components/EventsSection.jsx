import React, { useEffect, useState } from "react";
import API, { PublicApi } from "../services/api";
import "./EventsSection.css";
import { FaShareAlt } from "react-icons/fa";
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

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const getImageUrl = (relativePath) => {
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

            >
              <div className="event-date">
                <span className="day">{day}</span>
                <span className="month">{month}</span>
                <span className="year">{year}</span>
              </div>
              <div className="event-info">
                <h3 onClick={() => handleCardClick(event)}>{event.title}</h3>
                <p className="time">{time}</p>
                <p className="description">
                  {event.description?.length > 200
                    ? event.description.slice(0, 200) + "..."
                    : event.description}

                </p>
                <p className="location">{event.location}</p>
                {event.imageUrl && (
                  <img
                    src={getImageUrl(event.imageUrl)}
                    alt={event.title}
                    className="event-image"
                    onError={(e) => {
                      e.currentTarget.src = "/crowdfund_logo.png"; // fallback if 404 or broken
                      e.currentTarget.onerror = null; // prevent infinite loop if default also missing
                    }}
                  />
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

      {modalOpen && selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-header">
              <img
                src={getImageUrl(selectedEvent.imageUrl)}
                alt={selectedEvent.title}
                className="cause-image"
                onError={(e) => {
                  e.currentTarget.src = "/crowdfund_logo.png"; // fallback if 404 or broken
                  e.currentTarget.onerror = null; // prevent infinite loop if default also missing
                }}
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
