// src/components/StudentDashboard.js
import React, { useEffect, useState } from "react";
import { books as sampleBooks } from "../db/books";
import { saveBook, getAllBooks, setProgress } from "../db/indexedDB";
import QuizGame from "../db/QuizGame";
import ChatAI from "./ChatAI";

// ✅ FIXED IMPORTS
import { db } from "../firebase";
import { ref, onValue, update } from "firebase/database";

export default function StudentDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("learn");
  const [offlineBooks, setOfflineBooks] = useState([]);
  const [selectedClass, setSelectedClass] = useState(6);
  const [selectedSubject, setSelectedSubject] = useState("Science");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(null);
  const [showGame, setShowGame] = useState(false);
  const [completedChapters, setCompletedChapters] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("English"); // New state for language filter

  // 🎮 Gamification
  const [score, setScore] = useState(0);
  const [badges, setBadges] = useState([]);

  // 🏫 Teacher Rooms
  const [roomCode, setRoomCode] = useState("");
  const [joinedRooms, setJoinedRooms] = useState([]); // Multiple rooms
  const [tasks, setTasks] = useState({}); // Tasks per room

  useEffect(() => {
    refreshBooks();
  }, []);

  // Listen for tasks from Firebase for all joined rooms
  useEffect(() => {
    joinedRooms.forEach((room) => {
      const tasksRef = ref(db, `rooms/${room}/tasks`);
      onValue(tasksRef, (snapshot) => {
        const data = snapshot.val() || [];
        const tasksArray = Array.isArray(data) ? data : Object.values(data);
        setTasks((prev) => ({ ...prev, [room]: tasksArray }));
      });
    });
  }, [joinedRooms]);

  async function refreshBooks() {
    const all = await getAllBooks();
    setOfflineBooks(all || []);
  }

  // 🔹 Merge download and open book
  async function downloadAndOpenBook(cls, subject, language) {
    // Check if book is already downloaded
    let book = offlineBooks.find(
      (b) => b.class === cls && b.subject === subject && b.language === language
    );

    if (!book) {
      // Not downloaded, get sample book
      const sample = sampleBooks.find(
        (b) =>
          b.class === cls && b.subject === subject && b.language === language
      );
      if (sample) {
        await saveBook(sample); // save offline
        await refreshBooks(); // refresh list
        book = sample;
        alert(`${language} book downloaded and opened!`);
      } else {
        return alert(`No ${language} book available for this class/subject`);
      }
    }

    // Open book
    setSelectedBook(book);
    setSelectedChapterIndex(null);
  }

  async function completeChapter(bookId, chapterIndex) {
    await setProgress(bookId, chapterIndex, true);
    setCompletedChapters((prev) => [...prev, chapterIndex]);
    setShowGame(true);
  }

  function handleGameWin(points = 10) {
    const newScore = score + points;
    setScore(newScore);

    if (newScore >= 50 && !badges.includes("🏅 Bronze Learner")) {
      setBadges([...badges, "🏅 Bronze Learner"]);
    }
    if (newScore >= 100 && !badges.includes("🥈 Silver Explorer")) {
      setBadges([...badges, "🥈 Silver Explorer"]);
    }
    if (newScore >= 200 && !badges.includes("🥇 Gold Champion")) {
      setBadges([...badges, "🥇 Gold Champion"]);
    }
  }

  // Join a new teacher room
  function joinRoom() {
    if (!roomCode) return alert("Enter a room code");
    if (!joinedRooms.includes(roomCode)) {
      setJoinedRooms([...joinedRooms, roomCode]);
      setTasks((prev) => ({ ...prev, [roomCode]: [] }));
    }
    setRoomCode("");
  }

  // Complete a task
  function completeTask(room, taskIndex) {
    // Local update
    setTasks((prev) => {
      const updatedRoomTasks = prev[room].map((t, idx) =>
        idx === taskIndex ? { ...t, completed: true } : t
      );
      return { ...prev, [room]: updatedRoomTasks };
    });

    // Firebase update
    const taskRef = ref(db, `rooms/${room}/tasks/${taskIndex}`);
    update(taskRef, { completed: true }).then(() => {
      alert("Task marked complete ✅ and reported to teacher");
    });
  }

  // Backgrounds per tab
  const tabBackgrounds = {
    learn:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
    ask: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
    join: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1400&q=80",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `url(${tabBackgrounds[activeTab]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: 20,
      }}
    >
      {/* Top bar */}
      <div style={styles.topBar}>
        <h2>GAMEDO</h2>
        <div>
          <span style={{ marginRight: 15 }}>⭐ Score: {score}</span>
          {badges.map((b, i) => (
            <span key={i} style={{ marginRight: 5 }}>
              {b}
            </span>
          ))}
        </div>
        <div style={styles.userBox}>
          <span>{user?.username || "Student"}</span>
          <button style={styles.logoutBtn} onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("learn")}
          style={activeTab === "learn" ? styles.activeTab : styles.tab}
        >
          Learn
        </button>
        <button
          onClick={() => setActiveTab("ask")}
          style={activeTab === "ask" ? styles.activeTab : styles.tab}
        >
          Ask (GAMEDO)
        </button>
        <button
          onClick={() => setActiveTab("join")}
          style={activeTab === "join" ? styles.activeTab : styles.tab}
        >
          Join Teacher Room
        </button>
      </div>

      {/* Main content */}
      <div style={styles.content}>
        {/* Learn Tab */}
        {activeTab === "learn" && (
          <div style={styles.learnContainer}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
              <h3>Library</h3>

              {/* Language selection */}
              <div>
                <label>Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  style={styles.select}
                >
                  {["English", "Odia"].map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(parseInt(e.target.value))}
                  style={styles.select}
                >
                  {Array.from({ length: 7 }, (_, i) => i + 6).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={styles.select}
                >
                  {[
                    "Science",
                    "Math",
                    "English",
                    "Social Science",
                    "Computer Science",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Merged Download & Open Book button */}
              <button
                style={styles.openBookBtn}
                onClick={() =>
                  downloadAndOpenBook(
                    selectedClass,
                    selectedSubject,
                    selectedLanguage
                  )
                }
              >
                Download {selectedLanguage} Book
              </button>

              {/* Filtered downloaded books list */}
              <h4>Downloaded Books</h4>
              <div style={styles.booksList}>
                {offlineBooks.filter((b) => b.language === selectedLanguage)
                  .length === 0 && (
                  <p>No {selectedLanguage} books downloaded</p>
                )}
                {offlineBooks
                  .filter((b) => b.language === selectedLanguage)
                  .map((b) => (
                    <div
                      key={b.id}
                      style={{
                        ...styles.bookCard,
                        border:
                          b.language === "Odia"
                            ? "2px solid #FF6B6B"
                            : "1px solid #eee",
                        backgroundColor:
                          b.language === "Odia" ? "#FFF0F0" : "#f9f9f9",
                      }}
                      onClick={() => setSelectedBook(b)}
                    >
                      <h5>
                        {b.title} {b.language === "Odia" ? "📖 (Odia)" : ""}
                      </h5>
                      <small>
                        Class {b.class} • {b.subject} • {b.language}
                      </small>
                    </div>
                  ))}
              </div>
            </div>

            {/* Book preview */}
            <div style={styles.bookPreview}>
              {!selectedBook ? (
                <div style={styles.placeholder}>
                  <h3>Select or download a book to begin learning</h3>
                </div>
              ) : (
                <>
                  <h3>{selectedBook.title}</h3>
                  <div style={styles.chapterList}>
                    {selectedBook.chapters.map((ch, idx) => (
                      <div key={idx} style={styles.chapterRow}>
                        <span>
                          {idx + 1}. {ch.title}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedChapterIndex(idx);
                            completeChapter(selectedBook.id, idx);
                          }}
                          style={{
                            ...styles.completeBtn,
                            backgroundColor: completedChapters.includes(idx)
                              ? "#FFD700"
                              : "#4CAF50",
                          }}
                        >
                          {completedChapters.includes(idx)
                            ? "Completed ⭐"
                            : "Complete"}
                        </button>
                      </div>
                    ))}
                  </div>

                  {selectedChapterIndex !== null && (
                    <div style={styles.chapterView}>
                      <h4>
                        {selectedBook.chapters[selectedChapterIndex].title}
                      </h4>
                      <p style={{ whiteSpace: "pre-wrap" }}>
                        {selectedBook.chapters[selectedChapterIndex].text}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Ask AI Tab */}
        {activeTab === "ask" && <ChatAI user={user} />}

        {/* Join Teacher Room Tab */}
        {activeTab === "join" && (
          <div style={{ padding: 20 }}>
            <h3>Join a Teacher Room</h3>
            <input
              type="text"
              placeholder="Enter Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              style={styles.input}
            />
            <button style={styles.button} onClick={joinRoom}>
              Join Room
            </button>

            {joinedRooms.map((room, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #ccc",
                  padding: 10,
                  marginTop: 12,
                  borderRadius: 6,
                  background: "#fafafa",
                }}
              >
                <h4>Room: {room}</h4>
                <h5>Tasks:</h5>
                {tasks[room]?.length === 0 && <p>No tasks yet</p>}
                {tasks[room]?.map((t, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        textDecoration: t.completed ? "line-through" : "none",
                      }}
                    >
                      {t.title}
                    </span>
                    {!t.completed && (
                      <button
                        style={styles.button}
                        onClick={() => completeTask(room, idx)}
                      >
                        Complete Task
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mini Game Modal */}
      {showGame && (
        <div style={styles.gameModal}>
          <div style={styles.gameBox}>
            <QuizGame
              onClose={() => setShowGame(false)}
              onWin={() => handleGameWin(20)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#fff",
    marginBottom: 16,
  },
  userBox: { display: "flex", gap: 8, alignItems: "center" },
  logoutBtn: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    background: "#ff6b6b",
    color: "#fff",
    cursor: "pointer",
    transition: "0.2s",
  },
  tabs: { display: "flex", gap: 8, marginBottom: 16 },
  tab: {
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    background: "rgba(255,255,255,0.9)",
    transition: "0.2s",
  },
  activeTab: {
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    background: "#4CAF50",
    color: "#fff",
    transition: "0.2s",
  },
  content: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    padding: 16,
    maxWidth: 1200,
    margin: "0 auto",
  },
  learnContainer: { display: "flex", gap: 24 },
  sidebar: { width: 300 },
  downloadBtn: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    background: "#1976d2",
    color: "#fff",
    border: "none",
    marginBottom: 12,
    cursor: "pointer",
  },
  select: { width: "100%", padding: 8, marginBottom: 12, borderRadius: 6 },
  openBookBtn: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    marginBottom: 12,
    cursor: "pointer",
  },
  booksList: { maxHeight: 300, overflowY: "auto" },
  bookCard: {
    padding: 10,
    border: "1px solid #eee",
    borderRadius: 8,
    marginBottom: 8,
    cursor: "pointer",
    background: "#f9f9f9",
    transition: "all     0.3s",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  bookPreview: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    background: "#fafafa",
    minHeight: 400,
  },
  placeholder: { padding: 20, color: "#444", textAlign: "center" },
  chapterList: { marginTop: 12 },
  chapterRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: 8,
    borderBottom: "1px solid #ddd",
    borderRadius: 6,
    marginBottom: 4,
  },
  completeBtn: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
  },
  chapterView: {
    marginTop: 12,
    padding: 12,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  gameModal: {
    position: "fixed",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  gameBox: { width: 640 },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
    marginBottom: 10,
  },
  button: {
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    background: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
  },
};
