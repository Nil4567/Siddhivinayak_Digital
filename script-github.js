/* script-github.js
   Sends new job entries to GitHub workflow
*/

// ⚠️ IMPORTANT — FILL THESE 3 VALUES
const GH_USERNAME = "nil4567";   // Your GitHub username
const GH_REPO = "Siddhivinayak_Digital"; 
const GH_TOKEN = "PASTE_YOUR_GITHUB_TOKEN_HERE";  // Your PAT token with repo permissions

// ------------------------------
// CALL WORKFLOW TO SAVE JOB
// ------------------------------
async function sendJobToGitHub(jobData) {
  const url = `https://api.github.com/repos/${GH_USERNAME}/${GH_REPO}/dispatches`;

  const body = {
    event_type: "add_job",
    client_payload: {
      job: jobData
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${GH_TOKEN}`,
    },
    body: JSON.stringify(body)
  });

  if (response.status === 204) {
    console.log("Job sent successfully to GitHub.");
    return true;
  } else {
    console.error("GitHub API error:", response.status, await response.text());
    return false;
  }
}
