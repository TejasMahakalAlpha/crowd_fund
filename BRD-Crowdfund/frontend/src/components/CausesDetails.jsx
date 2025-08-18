import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PublicApi } from "../services/api";
import Swal from "sweetalert2";
import { FaShareAlt } from 'react-icons/fa';
import './CauseDetails.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const SITE_URL = "https://crowd-fun.netlify.app";

const slugify = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
};

const getFileUrl = (relativePath) => {
    if (!relativePath) return '';
    return `${API_BASE}/uploads/${relativePath}`;
};

const CauseDetails = () => {
    const { causeSlug } = useParams();
    const navigate = useNavigate();
    const [cause, setCause] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCauseDetails = async () => {
            try {
                const res = await PublicApi.getCauses();
                if (Array.isArray(res.data)) {
                    const foundCause = res.data.find(c => slugify(c.title) === causeSlug);
                    if (foundCause) {
                        setCause(foundCause);
                    } else {
                        setError("Cause not found.");
                    }
                } else {
                    setError("Could not fetch cause data.");
                }
            } catch (err) {
                setError("Failed to fetch cause details.");
                Swal.fire("Error", "Failed to fetch cause details", "error");
            } finally {
                setLoading(false);
            }
        };

        if (causeSlug) {
            fetchCauseDetails();
        } else {
            setError("Cause slug not found in URL.");
            setLoading(false);
        }
    }, [causeSlug]);

    const causeUrl = `${SITE_URL}/causes/${causeSlug}`;
    
    const metaImageForPreview = `${SITE_URL}/crowdfund_logo.png`;
    const causeImageOnPage = cause?.mediaUrls && cause.mediaUrls.length > 0
        ? getFileUrl(cause.mediaUrls[0])
        : `${SITE_URL}/crowdfund_logo.png`;

    const handleShare = async () => {
        if (!cause) return;
        const shareData = {
            title: `${cause.title} | Green Dharti`,
            text: cause.shortDescription || cause.description,
            url: causeUrl
        };
        if (navigator.share) {
            await navigator.share(shareData).catch(err => console.log("Share error:", err));
        } else {
            await navigator.clipboard.writeText(causeUrl);
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
    if (error) return <p className="error-text">{error}</p>;
    if (!cause) return <p className="error-text">Cause not found.</p>;

    const raisedAmount = Number(cause.currentAmount) || 0;
    const targetAmount = Number(cause.targetAmount) || 1;
    const progressPercentage = Math.min((raisedAmount / targetAmount) * 100, 100);

    return (
        <div className="cause-details-page">
            <title>{`${cause.title} | Green Dharti`}</title>
            <meta name="description" content={cause.shortDescription || cause.description || cause.title} />
            <meta property="og:title" content={`${cause.title} | Green Dharti`} />
            <meta property="og:description" content={cause.shortDescription || cause.description || cause.title} />
            <meta property="og:image" content={metaImageForPreview} />
            <meta property="og:url" content={causeUrl} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={`${cause.title} | Green Dharti`} />
            <meta name="twitter:description" content={cause.shortDescription || cause.description || cause.title} />
            <meta name="twitter:image" content={metaImageForPreview} />

            <button onClick={() => navigate('/causes')} className="back-button">
                ← Back to All Causes
            </button>

            <div className="cause-card-details">
                <div className="cause-image-container">
                    <img src={causeImageOnPage} alt={cause.title} className="cause-details-image" />
                </div>
                <div className="cause-details-content">
                    <p className="cause-meta-details">
                        {cause.category || 'General'} • {cause.location || 'N/A'}
                    </p>
                    <h1 className="cause-title-details">{cause.title}</h1>
                    <p className="cause-description-details">{cause.description}</p>
                    
                    <button onClick={handleShare} className="share-link-button">
                        Share Cause <FaShareAlt style={{ marginLeft: '8px' }} />
                    </button>

                    <div className="fundraising-progress">
                        <div className="progress-labels">
                            <span className="label-raised"><strong>₹{raisedAmount.toLocaleString()}</strong> Raised</span>
                            <span className="label-goal">Goal: ₹{targetAmount.toLocaleString()}</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}>
                                {progressPercentage > 10 && (
                                    <span className="progress-percent">{Math.round(progressPercentage)}%</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="action-buttons-container">
                        {/* ✅ 'Donate Now' BUTTON YAHAN SE HATA DIYA GAYA HAI */}
                        {/* <button className="donate-button">
                            Donate Now
                        </button>
                        */}
                        <button onClick={handleShare} className="share-button">
                            Share <FaShareAlt />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CauseDetails;