const express = require("express");
const router = express.Router();

// Mock users (replace with MySQL or Firebase auth)
let users = [
  { username: "student1", role: "student" },
  { username: "teacher1", role: "teacher" },
];

router.post("/login", (req, res) => {
  const { username } = req.body;
  const user = users.find((u) => u.username === username);
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ message: "User not found" });
  }
});

module.exports = router;
