import React, { useEffect, useState } from "react";
import { AdminApi, PublicApi } from "../services/api";
import Swal from "sweetalert2";
import { Navigate, useNavigate } from "react-router-dom";

const ManageVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    skills: "",
    availability: "",
    experience: "",
    motivation: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [alreadyExists, setAlreadyExists] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const res = await AdminApi.getAllVolunteer();
      setVolunteers(res.data);
    } catch (err) {
      console.error("Error fetching volunteers", err);
      setError("Failed to fetch volunteers");
    }
  };

  // Simple validators
  const isTextOnly = (str) => /^[A-Za-z\s]+$/.test(str);
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) =>
    phone === "" || /^\d{10}$/.test(phone); // optional phone, else 10 digits

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First Name is required";
    else if (!isTextOnly(formData.firstName))
      newErrors.firstName = "Only letters and spaces allowed";

    if (!formData.lastName.trim())
      newErrors.lastName = "Last Name is required";
    else if (!isTextOnly(formData.lastName))
      newErrors.lastName = "Only letters and spaces allowed";

    if (!formData.email.trim())
      newErrors.email = "Email is required";
    else if (!isValidEmail(formData.email))
      newErrors.email = "Invalid email format";

    if (!isValidPhone(formData.phone))
      newErrors.phone = "Phone must be 10 digits or empty";

    if (formData.skills && !isTextOnly(formData.skills))
      newErrors.skills = "Only letters and spaces allowed";

    if (formData.motivation.trim().length < 10)
      newErrors.motivation = "Motivation must be at least 10 characters";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const checkIfVolunteerExists = (email) => {
    return volunteers.some(
      (v) => v.email.toLowerCase() === email.toLowerCase()
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setAlreadyExists(false);
    setSuccess("");
    setError("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setAlreadyExists(false);

    if (!validate()) return;

    if (checkIfVolunteerExists(formData.email)) {
      setAlreadyExists(true);
      return;
    }

    try {
      await PublicApi.registerVolunteer(formData);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        skills: "",
        availability: "",
        experience: "",
        motivation: "",
      });
      setSuccess("Volunteer added successfully");
      fetchVolunteers();
      Swal.fire("Success", "Volunteer added successfully", "success");
    } catch (err) {
      console.error("Error creating volunteer", err);
      setError("Error adding volunteer");
      Swal.fire("Error", "Failed to add volunteer", "error");
    }
  };

  // inside handleDelete:
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This volunteer will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await AdminApi.deleteVolunteer(id); // Make sure this is implemented
        fetchVolunteers();
        Swal.fire("Deleted!", "The volunteer has been deleted.", "success");
      } catch (err) {
        console.error("Error deleting volunteer", err);
        setError("Error deleting volunteer");
        Swal.fire("Error", "Failed to delete volunteer", "error");
      }
    }
  };

  return (
    <div className="manage-blogs">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>

      <h2>Manage Volunteers</h2>

      <form className="blog-form" onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        {errors.firstName && <p style={{ color: "red" }}>{errors.firstName}</p>}

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        {errors.lastName && <p style={{ color: "red" }}>{errors.lastName}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          maxLength={10}
          value={formData.phone}
          onChange={handleChange}
        />
        {errors.phone && <p style={{ color: "red" }}>{errors.phone}</p>}

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
        />

        <input
          type="text"
          name="skills"
          placeholder="Skills"
          value={formData.skills}
          onChange={handleChange}
        />
        {errors.skills && <p style={{ color: "red" }}>{errors.skills}</p>}

        <input
          type="text"
          name="availability"
          placeholder="Availability"
          value={formData.availability}
          onChange={handleChange}
        />

        <textarea
          name="experience"
          placeholder="Experience"
          value={formData.experience}
          onChange={handleChange}
          rows={3}
        />

        <textarea
          name="motivation"
          placeholder="Why do you want to volunteer?"
          value={formData.motivation}
          onChange={handleChange}
        />
        {errors.motivation && <p style={{ color: "red" }}>{errors.motivation}</p>}

        <button type="submit">Add Volunteer</button>

        {alreadyExists && (
          <p style={{ color: "orange", marginTop: "10px" }}>
            Volunteer with this email already exists.
          </p>
        )}
        {success && <p style={{ color: "green", marginTop: "10px" }}>{success}</p>}
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </form>

      {volunteers.length === 0 ? (
        <p>No volunteers yet.</p>
      ) : (
        volunteers.map((v) => (
          <div className="blog-item" key={v.id || v._id}>
            <div>
              <h3>
                {v.firstName} {v.lastName}
              </h3>
              <p>
                <strong>Email:</strong> {v.email}
              </p>
              <p>
                <strong>Phone:</strong> {v.phone}
              </p>
              <p>
                <strong>Address:</strong> {v.address}
              </p>
              <p>
                <strong>Skills:</strong> {v.skills}
              </p>
              <p>
                <strong>Availability:</strong> {v.availability}
              </p>
              <p>
                <strong>Experience:</strong> {v.experience}
              </p>
              <p>
                <strong>Motivation:</strong> {v.motivation}
              </p>
            </div>
            {/* <button onClick={() => handleDelete(v.id || v._id)}>Delete</button> */}
          </div>
        ))
      )}
    </div>
  );
};

export default ManageVolunteers;
