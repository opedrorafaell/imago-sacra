#!/usr/bin/env node
/**
 * scripts/generate-gallery.js
 *
 * Busca os assets da pasta portfolio/ordenacao via Cloudinary Admin API,
 * gera os <figure class="gallery-item"> estáticos e injeta-os dentro da
 * <main class="gallery-grid" id="gallery"> do arquivo portfolio/ordenacao.html.
 *
 * Uso:
 *   node scripts/generate-gallery.js
 *
 * Variáveis de ambiente necessárias (ou edite as constantes abaixo):
 *   CLOUDINARY_CLOUD_NAME   — ex: dsxsmrego
 *   CLOUDINARY_API_KEY      — ex: 566436889967297
 *   CLOUDINARY_API_SECRET   — ex: W775YlKwm-a_Km63JtjMccWZP7c
 */

const https   = require('https');
const fs      = require('fs');
const path    = require('path');

// ── Credenciais ─────────────────────────────────────────────────────────────
const CLOUD  = process.env.CLOUDINARY_CLOUD_NAME  || 'dsxsmrego';
const KEY    = process.env.CLOUDINARY_API_KEY     || '566436889967297';
const SECRET = process.env.CLOUDINARY_API_SECRET  || 'W775YlKwm-a_Km63JtjMccWZP7c';
const FOLDER = 'portfolio/ordenacao';
const HTML_FILE = path.resolve(__dirname, '../portfolio/ordenacao.html');

// ── Helpers ──────────────────────────────────────────────────────────────────
function cloudinaryRequest(path) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${KEY}:${SECRET}`).toString('base64');
    const options = {
      hostname: 'api.cloudinary.com',
      path,
      method: 'GET',
      headers: { Authorization: `Basic ${auth}` },
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`JSON parse error: ${body}`)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function listAllResources() {
  let resources = [];
  let nextCursor = null;

  do {
    const qs = new URLSearchParams({
      type: 'upload',
      prefix: FOLDER,
      max_results: '500',
    });
    if (nextCursor) qs.set('next_cursor', nextCursor);

    const data = await cloudinaryRequest(`/v1_1/${CLOUD}/resources/image?${qs}`);

    if (data.error) throw new Error(`Cloudinary API error: ${data.error.message}`);

    resources = resources.concat(data.resources || []);
    nextCursor = data.next_cursor || null;
  } while (nextCursor);

  return resources;
}

function buildImageUrl(publicId) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/w_1200,q_auto,f_auto/${publicId}`;
}

function captionFromResource(resource) {
  // Usa context.custom.caption se disponível, senão deriva do public_id
  if (resource.context && resource.context.custom && resource.context.custom.caption) {
    return resource.context.custom.caption;
  }
  return resource.public_id
    .split('/').pop()
    .replace(/[-_]/g, ' ')
    .replace(/\.\w+$/, '');
}

function buildFigureHtml(resource, index) {
  const caption = captionFromResource(resource);
  const url     = buildImageUrl(resource.public_id);
  const loading = index === 0 ? 'eager' : 'lazy';
  const priority = index === 0 ? '\n      fetchpriority="high"' : '';
  // Usa aspect_ratio do Cloudinary se disponível, senão assume 3:2 (landscape)
  const isPortrait = resource.width && resource.height && resource.height > resource.width;
  const figClass   = isPortrait ? 'gallery-item portrait' : 'gallery-item';
  const w = isPortrait ? 800  : 1200;
  const h = isPortrait ? 1200 : 800;

  return `
  <figure class="${figClass}">
    <img
      src="${url}"
      alt="${caption} — Ordenação Presbiteral"
      loading="${loading}"${priority}
      width="${w}"
      height="${h}"
      data-lightbox="ordenacao"
      data-caption="${caption}"
    />
    <div class="gallery-item-overlay">
      <span class="gallery-item-caption">${caption}</span>
    </div>
  </figure>`;
}

function injectIntoHtml(htmlContent, figuresHtml) {
  // Substitui tudo entre as tags de abertura e fechamento da gallery-grid
  const open  = /<main\s+class="gallery-grid"\s+id="gallery">/;
  const close = /<\/main>/;

  const openMatch  = open.exec(htmlContent);
  const closeMatch = close.exec(htmlContent);

  if (!openMatch || !closeMatch) {
    throw new Error('Não encontrei <main class="gallery-grid" id="gallery"> no HTML.');
  }

  const before = htmlContent.slice(0, openMatch.index + openMatch[0].length);
  const after  = htmlContent.slice(closeMatch.index);

  return before + '\n' + figuresHtml + '\n' + after;
}

function removeLoadGalleryScript(htmlContent) {
  // Remove o bloco /* ── CLOUDINARY GALLERY ── */ e a função loadGallery()
  // Estratégia: remove tudo entre o marcador de início e loadGallery(); (inclusive)
  const start = /\/\* ── CLOUDINARY GALLERY[^*]*\*\/[\s\S]*?loadGallery\(\);\n/;
  return htmlContent.replace(start, '');
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`Buscando assets em "${FOLDER}"...`);

  const resources = await listAllResources();
  console.log(`${resources.length} asset(s) encontrado(s).`);

  if (resources.length === 0) {
    console.error('Nenhum asset retornado. Verifique o nome da pasta no Cloudinary.');
    process.exit(1);
  }

  // Ordena por public_id para ordem consistente
  resources.sort((a, b) => a.public_id.localeCompare(b.public_id));

  const figuresHtml = resources.map((r, i) => buildFigureHtml(r, i)).join('\n');

  let html = fs.readFileSync(HTML_FILE, 'utf8');
  html = injectIntoHtml(html, figuresHtml);
  html = removeLoadGalleryScript(html);

  // Remove também o comentário do pré-requisito Cloudinary (bloco <!-- CLOUDINARY … -->)
  html = html.replace(/<!--\s*\n\s*CLOUDINARY[\s\S]*?-->\n/m, '');

  fs.writeFileSync(HTML_FILE, html, 'utf8');
  console.log(`HTML estático gerado com sucesso em ${HTML_FILE}`);
  console.log(`Total de figuras: ${resources.length}`);
})();
