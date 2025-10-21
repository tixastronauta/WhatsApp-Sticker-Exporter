// CONFIG
const stickerSelector = '._ajxb._ajxj._ajxd, img[alt="Sticker"]'; // IMPORTANT: might change over time, you might have to adjust
const filenamePrefix = Date.now();
const fileExt = '.webp'; // most WA stickers are webp
const delayMs = 200; // small delay between saves

// UTIL
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function unique(arr) { return [...new Set(arr)]; }

// COLLECT
const nodes = Array.from(document.querySelectorAll(stickerSelector));
let urls = nodes
  .map(n => (n.currentSrc || n.src || '').trim())
  .filter(u => u && !u.startsWith('data:,'));

urls = unique(urls);

console.log(`Found ${urls.length} sticker URLs. Starting sequential download...`);

// SEQUENTIAL DOWNLOADER
(async () => {
  let i = 0;
  for (const url of urls) {
    i++;
    try {
      // Some sticker nodes point to blob: URLs already; if not, fetch and create our own blob URL
      let objectUrl = null;

      if (url.startsWith('blob:')) {
        objectUrl = url; // can use directly
      } else {
        const resp = await fetch(url, { credentials: 'include' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();
        objectUrl = URL.createObjectURL(blob);
      }

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${filenamePrefix}-${String(i).padStart(3, '0')}${fileExt}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // If we created the object URL, revoke after a tick
      if (!url.startsWith('blob:')) {
        await sleep(50);
        URL.revokeObjectURL(objectUrl);
      }

      console.log(`Downloaded ${i}/${urls.length}`);
      await sleep(delayMs);
    } catch (err) {
      console.warn(`Failed ${i}/${urls.length}: ${url}`, err);
      await sleep(delayMs);
    }
  }
  console.log('Done.');
})();