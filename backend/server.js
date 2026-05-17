const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware: Enabling CORS and parsing JSON bodies.
app.use(cors());
app.use(express.json());

// Mount routes: Attaching route files to a base URL.
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/leads", require("./routes/leadRoutes"));

// Test route
app.get("/", (req, res) => {
  res.send("Mini CRM API Running...");
});

// If PORT is not defined in environment variables, default to 5000
const PORT = process.env.PORT || 5000;

// Start the server and listen to the request on the defined PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/*
================================================================
Flow of the Server Code
================================================================
1. The server starts and connects to the MongoDB database.
2. Load Packages
3. Load .env variables
4. Connect to MongoDB
5. Initialize Express app
6. Middleware: CORS and JSON parsing
7. Mount routes for authentication and leads management
8. Start the server and listen on the defined PORT
*/