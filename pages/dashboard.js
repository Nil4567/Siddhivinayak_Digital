import { SCRIPT_URL, SECURITY_TOKEN, DASHBOARD_PAGE } from "/Siddhivinayak_Digital/config.js";

(function init(){
  // Guard: redirect to login if no session
  const user = JSON.parse(localStorage.getItem("sd_user"));
  if (!user) {
    window.location.href = "/Siddhivinayak_Digital/pages/login.html";
    return;
  }

  // display user info
  document.getElementById("userInfo").textContent = user.username || user.email || user.name || user.email || "Staff";

  // show/hide user management link depending on role
  const usersLink = document.getElementById("usersLink");
  if (user.role && user.role.toLowerCase() === "superadmin") {
    usersLink.style.display = "block";
  } else {
    usersLink.style.display = "none";
  }

  // load stats (attempt to query backend, fallback to demo)
  loadStats();

})();

async function loadStats(){
  try {
    // Try list users (GAS or Supabase compatible endpoint)
    let totalUsers = "—", activeJobs = "—", todayRevenue = "—";
    // Try Apps Script endpoint if configured
    if (typeof SCRIPT_URL !== "undefined" && SCRIPT_URL) {
      // list users
      const q = `${SCRIPT_URL}?type=listUsers&securityToken=${SECURITY_TOKEN}`;
      const res = await fetch(q);
      const json = await res.json();
      if (json.status === "success" && Array.isArray(json.data)) {
        totalUsers = json.data.length;
      } else if (json.result === "success" && Array.isArray(json.data)) {
        totalUsers = json.data.length;
      }
    }

    // fill UI (demo values for jobs/revenue)
    document.getElementById("totalUsers").textContent = totalUsers;
    document.getElementById("activeJobs").textContent = 3; // placeholder
    document.getElementById("todayRevenue").textContent = "₹ " + (2450); // placeholder

    // populate Recent Activity demo
    const activityList = document.getElementById("activityList");
    activityList.innerHTML = "";
    const demo = [
      { title: "New user added (ram)", time: "10:05 AM" },
      { title: "Order #142 printed", time: "09:40 AM" },
      { title: "Daily backup completed", time: "00:05 AM" }
    ];
    demo.forEach(a => {
      const div = document.createElement("div");
      div.className = "activity-item";
      div.innerHTML = `<div>${a.title}</div><small>${a.time}</small>`;
      activityList.appendChild(div);
    });

    // Logout button
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("sd_user");
      window.location.href = "/Siddhivinayak_Digital/pages/login.html";
    });

  } catch (err) {
    console.error("Failed loading stats", err);
  }
}
