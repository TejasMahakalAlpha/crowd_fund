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
  
  // --- Purna Terms and Conditions Text ---
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

  const getImageUrl = (relativePath) => {
    if (!relativePath) return "";
    return `${API_BASE}/api/images/${relativePath}`;
  };

  const handleShowSingleCause = (cause) => {
    setCauseToView(cause);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const collectDonorDetails = async (amountInPaisa, causeId) => {
    if (!isScriptLoaded || typeof window.Razorpay === "undefined") {
      Swal.fire("Error", "Payment script not loaded. Please try refreshing the page.", "error");
      loadRazorpayScript();
      return;
    }

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

    if (accepted) {
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

          if (!name || !email || !phone) { Swal.showValidationMessage(`Please fill in all details`); return false; }
          if (!/\S+@\S+\.\S+/.test(email)) { Swal.showValidationMessage(`Please enter a valid email address`); return false; }
          if (!/^\d{10}$/.test(phone)) { Swal.showValidationMessage(`Please enter a valid 10-digit phone number`); return false; }
          return { name, email, phone };
        }
      });

      if (formValues) {
        startPayment(amountInPaisa, formValues.name, formValues.email, formValues.phone, causeId);
      } else {
        Swal.fire("Donation Cancelled", "You can try again anytime!", "info");
      }
    }
  };

  const startPayment = async (amountInPaisa, donorName, donorEmail, donorPhone, causeId) => {
    setIsPaymentProcessing(true);
    Swal.fire({
      title: "Initiating Payment...",
      html: "Please wait while we set up your transaction.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const selectedCauseForPayment = causes.find((c) => (c.id || c._id) === causeId);
      if (!selectedCauseForPayment) {
        Swal.fire("Error", "Selected cause not found for payment. Please re-select.", "error");
        setIsPaymentProcessing(false);
        Swal.close();
        return;
      }
      const donorDetailsPayload = {
        donorName, donorEmail, donorPhone,
        message: `Donation for ${selectedCauseForPayment.title}`,
        amount: amountInPaisa, currency: "INR", causeId,
      };
      
      const res = await PaymentApi.createDonationAndOrder(donorDetailsPayload);
      const responseData = res.data;
      const orderId = responseData.orderId;
      const amountFromBackend = responseData.amount;
      const currencyFromBackend = responseData.currency;
      const razorpayKey = responseData.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!orderId || !amountFromBackend || !currencyFromBackend || !razorpayKey) {
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
          const verifyPayload = {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            donorName, donorEmail, donorPhone,
            amount: amountInPaisa, currency: "INR",
            causeName: selectedCauseForPayment?.title || "General Donation",
            causeId, message: donorDetailsPayload.message,
          };
          try {
            const verifyRes = await PaymentApi.verifyPayment(verifyPayload);
            if (verifyRes.data === true) {
              Swal.fire("🎉 Payment Successful!", `Payment ID: ${response.razorpay_payment_id}`, "success");
              fetchCauses();
            } else {
              Swal.fire("❗ Payment Verification Failed", "Please contact support.", "error");
            }
          } catch (err) {
            Swal.fire("❗ Payment Verification Error", "Please contact support with Payment ID: " + response.razorpay_payment_id, "error");
          }
        },
        prefill: { name: donorName, email: donorEmail, contact: donorPhone },
        theme: { color: "#0f172a" },
        modal: { ondismiss: () => Swal.fire("Payment Cancelled", "You have closed the payment window.", "info") }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      Swal.close();
    } catch (error) {
      Swal.close();
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Payment setup failed.";
      Swal.fire("Error", `Payment failed: ${errorMessage}`, "error");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleDonate = async (cause) => {
    const causeId = cause.id || cause._id;

    const { value: amount } = await Swal.fire({
      title: `Donate to ${cause.title}`, input: "number", inputLabel: "Amount (INR)",
      inputPlaceholder: "e.g., 500", showCancelButton: true, confirmButtonText: "Next",
      inputValidator: (value) => { if (!value || value <= 0) return "Please enter a valid amount"; }
    });
    if (amount) {
      collectDonorDetails(Number(amount) * 100, causeId);
    }
  };

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
            /\.(mp4|webm|mov)$/i.test(causeToView.imageUrl) ? (
              <video src={getImageUrl(causeToView.imageUrl)} className="modal-image" controls autoPlay />
            ) : (
              <img src={getImageUrl(causeToView.imageUrl)} alt={causeToView.title} className="modal-image" />
            )
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
                      /\.(mp4|webm|mov)$/i.test(cause.imageUrl) ? (
                          <video src={getImageUrl(cause.imageUrl)} className="cause-image" autoPlay loop muted playsInline />
                      ) : (
                          <img src={getImageUrl(cause.imageUrl)} alt={cause.title} className="cause-image" />
                      )
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