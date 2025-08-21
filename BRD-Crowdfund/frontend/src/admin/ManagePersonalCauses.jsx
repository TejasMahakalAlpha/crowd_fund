// src/admin/ManagePersonalCauses.jsx
import React, { useEffect, useState, useContext } from "react";
import { AdminApi } from "../services/api";
import Swal from "sweetalert2";
import "./ManagePersonalCauses.css";
import { AuthContext } from "../../src/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Helper function to get the correct file URL
const getFileUrl = (relativePath) => {
  if (!relativePath) return null;
  const parts = relativePath.split('/');
  if (parts.length < 2) return null;
  const category = parts[0];
  const filename = parts.slice(1).join('/');
  return `${API_BASE}/api/documents/${category}/${filename}`;
};

const ManagePersonalCauses = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [modifiedCauseDetails, setModifiedCauseDetails] = useState({
    modifiedTitle: "",
    modifiedDescription: "",
    modifiedShortDescription: "",
    modifiedCategory: "",
    modifiedLocation: "",
  });

  const { user } = useContext(AuthContext);
  const adminName = user?.name || "Admin";

  useEffect(() => {
    fetchSubmissions();
  }, [filterStatus]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (filterStatus === "ALL") {
        res = await AdminApi.getPersonalCauseSubmissions();
      } else {
        res = await AdminApi.getPersonalCauseSubmissionsByStatus(filterStatus);
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
    console.log("Submission data received:", submission);
    setSelectedSubmission(submission);
    setAdminNotes(submission.adminNotes || "");
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
      text: "This will approve the cause.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Approve it!",
      input: 'textarea',
      inputLabel: 'Admin Notes (Optional)',
      inputValue: adminNotes,
      showLoaderOnConfirm: true,
      preConfirm: (notes) => ({ notes }),
    });

    if (result.isConfirmed) {
      try {
        const payload = {
          adminNotes: result.value.notes,
          approvedBy: adminName,
          ...modifiedCauseDetails,
        };
        await AdminApi.approvePersonalCauseSubmission(selectedSubmission.id, payload);
        Swal.fire("Approved!", "Cause approved successfully.", "success");
        fetchSubmissions();
        handleCloseDetailsModal();
      } catch (err) {
        Swal.fire("Error", "Failed to approve submission.", "error");
      }
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;
    const result = await Swal.fire({
      title: "Reject Submission?",
      text: "This will mark the cause as 'REJECTED'.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, Reject it!",
      input: 'textarea',
      inputLabel: 'Admin Notes (Required)',
      inputValidator: (value) => !value && 'Reason for rejection is required!',
    });

    if (result.isConfirmed) {
      try {
        const payload = { adminNotes: result.value, approvedBy: adminName };
        await AdminApi.rejectPersonalCauseSubmission(selectedSubmission.id, payload);
        Swal.fire("Rejected!", "Cause rejected successfully.", "success");
        fetchSubmissions();
        handleCloseDetailsModal();
      } catch (err) {
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
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await AdminApi.deletePersonalCauseSubmission(id);
        Swal.fire("Deleted!", "The submission has been deleted.", "success");
        fetchSubmissions();
      } catch (err) {
        Swal.fire("Error", "Failed to delete submission.", "error");
      }
    }
  };

  const handleModificationChange = (e) => {
    const { name, value } = e.target;
    setModifiedCauseDetails((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleGoBack = () => navigate(-1);

  if (loading) return <div className="loading-message">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="manage-personal-causes-container">
      <button onClick={handleGoBack} className="back-button">
        <IoArrowBack size={20} />
        <span>Back</span>
      </button>
      <div className="page-header">
        <h2>Manage Personal Cause Submissions</h2>
      </div>

      <div className="filter-controls">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select id="status-filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
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
              <p><strong>Submitted On:</strong> {new Date(submission.createdAt).toLocaleDateString()}</p>
              <div className="card-actions">
                <button className="view-details-btn" onClick={() => handleViewDetails(submission)}>
                  View Details & Manage
                </button>
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
            <button className="modal-close-btn" onClick={handleCloseDetailsModal}>&times;</button>
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

              {/* Single Image or Video */}
              <div className="file-item">
                <strong>Cause Image/Video:</strong>
                {selectedSubmission.videoUrl ? (
                  <div className="media-preview-item" style={{ marginBottom: "1rem" }}>
                    <video
                      src={getFileUrl(selectedSubmission.videoUrl)}
                      controls
                      className="detail-video-preview"
                    />
                    <a href={getFileUrl(selectedSubmission.videoUrl)} target="_blank" rel="noopener noreferrer" className="download-link">
                      View Video
                    </a>
                    <a href={`${getFileUrl(selectedSubmission.videoUrl)}/download`} className="download-link">
                      Download Video
                    </a>
                  </div>
                ) : selectedSubmission.imageUrl ? (
                  <div className="media-preview-item" style={{ marginBottom: "1rem" }}>
                    <img
                      src={getFileUrl(selectedSubmission.imageUrl)}
                      alt="Cause Media"
                      className="detail-image-preview"
                    />
                    <a href={getFileUrl(selectedSubmission.imageUrl)} target="_blank" rel="noopener noreferrer" className="download-link">
                      View Image
                    </a>
                    <a href={`${getFileUrl(selectedSubmission.imageUrl)}/download`} className="download-link">
                      Download Image
                    </a>
                  </div>
                ) : (
                  <p>No Cause Image/Video provided.</p>
                )}
              </div>


              {/* Single Proof Document */}
              <div className="file-item">
                <strong>Proof Document:</strong>
                {selectedSubmission.proofDocumentUrl ? (
                  (() => {
                    const docUrl = getFileUrl(selectedSubmission.proofDocumentUrl);
                    const ext = selectedSubmission.proofDocumentUrl.split('.').pop().toLowerCase();
                    const docName = selectedSubmission.proofDocumentName || selectedSubmission.proofDocumentUrl.split('/').pop();

                    return (
                      <div className="proof-document-item" style={{ marginBottom: "1rem" }}>
                        <p>{docName}</p>

                        {(() => {
                          const imageExtensions = ["jpg", "jpeg", "png", "webp"];
                          const pdfExtensions = ["pdf"];
                          const docExtensions = ["doc", "docx"];

                          if (pdfExtensions.includes(ext)) {
                            return (
                              <a href={docUrl} target="_blank" rel="noopener noreferrer" className="download-link">
                                Open PDF
                              </a>
                            );
                          } else if (docExtensions.includes(ext)) {
                            return (
                              <a href={docUrl} target="_blank" rel="noopener noreferrer" className="download-link">
                                Open DOC
                              </a>
                            );
                          } else if (imageExtensions.includes(ext)) {
                            return <img src={docUrl} alt="Proof Document" className="detail-image-preview" />;
                          } else {
                            return <p>Unsupported document format.</p>;
                          }
                        })()}

                        <a href={`${docUrl}/download`} className="download-link">Download Document</a>
                      </div>

                    );
                  })()
                ) : (
                  <p>No Proof Document provided.</p>
                )}
              </div>
            </div>

            {(selectedSubmission.status === 'PENDING' || selectedSubmission.status === 'UNDER_REVIEW') && (
              <div className="modification-section">
                <h4>Modify Details Before Approval (Optional)</h4>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" name="modifiedTitle" value={modifiedCauseDetails.modifiedTitle} onChange={handleModificationChange} />
                </div>
                <div className="form-group">
                  <label>Short Description</label>
                  <input type="text" name="modifiedShortDescription" value={modifiedCauseDetails.modifiedShortDescription} onChange={handleModificationChange} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" name="modifiedCategory" value={modifiedCauseDetails.modifiedCategory} onChange={handleModificationChange} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" name="modifiedLocation" value={modifiedCauseDetails.modifiedLocation} onChange={handleModificationChange} />
                </div>
                <div className="form-group">
                  <label>Full Description</label>
                  <textarea name="modifiedDescription" value={modifiedCauseDetails.modifiedDescription} onChange={handleModificationChange} rows="4"></textarea>
                </div>
              </div>
            )}
            <div className="modal-actions">
              {(selectedSubmission.status === 'PENDING' || selectedSubmission.status === 'UNDER_REVIEW') && (
                <>
                  <button className="approve-btn" onClick={handleApprove}>Approve</button>
                  <button className="reject-btn" onClick={handleReject}>Reject</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePersonalCauses;