import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PublicApi, PaymentApi } from "../services/api";
import Swal from "sweetalert2";
import { FaShareAlt } from "react-icons/fa";
import "./CauseDetails.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const SITE_URL = "https://crowd-fun.netlify.app";

// ✅ slugify
const slugify = (text) => {
    if (!text) return "";
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-");
};

// ✅ file URL helper
const getImageUrl = (relativePath) => {
    if (!relativePath) return "";
    return `${API_BASE}/api/images/${relativePath}`;
};



const CauseDetails = () => {
    const { causeSlug } = useParams();
    const navigate = useNavigate();
    const [cause, setCause] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    // ✅ Fetch cause
    useEffect(() => {
        const fetchCauseDetails = async () => {
            try {
                const res = await PublicApi.getCauses();
                if (Array.isArray(res.data)) {
                    const foundCause = res.data.find(
                        (c) => slugify(c.title) === causeSlug
                    );
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

        if (causeSlug) fetchCauseDetails();
        else {
            setError("Cause slug not found in URL.");
            setLoading(false);
        }

        loadRazorpayScript();
    }, [causeSlug]);

    // ✅ Razorpay script loader
    const loadRazorpayScript = () => {
        if (document.querySelector("#razorpay-script")) {
            setIsScriptLoaded(true);
            return;
        }
        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => setIsScriptLoaded(true);
        script.onerror = () =>
            Swal.fire("Error", "Failed to load payment gateway.", "error");
        document.body.appendChild(script);
    };

    // ✅ Collect donor details
    const collectDonorDetails = async (amountInPaisa, causeId) => {
        if (!isScriptLoaded || typeof window.Razorpay === "undefined") {
            Swal.fire(
                "Error",
                "Payment script not loaded. Please refresh and try again.",
                "error"
            );
            loadRazorpayScript();
            return;
        }

        const { value: formValues } = await Swal.fire({
            title: "Enter Your Details",
            html: `
          <input id="swal-input-name" class="swal2-input" placeholder="Full Name" required>
          <input id="swal-input-email" class="swal2-input" type="email" placeholder="Email Address" required>
          <input id="swal-input-phone" class="swal2-input" type="tel" placeholder="Phone Number (10 digits)" required>
          <input id="swal-input-message" class="swal2-input" placeholder="message" >
        `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Proceed to Pay",
            preConfirm: () => {
                const name = document.getElementById("swal-input-name").value.trim();
                const email = document.getElementById("swal-input-email").value.trim();
                const phone = document.getElementById("swal-input-phone").value.trim();
                const message = document.getElementById("swal-input-message").value.trim();
                if (!name || !email || !phone) {
                    Swal.showValidationMessage("Please fill in all details");
                    return false;
                }
                if (!/\S+@\S+\.\S+/.test(email)) {
                    Swal.showValidationMessage("Invalid email address");
                    return false;
                }
                if (!/^\d{10}$/.test(phone)) {
                    Swal.showValidationMessage("Invalid 10-digit phone number");
                    return false;
                }
                return { name, email, phone, message };
            },
        });

        if (formValues) {
            startPayment(
                amountInPaisa,
                formValues.name,
                formValues.email,
                formValues.phone,
                formValues.message,
                causeId
            );
        }

    };

    // ✅ Start payment
    const startPayment = async (
        amountInPaisa,
        donorName,
        donorEmail,
        donorPhone,
        message,
        causeId
    ) => {
        setIsPaymentProcessing(true);
        Swal.fire({
            title: "Initiating Payment...",
            html: "Please wait...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const donorDetailsPayload = {
                donorName,
                donorEmail,
                donorPhone,
                message: message || "No message provided",
                amount: amountInPaisa,
                currency: "INR",
                causeId,
            };

            const res = await PaymentApi.createDonationAndOrder(donorDetailsPayload);
            const {
                orderId,
                amount: backendAmount,
                currency: backendCurrency,
                razorpayKeyId,
            } = res.data;

            const razorpayKey =
                razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

            if (!orderId || !backendAmount || !backendCurrency || !razorpayKey) {
                Swal.fire("Error", "Payment setup failed.", "error");
                setIsPaymentProcessing(false);
                return;
            }

            const options = {
                key: razorpayKey,
                amount: backendAmount,
                currency: backendCurrency,
                name: "Alphaseam Foundation",
                description: "Donation Payment",
                order_id: orderId,
                handler: async (response) => {
                    const verifyPayload = {
                        orderId: response.razorpay_order_id,
                        paymentId: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                        donorName,
                        donorEmail,
                        donorPhone,
                        amount: amountInPaisa,
                        currency: "INR",
                        causeName: cause.title,
                        causeId,
                        message: donorDetailsPayload.message,
                    };
                    try {
                        const verifyRes = await PaymentApi.verifyPayment(verifyPayload);
                        if (verifyRes.data === true) {
                            Swal.fire(
                                "🎉 Payment Successful!",
                                `Payment ID: ${response.razorpay_payment_id}`,
                                "success"
                            );
                        } else {
                            Swal.fire(
                                "❗ Verification Failed",
                                "Please contact support with payment details.",
                                "error"
                            );
                        }
                    } catch (err) {
                        Swal.fire(
                            "❗ Verification Error",
                            "Could not verify payment. Contact support.",
                            "error"
                        );
                    }
                },
                prefill: { name: donorName, email: donorEmail, contact: donorPhone },
                theme: { color: "#0f172a" },
                modal: {
                    ondismiss: () =>
                        Swal.fire("Payment Cancelled", "You closed the payment window.", "info"),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            Swal.close();
        } catch (err) {
            Swal.fire("Error", "Something went wrong during payment.", "error");
        } finally {
            setIsPaymentProcessing(false);
        }
    };

    // ✅ Donation entry point
    const handleDonate = async (causeId) => {
        const { value: amount } = await Swal.fire({
            title: "Enter donation amount",
            input: "number",
            inputAttributes: { min: 1, step: 1 },
            inputValidator: (val) => !val || val <= 0 && "Enter valid amount",
            showCancelButton: true,
            confirmButtonText: "Next",
        });

        if (amount) {
            collectDonorDetails(Number(amount), causeId);
        }
    };

    // --- UI Rendering ---
    if (loading) return <p className="loading-text">Loading cause...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!cause) return <p className="error-text">Cause not found.</p>;

    const raisedAmount = Number(cause.currentAmount) || 0;
    const targetAmount = Number(cause.targetAmount) || 1;
    const progressPercentage = Math.min((raisedAmount / targetAmount) * 100, 100);

    return (
        <div className="cause-details-page">
            <button onClick={() => navigate("/causes")} className="back-button">
                ← Back to All Causes
            </button>

            <div className="cause-card-details">
                <div className="cause-image-container">
                    {cause.mediaType === 'VIDEO' ? (
                        <video
                            src={getImageUrl(cause.videoUrl)}
                            className="modal-image"
                            autoPlay
                            loop
                            muted
                            playsInline
                            onContextMenu={(e) => e.preventDefault()}
                            controlsList="nodownload"
                        />
                    ) : (
                        <img
                            src={getImageUrl(cause.imageUrl)}
                            alt={cause.title}
                            className="modal-image"
                            onError={(e) => {
                                e.currentTarget.src = "/crowdfund_logo.png"; // fallback if 404 or broken
                                e.currentTarget.onerror = null; // prevent infinite loop if default also missing
                            }}
                        />
                    )}

                </div>
                <div className="cause-details-content">
                    <h1 className="cause-title-details">{cause.title}</h1>
                    <p className="cause-description-details">{cause.description}</p>

                    <div className="fundraising-progress">
                        <span>
                            <strong>₹{raisedAmount.toLocaleString()}</strong> raised of ₹
                            {targetAmount.toLocaleString()} goal
                        </span>
                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    <div className="action-buttons-container">
                        <button
                            className="donate-button"
                            onClick={() => handleDonate(cause.id || cause._id)}
                            disabled={isPaymentProcessing || !isScriptLoaded}
                        >
                            {isPaymentProcessing ? "Processing..." : "Donate Now"}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CauseDetails;
