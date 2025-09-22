import React, { useState } from "react";
import { auth } from "../firebase"; // Make sure you have firebase configured
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function SignUp({ onSignInClick }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const handleSendOtp = () => {
    if (!phone) return alert("Enter phone number (+91...)");
    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    alert(`OTP sent to ${phone}! (For demo/testing: ${newOtp})`);
    setStep(2);
  };

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      alert("OTP verified ✅");
      setStep(3);
    } else {
      alert("Invalid OTP ❌");
    }
  };

  const handleCreateAccount = async () => {
    if (!username || !password) return alert("Enter username and password");

    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.find((u) => u.username === username)) {
      return alert("Username already exists ❌");
    }

    try {
      // ✅ Firebase: create user using username as email
      const email = username + "@gamedo.com"; // dummy email
      await createUserWithEmailAndPassword(auth, email, password);

      // ✅ Local storage: store user details
      users.push({ phone, username, password, role });
      localStorage.setItem("users", JSON.stringify(users));

      alert("Account created ✅ You can now Sign In");
      onSignInClick();
    } catch (err) {
      alert("Firebase error: " + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>GAMEDO Signup</h1>

        {step === 1 && (
          <>
            <input
              type="tel"
              placeholder="Enter phone number (+91...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleSendOtp} style={styles.button}>
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleVerifyOtp} style={styles.button}>
              Verify OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.input}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            <button onClick={handleCreateAccount} style={styles.button}>
              Create Account
            </button>
          </>
        )}

        <p style={styles.smallLink} onClick={onSignInClick}>
          Already have an account?{" "}
          <span style={{ color: "#007BFF" }}>Sign In</span>
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
    height: "100vh",
    background: "#f0f2f5",
  },
  card: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 15,
    minWidth: 350,
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  },
  input: {
    width: "100%",
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
  smallLink: { fontSize: 13, marginTop: 5, color: "#555", cursor: "pointer" },
};
