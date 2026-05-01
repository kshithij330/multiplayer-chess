// server/index.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const lobbyRoutes = require("./routes/lobby");
const gameRoutes = require("./routes/game");
const setupGameSocket = require("./sockets/gameSocket");

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// REST Routes
app.use("/api/lobbies", lobbyRoutes);
app.use("/api/games", gameRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Socket.io
const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ["GET", "POST"], credentials: true },
});

setupGameSocket(io);

// Global error handlers to prevent process crashes
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION at:", promise, "reason:", reason);
});

server.listen(PORT, () => {
  console.log(`♟️  Chess server running on http://localhost:${PORT}`);
  console.log(`   Client URL: ${CLIENT_URL}`);
});
