/* ============================================================
   USER MANAGEMENT MODULE (Super Admin Only)
============================================================ */

async function initUserManagement() {
    checkAuth();

    const isSuper = localStorage.getItem("sv_is_superadmin") === "true";
    if (!isSuper) {
        alert("Only Super Admin can access User Management.");
        window.location.href = "./dashboard.html";
        return;
    }

    loadUsers();
}

/* LOAD USERS INTO TABLE */
async function loadUsers() {
    const userList = await fetchSheetData("USER_CREDENTIALS");
    const tbody = document.getElementById("userTableBody");

    if (!userList || userList.length === 0) {
        tbody.innerHTML = "<tr><td colspan='3'>No users found.</td></tr>";
        return;
    }

    tbody.innerHTML = "";

    userList.forEach(row => {
        const username = row[0];
        const role = row[2] === "Yes" ? "Manager" : "Staff";

        tbody.innerHTML += `
            <tr>
                <td>${username}</td>
                <td>${role}</td>
                <td>
                    <button class="btn btn-edit" onclick="openModalEdit('${username}','${row[2]}')">Edit</button>
                    <button class="btn btn-delete" onclick="deleteUser('${username}')">Delete</button>
                </td>
            </tr>
        `;
    });
}

/* OPEN ADD USER MODAL */
function openModalAdd() {
    document.getElementById("modalTitle").innerText = "Add User";
    document.getElementById("mUsername").value = "";
    document.getElementById("mPassword").value = "";
    document.getElementById("mRole").value = "No";
    document.getElementById("mOldUsername").value = "";
    document.getElementById("modalBox").style.display = "flex";
}

/* OPEN EDIT USER MODAL */
function openModalEdit(username, isManager) {
    document.getElementById("modalTitle").innerText = "Edit User";

    document.getElementById("mUsername").value = username;
    document.getElementById("mPassword").value = "";
    document.getElementById("mRole").value = isManager;
    document.getElementById("mOldUsername").value = username;

    document.getElementById("modalBox").style.display = "flex";
}

/* SAVE USER (ADD OR EDIT) */
async function saveUser() {
    const username = document.getElementById("mUsername").value.trim();
    const password = document.getElementById("mPassword").value.trim();
    const role = document.getElementById("mRole").value;
    const oldUsername = document.getElementById("mOldUsername").value;

    if (!username) {
        alert("Username cannot be empty.");
        return;
    }

    let payload;

    if (oldUsername === "") {
        // ADD USER
        payload = {
            dataType: "ADD_USER",
            data: { username, password, isManager: role },
            appToken: HARDCODED_SECURITY_TOKEN
        };
    } else {
        // UPDATE USER
        payload = {
            dataType: "UPDATE_USER",
            data: { oldUsername, username, password, isManager: role },
            appToken: HARDCODED_SECURITY_TOKEN
        };
    }

    const req = await fetch(HARDCODED_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const res = await req.json();

    if (res.result === "success") {
        alert("User saved successfully.");
        closeModal();
        loadUsers();
    } else {
        alert("Error: " + res.error);
    }
}

/* DELETE USER */
async function deleteUser(username) {
    if (!confirm("Delete user: " + username + "?")) return;

    const payload = {
        dataType: "DELETE_USER",
        data: { username },
        appToken: HARDCODED_SECURITY_TOKEN
    };

    const req = await fetch(HARDCODED_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const res = await req.json();

    if (res.result === "success") {
        alert("User deleted.");
        loadUsers();
    } else {
        alert("Error: " + res.error);
    }
}

/* CLOSE MODAL */
function closeModal() {
    document.getElementById("modalBox").style.display = "none";
}
