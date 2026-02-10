const { GoogleGenerativeAI } = require("@google/generative-ai");

const OFFICIAL_EMAIL = process.env.OFFICIAL_EMAIL || "YOUR CHITKARA EMAIL";

function fibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];
  const series = [0, 1];
  for (let i = 2; i < n; i++) {
    series.push(series[i - 1] + series[i - 2]);
  }
  return series;
}

function isPrime(num) {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

function filterPrimes(arr) {
  return arr.filter(isPrime);
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

function hcfArray(arr) {
  return arr.reduce((acc, val) => gcd(acc, val));
}

function lcmArray(arr) {
  return arr.reduce((acc, val) => lcm(acc, val));
}

async function askAI(question) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Answer the following question in exactly ONE word. No punctuation, no explanation, just one word.\n\nQuestion: ${question}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text().trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, "");
  return text;
}

async function handlePostBfhl(req, res) {
  try {
    const body = req.body;

    // Must have exactly one recognized key
    const validKeys = ["fibonacci", "prime", "lcm", "hcf", "AI"];
    const presentKeys = validKeys.filter((k) => body.hasOwnProperty(k));

    if (presentKeys.length === 0) {
      return res.status(400).json({
        is_success: false,
        message:
          "Invalid request. Must contain one of: fibonacci, prime, lcm, hcf, AI",
      });
    }

    if (presentKeys.length > 1) {
      return res.status(400).json({
        is_success: false,
        message:
          "Invalid request. Must contain exactly one key from: fibonacci, prime, lcm, hcf, AI",
      });
    }

    const key = presentKeys[0];
    const value = body[key];

    if (key === "fibonacci") {
      if (typeof value !== "number" || !Number.isInteger(value)) {
        return res.status(400).json({
          is_success: false,
          message: "fibonacci value must be an integer",
        });
      }
      if (value < 0) {
        return res.status(400).json({
          is_success: false,
          message: "fibonacci value must be a non-negative integer",
        });
      }
      return res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL,
        data: fibonacci(value),
      });
    }

    if (key === "prime") {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(400).json({
          is_success: false,
          message: "prime value must be a non-empty array of integers",
        });
      }
      if (!value.every((v) => typeof v === "number" && Number.isInteger(v))) {
        return res.status(400).json({
          is_success: false,
          message: "All elements in prime array must be integers",
        });
      }
      return res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL,
        data: filterPrimes(value),
      });
    }

    if (key === "lcm") {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(400).json({
          is_success: false,
          message: "lcm value must be a non-empty array of integers",
        });
      }
      if (!value.every((v) => typeof v === "number" && Number.isInteger(v))) {
        return res.status(400).json({
          is_success: false,
          message: "All elements in lcm array must be integers",
        });
      }
      return res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL,
        data: lcmArray(value),
      });
    }

    if (key === "hcf") {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(400).json({
          is_success: false,
          message: "hcf value must be a non-empty array of integers",
        });
      }
      if (!value.every((v) => typeof v === "number" && Number.isInteger(v))) {
        return res.status(400).json({
          is_success: false,
          message: "All elements in hcf array must be integers",
        });
      }
      return res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL,
        data: hcfArray(value),
      });
    }

    if (key === "AI") {
      if (typeof value !== "string" || value.trim().length === 0) {
        return res.status(400).json({
          is_success: false,
          message: "AI value must be a non-empty string",
        });
      }
      const answer = await askAI(value);
      return res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL,
        data: answer,
      });
    }
  } catch (err) {
    console.error("POST /bfhl error:", err.message, err.stack);
    return res.status(500).json({
      is_success: false,
      message: err.message || "Internal server error",
    });
  }
}

module.exports = { handlePostBfhl };
