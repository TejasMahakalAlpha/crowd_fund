import React, { useEffect, useState } from "react";
import { PublicApi } from "../services/api";
import "./Events.css";
import { FaShareAlt } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Events = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const getImageUrl = (relativePath) => {
        if (!relativePath) return "";
        return `${API_BASE}/api/images/${relativePath}`;
    };

    const handleShare = async (e, title, url, summary) => {
        e.stopPropagation(); // Prevents other click events on the card

        const shareData = {
            title: title,
            text: summary,
            url: url,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback for desktop browsers
            try {
                await navigator.clipboard.writeText(url);
                alert('Link copied to clipboard!');
            } catch (error) {
                console.error('Failed to copy link:', error);
                alert('Sharing not supported. Link could not be copied.');
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
                            
                            // 💡 FIX: Check for both `_id` and `id` to prevent 'undefined' in the URL
                            const eventId = event._id || event.id;
                            const eventUrl = `${window.location.origin}/events/${eventId}`;

                            return (
                                <div className="event-card" key={event.id || event._id || index}>
                                    <div className="event-date-col">
                                        <span className="month-day">{month} {day}</span>
                                        <span className="year">{year}</span>
                                    </div>

                                    <div className="event-details-col">
                                        <p className="event-datetime">{fullTimeRange}</p>
                                        <h3 className="event-title">{event.title}</h3>
                                        <p className="event-description">{event.description}</p>

                                        <div className="share-container">
                                            <button
                                                onClick={(e) => handleShare(e, event.title, eventUrl, event.description)}
                                                className="share-button"
                                                title="Share this event"
                                            >
                                                Share  <FaShareAlt /> 
                                            </button>
                                        </div>

                                        {event.imageUrl && (
                                            <div className="event-image-container">
                                                <img
                                                    src={getImageUrl(event.imageUrl)}
                                                    alt={event.title}
                                                    className="event-main-image"
                                                />
                                            </div>
                                        )}
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