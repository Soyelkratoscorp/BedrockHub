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
        id: 'addon-1',
        title: 'Actions and Stuff Bedrock',
        type: 'addon',
        author: 'BedrockStudio',
        version: 'Minecraft Bedrock 1.21+',
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400',
        description: 'Add-on para Bedrock con animaciones fluidas, detalles de movimiento y mejoras visuales sin salir del estilo del juego.',
        fileLabel: 'Actions-Stuff-Bedrock.mcaddon'
    },
    {
        id: 'addon-2',
        title: 'Cave Horror and Bosses BE',
        type: 'addon',
        author: 'KratosMC_Lab',
        version: 'Minecraft Bedrock 1.21+',
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400',
        description: 'Criaturas hostiles en cuevas oscuras y jefes especiales pensados para supervivencia y terror en Bedrock.',
        fileLabel: 'Cave-Horror-Bosses-BE.mcaddon'
    },
    {
        id: 'addon-3',
        title: 'Furniture and Decor BE',
        type: 'addon',
        author: 'CraftBuildersBE',
        version: 'Minecraft Bedrock 1.21+',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
        description: 'Muebles, lamparas y bloques decorativos compatibles con Minecraft Bedrock para casas y bases.',
        fileLabel: 'Furniture-Decor-BE.mcaddon'
    },
    {
        id: 'tex-1',
        title: 'Bare Bones Bedrock Pack',
        type: 'texture',
        author: 'BedrockCommunity',
        version: 'Minecraft Bedrock 1.21+',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
        description: 'Textura limpia y colorida para Bedrock, ideal para mantener buen rendimiento en tablets y celulares.',
        fileLabel: 'Bare-Bones-Bedrock.mcpack'
    },
    {
        id: 'tex-2',
        title: 'Low-Spec FPS Boost Bedrock',
        type: 'texture',
        author: 'OptiBedrock',
        version: 'Minecraft Bedrock 1.21+',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
        description: 'Pack optimizado para Bedrock enfocado en subir FPS, reducir carga grafica y mejorar la fluidez tactil.',
        fileLabel: 'FPS-Boost-Bedrock.mcpack'
    },
    {
        id: 'shd-1',
        title: 'Newb X Bedrock Shader',
        type: 'shader',
        author: 'NewbBedrockTeam',
        version: 'Bedrock RenderDragon',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
        description: 'Shader exclusivo para Minecraft Bedrock con reflejos en agua, iluminacion suave y bajo consumo en moviles.',
        fileLabel: 'NewbX-Bedrock.mcpack'
    },
    {
        id: 'shd-2',
        title: 'Vanilla RTX Vibrant Bedrock',
        type: 'shader',
        author: 'BedrockShaders',
        version: 'Bedrock 1.21+',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
        description: 'Sombras suaves, mejor contraste y cielo renovado exclusivamente para ediciones Bedrock.',
        fileLabel: 'Vibrant-Bedrock-Shader.mcpack'
    },
    {
        id: 'map-1',
        title: 'One Block Survival Bedrock',
        type: 'map',
        author: 'MapsBedrock',
        version: 'Minecraft Bedrock 1.21+',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
        description: 'Empieza en un solo bloque flotante en Bedrock y desbloquea fases y recursos conforme avanzas.',
        fileLabel: 'OneBlock-Bedrock.mctemplate'
    },
    {
        id: 'map-2',
        title: 'Horror Mansion Escape BE',
        type: 'map',
        author: 'NightmareBE',
        version: 'Minecraft Bedrock 1.21+',
        image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
        description: 'Mapa de misterio y terror para Minecraft Bedrock con rutas, pistas y eventos dentro del mundo.',
        fileLabel: 'Horror-Mansion-BE.mctemplate'
    }
];

function runFilter() {
    const query = searchInput.value.trim().toLowerCase();
    loading.classList.remove('hidden');
    resultsContainer.innerHTML = '';

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
}

function renderResults(items) {
    resultsContainer.innerHTML = '';

    if (!items || items.length === 0) {
        resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#888; padding: 20px;">No hay resultados para esa busqueda o filtro en Bedrock.</p>';
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
                <span class="mod-badge">BEDROCK - ${item.type}</span>
            </div>
        `;
        card.addEventListener('click', () => openDetails(item));
        resultsContainer.appendChild(card);
    });
}

function openDetails(item) {
    modalImage.src = item.image || fallbackImg;
    modalTitle.textContent = item.title;
    modalMeta.textContent = `${item.author} - ${item.version}`;
    modalDescription.textContent = item.description;

    const textContent = [
        'Bedrock Hub',
        'Recurso: ' + item.title,
        'Categoria: ' + item.type,
        'Version: ' + item.version,
        'Archivo: ' + item.fileLabel
    ].join('\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
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

searchBtn.addEventListener('click', runFilter);
searchInput.addEventListener('input', runFilter);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') runFilter();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.getAttribute('data-type');
        runFilter();
    });
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=bedrock4').catch(() => {});
}

runFilter();
