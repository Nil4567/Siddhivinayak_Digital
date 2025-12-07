/* --------------------------------------------------
    DATA STORAGE CONSTANTS (NEW)
-------------------------------------------------- */
// The actual path to your hosted JSON files (replace 'main' with your branch name if needed)
const DATA_HOST_BASE = "https://raw.githubusercontent.com/nil4567/Siddhivinayak_Digital/main/data";
const DATA_JOB_FILE = 'jobs.json';
const DATA_EXPENSE_FILE = 'expenses.json';

/* --------------------------------------------------
    DATA READING FUNCTIONS (NEW)
-------------------------------------------------- */
/**
 * Fetches data from a JSON file hosted on GitHub.
 * @param {string} filename - The name of the file to fetch (e.g., 'jobs.json').
 * @returns {Promise<Array>} The parsed JSON array, or an empty array on failure.
 */
async function fetchData(filename) {
    try {
        const url = `${DATA_HOST_BASE}/${filename}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Error fetching ${filename}: ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Failed to parse JSON for ${filename}:`, error);
        return [];
    }
}

async function getAllJobs() {
    return fetchData(DATA_JOB_FILE);
}

async function getAllExpenses() {
    return fetchData(DATA_EXPENSE_FILE);
}

window.getAllJobs = getAllJobs;
window.getAllExpenses = getAllExpenses;


/* --------------------------------------------------
    DATA WRITING FUNCTIONS (Placeholders for GitHub Action)
    (The 'Hardcore' part: This requires GitHub Actions)
-------------------------------------------------- */
// ⚠️ These functions are placeholders. They WILL NOT work without
// setting up a GitHub Action to actually receive the dispatch and write to the file.

async function saveJobToGitHub(newJob) { 
    console.warn("GitHub dispatch placeholder called for Job. Job data must be sent via GitHub Action workflow."); 
    // Data to be sent to GitHub Action payload: { type: 'new_job', data: newJob }
    return true; 
}

async function saveExpenseToGitHub(newExpense) { 
    console.warn("GitHub dispatch placeholder called for Expense. Expense data must be sent via GitHub Action workflow."); 
    // Data to be sent to GitHub Action payload: { type: 'new_expense', data: newExpense }
    return true; 
}

window.saveJobToGitHub = saveJobToGitHub;
window.saveExpenseToGitHub = saveExpenseToGitHub;

// ... all other existing functions (login, checkAuth, etc.) remain here ...
