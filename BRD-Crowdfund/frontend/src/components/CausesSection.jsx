import React, { useEffect, useState, useCallback } from "react";
import { PublicApi, PaymentApi } from "../services/api";
import "./CausesSection.css";
import Swal from "sweetalert2";
import { FaShareAlt } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ✅ 1. YEH FUNCTION ADD KAREIN
const slugify = (text) => {
  if (!text) return '';
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const CausesSection = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);


  const getImageUrl = (relativePath) => {
    if (!relativePath) return "";
    return `${API_BASE}/api/images/${relativePath}`;
  };

  const fetchCauses = useCallback(async () => {
    try {
      const res = await PublicApi.getCauses();
      if (Array.isArray(res.data)) {
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );
        const latestThree = sorted.slice(0, 3);
        setCauses(latestThree);
      } else {
        console.warn("⚠️ Unexpected response format:", res.data);
      }
    } catch (err) {
      console.error("❌ Failed to fetch causes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCauses();
    loadRazorpayScript();
  }, [fetchCauses]);

  const handleShare = async (cause) => {
    // ✅ 2. BAS YEH LINE BADLI HAI
    const shareData = {
      title: cause.title,
      text: cause.description,
      url: `${window.location.origin}/causes/${slugify(cause.title)}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Error sharing:", error);
          Swal.fire("Error", "Could not share this cause.", "error");
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

  const loadRazorpayScript = () => {
    if (document.querySelector("#razorpay-script")) {
      setIsScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => Swal.fire("Error", "Failed to load payment gateway.", "error");
    document.body.appendChild(script);
  };

  const collectDonorDetails = async (amountInPaisa, causeId) => {
    if (!isScriptLoaded || typeof window.Razorpay === "undefined") {
      Swal.fire("Error", "Payment script not loaded. Please try refreshing the page.", "error");
      loadRazorpayScript();
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Enter Your Details',
      html: `<input id="swal-input-name" class="swal2-input" placeholder="Full Name" required><input id="swal-input-email" class="swal2-input" type="email" placeholder="Email Address" required><input id="swal-input-phone" class="swal2-input" type="tel" placeholder="Phone Number (10 digits)" required>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Proceed to Pay',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const name = document.getElementById('swal-input-name').value.trim();
        const email = document.getElementById('swal-input-email').value.trim();
        const phone = document.getElementById('swal-input-phone').value.trim();
        if (!name || !email || !phone) { Swal.showValidationMessage(`Please fill in all details`); return false; }
        if (!/\S+@\S+\.\S+/.test(email)) { Swal.showValidationMessage(`Please enter a valid email address`); return false; }
        if (!/^\d{10}$/.test(phone)) { Swal.showValidationMessage(`Please enter a valid 10-digit phone number`); return false; }
        return { name, email, phone };
      }
    });
    if (formValues) {
      startPayment(amountInPaisa, formValues.name, formValues.email, formValues.phone, causeId);
    } else {
      Swal.fire("Donation Cancelled", "You can try again anytime!", "info");
    }

  };

  const startPayment = async (amountInPaisa, donorName, donorEmail, donorPhone, causeId) => {
    setIsPaymentProcessing(true);
    Swal.fire({ title: "Initiating Payment...", html: "Please wait...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const selectedCauseForPayment = causes.find((c) => (c.id || c._id) === causeId);
      if (!selectedCauseForPayment) {
        Swal.fire("Error", "Selected cause not found for payment.", "error");
        setIsPaymentProcessing(false);
        Swal.close();
        return;
      }
      const donorDetailsPayload = { donorName, donorEmail, donorPhone, message: `Donation for ${selectedCauseForPayment.title}`, amount: amountInPaisa, currency: "INR", causeId };
      const res = await PaymentApi.createDonationAndOrder(donorDetailsPayload);
      const { orderId, amount: amountFromBackend, currency: currencyFromBackend, razorpayKeyId } = res.data;
      const razorpayKey = razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!orderId || !amountFromBackend || !currencyFromBackend || !razorpayKey) {
        Swal.fire("Error", "Payment setup failed: Incomplete data from server.", "error");
        setIsPaymentProcessing(false);
        Swal.close();
        return;
      }
      const options = {
        key: razorpayKey,
        amount: amountFromBackend,
        currency: currencyFromBackend,
        name: "Alphaseam Foundation",
        description: "Donation Payment",
        order_id: orderId,
        handler: async (response) => {
          const verifyPayload = { orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id, signature: response.razorpay_signature, donorName, donorEmail, donorPhone, amount: amountInPaisa, currency: "INR", causeName: selectedCauseForPayment?.title || "General Donation", causeId, message: donorDetailsPayload.message };
          try {
            const verifyRes = await PaymentApi.verifyPayment(verifyPayload);
            if (verifyRes.data === true) {
              Swal.fire("🎉 Payment Successful!", `Payment ID: ${response.razorpay_payment_id}`, "success");
              fetchCauses();
            } else {
              Swal.fire("❗ Payment Verification Failed", "Payment processed but failed verification. Please contact support.", "error");
            }
          } catch (err) {
            Swal.fire("❗ Payment Verification Failed", "There was an error verifying your payment. Please contact support with Payment ID: " + response.razorpay_payment_id, "error");
          }
        },
        prefill: { name: donorName, email: donorEmail, contact: donorPhone },
        theme: { color: "#0f172a" },
        modal: { ondismiss: () => Swal.fire("Payment Cancelled", "You have closed the payment window.", "info") }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      Swal.close();
    } catch (error) {
      Swal.close();
      let errorMessage = "Something went wrong during payment.";
      if (error.response) {
        errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        Swal.fire("Error", `Payment failed: ${errorMessage}`, "error");
      } else if (error.request) {
        Swal.fire("Error", "No response from server.", "error");
      } else {
        Swal.fire("Error", `An unexpected error occurred: ${errorMessage}`, "error");
      }
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleDonate = async (causeId) => {
    const { value: amount } = await Swal.fire({ title: "Enter donation amount", input: "number", inputAttributes: { min: 1, step: 1 }, inputValidator: (value) => { if (!value || value <= 0) return "Please enter a valid amount"; }, showCancelButton: true, confirmButtonText: "Next" });
    if (amount) {
      const amountInPaisa = Number(amount);
      collectDonorDetails(amountInPaisa, causeId);
    } else {
      Swal.fire("Donation Cancelled", "No amount entered.", "info");
    }
  };

  return (
    <section className="causes-section" id="causes">
      <h2 className="section-title">Causes That Need Your Urgent Attention</h2>
      {loading ? (
        <p>Loading causes...</p>
      ) : (
        <div className="causes-grid">
          {causes.map((cause, index) => {
            const raised = Number(cause.currentAmount) || 0;
            const goal = Number(cause.targetAmount) || 1;
            const percentage = Math.min((raised / goal) * 100, 100);
            const causeId = cause.id || cause._id;

            return (
              <div className="cause-card" key={causeId || index}>
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

                <h3
                  className="cause-title"
                  onClick={() => {
                    setSelectedCause(cause);
                    setModalOpen(true);
                  }}
                >
                  {cause.title}
                </h3>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                </div>
                <p className="donation-info">
                  ₹{raised.toLocaleString()} donated of ₹{goal.toLocaleString()} goal
                </p>
                <p className="description">{cause.description}</p>

                <div className="cause-actions">
                  <button
                    className="donate-btn"
                    onClick={() => handleDonate(causeId)}
                    disabled={isPaymentProcessing || !isScriptLoaded}
                  >
                    {isPaymentProcessing ? "Processing..." : "Donate Now"}
                  </button>

                  <button
                    className="share-btn"
                    title="Share this cause"
                    onClick={() => handleShare(cause)}
                  >
                    Share  <FaShareAlt />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {modalOpen && selectedCause && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setModalOpen(false)}>×</button>
            <h2 className="modal-title">{selectedCause.title?.toUpperCase()}</h2>

            {selectedCause.mediaType === 'VIDEO' ? (
              <video
                src={getImageUrl(selectedCause.videoUrl)}
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
                src={getImageUrl(selectedCause.imageUrl)}
                alt={selectedCause.title}
                className="modal-image"
                onError={(e) => {
                  e.currentTarget.src = "/crowdfund_logo.png"; // fallback if 404 or broken
                  e.currentTarget.onerror = null; // prevent infinite loop if default also missing
                }}
              />
            )}

            <div className="modal-details">
              <p><strong>Category:</strong> {selectedCause.category}</p>
              <p><strong>Location:</strong> {selectedCause.location}</p>
              <p><strong>Description:</strong> {selectedCause.description}</p>
              <p><strong>Raised:</strong> ₹{Number(selectedCause.currentAmount).toLocaleString()} of ₹{Number(selectedCause.targetAmount).toLocaleString()}</p>
              <p><strong>Status:</strong> {selectedCause.status}</p>
              <p><strong>End Date:</strong> {selectedCause.endDate ? new Date(selectedCause.endDate).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CausesSection;