// Ready-made, fully working starter apps. Loaded instantly into /index.html; prompts can then edit them with AI.
const head = (title: string) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&display=swap" rel="stylesheet"/><style>body{font-family:Manrope,sans-serif}</style></head>`;

const dashboard = `${head("Pulse Analytics")}
<body class="bg-slate-50 text-slate-800">
<div class="flex min-h-screen">
  <aside class="hidden md:flex w-56 flex-col gap-1 bg-slate-900 p-4 text-slate-300">
    <div class="mb-6 text-lg font-extrabold text-white">◆ Pulse</div>
    <a class="nav rounded-lg bg-indigo-600 px-3 py-2 text-white" href="#">Overview</a>
    <a class="nav rounded-lg px-3 py-2 hover:bg-slate-800" href="#">Customers</a>
    <a class="nav rounded-lg px-3 py-2 hover:bg-slate-800" href="#">Revenue</a>
    <a class="nav rounded-lg px-3 py-2 hover:bg-slate-800" href="#">Settings</a>
  </aside>
  <main class="flex-1 p-4 md:p-8">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div><h1 class="text-2xl font-extrabold">Overview</h1><p class="text-sm text-slate-500">Your SaaS at a glance</p></div>
      <div class="flex rounded-lg bg-white p-1 shadow-sm" id="ranges">
        <button data-r="7" class="rounded-md px-3 py-1 text-sm">7d</button>
        <button data-r="30" class="rounded-md px-3 py-1 text-sm">30d</button>
        <button data-r="90" class="rounded-md px-3 py-1 text-sm">90d</button>
      </div>
    </div>
    <div id="kpis" class="grid grid-cols-2 gap-4 lg:grid-cols-4"></div>
    <div class="mt-6 rounded-2xl bg-white p-5 shadow-sm">
      <div class="mb-4 flex justify-between"><h2 class="font-semibold">Monthly recurring revenue</h2><span id="total" class="text-sm text-slate-500"></span></div>
      <div id="chart" class="flex h-48 items-end gap-1"></div>
    </div>
    <div class="mt-6 rounded-2xl bg-white p-5 shadow-sm">
      <div class="mb-3 flex items-center justify-between"><h2 class="font-semibold">Recent signups</h2><input id="q" placeholder="Search…" class="rounded-lg border px-3 py-1.5 text-sm"/></div>
      <table class="w-full text-sm"><thead class="text-left text-slate-400"><tr><th class="py-2">Customer</th><th>Plan</th><th class="text-right">MRR</th></tr></thead><tbody id="rows"></tbody></table>
    </div>
  </main>
</div>
<script>
const people=[["Acme Corp","Enterprise",1200],["Lumen Labs","Pro",240],["Northwind","Pro",240],["Bloom Studio","Starter",49],["Vertex AI","Enterprise",1800],["Kite & Co","Starter",49],["Orbit HQ","Pro",240]];
let range=30;
function rnd(seed){return()=>{seed=(seed*9301+49297)%233280;return seed/233280}}
function render(){
  document.querySelectorAll('#ranges button').forEach(b=>b.className='rounded-md px-3 py-1 text-sm '+(+b.dataset.r===range?'bg-indigo-600 text-white':'text-slate-500'));
  const r=rnd(range), k=range/30;
  const kpis=[["MRR","$"+Math.round(48200*(0.8+k*0.1)).toLocaleString(),"+12.4%"],["Active users",Math.round(3120*k+800).toLocaleString(),"+8.1%"],["Churn",(2.9-k*0.3).toFixed(1)+"%","-0.4%"],["NPS",Math.round(52+k*3),"+3"]];
  document.getElementById('kpis').innerHTML=kpis.map(([l,v,d])=>'<div class="rounded-2xl bg-white p-4 shadow-sm"><p class="text-xs text-slate-500">'+l+'</p><p class="mt-1 text-2xl font-extrabold">'+v+'</p><p class="text-xs '+(d[0]=='-'&&l!=='Churn'?'text-rose-500':'text-emerald-600')+'">'+d+'</p></div>').join('');
  const n=range===7?7:range===30?15:24; let sum=0;
  document.getElementById('chart').innerHTML=Array.from({length:n},(_,i)=>{const h=30+i*(60/n)+r()*20;sum+=h;return '<div title="'+Math.round(h*100)+'" class="flex-1 rounded-t bg-indigo-500 hover:bg-indigo-400 transition" style="height:'+h+'%"></div>'}).join('');
  document.getElementById('total').textContent='$'+Math.round(sum*100).toLocaleString()+' total';
  const q=document.getElementById('q').value.toLowerCase();
  document.getElementById('rows').innerHTML=people.filter(p=>p[0].toLowerCase().includes(q)).map(p=>'<tr class="border-t"><td class="py-2 font-semibold">'+p[0]+'</td><td><span class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">'+p[1]+'</span></td><td class="text-right">$'+p[2]+'</td></tr>').join('');
}
document.getElementById('ranges').onclick=e=>{if(e.target.dataset.r){range=+e.target.dataset.r;render()}};
document.getElementById('q').oninput=render;
render();
</script></body></html>`;

const store = `${head("Nova Store")}
<body class="bg-stone-50 text-stone-800">
<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-white/90 px-4 py-3 backdrop-blur md:px-8">
  <div class="text-xl font-extrabold">nova<span class="text-orange-500">.</span></div>
  <button id="cartBtn" class="relative rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white">Cart <span id="count" class="ml-1 rounded-full bg-orange-500 px-2">0</span></button>
</header>
<section class="px-4 py-10 text-center md:px-8"><h1 class="text-3xl font-extrabold md:text-5xl">Objects for slow living</h1><p class="mt-2 text-stone-500">Handmade goods, shipped carbon-neutral.</p></section>
<div id="filters" class="flex flex-wrap justify-center gap-2 px-4"></div>
<main id="grid" class="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 md:p-8 lg:grid-cols-4"></main>
<div id="drawer" class="fixed inset-0 z-20 hidden"><div id="shade" class="absolute inset-0 bg-black/40"></div>
  <div class="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white p-5">
    <div class="mb-4 flex justify-between"><h2 class="text-lg font-extrabold">Your cart</h2><button id="close">✕</button></div>
    <div id="items" class="flex-1 space-y-3 overflow-y-auto"></div>
    <div class="border-t pt-4"><div class="flex justify-between font-semibold"><span>Total</span><span id="sum">$0</span></div>
    <button id="checkout" class="mt-3 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white">Checkout</button></div>
  </div></div>
<script>
const products=[
 {id:1,n:"Ceramic Mug",p:28,c:"Kitchen",img:"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500"},
 {id:2,n:"Linen Throw",p:89,c:"Home",img:"https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=500"},
 {id:3,n:"Oak Board",p:45,c:"Kitchen",img:"https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=500"},
 {id:4,n:"Soy Candle",p:22,c:"Home",img:"https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=500"},
 {id:5,n:"Leather Tote",p:140,c:"Wear",img:"https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500"},
 {id:6,n:"Wool Beanie",p:35,c:"Wear",img:"https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500"},
 {id:7,n:"Glass Vase",p:54,c:"Home",img:"https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500"},
 {id:8,n:"Pour-over Set",p:68,c:"Kitchen",img:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500"}];
let cat="All", cart={};
const $=id=>document.getElementById(id);
function render(){
  $('filters').innerHTML=["All","Home","Kitchen","Wear"].map(c=>'<button data-c="'+c+'" class="rounded-full px-4 py-1.5 text-sm '+(c===cat?'bg-stone-900 text-white':'bg-white border')+'">'+c+'</button>').join('');
  $('grid').innerHTML=products.filter(p=>cat==="All"||p.c===cat).map(p=>'<div class="group overflow-hidden rounded-2xl bg-white shadow-sm"><div class="aspect-square overflow-hidden bg-stone-100"><img src="'+p.img+'" class="h-full w-full object-cover transition group-hover:scale-105"/></div><div class="p-3"><p class="font-semibold">'+p.n+'</p><div class="mt-1 flex items-center justify-between"><span class="text-stone-500">$'+p.p+'</span><button data-add="'+p.id+'" class="rounded-lg bg-orange-500 px-3 py-1 text-sm font-semibold text-white">Add</button></div></div></div>').join('');
  const ids=Object.keys(cart); let total=0,count=0;
  $('items').innerHTML=ids.length?ids.map(id=>{const p=products.find(x=>x.id==id),q=cart[id];total+=p.p*q;count+=q;return '<div class="flex items-center gap-3"><img src="'+p.img+'" class="size-14 rounded-lg object-cover"/><div class="flex-1"><p class="font-semibold">'+p.n+'</p><p class="text-sm text-stone-500">$'+p.p+'</p></div><div class="flex items-center gap-2"><button data-dec="'+id+'" class="size-7 rounded border">−</button>'+q+'<button data-add="'+id+'" class="size-7 rounded border">+</button></div></div>'}).join(''):'<p class="text-stone-400">Your cart is empty.</p>';
  $('sum').textContent='$'+total; $('count').textContent=count;
}
document.body.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
  if(t.dataset.c){cat=t.dataset.c}
  if(t.dataset.add){cart[t.dataset.add]=(cart[t.dataset.add]||0)+1}
  if(t.dataset.dec){if(--cart[t.dataset.dec]<=0)delete cart[t.dataset.dec]}
  render()});
$('cartBtn').onclick=()=>$('drawer').classList.remove('hidden');
$('close').onclick=$('shade').onclick=()=>$('drawer').classList.add('hidden');
$('checkout').onclick=()=>{if(!Object.keys(cart).length)return;alert('Order placed! Thank you.');cart={};render();$('drawer').classList.add('hidden')};
render();
</script></body></html>`;

const kanban = `${head("Flow Board")}
<body class="min-h-screen bg-emerald-950 text-emerald-50">
<header class="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8">
  <h1 class="text-2xl font-extrabold">Flow <span class="text-emerald-400">Board</span></h1>
  <form id="add" class="flex gap-2"><input id="title" required placeholder="New task…" class="rounded-lg bg-emerald-900 px-3 py-2 text-sm outline-none placeholder:text-emerald-400/60"/><button class="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950">Add</button></form>
</header>
<main id="board" class="grid gap-4 px-4 pb-8 md:grid-cols-3 md:px-8"></main>
<script>
const cols=[["todo","To do"],["doing","In progress"],["done","Done"]];
const tags={Design:"bg-pink-400/20 text-pink-300",Dev:"bg-sky-400/20 text-sky-300",Ops:"bg-amber-400/20 text-amber-300"};
let tasks=[{id:1,t:"Design onboarding flow",c:"todo",g:"Design"},{id:2,t:"Set up billing webhooks",c:"doing",g:"Dev"},{id:3,t:"Write launch checklist",c:"todo",g:"Ops"},{id:4,t:"Ship dark mode",c:"done",g:"Dev"},{id:5,t:"Customer interviews",c:"doing",g:"Design"}];
let next=6;
function render(){
  document.getElementById('board').innerHTML=cols.map(([k,l])=>{const list=tasks.filter(x=>x.c===k);return '<section data-col="'+k+'" class="col min-h-[200px] rounded-2xl bg-emerald-900/60 p-3"><div class="mb-3 flex justify-between px-1 text-sm font-semibold"><span>'+l+'</span><span class="text-emerald-400">'+list.length+'</span></div><div class="space-y-2">'+list.map(x=>'<article draggable="true" data-id="'+x.id+'" class="card cursor-grab rounded-xl bg-emerald-800 p-3 shadow hover:ring-2 hover:ring-emerald-400"><p class="text-sm font-semibold">'+x.t+'</p><div class="mt-2 flex items-center justify-between"><span class="rounded-full px-2 py-0.5 text-[11px] '+tags[x.g]+'">'+x.g+'</span><span class="flex gap-1">'+(k!=='todo'?'<button data-mv="-1" class="rounded px-1.5 text-emerald-300 hover:bg-emerald-700">←</button>':'')+(k!=='done'?'<button data-mv="1" class="rounded px-1.5 text-emerald-300 hover:bg-emerald-700">→</button>':'')+'<button data-del class="rounded px-1.5 text-emerald-300 hover:bg-emerald-700">✕</button></span></div></article>').join('')+'</div></section>'}).join('');
}
const board=document.getElementById('board');
board.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const id=+b.closest('.card').dataset.id,t=tasks.find(x=>x.id===id);
  if(b.dataset.mv){const i=cols.findIndex(c=>c[0]===t.c);t.c=cols[i+ +b.dataset.mv][0]}
  if('del' in b.dataset)tasks=tasks.filter(x=>x.id!==id);render()});
board.addEventListener('dragstart',e=>e.dataTransfer.setData('id',e.target.dataset.id));
board.addEventListener('dragover',e=>{if(e.target.closest('.col'))e.preventDefault()});
board.addEventListener('drop',e=>{const c=e.target.closest('.col');const t=tasks.find(x=>x.id==e.dataTransfer.getData('id'));if(c&&t){t.c=c.dataset.col;render()}});
document.getElementById('add').onsubmit=e=>{e.preventDefault();const i=document.getElementById('title');const g=Object.keys(tags)[next%3];tasks.push({id:next++,t:i.value,c:"todo",g});i.value='';render()};
render();
</script></body></html>`;

export const STARTER_TEMPLATES: { label: string; title: string; html: string }[] = [
  { label: "SaaS Analytics Dashboard", title: "Pulse Analytics", html: dashboard },
  { label: "E-Commerce Storefront", title: "Nova Store", html: store },
  { label: "Kanban Board", title: "Flow Board", html: kanban },
];
