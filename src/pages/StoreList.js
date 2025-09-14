// src/pages/StoreList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StoreList.css"; // Import the CSS file

const StoreList = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const userEmail = localStorage.getItem("userEmail");

  // Fetch stores and their average ratings
  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/stores");
      const data = await res.json();

      // Fetch ratings for each store
      const storesWithRatings = await Promise.all(
        data.map(async (store) => {
          try {
            const ratingRes = await fetch(
              `http://localhost:5000/ratings/${store.id}`
            );
            const ratingData = await ratingRes.json();
            return {
              ...store,
              avgRating: ratingData.avgRating || 0,
              ratingsCount: ratingData.ratingsCount || 0,
            };
          } catch {
            return { ...store, avgRating: 0, ratingsCount: 0 };
          }
        })
      );

      setStores(storesWithRatings);
      setFilteredStores(storesWithRatings);
    } catch {
      setError("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Filter stores based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStores(stores);
    } else {
      const filtered = stores.filter(store => 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStores(filtered);
    }
  }, [searchTerm, stores]);

  const handleRate = async (storeId, score) => {
    if (!userEmail) {
      alert("Please login first to rate stores.");
      return;
    }

    try {
      setIsRating(true);

      const res = await fetch("http://localhost:5000/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store_id: storeId, score, user_email: userEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to rate store");
      }

      alert(`✅ ${data.message}. New average: ${data.avgRating.toFixed(1)}`);

      fetchStores(); // Refresh stores to update avgRating
    } catch (err) {
      alert(err.message);
    } finally {
      setIsRating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
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

  return (
    <div className="store-list-container">
      <header className="store-list-header">
        <div className="header-content">
          <h1>Available Stores</h1>
          <div className="user-actions">
            <p className="welcome-text">Welcome, <span className="user-email">{userEmail}</span></p>
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

      <main className="store-list-main">
        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search stores by name or address..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={clearSearch} className="clear-search-btn">
                  ✕
                </button>
              )}
            </div>
            <div className="search-results-info">
              {searchTerm && (
                <p>
                  Showing {filteredStores.length} of {stores.length} stores
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              )}
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading stores...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <>
                <h3>No stores found</h3>
                <p>No stores match your search for "{searchTerm}".</p>
                <button onClick={clearSearch} className="btn btn-primary">
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <h3>No stores found</h3>
                <p>There are no stores available at the moment.</p>
              </>
            )}
          </div>
        ) : (
          <div className="stores-grid">
            {filteredStores.map((store) => (
              <div key={store.id} className="store-card">
                <div className="store-info">
                  <h3 className="store-name">{store.name}</h3>
                  <p className="store-purpose">{store.purpose}</p>
                  <p className="store-address">{store.address}</p>
                  
                  <div className="store-rating">
                    <div className="rating-stars">
                      {renderStars(store.avgRating)}
                    </div>
                    <div className="rating-details">
                      <span className="avg-rating">{store.avgRating ? store.avgRating.toFixed(1) : '0.0'}</span>
                      <span className="ratings-count">({store.ratingsCount} ratings)</span>
                    </div>
                  </div>
                </div>
                
                <div className="store-actions">
                  <label htmlFor={`rating-${store.id}`}>Rate this store:</label>
                  <select
                    id={`rating-${store.id}`}
                    disabled={isRating}
                    defaultValue=""
                    onChange={(e) => handleRate(store.id, Number(e.target.value))}
                    className="rating-select"
                  >
                    <option value="" disabled>Select rating</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'star' : 'stars'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StoreList;