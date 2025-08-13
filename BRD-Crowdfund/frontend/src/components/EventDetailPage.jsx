// src/components/EventDetailPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PublicApi } from "../services/api";
import Swal from "sweetalert2";
import { FaShareAlt } from 'react-icons/fa';
import "./EventDetailPage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const slugify = (text) => {
  if (!text) return '';
  return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
};

// ✅ FIX 1: Component ka naam file ke naam se match karein
const EventDetailPage = () => { 
  
  // ✅ FIX 2: Route se 'eventSlug' nikalein, 'slug' nahi
  const { eventSlug } = useParams(); 
  
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getImageUrl = (relativePath) => {
    if (!relativePath) return "";
    return `${API_BASE}/api/images/${relativePath}`;
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await PublicApi.getEvents();
        if (Array.isArray(res.data)) {
          // ✅ FIX 3: Yahaan bhi 'eventSlug' ka istemal karein
          const foundEvent = res.data.find(e => slugify(e.title) === eventSlug); 
          if (foundEvent) {
            setEvent(foundEvent);
          } else {
            setError("Event not found.");
          }
        } else {
            setError("Could not fetch event data.");
        }
      } catch (err) {
        setError("Failed to fetch event details.");
      } finally {
        setLoading(false);
      }
    };

    if (eventSlug) { // Sirf tabhi fetch karein jab eventSlug undefined na ho
        fetchEventDetails();
    } else {
        setError("Event slug not found in URL.");
        setLoading(false);
    }
  }, [eventSlug]); // ✅ FIX 4: Dependency array mein bhi 'eventSlug' rakhein

  // ... baaki ka code (handleShare, return statement) waisa hi rahega ...

  const handleShare = async () => {
    if (!event) return;
    const shareData = { title: event.title, text: event.description, url: window.location.href };
    if (navigator.share) {
      await navigator.share(shareData).catch(err => console.log("Share error:", err));
    } else {
      await navigator.clipboard.writeText(shareData.url);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Link copied!', showConfirmButton: false, timer: 2000 });
    }
  };

  if (loading) return <p className="loading-text">Loading event...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!event) return <p className="no-events-text">Event not found.</p>;

  const dateObj = new Date(event.date || event.eventDate);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("default", { month: "short" });
  const year = dateObj.getFullYear();
  const dayOfWeek = dateObj.toLocaleString("default", { weekday: "long" });
  const time = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  const fullTimeRange = `${dayOfWeek} ${time}`;

  return (
    <div className="event-details-page" style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        <button onClick={() => navigate('/events')} className="back-button" style={{ marginBottom: '1.5rem' }}>
            ← Back to All Events
        </button>
        <div className="event-card-details">
            {event.imageUrl && <img src={getImageUrl(event.imageUrl)} alt={event.title} className="event-details-image" />}
            <div className="event-details-content">
                <p className="event-datetime-details">{month} {day}, {year} • {fullTimeRange}</p>
                <h1 className="event-title-details">{event.title}</h1>
                <p className="event-description-details">{event.description}</p>
                <button onClick={handleShare} className="share-button" title="Share this event" style={{ marginTop: '20px' }}>
                    Share Event <FaShareAlt />
                </button>
            </div>
        </div>
    </div>
  );
};

// ✅ FIX 5: Export bhi sahi naam se karein
export default EventDetailPage;