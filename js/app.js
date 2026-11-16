/* app.js · Navegación, eventos y acciones */
var TAB="home", Q="", CAT="";
var NAV=[["home","Panel"],["inv","Inventario"],["sup","Proveedores"],["buy","Pedidos"],["mov","Movimientos"],["menu","Recetas y ventas"]];
var VIEWS={home:vHome,inv:vInv,sup:vSup,buy:vBuy,mov:vMov,menu:vMenu};
function badge(t){ var n=t==="inv"?S.items.filter(function(i){return i.s<=i.m;}).length:t==="buy"?S.ped.filter(isLate).length:0; return n?'<i class="bdg">'+n+'</i>':''; }

function render(){
  document.getElementById("menu").innerHTML=NAV.map(function(n){
    return '<button data-t="'+n[0]+'" class="'+(TAB===n[0]?"on":"")+'"><span>'+n[1]+'</span>'+badge(n[0])+'</button>';}).join("");
  document.getElementById("view").innerHTML=VIEWS[TAB]();
  updateBell(); renderPanel();
}
function val(id){ return document.getElementById(id).value; }
function toast(t){ var e=document.getElementById("toast"); e.textContent=t; e.classList.add("on"); clearTimeout(toast.h); toast.h=setTimeout(function(){e.classList.remove("on");},2200); }
function done(msg){ scanStock(); save(); modal(""); render(); if(msg)toast(msg); }

function saveItem(id){
  var n=val("f_n").trim(); if(!n){alert("Escribe el nombre del insumo");return;}
  var o={n:n,c:val("f_c"),u:val("f_u").trim()||"unid",s:Math.max(+val("f_s")||0,0),m:Math.max(+val("f_m")||0,0),p:Math.max(+val("f_p")||0,0),v:val("f_v")};
  if(id)Object.assign(item(id),o); else{o.id=uid();S.items.push(o);}
  done("Insumo guardado ✅");
}
function saveMov(id){
  var i=item(id), t=val("g_t"), q=+val("g_q");
  if(!(q>0)){alert("Ingresa una cantidad mayor a 0");return;}
  i.s=t==="Entrada"?num(i.s+q):Math.max(num(i.s-q),0);
  S.mov.unshift({d:now(),i:id,t:t,q:q,note:val("g_n")}); S.mov=S.mov.slice(0,500);
  done(t+" registrada ✅");
}
function saveSup(id){
  var n=val("p_n").trim(); if(!n){alert("Escribe el nombre");return;}
  var o={n:n,t:val("p_t"),c:val("p_c"),d:Math.max(parseInt(val("p_d"))||0,0)}; if(id)Object.assign(sup(id),o); else{o.id=uid();S.sup.push(o);}
  done("Proveedor guardado ✅");
}
function saveRec(id){
  var n=val("r_n").trim(); if(!n){alert("Escribe el nombre del plato");return;}
  var ing=[]; for(var k=0;k<8;k++){var iv=val("r_i"+k),qv=+val("r_q"+k); if(iv&&qv>0)ing.push({i:iv,q:qv});}
  if(!ing.length){alert("Agrega al menos un ingrediente");return;}
  var o={n:n,p:Math.max(+val("r_p")||0,0),e:val("r_e").trim()||"🍽️",ing:ing};
  if(id)Object.assign(rec(id),o); else{o.id=uid();S.rec.push(o);}
  done("Plato guardado ✅");
}
function sell(id){
  var r=rec(id), q=Math.max(parseInt(val("vq_"+id))||1,1), falta=[];
  r.ing.forEach(function(x){var i=item(x.i); if(i&&i.s<x.q*q-1e-9)falta.push(i.n);});
  if(falta.length){alert("No alcanza el stock de: "+falta.join(", "));return;}
  var d=now();
  r.ing.forEach(function(x){var i=item(x.i); if(!i)return; i.s=num(i.s-x.q*q); S.mov.unshift({d:d,i:i.id,t:"Salida",q:num(x.q*q),note:"Venta: "+r.n});});
  S.mov=S.mov.slice(0,500);
  S.ven.unshift({d:d,day:new Date().toDateString(),n:r.n,q:q,tot:r.p*q,cost:rcost(r)*q}); S.ven=S.ven.slice(0,500);
  notify("🎉","Venta registrada",q+" × "+r.n+" · "+money(r.p*q)); scanStock(); save(); render();
}
function copyList(){
  var ok=false;
  try{var t=document.createElement("textarea");t.value=window._txt;document.body.appendChild(t);t.select();ok=document.execCommand("copy");t.remove();}catch(e){}
  toast(ok?"Lista copiada ✅":"No se pudo copiar");
}

/* ---- Centro de notificaciones ---- */
var NOPEN=false, SOUND=true, popQ=0;
function beep(){ if(!SOUND)return; try{ var c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain(); o.type="sine"; o.frequency.value=740; g.gain.setValueAtTime(.08,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.25); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+.25); }catch(e){} }
function notify(ico,title,msg,key){
  if(key&&S.noti.some(function(n){return n.key===key;}))return;
  var n={id:uid(),ico:ico,title:title,msg:msg,d:now(),read:false,key:key||""};
  S.noti.unshift(n); S.noti=S.noti.slice(0,40); save(); updateBell(); renderPanel(); popup(n); beep();
  try{ if(window.Notification&&Notification.permission==="granted")new Notification(title,{body:msg}); }catch(e){}
}
function popup(n){
  if(popQ>=3)return; var t=popQ*700; popQ++;
  setTimeout(function(){ popQ--; var e=document.createElement("div"); e.className="pop"; e.innerHTML='<i class="lv lv-'+lvl(n.ico)+'"></i><div><b>'+esc(n.title)+'</b><span>'+esc(n.msg)+'</span></div>';
    e.onclick=function(){NOPEN=true;renderPanel();e.remove();}; document.getElementById("pops").appendChild(e);
    setTimeout(function(){e.classList.add("out");setTimeout(function(){e.remove();},400);},5200); },t);
}
function lvl(i){ return i==="🚫"?"bad":(i==="⏰"||i==="⚠️")?"wa":"ok"; }
function scanStock(){
  S.ped.filter(isLate).forEach(function(o){var s=sup(o.v); notify("⏰","Pedido atrasado",(s?s.n:"Un proveedor")+" debía entregar el "+o.eta+".","p"+o.id);});
  S.items.forEach(function(i){
    if(i.s<=0)notify("🚫","Agotado: "+i.n,"Ya no hay "+i.n+". Pídelo cuanto antes.","o"+i.id);
    else if(i.s<=i.m)notify("⚠️","Stock bajo: "+i.n,"Quedan "+num(i.s)+" "+i.u+" (mínimo "+num(i.m)+").","l"+i.id);
    else S.noti=S.noti.filter(function(n){return n.key!=="o"+i.id&&n.key!=="l"+i.id;});
  });
}
function updateBell(){ var c=S.noti.filter(function(n){return !n.read;}).length,b=document.getElementById("bd"); b.textContent=c; b.style.display=c?"grid":"none"; }
function renderPanel(){
  var p=document.getElementById("npanel"); if(!NOPEN){p.innerHTML="";return;}
  var un=S.noti.filter(function(n){return !n.read;}).length;
  p.innerHTML='<div class="np"><div class="np-h"><h3>Notificaciones</h3><span>'+un+' sin leer</span></div><div class="np-l">'+
   (S.noti.length?S.noti.map(function(n){return '<button class="nit'+(n.read?'':' un')+'" data-a="nread" data-id="'+n.id+'"><i class="lv lv-'+lvl(n.ico)+'"></i><div style="flex:1"><b>'+esc(n.title)+'</b><span>'+esc(n.msg)+'</span><small>'+esc(n.d)+'</small></div>'+(n.read?'':'<i class="ud"></i>')+'</button>';}).join(""):'<div class="empty">Sin avisos. ¡Todo en orden!</div>')+
   '</div><div class="np-f"><button class="btn sm" data-a="nall">Marcar todo leído</button><button class="btn sm" data-a="snd">'+(SOUND?"🔊 Sonido":"🔇 Silencio")+'</button><button class="btn sm" data-a="bnot">Avisos del navegador</button></div></div>';
}
document.addEventListener("click",function(e){ if(NOPEN&&!e.target.closest("#npanel,.bell")){NOPEN=false;renderPanel();} });
document.addEventListener("click",function(e){
  var b=e.target.closest("button"); if(!b)return;
  if(b.dataset.t){TAB=b.dataset.t;render();window.scrollTo(0,0);return;}
  var a=b.dataset.a, id=b.dataset.id; if(!a)return;
  var A={
    x:function(){modal("");}, sf:function(){SF=id;render();},
    mkped:function(){var v=sup(id), l=S.items.filter(function(i){return i.v===id&&i.s<=i.m;}).map(function(i){return {i:i.id,q:Math.max(Math.ceil(i.m*2-i.s),1)};}); if(!l.length)return;
      S.ped.unshift({id:uid(),v:id,d:iso(0),eta:iso(v.d||1),st:"Pendiente",rd:"",items:l}); done("Pedido creado");},
    recv:function(){var o=S.ped.filter(function(x){return x.id===id;})[0]; o.items.forEach(function(x){var i=item(x.i); if(!i)return; i.s=num(i.s+x.q); S.mov.unshift({d:now(),i:i.id,t:"Entrada",q:x.q,note:"Pedido recibido"});}); o.st="Recibido"; o.rd=iso(0); done("Pedido recibido: stock actualizado");},
    dped:function(){if(confirm("¿Borrar este pedido?")){S.ped=S.ped.filter(function(x){return x.id!==id;});done("Pedido borrado");}},
    wa:function(){var v=sup(id), t="Hola "+(v&&v.c?v.c:"")+", necesito para Nutri Bubble:\n"; S.items.filter(function(i){return i.v===id&&i.s<=i.m;}).forEach(function(i){t+="- "+i.n+": "+Math.max(Math.ceil(i.m*2-i.s),1)+" "+i.u+"\n";}); window._txt=t; copyList();}, bell:function(){NOPEN=!NOPEN;renderPanel();}, snd:function(){SOUND=!SOUND;renderPanel();},
    nall:function(){S.noti.forEach(function(n){n.read=true;});save();updateBell();renderPanel();},
    bnot:function(){try{Notification.requestPermission().then(function(r){toast(r==="granted"?"Avisos del navegador activados ✅":"Permiso no concedido");});}catch(er){toast("Tu navegador no lo permite");}},
    nread:function(){var n=S.noti.filter(function(x){return x.id===id;})[0]; if(n){n.read=true;if(/^[lo]/.test(n.key)){TAB="buy";NOPEN=false;}} save(); render();}, "new":function(){mItem();}, edit:function(){mItem(id);},
    "in":function(){mMov(id,"Entrada");}, out:function(){mMov(id,"Salida");},
    nsup:function(){mSup();}, esup:function(){mSup(id);}, nrec:function(){mRec();}, erec:function(){mRec(id);},
    saveitem:function(){saveItem(id);}, savemov:function(){saveMov(id);}, savesup:function(){saveSup(id);}, saverec:function(){saveRec(id);},
    sell:function(){sell(id);}, copy:copyList,
    del:function(){if(confirm("¿Eliminar este insumo?")){S.items=S.items.filter(function(x){return x.id!==id;});done("Insumo eliminado");}},
    drec:function(){if(confirm("¿Eliminar este plato?")){S.rec=S.rec.filter(function(x){return x.id!==id;});done("Plato eliminado");}},
    dsup:function(){if(confirm("¿Eliminar proveedor? Sus insumos quedarán sin proveedor.")){S.items.forEach(function(i){if(i.v===id)i.v="";});S.sup=S.sup.filter(function(x){return x.id!==id;});done("Proveedor eliminado");}}
  };
  if(A[a])A[a]();
});
document.addEventListener("input",function(e){
  if(e.target.id==="q"){Q=e.target.value;var p=e.target.selectionStart;render();var q=document.getElementById("q");q.focus();q.setSelectionRange(p,p);}
});
document.addEventListener("input",function(e){ if(e.target.id==="gq"){Q=e.target.value;TAB="inv";render();} });
document.addEventListener("change",function(e){ if(e.target.id==="cat"){CAT=e.target.value;render();} });
document.addEventListener("keydown",function(e){ if(e.key==="Escape"){modal("");NOPEN=false;renderPanel();} });
scanStock(); render();
