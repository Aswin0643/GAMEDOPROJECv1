import React, { useState } from "react";
import { auth } from "../firebase";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";

export default function StudentLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return alert("Enter email and password!");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      onLogin({ username: user.email, role: "student" });
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return alert("Enter your email to reset password");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Student Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <p style={styles.link} onClick={handleForgotPassword}>
          Forgot Password?
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1581091012184-6c473bf0c3d0?auto=format&fit=crop&w=1470&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: "40px",
    borderRadius: "15px",
    minWidth: "300px",
    textAlign: "center",
  },
  input: {
    display: "block",
    width: "100%",
    marginBottom: "15px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  link: {
    marginTop: "10px",
    color: "#007BFF",
    cursor: "pointer",
    textDecoration: "underline",
  },
};
