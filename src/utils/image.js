// Prepara uma foto para guardar no banco de dados.
// Redesenhar num canvas também apaga os metadados da foto (como a localização GPS).

const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Não consegui abrir essa imagem. Tente uma foto em JPG ou PNG.')); };
  img.src = url;
});

function encode(img, maxSide, quality) {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, w, h); // PNG transparente vira fundo branco
  ctx.drawImage(img, 0, 0, w, h);
  return { data: c.toDataURL('image/jpeg', quality), w, h };
}

// Devolve a foto (até ~maxBytes) e uma miniatura pequena para a grade da galeria.
export async function preparePhoto(file, { maxSide = 1280, maxBytes = 700000 } = {}) {
  if (!file.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem.');
  const img = await loadImage(file);
  let side = maxSide, quality = 0.82, full = encode(img, side, quality);
  while (full.data.length > maxBytes && (quality > 0.45 || side > 640)) {
    if (quality > 0.45) quality -= 0.1; else side = Math.round(side * 0.8);
    full = encode(img, side, quality);
  }
  if (full.data.length > maxBytes) throw new Error('Essa foto ficou grande demais mesmo comprimida. Tente outra.');
  const thumb = encode(img, 320, 0.7);
  return { full: full.data, thumb: thumb.data, w: full.w, h: full.h };
}
