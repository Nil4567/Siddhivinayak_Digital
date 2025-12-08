/*******************************************************
 * USER MANAGEMENT — SCRIPT.JS
 *******************************************************/

const HARDCODED_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzVcME3Xb95pDU8faZ1HhGGB1k5hYiBhSlx6GPFUcE2CbCtzO5_9Y3KLv12aoFF70M8sQ/exec";

const HARDCODED_SECURITY_TOKEN = "Siddhivi!n@yakD1gital-T0ken-987";

/* ------------------ Toast Notification ------------------ */
function showToast(msg, isError = false) {
    const toast = document.getElementById("toast");
    toast.style.background = isError ? "#d9534f" : "#323232";
    toast.innerText = msg;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

/* ------------------ SHA256 Function ------------------ */
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ------------------ LOAD USERS ------------------ */
async function loadUsers() {
    try {
        const res = await fetch(
            `${HARDCODED_SCRIPT_URL}?appToken=${HARDCODED_SECURITY_TOKEN}&dataType=USER_CREDENTIALS`
        );

        const json = await res.json();

        if (json.result !== "success") {
            showToast("Error loading users", true);
            return;
        }

        const users = json.data;
        const tbody = document.getElementById("userBody");
        tbody.innerHTML = "";

        users.forEach(row => {
            const [username, passwordHash, role] = row;

            tbody.innerHTML += `
                <tr>
                    <td>${username}</td>
                    <td>${role}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteUser('${username}')">Delete</button>
                    </td>
                </tr>
            `;
        });

    } catch (e) {
        showToast("Connection error", true);
    }
}

document.addEventListener("DOMContentLoaded", loadUsers);

/* ------------------ ADD USER MODAL CONTROL ------------------ */

function openAddUserModal() {
    document.getElementById("userModal").style.display = "flex";
}

function closeUserModal() {
    document.getElementById("userModal").style.display = "none";
}

/* ------------------ ADD USER FUNCTION ------------------ */
async function submitNewUser() {
    const username = document.getElementById("new-username").value.trim();
    const password = document.getElementById("new-password").value.trim();
    const role = document.getElementById("new-role").value;

    if (!username || !password) {
        showToast("Username & Password required!", true);
        return;
    }

    const passwordHash = await sha256(password);

    const payload = {
        appToken: HARDCODED_SECURITY_TOKEN,
        dataType: "ADD_USER",
        data: {
            username: username,
            passwordHash: passwordHash,
            role: role
        }
    };

    try {
        const response = await fetch(HARDCODED_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const json = await response.json();

        if (json.result === "success") {
            showToast("User added successfully!");
            closeUserModal();
            loadUsers();
        } else {
            showToast(json.error, true);
        }

    } catch (e) {
        showToast("Network error", true);
    }
}

/* ------------------ DELETE USER ------------------ */
async function deleteUser(username) {
    if (!confirm("Delete user: " + username + "?")) return;

    const payload = {
        appToken: HARDCODED_SECURITY_TOKEN,
        dataType: "DELETE_USER",
        data: { username }
    };

    try {
        const response = await fetch(HARDCODED_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const json = await response.json();

        if (json.result === "success") {
            showToast("User deleted!");
            loadUsers();
        } else {
            showToast(json.error, true);
        }

    } catch (e) {
        showToast("Network error", true);
    }
}
