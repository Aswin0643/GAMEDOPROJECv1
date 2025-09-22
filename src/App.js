import React, { useState } from "react";
import WelcomePage from "./components/WelcomePage";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";

export default function App() {
  const [page, setPage] = useState("welcome");
  const [user, setUser] = useState(null);

  // ✅ Handles login and redirects based on role
  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === "student") setPage("student-dashboard");
    if (userData.role === "teacher") setPage("teacher-dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("signin"); // always go back to Sign In
  };

  return (
    <>
      {page === "welcome" && (
        <WelcomePage onGetStarted={() => setPage("signin")} />
      )}

      {page === "signin" && (
        <SignIn onLogin={handleLogin} onSignUpClick={() => setPage("signup")} />
      )}

      {page === "signup" && (
        <SignUp
          onSignInClick={() => setPage("signin")} // 👈 changed for consistency
        />
      )}

      {page === "student-dashboard" && (
        <StudentDashboard user={user} onLogout={handleLogout} />
      )}

      {page === "teacher-dashboard" && (
        <TeacherDashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
}
