# EduPortal Student Management

A beginner-friendly student records application built with HTML, CSS, browser JavaScript, Node.js, Express, and MongoDB.

## Requirements

- Node.js 18 or later
- MongoDB Community Server running locally, or a MongoDB connection URI
- MongoDB Shell (`mongosh`) for the practical command demonstration

## Connect to MongoDB

The app connects to the `CollegeDB` database and its `students` collection. By default, it uses:

```text
mongodb://127.0.0.1:27017
```

Start your local MongoDB server before starting the app. If MongoDB was installed as a Windows service, open PowerShell as an administrator and run:

```powershell
Start-Service MongoDB
```

If you use another URI, copy `.env.example` to `.env` and set `MONGODB_URI` to your server's connection URI. For example:

```text
MONGODB_URI=mongodb://127.0.0.1:27017
PORT=3000
```

The server creates a unique index on `rollNumber`. It reports a clear startup error and exits if MongoDB cannot be reached.

## Install and run

In PowerShell, from this project folder:

```powershell
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Leave the terminal running while you use the app.

## Use the interface

- Add a student with a unique roll number, name, department, age, and marks from 0 to 100.
- Search for a student by roll number; use **Show all students** to restore the complete list.
- Change a student's marks in the records table and select **Update**.
- Select **Delete** to remove a student record.
- The records are sorted by roll number. The page shows up to 100 records.

## MongoDB Shell practical

Make sure MongoDB is running and `mongosh` is installed. From this folder, run the command demonstration against the local server:

```powershell
mongosh "mongodb://127.0.0.1:27017" --file .\mongosh-commands.js
```

The script selects `CollegeDB` and creates/reuses `students` with a unique roll number index before demonstrating all requested operations with sample students:

| MongoDB Shell method | Demonstration |
| --- | --- |
| `insertOne()` | Adds roll number 1001 |
| `insertMany()` | Adds roll numbers 1002–1004 |
| `find()` | Finds Computer Science students |
| `findOne()` | Finds roll number 1002 |
| `updateOne()` | Updates marks for roll number 1001 |
| `updateMany()` | Updates marks for Computer Science students |
| `sort()` | Sorts by marks |
| `limit()` | Shows two records |
| `countDocuments()` | Counts student records |
| `deleteOne()` | Deletes roll number 1004 |
| `deleteMany()` | Deletes only temporary demonstration records |

The file is intended to be run once against a fresh database. If you rerun it, the fixed sample roll numbers will conflict with the unique index; use different roll numbers or practice individual commands in `mongosh`.

You can also open an interactive shell:

```powershell
mongosh "mongodb://127.0.0.1:27017"
```

Then enter commands such as:

```javascript
use CollegeDB
db.students.find()
db.students.findOne({ rollNumber: 1001 })
db.students.countDocuments({})
```

## CRUD API

- `GET /api/students` — list students sorted by roll number (up to 100)
- `GET /api/students/:rollNumber` — find one student
- `POST /api/students` — insert one student
- `PATCH /api/students/:rollNumber/marks` — update marks
- `DELETE /api/students/:rollNumber` — delete one student
