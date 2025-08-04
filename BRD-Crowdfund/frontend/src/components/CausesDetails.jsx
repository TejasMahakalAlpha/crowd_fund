// src/pages/CauseDetails.jsx (या जो भी आपकी फाइल का नाम है)

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PublicApi } from "../services/api";
import Swal from "sweetalert2";
// import './CauseDetailsPage.css';
//  आप स्टाइलिंग के लिए यह CSS फाइल बना सकते हैं

// ===== CHANGED CODE START =====
// API_BASE को इम्पोर्ट करें ताकि इमेज का पूरा URL बन सके
const API_BASE = import.meta.env.VITE_API_BASE_URL;
// ===== CHANGED CODE END =====


const CauseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cause, setCause] = useState(null);
    const [loading, setLoading] = useState(true);

    // ===== CHANGED CODE START =====
    // यह फंक्शन इमेज का पूरा URL बनाएगा
    const getImageUrl = (relativePath) => {
        if (!relativePath) return '';
        return `${API_BASE}/api/images/${relativePath}`;
    };
    // ===== CHANGED CODE END =====

    useEffect(() => {
        const fetchCause = async () => {
            try {
                const res = await PublicApi.getCauseById(id);
                setCause(res.data);
            } catch (error) {
                Swal.fire("Error", "Failed to fetch cause details", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchCause();
    }, [id]);

    if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>;
    if (!cause) return <p style={{ textAlign: 'center', padding: '2rem' }}>Cause not found</p>;

    return (
        <div className="cause-details-container" style={{ maxWidth: "800px", margin: "auto", padding: "2rem" }}>
            <button onClick={() => navigate(-1)} className="back-button" style={{ marginBottom: '1.5rem' }}>
                ← Back
            </button>
            <h1>{cause.title}</h1>
            
            {/* ===== CHANGED CODE START ===== */}
            {/* यहाँ getImageUrl फंक्शन का इस्तेमाल करें */}
            {cause.imageUrl && (
                <img
                    src={getImageUrl(cause.imageUrl)}
                    alt={cause.title}
                    style={{ width: "100%", maxHeight: "400px", objectFit: "cover", marginBottom: "20px", borderRadius: '8px' }}
                />
            )}
            {/* ===== CHANGED CODE END ===== */}
            
            <p><strong>Category:</strong> {cause.category}</p>
            <p><strong>Location:</strong> {cause.location}</p>
            <p><strong>Description:</strong> {cause.description}</p>
            <p>
                <strong>Raised:</strong> ₹{Number(cause.currentAmount).toLocaleString()} / ₹{Number(cause.targetAmount).toLocaleString()}
            </p>
            <p><strong>Status:</strong> {cause.status}</p>
            <p><strong>End Date:</strong> {cause.endDate ? new Date(cause.endDate).toLocaleDateString() : "N/A"}</p>
            <button className="donate-btn-details" style={{ marginTop: '1.5rem' }} onClick={() => alert('Donation logic goes here!')}>
             Donate to this Cause
           </button>
        </div>
    );
};

export default CauseDetails;