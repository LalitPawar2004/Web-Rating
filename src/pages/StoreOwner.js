// src/pages/StoreOwner.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StoreOwner.css"; // Import the CSS file

const StoreOwner = () => {
  const navigate = useNavigate();
  const storeOwnerEmail = localStorage.getItem("userEmail"); // Email of logged-in store owner
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [storeId, setStoreId] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!storeOwnerEmail) {
      navigate("/login");
      return;
    }

    // Step 1: Find the store associated with this store owner
    fetch("http://localhost:5000/stores")
      .then((res) => res.json())
      .then((stores) => {
        const store = stores.find((s) => s.email === storeOwnerEmail);
        if (store) {
          setStoreId(store.id);
          setStoreName(store.name);

          // Step 2: Fetch ratings for this store
          fetch(`http://localhost:5000/ratings/${store.id}`)
            .then((res) => res.json())
            .then((data) => {
              setRatings(data || []);
              const totalScore = data.reduce((sum, r) => sum + r.score, 0);
              setRatingsCount(data.length);
              setAvgRating(data.length > 0 ? totalScore / data.length : 0);
              setLoading(false);
            })
            .catch((err) => {
              console.error("Error fetching ratings:", err);
              setError("Failed to load ratings");
              setLoading(false);
            });
        } else {
          console.error("Store not found for this owner");
          setError("Store not found for your account");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching stores:", err);
        setError("Failed to load store information");
        setLoading(false);
      });
  }, [storeOwnerEmail, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star">★</span>);
      }
    }
    
    return stars;
  };

  const getRatingColor = (score) => {
    if (score >= 4) return "#38a169"; // Green for high ratings
    if (score >= 3) return "#d69e2e"; // Yellow for medium ratings
    return "#e53e3e"; // Red for low ratings
  };

  if (loading) {
    return (
      <div className="store-owner-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your store data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-owner-container">
      <header className="store-owner-header">
        <div className="header-content">
          <h1>Store Owner Dashboard</h1>
          <div className="user-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate("/change-password")}
            >
              Change Password
            </button>
            <button 
              className="btn btn-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="store-owner-main">
        {error && <div className="error-message">{error}</div>}

        <div className="store-info-card">
          <div className="store-info-header">
            <h2>Your Store: {storeName}</h2>
            <p className="store-email">{storeOwnerEmail}</p>
          </div>
          
          <div className="rating-summary">
            <div className="avg-rating-display">
              <div className="rating-score">{avgRating.toFixed(1)}</div>
              <div className="rating-stars-large">
                {renderStars(avgRating)}
              </div>
              <div className="ratings-count">
                {ratingsCount} {ratingsCount === 1 ? 'rating' : 'ratings'}
              </div>
            </div>
            
            <div className="rating-distribution">
              <h3>Rating Distribution</h3>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratings.filter(r => r.score === star).length;
                const percentage = ratingsCount > 0 ? (count / ratingsCount) * 100 : 0;
                
                return (
                  <div key={star} className="distribution-row">
                    <span className="star-label">{star} stars</span>
                    <div className="distribution-bar">
                      <div 
                        className="distribution-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="distribution-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="ratings-section">
          <h2>Customer Ratings</h2>
          
          {ratings.length === 0 ? (
            <div className="empty-state">
              <h3>No ratings yet</h3>
              <p>Your store hasn't received any ratings yet.</p>
            </div>
          ) : (
            <div className="ratings-table-container">
              <table className="ratings-table">
                <thead>
                  <tr>
                    <th>Customer Email</th>
                    <th>Rating</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.map((r, i) => (
                    <tr key={i}>
                      <td className="user-email">{r.user_email}</td>
                      <td>
                        <div className="rating-stars">
                          {renderStars(r.score)}
                        </div>
                      </td>
                      <td>
                        <span 
                          className="score-badge"
                          style={{ backgroundColor: getRatingColor(r.score) }}
                        >
                          {r.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StoreOwner;