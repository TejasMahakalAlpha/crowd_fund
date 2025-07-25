import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const DonationCard = () => {
  const [amount, setAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    fetchTotalDonation();
  }, []);

  // Fetch total donation
  const fetchTotalDonation = async () => {
    try {
      const res = await axios.get("https://cloud-fund-i1kt.onrender.com/donations");
      const total = res.data.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
      setTotalAmount(total);
    } catch (err) {
      console.error("Error fetching donation data", err);
    }
  };

  // Start payment
  const startPayment = async (amount) => {
    if (!isScriptLoaded) {
      Swal.fire("Please wait", "Loading payment gateway...", "info");
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to make a donation.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Processing...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const { data: orderData } = await axios.post(
        "https://cloud-fund-i1kt.onrender.com/payment/create-order",
        { amount, currency: "INR" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_a3kb1GXuvUpqcu", // test key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Alphaseam Foundation",
        description: "Donation Payment",
        image: "/logo.png",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            await axios.post("https://cloud-fund-i1kt.onrender.com/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            await axios.post(
              "https://cloud-fund-i1kt.onrender.com/donate-and-pay",
              {
                amount,
                paymentId: response.razorpay_payment_id,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            Swal.fire({
              title: "🎉 Donation Successful!",
              html: `Payment ID: <b>${response.razorpay_payment_id}</b>`,
              icon: "success",
              confirmButtonColor: "#0f172a",
            });

            fetchTotalDonation();
          } catch (err) {
            Swal.fire("Error", "Payment verification failed", "error");
            console.error(err);
          }
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
    <div className="donation-card">
      <h2>Total Raised: ₹{totalAmount}</h2>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={() => startPayment(amount)}>Donate</button>
    </div>
  );
};

export default DonationCard;
