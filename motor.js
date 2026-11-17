"use strict";
const PARAMETROS = {
  segundosPorPregunta: 40,
  segundosPorPareja: 25,
  segundosPorFrase: 30,
  umbralConfeti: 91,
  umbralCalavera: 65,
  sonidos: { acierto:"sonidos/acierto.mp3", fallo:"sonidos/fallo.mp3", fanfarria:"sonidos/fanfarria.mp3" }
};


let temaActual = "todos";

function barajar(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function bn(x){return String(x).replace(/\{([^}]+)\}/g,"______");}
function normalizar(s){return String(s).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[.,;:\u00a1!\u00bf?"'()\u00AB\u00BB]/g,"");}
function lienzo(id){
  document.querySelectorAll(".pantalla").forEach(p=>p.classList.remove("activa"));
  document.getElementById(id).classList.add("activa");
  pararReloj();
  if(id==="quiz") arrancarQuiz();
  if(id==="enlace") arrancarEnlace();
  if(id==="frases") arrancarFrases();
}
function datosTema(){ return temaActual==="todos" ? CAMPAÑA : TEMAS[temaActual]; }

/* — reloj — */
let relojTick=null, relojRestante=0, relojAlAcabar=null;
function arrancarReloj(segundos, idTemp, alAcabar){
  pararReloj();
  const el=document.getElementById(idTemp);
  relojRestante=segundos; relojAlAcabar=alAcabar;
  const pintar=sec=>{ const m=Math.floor(sec/60),s=sec%60;
    el.textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
    el.classList.toggle("urgente", sec<=30&&sec>0); };
  pintar(segundos);
  relojTick=setInterval(()=>{ relojRestante--; pintar(Math.max(relojRestante,0));
    if(relojRestante<=0){ pararReloj(); alAcabar(); } },1000);
}
function pararReloj(){ if(relojTick){clearInterval(relojTick); relojTick=null;} }

/* — sonidos: mp3 propios si existen, si no síntesis — */
const sonidoCache={};
function tocar(tipo){
  const ruta=PARAMETROS.sonidos[tipo];
  if(ruta){
    if(!sonidoCache[tipo]){ const a=new Audio(ruta); a.preload="auto"; sonidoCache[tipo]=a; }
    const a=sonidoCache[tipo]; a.currentTime=0;
    a.play().catch(()=>sintetizar(tipo)); return;
  }
  sintetizar(tipo);
}
function sintetizar(tipo){
  try{
    const ctx=sintetizar.ctx||(sintetizar.ctx=new (window.AudioContext||window.webkitAudioContext)());
    const t=ctx.currentTime;
    if(tipo==="acierto"){ // aplausos
      for(let i=0;i<10;i++){
        const buf=ctx.createBuffer(1,Math.floor(0.06*ctx.sampleRate),ctx.sampleRate);
        const d=buf.getChannelData(0);
        for(let k=0;k<d.length;k++) d[k]=(Math.random()*2-1)*Math.pow(1-k/d.length,2);
        const ruido=ctx.createBufferSource(); ruido.buffer=buf;
        const f=ctx.createBiquadFilter(); f.type="bandpass"; f.frequency.value=1200+Math.random()*1800; f.Q.value=1.2;
        const g=ctx.createGain(); g.gain.value=0.4;
        ruido.connect(f); f.connect(g); g.connect(ctx.destination);
        ruido.start(t+i*0.055);
      }
    } else if(tipo==="fallo"){ // trompeta de fracaso
      const notas=[[196,0,0.28],[185,0.3,0.28],[175,0.6,0.28],[147,0.9,0.7]];
      notas.forEach(n=>{
        const o=ctx.createOscillator(); o.type="sawtooth";
        o.frequency.setValueAtTime(n[0],t+n[1]);
        o.frequency.linearRampToValueAtTime(n[0]*0.94,t+n[1]+n[2]);
        const f=ctx.createBiquadFilter(); f.type="lowpass"; f.frequency.value=900;
        const g=ctx.createGain();
        g.gain.setValueAtTime(0.0001,t+n[1]);
        g.gain.exponentialRampToValueAtTime(0.26,t+n[1]+0.05);
        g.gain.exponentialRampToValueAtTime(0.0001,t+n[1]+n[2]);
        o.connect(f); f.connect(g); g.connect(ctx.destination);
        o.start(t+n[1]); o.stop(t+n[1]+n[2]+0.05);
      });
    } else if(tipo==="fanfarria"){
      [[523,0],[659,0.15],[784,0.3],[1047,0.45]].forEach(n=>{
        const o=ctx.createOscillator(); o.type="triangle"; o.frequency.value=n[0];
        const g=ctx.createGain();
        g.gain.setValueAtTime(0.0001,t+n[1]);
        g.gain.exponentialRampToValueAtTime(0.25,t+n[1]+0.03);
        g.gain.exponentialRampToValueAtTime(0.0001,t+n[1]+0.55);
        o.connect(g); g.connect(ctx.destination);
        o.start(t+n[1]); o.stop(t+n[1]+0.6);
      });
    }
  }catch(e){}
}

/* — confeti y calavera — */
function confeti(){
  const c=document.getElementById("lienzo-confeti"); c.style.display="block";
  const ctx=c.getContext("2d"); c.width=innerWidth; c.height=innerHeight;
  const colores=["#7e1b1e","#b9892e","#d4af5a","#2e6b2e","#f3ead0","#5a1013"];
  const parts=Array.from({length:230},()=>({
    x:Math.random()*c.width, y:-20-Math.random()*c.height*0.5,
    w:6+Math.random()*8, h:8+Math.random()*10,
    vy:2.5+Math.random()*4, vx:-1.5+Math.random()*3,
    a:Math.random()*Math.PI, va:-0.12+Math.random()*0.24,
    color:colores[Math.floor(Math.random()*colores.length)]
  }));
  const fin=performance.now()+4200;
  (function animar(){
    ctx.clearRect(0,0,c.width,c.height);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.a+=p.va; p.vx+=0.03*Math.sin(p.a);
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a);
      ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
    });
    if(performance.now()<fin) requestAnimationFrame(animar);
    else { ctx.clearRect(0,0,c.width,c.height); c.style.display="none"; }
  })();
}
function calaveraReir(){
  if(document.querySelector(".calavera")) return;
  const d=document.createElement("div"); d.className="calavera";
  d.innerHTML='<div class="fosas">💀</div><div class="veredicto">“eres muy tonto”</div><button class="btn oro">Que el cielo me coja confesado… ¡otra vez!</button>';
  document.body.appendChild(d);
  d.querySelector("button").onclick=()=>d.remove();
}

/* — resultados compartidos — */
function actualizarHud(idOk,idKo,ok,ko){
  const a=document.getElementById(idOk), b=document.getElementById(idKo);
  if(a) a.textContent=ok; if(b) b.textContent=ko;
}
function pintarResultado(o){
  pararReloj();
  const total=o.ok+o.ko, pctOk=total?Math.round(o.ok/total*100):0, pctKo=100-pctOk;
  const el=document.getElementById(o.id);
  el.style.display="block";
  el.innerHTML='<h2 style="font-family:\'IM Fell English SC\',Georgia,serif;color:var(--carmesi)">Banda de guerra: parte de campaña</h2>'+
    '<div class="nota-grande">'+o.nota.toFixed(1)+' / 10</div>'+
    '<div class="stats">'+
    '<div class="stat ok"><div class="v">'+o.ok+'</div><div class="l">Acertadas — '+pctOk+' %</div></div>'+
    '<div class="stat ko"><div class="v">'+o.ko+'</div><div class="l">Falladas — '+pctKo+' %</div></div></div>'+
    '<p class="mensaje-final">'+(pctOk>=PARAMETROS.umbralConfeti? o.msjOk : pctOk<PARAMETROS.umbralCalavera? o.msjKo : "El Tercio se reforma con disciplina: repasa el tema y vuelve a la carga.")+'</p>'+
    '<button class="btn" onclick="lienzo(\'inicio\')">Volver al estandarte</button>';
  if(pctOk>=PARAMETROS.umbralConfeti){ confeti(); tocar("fanfarria"); }
  if(pctOk<PARAMETROS.umbralCalavera) calaveraReir();
}

/* ═══════════ MOTOR CUESTIONARIO ═══════════ */
let quiz=null;
function arrancarQuiz(){
  const datos=datosTema();
  document.getElementById("q-marca").textContent="✦ Cuestionario · "+datos.titulo;
  const orden=barajar(datos.preguntas).map(p=>{
    const o=barajar(p.o.map((texto,i)=>({texto,correcto:i===p.c})));
    return {q:p.q,x:p.x,o,elegido:null};
  });
  quiz={orden,pos:0,ok:0,ko:0};
  actualizarHud("q-ok","q-ko",0,0);
  document.getElementById("q-final").style.display="none";
  document.getElementById("q-juego").style.display="block";
  pintarQuiz();
  arrancarReloj(orden.length*PARAMETROS.segundosPorPregunta,"q-temp",finalQuiz);
}
function pintarQuiz(){
  const p=quiz.orden[quiz.pos];
  document.getElementById("q-num").textContent="Pregunta "+(quiz.pos+1)+" de "+quiz.orden.length;
  document.getElementById("q-texto").textContent=p.q;
  const cont=document.getElementById("q-opciones"); cont.innerHTML="";
  p.o.forEach((op,i)=>{
    const b=document.createElement("button");
    b.className="opcion"; b.textContent=op.texto;
    if(p.elegido!==null){
      b.disabled=true;
      if(op.correcto) b.classList.add("acierto");
      if(i===p.elegido&&!op.correcto) b.classList.add("fallo");
    } else b.onclick=()=>responderQuiz(i);
    cont.appendChild(b);
  });
  const ref=document.getElementById("q-refuerzo");
  if(p.elegido!==null){
    const acerto=p.o[p.elegido].correcto;
    ref.style.display="block"; ref.classList.toggle("malo",!acerto);
    ref.innerHTML=(acerto?"<b>◆ ¡A la carga, acertaste!</b> ":"<b>◆ Tras el tambor, la explicación:</b> ")+p.x;
  } else ref.style.display="none";
  document.getElementById("q-prev").disabled=quiz.pos===0;
  document.getElementById("q-next").innerHTML=(quiz.pos===quiz.orden.length-1)?"Formar cuadro: terminar ⚑":"Siguiente &raquo;";
  document.getElementById("q-progreso").style.width=((quiz.pos+1)/quiz.orden.length*100)+"%";
}
function responderQuiz(i){
  const p=quiz.orden[quiz.pos];
  if(p.elegido!==null) return;
  p.elegido=i;
  if(p.o[i].correcto){ quiz.ok++; tocar("acierto"); } else { quiz.ko++; tocar("fallo"); }
  actualizarHud("q-ok","q-ko",quiz.ok,quiz.ko);
  pintarQuiz();
  if(quiz.orden.every(pp=>pp.elegido!==null)) setTimeout(finalQuiz,1800);
}
function navQuiz(d){
  if(!quiz) return;
  const nueva=quiz.pos+d;
  if(nueva<0||nueva>=quiz.orden.length) return;
  quiz.pos=nueva; pintarQuiz();
}
function finalQuiz(){
  if(!quiz) return;
  document.getElementById("q-juego").style.display="none";
  pintarResultado({id:"q-final", ok:quiz.ok, ko:quiz.ko,
    nota:quiz.orden.length?(quiz.ok/quiz.orden.length*10):0,
    msjOk:"¡Victoria digna de los Tercios viejos! El enemigo huye del campo.",
    msjKo:"La compañía se rompe… vuelve al repaso y reorganiza la escuadra."});
}

/* ═══════════ MOTOR ENLAZAR CONCEPTOS ═══════════ */
let enlace=null;
function arrancarEnlace(){
  enlazarLimpiar();
  const datos=datosTema();
  enlace={pares:datos.parejas, izq:barajar(datos.parejas.map((p,i)=>({...p,i}))),
    der:barajar(datos.parejas.map((p,i)=>({...p,i}))),
    selIzq:null,selDer:null,ok:0,ko:0,resueltas:0};
  actualizarHud("e-ok","e-ko",0,0);
  document.getElementById("e-final").style.display="none";
  document.getElementById("e-finalizar").style.display="none";
  const ref=document.getElementById("e-refuerzo");
  ref.style.display="none"; ref.innerHTML="";
  pintarEnlace();
  arrancarReloj(enlace.pares.length*PARAMETROS.segundosPorPareja,"e-temp",()=>finalEnlace());
}
function pintarEnlace(){
  const izq=document.getElementById("e-izq"), der=document.getElementById("e-der");
  izq.innerHTML=""; der.innerHTML="";
  enlace.izq.forEach(p=>{
    const b=document.createElement("button");
    b.className="ficha"; b.textContent=p.c; b.dataset.i=p.i;
    if(p.resuelta){ b.disabled=true; b.classList.add("acierto"); }
    else { b.onclick=()=>elegirEnlace("izq",p); if(enlace.selIzq&&enlace.selIzq.i===p.i) b.classList.add("selec"); }
    izq.appendChild(b);
  });
  enlace.der.forEach(p=>{
    const b=document.createElement("button");
    b.className="ficha"; b.textContent=p.d; b.dataset.i=p.i;
    if(p.resuelta){ b.disabled=true; b.classList.add("acierto"); }
    else { b.onclick=()=>elegirEnlace("der",p); if(enlace.selDer&&enlace.selDer.i===p.i) b.classList.add("selec"); }
    der.appendChild(b);
  });
  document.getElementById("e-progreso").style.width=(enlace.resueltas/enlace.pares.length*100)+"%";
}
function elegirEnlace(lado,par){
  if(lado==="izq"){ enlace.selIzq=par; } else { enlace.selDer=par; }
  pintarEnlace();
  if(enlace.selIzq&&enlace.selDer) juzgarEnlace();
}
function juzgarEnlace(){
  const a=enlace.selIzq, b=enlace.selDer;
  const acierto=a.i===b.i;
  const ref=document.getElementById("e-refuerzo");
  ref.style.display="block"; ref.classList.toggle("malo",!acierto);
  ref.innerHTML=(acierto?"<b>◆ Buen golpe de pica:</b> ":"<b>◆ Tras el fallo, la flecha enseña:</b> ")+enlace.pares[a.i].x;
  dibujarFlecha(a.i,b.i,acierto);
  enlace.selIzq=null; enlace.selDer=null;
  if(acierto){
    enlace.ok++; enlace.resueltas++; tocar("acierto");
    enlace.izq.find(p=>p.i===a.i).resuelta=true;
    enlace.der.find(p=>p.i===b.i).resuelta=true;
  } else {
    enlace.ko++; tocar("fallo");
    setTimeout(parar_resplandor=>pintarEnlace(),0);
  }
  actualizarHud("e-ok","e-ko",enlace.ok,enlace.ko);
  pintarEnlace();
  if(enlace.resueltas===enlace.pares.length){
    ref.innerHTML+="<br><b>Campaña completa:</b> todas las flechas en su diana.";
    document.getElementById("e-finalizar").style.display="inline-block";
  }
}
function dibujarFlecha(iIzq,iDer,ok){
  const svg=document.getElementById("e-flechas");
  const tab=document.getElementById("e-tablero").getBoundingClientRect();
  const rA=document.querySelector('#e-izq [data-i="'+iIzq+'"]').getBoundingClientRect();
  const rB=document.querySelector('#e-der [data-i="'+iDer+'"]').getBoundingClientRect();
  if(!ok){
    rA.noGuardar=true;
    const blink=document.createElementNS("http://www.w3.org/2000/svg","line");
    blink.setAttribute("x1",rA.right-tab.left); blink.setAttribute("y1",rA.top-tab.top+rA.height/2);
    blink.setAttribute("x2",rB.left-tab.left);  blink.setAttribute("y2",rB.top-tab.top+rB.height/2);
    blink.setAttribute("stroke","#8f1d1d"); blink.setAttribute("stroke-width","3");
    blink.setAttribute("marker-end","url(#punta-roja)"); blink.setAttribute("opacity","0.55");
    blink.dataset.efimero="1";
    svg.appendChild(blink);
    setTimeout(()=>blink.remove(),1400);
    return;
  }
  const line=document.createElementNS("http://www.w3.org/2000/svg","line");
  line.setAttribute("x1",rA.right-tab.left); line.setAttribute("y1",rA.top-tab.top+rA.height/2);
  line.setAttribute("x2",rB.left-tab.left);  line.setAttribute("y2",rB.top-tab.top+rB.height/2);
  line.setAttribute("stroke","#2e6b2e"); line.setAttribute("stroke-width","3.2"); line.setAttribute("marker-end","url(#punta-verde)");
  svg.appendChild(line);
}
function enlazarLimpiar(){
  document.querySelectorAll("#e-flechas line").forEach(l=>l.remove());
}
function finalEnlace(){
  if(!enlace) return;
  enlazarLimpiar();
  const total=enlace.pares.length;
  pintarResultado({id:"e-final", ok:enlace.ok, ko:total-enlace.ok, total:total,
    nota:total?(enlace.ok/total*10):0,
    msjOk:"¡Cuadro perfecto! Cada flecha ha dado en el centro.",
    msjKo:"Las flechas se cruzan sin caer: vuelve al mapa de conceptos."});
  document.getElementById("e-finalizar").style.display="none";
}

/* ═════════════ MOTOR COMPLETAR FRASE ═════════════ */
let frasesJuego=null;
function arrancarFrases(){
  const datos=datosTema();
  frasesJuego={frases:barajar(datos.frases).map(f=>({...f,revisada:false,ok:false})), ok:0, ko:0};
  document.getElementById("f-final").style.display="none";
  actualizarHud("f-ok","f-ko",0,0);
  pintarFrases();
  arrancarReloj(frasesJuego.frases.length*PARAMETROS.segundosPorFrase,"f-temp",finalFrases);
}
function pintarFrases(){
  const cont=document.getElementById("f-lista"); cont.innerHTML="";
  frasesJuego.frases.forEach((item,idx)=>{
    const div=document.createElement("div");
    div.className="frase-item"+(item.revisada?(item.ok?" acierto":" fallo"):"");
    const textoConHueco=bn(item.a);
    const partes=textoConHueco.split("______");
    const p=document.createElement("p");
    p.appendChild(document.createTextNode((idx+1)+". "+partes[0]));
    const input=document.createElement("input");
    input.className="hueco"; input.type="text"; input.autocomplete="off"; input.spellcheck=false;
    p.appendChild(input); p.appendChild(document.createTextNode(partes[1]||""));
    div.appendChild(p);
    if(item.revisada){
      input.disabled=true;
      input.value=item.respuestaUsuario||item.clave;
      input.classList.add(item.ok?"bien":"mal");
      div.insertAdjacentHTML("beforeend",
        '<p style="font-size:.95rem"><b class="corrige">Palabra clave:</b> '+item.clave+' — '+item.r+'</p>');
    } else {
      const btn=document.createElement("button");
      btn.className="btn oro"; btn.style.cssText="padding:7px 16px;font-size:.92rem";
      btn.textContent="Comprobar";
      chip(btn,idx,input);
      div.appendChild(btn);
      div.appendChild(p);
      cont.appendChild(div);
      return;
    }
    cont.appendChild(div);
  });
  document.getElementById("f-progreso").style.width=(frasesJuego.frases.filter(f=>f.revisada).length/frasesJuego.frases.length*100)+"%";
}
function chip(btn,idx,input){
  const check=()=>corregirFrase(idx,input.value);
  btn.onclick=check;
  input.onkeydown=e=>{ if(e.key==="Enter") check(); };
}
function corregirFrase(idx,val){
  const item=frasesJuego.frases[idx];
  if(item.revisada) return;
  item.clave=item.a.match(/\{([^}]+)\}/)[1];
  item.respuestaUsuario=val;
  const bien=normalizar(val)===normalizar(item.clave);
  item.revisada=true; item.ok=bien;
  if(bien){ frasesJuego.ok++; tocar("acierto"); } else { frasesJuego.ko++; tocar("fallo"); }
  actualizarHud("f-ok","f-ko",frasesJuego.ok,frasesJuego.ko);
  pintarFrases();
  if(frasesJuego.frases.every(f=>f.revisada)) setTimeout(finalFrases,1600);
}
function finalFrases(){
  if(!frasesJuego) return;
  pintarResultado({id:"f-final", ok:frasesJuego.ok, ko:frasesJuego.ko, total:frasesJuego.frases.length,
    nota:frasesJuego.frases.length?(frasesJuego.ok/frasesJuego.frases.length*10):0,
    msjOk:"Grietas selladas: las palabras clave ya son tuyas.",
    msjKo:"El muro pierde ladrillos: repasa las palabras clave del temario."});
}

/* ═════════════ PESTAÑAS DE REPASO ═════════════ */
function ensamblarRepaso(){
  const pestañas=document.getElementById("pestañas-repaso");
  const contenido=document.getElementById("contenido-repaso");
  pestañas.innerHTML="";
  const resumen=document.createElement("div");
  resumen.className="chuleta";
  resumen.innerHTML="<h4>⚔ Propósito del tema de repaso</h4><p style='font-size:.95rem'>Elige la Unidad que quieras repasar. Cada temario condensa las ideas principales, chuletas visuales, resumen del resumen y glosario de siglas: para afianzar, no para repetir el libro.</p>";
  contenido.innerHTML=""; contenido.appendChild(resumen);
  Object.keys(REPASOS).forEach((k,i)=>{
    const b=document.createElement("button");
    b.className="sel-bandera"; b.textContent=REPASOS[k].titulo;
    b.onclick=()=>{
      pestañas.querySelectorAll("button").forEach(x=>x.classList.remove("activa"));
      b.classList.add("activa");
      contenido.innerHTML=REPASOS[k].html;
    };
    pestañas.appendChild(b);
  });
  const b0=pestañas.querySelector("button"); if(b0) b0.click();
}

/* ═════════════ SELECTOR DE TEMA ═════════════ */
function ensamblarSelector(){
  const sel=document.getElementById("selector-tema");
  const opciones=[{k:"todos",t:"Toda la campaña (3 temas)"},{k:"ud3",t:UD3.titulo},{k:"ud4",t:UD4.titulo},{k:"ud5",t:UD5.titulo}];
  opciones.forEach(o=>{
    const b=document.createElement("button");
    b.className="sel-bandera"+(o.k===temaActual?" activa":"");
    b.textContent=o.t;
    b.onclick=()=>{ temaActual=o.k; ensamblarSelector(); };
    sel.appendChild(b);
  });
}
document.querySelectorAll(".estandarte").forEach(e=>{
  e.addEventListener("click",()=>lienzo(e.dataset.abrir));
});
ensamblarSelector(); ensamblarRepaso();