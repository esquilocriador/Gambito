// Service worker do Gambito. Para forçar atualização nos aparelhos, aumente a versão.
const V='gambito-v9';
const SHELL=['./','index.html','manifest.json','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png'];
// Só estes hosts são guardados (bibliotecas, fontes e Stockfish). APIs do Lichess e chess.com nunca passam pelo cache.
const CDN=['cdnjs.cloudflare.com','cdn.jsdelivr.net','unpkg.com','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url),mine=u.origin===location.origin;
  if(!mine&&!CDN.includes(u.hostname))return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:mine});
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit} // abre na hora e atualiza em segundo plano
    return (await net)||(r.mode==='navigate'?c.match('index.html'):Response.error());
  }));
});
