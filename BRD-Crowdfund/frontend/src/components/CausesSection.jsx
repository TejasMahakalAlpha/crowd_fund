import React, { useEffect, useState, useCallback } from "react"; // ⭐ IMPORTED: useCallback
import { useNavigate } from "react-router-dom";
import API, { PublicApi, PaymentApi } from "../services/api";
import "./CausesSection.css";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const CausesSection = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const getImageUrl = (relativePath) => {
    return `${API_BASE}/api/images/${relativePath}`;
  };

  // ⭐ MODIFIED: fetchCauses function wrapped with useCallback ⭐
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
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    fetchCauses();
    loadRazorpayScript();
  }, [fetchCauses]); // ⭐ ADDED: fetchCauses to useEffect's dependency array

  // ⭐ NEW: Load Razorpay Script function (copied from DonationCard)
  const loadRazorpayScript = () => {
    if (document.querySelector("#razorpay-script")) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      console.log("Razorpay script loaded successfully.");
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script.");
      Swal.fire("Error", "Failed to load payment gateway. Please try again later.", "error");
    };
    document.body.appendChild(script);
  };

  // ⭐ NEW: Collect Donor Details function (adapted from DonationCard)
  const collectDonorDetails = async (amountInPaisa, causeId) => {
    if (!isScriptLoaded || typeof window.Razorpay === "undefined") {
      Swal.fire("Error", "Payment script not loaded. Please try refreshing the page.", "error");
      loadRazorpayScript();
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Enter Your Details',
      html: `
        <input id="swal-input-name" class="swal2-input" placeholder="Full Name" required>
        <input id="swal-input-email" class="swal2-input" type="email" placeholder="Email Address" required>
        <input id="swal-input-phone" class="swal2-input" type="tel" placeholder="Phone Number (10 digits)" required>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Proceed to Pay',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const name = document.getElementById('swal-input-name').value.trim();
        const email = document.getElementById('swal-input-email').value.trim();
        const phone = document.getElementById('swal-input-phone').value.trim();

        if (!name || !email || !phone) {
          Swal.showValidationMessage(`Please fill in all details`);
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
          Swal.showValidationMessage(`Please enter a valid email address`);
          return false;
        }
        if (!/^\d{10}$/.test(phone)) {
          Swal.showValidationMessage(`Please enter a valid 10-digit phone number`);
          return false;
        }
        return { name, email, phone };
      }
    });

    if (formValues) {
      startPayment(amountInPaisa, formValues.name, formValues.email, formValues.phone, causeId);
    } else {
      Swal.fire("Donation Cancelled", "You can try again anytime!", "info");
    }
  };

  // ⭐ NEW: Start Payment function (adapted from DonationCard)
  const startPayment = async (amountInPaisa, donorName, donorEmail, donorPhone, causeId) => {
    setIsPaymentProcessing(true);

    Swal.fire({
      title: "Initiating Payment...",
      html: "Please wait while we set up your transaction.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const selectedCauseForPayment = causes.find((c) => c.id === causeId);
      if (!selectedCauseForPayment) {
        Swal.fire("Error", "Selected cause not found for payment. Please re-select.", "error");
        setIsPaymentProcessing(false);
        Swal.close();
        return;
      }

      const donorDetailsPayload = {
        donorName: donorName,
        donorEmail: donorEmail,
        donorPhone: donorPhone,
        message: `Donation for ${selectedCauseForPayment.title}`, // Dynamic message
        amount: amountInPaisa,
        currency: "INR",
        causeId: causeId, // Pass the specific cause ID
      };

      console.log("[DEBUG] Sending donation and order creation request:", donorDetailsPayload);
      const res = await PaymentApi.createDonationAndOrder(donorDetailsPayload);
      const responseData = res.data;
      console.log("[DEBUG] Backend response for order creation:", responseData);

      const orderId = responseData.orderId;
      const amountFromBackend = responseData.amount;
      const currencyFromBackend = responseData.currency;
      const razorpayKey = responseData.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!orderId || !amountFromBackend || !currencyFromBackend || !razorpayKey) {
        console.error("Missing required fields from backend response:", responseData);
        Swal.fire("Error", "Payment setup failed: Incomplete data from server. Contact support.", "error");
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
          console.log("[DEBUG] Razorpay handler response:", response);

          const verifyPayload = {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            donorName: donorDetailsPayload.donorName,
            donorEmail: donorDetailsPayload.donorEmail,
            donorPhone: donorDetailsPayload.donorPhone,
            amount: donorDetailsPayload.amount,
            currency: donorDetailsPayload.currency,
            causeName: selectedCauseForPayment?.title || "General Donation",
            causeId: causeId,
            message: donorDetailsPayload.message,
          };

          try {
            const verifyRes = await PaymentApi.verifyPayment(verifyPayload);
            if (verifyRes.data === true) {
              Swal.fire("🎉 Payment Successful!", `Payment ID: ${response.razorpay_payment_id}`, "success");
              // You might want to re-fetch causes to update currentAmount progress bar
              fetchCauses(); // ⭐ This call should now work
            } else {
              Swal.fire("❗ Payment Verification Failed", "Payment processed but failed verification. Please contact support.", "error");
            }
          } catch (err) {
            console.error("[DEBUG] Payment verification failed on backend:", err);
            Swal.fire("❗ Payment Verification Failed", "There was an error verifying your payment. Please contact support with Payment ID: " + response.razorpay_payment_id, "error");
          }
        },
        prefill: {
          name: donorDetailsPayload.donorName,
          email: donorDetailsPayload.donorEmail,
          contact: donorDetailsPayload.donorPhone,
        },
        theme: {
          color: "#0f172a"
        },
        modal: {
          ondismiss: () => {
            console.log("Razorpay modal dismissed by user.");
            Swal.fire("Payment Cancelled", "You have closed the payment window.", "info");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      Swal.close(); // Close the initial "Initiating Payment..." Swal

    } catch (error) {
      console.error("[DEBUG] Error in startPayment function:", error);
      Swal.close();
      let errorMessage = "Something went wrong during payment. Please try again later.";
      if (error.response) {
        console.error("Backend error response:", error.response.data);
        errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        Swal.fire("Error", `Payment failed: ${errorMessage}`, "error");
      } else if (error.request) {
        console.error("No response from server:", error.request);
        Swal.fire("Error", "No response from server. Check your internet or backend status.", "error");
      } else {
        Swal.fire("Error", `An unexpected error occurred: ${errorMessage}`, "error");
      }
    } finally {
      setIsPaymentProcessing(false); // Ensure button is re-enabled in all cases
    }
  };

  // Original handleDonate, now simplified to just collect amount and then details
  const handleDonate = async (causeId) => {
    const { value: amount } = await Swal.fire({
      title: "Enter donation amount",
      input: "number",
      inputAttributes: {
        min: 1,
        step: 1,
      },
      inputValidator: (value) => {
        if (!value || value <= 0) {
          return "Please enter a valid amount";
        }
      },
      showCancelButton: true,
      confirmButtonText: "Next", // Changed button text to proceed to details
    });

    if (amount) {
      // Amount is in rupees, convert to paisa for Razorpay
      const amountInPaisa = Number(amount) * 100; 
      collectDonorDetails(amountInPaisa, causeId); // ⭐ Call the new function to collect details
    } else {
        Swal.fire("Donation Cancelled", "No amount entered. You can try again anytime!", "info");
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
            const percentage = Math.min(100, Math.round((raised / goal) * 100));

            return (
              <div className="cause-card" key={cause.id || cause._id || index}> {/* Use cause.id or cause._id for key */}
                {/* Cause Image */}
                {cause.imageUrl && (
                  <img
                    src={getImageUrl(cause.imageUrl)}
                    alt={cause.title}
                    className="cause-image"
                    // Inline styles can be moved to CSS for better practice
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      borderTopLeftRadius: "8px",
                      borderTopRightRadius: "8px",
                      marginBottom: "10px",
                    }}
                  />
                )}

                {/* Title */}
                <h3
                  className="cause-title"
                  onClick={() => {
                    setSelectedCause(cause);
                    setModalOpen(true);
                  }}
                  style={{ cursor: "pointer", color: "#004d40" }}
                >
                  {cause.title}
                </h3>

                {/* Progress Bar */}
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <p className="donation-info">
                  ₹{raised.toLocaleString()} donated of ₹{goal.toLocaleString()} goal
                </p>

                <p className="description">{cause.description}</p>

                <button
                  className="donate-btn"
                  onClick={() => handleDonate(cause.id || cause._id)} // Pass cause.id or cause._id
                  disabled={isPaymentProcessing || !isScriptLoaded} // Disable during payment processing or if script not loaded
                >
                  {isPaymentProcessing ? "Processing..." : "Donate Now"}
                </button>
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

            {selectedCause.imageUrl && (
              <img
                src={getImageUrl(selectedCause.imageUrl)}
                alt={selectedCause.title}
                className="modal-image"
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
            {/* You might want a donate button inside the modal as well, similar to handleDonate */}
          </div>
        </div>
      )}
    </section>
  );
};

export default CausesSection;