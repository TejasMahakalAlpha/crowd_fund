// src/pages/Causes.jsx
import React, { useEffect, useState, useCallback } from "react";
import "./Causes.css";
import { PublicApi, PaymentApi } from "../services/api";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Causes = () => {
  const [causes, setCauses] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [causeToView, setCauseToView] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const getImageUrl = (relativePath) => {
    return `${API_BASE}/api/images/${relativePath}`;
  };

  const handleShowSingleCause = (cause) => {
    setCauseToView(cause);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const startPayment = async (amountInPaisa, donorDetails, cause) => {
    setIsPaymentProcessing(true);
    Swal.fire({
      title: "Initiating Payment...", html: "Please wait.", allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const donorDetailsPayload = {
        donorName: donorDetails.name,
        donorEmail: donorDetails.email,
        donorPhone: donorDetails.phone,
        message: `Donation for ${cause.title}`, // This line was added to fix the error
        amount: amountInPaisa,
        currency: "INR",
        causeId: cause.id,
      };

      const res = await PaymentApi.createDonationAndOrder(donorDetailsPayload);
      const { orderId, razorpayKeyId, amount, currency } = res.data;
      
      if (!orderId || !razorpayKeyId) {
        throw new Error("Payment setup failed.");
      }

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: amount,
        currency: currency,
        name: "Alphaseam Foundation",
        description: `Donation for: ${cause.title}`,
        order_id: orderId,
        handler: async (response) => {
          Swal.fire("🎉 Payment Successful!", `Thank you for your generous contribution!`, "success");
          fetchCauses(); 
        },
        prefill: { name: donorDetails.name, email: donorDetails.email, contact: donorDetails.phone },
        theme: { color: "#0f172a" },
        modal: { ondismiss: () => Swal.fire("Payment Cancelled", "Your donation was not completed.", "info") },
      });
      rzp.open();
      Swal.close();
    } catch (error) {
      Swal.close();
      Swal.fire("Error", `Payment failed: ${error.message}`, "error");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const collectDonorDetails = async (amountInPaisa, cause) => {
    const { value: formValues } = await Swal.fire({
      title: 'Enter Your Details',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Full Name" required>
        <input id="swal-input2" class="swal2-input" type="email" placeholder="Email Address" required>
        <input id="swal-input3" class="swal2-input" type="tel" placeholder="Phone Number (10 digits)" required>
      `,
      focusConfirm: false, showCancelButton: true, confirmButtonText: 'Proceed to Pay',
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value.trim();
        const email = document.getElementById('swal-input2').value.trim();
        const phone = document.getElementById('swal-input3').value.trim();
        if (!name || !email || !phone) { Swal.showValidationMessage(`Please fill in all details`); return false; }
        if (!/\S+@\S+\.\S+/.test(email)) { Swal.showValidationMessage(`Please enter a valid email address`); return false; }
        if (!/^\d{10}$/.test(phone)) { Swal.showValidationMessage(`Please enter a valid 10-digit phone number`); return false; }
        return { name, email, phone };
      }
    });

    if (formValues) {
      startPayment(amountInPaisa, formValues, cause);
    }
  };

  const handleDonate = async (cause) => {
    const { value: amount } = await Swal.fire({
        title: `Donate to ${cause.title}`, input: "number", inputLabel: "Amount (INR)",
        inputPlaceholder: "e.g., 500", showCancelButton: true, confirmButtonText: "Next",
        inputValidator: (value) => { if (!value || value <= 0) return "Please enter a valid amount"; }
    });
    if (amount) {
      collectDonorDetails(Number(amount) * 100, cause);
    }
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
          {causeToView.imageUrl && (
            <img src={getImageUrl(causeToView.imageUrl)} alt={causeToView.title} className="modal-image" />
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
            style={{marginTop: '1.5rem', width: '100%'}} 
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
              const percentage = Math.min(100, Math.round((raised / goal) * 100));
              const causeId = cause.id || cause._id;
              return (
                <div className="cause-box" key={causeId}>
                  <div onClick={() => handleShowSingleCause(cause)} style={{ cursor: 'pointer' }}>
                    {cause.imageUrl && (
                      <img src={getImageUrl(cause.imageUrl)} alt={cause.title} className="cause-image" />
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
                  <button 
                    className="donate-btn" 
                    onClick={() => handleDonate(cause)}
                    disabled={isPaymentProcessing || !isScriptLoaded}
                  >
                    {isPaymentProcessing ? 'Processing...' : 'Donate Now'}
                  </button>
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