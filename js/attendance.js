// js/attendance.js

// Get current user (reuse auth.js session)
async function getCurrentUser() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) {
    alert("Not logged in.");
    window.location.href = "login.html";
    return null;
  }
  return user;
}

// Show Attendance Records
async function showAttendance() {
  document.getElementById("attendanceSection").style.display = "block";
  document.getElementById("queueSection").style.display = "none";

  const user = await getCurrentUser();
  if (!user) return;

  const { data, error } = await supabaseClient
    .from("attendance_requests")
    .select("date, request_type, request_time, status, approved_by, approved_at")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    alert("Error loading attendance: " + error.message);
    return;
  }

  const tbody = document.querySelector("#attendanceTable tbody");
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

// Submit Attendance Request
async function requestAttendance(type) {
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
    alert("Error submitting request: " + error.message);
    return;
  }

  alert("Your " + type + " request has been submitted.");
  showAttendance(); // refresh table
}
