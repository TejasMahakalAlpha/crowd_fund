// src/components/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

import logo from '../assets/header/crowdfund_logo.png';

import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const Footer = () => {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <footer className="main-footer-v2">
        <div className="footer-container-v2">
          {/* Column 1: Brand & Socials */}
          <div className="footer-col about-col">
            <img src={logo} alt="Green Dharti Logo" className="footer-logo-img" />
            <p className="footer-tagline">
              Empowering communities to fund, support, and scale meaningful environmental projects across India.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col links-col">
            <h3 className="footer-heading">Quick Links</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/causes">Our Causes</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/volunteer">Volunteer</Link></li>
              <li>
                <button
                  className="terms-btn"
                  onClick={() => setShowTerms(true)}
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="footer-col contact-col">
            <h3 className="footer-heading">Get in Touch</h3>
            <ul>
              <li>
                <FiMapPin className="contact-icon" />
                <span>Mary Villa, Badalepada, Giriz, Vasai West</span>
              </li>
              <li>
                <FiPhone className="contact-icon" />
                <a href="tel:9322342225">+91-9322342225</a>
              </li>
              <li>
                <FiMail className="contact-icon" />
                <a href="mailto:Lisbon.ferrao@gmail.com">Lisbon.ferrao@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Green Dharti. All Rights Reserved.</p>
        </div>
      </footer>

      {/* ✅ Terms & Conditions Popup Modal */}
      {showTerms && (
        <div className="terms-popup-overlay" onClick={() => setShowTerms(false)}>
          <div className="terms-popup" onClick={(e) => e.stopPropagation()}>
            <h2>Terms & Conditions</h2>
            <p>
              These are the terms and conditions for using Green Dharti.
              By accessing and contributing, you agree to our rules,
              responsibilities, and guidelines for transparency and impact.
            </p>
            <p>
              <div >
                <h4>1. Acceptance of Terms</h4>
                <p>By accessing or using GreenDharti.com (“Platform”), you (“User”) agree to these Terms of Use. The Platform serves as a crowdfunding intermediary only for campaigns initiated by Users. GreenDharti provides technology services and does not act as a donor or final recipient of funds unless expressly stated.</p>
                <h4>2. User Eligibility and Registration</h4>
                <p>Users must be at least 18 years old, with full legal capacity. Campaigners and beneficiaries must complete KYC verification as required by RBI/AML guidelines (e.g. Aadhaar, PAN, passport). Users must submit accurate, current, and complete information at registration and maintain it throughout usage.</p>
                <h4>3. Campaign Rules and Approval</h4>
                <p>Campaigns may be accepted or declined based on internal criteria, including compliance with Platform guidelines. Campaigns for equity or debt offerings, payment of debts or loans, political fundraising, personal travel, welfare benefits, or prohibited purposes are not permitted. Campaign creators must disclose all material facts (e.g., beneficiary’s condition, campaign objective) and promptly update any changes, especially in case of beneficiary death or shift of purpose.</p>
                <h4>4. Fees, Payments and Refunds</h4><p>Platform charges a service fee: [specify percentage (e.g. 5–10 %)] on donations received. Payment gateway fees and applicable GST taxes may apply. Donors may be offered the option to leave a voluntary tip; such tips are non-refundable and processed in accordance with donor’s consent. Refund requests may be honored within a specified window (e.g. up to 7 days post donation, excluding final campaign days). Cash-transaction donor refunds may require PAN if over ₹24,999.</p>
                <h4>5. Funds Collection and Disbursement</h4>
                <p>Contributions are held in a platform escrow or designated bank account during the campaign and disbursed after campaign closure and deduction of fees. If a campaign does not reach its goal, or funds are not withdrawn within a specified period (e.g. 45 days), the Platform may refund donors or transfer the funds to the beneficiary at its discretion. Inactive or unclaimed funds may be distributed per policy.</p>
                <h4>6. Foreign Contributions & FCRA Compliance</h4>
                <p>Foreign donations may only be transferred to users/entities holding valid FCRA registration and following FEMA/RBI norms. Campaigners must furnish all required documentation (e.g. FCRA certificate, Form FC‑1) to receive foreign contributions; Platform may withhold funds until satisfied.</p>
                <h4>7. User Obligations and Platform Disclaimer</h4>
                <p>Campaigners must use collected funds strictly for declared campaign purposes. GreenDharti is not responsible for how funds are used; it offers no financial returns, guarantees, or fiduciary obligations. Platform disclaims all liability for campaign failure, delays in disbursement, third-party actions, or other losses. Liability cap may be limited to the amount paid by the User in the last six months or ₹2,000 (whichever is greater).</p>
                <h4>8. Content, Copyright & Branding</h4><p>Campaigners grant GreenDharti a license to use campaign content (e.g. texts, images) for promotion, following User’s consent. Campaigners must ensure they hold rights to all posted content; personal data of others (e.g. images) must be used with explicit permission.</p>
                <h4>9. Trust & Safety Measures</h4>
                <p>Platform employs fraud detection, campaign review, identity verification, and community reporting for suspicious campaigns. GreenDharti reserves the right to suspend or remove campaigns and withhold funds pending verification without liability.</p><h4>10. Privacy, Consent & Marketing Communications</h4><p>Users consent to receive communications (email, SMS, calls) for platform updates, campaign status, marketing and support. Data will not be shared with third parties except as required by law or as per the Privacy Policy (e.g. donor information shared with campaigner unless donor chooses anonymity).</p><h4>11. Credit Information / Lending Services (Optional)</h4><p>(If applicable) Users may consent to share their credit information under the Credit Information Companies (Regulation) Act, 2005. GreenDharti may collect, process and retain such data, share it with registered Credit Information Companies (CICs), and assist eligible Users in obtaining lending offers from partner financial institutions. Credit services are subject to User consent, CIC terms, and applicable regulations; Platform is not liable for CIC outputs.</p><h4>12. Termination, Modifications & Suspension</h4><p>Platform may modify, suspend, or terminate services or individual User access at any time, with or without notice. GreenDharti may alter these Terms; changes apply from the update date posted on the site. Continued use constitutes acceptance.</p><h4>13. Governing Law and Dispute Resolution</h4><p>These Terms are governed by Indian law. Jurisdiction lies in the courts of [specify city, e.g. Mumbai or Delhi], India.</p>
              </div>
            </p>
            <button className="close-btn" onClick={() => setShowTerms(false)}>X</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
