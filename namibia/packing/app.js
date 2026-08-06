const storageKey = "namibiaPackingChecklist.v1";

function getState() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch(e) {
    return {};
  }
}

function setState(state) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function toggle(id) {
  const state = getState();
  state[id] = !state[id];
  setState(state);
  render();
}

function resetAll() {
  if (confirm("Wyczyścić wszystkie odhaczenia?")) {
    localStorage.removeItem(storageKey);
    render();
  }
}

function clsPriority(p) {
  if (p.includes("Bardzo")) return "important";
  if (p.includes("Kupić") || p.includes("Sprawdzić")) return "buy";
  return "";
}

function populateFilters() {
  const stageSel = document.getElementById("stageFilter");
  const prSel = document.getElementById("priorityFilter");

  [...new Set(DATA.map(x => x.stage))].forEach(v => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    stageSel.appendChild(o);
  });

  [...new Set(DATA.map(x => x.priority))].forEach(v => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    prSel.appendChild(o);
  });
}

function matches(x) {
  const q = document.getElementById("search").value.toLowerCase().trim();
  const sf = document.getElementById("stageFilter").value;
  const pf = document.getElementById("priorityFilter").value;
  const blob = Object.values(x).join(" ").toLowerCase();

  return (!q || blob.includes(q)) &&
         (!sf || x.stage === sf) &&
         (!pf || x.priority === pf);
}

function render() {
  const state = getState();
  const filtered = DATA.filter(matches);
  const doneAll = DATA.filter(x => state[x.id]).length;

  document.getElementById("doneCount").textContent = doneAll;
  document.getElementById("totalCount").textContent = DATA.length;
  document.getElementById("percentCount").textContent = Math.round(doneAll / DATA.length * 100) + "%";

  const app = document.getElementById("app");
  app.innerHTML = "";

  const byStage = {};
  filtered.forEach(x => {
    byStage[x.stage] ||= {};
    byStage[x.stage][x.category] ||= [];
    byStage[x.stage][x.category].push(x);
  });

  Object.entries(byStage).forEach(([stage, cats]) => {
    const stageEl = document.createElement("section");
    stageEl.className = "stage";
    stageEl.innerHTML = `<h2>${stage}</h2>`;

    Object.entries(cats).forEach(([cat, arr]) => {
      const group = document.createElement("div");
      group.className = "group";
      group.innerHTML = `<h3>${cat}</h3>`;

      arr.forEach(x => {
        const row = document.createElement("div");
        row.className = "row" + (state[x.id] ? " done" : "");
        row.innerHTML = `
          <input class="check" type="checkbox" ${state[x.id] ? "checked" : ""} onchange="toggle('${x.id}')">
          <div>
            <div class="item">${x.item}</div>
            <div class="meta">Dla kogo: ${x.for_whom}</div>
          </div>
          <span class="badge ${clsPriority(x.priority)}">${x.priority}</span>
          <span class="meta">${x.stage}</span>`;
        group.appendChild(row);
      });

      stageEl.appendChild(group);
    });

    app.appendChild(stageEl);
  });

  if (!filtered.length) {
    app.innerHTML = '<div class="card">Brak wyników dla wybranych filtrów.</div>';
  }
}

document.getElementById("search").addEventListener("input", render);
document.getElementById("stageFilter").addEventListener("change", render);
document.getElementById("priorityFilter").addEventListener("change", render);

populateFilters();
render();
