import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageBlogs.css"; // or create ManageContacts.css for custom styling
import { AdminApi } from "../services/api";

const ManageContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState("");

  // const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  // const token = localStorage.getItem("token"); // ✅ get admin token

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      // const res = await axios.get(`${BASE_URL}/api/contacts`, {
      //   headers: {
      //     Authorization: `Bearer ${token}`, // ✅ attach token
      //   },
      // });
      const res = await AdminApi.getAllContacts();
      setContacts(res.data);
    } catch (err) {
      setError("Failed to fetch contacts");
      console.error("Error fetching contacts", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/contacts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ attach token
        },
      });

      fetchContacts();
    } catch (err) {
      setError("Failed to delete contact");
      console.error("Error deleting contact", err);
    }
  };

  return (
    <div className="manage-blogs">
      <h2>Manage Contacts</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {contacts.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        contacts.map((contact) => (
          <div className="blog-item" key={contact._id}>
            <div>
              <h3>{contact.name}</h3>
              <p><strong>Email:</strong> {contact.email}</p>
              {contact.subject && <p><strong>Subject:</strong> {contact.subject}</p>}
              <p><strong>Message:</strong> {contact.message}</p>
              <p><em>{new Date(contact.createdAt).toLocaleString()}</em></p>
            </div>
            <button onClick={() => handleDelete(contact._id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
};

export default ManageContacts;
