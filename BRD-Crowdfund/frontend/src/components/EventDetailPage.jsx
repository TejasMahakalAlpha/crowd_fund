// src/components/EventDetailPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PublicApi } from "../services/api";
import Swal from "sweetalert2";
import { FaShareAlt } from 'react-icons/fa';
import "./EventDetailPage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const SITE_URL = "https://crowd-fun.netlify.app";

const slugify = (text) => {
  if (!text) return '';
  return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
};

const EventDetailPage = () => {
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

    if (eventSlug) {
      fetchEventDetails();
    } else {
      setError("Event slug not found in URL.");
      setLoading(false);
    }
  }, [eventSlug]);

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

  // Define variables for your meta tags
  const eventDescription = event.description || event.title;

  // ✅ Changed the filename to match your image
  const eventImage = `${SITE_URL}/crowdfund_logo.png`;

  const eventUrl = `${SITE_URL}/events/${eventSlug}`;

  return (
    <div className="event-details-page" style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>

      {/* Add the meta tags here, using 'event' variables */}
      <title>{`${event.title} | Green Dharti`}</title>
      <meta name="description" content={eventDescription} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={`${event.title} | Green Dharti`} />
      <meta property="og:description" content={eventDescription} />
      <meta property="og:image" content={eventImage} />
      <meta property="og:url" content={eventUrl} />
      <meta property="og:type" content="website" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${event.title} | Green Dharti`} />
      <meta name="twitter:description" content={eventDescription} />
      <meta name="twitter:image" content={eventImage} />

      {/* --- Your existing event details code goes below --- */}

      <button onClick={() => navigate('/events')} className="back-button" style={{ marginBottom: '1.5rem' }}>
        ← Back to All Events
      </button>
      <div className="event-card-details">
        {event.imageUrl && <img src={getImageUrl(event.imageUrl)} alt={event.title} className="event-details-image"
          onError={(e) => {
            e.currentTarget.src = "/crowdfund_logo.png"; // fallback if 404 or broken
            e.currentTarget.onerror = null; // prevent infinite loop if default also missing
          }} />}
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

export default EventDetailPage;