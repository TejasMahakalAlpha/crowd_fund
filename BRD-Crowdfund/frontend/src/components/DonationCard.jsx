import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { PublicApi } from "../services/api";
import "./DonationCard.css";

const DonationCard = () => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const donationTypes = [
    // ...your donation options
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
    fetchTotalDonation();
    loadRazorpayScript();
  }, []);

  const fetchTotalDonation = async () => {
    try {
      const res = await PublicApi.getAllDonations();
      const total = res.data.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
      setTotalAmount(total);
    } catch (err) {
      console.error("Error fetching donation data", err);
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
    script.onerror = () => Swal.fire("Error", "Failed to load Razorpay SDK", "error");
    document.body.appendChild(script);
  };

  const startPayment = async (amount) => {
    if (!isScriptLoaded) {
      Swal.fire("Please wait", "Loading payment gateway...", "info");
      return;
    }
    setLoading(true);

    try {
      Swal.fire({ title: "Processing...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      // STEP 1: Create donation and payment order at backend
      // Customize this payload as needed!
      const donationPayload = {
        donorName: "Donor",          // Later, allow user input
        donorEmail: "donor@example.com",
        donorPhone: "9876543210",
        amount,
        causeId: 1,
        currency: "INR",
        message: "",
      };

      // Make a POST to /donate-and-pay, which should return Razorpay order info
      const res = await PublicApi.createDonationAndOrder(donationPayload); // SEE NOTE BELOW

      const { orderId, razorpayKeyId, currency, donorId } = res.data;

      // STEP 2: Open Razorpay Checkout with order details
      const options = {
        key: razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: orderId,
        amount: amount,
        currency: currency || "INR",
        name: "Alphaseam Foundation",
        description: "Donation Payment",
        image: "/logo.png",
        handler: async function (response) {
          // STEP 3: Verify payment on backend
          try {
            Swal.fire({ title: "Verifying payment...", didOpen: () => Swal.showLoading() });
            // Send payment response to backend
            await PublicApi.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              donorId, // pass if your backend needs to link payment to donation row
            });
            Swal.fire("🎉 Donation Successful!", `Payment ID: <b>${response.razorpay_payment_id}</b>`, "success");
            fetchTotalDonation();
          } catch (verifyError) {
            Swal.fire("Warning", "Payment completed, but verification failed. Please contact support.", "warning");
          }
        },
        prefill: {
          name: donationPayload.donorName,
          email: donationPayload.donorEmail,
          contact: donationPayload.donorPhone,
        },
        notes: {
          purpose: "Donation",
        },
        theme: {
          color: "#0f172a",
        },
        modal: {
          ondismiss: function () {
            // Optionally handle payment dismiss
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      Swal.close();
    } catch (error) {
      console.error("Error during payment initiation:", error);
      const msg = (error?.response && error.response.data?.error) ? error.response.data.error : "Unable to start payment";
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="donation-section" id="donation">
      <h2 className="donation-title">Ways You Can Support</h2>
      <div className="donation-card-container">
        {donationTypes.map((type, index) => (
          <div className="donation-card" key={index}>
            <h3>{type.title}</h3>
            <p>{type.description}</p>
            <button
              className="donate-btn"
              onClick={() => startPayment(type.amount)}
              disabled={loading}
            >
              {loading ? "Processing..." : "Donate Now"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DonationCard;
