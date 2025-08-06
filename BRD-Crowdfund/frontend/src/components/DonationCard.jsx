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

  // --- NEW CODE START: Terms and Conditions Text ---
  // तुमचा Terms and Conditions मजकूर येथे टाकला आहे
  const termsAndConditionsText = `
    <div style="text-align: left; max-height: 40vh; overflow-y: auto; padding: 1em; border: 1px solid #eee; border-radius: 5px;">
        <h4>1. Acceptance of Terms</h4>
        <p>By accessing or using GreenDharti.com (“Platform”), you (“User”) agree to these Terms of Use. The Platform serves as a crowdfunding intermediary only for campaigns initiated by Users. GreenDharti provides technology services and does not act as a donor or final recipient of funds unless expressly stated.</p>
        <h4>2. User Eligibility and Registration</h4>
        <p>Users must be at least 18 years old, with full legal capacity. Campaigners and beneficiaries must complete KYC verification as required by RBI/AML guidelines (e.g. Aadhaar, PAN, passport). Users must submit accurate, current, and complete information at registration and maintain it throughout usage.</p>
        <h4>3. Campaign Rules and Approval</h4>
        <p>Campaigns may be accepted or declined based on internal criteria, including compliance with Platform guidelines. Campaigns for equity or debt offerings, payment of debts or loans, political fundraising, personal travel, welfare benefits, or prohibited purposes are not permitted. Campaign creators must disclose all material facts (e.g., beneficiary’s condition, campaign objective) and promptly update any changes, especially in case of beneficiary death or shift of purpose.</p>
        <h4>4. Fees, Payments and Refunds</h4>
        <p>Platform charges a service fee: [specify percentage (e.g. 5–10 %)] on donations received. Payment gateway fees and applicable GST taxes may apply. Donors may be offered the option to leave a voluntary tip; such tips are non-refundable and processed in accordance with donor’s consent. Refund requests may be honored within a specified window (e.g. up to 7 days post donation, excluding final campaign days). Cash-transaction donor refunds may require PAN if over ₹24,999.</p>
        <h4>5. Funds Collection and Disbursement</h4>
        <p>Contributions are held in a platform escrow or designated bank account during the campaign and disbursed after campaign closure and deduction of fees. If a campaign does not reach its goal, or funds are not withdrawn within a specified period (e.g. 45 days), the Platform may refund donors or transfer the funds to the beneficiary at its discretion. Inactive or unclaimed funds may be distributed per policy.</p>
        <h4>6. Foreign Contributions & FCRA Compliance</h4>
        <p>Foreign donations may only be transferred to users/entities holding valid FCRA registration and following FEMA/RBI norms. Campaigners must furnish all required documentation (e.g. FCRA certificate, Form FC‑1) to receive foreign contributions; Platform may withhold funds until satisfied.</p>
        <h4>7. User Obligations and Platform Disclaimer</h4>
        <p>Campaigners must use collected funds strictly for declared campaign purposes. GreenDharti is not responsible for how funds are used; it offers no financial returns, guarantees, or fiduciary obligations. Platform disclaims all liability for campaign failure, delays in disbursement, third-party actions, or other losses. Liability cap may be limited to the amount paid by the User in the last six months or ₹2,000 (whichever is greater).</p>
        <h4>8. Content, Copyright & Branding</h4>
        <p>Campaigners grant GreenDharti a license to use campaign content (e.g. texts, images) for promotion, following User’s consent. Campaigners must ensure they hold rights to all posted content; personal data of others (e.g. images) must be used with explicit permission.</p>
        <h4>9. Trust & Safety Measures</h4>
        <p>Platform employs fraud detection, campaign review, identity verification, and community reporting for suspicious campaigns. GreenDharti reserves the right to suspend or remove campaigns and withhold funds pending verification without liability.</p>
        <h4>10. Privacy, Consent & Marketing Communications</h4>
        <p>Users consent to receive communications (email, SMS, calls) for platform updates, campaign status, marketing and support. Data will not be shared with third parties except as required by law or as per the Privacy Policy (e.g. donor information shared with campaigner unless donor chooses anonymity).</p>
        <h4>11. Credit Information / Lending Services (Optional)</h4>
        <p>(If applicable) Users may consent to share their credit information under the Credit Information Companies (Regulation) Act, 2005. GreenDharti may collect, process and retain such data, share it with registered Credit Information Companies (CICs), and assist eligible Users in obtaining lending offers from partner financial institutions. Credit services are subject to User consent, CIC terms, and applicable regulations; Platform is not liable for CIC outputs.</p>
        <h4>12. Termination, Modifications & Suspension</h4>
        <p>Platform may modify, suspend, or terminate services or individual User access at any time, with or without notice. GreenDharti may alter these Terms; changes apply from the update date posted on the site. Continued use constitutes acceptance.</p>
        <h4>13. Governing Law and Dispute Resolution</h4>
        <p>These Terms are governed by Indian law. Jurisdiction lies in the courts of [specify city, e.g. Mumbai or Delhi], India.</p>
    </div>
  `;
  // --- NEW CODE END ---

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

  // --- CHANGED FUNCTION START ---
  // फक्त ही एकच function बदलली आहे
  const collectDonorDetails = async (amountInPaisa) => {
    if (!selectedCauseId) {
      Swal.fire("Error", "Please select a cause first.", "warning");
      return;
    }
    if (!isScriptLoaded || typeof window.Razorpay === "undefined") {
      Swal.fire("Error", "Payment script not loaded. Please try refreshing the page.", "error");
      loadRazorpayScript();
      return;
    }

    // --- NEW: Terms and Conditions Check ---
    const { value: accepted } = await Swal.fire({
        title: 'Terms & Conditions',
        html: termsAndConditionsText,
        input: 'checkbox',
        inputValue: 0,
        inputPlaceholder: 'I have read and agree to the terms and conditions',
        confirmButtonText: 'Agree & Continue →',
        showCancelButton: true,
        inputValidator: (result) => !result && 'You must agree to the terms and conditions to proceed.'
    });

    // जर user ने T&C मान्य केले तरच पुढचा pop-up दिसेल
    if (accepted) {
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
          startPayment(amountInPaisa, formValues.name, formValues.email, formValues.phone);
        } else {
          Swal.fire("Donation Cancelled", "You can try again anytime!", "info");
        }
    }
  };
  // --- CHANGED FUNCTION END ---

  // तुमचा मूळ, चालणारा startPayment function जसाच्या तसा आहे
  const startPayment = async (amountInPaisa, donorName, donorEmail, donorPhone) => {
    setLoading(true);

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
        message: "Happy to contribute!",
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
      Swal.close();

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

      <div className="donation-card-container">
        {donationTypes.map((type, idx) => (
          <div className="donation-card" key={idx}>
            <h3>{type.title}</h3>
            <p>{type.description}</p>
            <button
              onClick={() => collectDonorDetails(type.amount)}
              disabled={loading || !selectedCauseId || !isScriptLoaded}
              className="donate-btn"
            >
              {loading ? "Processing..." : `Donate ₹${(type.amount / 100).toLocaleString()}`}
            </button>
          </div>
        ))}
      </div>

      {/* <h3>Total Donations: ₹{(totalAmount / 100).toLocaleString()}</h3> */}
    </section>
  );
};

export default DonationCard;