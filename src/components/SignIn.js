import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";

export default function SignIn({ onLogin, onSignUpClick }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role selector

  const handleLogin = async () => {
    if (!username || !password) return alert("Enter username and password");

    const email = username + "@gamedo.com"; // dummy email for Firebase

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      alert(`Login successful ✅ (${role} via Firebase)`);
      onLogin({ username, role });
    } catch (firebaseErr) {
      console.log("Firebase login failed:", firebaseErr.message);

      // Fallback to LocalStorage
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const foundUser = users.find(
        (u) => u.username === username && u.password === password
      );

      if (foundUser) {
        alert(`Login successful ✅ (${foundUser.role} Offline)`);
        onLogin(foundUser);
      } else {
        alert("Invalid credentials ❌");
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!username) return alert("Enter your username");

    const newPassword = prompt("Enter your new password:");
    if (!newPassword) return;

    const email = username + "@gamedo.com";

    try {
      // If Firebase user is logged in, update their password
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        alert("Password updated successfully ✅ (Firebase)");
        return;
      } else {
        throw new Error("Not logged in with Firebase");
      }
    } catch (firebaseErr) {
      console.log("Firebase password update failed:", firebaseErr.message);
    }

    // Fallback to LocalStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((u) => u.username === username);

    if (!user) {
      return alert("User not found ❌");
    }

    user.password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));
    alert("Password changed successfully ✅ (Offline mode)");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>GAMEDO Sign In</h1>

        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {/* Role selection */}
        <div style={{ marginBottom: 15 }}>
          <label style={{ marginRight: 10 }}>Login as:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ padding: 6, borderRadius: 6 }}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <button onClick={handleLogin} style={styles.button}>
          Sign In
        </button>

        <p style={styles.link} onClick={handleForgotPassword}>
          Forgot Password?
        </p>

        <p style={styles.smallLink} onClick={onSignUpClick}>
          Don’t have an account?{" "}
          <span style={{ color: "#007BFF" }}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    minHeight: "100vh",
    background: "#f0f2f5",
  },
  card: {
    backgroundColor: "white",
    padding: "40px 20px",
    borderRadius: 15,
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  input: {
    width: "90%",
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  button: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
    cursor: "pointer",
  },
  link: {
    fontSize: 14,
    color: "#007BFF",
    cursor: "pointer",
    textDecoration: "underline",
    marginBottom: 10,
  },
  smallLink: {
    fontSize: 13,
    marginTop: 5,
    color: "#555",
    cursor: "pointer",
  },
};
