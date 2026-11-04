// Run once against a fresh CollegeDB, or change the sample roll numbers first.
use("CollegeDB");

// Create the collection if needed and enforce unique student roll numbers.
db.students.createIndex({ rollNumber: 1 }, { unique: true });

// insertOne(): add one student.
db.students.insertOne({
  rollNumber: 1001,
  name: "Aarav Patel",
  department: "Computer Science",
  age: 20,
  marks: 86
});

// insertMany(): add several students.
db.students.insertMany([
  {
    rollNumber: 1002,
    name: "Meera Shah",
    department: "Information Technology",
    age: 19,
    marks: 92
  },
  {
    rollNumber: 1003,
    name: "Rohan Das",
    department: "Computer Science",
    age: 21,
    marks: 78
  },
  {
    rollNumber: 1004,
    name: "Isha Nair",
    department: "Electronics",
    age: 20,
    marks: 88
  }
]);

// find(): list students in the Computer Science department.
db.students.find({ department: "Computer Science" });

// findOne(): find a student by roll number.
db.students.findOne({ rollNumber: 1002 });

// updateOne(): change one student's marks.
db.students.updateOne(
  { rollNumber: 1001 },
  { $set: { marks: 89 } }
);

// updateMany(): set a new mark for every Computer Science student.
db.students.updateMany(
  { department: "Computer Science" },
  { $set: { marks: 90 } }
);

// sort(): display records by marks, highest first.
db.students.find().sort({ marks: -1 });

// limit(): display only the first two roll numbers.
db.students.find().sort({ rollNumber: 1 }).limit(2);

// countDocuments(): count all student records.
db.students.countDocuments({});

// deleteOne(): remove one student by roll number.
db.students.deleteOne({ rollNumber: 1004 });

// Add temporary records so deleteMany() has a clearly limited target.
db.students.insertMany([
  {
    rollNumber: 1091,
    name: "Temporary Student One",
    department: "Temporary",
    age: 18,
    marks: 50
  },
  {
    rollNumber: 1092,
    name: "Temporary Student Two",
    department: "Temporary",
    age: 19,
    marks: 55
  }
]);

// deleteMany(): remove only the temporary demonstration records.
db.students.deleteMany({ department: "Temporary" });

// Confirm the remaining records and final count.
db.students.find().sort({ rollNumber: 1 });
db.students.countDocuments({});
