/* store.js · Datos de ejemplo, guardado (localStorage) y utilidades */
var KEY = "nutribubble_v4";
var CATS = ["Proteínas","Verduras","Frutas","Lácteos","Granos y harinas","Bebidas","Otros"];
var CE = {"Proteínas":"🍗","Verduras":"🥬","Frutas":"🍓","Lácteos":"🥛","Granos y harinas":"🌾","Bebidas":"🧃","Otros":"🍯"};

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function esc(x){ return String(x==null?"":x).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
function money(n){ return "S/ " + (Math.round(n*100)/100).toFixed(2); }
function num(n){ return Math.round(n*100)/100; }
function iso(o){ var t=new Date(); t.setDate(t.getDate()+o); return t.getFullYear()+"-"+("0"+(t.getMonth()+1)).slice(-2)+"-"+("0"+t.getDate()).slice(-2); }
function now(){ return new Date().toLocaleString("es-PE",{dateStyle:"short",timeStyle:"short"}); }

/* Datos de ejemplo: cámbialos por los reales de Nutri Bubble */
function seed(){
  var a=uid(), b=uid(), c=uid(), d=uid();
  var sup=[{id:a,n:"Mercado Mayorista",c:"Sra. Rosa",t:"964 100 201",d:1},{id:b,n:"Proveedor de proteínas",c:"Sr. Julio",t:"964 100 202",d:2},{id:c,n:"Distribuidora de lácteos",c:"Srta. Lucía",t:"964 100 203",d:2},{id:d,n:"Bodega de abarrotes",c:"Sr. Carlos",t:"964 100 204",d:3}];
  function I(n,cat,u,s,m,p,v,e){ return {id:uid(),n:n,c:cat,u:u,s:s,m:m,p:p,v:v,e:e}; }
  var items=[
    I("Pechuga de pollo","Proteínas","kg",3,6,18,b,"🍗"), I("Huevos","Proteínas","unid",40,30,0.6,b,"🥚"),
    I("Atún en lata","Proteínas","lata",12,8,5.5,d,"🐟"), I("Quinua","Granos y harinas","kg",5,3,9,d,"🌾"),
    I("Avena","Granos y harinas","kg",0,2,6,d,"🥣"), I("Harina integral","Granos y harinas","kg",4,3,5,d,"🌾"),
    I("Tortillas para wraps","Granos y harinas","paq",6,5,8,d,"🌯"), I("Palta","Frutas","kg",4,3,12,a,"🥑"),
    I("Fresa","Frutas","kg",2,3,10,a,"🍓"), I("Plátano","Frutas","kg",6,4,3.5,a,"🍌"),
    I("Lechuga","Verduras","unid",10,8,2,a,"🥬"), I("Tomate","Verduras","kg",5,4,4,a,"🍅"),
    I("Yogurt natural","Lácteos","L",8,6,7,c,"🥛"), I("Miel de abeja","Otros","L",2,1,25,d,"🍯")
  ];
  function R(n,p,e,l){ return {id:uid(),n:n,p:p,e:e,ing:l.map(function(x){
    var i=items.filter(function(y){return y.n===x[0];})[0]; return {i:i.id,q:x[1]}; })}; }
  var rec=[
    R("Bowl de pollo y quinua",18,"🥗",[["Pechuga de pollo",0.15],["Quinua",0.1],["Palta",0.08],["Tomate",0.05],["Lechuga",0.25]]),
    R("Wrap de atún",12,"🌯",[["Tortillas para wraps",0.2],["Atún en lata",0.5],["Lechuga",0.15],["Tomate",0.05]]),
    R("Yogurt parfait",10,"🍨",[["Yogurt natural",0.25],["Avena",0.04],["Fresa",0.08],["Miel de abeja",0.02]]),
    R("Pancakes saludables",11,"🥞",[["Harina integral",0.1],["Huevos",2],["Plátano",0.1],["Miel de abeja",0.02]]),
    R("Jugo de fresa",8,"🥤",[["Fresa",0.15],["Plátano",0.1]])
  ];
  function cost(r){ return r.ing.reduce(function(a,x){var i=items.filter(function(y){return y.id===x.i;})[0]; return a+(i?i.p*x.q:0);},0); }
  var ven=[]; /* ventas de ejemplo de la última semana, para que el gráfico se vea vivo */
  for(var d=0;d<=6;d++){ var dt=new Date(); dt.setDate(dt.getDate()-d);
    rec.forEach(function(r,k){ if(d===0&&k>1)return; var q=((d*3+k*5)%4)+1+(d%2);
      ven.push({d:dt.toLocaleString("es-PE",{dateStyle:"short",timeStyle:"short"}),day:dt.toDateString(),n:r.n,q:q,tot:r.p*q,cost:cost(r)*q}); }); }
  function P(v,dd,eta,rd,l){ return {id:uid(),v:v,d:iso(dd),eta:iso(eta),rd:rd==null?"":iso(rd),st:rd==null?"Pendiente":"Recibido",
    items:l.map(function(x){return {i:items.filter(function(y){return y.n===x[0];})[0].id,q:x[1]};})}; }
  var ped=[P(b,-12,-10,-8,[["Pechuga de pollo",8]]),P(b,-6,-4,-4,[["Pechuga de pollo",10],["Huevos",60]]),P(a,-3,-2,-2,[["Palta",5],["Tomate",6]]),P(b,-3,-1,null,[["Pechuga de pollo",8],["Atún en lata",6]])];
  return {items:items,sup:sup,mov:[],ven:ven,rec:rec,noti:[],ped:ped};
}

var S = load();
function load(){ try{ var r=JSON.parse(localStorage.getItem(KEY)); if(r&&r.items){ r.noti=r.noti||[]; r.ped=r.ped||[]; return r; } }catch(e){} return seed(); }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }

/* Búsquedas y cálculos */
function sup(id){ return S.sup.filter(function(x){return x.id===id;})[0]; }
function item(id){ return S.items.filter(function(x){return x.id===id;})[0]; }
function rec(id){ return S.rec.filter(function(x){return x.id===id;})[0]; }
function emo(i){ return i.e || CE[i.c] || "📦"; }
function status(i){ return i.s<=0 ? ["Agotado","t-bad"] : i.s<=i.m ? ["Stock bajo","t-wa"] : ["Disponible","t-ok"]; }
function hoy(){ var d=new Date().toDateString(); return S.ven.filter(function(v){return v.day===d;}); }
function rcost(r){ return r.ing.reduce(function(a,x){var i=item(x.i); return a+(i?i.p*x.q:0);},0); }
function buyList(){
  var g={};
  S.items.filter(function(i){return i.s<=i.m;}).forEach(function(i){
    var v=sup(i.v), k=v?v.n:"Sin proveedor";
    (g[k]=g[k]||[]).push({i:i,q:Math.max(Math.ceil(i.m*2-i.s),1)});
  });
  return g;
}

/* Pedidos a proveedores y consumo */
function dleft(s){ var a=new Date(s+"T00:00:00"), b=new Date(); b.setHours(0,0,0,0); return Math.round((a-b)/864e5); }
function isLate(p){ return p.st==="Pendiente" && dleft(p.eta)<0; }
function usage(){ /* consumo diario por insumo, según lo vendido en 7 días */
  var u={}, lim=new Date(); lim.setDate(lim.getDate()-6); lim.setHours(0,0,0,0);
  S.ven.forEach(function(v){ if(new Date(v.day)<lim)return; var r=S.rec.filter(function(x){return x.n===v.n;})[0]; if(!r)return;
    r.ing.forEach(function(x){ u[x.i]=(u[x.i]||0)+x.q*v.q/7; }); });
  return u;
}
function supStat(id){
  var o=S.ped.filter(function(p){return p.v===id;}), rc=o.filter(function(p){return p.st==="Recibido";}), ok=rc.filter(function(p){return p.rd<=p.eta;}).length;
  return {n:o.length,pend:o.filter(function(p){return p.st==="Pendiente";}).length,late:o.filter(isLate).length,pct:rc.length?Math.round(ok/rc.length*100):null};
}
