const API_URL = "/api/students";

document.addEventListener("DOMContentLoaded", function () {
    loadStudents();

    document
        .getElementById("studentForm")
        .addEventListener("submit", addStudent);
});


async function loadStudents() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load students");
        }

        const students = await response.json();

        const tableBody =
            document.getElementById("studentTableBody");

        tableBody.innerHTML = "";

        students.forEach(student => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${student.id}</td>
                <td>${escapeHtml(student.name)}</td>
                <td>${escapeHtml(student.email)}</td>
                <td>${escapeHtml(student.course)}</td>
                <td>
                    <button
                        class="delete-btn"
                        onclick="deleteStudent(${student.id})">
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {

        console.error(error);

        alert("Unable to load students");
    }
}


async function addStudent(event) {

    event.preventDefault();

    const name =
        document.getElementById("name").value;

    const email =
        document.getElementById("email").value;

    const course =
        document.getElementById("course").value;

    const student = {
        name: name,
        email: email,
        course: course
    };

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(student)
        });

        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(errorText);
        }

        document
            .getElementById("studentForm")
            .reset();

        await loadStudents();

        alert("Student added successfully!");

    } catch (error) {

        console.error(error);

        alert("Unable to add student");
    }
}


async function deleteStudent(id) {

    if (!confirm("Delete this student?")) {
        return;
    }

    try {

        const response =
            await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        await loadStudents();

    } catch (error) {

        console.error(error);

        alert("Unable to delete student");
    }
}


function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}