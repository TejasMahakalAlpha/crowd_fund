import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PublicApi } from "../services/api";
import Swal from "sweetalert2";

const CauseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cause, setCause] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCause = async () => {
            try {
                const res = await PublicApi.getCauseById(id); // You need this API method
                setCause(res.data);
            } catch (error) {
                Swal.fire("Error", "Failed to fetch cause details", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchCause();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (!cause) return <p>Cause not found</p>;

    return (
        <div style={{ maxWidth: "700px", margin: "auto", padding: "20px" }}>
            <button onClick={() => navigate(-1)}>← Back</button>
            <h1>{cause.title}</h1>
            {cause.imageUrl && (
                <img
                    src={`${cause.imageUrl}`}
                    alt={cause.title}
                    style={{ width: "100%", maxHeight: "300px", objectFit: "cover", marginBottom: "20px" }}
                />
            )}
            <p><strong>Category:</strong> {cause.category}</p>
            <p><strong>Location:</strong> {cause.location}</p>
            <p><strong>Description:</strong> {cause.description}</p>
            <p>
                <strong>Raised:</strong> ₹{Number(cause.currentAmount).toLocaleString()} / ₹{Number(cause.targetAmount).toLocaleString()}
            </p>
            <p><strong>Status:</strong> {cause.status}</p>
            <p><strong>End Date:</strong> {cause.endDate ? new Date(cause.endDate).toLocaleDateString() : "N/A"}</p>
            {/* Add more details as needed */}
        </div>
    );
};

export default CauseDetails;
