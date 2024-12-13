async function getValue(key) {
  const result = await chrome.storage.local.get(key);
  return result[key];
}

let studyMaterials = [];
let valueSize = 0;
let nextMessageKey = 0;

// Initialize study materials
getValue("studyMaterials").then((result) => {
  studyMaterials = JSON.parse(result || "[]"); // Default to empty array if no data
  valueSize = Object.keys(studyMaterials).length;
});

// Function to update study materials when changed
async function handleStorageUpdate(changes, areaName) {
  if (areaName === 'local' && changes.studyMaterials) {
    // Retrieve the updated value
    const updatedStudyMaterials = changes.studyMaterials.newValue;

    // Parse and update your local variables if needed
    let studyMaterials = JSON.parse(updatedStudyMaterials);
    let valueSize = Object.keys(studyMaterials).length;

    console.log("Updated Study Materials:");
    console.log("Number of items:", valueSize);
  }
}


// Function to generate notification with study material
function sendStudyNotes() {
  if (valueSize === 0) {
    console.warn("No study materials available.");
    return;
  }

  chrome.notifications.create({
    type: "basic",
    iconUrl: "nudge.png",
    title: "Study Nudge!",
    message: studyMaterials[nextMessageKey],
    buttons: [{ title: "Got It!" }],
    priority: 0
  });

  // Loop through study notes
  if (nextMessageKey < valueSize - 1) {
    nextMessageKey++;
  } else {
    nextMessageKey = 0;
  }
}

// Set an alarm to run every 5 minutes
chrome.alarms.create("studyNudge", { periodInMinutes: 0.2 }); // 0.2 = 12 seconds for testing

// Listener for the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "studyNudge") {
    console.log("Periodic task triggered at", new Date().toLocaleTimeString());
    sendStudyNotes();
  }
});

// Listener for when a tab is created (new tab opened)
chrome.tabs.onCreated.addListener((tab) => {
  console.log(`New tab opened: ${tab.id}, adding to counter`);
  sendStudyNotes();

  // Restart timer to keep consistent nudges
  chrome.alarms.clear();
  chrome.alarms.create("studyNudge", { periodInMinutes: 0.2 });
});


// Listener for storage changes
chrome.storage.onChanged.addListener(handleStorageUpdate);

