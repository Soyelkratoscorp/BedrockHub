// Bedrock Hub — Vanilla JS. No build step required.
const CURSEFORGE_API_KEY = ""; // Opcional: agrega tu clave y configura un backend seguro; no expongas claves privadas en una app cliente.
const MODRINTH_API = "https://api.modrinth.com/v2";
const ALLORIGINS = "https://api.allorigins.win/raw?url=";
const FAVORITES_KEY = "bedrock-hub-favorites-v1";

const state = { query: "", category: "all", favoritesOnly: false, results: [], source: "all" };
const $ = (s) => document.querySelector(s);
const resultsEl = $("#results");

const categoryTerms = {
  all: "",
  addon: "addon",
  texture: "texture",
  shader: "shader",
  map: "map"
};

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
function favorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); }
  catch { return []; }
}
function saveFavorites(items) { localStorage.setItem(FAVORITES_KEY, JSON.stringify(items)); updateFavoriteCount(); }
function updateFavoriteCount() { $("#favCount").textContent = favorites().length; }
function toast(message) {
  const el = $("#toast"); el.textContent = message; el.classList.remove("opacity-0");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.add("opacity-0"), 2200);
}
function categoryFromProject(project) {
  const text = `${project.title || ""} ${project.description || ""} ${(project.categories || []).join(" ")}`.toLowerCase();
  if (/shader/.test(text)) return "shader";
  if (/texture|resource.?pack|resourcepack/.test(text)) return "texture";
  if (/map|world|adventure|survival/.test(text)) return "map";
  return "addon";
}
function categoryLabel(category) {
  return ({ addon:"Add-on", texture:"Texturas", shader:"Shaders", map:"Mapas" })[category] || "Contenido";
}
function sourceSearchLinks(query, category) {
  const q = encodeURIComponent(query || "Minecraft Bedrock");
  const suffix = category === "all" ? "Minecraft Bedrock" : `Minecraft Bedrock ${categoryLabel(category)}`;
  const search = encodeURIComponent(query ? `${query} ${suffix}` : suffix);
  return [
    { name:"MCPEDL", url:`https://mcpedl.com/?s=${q}`, description:"Explora add-ons, texturas y mapas de Bedrock." },
    { name:"Planet Minecraft", url:`https://www.planetminecraft.com/resources/projects/?keywords=${search}`, description:"Busca proyectos y recursos; revisa el filtro Bedrock en el sitio." }
  ];
}

async function fetchWithFallback(url) {
  try {
    const response = await fetch(url, { headers:{ "Accept":"application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (directError) {
    // AllOrigins puede estar bloqueado o no disponible en ciertos WebViews. No se considera garantizado.
    const proxied = ALLORIGINS + encodeURIComponent(url);
    const response = await fetch(proxied);
    if (!response.ok) throw directError;
    return await response.json();
  }
}

async function searchModrinth(query, category) {
  // Modrinth no ofrece un filtro oficial de contenido Bedrock; esta búsqueda es orientativa.
  // El resultado se marca como no verificado para evitar prometer compatibilidad.
  const terms = [query, "bedrock", category === "all" ? "" : categoryTerms[category]].filter(Boolean).join(" ");
  const facets = encodeURIComponent(JSON.stringify([["project_type:mod"], ["project_type:resourcepack"], ["project_type:shader"]]));
  const url = `${MODRINTH_API}/search?query=${encodeURIComponent(terms || "bedrock")}&facets=${facets}&limit=30&index=relevance`;
  const data = await fetchWithFallback(url);
  return (data.hits || []).map(p => ({
    id:`modrinth:${p.project_id}`, source:"Modrinth", title:p.title, description:p.description,
    image:p.icon_url, url:`https://modrinth.com/project/${p.slug}`,
    downloads:p.downloads || 0, updated:p.date_modified || "", category:categoryFromProject(p),
    projectId:p.project_id, verifiedBedrock:false
  }));
}

async function getLatestDownload(projectId) {
  const url = `${MODRINTH_API}/project/${encodeURIComponent(projectId)}/version`;
  const versions = await fetchWithFallback(url);
  for (const version of versions || []) {
    const file = (version.files || []).find(f => f.primary) || (version.files || [])[0];
    if (file && file.url) return { url:file.url, filename:file.filename, version:version.version_number };
  }
  return null;
}

function externalCards(query, category) {
  return sourceSearchLinks(query, category).map((item, i) => ({
    id:`external:${i}:${category}:${query}`, source:item.name, title:`Buscar en ${item.name}`,
    description:item.description, image:"", url:item.url, downloads:0, updated:"",
    category:category === "all" ? "addon" : category, external:true
  }));
}

function render(items) {
  const favIds = new Set(favorites().map(x => x.id));
  if (!items.length) {
    resultsEl.innerHTML = `<div class="card rounded-2xl p-7 text-center sm:col-span-2 xl:col-span-3"><div class="text-4xl mb-3">🔎</div><h3 class="font-bold">No encontramos resultados</h3><p class="text-sm text-emerald-100/50 mt-1">Prueba otra palabra o consulta las fuentes externas.</p></div>`;
    return;
  }
  resultsEl.innerHTML = items.map(item => {
    const isFav = favIds.has(item.id);
    const image = item.image ? `<img src="${escapeHTML(item.image)}" alt="" loading="lazy" class="w-full h-40 object-cover bg-[#07130f]" onerror="this.style.display='none'">` : `<div class="h-40 flex items-center justify-center text-5xl bg-emerald-950/40">🌐</div>`;
    const description = item.external ? item.description : `${item.description || "Sin descripción."}${item.verifiedBedrock ? "" : " · Compatibilidad Bedrock no verificada."}`;
    const downloadButton = item.external
      ? `<a class="touch flex-1 text-center rounded-xl bg-emerald-500 text-emerald-950 font-bold px-3 py-3" href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer">Abrir búsqueda ↗</a>`
      : `<button class="touch flex-1 rounded-xl bg-emerald-500 text-emerald-950 font-bold px-3 py-3" data-download="${escapeHTML(item.projectId)}">Ver archivos ↓</button>`;
    return `<article class="card rounded-2xl overflow-hidden flex flex-col min-w-0">
      ${image}<div class="p-4 flex flex-col flex-1">
        <div class="flex items-center justify-between gap-2 mb-2"><span class="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">${escapeHTML(item.source)} · ${escapeHTML(categoryLabel(item.category))}</span><button class="touch w-10 rounded-lg border border-emerald-900 text-xl ${isFav ? "text-emerald-300" : "text-emerald-100/50"}" aria-label="${isFav ? "Quitar de favoritos" : "Añadir a favoritos"}" data-favorite="${escapeHTML(item.id)}">${isFav ? "♥" : "♡"}</button></div>
        <h3 class="font-extrabold text-lg leading-snug mb-2">${escapeHTML(item.title)}</h3>
        <p class="text-sm text-emerald-100/55 leading-relaxed line-clamp-3 mb-4">${escapeHTML(description)}</p>
        <div class="mt-auto flex gap-2">${downloadButton}<a class="touch px-4 rounded-xl border border-emerald-800 flex items-center justify-center" href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Ver página del proyecto">↗</a></div>
        ${!item.external ? `<p class="text-[11px] text-emerald-100/35 mt-2">Descargas: ${Number(item.downloads).toLocaleString("es-MX")} · Comprueba el formato y la versión.</p>` : ""}
      </div></article>`;
  }).join("");
}

function applyView() {
  let items = [...state.results];
  if (state.favoritesOnly) {
    const ids = new Set(favorites().map(x => x.id));
    items = favorites().filter(x => ids.has(x.id));
  }
  if (state.category !== "all") items = items.filter(x => x.category === state.category);
  const sort = $("#sortSelect").value;
  if (sort === "downloads") items.sort((a,b) => (b.downloads || 0) - (a.downloads || 0));
  if (sort === "updated") items.sort((a,b) => (b.updated || "").localeCompare(a.updated || ""));
  render(items);
  $("#sectionTitle").textContent = state.favoritesOnly ? "Tus favoritos" : "Resultados";
}

async function runSearch() {
  state.query = $("#searchInput").value.trim();
  state.favoritesOnly = false;
  $("#favoritesToggle").setAttribute("aria-pressed", "false");
  $("#status").textContent = "Buscando en Modrinth y preparando accesos externos…";
  resultsEl.innerHTML = Array.from({length:6}, () => `<div class="card rounded-2xl h-72 skeleton"></div>`).join("");
  const external = externalCards(state.query, state.category);
  let mods = [];
  try { mods = await searchModrinth(state.query, state.category); }
  catch (error) { console.warn("Modrinth no disponible:", error); }
  if (state.category !== "all") mods = mods.filter(x => x.category === state.category);
  state.results = [...mods, ...external];
  $("#status").textContent = `${mods.length} resultado(s) de Modrinth · ${external.length} accesos externos.`;
  applyView();
}

resultsEl.addEventListener("click", async (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    const id = favoriteButton.dataset.favorite;
    const current = favorites();
    const exists = current.some(x => x.id === id);
    const item = state.results.find(x => x.id === id);
    saveFavorites(exists ? current.filter(x => x.id !== id) : item ? [...current, item] : current);
    toast(exists ? "Eliminado de favoritos" : "Guardado en favoritos");
    applyView();
    return;
  }
  const downloadButton = event.target.closest("[data-download]");
  if (downloadButton) {
    const projectId = downloadButton.dataset.download;
    downloadButton.disabled = true; downloadButton.textContent = "Cargando…";
    try {
      const file = await getLatestDownload(projectId);
      if (!file) throw new Error("No hay archivos disponibles");
      const a = document.createElement("a"); a.href = file.url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.click();
      toast(`Abriendo ${file.filename || "archivo"} · verifica que sea Bedrock`);
    } catch (error) { toast("No se pudo obtener el archivo. Abre la página del proyecto."); }
    finally { downloadButton.disabled = false; downloadButton.textContent = "Ver archivos ↓"; }
  }
});

$("#searchForm").addEventListener("submit", e => { e.preventDefault(); runSearch(); });
document.querySelectorAll("[data-category]").forEach(button => button.addEventListener("click", () => {
  state.category = button.dataset.category;
  document.querySelectorAll("[data-category]").forEach(b => b.setAttribute("aria-pressed", String(b === button)));
  runSearch();
}));
$("#favoritesToggle").addEventListener("click", () => {
  state.favoritesOnly = !state.favoritesOnly;
  $("#favoritesToggle").setAttribute("aria-pressed", String(state.favoritesOnly));
  $("#status").textContent = state.favoritesOnly ? `${favorites().length} elemento(s) guardados localmente.` : "Mostrando resultados de búsqueda.";
  applyView();
});
$("#sortSelect").addEventListener("change", applyView);
updateFavoriteCount();

// La búsqueda externa se ofrece desde el inicio para que la pantalla nunca quede vacía.
state.results = externalCards("", "all");
render(state.results);

// Registro opcional del service worker (si el entorno sirve la app desde HTTPS/localhost).
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
