import React, { useEffect, useState } from "react";
import API, { PublicApi } from "../services/api";
import "./Events.css";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect(() => {
  //   const fetchEvents = async () => {
  //     try {
  //       const res = await PublicApi.getEvents();
  //       console.log(res)
  //       if (Array.isArray(res.data)) {
  //         setEvents(res.data);
  //       } else {
  //         console.warn("Unexpected response:", res.data);
  //         setError("Unexpected response format");
  //       }
  //     } catch (err) {
  //       console.error("Failed to fetch events", err);
  //       setError("Failed to fetch events");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchEvents();
  // }, []);
  useEffect(() => {
    // Static event data
    const staticEvents = [
      {
        id: 1,
        title: "Health Check-up Camp",
        description: "Free general health check-up and consultations by certified doctors.",
        date: "2025-08-05T10:00:00",
        time: "10:00 AM - 2:00 PM",
        location: "Community Center, Pune",
        imageUrl: "/uploads/events/health-camp.jpg"
      },
      {
        id: 2,
        title: "Tree Plantation Drive",
        description: "Join us to plant 500+ trees in the city outskirts to promote greenery.",
        date: "2025-08-10T08:30:00",
        time: "8:30 AM - 12:00 PM",
        location: "Outskirts of Nagpur",
        imageUrl: "/uploads/events/tree-plantation.jpg"
      },
      {
        id: 3,
        title: "Blood Donation Drive",
        description: "Donate blood and save lives. A small act of kindness goes a long way.",
        date: "2025-08-15T09:00:00",
        time: "9:00 AM - 1:00 PM",
        location: "Red Cross Hall, Mumbai",
        imageUrl: "/uploads/events/blood-donation.jpg"
      },
      {
        id: 4,
        title: "Skill Development Workshop",
        description: "Free training on basic computer skills for underprivileged youth.",
        date: "2025-08-20T14:00:00",
        time: "2:00 PM - 5:00 PM",
        location: "Govt School, Nashik",
        imageUrl: "/uploads/events/skills-workshop.jpg"
      },
      {
        id: 5,
        title: "Food Distribution Drive",
        description: "Distributing meals and water to homeless individuals across city streets.",
        date: "2025-08-25T17:00:00",
        time: "5:00 PM - 8:00 PM",
        location: "Central Bus Stand, Aurangabad",
        imageUrl: "/uploads/events/food-drive.jpg"
      }
    ];

    setEvents(staticEvents);
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
