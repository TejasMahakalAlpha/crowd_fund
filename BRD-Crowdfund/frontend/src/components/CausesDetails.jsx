// src/pages/CauseDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PublicApi } from "../services/api";
import Swal from "sweetalert2";
import { FaShareAlt } from 'react-icons/fa';
import './CauseDetails.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const getFileUrl = (relativePath) => {
    if (!relativePath) return '';
    return `${API_BASE}/uploads/${relativePath}`;
};

const CauseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cause, setCause] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const handleShare = async () => {
        if (!cause) return;
        const shareData = {
            title: cause.title,
            text: cause.shortDescription || cause.description,
            url: window.location.href
        };
        if (navigator.share) {
            await navigator.share(shareData).catch(err => console.log("Share error:", err));
        } else {
            await navigator.clipboard.writeText(shareData.url);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Link copied!',
                showConfirmButton: false,
                timer: 2000
            });
        }
    };

    if (loading) return <p className="loading-text">Loading cause...</p>;
    if (!cause) return <p className="error-text">Cause not found.</p>;

    const raisedAmount = Number(cause.currentAmount) || 0;
    const targetAmount = Number(cause.targetAmount) || 1;
    const progressPercentage = Math.min((raisedAmount / targetAmount) * 100, 100);

    return (
        <div className="cause-details-page">
            <button onClick={() => navigate('/causes')} className="back-button">
                ← Back to All Causes
            </button>

            <div className="cause-card-details">
                {/* Image Column */}
                <div className="cause-image-container">
                    {cause.mediaUrls && cause.mediaUrls.length > 0 ? (
                        <img
                            src={getFileUrl(cause.mediaUrls[0])}
                            alt={cause.title}
                            className="cause-details-image"
                        />
                    ) : (
                        <div className="cause-details-image-placeholder">No Image</div>
                    )}
                </div>

                {/* Content Column */}
                <div className="cause-details-content">
                    <p className="cause-meta-details">{cause.category || 'General'} • {cause.location || 'N/A'}</p>
                    <h1 className="cause-title-details">{cause.title}</h1>
                    <p className="cause-description-details">{cause.description}</p>
                    
                    {/* --- UPDATED JSX START --- */}
                    <div className="fundraising-progress">
                        <div className="progress-labels">
                            <span className="label-raised">
                                <strong>₹{raisedAmount.toLocaleString()}</strong> Raised
                            </span>
                            <span className="label-goal">
                                Goal: ₹{targetAmount.toLocaleString()}
                            </span>
                        </div>
                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{ width: `${progressPercentage}%` }}
                                title={`${Math.round(progressPercentage)}% Funded`}
                            >
                                {progressPercentage > 10 && (
                                    <span className="progress-percent">
                                        {Math.round(progressPercentage)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* --- UPDATED JSX END --- */}
                    
                    {/* Action Buttons */}
                    <div className="action-buttons-container">
                        <button className="donate-button" onClick={() => alert('Donation logic goes here!')}>
                            Donate Now
                        </button>
                        <button onClick={handleShare} className="share-button" title="Share this cause">
                            Share Cause <FaShareAlt />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CauseDetails;