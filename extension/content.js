const DESCRIPTION_SELECTORS = [
  "[data-testid='job-description']",
  ".jobs-description__content",
  ".description__text",
  "#job-details",
  "main"
];

const TITLE_SELECTORS = ["h1", ".top-card-layout__title", "[data-testid='job-title']"];
const COMPANY_SELECTORS = [
  ".topcard__org-name-link",
  ".company-name",
  "[data-testid='job-company']",
  "a[href*='company']"
];

function pickText(selectors) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (!element) {
      continue;
    }

    const text = element.textContent?.trim();
    if (text && text.length > 0) {
      return text;
    }
  }

  return "";
}

function extractDescription() {
  for (const selector of DESCRIPTION_SELECTORS) {
    const element = document.querySelector(selector);
    if (!element) {
      continue;
    }

    const text = element.textContent?.replace(/\s+/g, " ").trim();
    if (text && text.length > 120) {
      return text;
    }
  }

  return document.body.textContent?.replace(/\s+/g, " ").trim().slice(0, 8000) || "";
}

async function getApiBase() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["ghostJobDetectorApiBase"], (result) => {
      resolve(result.ghostJobDetectorApiBase || "http://localhost:3000");
    });
  });
}

async function analyzePageJob() {
  const payload = {
    jobTitle: pickText(TITLE_SELECTORS) || "Job posting",
    companyName: pickText(COMPANY_SELECTORS) || window.location.hostname,
    jobUrl: window.location.href,
    description: extractDescription()
  };

  if (payload.description.split(/\s+/).filter(Boolean).length < 60) {
    return {
      error:
        "Not enough posting detail detected on this page. Open the full job description before running analysis."
    };
  }

  const apiBase = await getApiBase();
  const response = await fetch(`${apiBase}/api/analyze-job`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (!response.ok) {
    return { error: result.error || "Analysis failed" };
  }

  return result;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "analyzeCurrentJob") {
    return;
  }

  analyzePageJob()
    .then((result) => sendResponse({ ok: true, result }))
    .catch((error) =>
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected extension error"
      })
    );

  return true;
});
