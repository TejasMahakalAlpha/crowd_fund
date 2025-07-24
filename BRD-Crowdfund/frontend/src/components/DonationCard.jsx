import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { PublicApi } from "../services/api";
import "./DonationCard.css";

const DonationCard = () => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

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

    try {
      Swal.fire({ title: "Processing...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const res = await PublicApi.makeDonation({ amount });
      const { orderId, currency } = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_a3kb1GXuvUpqcu", // ✅ Set in .env
        amount: amount,
        currency: currency || "INR",
        name: "Alphaseam Foundation",
        description: "Donation Payment",
        image: "/logo.png",
        order_id: orderId,
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
      Swal.close();
    } catch (error) {
      console.error("Error initiating payment:", error);
      Swal.fire("Error", "Unable to start payment", "error");
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
            <button className="donate-btn" onClick={() => startPayment(type.amount)}>
              Donate Now
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DonationCard;
