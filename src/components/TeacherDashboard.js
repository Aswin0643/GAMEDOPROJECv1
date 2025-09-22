// src/components/TeacherDashboard.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  collection,
  query,
  where,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Simple word-based passcode generator
function generatePasscode() {
  const words = [
    "SUN",
    "MOON",
    "STAR",
    "CLOUD",
    "RIVER",
    "MANGO",
    "OCEAN",
    "WIND",
  ];
  const w1 = words[Math.floor(Math.random() * words.length)];
  const w2 = words[Math.floor(Math.random() * words.length)];
  return `${w1}-${w2}-${Math.floor(100 + Math.random() * 900)}`; // e.g., STAR-MANGO-456
}

export default function TeacherDashboard({ user, onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [classLevel, setClassLevel] = useState("");
  const [subject, setSubject] = useState("");

  const [newTask, setNewTask] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Create a new room
  async function createRoom() {
    if (!classLevel || !subject)
      return alert("Select class & subject before creating a room!");

    const code = generatePasscode();
    const roomRef = doc(db, "rooms", code);
    const payload = {
      code,
      createdBy: user?.username || "teacher",
      teacherId: user?.id || "t1",
      classLevel,
      subject,
      createdAt: Date.now(),
      students: [], // {username, score, badges, completedTasks: []}
      tasks: [], // {title, completedBy: []}
    };

    await setDoc(roomRef, payload);
    alert(`Room created ✅ Passcode: ${code}`);
  }

  // Delete a room
  async function closeRoom(code) {
    await deleteDoc(doc(db, "rooms", code));
    alert("Room closed.");
  }

  // Add a new task
  async function addTask(roomCode) {
    if (!newTask) return alert("Enter a task first!");
    const roomRef = doc(db, "rooms", roomCode);

    await updateDoc(roomRef, {
      tasks: arrayUnion({
        title: newTask,
        completedBy: [], // students will be added here
      }),
    });

    setNewTask("");
    setSelectedRoom(null);
    alert("Task added ✅");
  }

  // Realtime fetch all rooms created by this teacher
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "rooms"),
      where("createdBy", "==", user.username)
    );
    const unsub = onSnapshot(q, (snap) => {
      let data = [];
      snap.forEach((doc) => data.push(doc.data()));
      setRooms(data);
    });

    return () => unsub();
  }, [user]);

  return (
    <div style={styles.container}>
      <h1>👩‍🏫 Teacher Dashboard</h1>
      <p>Welcome {user?.username || "Teacher"} to GAMEDO Learning Platform!</p>

      {/* Create Room Section */}
      <div style={styles.section}>
        <h2>Create a Classroom Room</h2>
        <select
          value={classLevel}
          onChange={(e) => setClassLevel(e.target.value)}
          style={styles.select}
        >
          <option value="">Select Class</option>
          <option value="6">Class 6</option>
          <option value="7">Class 7</option>
          <option value="8">Class 8</option>
          <option value="9">Class 9</option>
          <option value="10">Class 10</option>
        </select>

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={styles.select}
        >
          <option value="">Select Subject</option>
          <option value="Math">Math</option>
          <option value="Science">Science</option>
          <option value="English">English</option>
          <option value="Social Science">Social Science</option>
        </select>

        <button onClick={createRoom} style={styles.createBtn}>
          Create Room
        </button>
      </div>

      {/* List of Rooms */}
      <div style={styles.section}>
        <h2>Your Active Rooms</h2>
        {rooms.length === 0 && <p>No rooms created yet.</p>}

        {rooms.map((room) => (
          <div key={room.code} style={styles.roomBox}>
            <h3>Passcode: {room.code}</h3>
            <p>
              <b>Subject:</b> {room.subject} • <b>Class:</b> {room.classLevel}
            </p>

            {/* Students */}
            <h4>Joined Students</h4>
            {room.students.length === 0 ? (
              <p>No students joined yet.</p>
            ) : (
              <ul>
                {room.students.map((s, i) => (
                  <li key={i}>
                    {s.username} — Score: {s.score || 0}, Badges:{" "}
                    {(s.badges || []).join(", ") || "None"}
                  </li>
                ))}
              </ul>
            )}

            {/* Tasks */}
            <h4>Tasks</h4>
            {room.tasks?.length === 0 ? (
              <p>No tasks added yet.</p>
            ) : (
              <ul>
                {room.tasks.map((t, idx) => {
                  const completed = t.completedBy?.length || 0;
                  const pending = room.students.length - completed;

                  return (
                    <li key={idx} style={{ marginBottom: 15 }}>
                      <b>{t.title}</b>
                      <div>
                        ✅ Completed: {completed} • ⏳ Pending: {pending}
                      </div>

                      {/* Bar Chart */}
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={[
                            {
                              name: "Status",
                              Completed: completed,
                              Pending: pending,
                            },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Completed" fill="#4CAF50" />
                          <Bar dataKey="Pending" fill="#f44336" />
                        </BarChart>
                      </ResponsiveContainer>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Add new task */}
            {selectedRoom === room.code ? (
              <div>
                <input
                  type="text"
                  value={newTask}
                  placeholder="Enter a new task"
                  onChange={(e) => setNewTask(e.target.value)}
                  style={styles.input}
                />
                <button
                  onClick={() => addTask(room.code)}
                  style={styles.createBtn}
                >
                  Add Task
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedRoom(room.code)}
                style={styles.createBtn}
              >
                ➕ Add Task
              </button>
            )}

            <button
              onClick={() => closeRoom(room.code)}
              style={styles.closeBtn}
            >
              Close Room
            </button>
          </div>
        ))}
      </div>

      <button style={styles.logoutBtn} onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
    background: "#f0f8ff",
    minHeight: "100vh",
  },
  section: {
    marginTop: "30px",
    padding: "20px",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  select: {
    margin: "10px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  createBtn: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    margin: "10px",
  },
  closeBtn: {
    marginTop: "15px",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#f44336",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
  roomBox: {
    marginTop: "20px",
    padding: "15px",
    background: "#fafafa",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },
  input: {
    padding: "10px",
    margin: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "80%",
  },
  logoutBtn: {
    marginTop: "40px",
    padding: "12px 25px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#ff4d4d",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "16px",
  },
};
