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

let currentType = 'all';
const fallbackImg = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400';

const bedrockCatalog = [
    {
        id: 'br-1',
        title: 'Bare Bones Bedrock Pack',
        type: 'texture',
        author: 'BedrockCommunity',
        version: 'Bedrock 1.21+',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
        description: 'Textura limpia y ligera para Bedrock, pensada para mantener buen rendimiento en dispositivos moviles y tablets.',
        fileLabel: 'BareBones-Bedrock.mcpack'
    },
    {
        id: 'br-2',
        title: 'Newb RenderDragon Shader',
        type: 'shader',
        author: 'DevShaderBR',
        version: 'RenderDragon Bedrock',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
        description: 'Iluminacion suave, reflejos en el agua y cielos ajustados para Minecraft Bedrock.',
        fileLabel: 'Newb-Bedrock-Shader.mcpack'
    },
    {
        id: 'br-3',
        title: 'Actions and Animations Add-on',
        type: 'addon',
        author: 'KratosMC_Lab',
        version: 'Bedrock 1.21+',
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400',
        description: 'Nuevas animaciones de movimiento y detalles visuales para mundos de supervivencia en Bedrock.',
        fileLabel: 'Actions-Bedrock.mcaddon'
    },
    {
        id: 'br-4',
        title: 'Cave Horror and Bosses Add-on',
        type: 'addon',
        author: 'NightmareBE',
        version: 'Bedrock 1.21+',
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400',
        description: 'Criaturas hostiles en cuevas profundas y encuentros de terror para partidas en Bedrock.',
        fileLabel: 'Horror-Bosses-BE.mcaddon'
    },
    {
        id: 'br-5',
        title: 'Skyblock Survival Island',
        type: 'map',
        author: 'MapMakerBR',
        version: 'Bedrock 1.21+',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
        description: 'Mapa clasico de supervivencia en islas flotantes adaptado para Minecraft Bedrock.',
        fileLabel: 'Skyblock-Bedrock.mctemplate'
    },
    {
        id: 'br-6',
        title: 'Low-Spec FPS Boost Pack',
        type: 'texture',
        author: 'OptiBedrock',
        version: 'Bedrock 1.21+',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
        description: 'Reduce efectos pesados y carga grafica para mantener FPS estables y baja latencia.',
        fileLabel: 'FPS-Boost-BE.mcpack'
    }
];

function searchBedrockMods() {
    const query = searchInput.value.trim().toLowerCase();
    loading.classList.remove('hidden');
    resultsContainer.innerHTML = '';

    setTimeout(() => {
        const filtered = bedrockCatalog.filter(item => {
            const matchesType = currentType === 'all' || item.type === currentType;
            const matchesQuery =
                !query ||
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.type.toLowerCase().includes(query);
            return matchesType && matchesQuery;
        });

        loading.classList.add('hidden');
        renderResults(filtered);
    }, 150);
}

function renderResults(items) {
    resultsContainer.innerHTML = '';
    if (items.length === 0) {
        resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#888;">No se encontraron resultados de Bedrock.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'mod-card';
        const imgUrl = item.image || fallbackImg;

        card.innerHTML = `
            <img src="${imgUrl}" onerror="this.src='${fallbackImg}'" alt="${item.title}">
            <div class="mod-info">
                <div>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
                <span class="mod-badge">BEDROCK • ${item.type}</span>
            </div>
        `;
        card.addEventListener('click', () => openDetails(item));
        resultsContainer.appendChild(card);
    });
}

function openDetails(item) {
    modalImage.src = item.image || fallbackImg;
    modalTitle.textContent = item.title;
    modalMeta.textContent = `Autor: ${item.author} • ${item.version}`;
    modalDescription.textContent = item.description;

    const blob = new Blob(
        [
            `Bedrock Hub Resource\nNombre: ${item.title}\nTipo: ${item.type}\nVersion: ${item.version}\nArchivo: ${item.fileLabel}\n`
        ],
        { type: 'text/plain;charset=utf-8' }
    );
    const blobUrl = URL.createObjectURL(blob);

    modalDownloadBtn.href = blobUrl;
    modalDownloadBtn.setAttribute('download', `${item.id}-${item.fileLabel}.txt`);
    modalDownloadBtn.textContent = `Descargar (${item.fileLabel})`;
    modal.classList.remove('hidden');
}

closeModal.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

searchBtn.addEventListener('click', searchBedrockMods);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBedrockMods();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.getAttribute('data-type');
        searchBedrockMods();
    });
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}

searchBedrockMods();
