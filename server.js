require("dotenv").config();

const path = require("node:path");
const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = Number(process.env.PORT) || 3000;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const client = new MongoClient(mongoUri);
let students;

app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));

function validateStudent(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { student: "Send student details as a JSON object." };
  }

  const errors = {};

  if (!Number.isInteger(input.rollNumber) || input.rollNumber <= 0) {
    errors.rollNumber = "Enter a positive whole-number roll number.";
  }
  if (typeof input.name !== "string" || !input.name.trim()) {
    errors.name = "Enter the student's name.";
  }
  if (typeof input.department !== "string" || !input.department.trim()) {
    errors.department = "Enter the student's department.";
  }
  if (!Number.isInteger(input.age) || input.age < 1 || input.age > 120) {
    errors.age = "Age must be a whole number between 1 and 120.";
  }
  if (!Number.isFinite(input.marks) || input.marks < 0 || input.marks > 100) {
    errors.marks = "Marks must be a number from 0 to 100.";
  }

  return errors;
}

app.get("/api/students", async (req, res, next) => {
  try {
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 100)
      : 100;
    const records = await students
      .find({})
      .sort({ rollNumber: 1 })
      .limit(limit)
      .toArray();
    res.json(records);
  } catch (error) {
    next(error);
  }
});

app.get("/api/students/:rollNumber", async (req, res, next) => {
  const rollNumber = Number(req.params.rollNumber);
  if (!Number.isInteger(rollNumber) || rollNumber <= 0) {
    return res.status(400).json({ message: "Roll number must be a positive integer." });
  }

  try {
    const student = await students.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: "No student found with that roll number." });
    }
    res.json(student);
  } catch (error) {
    next(error);
  }
});

app.post("/api/students", async (req, res, next) => {
  const errors = validateStudent(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: "Check the student details.", errors });
  }

  const body = req.body;
  const student = {
    rollNumber: body.rollNumber,
    name: body.name.trim(),
    department: body.department.trim(),
    age: body.age,
    marks: body.marks,
  };

  try {
    await students.insertOne(student);
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "That roll number already exists." });
    }
    next(error);
  }
});

app.patch("/api/students/:rollNumber/marks", async (req, res, next) => {
  const rollNumber = Number(req.params.rollNumber);
  const marks = req.body?.marks;

  if (!Number.isInteger(rollNumber) || rollNumber <= 0) {
    return res.status(400).json({ message: "Roll number must be a positive integer." });
  }
  if (typeof marks !== "number" || !Number.isFinite(marks) || marks < 0 || marks > 100) {
    return res.status(400).json({ message: "Marks must be a number from 0 to 100." });
  }

  try {
    const result = await students.updateOne({ rollNumber }, { $set: { marks } });
    if (!result.matchedCount) {
      return res.status(404).json({ message: "No student found with that roll number." });
    }
    const updatedStudent = await students.findOne({ rollNumber });
    res.json(updatedStudent);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/students/:rollNumber", async (req, res, next) => {
  const rollNumber = Number(req.params.rollNumber);
  if (!Number.isInteger(rollNumber) || rollNumber <= 0) {
    return res.status(400).json({ message: "Roll number must be a positive integer." });
  }

  try {
    const result = await students.deleteOne({ rollNumber });
    if (!result.deletedCount) {
      return res.status(404).json({ message: "No student found with that roll number." });
    }
    res.json({ message: `Student with roll number ${rollNumber} was deleted.` });
  } catch (error) {
    next(error);
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API endpoint not found." });
});

app.use((error, req, res, next) => {
  console.error("Request failed:", error);
  if (res.headersSent) {
    return next(error);
  }
  res.status(500).json({ message: "The request could not be completed." });
});

async function startServer() {
  try {
    await client.connect();
    const database = client.db("CollegeDB");
    students = database.collection("students");
    await students.createIndex({ rollNumber: 1 }, { unique: true });

    app.listen(port, () => {
      console.log(`EduPortal is running at http://localhost:${port}`);
      console.log(`Connected to MongoDB database "${database.databaseName}".`);
    });
  } catch (error) {
    console.error("Could not connect to MongoDB. Check that the server is running and MONGODB_URI is correct.");
    console.error(error);
    await client.close().catch((closeError) => {
      console.error("Could not close the MongoDB client after startup failure:", closeError);
    });
    process.exitCode = 1;
  }
}

startServer();
