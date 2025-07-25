// DonationCard.jsx
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
      description: "Make a one-time donation and help us take a step forward in our mission to support critical causes.",
      amount: 50000,
    },
    {
      title: "LIVING LEGACY",
      description: "Leave a legacy of hope and kindness that lasts for generations by contributing in memory or will.",
      amount: 100000,
    },
  ];

  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const res = await PublicApi.getCauses();
        setCauses(res.data);
        if (res.data.length > 0) setSelectedCauseId(res.data[0].id);
      } catch (error) {
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
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () =>
      Swal.fire("Error", "Failed to load payment gateway. Please try again later.", "error");
    document.body.appendChild(script);
  };

  const startPayment = async (amount) => {
    if (!selectedCauseId) {
      Swal.fire("Error", "Please select a cause first.", "warning");
      return;
    }

    setLoading(true);

    try {
      Swal.fire({
        title: "Processing...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const selectedCause = causes.find((c) => c.id === selectedCauseId);

      const donorDetails = {
        donorName: "John Doe",
        donorEmail: "mahakaltejas686@gmail.com",
        donorPhone: "7218072175",
        message: "Happy to contribute!",
        amount,
        currency: "INR",
        causeId: selectedCauseId,
      };

      const res = await PublicApi.createDonationAndOrder(donorDetails);
      const { orderId, currency, razorpayKeyId } = res.data;

      const options = {
        key: razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "Alphaseam Foundation",
        description: "Donation Payment",
        order_id: orderId,
        handler: async (response) => {
          const verifyPayload = {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            donorName: donorDetails.donorName,
            donorEmail: donorDetails.donorEmail,
            donorPhone: donorDetails.donorPhone,
            amount: donorDetails.amount,
            currency: donorDetails.currency,
            causeName: selectedCause?.title || "",
            causeId: selectedCauseId,
            message: donorDetails.message,
          };

          try {
            const verifyRes = await PublicApi.verifyPayment(verifyPayload);
            Swal.fire("🎉 Payment Successful!", `Payment ID: ${response.razorpay_payment_id}`, "success");
            fetchTotalDonation();
          } catch (err) {
            console.error("[DEBUG] Verification failed:", err);
            Swal.fire("❗ Payment verification failed", "Please contact support.", "error");
          }
        },
        prefill: {
          name: donorDetails.donorName,
          email: donorDetails.donorEmail,
          contact: donorDetails.donorPhone,
        },
        theme: { color: "#0f172a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      Swal.close();
    } catch (error) {
      console.error("[DEBUG] Payment error:", error);
      Swal.fire("Error", "Something went wrong. Try again later.", "error");
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
