// src/pages/Admin.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css"; // Import the CSS file

const Admin = () => {
  const navigate = useNavigate();

  // state
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Filter states
  const [userFilter, setUserFilter] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });
  const [storeFilter, setStoreFilter] = useState({
    name: "",
    email: "",
    address: "",
    purpose: "",
  });
  const [ratingFilter, setRatingFilter] = useState({
    userEmail: "",
    storeName: "",
    minScore: "",
    maxScore: "",
  });

  // form states for store
  const [storeName, setStoreName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storePassword, setStorePassword] = useState("");
  const [storeConfirmPassword, setStoreConfirmPassword] = useState("");

  // form states for user
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userRole, setUserRole] = useState("user");

  // ================== Logout ==================
  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  // ================== Fetch All Data ==================
  const fetchUsers = () => {
    return fetch("http://localhost:5000/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("User fetch error:", err));
  };

  const fetchStores = () => {
    return fetch("http://localhost:5000/stores")
      .then((res) => res.json())
      .then((data) => setStores(data))
      .catch((err) => console.error("Store fetch error:", err));
  };

  const fetchRatings = () => {
    return fetch("http://localhost:5000/ratings")
      .then((res) => res.json())
      .then((data) => setRatings(data))
      .catch((err) => console.error("Rating fetch error:", err));
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchUsers(), fetchStores(), fetchRatings()]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ================== Filter Functions ==================
  const filterUsers = () => {
    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(userFilter.name.toLowerCase()) &&
        user.email.toLowerCase().includes(userFilter.email.toLowerCase()) &&
        user.address.toLowerCase().includes(userFilter.address.toLowerCase()) &&
        (userFilter.role === "" || user.role === userFilter.role)
      );
    });
  };

  const filterStores = () => {
    return stores.filter((store) => {
      return (
        store.name.toLowerCase().includes(storeFilter.name.toLowerCase()) &&
        store.email.toLowerCase().includes(storeFilter.email.toLowerCase()) &&
        store.address
          .toLowerCase()
          .includes(storeFilter.address.toLowerCase()) &&
        store.purpose.toLowerCase().includes(storeFilter.purpose.toLowerCase())
      );
    });
  };

  const filterRatings = () => {
    return ratings.filter((rating) => {
      const minScore = ratingFilter.minScore
        ? parseInt(ratingFilter.minScore)
        : 0;
      const maxScore = ratingFilter.maxScore
        ? parseInt(ratingFilter.maxScore)
        : 5;

      return (
        rating.user_email
          .toLowerCase()
          .includes(ratingFilter.userEmail.toLowerCase()) &&
        (rating.store_name || "")
          .toLowerCase()
          .includes(ratingFilter.storeName.toLowerCase()) &&
        rating.score >= minScore &&
        rating.score <= maxScore
      );
    });
  };

  // ================== Add Store ==================
  const handleAddStore = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passwordRegex.test(storePassword)) {
      setMessage(
        "❌ Password must be 8-16 characters, include at least one uppercase letter and one special character."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(storeEmail)) {
      setMessage("❌ Invalid store email format.");
      return;
    }

    if (storePassword !== storeConfirmPassword) {
      setMessage("❌ Store passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: storeName,
          purpose,
          address: storeAddress,
          email: storeEmail,
          password: storePassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("✅ Store added successfully!");
      setStoreName("");
      setPurpose("");
      setStoreAddress("");
      setStoreEmail("");
      setStorePassword("");
      setStoreConfirmPassword("");
      fetchStores();
      fetchUsers(); // refresh users too (since store-owner added to users)
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  // ================== Add User ==================
  const handleAddUser = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setMessage("❌ Invalid user email format.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          password: userPassword,
          address: userAddress,
          role: userRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("✅ User added successfully!");
      setUserName("");
      setUserEmail("");
      setUserPassword("");
      setUserAddress("");
      setUserRole("user");
      fetchUsers();
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  // ================== Delete Functions ==================
  const deleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      fetch(`http://localhost:5000/users/${userId}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          setUsers(users.filter((usr) => usr.id !== userId));
          setMessage("✅ User deleted successfully!");
        })
        .catch((err) => {
          setMessage("❌ Error deleting user");
          console.error(err);
        });
    }
  };

  const deleteStore = (storeId) => {
    if (window.confirm("Are you sure you want to delete this store?")) {
      fetch(`http://localhost:5000/stores/${storeId}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          setStores(stores.filter((st) => st.id !== storeId));
          setMessage("✅ Store deleted successfully!");
        })
        .catch((err) => {
          setMessage("❌ Error deleting store");
          console.error(err);
        });
    }
  };

  // ================== Dashboard Stats ==================
  const totalUsers = users.length;
  const totalStores = stores.length;
  const totalRatings = ratings.length;
  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(
          1
        )
      : 0;

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="admin-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/change-password")}
            >
              Change Password
            </button>
            <button className="btn btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-main">
        <nav className="admin-nav">
          <button
            className={activeTab === "dashboard" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={activeTab === "users" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveTab("users")}
          >
            Users ({totalUsers})
          </button>
          <button
            className={activeTab === "stores" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveTab("stores")}
          >
            Stores ({totalStores})
          </button>
          <button
            className={activeTab === "ratings" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveTab("ratings")}
          >
            Ratings ({totalRatings})
          </button>
        </nav>

        <div className="admin-content">
          {message && (
            <div
              className={`message ${
                message.includes("✅") ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="dashboard-tab">
              <h2>System Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <div className="stat-number">{totalUsers}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Stores</h3>
                  <div className="stat-number">{totalStores}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Ratings</h3>
                  <div className="stat-number">{totalRatings}</div>
                </div>
                <div className="stat-card">
                  <h3>Average Rating</h3>
                  <div className="stat-number">{avgRating}</div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">👥</span>
                    <div className="activity-details">
                      <p>{totalUsers} users registered in the system</p>
                      <span className="activity-time">Total count</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">🏪</span>
                    <div className="activity-details">
                      <p>{totalStores} stores available for rating</p>
                      <span className="activity-time">Total count</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">⭐</span>
                    <div className="activity-details">
                      <p>{totalRatings} ratings submitted by users</p>
                      <span className="activity-time">Total count</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="users-tab">
              <div className="tab-header">
                <h2>User Management</h2>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    document.getElementById("addUserModal").showModal()
                  }
                >
                  Add New User
                </button>
              </div>

              <div className="filter-section">
                <h3>Filter Users</h3>
                <div className="filter-grid">
                  <div className="filter-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={userFilter.name}
                      onChange={(e) =>
                        setUserFilter({ ...userFilter, name: e.target.value })
                      }
                      placeholder="Filter by name"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Email</label>
                    <input
                      type="text"
                      value={userFilter.email}
                      onChange={(e) =>
                        setUserFilter({ ...userFilter, email: e.target.value })
                      }
                      placeholder="Filter by email"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={userFilter.address}
                      onChange={(e) =>
                        setUserFilter({
                          ...userFilter,
                          address: e.target.value,
                        })
                      }
                      placeholder="Filter by address"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Role</label>
                    <select
                      value={userFilter.role}
                      onChange={(e) =>
                        setUserFilter({ ...userFilter, role: e.target.value })
                      }
                    >
                      <option value="">All Roles</option>
                      <option value="user">User</option>
                      <option value="store-owner">Store Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Address</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterUsers().map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.address}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filterUsers().length === 0 && (
                  <div className="empty-state">
                    <p>No users found matching your filters</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "stores" && (
            <div className="stores-tab">
              <div className="tab-header">
                <h2>Store Management</h2>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    document.getElementById("addStoreModal").showModal()
                  }
                >
                  Add New Store
                </button>
              </div>

              <div className="filter-section">
                <h3>Filter Stores</h3>
                <div className="filter-grid">
                  <div className="filter-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={storeFilter.name}
                      onChange={(e) =>
                        setStoreFilter({ ...storeFilter, name: e.target.value })
                      }
                      placeholder="Filter by name"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Email</label>
                    <input
                      type="text"
                      value={storeFilter.email}
                      onChange={(e) =>
                        setStoreFilter({
                          ...storeFilter,
                          email: e.target.value,
                        })
                      }
                      placeholder="Filter by email"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={storeFilter.address}
                      onChange={(e) =>
                        setStoreFilter({
                          ...storeFilter,
                          address: e.target.value,
                        })
                      }
                      placeholder="Filter by address"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Purpose</label>
                    <input
                      type="text"
                      value={storeFilter.purpose}
                      onChange={(e) =>
                        setStoreFilter({
                          ...storeFilter,
                          purpose: e.target.value,
                        })
                      }
                      placeholder="Filter by purpose"
                    />
                  </div>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Purpose</th>
                      <th>Address</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterStores().map((store) => (
                      <tr key={store.id}>
                        <td>{store.id}</td>
                        <td>{store.name}</td>
                        <td>{store.purpose}</td>
                        <td>{store.address}</td>
                        <td>{store.email}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteStore(store.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filterStores().length === 0 && (
                  <div className="empty-state">
                    <p>No stores found matching your filters</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "ratings" && (
            <div className="ratings-tab">
              <h2>Ratings Overview</h2>

              <div className="filter-section">
                <h3>Filter Ratings</h3>
                <div className="filter-grid">
                  <div className="filter-group">
                    <label>User Email</label>
                    <input
                      type="text"
                      value={ratingFilter.userEmail}
                      onChange={(e) =>
                        setRatingFilter({
                          ...ratingFilter,
                          userEmail: e.target.value,
                        })
                      }
                      placeholder="Filter by user email"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Store Name</label>
                    <input
                      type="text"
                      value={ratingFilter.storeName}
                      onChange={(e) =>
                        setRatingFilter({
                          ...ratingFilter,
                          storeName: e.target.value,
                        })
                      }
                      placeholder="Filter by store name"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Min Score</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={ratingFilter.minScore}
                      onChange={(e) =>
                        setRatingFilter({
                          ...ratingFilter,
                          minScore: e.target.value,
                        })
                      }
                      placeholder="Min"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Max Score</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={ratingFilter.maxScore}
                      onChange={(e) =>
                        setRatingFilter({
                          ...ratingFilter,
                          maxScore: e.target.value,
                        })
                      }
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User Email</th>
                      <th>Store Name</th>
                      <th>Score</th>
                      <th>Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterRatings().map((rating) => (
                      <tr key={rating.id}>
                        <td>{rating.id}</td>
                        <td>{rating.user_email}</td>
                        <td>{rating.store_name}</td>
                        <td>{rating.score}</td>
                        <td>{rating.review}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filterRatings().length === 0 && (
                  <div className="empty-state">
                    <p>No ratings found matching your filters</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== Modals ========== */}
      <dialog id="addUserModal" className="modal">
        <button
          type="button"
          className="modal-close-btn"
          onClick={() => document.getElementById("addUserModal").close()}
        >
          &times;
        </button>
        <form className="modal-form" onSubmit={handleAddUser}>
          <h3>Add New User</h3>
          <input
            type="text"
            placeholder="Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            required
          />
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            required
          >
            <option value="user">User</option>
            <option value="store-owner">Store Owner</option>
            <option value="admin">Admin</option>
          </select>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              Add User
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => document.getElementById("addUserModal").close()}
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>

      <dialog id="addStoreModal" className="modal">
        <button
          type="button"
          className="modal-close-btn"
          onClick={() => document.getElementById("addUserModal").close()}
        >
          &times;
        </button>
        <form className="modal-form" onSubmit={handleAddStore}>
          <h3>Add New Store</h3>
          <input
            type="text"
            placeholder="Name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={storeEmail}
            onChange={(e) => setStoreEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={storePassword}
            onChange={(e) => setStorePassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={storeConfirmPassword}
            onChange={(e) => setStoreConfirmPassword(e.target.value)}
            required
          />
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              Add Store
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => document.getElementById("addStoreModal").close()}
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};

export default Admin;
