const CACHE='linc-site-v3';
const ASSETS=['./','./index.html','./staff.html','./signage02.html','./payload.json','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('dome-live-')||k.startsWith('linc-site-'))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 if(!ASSETS.some(p=>new URL(p,self.location.href).pathname===new URL(event.request.url).pathname))return;
 event.respondWith(fetch(event.request).then(response=>{
  if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,copy)));}
  return response;
 }).catch(async()=>{
  const saved=await caches.match(event.request);
  if(saved)return saved;
  if(event.request.mode==='navigate'){const u=new URL(event.request.url);u.search='';return (await caches.match(u.href))||(await caches.match('./index.html'));}
  return Response.error();
 }));
});
