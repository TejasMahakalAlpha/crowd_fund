// src/components/DonationCard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DonationCard.css";
import { PublicApi } from "../services/api";
import Swal from "sweetalert2";

const DonationCard = () => {
  const [totalAmount, setTotalAmount] = useState(0);
  // const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const donationTypes = [
    {
      title: "ONE-TIME GIFT",
      description:
        "Make a one-time donation and help us take a step forward in our mission to support critical causes.",
      amount: 50000, // ₹500
    },
    {
      title: "LIVING LEGACY",
      description:
        "Leave a legacy of hope and kindness that lasts for generations by contributing in memory or will.",
      amount: 100000, // ₹1000
    },
  ];

  useEffect(() => {
    fetchTotalDonation();
  }, []);

  const fetchTotalDonation = async () => {
    try {
      // const res = await axios.get(`${BASE_URL}/api/donations`);
      const res = await PublicApi.getDonation();
      console.log(res)
      const total = res.data.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
      setTotalAmount(total);
    } catch (err) {
      console.error("Error fetching donation data", err);
    }
  };

  const loadRazorpay = (amount) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => {
      console.log("Razorpay script loaded");
      if (!window.Razorpay) {
        Swal.fire("Error", "Razorpay SDK not available", "error");
        return;
      }

      const options = {
        key: "rzp_test_xxxxxx", // ✅ use your real test/live key
        amount: amount, // already in paise (₹500 = 50000)
        currency: "INR",
        name: "Alphaseam Foundation",
        description: "Donation Payment",
        image: "/logo.png",
        handler: function (response) {
          Swal.fire({
            title: "🎉 Donation Successful!",
            html: `Payment ID: <b>${response.razorpay_payment_id}</b>`,
            icon: "success",
            confirmButtonColor: "#0f172a",
          });
          fetchTotalDonation();
        },
        prefill: {
          name: "Donor",
          email: "donor@example.com",
          contact: "9876543210",
        },
        notes: {
          purpose: "Donation",
        },
        theme: {
          color: "#0f172a",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    };

    script.onerror = () => {
      Swal.fire("Error", "Failed to load Razorpay SDK. Check internet connection.", "error");
    };

    document.body.appendChild(script);
  };
  return (
    <section className="donation-section" id="donation">
      <h2 className="donation-title">Ways You Can Support</h2>
      {/* <p className="donation-total">Total Donations Raised: ₹{totalAmount.toLocaleString()}</p> */}

      <div className="donation-card-container">
        {donationTypes.map((type, index) => (
          <div className="donation-card" key={index}>
            <h3>{type.title}</h3>
            <p>{type.description}</p>
            <button
              className="donate-btn"
              onClick={() => loadRazorpay(type.amount)}
            >
              Donate Now
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DonationCard;
