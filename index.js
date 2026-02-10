const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { handlePostBfhl } = require("./routes/bfhl");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
  res.json({is_success:true,message:"Welcome"})
})
app.get("/health", (_req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: process.env.OFFICIAL_EMAIL || "YOUR CHITKARA EMAIL",
  });
});

app.post("/bfhl", handlePostBfhl);


app.use((_req, res) => {
  return res.status(404).json({
    is_success: false,
    message: "Route not found",
  });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  return res.status(500).json({
    is_success: false,
    message: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
