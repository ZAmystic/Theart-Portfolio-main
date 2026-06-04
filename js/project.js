// ============================================================
//  projects.js — GitHub API → Projects Section
// ============================================================

const GITHUB_USERNAME  = "ZAmystic";
const INITIAL_SHOW_DESKTOP = 6;
const INITIAL_SHOW_MOBILE  = 3;   // ≤ 768 px

const LANG_COLORS = {
  JavaScript : "#f7df1e",
  TypeScript : "#3178c6",
  Python     : "#3572A5",
  "C#"       : "#a178db",
  "C++"      : "#f34b7d",
  HTML       : "#e34c26",
  CSS        : "#563d7c",
  Java       : "#b07219",
  Shell      : "#89e051",
  Rust       : "#dea584",
  Go         : "#00ADD8",
  Ruby       : "#701516",
  Swift      : "#F05138",
  Kotlin     : "#7F52FF",
  Dart       : "#00B4AB",
  Vue        : "#41b883",
};

function isMobile() {
  return window.innerWidth <= 768;
}

function getInitialCount() {
  return isMobile() ? INITIAL_SHOW_MOBILE : INITIAL_SHOW_DESKTOP;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d    = Math.floor(diff / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d <  30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

function buildLangTags(languages) {
  if (!languages || Object.keys(languages).length === 0) return "";
  return Object.keys(languages).map(lang => {
    const color = LANG_COLORS[lang] || "#888";
    return `<span class="projLangTag">
      <span class="projLangDot" style="background:${color}"></span>${lang}
    </span>`;
  }).join("");
}

function buildCard(repo, languages) {
  const topics   = (repo.topics || []).slice(0, 5)
    .map(t => `<span class="projTag">${t}</span>`).join("");
  const langTags = buildLangTags(languages);
  const desc     = repo.description || "No description provided.";
  const updated  = timeAgo(repo.pushed_at);
  const stars    = repo.stargazers_count;
  const forks    = repo.forks_count;

  const primaryLang  = languages ? Object.keys(languages)[0] : repo.language;
  const primaryColor = primaryLang ? (LANG_COLORS[primaryLang] || "#888") : null;
  const primaryDot   = primaryLang
    ? `<span class="projLangDot" style="background:${primaryColor}"></span>${primaryLang}`
    : "";

  return `
    <div class="projCard">
      <div class="projCardTop">
        <div class="projCardHeader">
          <span class="projIcon"><i class="fa-solid fa-diagram-project"></i></span>
          <a class="projName" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a>
          ${repo.fork ? '<span class="projForkBadge">fork</span>' : ""}
        </div>

        <p class="projDesc">${desc}</p>

        ${langTags ? `<div class="projLangTags">${langTags}</div>` : ""}
        ${topics   ? `<div class="projTags">${topics}</div>`       : ""}
      </div>

      <div class="projCardBottom">
        <div class="projMeta">
          ${primaryDot ? `<span class="projStat">${primaryDot}</span>` : ""}
          ${stars ? `<span class="projStat"><i class="fa-regular fa-star"></i> ${stars}</span>` : ""}
          ${forks ? `<span class="projStat"><i class="fa-solid fa-code-fork"></i> ${forks}</span>` : ""}
          <span class="projUpdated">Updated ${updated}</span>
        </div>
        <a class="projViewBtn" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
          View <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    </div>`;
}

async function fetchLanguages(repo) {
  try {
    const res = await fetch(repo.languages_url, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function loadProjects() {
  const grid      = document.getElementById("projGrid");
  const toggleBtn = document.getElementById("projToggleBtn");
  const countEl   = document.getElementById("projCount");
  const errEl     = document.getElementById("projError");

  let allRepos = [];
  let allLangs = [];
  let expanded = false;

  const initCount = getInitialCount();

  // Shimmer skeletons
  grid.innerHTML = Array(initCount).fill(`
    <div class="projCard projSkeleton">
      <div class="skelLine skelTitle"></div>
      <div class="skelLine skelBody"></div>
      <div class="skelLine skelBody short"></div>
      <div class="skelLine skelMeta"></div>
    </div>`).join("");

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);

    const raw = await res.json();
    allRepos = raw
      .filter(r => !r.fork && r.name !== GITHUB_USERNAME)
      .sort((a, b) =>
        b.stargazers_count - a.stargazers_count ||
        new Date(b.pushed_at) - new Date(a.pushed_at)
      );

    if (countEl) countEl.textContent = allRepos.length;

    allLangs = new Array(allRepos.length).fill(null);

    // Fetch languages for initial visible batch in parallel
    const currentInit = getInitialCount();
    const initialLangs = await Promise.all(
      allRepos.slice(0, currentInit).map(fetchLanguages)
    );
    initialLangs.forEach((l, i) => { allLangs[i] = l; });

    function render() {
      const currentInitCount = getInitialCount();
      const visible = expanded ? allRepos : allRepos.slice(0, currentInitCount);
      grid.innerHTML = visible.map((repo, i) => buildCard(repo, allLangs[i])).join("");

      if (toggleBtn) {
        const remaining = allRepos.length - currentInitCount;
        if (allRepos.length <= currentInitCount) {
          toggleBtn.style.display = "none";
        } else {
          toggleBtn.style.display = "";
          toggleBtn.innerHTML = expanded
            ? `Show Less <i class="fa-solid fa-angle-up"></i>`
            : `Show More <i class="fa-solid fa-angle-down"></i> <span class="toggleCount">+${remaining}</span>`;
        }
      }
    }

    render();

    if (toggleBtn) {
      toggleBtn.addEventListener("click", async () => {
        expanded = !expanded;

        if (expanded) {
          // Lazily fetch languages for any repos we haven't fetched yet
          const missing = allRepos
            .map((repo, idx) => ({ repo, idx }))
            .filter(({ idx }) => allLangs[idx] === null);

          if (missing.length) {
            const fetched = await Promise.all(missing.map(({ repo }) => fetchLanguages(repo)));
            fetched.forEach((l, i) => { allLangs[missing[i].idx] = l; });
          }
        }

        render();

        if (!expanded) {
          document.getElementById("projects").scrollIntoView({ behavior: "smooth" });
        }
      });
    }

  } catch (err) {
    console.error(err);
    grid.innerHTML = "";
    if (errEl) {
      errEl.style.display = "flex";
      errEl.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span>Couldn't load projects [Due to API limitations]. <a href="https://github.com/${GITHUB_USERNAME}" target="_blank">View on GitHub →</a></span>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", loadProjects);