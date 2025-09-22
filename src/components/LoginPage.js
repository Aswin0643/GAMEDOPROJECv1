import React, { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!userId || !password)
      return alert("Please enter User ID and Password!");

    // For demo: simple login, role based on ID
    const role = userId.toLowerCase().includes("teacher")
      ? "teacher"
      : "student";
    onLogin({ username: userId, role });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Gamedo</h1>
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>
      </div>
    </div>
  );
}

// Inline styles
const styles = {
  container: {
    height: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1581091012184-6c473bf0c3d0?auto=format&fit=crop&w=1470&q=80')", // learning/gaming background
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: "40px",
    borderRadius: "15px",
    boxShadow: "0px 5px 20px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    minWidth: "300px",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontFamily: "'Roboto', sans-serif",
    color: "#333",
  },
  input: {
    marginBottom: "15px",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    fontSize: "18px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
