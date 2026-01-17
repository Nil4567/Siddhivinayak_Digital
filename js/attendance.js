// Load all pending attendance requests for admin approval
async function loadPendingAttendance() {
  const { data, error } = await supabaseClient
    .from("attendance_requests")
    .select(`
      id,
      user_id,
      request_type,
      request_time,
      status,
      date,
      profiles(email)
    `)
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
      <td>${req.profiles?.email || req.user_id}</td>
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
