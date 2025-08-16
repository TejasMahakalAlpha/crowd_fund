// src/components/CauseDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PublicApi } from "../services/api";
import Swal from "sweetalert2";
import { FaShareAlt } from 'react-icons/fa';
import './CauseDetails.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const SITE_URL = "https://crowd-fun.netlify.app";

// ✅ STEP 1: Slugify function ko yahan add karein
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
    // ✅ STEP 2: useParams ko :id se :causeSlug mein badlein
    const { causeSlug } = useParams();
    const navigate = useNavigate();
    const [cause, setCause] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(""); // Error state add karein

    useEffect(() => {
        // ✅ STEP 3: Data fetch karne ka logic badlein
        const fetchCauseDetails = async () => {
            try {
                // Maan rahe hain ki aapke paas sabhi causes fetch karne ke liye ek API call hai
                const res = await PublicApi.getCauses(); // Jaise PublicApi.getEvents() hai
                if (Array.isArray(res.data)) {
                    // Slug ke आधार par sahi cause dhoondhein
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
    }, [causeSlug]); // Dependency array mein causeSlug daalein

    // ✅ STEP 4: URL banane ke liye causeSlug ka istemal karein
    const causeUrl = `${SITE_URL}/causes/${causeSlug}`;
    
    // Baaki logic same rahega
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
        // ... (handleShare ka baaki logic same rahega)
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
    
    // Loading aur error states ko handle karein
    if (loading) return <p className="loading-text">Loading cause...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!cause) return <p className="error-text">Cause not found.</p>;

    const raisedAmount = Number(cause.currentAmount) || 0;
    const targetAmount = Number(cause.targetAmount) || 1;
    const progressPercentage = Math.min((raisedAmount / targetAmount) * 100, 100);

    return (
        // ... (Aapka poora JSX code yahan se aage bilkul same rahega)
        <div className="cause-details-page" style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
            {/* META TAGS */}
            <title>{`${cause.title} | Green Dharti`}</title>
            <meta name="description" content={cause.shortDescription || cause.description || cause.title} />
            <meta property="og:title" content={`${cause.title} | Green Dharti`} />
            <meta property="og:description" content={cause.shortDescription || cause.description || cause.title} />
            <meta property="og:image" content={metaImageForPreview} />
            <meta property="og:url" content={causeUrl} />
            {/* ... baaki sabhi tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={`${cause.title} | Green Dharti`} />
            <meta name="twitter:description" content={cause.shortDescription || cause.description || cause.title} />
            <meta name="twitter:image" content={metaImageForPreview} />

            <button onClick={() => navigate('/causes')} className="back-button" style={{ marginBottom: '1.5rem' }}>
                ← Back to All Causes
            </button>
            <div className="cause-card-details">
                <div className="cause-image-container">
                    <img src={causeImageOnPage} alt={cause.title} className="cause-details-image" />
                </div>
                <div className="cause-details-content">
                    {/* ... sabhi content same rahega ... */}
                </div>
            </div>
        </div>
    );
}

export default CauseDetails;