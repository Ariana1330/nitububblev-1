/* views.js · Pantallas y ventanas (solo generan HTML) */
function pbar(i){
  var p=Math.min(i.s/((i.m||1)*2),1)*100, c=i.s<=0?"var(--bad)":i.s<=i.m?"var(--mango)":"var(--ok)";
  return '<div class="pb"><i style="width:'+p+'%;background:'+c+'"></i></div>';
}
function head(t,sub,btn){ return '<div class="ph"><div><h2>'+t+'</h2><p>'+sub+'</p></div>'+(btn||'')+'</div>'; }
function stat(ic,cl,n,l){ return '<div class="stat"><span class="ico '+cl+'">'+ic+'</span><div><b>'+n+'</b><small>'+l+'</small></div></div>'; }

function vMenu(){
  var h=hoy(), n=h.reduce(function(a,v){return a+v.q;},0), ing=h.reduce(function(a,v){return a+v.tot;},0), co=h.reduce(function(a,v){return a+v.cost;},0);
  var cards=S.rec.map(function(r){
    var c=rcost(r), chips=r.ing.map(function(x){var i=item(x.i); return i?'<span>'+esc(i.n)+' '+x.q+' '+esc(i.u)+'</span>':'';}).join("");
    return '<div class="dish"><div class="dish-top"><span>'+(r.e||"🍽️")+'</span><span class="tag">'+money(r.p)+'</span></div><div class="dish-b"><h3>'+esc(r.n)+'</h3><div class="chips">'+chips+'</div>'+
     '<p class="gain">Costo '+money(c)+' · Ganancia <b>'+money(r.p-c)+'</b></p><div class="dish-f"><input id="vq_'+r.id+'" type="number" min="1" value="1" aria-label="Cantidad"><button class="btn main-b" data-a="sell" data-id="'+r.id+'">Vender</button><button class="ib" data-a="erec" data-id="'+r.id+'" aria-label="Editar plato">✎</button></div></div></div>';
  }).join("");
  var rows=S.ven.slice(0,10).map(function(v){return '<div class="kv"><span>'+esc(v.n)+' ×'+v.q+' <small style="color:var(--mut)">'+esc(v.d)+'</small></span><b>'+money(v.tot)+'</b></div>';}).join("");
  return head("Menú y ventas","Al vender un plato, sus ingredientes se descuentan solos.",'<button class="btn main-b" data-a="nrec">+ Nuevo plato</button>')+
   '<div class="stats">'+stat("🍽️","i-g",n,"Platos vendidos hoy")+stat("💵","i-s",money(ing),"Ingresos de hoy")+stat("📈","i-m",money(ing-co),"Ganancia aprox. hoy")+'</div>'+
   '<div class="grid">'+(cards||'<div class="empty">Aún no hay platos.</div>')+'</div>'+
   '<h3 style="margin:26px 0 10px">Últimas ventas</h3><div class="box">'+(rows||'<div class="empty" style="padding:14px">Todavía no hay ventas.</div>')+'</div>';
}

function vMov(){
  var rows=S.mov.slice(0,80).map(function(m){
    var i=item(m.i), c=m.t==="Entrada"?"d-ok":m.t==="Salida"?"d-wa":"d-bad";
    return '<div class="kv"><span><i class="dot '+c+'"></i><b>'+m.t+'</b> · '+esc(i?i.n:"(eliminado)")+' <small style="color:var(--mut)">'+esc(m.note)+'</small></span><span>'+num(m.q)+' '+esc(i?i.u:"")+' · <small>'+esc(m.d)+'</small></span></div>';
  }).join("");
  return head("Movimientos","Historial de entradas, salidas y mermas.")+'<div class="box">'+(rows||'<div class="empty" style="padding:14px">Aún no hay movimientos.</div>')+'</div>';
}

function modal(h){ document.getElementById("modal").innerHTML=h?'<div class="ov"><div class="md fm">'+h+'</div></div>':""; }
function btns(id,save,del){ return '<div class="fb">'+(del?'<button class="btn red" data-a="'+del+'" data-id="'+id+'" style="margin-right:auto">Eliminar</button>':'')+'<button class="btn" data-a="x">Cancelar</button><button class="btn main-b" data-a="'+save+'" data-id="'+(id||'')+'">Guardar</button></div>'; }
function mItem(id){
  var i=id?item(id):{n:"",c:CATS[0],u:"kg",s:0,m:1,p:0,v:S.sup[0]?S.sup[0].id:""};
  modal('<h3>'+(id?"Editar":"Nuevo")+' insumo</h3><label>Nombre</label><input id="f_n" value="'+esc(i.n)+'">'+
   '<div class="two"><div><label>Categoría</label><select id="f_c">'+CATS.map(function(c){return '<option'+(i.c===c?' selected':'')+'>'+c+'</option>';}).join("")+'</select></div><div><label>Unidad (kg, L, unid…)</label><input id="f_u" value="'+esc(i.u)+'"></div></div>'+
   '<div class="two"><div><label>Stock actual</label><input id="f_s" type="number" min="0" step="any" value="'+i.s+'"></div><div><label>Stock mínimo</label><input id="f_m" type="number" min="0" step="any" value="'+i.m+'"></div></div>'+
   '<div class="two"><div><label>Costo por unidad (S/)</label><input id="f_p" type="number" min="0" step="any" value="'+i.p+'"></div><div><label>Proveedor</label><select id="f_v"><option value="">Sin proveedor</option>'+S.sup.map(function(s){return '<option value="'+s.id+'"'+(i.v===s.id?' selected':'')+'>'+esc(s.n)+'</option>';}).join("")+'</select></div></div>'+btns(id,"saveitem",id?"del":""));
}
function mMov(id,t){
  var i=item(id);
  modal('<h3>'+emo(i)+' '+esc(i.n)+'</h3><p style="margin:0;color:var(--mut)">Stock actual: '+num(i.s)+' '+esc(i.u)+'</p><label>Tipo</label><select id="g_t"><option'+(t==="Entrada"?" selected":"")+'>Entrada</option><option'+(t==="Salida"?" selected":"")+'>Salida</option><option>Merma</option></select>'+
   '<label>Cantidad ('+esc(i.u)+')</label><input id="g_q" type="number" min="0" step="any" value="1"><label>Nota (opcional)</label><input id="g_n" placeholder="Ej: compra del lunes, se malogró…">'+
   '<div class="fb"><button class="btn" data-a="x">Cancelar</button><button class="btn main-b" data-a="savemov" data-id="'+id+'">Registrar</button></div>');
}
function mRec(id){
  var r=id?rec(id):{n:"",p:0,e:"🍽️",ing:[]}, h="";
  for(var k=0;k<8;k++){ var x=r.ing[k]||{i:"",q:""};
    h+='<div class="two" style="margin-top:6px"><select id="r_i'+k+'"><option value="">— ingrediente —</option>'+S.items.map(function(i){return '<option value="'+i.id+'"'+(x.i===i.id?' selected':'')+'>'+esc(i.n)+' ('+esc(i.u)+')</option>';}).join("")+'</select><input id="r_q'+k+'" type="number" min="0" step="any" placeholder="Cantidad" value="'+x.q+'"></div>'; }
  modal('<h3>'+(id?"Editar":"Nuevo")+' plato</h3><div class="two"><div><label>Nombre</label><input id="r_n" value="'+esc(r.n)+'"></div><div><label>Precio (S/)</label><input id="r_p" type="number" min="0" step="any" value="'+r.p+'"></div></div><label>Emoji del plato</label><input id="r_e" value="'+esc(r.e||"🍽️")+'"><label>Ingredientes por porción</label>'+h+btns(id,"saverec",id?"drec":""));
}

var SF="";
function hoyTxt(){ var s=new Date().toLocaleDateString("es-PE",{weekday:"long",day:"numeric",month:"long"}); return s.charAt(0).toUpperCase()+s.slice(1)+" · Huancayo"; }
function kpi(l,v,s,c){ return '<div class="kp"><small>'+l+'</small><b class="'+(c||"")+'">'+v+'</b><span>'+s+'</span></div>'; }

function vHome(){
  var low=S.items.filter(function(i){return i.s>0&&i.s<=i.m;}), out=S.items.filter(function(i){return i.s<=0;}), late=S.ped.filter(isLate);
  var val=S.items.reduce(function(a,i){return a+i.s*i.p;},0), us=usage(), att=[];
  var cov=S.items.filter(function(i){return us[i.id];}).map(function(i){return {i:i,d:i.s/us[i.id]};}).sort(function(a,b){return a.d-b.d;}).slice(0,6);
  late.forEach(function(p){var s=sup(p.v); att.push(["bad","Pedido atrasado · "+(s?s.n:""),"Debía llegar hace "+(-dleft(p.eta))+" día(s). Llámalo o márcalo como recibido.","buy","Ver pedidos"]);});
  out.forEach(function(i){att.push(["bad","Agotado · "+i.n,"No queda stock. El mínimo es "+num(i.m)+" "+i.u+".","buy","Pedir"]);});
  low.forEach(function(i){att.push(["wa","Stock bajo · "+i.n,"Quedan "+num(i.s)+" "+i.u+" (mínimo "+num(i.m)+").","buy","Pedir"]);});
  var al=att.slice(0,8).map(function(a){return '<div class="at"><i class="lv lv-'+a[0]+'"></i><div><b>'+esc(a[1])+'</b><span>'+esc(a[2])+'</span></div><button class="btn sm" data-t="'+a[3]+'">'+a[4]+'</button></div>';}).join("")||'<p class="mut">Nada urgente. El inventario está en orden.</p>';
  var cv=cov.map(function(x){return '<tr><td>'+esc(x.i.n)+'</td><td class="num">'+num(x.i.s)+' '+esc(x.i.u)+'</td><td class="num '+(x.d<2?"bad":x.d<4?"wa":"")+'">'+(x.d<1?"menos de 1":Math.round(x.d))+' d</td></tr>';}).join("");
  var sp=S.sup.map(function(s){var t=supStat(s.id); return '<tr><td>'+esc(s.n)+'</td><td class="num">'+(s.d||"—")+' d</td><td class="num '+(t.pct!=null&&t.pct<70?"bad":"")+'">'+(t.pct==null?"—":t.pct+"%")+'</td><td class="num '+(t.late?"bad":"")+'">'+t.pend+(t.late?" · "+t.late+" atrasado":"")+'</td></tr>';}).join("");
  return head("Panel",hoyTxt(),'<button class="btn main-b" data-a="new">+ Nuevo insumo</button>')+
   '<div class="kps">'+kpi("Valor del inventario",money(val),S.items.length+" insumos")+kpi("Bajo el mínimo",low.length,"por reponer",low.length?"wa":"")+kpi("Agotados",out.length,"sin stock",out.length?"bad":"")+kpi("Pedidos atrasados",late.length,"de proveedores",late.length?"bad":"")+'</div>'+
   '<div class="cols"><section class="pn"><h3>Requiere atención</h3>'+al+'</section><section class="pn"><h3>Cuánto te dura el stock</h3><p class="mut" style="margin-top:-6px">Según lo vendido en los últimos 7 días.</p><table class="tb"><tbody>'+cv+'</tbody></table></section></div>'+
   '<h3 class="sec">Proveedores</h3><div class="tw"><table class="tb"><thead><tr><th>Proveedor</th><th class="num">Entrega</th><th class="num">Puntualidad</th><th class="num">Pedidos pendientes</th></tr></thead><tbody>'+sp+'</tbody></table></div>';
}

function vInv(){
  var us=usage(), val=S.items.reduce(function(a,i){return a+i.s*i.p;},0);
  var rows=S.items.filter(function(i){return (!CAT||i.c===CAT)&&(!Q||i.n.toLowerCase().indexOf(Q.toLowerCase())>-1)&&(!SF||(SF==="bajo"?i.s<=i.m:i.s<=0));})
   .sort(function(a,b){return a.n.localeCompare(b.n);}).map(function(i){
    var st=status(i), s=sup(i.v), d=us[i.id]?i.s/us[i.id]:null;
    return '<tr><td><b>'+esc(i.n)+'</b><small>'+esc(i.c)+'</small></td><td class="num"><b>'+num(i.s)+'</b> '+esc(i.u)+pbar(i)+'</td><td class="num">'+num(i.m)+'</td><td class="num">'+(d==null?"—":d<1?"< 1 d":Math.round(d)+" d")+'</td><td class="num">'+money(i.p)+'</td><td class="num">'+money(i.s*i.p)+'</td><td>'+esc(s?s.n:"—")+'</td><td><span class="st '+st[1]+'">'+st[0]+'</span></td>'+
     '<td class="ac"><button class="ib" data-a="in" data-id="'+i.id+'" title="Registrar entrada">+</button><button class="ib" data-a="out" data-id="'+i.id+'" title="Registrar salida">−</button><button class="ib" data-a="edit" data-id="'+i.id+'">Editar</button></td></tr>';}).join("");
  function f(k,l){return '<button class="'+(SF===k?"on":"")+'" data-a="sf" data-id="'+k+'">'+l+'</button>';}
  return head("Inventario",S.items.length+" insumos · valor "+money(val)+" · + entrada, − salida",'<button class="btn main-b" data-a="new">+ Nuevo insumo</button>')+
   '<div class="fl">'+f("","Todos")+f("bajo","Bajo el mínimo")+f("out","Agotados")+'<select id="cat"><option value="">Todas las categorías</option>'+CATS.map(function(c){return '<option'+(CAT===c?" selected":"")+'>'+c+'</option>';}).join("")+'</select>'+(Q?'<span class="mut">Búsqueda: “'+esc(Q)+'”</span>':'')+'</div>'+
   '<div class="tw"><table class="tb big"><thead><tr><th>Insumo</th><th class="num">Stock</th><th class="num">Mínimo</th><th class="num">Dura</th><th class="num">Costo</th><th class="num">Valor</th><th>Proveedor</th><th>Estado</th><th></th></tr></thead><tbody>'+(rows||'<tr><td colspan="9" class="empty">No hay insumos con ese filtro.</td></tr>')+'</tbody></table></div>';
}

function vSup(){
  var rows=S.sup.map(function(s){
    var t=supStat(s.id), its=S.items.filter(function(i){return i.v===s.id;}), val=its.reduce(function(a,i){return a+i.s*i.p;},0), ph=(s.t||"").replace(/\D/g,"");
    return '<tr><td><b>'+esc(s.n)+'</b><small>'+esc(s.c||"Sin contacto")+'</small></td><td>'+(ph?'<a href="https://wa.me/51'+ph+'" target="_blank" rel="noopener">'+esc(s.t)+'</a>':"—")+'</td><td class="num">'+(s.d||"—")+' d</td><td>'+(its.slice(0,4).map(function(i){return esc(i.n);}).join(", ")||"—")+(its.length>4?" +"+(its.length-4):"")+'</td><td class="num">'+money(val)+'</td>'+
     '<td class="num '+(t.pct!=null&&t.pct<70?"bad":"")+'">'+(t.pct==null?"—":t.pct+"%")+'</td><td class="num '+(t.late?"bad":"")+'">'+t.pend+'</td><td class="ac"><button class="ib" data-a="esup" data-id="'+s.id+'">Editar</button><button class="ib" data-a="dsup" data-id="'+s.id+'">Borrar</button></td></tr>';}).join("");
  return head("Proveedores","A quién le compras, en cuántos días entrega y qué tan puntual es.",'<button class="btn main-b" data-a="nsup">+ Nuevo proveedor</button>')+
   '<div class="tw"><table class="tb big"><thead><tr><th>Proveedor</th><th>Teléfono</th><th class="num">Entrega</th><th>Insumos que provee</th><th class="num">Stock</th><th class="num">Puntualidad</th><th class="num">Pendientes</th><th></th></tr></thead><tbody>'+(rows||'<tr><td colspan="8" class="empty">Sin proveedores.</td></tr>')+'</tbody></table></div>';
}

function vBuy(){
  var g={}, pend={};
  S.items.filter(function(i){return i.s<=i.m;}).forEach(function(i){var k=i.v||"-"; (g[k]=g[k]||[]).push({i:i,q:Math.max(Math.ceil(i.m*2-i.s),1)});});
  S.ped.filter(function(p){return p.st==="Pendiente";}).forEach(function(p){p.items.forEach(function(x){pend[x.i]=1;});});
  var sug=Object.keys(g).map(function(k){var s=sup(k), tot=0;
    var rows=g[k].map(function(x){tot+=x.q*x.i.p; return '<tr><td>'+esc(x.i.n)+(pend[x.i.id]?' <small class="wa">ya está en un pedido</small>':'')+'</td><td class="num">'+num(x.i.s)+' / '+num(x.i.m)+'</td><td class="num"><b>'+x.q+'</b> '+esc(x.i.u)+'</td><td class="num">'+money(x.q*x.i.p)+'</td></tr>';}).join("");
    return '<section class="pn" style="margin-bottom:14px"><div class="ch"><h3>'+esc(s?s.n:"Sin proveedor")+'<small>entrega en '+(s?s.d:"?")+' d</small></h3><div class="ac">'+(s?'<button class="btn sm" data-a="wa" data-id="'+k+'">Copiar mensaje</button><button class="btn sm main-b" data-a="mkped" data-id="'+k+'">Crear pedido · '+money(tot)+'</button>':'')+'</div></div>'+
     '<table class="tb"><thead><tr><th>Insumo</th><th class="num">Stock / mín.</th><th class="num">Pedir</th><th class="num">Costo</th></tr></thead><tbody>'+rows+'</tbody></table></section>';}).join("")||'<p class="mut">Nada por pedir: todo está sobre el mínimo.</p>';
  var ped=S.ped.slice().sort(function(a,b){return b.d.localeCompare(a.d);}).map(function(p){
    var s=sup(p.v), stt=p.st==="Pendiente"?(isLate(p)?'<span class="st t-bad">Atrasado '+(-dleft(p.eta))+' d</span>':'<span class="st t-wa">Pendiente</span>'):(p.rd<=p.eta?'<span class="st t-ok">Recibido a tiempo</span>':'<span class="st t-bad">Recibido tarde</span>');
    return '<tr><td class="num">'+p.d+'</td><td>'+esc(s?s.n:"—")+'</td><td>'+p.items.map(function(x){var i=item(x.i); return i?esc(i.n)+" ×"+x.q:"";}).join(", ")+'</td><td class="num">'+p.eta+'</td><td>'+stt+'</td><td class="ac">'+(p.st==="Pendiente"?'<button class="btn sm main-b" data-a="recv" data-id="'+p.id+'">Marcar recibido</button>':'')+'<button class="ib" data-a="dped" data-id="'+p.id+'">Borrar</button></td></tr>';}).join("");
  return head("Pedidos","Qué falta, a quién pedírselo y el seguimiento de cada entrega.")+'<h3 class="sec" style="margin-top:0">Sugerido para pedir</h3>'+sug+
   '<h3 class="sec">Pedidos a proveedores</h3><div class="tw"><table class="tb big"><thead><tr><th class="num">Fecha</th><th>Proveedor</th><th>Insumos</th><th class="num">Llega el</th><th>Estado</th><th></th></tr></thead><tbody>'+(ped||'<tr><td colspan="6" class="empty">Aún no hay pedidos.</td></tr>')+'</tbody></table></div>';
}

function mSup(id){
  var s=id?sup(id):{n:"",c:"",t:"",d:2};
  modal('<h3>'+(id?"Editar":"Nuevo")+' proveedor</h3><label>Nombre del proveedor</label><input id="p_n" value="'+esc(s.n)+'"><div class="two"><div><label>Persona de contacto</label><input id="p_c" value="'+esc(s.c||"")+'"></div><div><label>Teléfono</label><input id="p_t" value="'+esc(s.t||"")+'"></div></div><label>Días que tarda en entregar</label><input id="p_d" type="number" min="0" value="'+(s.d==null?2:s.d)+'">'+btns(id,"savesup",""));
}
