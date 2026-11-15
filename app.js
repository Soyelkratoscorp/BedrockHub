const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('resultsContainer');
const loading = document.getElementById('loading');
const filterBtns = document.querySelectorAll('.filter-btn');

const modal = document.getElementById('detailModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalMeta = document.getElementById('modalMeta');
const modalDescription = document.getElementById('modalDescription');
const modalDownloadBtn = document.getElementById('modalDownloadBtn');
const closeModal = document.getElementById('closeModal');

let currentType = '';
const fallbackImg = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400';

async function searchMods(query = '') {
    loading.classList.remove('hidden');
    resultsContainer.innerHTML = '';

    try {
        let facets = [];
        if (currentType) {
            facets.push([`project_type:${currentType}`]);
        }
        
        const facetParam = facets.length > 0 ? `&facets=${encodeURIComponent(JSON.stringify(facets))}` : '';
        const url = `https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&limit=20${facetParam}`;

        const response = await fetch(url);
        const data = await response.json();

        loading.classList.add('hidden');
        renderResults(data.hits || []);
    } catch (error) {
        loading.classList.add('hidden');
        resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#f44336;">Error al conectar. Revisa tu internet.</p>';
    }
}

function renderResults(items) {
    resultsContainer.innerHTML = '';
    if (items.length === 0) {
        resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#888;">No se encontraron resultados.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'mod-card';
        const imgUrl = item.icon_url || fallbackImg;

        card.innerHTML = `
            <img src="${imgUrl}" onerror="this.src='${fallbackImg}'" alt="${item.title}">
            <div class="mod-info">
                <div>
                    <h3>${item.title}</h3>
                    <p>${item.description || 'Sin descripción disponible.'}</p>
                </div>
                <span class="mod-badge">${item.project_type} • ⬇️ ${formatDownloads(item.downloads)}</span>
            </div>
        `;
        card.addEventListener('click', () => openDetails(item));
        resultsContainer.appendChild(card);
    });
}

async function openDetails(item) {
    modalImage.src = item.icon_url || fallbackImg;
    modalTitle.textContent = item.title;
    modalMeta.textContent = `Autor: ${item.author} • Descargas: ${formatDownloads(item.downloads)}`;
    modalDescription.textContent = item.description || 'Sin descripción detallada.';
    
    modalDownloadBtn.textContent = 'Buscando archivo directo... ⏳';
    modalDownloadBtn.classList.add('disabled');
    modalDownloadBtn.removeAttribute('href');
    
    modal.classList.remove('hidden');

    try {
        // Obtiene el archivo directo desde la API sin abrir páginas externas
        const res = await fetch(`https://api.modrinth.com/v2/project/${item.project_id}/version`);
        const versions = await res.json();

        if (versions && versions.length > 0 && versions[0].files && versions[0].files.length > 0) {
            const directFile = versions[0].files[0];
            modalDownloadBtn.href = directFile.url;
            modalDownloadBtn.textContent = `⬇️ Descargar Directo (${directFile.filename})`;
            modalDownloadBtn.classList.remove('disabled');
        } else {
            modalDownloadBtn.textContent = 'Archivo directo no disponible';
        }
    } catch (err) {
        modalDownloadBtn.textContent = 'Error al obtener enlace directo';
    }
}

function formatDownloads(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

closeModal.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

searchBtn.addEventListener('click', () => searchMods(searchInput.value.trim()));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchMods(searchInput.value.trim());
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.getAttribute('data-type');
        searchMods(searchInput.value.trim());
    });
});

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// Carga inicial popular
searchMods('bedrock');
