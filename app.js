const state = {
  cvText: "",
  profile: null,
  jobs: [],
  lastErrors: []
};

const roleDictionary = [
  "flughafenarbeiter", "lagerarbeiter", "warehouse worker", "kommissionierer",
  "staplerfahrer", "fahrer", "lieferfahrer", "produktion", "produktionsmitarbeiter",
  "reinigung", "hotel", "kellner", "koch", "customer service", "sales",
  "software developer", "frontend developer", "backend developer", "data analyst",
  "project manager", "office assistant", "buchhaltung", "mechaniker", "elektriker"
];

const skillDictionary = [
  "airport", "flughafen", "warehouse", "lager", "logistics", "logistik",
  "forklift", "stapler", "driving", "fahrer", "b2b", "sales", "excel",
  "office", "customer service", "german", "deutsch", "english", "englisch",
  "python", "javascript", "html", "css", "react", "node", "sql", "crm",
  "cleaning", "reinigung", "production", "produktion", "maintenance"
];

const fallbackProfile = {
  roles: ["Flughafenarbeiter", "Lagerarbeiter", "Logistik"],
  skills: ["airport", "warehouse", "logistics", "german", "english"],
  languages: ["German", "English"],
  searchTerms: ["Flughafenarbeiter", "Lagerarbeiter", "Logistik"]
};

const els = {
  cvFile: document.getElementById("cvFile"),
  scanBtn: document.getElementById("scanBtn"),
  demoBtn: document.getElementById("demoBtn"),
  status: document.getElementById("status"),
  results: document.getElementById("results"),
  profileSummary: document.getElementById("profileSummary"),
  locationInput: document.getElementById("locationInput"),
  radiusInput: document.getElementById("radiusInput"),
  manualKeywords: document.getElementById("manualKeywords"),
  readyOnly: document.getElementById("readyOnly"),
  sortInput: document.getElementById("sortInput")
};

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
}

els.cvFile.addEventListener("change", handleCvUpload);
els.scanBtn.addEventListener("click", scanJobs);
els.demoBtn.addEventListener("click", loadDemoCv);
els.readyOnly.addEventListener("change", renderJobs);
els.sortInput.addEventListener("change", renderJobs);

function setStatus(message, tone = "normal") {
  els.status.textContent = message;
  els.status.style.color = tone === "error" ? "var(--danger)" : "var(--green)";
}

async function handleCvUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  setStatus(`Reading ${file.name}...`);

  try {
    state.cvText = await extractTextFromFile(file);
    state.profile = buildProfile(state.cvText);
    els.scanBtn.disabled = false;
    renderProfile();
    setStatus("CV loaded. Ready to scan.");
  } catch (error) {
    console.error(error);
    setStatus(error.message, "error");
    els.profileSummary.innerHTML = `<div class="warning">${escapeHTML(error.message)}</div>`;
  }
}

async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt") || file.type === "text/plain") {
    return file.text();
  }

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    if (!window.pdfjsLib) throw new Error("PDF reader did not load. Check your internet connection and reload.");
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map(item => item.str).join(" "));
    }

    return pages.join("\n");
  }
