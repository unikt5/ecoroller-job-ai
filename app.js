const state = {
  cvText: "",
  profile: null,
  jobs: [],
  lastErrors: []
};

const ADZUNA_APP_ID = "PASTE_YOUR_ADZUNA_APP_ID_HERE";
const ADZUNA_APP_KEY = "PASTE_YOUR_ADZUNA_APP_KEY_HERE";
const ADZUNA_COUNTRY = "at";

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

  if (name.endsWith(".docx")) {
    if (!window.mammoth) throw new Error("DOCX reader did not load. Check your internet connection and reload.");
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  throw new Error("Unsupported CV type. Please upload PDF, DOCX, or TXT.");
}

function loadDemoCv() {
  state.cvText = [
    "Experienced airport and warehouse worker in Vienna.",
    "Skills: logistics, forklift, airport operations, customer service, German, English.",
    "Looking for Flughafenarbeiter, Lagerarbeiter, Fahrer, or logistics roles in Austria."
  ].join(" ");
  state.profile = buildProfile(state.cvText);
  els.scanBtn.disabled = false;
  renderProfile();
  setStatus("Demo CV loaded. Ready to scan.");
}

function buildProfile(text) {
  const normalized = normalize(text);
  const roles = roleDictionary.filter(role => normalized.includes(normalize(role))).slice(0, 6);
  const skills = skillDictionary.filter(skill => normalized.includes(normalize(skill))).slice(0, 12);
  const languages = [];

  if (/\b(deutsch|german|b1|b2|c1|c2)\b/i.test(text)) languages.push("German");
  if (/\b(english|englisch)\b/i.test(text)) languages.push("English");

  const manualTerms = els.manualKeywords.value
    .split(",")
    .map(term => term.trim())
    .filter(Boolean);

  const searchTerms = unique([
    ...manualTerms,
    ...roles,
    ...skills.slice(0, 4),
    ...fallbackProfile.searchTerms
  ]).slice(0, 8);

  return {
    roles: roles.length ? roles : fallbackProfile.roles,
    skills: skills.length ? skills : fallbackProfile.skills,
    languages: languages.length ? languages : fallbackProfile.languages,
    searchTerms
  };
}

function renderProfile() {
  const profile = state.profile;
  els.profileSummary.innerHTML = [
    summaryRow("Detected roles", profile.roles),
    summaryRow("Skills", profile.skills),
    summaryRow("Languages", profile.languages),
    summaryRow("Search terms", profile.searchTerms)
  ].join("");
}

function summaryRow(label, items) {
  return `
    <div class="summary-row">
      <strong>${label}</strong>
      <div class="chips">${items.map(item => `<span class="chip">${escapeHTML(item)}</span>`).join("")}</div>
    </div>
  `;
}

async function scanJobs() {
  if (!state.profile) return;

  state.profile = buildProfile(state.cvText);
  renderProfile();
  state.jobs = [];
  state.lastErrors = [];
  setStatus("Searching live job sources...");
  els.results.className = "results";
  els.results.innerHTML = `<div class="warning">Searching Austria first. This can take a few seconds.</div>`;

  const location = els.locationInput.value.trim() || "Austria";
  const searches = state.profile.searchTerms.slice(0, 5);
  const batches = await Promise.all(searches.map(term => searchAllSources(term, location)));
  const boardSearches = buildBoardSearches(searches.slice(0, 4), location);

  state.jobs = dedupeJobs([...batches.flat(), ...boardSearches]).map(job => ({
    ...job,
    matchScore: scoreJob(job, state.profile)
  }));

  setStatus(`${state.jobs.length} job leads found`);
  renderJobs();
}

async function searchAllSources(term, location) {
  const sources = [
    () => searchAdzuna(term, location),
    () => searchOpeningsHub(term, location),
    () => searchAMS(term, location)
  ];

  const settled = await Promise.allSettled(sources.map(source => source()));
  return settled.flatMap(result => {
    if (result.status === "fulfilled") return result.value;
    state.lastErrors.push(result.reason.message);
    return [];
  });
}

async function searchAdzuna(term, location) {
  if (!isAdzunaConfigured()) {
    throw new Error("Adzuna API is not configured");
  }

  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search/1`);
  url.searchParams.set("app_id", ADZUNA_APP_ID);
  url.searchParams.set("app_key", ADZUNA_APP_KEY);
  url.searchParams.set("what", term);
  url.searchParams.set("where", normalizeAdzunaLocation(location));
  url.searchParams.set("results_per_page", "12");
  url.searchParams.set("sort_by", "relevance");
  url.searchParams.set("content-type", "application/json");

  const response = await fetchWithTimeout(url, {
    headers: {
      Accept: "application/json"
    }
  }, 9000);

  if (!response.ok) throw new Error(`Adzuna API error ${response.status}`);

  const data = await response.json();
  return (data.results || []).map(job => normalizeJob({
    title: job.title,
    company: job.company?.display_name,
    location: job.location?.display_name || "Austria",
    summary: [
      job.category?.label,
      formatSalaryRange(job),
      cleanHTML(job.description || "")
    ].filter(Boolean).join(" - "),
    url: job.redirect_url,
    posted: job.created,
    source: "Adzuna exact job"
  }));
}

async function searchOpeningsHub(term, location) {
  const url = "https://openingshub.com/api/jobs-index.php";
  const response = await fetchWithTimeout(url, {}, 7000);
  if (!response.ok) throw new Error(`OpeningsHub error ${response.status}`);

  const data = await response.json();
  const jobs = data.items || data.jobs || data.results || [];
  const termKey = normalize(term);
  const wantsAustria = /austria|osterreich|vienna|wien|graz|linz|salzburg|innsbruck/i.test(location);

  return jobs.filter(job => {
    const country = normalize(`${job.country} ${job.country_code} ${job.location}`);
    const text = normalize(`${job.title} ${job.category} ${job.company} ${job.location}`);
    const locationMatches = wantsAustria ? /\bat\b|austria|osterreich|vienna|wien|graz|linz|salzburg|innsbruck/i.test(country) : true;
    return locationMatches && (!termKey || text.includes(termKey));
  }).map(job => normalizeJob({
    title: job.title,
    company: job.company,
    location: [job.location, job.country].filter(Boolean).join(", "),
    summary: [job.category, job.employment_type].filter(Boolean).join(" - "),
    url: absolutizeUrl(job.url, "https://openingshub.com"),
    posted: job.created_at || job.updated_at,
    source: "OpeningsHub"
  }));
}

async function searchAMS(term, location) {
  const url = new URL("https://jobs.ams.at/public/emps/api/search");
  url.searchParams.set("query", term);
  url.searchParams.set("location", location);
  url.searchParams.set("vicinity", els.radiusInput.value);
  url.searchParams.set("page", "1");
  url.searchParams.set("pageSize", "12");
  url.searchParams.set("sortField", "_SCORE");
  ["BA", "BZ", "IJ", "SB_WKO", "TN"].forEach(type => url.searchParams.append("jobOfferTypes", type));

  const response = await fetchWithTimeout(url, {}, 7000);
  if (!response.ok) throw new Error(`AMS API error ${response.status}`);

  const data = await response.json();
  return (data.results || []).map(job => normalizeJob({
    title: job.title || job.occupation,
    company: job.company?.name || job.companyName,
    location: [
      job.workingLocation?.municipality,
      job.workingLocation?.federalState
    ].filter(Boolean).join(", "),
    summary: cleanHTML(job.summary || job.description || ""),
    url: job.url || job.detailUrl || buildAmsSearchUrl(term, location),
    posted: job.publicationDate || job.createdAt,
    source: "AMS"
  }));
}

function normalizeJob(job) {
  return {
    title: job.title || "Untitled role",
    company: job.company || "Unknown company",
    location: job.location || "Austria",
    summary: cleanHTML(job.summary || ""),
    url: job.url || buildAmsSearchUrl(job.title || "", job.location || "Austria"),
    posted: job.posted || "",
    source: job.source || "Job source"
  };
}

function scoreJob(job, profile) {
  const haystack = normalize(`${job.title} ${job.company} ${job.location} ${job.summary}`);
  let score = 18;

  profile.roles.forEach(role => {
    if (haystack.includes(normalize(role))) score += 22;
  });

  profile.skills.forEach(skill => {
    if (haystack.includes(normalize(skill))) score += 8;
  });

  if (/austria|osterreich|wien|vienna|graz|linz|salzburg|innsbruck/i.test(job.location)) score += 12;
  if (job.url) score += 8;

  return Math.min(98, score);
}

function renderJobs() {
  let jobs = [...state.jobs];

  if (els.readyOnly.checked) {
    jobs = jobs.filter(job => job.url);
  }

  if (els.sortInput.value === "match") {
    jobs.sort((a, b) => b.matchScore - a.matchScore);
  } else {
    jobs.sort((a, b) => new Date(b.posted || 0) - new Date(a.posted || 0));
  }

  if (!jobs.length) {
    els.results.className = "results empty-results";
    const warningText = state.lastErrors.length
      ? `<p>Sources reported: ${escapeHTML(unique(state.lastErrors).join(", "))}</p>`
      : "";
    els.results.innerHTML = `
      <div>
        <strong>No matching jobs returned</strong>
        <p>Try broader keywords like "lager", "produktion", "fahrer", or "airport".</p>
        ${warningText}
      </div>
    `;
    return;
  }

  els.results.className = "results";
  const onlyBoardSearches = jobs.every(job => job.source === "Austria job-board search");
  const warnings = state.lastErrors.length
    ? `<div class="warning">${onlyBoardSearches
      ? "Direct listing APIs were unavailable, so these are live searches on Austrian job boards."
      : "Some direct listing APIs were unavailable, but the results below are still usable."}</div>`
    : "";

  els.results.innerHTML = warnings + jobs.map(renderJobCard).join("");
}

function renderJobCard(job) {
  const amsSearch = buildAmsSearchUrl(job.title, job.location);
  const isBoardSearch = job.source === "Austria job-board search";
  const secondaryLink = isBoardSearch && job.company === "AMS"
    ? ""
    : `<a class="search-link" href="${escapeAttribute(amsSearch)}" target="_blank" rel="noreferrer">Search on AMS</a>`;

  return `
    <article class="job-card">
      <div>
        <div class="job-title">${escapeHTML(job.title)}</div>
        <div class="job-meta">
          <span>${escapeHTML(job.company)}</span>
          <span>${escapeHTML(job.location)}</span>
          <span class="source-pill">${escapeHTML(job.source)}</span>
          ${job.posted ? `<span>${escapeHTML(formatDate(job.posted))}</span>` : ""}
        </div>
        <p class="job-summary">${escapeHTML(trimText(job.summary, 420))}</p>
        <div class="job-actions">
          <a class="apply-link" href="${escapeAttribute(job.url)}" target="_blank" rel="noreferrer">${isBoardSearch ? "Open live results" : "Apply / View job"}</a>
          ${secondaryLink}
        </div>
      </div>
      <div class="score">${job.matchScore}<span>match</span></div>
    </article>
  `;
}

function buildAmsSearchUrl(query, location) {
  const url = new URL("https://jobs.ams.at/public/emps/jobs");
  url.searchParams.set("query", query || "");
  url.searchParams.set("location", location || "Austria");
  return url.toString();
}

function buildBoardSearches(terms, location) {
  const city = /wien|vienna/i.test(location) ? "wien" : "";
  const locationText = location || "Austria";

  return terms.flatMap(term => {
    const encodedTerm = encodeURIComponent(term);
    const encodedLocation = encodeURIComponent(locationText);
    const boards = [
      {
        name: "AMS",
        url: buildAmsSearchUrl(term, locationText)
      },
      {
        name: "Karriere.at",
        url: `https://www.karriere.at/jobs/${encodedTerm}/${city || "oesterreich"}`
      },
      {
        name: "StepStone Austria",
        url: `https://www.stepstone.at/jobs/${encodedTerm}/in-${city || "oesterreich"}`
      },
      {
        name: "Willhaben Jobs",
        url: `https://www.willhaben.at/jobs/suche?keyword=${encodedTerm}&location=${encodedLocation}`
      },
      {
        name: "Hokify",
        url: `https://hokify.at/jobs/suche?keyword=${encodedTerm}&location=${encodedLocation}`
      }
    ];

    return boards.map(board => normalizeJob({
      title: `${term} jobs in ${locationText}`,
      company: board.name,
      location: locationText,
      summary: `Open current ${board.name} results for "${term}", review live vacancies, and apply on the job board.`,
      url: board.url,
      posted: new Date().toISOString(),
      source: "Austria job-board search"
    }));
  });
}

function isAdzunaConfigured() {
  return ADZUNA_APP_ID &&
    ADZUNA_APP_KEY &&
    !ADZUNA_APP_ID.includes("PASTE_YOUR") &&
    !ADZUNA_APP_KEY.includes("PASTE_YOUR");
}

function normalizeAdzunaLocation(location) {
  const value = String(location || "").trim();
  if (!value || /austria|osterreich/i.test(value)) return "Austria";
  if (/wien|vienna/i.test(value)) return "Vienna";
  return value;
}

function formatSalaryRange(job) {
  const min = Number(job.salary_min || 0);
  const max = Number(job.salary_max || 0);
  if (min && max) return `Salary: EUR ${Math.round(min)}-${Math.round(max)}`;
  if (min) return `Salary from EUR ${Math.round(min)}`;
  return "";
}

function absolutizeUrl(value, base) {
  if (!value) return "";
  try {
    return new URL(value, base).toString();
  } catch (error) {
    return "";
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

function cleanHTML(text) {
  const div = document.createElement("div");
  div.innerHTML = text || "";
  return div.textContent || "";
}

function trimText(text, maxLength) {
  const clean = text || "No description available. Open the job link for details and application steps.";
  return clean.length > maxLength ? `${clean.slice(0, maxLength).trim()}...` : clean;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00f6/g, "o")
    .replace(/\u00e4/g, "a")
    .replace(/\u00fc/g, "u")
    .replace(/\u00df/g, "ss");
}

function unique(items) {
  return [...new Set(items.map(item => String(item).trim()).filter(Boolean))];
}

function dedupeJobs(jobs) {
  const seen = new Set();

  return jobs.filter(job => {
    const key = normalize(`${job.title}|${job.company}|${job.location}|${job.url}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function escapeHTML(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function escapeAttribute(value) {
  return escapeHTML(value).replace(/`/g, "&#096;");
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
