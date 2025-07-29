// src/admin/ManagePersonalCauses.jsx
import React, { useEffect, useState, useContext } from "react";
import { AdminApi } from "../services/api"; // Ensure AdminApi is correctly imported
import Swal from "sweetalert2";
 import "./ManagePersonalCauses.css"; 
// CSS for this component
import { AuthContext } from "../../src/context/AuthContext"; // Import AuthContext for admin name

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Helper function to get the correct file URL based on category (copied from SubmitCause)
const getFileUrl = (relativePath) => {
  if (!relativePath) return null;
  const parts = relativePath.split('/');
  if (parts.length < 2) return null;

  const category = parts[0]; 
  const filename = parts.slice(1).join('/'); 

  return `${API_BASE}/api/documents/${category}/${filename}`;
};


const ManagePersonalCauses = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filterStatus, setFilterStatus] = useState("PENDING"); // Default filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null); // For modal view
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [modifiedCauseDetails, setModifiedCauseDetails] = useState({ // For approval modifications
    modifiedTitle: "",
    modifiedDescription: "",
    modifiedShortDescription: "",
    modifiedCategory: "",
    modifiedLocation: "",
  });

  const { user } = useContext(AuthContext); // Assuming AuthContext provides user info with a name
  const adminName = user?.name || "Admin"; // Fallback to "Admin" if user name is not available

  useEffect(() => {
    fetchSubmissions();
  }, [filterStatus]); // Re-fetch when filter status changes

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (filterStatus === "ALL") {
        res = await AdminApi.getPersonalCauseSubmissions(); // Assuming this API exists
      } else {
        res = await AdminApi.getPersonalCauseSubmissionsByStatus(filterStatus); // Assuming this API exists
      }
      setSubmissions(res.data || []);
    } catch (err) {
      console.error("Error fetching personal cause submissions:", err);
      setError("Failed to fetch submissions. Please try again.");
      Swal.fire("Error", "Failed to fetch submissions", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setAdminNotes(submission.adminNotes || ""); // Pre-fill notes if any
    setModifiedCauseDetails({
      modifiedTitle: submission.title || "",
      modifiedDescription: submission.description || "",
      modifiedShortDescription: submission.shortDescription || "",
      modifiedCategory: submission.category || "",
      modifiedLocation: submission.location || "",
    });
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedSubmission(null);
    setAdminNotes("");
    setModifiedCauseDetails({
      modifiedTitle: "",
      modifiedDescription: "",
      modifiedShortDescription: "",
      modifiedCategory: "",
      modifiedLocation: "",
    });
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;

    const result = await Swal.fire({
      title: "Approve Submission?",
      text: "This will approve the cause and optionally create a new live cause.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Approve it!",
      input: 'textarea',
      inputLabel: 'Admin Notes (Optional)',
      inputValue: adminNotes,
      inputPlaceholder: 'Enter notes for approval...',
      showLoaderOnConfirm: true,
      preConfirm: (notes) => {
        setAdminNotes(notes);
        return { notes };
      }
    });

    if (result.isConfirmed) {
      try {
        const payload = {
          adminNotes: result.value.notes,
          approvedBy: adminName,
          ...modifiedCauseDetails 
        };
        await AdminApi.approvePersonalCauseSubmission(selectedSubmission.id, payload); 
        Swal.fire("Approved!", "Cause approved successfully.", "success");
        fetchSubmissions(); 
        handleCloseDetailsModal();
      } catch (err) {
        console.error("Error approving submission:", err);
        Swal.fire("Error", "Failed to approve submission.", "error");
      }
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;

    const result = await Swal.fire({
      title: "Reject Submission?",
      text: "This will reject the cause and mark it as 'REJECTED'.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Reject it!",
      input: 'textarea',
      inputLabel: 'Admin Notes (Required)',
      inputValue: adminNotes,
      inputPlaceholder: 'Enter reason for rejection...',
      inputValidator: (value) => {
        if (!value.trim()) {
          return 'Reason for rejection is required!';
        }
      },
      showLoaderOnConfirm: true,
      preConfirm: (notes) => {
        setAdminNotes(notes);
        return { notes };
      }
    });

    if (result.isConfirmed) {
      try {
        const payload = {
          adminNotes: result.value.notes,
          approvedBy: adminName, 
        };
        await AdminApi.rejectPersonalCauseSubmission(selectedSubmission.id, payload); 
        Swal.fire("Rejected!", "Cause rejected successfully.", "success");
        fetchSubmissions(); 
        handleCloseDetailsModal();
      } catch (err) {
        console.error("Error rejecting submission:", err);
        Swal.fire("Error", "Failed to reject submission.", "error");
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await AdminApi.deletePersonalCauseSubmission(id); 
        Swal.fire("Deleted!", "The submission has been deleted.", "success");
        fetchSubmissions();
      } catch (err) {
        console.error("Error deleting submission:", err);
        Swal.fire("Error", "Failed to delete submission.", "error");
      }
    }
  };

  if (loading) return <div className="loading-message">Loading personal cause submissions...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="manage-personal-causes-container">
      <h2>Manage Personal Cause Submissions</h2>

      <div className="filter-controls">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select
          id="status-filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="PENDING">Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="ALL">All</option>
        </select>
      </div>

      <div className="submissions-list">
        {submissions.length === 0 ? (
          <p className="no-submissions-message">No {filterStatus.toLowerCase()} submissions found.</p>
        ) : (
          submissions.map((submission) => (
            <div className="submission-card" key={submission.id}>
              <div className="card-header">
                <h3>{submission.title}</h3>
                <span className={`status-badge ${submission.status.toLowerCase()}`}>
                  {submission.status.replace('_', ' ')}
                </span>
              </div>
              <p><strong>Submitted by:</strong> {submission.submitterName} ({submission.submitterEmail})</p>
              <p><strong>Target Amount:</strong> ₹{submission.targetAmount?.toLocaleString()}</p>
              <p><strong>Location:</strong> {submission.location || 'N/A'}</p>
              <p><strong>Submitted On:</strong> {new Date(submission.createdAt).toLocaleDateString()}</p>

              <div className="card-actions">
                <button className="view-details-btn" onClick={() => handleViewDetails(submission)}>
                  View Details
                </button>
                {submission.status === 'PENDING' || submission.status === 'UNDER_REVIEW' ? (
                  <>
                    <button className="approve-btn" onClick={() => handleViewDetails(submission)}>
                      Approve
                    </button>
                    <button className="reject-btn" onClick={() => handleViewDetails(submission)}>
                      Reject
                    </button>
                  </>
                ) : null}
                <button className="delete-btn" onClick={() => handleDelete(submission.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showDetailsModal && selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={handleCloseDetailsModal}>
              &times;
            </button>
            <h3>Submission Details: {selectedSubmission.title}</h3>
            <div className="details-section">
                <p><strong>Status:</strong> <span className={`status-badge ${selectedSubmission.status.toLowerCase()}`}>{selectedSubmission.status.replace('_', ' ')}</span></p>
                <p><strong>Submitted By:</strong> {selectedSubmission.submitterName} ({selectedSubmission.submitterEmail})</p>
                <p><strong>Phone:</strong> {selectedSubmission.submitterPhone || 'N/A'}</p>
                <p><strong>Submitted On:</strong> {new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                <p><strong>Short Description:</strong> {selectedSubmission.shortDescription || 'N/A'}</p>
                <p><strong>Description:</strong> {selectedSubmission.description}</p>
                <p><strong>Target Amount:</strong> ₹{selectedSubmission.targetAmount?.toLocaleString()}</p>
                <p><strong>Category:</strong> {selectedSubmission.category || 'N/A'}</p>
                <p><strong>Location:</strong> {selectedSubmission.location || 'N/A'}</p>
                <p><strong>End Date:</strong> {selectedSubmission.endDate ? new Date(selectedSubmission.endDate).toLocaleString() : 'N/A'}</p>
                <p><strong>Submitter Message:</strong> {selectedSubmission.submitterMessage || 'N/A'}</p>
                <p><strong>Admin Notes:</strong> {selectedSubmission.adminNotes || 'None'}</p>
                {selectedSubmission.status === 'APPROVED' && selectedSubmission.approvedBy && (
                    <p><strong>Approved By:</strong> {selectedSubmission.approvedBy} on {new Date(selectedSubmission.approvedAt).toLocaleString()}</p>
                )}
                {selectedSubmission.status === 'REJECTED' && selectedSubmission.rejectedAt && (
                    <p><strong>Rejected On:</strong> {new Date(selectedSubmission.rejectedAt).toLocaleString()}</p>
                )}
            </div>

            <div className="files-section">
                <h4>Attached Files:</h4>
                {selectedSubmission.imageUrl ? (
                    <div className="file-item">
                        <strong>Cause Image:</strong>
                        <img src={getFileUrl(selectedSubmission.imageUrl)} alt="Cause Image" className="detail-image-preview" />
                        <a href={getFileUrl(selectedSubmission.imageUrl)} target="_blank" rel="noopener noreferrer" className="download-link">View Image</a>
                        <a href={`${getFileUrl(selectedSubmission.imageUrl)}/download`} className="download-link">Download Image</a>
                    </div>
                ) : <p>No Cause Image provided.</p>}

                {selectedSubmission.proofDocumentUrl ? (
                    <div className="file-item">
                        <strong>Proof Document:</strong>
                        <p>{selectedSubmission.proofDocumentName || selectedSubmission.proofDocumentUrl.split('/').pop()}</p>
                        {selectedSubmission.proofDocumentType?.toLowerCase() === 'pdf' ? (
                            <iframe src={getFileUrl(selectedSubmission.proofDocumentUrl)} width="100%" height="300px" title="Proof Document"></iframe>
                        ) : (
                            <img src={getFileUrl(selectedSubmission.proofDocumentUrl)} alt="Proof Document" className="detail-image-preview" />
                        )}
                        <a href={getFileUrl(selectedSubmission.proofDocumentUrl)} target="_blank" rel="noopener noreferrer" className="download-link">View Document</a>
                        <a href={`${getFileUrl(selectedSubmission.proofDocumentUrl)}/download`} className="download-link">Download Document</a>
                    </div>
                ) : <p>No Proof Document provided.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePersonalCauses;
