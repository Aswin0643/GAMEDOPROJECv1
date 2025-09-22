const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const booksRoutes = require("./routes/books");
const usersRoutes = require("./routes/users");

app.use("/api/books", booksRoutes);
app.use("/api/users", usersRoutes);

app.get("/", (req, res) => {
  res.send("Gamified Learning App Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
