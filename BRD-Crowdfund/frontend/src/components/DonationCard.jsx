import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { PublicApi } from "../services/api";
import "./DonationCard.css";

const DonationCard = () => {
  const [causes, setCauses] = useState([]);
  const [selectedCauseId, setSelectedCauseId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const donationTypes = [
    {
      title: "ONE-TIME GIFT",
      description:
        "Make a one-time donation and help us take a step forward in our mission to support critical causes.",
      amount: 50000,
    },
    {
      title: "LIVING LEGACY",
      description:
        "Leave a legacy of hope and kindness that lasts for generations by contributing in memory or will.",
      amount: 100000,
    },
  ];

  useEffect(() => {
    // Causes fetch करें और डिफ़ॉल्ट selected cause सेट करें
    const fetchCauses = async () => {
      try {
        const res = await PublicApi.getCauses();
        console.log("[DEBUG] Causes fetched:", res.data);
        setCauses(res.data);
        if (res.data.length > 0) setSelectedCauseId(res.data[0].id);
      } catch (error) {
        console.error("[DEBUG] Error fetching causes:", error);
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
      const total = res.data.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
      setTotalAmount(total);
      console.log("[DEBUG] Total Donations:", total);
    } catch (err) {
      console.error("[DEBUG] Error fetching donation data:", err);
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
      setIsScriptLoaded(true);
      console.log("[DEBUG] Razorpay script loaded.");
    };
    script.onerror = () => {
      console.error("[DEBUG] Razorpay SDK failed to load.");
      Swal.fire("Error", "Failed to load payment gateway. Please try again later.", "error");
    };
    document.body.appendChild(script);
  };

  const startPayment = async (amount) => {
    if (!selectedCauseId) {
      Swal.fire("Error", "Please select a cause first.", "warning");
      return;
    }
    if (!isScriptLoaded) {
      Swal.fire("Please wait", "Loading payment gateway...", "info");
      return;
    }

    setLoading(true);

    try {
      Swal.fire({
        title: "Processing...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Backend को donation + order बनाने के लिए payload
      const donationPayload = {
        donorName: "Donor Name", // आप इसे यूजर इनपुट से भी कर सकते हैं
        donorEmail: "donor@example.com",
        donorPhone: "9876543210",
        amount,
        causeId: selectedCauseId,
        currency: "INR",
        message: "Happy to contribute!",
      };

      console.log("[DEBUG] Sending donation payload:", donationPayload);

      // Backend API को कॉल
      const res = await PublicApi.createDonationAndOrder(donationPayload);
      console.log("[DEBUG] createDonationAndOrder response:", res.data);

      // Backend से orderId, currency, Razorpay key लें
      const { orderId, currency, razorpayKeyId } = res.data;

      if (!orderId) throw new Error("No order ID received from server");

      // Razorpay Checkout options
      const options = {
        key: razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency: currency || "INR",
        name: "Alphaseam Foundation",
        description: "Donation Payment",
        order_id: orderId,
        handler: async (response) => {
          console.log("[DEBUG] Razorpay handler response:", response);

          // Verify payment के लिए snake_case keys भेजना ज़रूरी है
          const verifyPayload = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };

          console.log("[DEBUG] Payload sent to verify:", verifyPayload);

          if (
            !verifyPayload.razorpay_order_id ||
            !verifyPayload.razorpay_payment_id ||
            !verifyPayload.razorpay_signature
          ) {
            Swal.fire("Error", "Payment details missing. Verification failed.", "error");
            return;
          }

          try {
            Swal.fire({
              title: "Verifying payment...",
              allowOutsideClick: false,
              didOpen: () => Swal.showLoading(),
            });

            const verifyRes = await PublicApi.verifyPayment(verifyPayload);
            console.log("[DEBUG] Payment verify response:", verifyRes.data);

            Swal.fire(
              "🎉 Payment Successful!",
              `Payment ID: ${response.razorpay_payment_id}`,
              "success"
            );
            fetchTotalDonation();
          } catch (verifyErr) {
            console.error("[DEBUG] Payment verification failed:", verifyErr);
            Swal.fire(
              "❗ Payment verification failed",
              verifyErr?.response?.data?.message || "Please contact support.",
              "error"
            );
          }
        },
        prefill: {
          name: donationPayload.donorName,
          email: donationPayload.donorEmail,
          contact: donationPayload.donorPhone,
        },
        theme: { color: "#0f172a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      Swal.close();
    } catch (error) {
      console.error("[DEBUG] Error during payment initiation:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Unable to start payment. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
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
          style={{ marginLeft: "0.5rem" }}
        >
          {causes.map((cause) => (
            <option key={cause.id} value={cause.id}>
              {cause.title}
            </option>
          ))}
        </select>
      </div>

      <div className="donation-card-container">
        {donationTypes.map((type, idx) => (
          <div className="donation-card" key={idx}>
            <h3>{type.title}</h3>
            <p>{type.description}</p>
            <button
              onClick={() => startPayment(type.amount)}
              disabled={loading}
              className="donate-btn"
            >
              {loading ? "Processing..." : "Donate Now"}
            </button>
          </div>
        ))}
      </div>

      <h3>Total Donations: ₹{(totalAmount / 100).toLocaleString()}</h3>
    </section>
  );
};

export default DonationCard;
