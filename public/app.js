const studentRows = document.getElementById("student-rows");
const recordCount = document.getElementById("record-count");
const emptyState = document.getElementById("empty-state");
const statusMessage = document.getElementById("status-message");

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "The request could not be completed.");
  }
  return data;
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function renderStudents(records) {
  studentRows.replaceChildren();
  recordCount.textContent = `${records.length} student${records.length === 1 ? "" : "s"} shown`;
  emptyState.hidden = records.length !== 0;

  for (const student of records) {
    const row = document.createElement("tr");
    const values = [
      student.rollNumber,
      student.name,
      student.department,
      student.age,
    ];

    for (const value of values) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    }

    const marksCell = document.createElement("td");
    const marksForm = document.createElement("form");
    marksForm.className = "marks-editor";

    const marksInput = document.createElement("input");
    marksInput.type = "number";
    marksInput.name = "marks";
    marksInput.min = "0";
    marksInput.max = "100";
    marksInput.step = "0.01";
    marksInput.value = student.marks;
    marksInput.setAttribute("aria-label", `Marks for ${student.name}`);
    marksInput.required = true;

    const updateButton = document.createElement("button");
    updateButton.className = "button small-button";
    updateButton.type = "submit";
    updateButton.textContent = "Update";

    marksForm.append(marksInput, updateButton);
    marksForm.addEventListener("submit", (event) => updateMarks(event, student.rollNumber));
    marksCell.append(marksForm);
    row.append(marksCell);

    const actionsCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.className = "button small-button delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${student.name}`);
    deleteButton.addEventListener("click", () => deleteStudent(student.rollNumber));
    actionsCell.append(deleteButton);
    row.append(actionsCell);

    studentRows.append(row);
  }
}

async function loadStudents() {
  try {
    const records = await request("/api/students");
    renderStudents(records);
  } catch (error) {
    showStatus(error.message, true);
    recordCount.textContent = "Could not load records.";
    emptyState.hidden = false;
  }
}

document.getElementById("add-student-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = new FormData(form);

  const student = {
    rollNumber: Number(values.get("rollNumber")),
    name: values.get("name").trim(),
    department: values.get("department").trim(),
    age: Number(values.get("age")),
    marks: Number(values.get("marks")),
  };

  try {
    await request("/api/students", {
      method: "POST",
      body: JSON.stringify(student),
    });
    form.reset();
    showStatus(`Student ${student.name} was added successfully.`);
    await loadStudents();
  } catch (error) {
    showStatus(error.message, true);
  }
});

document.getElementById("search-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const rollNumber = new FormData(event.currentTarget).get("rollNumber");

  try {
    const student = await request(`/api/students/${encodeURIComponent(rollNumber)}`);
    renderStudents([student]);
    showStatus(`Found student with roll number ${student.rollNumber}.`);
  } catch (error) {
    renderStudents([]);
    showStatus(error.message, true);
  }
});

document.getElementById("show-all").addEventListener("click", async () => {
  showStatus("");
  await loadStudents();
});

document.getElementById("refresh").addEventListener("click", async () => {
  showStatus("");
  await loadStudents();
});

async function updateMarks(event, rollNumber) {
  event.preventDefault();
  const marks = Number(new FormData(event.currentTarget).get("marks"));

  try {
    const student = await request(`/api/students/${rollNumber}/marks`, {
      method: "PATCH",
      body: JSON.stringify({ marks }),
    });
    showStatus(`Marks for ${student.name} were updated.`);
    await loadStudents();
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function deleteStudent(rollNumber) {
  try {
    const result = await request(`/api/students/${rollNumber}`, {
      method: "DELETE",
    });
    showStatus(result.message);
    await loadStudents();
  } catch (error) {
    showStatus(error.message, true);
  }
}

loadStudents();
