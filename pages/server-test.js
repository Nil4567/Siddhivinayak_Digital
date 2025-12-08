/*******************************************************
 * SERVER TEST SYSTEM
 *******************************************************/

async function testServerConnection() {
    const toast = (msg, err = false) => showToast(msg, err);

    toast("Testing server connection...");

    try {
        const testURL = `${HARDCODED_SCRIPT_URL}?appToken=${HARDCODED_SECURITY_TOKEN}&dataType=PING`;

        const res = await fetch(testURL, {
            method: "GET",
        });

        if (!res.ok) {
            toast(`Server responded with HTTP ${res.status} (${res.statusText})`, true);
            return;
        }

        const json = await res.json();

        if (json.result === "success") {
            toast("✔ Server OK! Connected successfully.");
        } else {
            toast(`❌ Server Error: ${json.error}`, true);
        }

    } catch (e) {
        toast("❌ Network Error: " + e.message, true);
    }
}
