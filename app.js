const grid = document.getElementById("guideGrid");
const connectionStatus = document.getElementById("connectionStatus");
const storageStatus = document.getElementById("storageStatus");
const installButton = document.getElementById("installButton");
const installDialog = document.getElementById("installDialog");
let installPrompt = null;
let catalog = null;
let workerRegistration = null;

const formatBytes = bytes => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** power;
  return `${value >= 10 || power === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[power]}`;
};

function updateConnection() {
  const online = navigator.onLine;
  connectionStatus.textContent = online ? "● Online · możesz pobierać przewodniki" : "● Offline · dostępne są pobrane przewodniki";
  connectionStatus.classList.toggle("offline", !online);
}

async function updateStorage() {
  if (!navigator.storage?.estimate) return;
  const { usage, quota } = await navigator.storage.estimate();
  if (usage && quota) storageStatus.textContent = `Aplikacja zajmuje ${formatBytes(usage)} z ${formatBytes(quota)}`;
}

async function getWorker() {
  if (workerRegistration?.active) return workerRegistration.active;
  workerRegistration = await navigator.serviceWorker.ready;
  return workerRegistration.active;
}

async function sendCommand(type, packageId, onProgress) {
  const worker = await getWorker();
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = window.setTimeout(() => reject(new Error("Brak odpowiedzi modułu offline.")), 10 * 60 * 1000);
    channel.port1.onmessage = event => {
      const message = event.data || {};
      if (message.type === "PROGRESS") {
        onProgress?.(message);
        return;
      }
      window.clearTimeout(timeout);
      if (message.ok === false) reject(new Error(message.error || "Nie udało się wykonać operacji."));
      else resolve(message);
    };
    worker.postMessage({ type, packageId }, [channel.port2]);
  });
}

function cardMarkup(pkg) {
  return `<article class="guide-card ${pkg.theme}" data-package="${pkg.id}">
    <div class="flag" aria-hidden="true">${pkg.flag}</div>
    <h3>${pkg.title}</h3>
    <div class="meta">${pkg.subtitle}<br>${formatBytes(pkg.size)} · ${pkg.assets.length} plików</div>
    <div class="package-status"><span class="status-dot"></span><span class="status-text">Sprawdzam…</span></div>
    <div class="progress" hidden><span></span></div>
    <div class="card-actions">
      <a class="action primary open-link" href="./${pkg.startUrl}">Otwórz →</a>
      <button class="action secondary package-action" type="button">Pobierz</button>
    </div>
  </article>`;
}

function setCardState(card, state) {
  card.dataset.state = state.stale ? "stale" : state.installed ? "installed" : "available";
  card.classList.toggle("installed", state.installed);
  card.classList.toggle("stale", state.stale);
  const status = card.querySelector(".status-text");
  const action = card.querySelector(".package-action");
  const open = card.querySelector(".open-link");
  if (state.stale) {
    status.textContent = "Dostępna aktualizacja";
    action.textContent = "Aktualizuj";
  } else if (state.installed) {
    status.textContent = "Gotowy offline";
    action.textContent = "Usuń z telefonu";
  } else {
    status.textContent = navigator.onLine ? "Dostępny do pobrania" : "Niepobrany";
    action.textContent = "Pobierz";
  }
  open.setAttribute("aria-disabled", String(!navigator.onLine && !state.installed && !state.stale));
}

async function refreshStates() {
  try {
    const result = await sendCommand("GET_STATUS");
    for (const pkg of catalog.packages) {
      const card = grid.querySelector(`[data-package="${pkg.id}"]`);
      setCardState(card, result.packages[pkg.id] || { installed: false, stale: false });
    }
  } catch (error) {
    grid.querySelectorAll(".status-text").forEach(node => node.textContent = "Tryb offline uruchomi się po odświeżeniu");
  }
}

async function handlePackageAction(card) {
  const id = card.dataset.package;
  const action = card.querySelector(".package-action");
  const progress = card.querySelector(".progress");
  const bar = progress.querySelector("span");
  const status = card.querySelector(".status-text");
  const currentState = card.dataset.state;
  action.disabled = true;
  try {
    if (currentState === "installed") {
      status.textContent = "Usuwam pakiet…";
      await sendCommand("DELETE_PACKAGE", id);
    } else {
      if (!navigator.onLine) throw new Error("Do pobrania przewodnika potrzebny jest internet.");
      progress.hidden = false;
      status.textContent = currentState === "stale" ? "Aktualizuję…" : "Pobieram…";
      await sendCommand("DOWNLOAD_PACKAGE", id, message => {
        const percent = Math.round((message.done / message.total) * 100);
        bar.style.width = `${percent}%`;
        status.textContent = `Pobieram… ${percent}%`;
      });
    }
    await refreshStates();
    await updateStorage();
  } catch (error) {
    status.textContent = error.message;
  } finally {
    action.disabled = false;
    window.setTimeout(() => { progress.hidden = true; bar.style.width = "0"; }, 500);
  }
}

async function migrateAndRegisterWorker() {
  const rootWorkerUrl = new URL("./sw.js", location.href).href;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map(registration => {
    const script = registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL;
    return script && script !== rootWorkerUrl ? registration.unregister() : Promise.resolve();
  }));
  workerRegistration = await navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" });
  await workerRegistration.update().catch(() => {});
  return navigator.serviceWorker.ready;
}

async function init() {
  updateConnection();
  window.addEventListener("online", () => { updateConnection(); refreshStates(); });
  window.addEventListener("offline", () => { updateConnection(); refreshStates(); });
  catalog = await fetch("./offline-catalog.json", { cache: "no-store" }).then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  });
  grid.innerHTML = catalog.packages.map(cardMarkup).join("");
  grid.addEventListener("click", event => {
    const button = event.target.closest(".package-action");
    if (button) handlePackageAction(button.closest(".guide-card"));
  });
  if ("serviceWorker" in navigator) {
    await migrateAndRegisterWorker();
    await refreshStates();
  } else {
    grid.querySelectorAll(".status-text").forEach(node => node.textContent = "Ta przeglądarka nie obsługuje trybu offline");
  }
  await updateStorage();
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPrompt = event;
  installButton.textContent = "Zainstaluj aplikację";
});

installButton.addEventListener("click", async () => {
  if (installPrompt) {
    await installPrompt.prompt();
    installPrompt = null;
  } else installDialog.showModal();
});
document.getElementById("closeDialog").addEventListener("click", () => installDialog.close());
installDialog.addEventListener("click", event => { if (event.target === installDialog) installDialog.close(); });

init().catch(error => {
  grid.innerHTML = `<div class="loading-card">Nie udało się uruchomić aplikacji: ${error.message}</div>`;
});
