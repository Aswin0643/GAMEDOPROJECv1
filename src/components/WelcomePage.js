import React from "react";

export default function WelcomePage({ onGetStarted }) {
  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>🎮 GAMEDO</h1>
        <h2 style={styles.subtitle}>The Learning Platform</h2>

        <button style={styles.button} onClick={onGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  box: {
    backgroundColor: "#fff",
    padding: "50px",
    borderRadius: "15px",
    textAlign: "center",
    width: "350px",
    boxShadow: "0px 6px 14px rgba(0,0,0,0.2)",
  },
  title: {
    marginBottom: "5px",
    color: "#333",
    fontSize: "28px",
    fontWeight: "bold",
  },
  subtitle: {
    marginBottom: "25px",
    fontSize: "16px",
    color: "#666",
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.3s",
  },
};
