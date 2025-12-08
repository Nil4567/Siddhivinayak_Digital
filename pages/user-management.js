<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>User Management</title>

    <link rel="stylesheet" href="/Siddhivinayak_Digital/css/styles.css" />
    <style>
        .modal { display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; }
        .modal-content { background:#fff; padding:30px; width:450px; border-radius:8px; }
        .form-group { margin-bottom:15px; }
        label { display:block; margin-bottom:5px; }
        input, select { width:100%; padding:8px; }
        table { width:100%; border-collapse:collapse; margin-top:20px; }
        th, td { padding:12px; border:1px solid #ddd; }
        button { padding:10px 15px; cursor:pointer; }
    </style>
</head>
<body>

    <h2>User Management</h2>

    <button onclick="openAddUserModal()">➕ Add User</button>

    <table>
        <thead>
            <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Delete</th>
            </tr>
        </thead>
        <tbody id="userTableBody"></tbody>
    </table>

    <!-- ADD USER MODAL -->
    <div id="addUserModal" class="modal">
        <div class="modal-content">
            <h3>Add User</h3>

            <div class="form-group">
                <label>Username</label>
                <input type="text" id="newUsername" />
            </div>

            <div class="form-group">
                <label>Password</label>
                <input type="password" id="newPassword" />
            </div>

            <div class="form-group">
                <label>Role</label>
                <select id="newRole">
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                </select>
            </div>

            <button onclick="saveNewUser()">Save</button>
            <button onclick="closeAddUserModal()">Cancel</button>
        </div>
    </div>

    <script src="user-management.js"></script>
</body>
</html>
