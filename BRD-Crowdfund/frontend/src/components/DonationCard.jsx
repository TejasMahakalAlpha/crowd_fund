// DonationCard.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { PublicApi, PaymentApi } from "../services/api"; // Ensure PaymentApi is imported
import "./DonationCard.css"; // Assuming your CSS file is here

const DonationCard = () => {
  const [causes, setCauses] = useState([]);
  const [selectedCauseId, setSelectedCauseId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // No separate state for donorName, donorEmail, donorPhone needed at component level now,
  // as they will be managed within the SweetAlert modal.

  const donationTypes = [
    {
      title: "ONE-TIME GIFT",
      description:
        "Make a one-time donation and help us take a step forward in our mission to support critical causes.",
      amount: 50000, // INR 500.00 (500 * 100 paisa)
    },
    {
      title: "LIVING LEGACY",
      description:
        "Leave a legacy of hope and kindness that lasts for generations by contributing in memory or will.",
      amount: 100000, // INR 1000.00 (1000 * 100 paisa)
    },
  ];

  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const res = await PublicApi.getCauses();
        if (Array.isArray(res.data)) {
          setCauses(res.data);
          if (res.data.length > 0) {
            setSelectedCauseId(res.data[0].id);
          } else {
            console.warn("No causes fetched. User cannot select a cause to donate to.");
            Swal.fire("Info", "No active causes available for donation at the moment.", "info");
          }
        } else {
          console.error("API response for causes is not an array:", res.data);
          Swal.fire("Error", "Unexpected data format for causes. Please contact support.", "error");
        }
      } catch (error) {
        console.error("Error fetching causes:", error);
        Swal.fire("Error", "Unable to fetch causes. Please try again later.", "error");
      }
    };

    fetchCauses();
    fetchTotalDonation();
    loadRazorpayScript();
  }, []);

  const fetchTotalDonation = async () => {
    try {
      const res = await PublicApi.getAllDonations();
      if (Array.isArray(res.data)) {
        const total = res.data.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
        setTotalAmount(total);
      } else {
        console.warn("Unexpected response format for total donations:", res.data);
      }
    } catch (err) {
      console.error("[DEBUG] Error fetching total donation data:", err);
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

  // --- New function to collect donor details via SweetAlert2 ---
  const collectDonorDetails = async (amountInPaisa) => {
    // Basic pre-checks
    if (!selectedCauseId) {
      Swal.fire("Error", "Please select a cause first.", "warning");
      return;
    }
    if (!isScriptLoaded || typeof window.Razorpay === "undefined") {
      Swal.fire("Error", "Payment script not loaded. Please try refreshing the page.", "error");
      loadRazorpayScript();
      return;
    }

    // Show SweetAlert2 form for donor details
    const { value: formValues } = await Swal.fire({
      title: 'Enter Your Details',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Full Name" required>
        <input id="swal-input2" class="swal2-input" type="email" placeholder="Email Address" required>
        <input id="swal-input3" class="swal2-input" type="tel" placeholder="Phone Number (10 digits)" required>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Proceed to Pay',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value.trim();
        const email = document.getElementById('swal-input2').value.trim();
        const phone = document.getElementById('swal-input3').value.trim();

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
        return { name: name, email: email, phone: phone };
      }
    });

    if (formValues) {
      // If user provided details and validation passed, start the actual payment
      startPayment(amountInPaisa, formValues.name, formValues.email, formValues.phone);
    } else {
      // User cancelled the form
      Swal.fire("Donation Cancelled", "You can try again anytime!", "info");
    }
  };
  // --- End New function ---


  const startPayment = async (amountInPaisa, donorName, donorEmail, donorPhone) => {
    setLoading(true);

    // Show processing message while order is being created
    Swal.fire({
      title: "Initiating Payment...",
      html: "Please wait while we set up your transaction.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const selectedCause = causes.find((c) => c.id === selectedCauseId);
      if (!selectedCause) {
        Swal.fire("Error", "Selected cause not found. Please re-select.", "error");
        setLoading(false);
        Swal.close();
        return;
      }

      const donorDetailsPayload = {
        donorName: donorName,
        donorEmail: donorEmail,
        donorPhone: donorPhone,
        message: "Happy to contribute!", // This can also be an input field if needed
        amount: amountInPaisa,
        currency: "INR",
        causeId: selectedCauseId,
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
        setLoading(false);
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
            causeName: selectedCause?.title || "General Donation",
            causeId: selectedCauseId,
            message: donorDetailsPayload.message,
          };

          try {
            const verifyRes = await PaymentApi.verifyPayment(verifyPayload);
            if (verifyRes.data === true) {
              Swal.fire("🎉 Payment Successful!", `Payment ID: ${response.razorpay_payment_id}`, "success");
              fetchTotalDonation();
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
      setLoading(false); // Ensure button is re-enabled in all cases
    }
  };

  return (
    <section className="donation-section" id="donation">
      <h2 className="donation-title">Ways You Can Support</h2>

      <div className="cause-select" style={{ marginBottom: "1rem" }}>
        <label htmlFor="cause-select">Choose Cause:</label>
        <select
          id="cause-select"
          value={selectedCauseId || ""}
          onChange={(e) => setSelectedCauseId(Number(e.target.value))}
          disabled={loading || causes.length === 0}
        >
          {causes.length === 0 ? (
            <option value="">Loading Causes...</option>
          ) : (
            causes.map((cause) => (
              <option key={cause.id} value={cause.id}>
                {cause.title}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Donor details form will now be handled by the SweetAlert modal.
          So, remove the previous HTML for donor details input fields from here. */}

      <div className="donation-card-container">
        {donationTypes.map((type, idx) => (
          <div className="donation-card" key={idx}>
            <h3>{type.title}</h3>
            <p>{type.description}</p>
            <button
              onClick={() => collectDonorDetails(type.amount)} // Call the new function first
              disabled={loading || !selectedCauseId || !isScriptLoaded} // Disable if no cause selected or script not loaded
              className="donate-btn"
            >
              {loading ? "Processing..." : `Donate ₹${(type.amount / 100).toLocaleString()}`}
            </button>
          </div>
        ))}
      </div>

      <h3>Total Donations: ₹{(totalAmount / 100).toLocaleString()}</h3>
    </section>
  );
};

export default DonationCard;