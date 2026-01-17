// js/attendance.js

// -------------------- Common Utilities --------------------
async function getCurrentUser() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error) {
    console.error("Auth error:", error);
    alert("Error checking login: " + error.message);
    return null;
  }
  if (!user) {
    alert("Not logged in.");
    window.location.href = "login.html";
    return null;
  }
  return user;
}

// -------------------- User Functions --------------------

// Load attendance records for the logged-in user
async function loadAttendance() {
  const user = await getCurrentUser();
  if (!user) return;

  const { data, error } = await supabaseClient
    .from("attendance_requests")
    .select("date, request_type, request_time, status, approved_by, approved_at")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Select error:", error);
    alert("Error loading attendance: " + error.message);
    return;
  }

  const tbody = document.querySelector("#attendanceTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  (data || []).forEach(record => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${record.date || ""}</td>
      <td>${record.request_type || ""}</td>
      <td>${record.request_time ? new Date(record.request_time).toLocaleString() : ""}</td>
      <td>${record.status}</td>
      <td>${record.approved_by ? "Approved" : (record.status === "pending" ? "Pending" : "Rejected")}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Submit a new attendance request
async function requestAttendance(type) {
  console.log("Clicked:", type);

  const user = await getCurrentUser();
  if (!user) return;

  const { error } = await supabaseClient
    .from("attendance_requests")
    .insert({
      user_id: user.id,
      request_type: type,
      status: "pending"
    });

  if (error) {
    console.error("Insert error:", error);
    alert("Error submitting request: " + error.message);
    return;
  }

  alert("Your " + type + " request has been submitted.");
  loadAttendance(); // refresh table
}

// -------------------- Admin Functions --------------------

// Load all pending attendance requests for admin approval
async function loadPendingAttendance() {
  const { data, error } = await supabaseClient
    .from("attendance_requests")
    .select("id, user_id, request_type, request_time, status, date")
    .eq("status", "pending")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error loading requests:", error);
    alert("Error loading attendance requests: " + error.message);
    return;
  }

  const tbody = document.querySelector("#approvalTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  (data || []).forEach(req => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${req.user_id}</td>
      <td>${req.date || ""}</td>
      <td>${req.request_type}</td>
      <td>${req.request_time ? new Date(req.request_time).toLocaleString() : ""}</td>
      <td>${req.status}</td>
      <td>
        <button class="btn-approve" onclick="approveAttendance('${req.id}')">Approve</button>
        <button class="btn-reject" onclick="rejectAttendance('${req.id}')">Reject</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Approve a request (store admin user ID in approved_by)
async function approveAttendance(id) {
  const admin = await getCurrentUser(); // get logged-in admin
  if (!admin) return;

  const { error } = await supabaseClient
    .from("attendance_requests")
    .update({
      status: "approved",
      approved_by: admin.id,   // ✅ store admin UUID
      approved_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("Approve error:", error);
    alert("Error approving: " + error.message);
    return;
  }
  alert("Request approved.");
  loadPendingAttendance();
}

// Reject a request (store admin user ID in approved_by)
async function rejectAttendance(id) {
  const admin = await getCurrentUser();
  if (!admin) return;

  const { error } = await supabaseClient
    .from("attendance_requests")
    .update({
      status: "rejected",
      approved_by: admin.id,   // ✅ store admin UUID
      approved_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("Reject error:", error);
    alert("Error rejecting: " + error.message);
    return;
  }
  alert("Request rejected.");
  loadPendingAttendance();
}
