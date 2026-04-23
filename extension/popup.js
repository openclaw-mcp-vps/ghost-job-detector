const apiBaseInput = document.getElementById("apiBase");
const analyzeButton = document.getElementById("analyzeBtn");
const output = document.getElementById("output");

function render(message, isError = false) {
  output.hidden = false;
  output.innerHTML = `<div class="${isError ? "error" : ""}">${message}</div>`;
}

chrome.storage.sync.get(["ghostJobDetectorApiBase"], (result) => {
  if (result.ghostJobDetectorApiBase) {
    apiBaseInput.value = result.ghostJobDetectorApiBase;
  }
});

apiBaseInput.addEventListener("change", () => {
  chrome.storage.sync.set({ ghostJobDetectorApiBase: apiBaseInput.value.trim() });
});

analyzeButton.addEventListener("click", () => {
  analyzeButton.disabled = true;
  render("Running analysis...");

  chrome.storage.sync.set({ ghostJobDetectorApiBase: apiBaseInput.value.trim() });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) {
      render("No active tab found.", true);
      analyzeButton.disabled = false;
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: "analyzeCurrentJob" }, (response) => {
      if (chrome.runtime.lastError) {
        render("Open a job posting page and refresh once before running the extension.", true);
        analyzeButton.disabled = false;
        return;
      }

      const result = response?.result;
      if (!response?.ok || response?.error || result?.error) {
        render(response?.error || result?.error || "Analysis failed.", true);
        analyzeButton.disabled = false;
        return;
      }

      const score = result.legitimacyScore;
      const riskBand = result.riskBand;
      const summary = result.summary;

      output.hidden = false;
      output.innerHTML = `
        <div class="score">${score}/100</div>
        <div class="risk">${riskBand}</div>
        <p>${summary}</p>
      `;

      analyzeButton.disabled = false;
    });
  });
});
