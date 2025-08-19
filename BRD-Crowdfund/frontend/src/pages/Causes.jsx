import React, { useEffect, useState, useCallback } from "react";
import "./Causes.css";
import { PublicApi, PaymentApi } from "../services/api";
import Swal from "sweetalert2";
import { FaShareAlt } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const slugify = (text) => {
  if (!text) return '';
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};
const Causes = () => {
  const [causes, setCauses] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [causeToView, setCauseToView] = useState(null);

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);


  const getImageUrl = (relativePath) => {
    if (!relativePath) return "";
    return `${API_BASE}/api/images/${relativePath}`;
  };

  const fetchCauses = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const res = await PublicApi.getCauses();
      setCauses(res.data);
    } catch (err) {
      console.error("Failed to load causes", err);
    } finally {
      setIsPageLoading(false);
    }
  }, []);

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
    script.onerror = () => Swal.fire("Error", "Failed to load payment gateway. Please try again later.", "error");
    document.body.appendChild(script);
  };

  const collectDonorDetails = async (amountInPaisa, causeId) => {
    // This function logic remains unchanged
    if (!isScriptLoaded || typeof window.Razorpay === "undefined") {
      Swal.fire("Error", "Payment script not loaded. Please try refreshing the page.", "error");
      loadRazorpayScript();
      return;
    }
    // const { value: accepted } = await Swal.fire({
    //   title: 'Terms & Conditions',
    //   html: termsAndConditionsText,
    //   input: 'checkbox',
    //   inputValue: 0,
    //   inputPlaceholder: 'I have read and agree to the terms and conditions',
    //   confirmButtonText: 'Agree & Continue →',
    //   showCancelButton: true,
    //   inputValidator: (result) => !result && 'You must agree to the terms and conditions to proceed.'
    // });
    // if (accepted) {
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
    }
    );
    if (formValues) {
      startPayment(amountInPaisa, formValues.name, formValues.email, formValues.phone, causeId);
    } else {
      Swal.fire("Donation Cancelled", "You can try again anytime!", "info");
    }
    // }
  };

  const startPayment = async (amountInPaisa, donorName, donorEmail, donorPhone, causeId) => {
    // This function logic remains unchanged
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
              Swal.fire("❗ Payment Verification Failed", "Please contact support.", "error");
            }
          } catch (err) {
            Swal.fire("❗ Payment Verification Error", "Please contact support with Payment ID: " + response.razorpay_payment_id, "error");
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
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Payment setup failed.";
      Swal.fire("Error", `Payment failed: ${errorMessage}`, "error");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleDonate = async (cause) => {
    // This function logic remains unchanged
    const causeId = cause.id || cause._id;
    const { value: amount } = await Swal.fire({ title: `Donate to ${cause.title}`, input: "number", inputLabel: "Amount (INR)", inputPlaceholder: "e.g., 500", showCancelButton: true, confirmButtonText: "Next", inputValidator: (value) => { if (!value || value <= 0) return "Please enter a valid amount"; } });
    if (amount) {
      collectDonorDetails(Number(amount), causeId);
    }
  };

  useEffect(() => {
    fetchCauses();
    loadRazorpayScript();
  }, [fetchCauses]);

  if (isPageLoading) {
    return <div className="loading-state">Loading Causes...</div>;
  }

  return (
    <div className="causes-page">
      {causeToView ? (
        <div className="single-cause-view-full-page">
          <button onClick={() => setCauseToView(null)} className="back-button">
            ← Back to All Causes
          </button>
          <h2 className="modal-title">{causeToView.title}</h2>

          {causeToView.mediaType === 'VIDEO' ? (
            <video
              src={getImageUrl(causeToView.videoUrl)}
              className="modal-image"
              autoPlay
              loop
              muted
              playsInline
              onContextMenu={(e) => e.preventDefault()} // Disable right-click
              controlsList="nodownload" // Disable download in some browsers
            />
          ) : (
            <img
              src={getImageUrl(causeToView.imageUrl)}
              alt={causeToView.title}
              className="modal-image"
            />
          )}

          <div className="modal-details">
            <p><strong>Description:</strong> {causeToView.description}</p>
            <p><strong>Category:</strong> {causeToView.category}</p>
            <p><strong>Location:</strong> {causeToView.location}</p>
            <p><strong>Status:</strong> {causeToView.status}</p>
            <p><strong>End Date:</strong> {causeToView.endDate ? new Date(causeToView.endDate).toLocaleDateString() : "N/A"}</p>
            <p><strong>Raised:</strong> ₹{Number(causeToView.currentAmount).toLocaleString()} of ₹{Number(causeToView.targetAmount).toLocaleString()}</p>
          </div>
          <button
            className="donate-btn"
            style={{ marginTop: '1.5rem', width: '100%' }}
            onClick={() => handleDonate(causeToView)}
            disabled={isPaymentProcessing || !isScriptLoaded}
          >
            {isPaymentProcessing ? 'Processing...' : 'Donate to this Cause'}
          </button>
        </div>
      ) : (
        <>
          <section className="causes-hero">
            <h1>Our Causes</h1>
            <p>Explore ongoing initiatives and support the ones that matter to you most.</p>
          </section>
          <div className="causes-grid">
            {causes.map((cause) => {
              const raised = Number(cause.currentAmount) || 0;
              const goal = Number(cause.targetAmount) || 1;
              const percentage = Math.min(100, Math.round((raised / goal)));
              const causeId = cause.id || cause._id;
              return (
                <div className="cause-box" key={causeId}>
                  {/* --- UPDATED: onClick handler and style removed from this div --- */}
                  <div>
                    {cause.mediaType === 'VIDEO' ? (
                      <video
                        src={getImageUrl(cause.videoUrl)}
                        className="modal-image" // You can use the same class for consistent styling
                        autoPlay
                        loop
                        muted
                        playsInline
                        onContextMenu={(e) => e.preventDefault()} // Disable right-click
                        controlsList="nodownload" // Disable download in some browsers
                      />
                    ) : (
                      <img
                        src={getImageUrl(cause.imageUrl)}
                        alt={cause.title}
                        className="modal-image"
                      />
                    )}

                    <h3>{cause.title}</h3>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <p className="donation-amount">
                      ₹{raised.toLocaleString()} raised of ₹{goal.toLocaleString()} goal
                    </p>
                    <p>{cause.shortDescription}</p>
                  </div>
                  <div className="btn-container">
                    <button
                      className="donate-btn"
                      onClick={() => handleDonate(cause)}
                      disabled={isPaymentProcessing || !isScriptLoaded}
                    >
                      {isPaymentProcessing ? 'Processing...' : 'Donate Now'}
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
        </>
      )}
    </div>
  );
};

export default Causes;
