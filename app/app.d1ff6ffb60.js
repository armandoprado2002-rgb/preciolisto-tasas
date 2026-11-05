/*! PrecioListo © 2026 Armando Prado. Todos los derechos reservados. Prohibida su copia. */
var va="preciolisto";function L(e){return new Promise((a,o)=>{e.onsuccess=()=>a(e.result),e.onerror=()=>o(e.error)})}function Z(e){return new Promise((a,o)=>{e.oncomplete=()=>a(),e.onerror=()=>o(e.error),e.onabort=()=>o(e.error||new Error("Escritura cancelada"))})}function X(e){return e?.name==="QuotaExceededError"?new Error("El teléfono está lleno. Libera espacio (fotos, videos) y vuelve a intentar. No se perdió nada de lo guardado antes."):e}async function ha(){if(!("indexedDB"in globalThis))throw new Error("Este navegador no permite guardar datos. Usa Chrome actualizado.");let e=indexedDB.open(va,1);e.onupgradeneeded=()=>{let t=e.result;t.objectStoreNames.contains("meta")||t.createObjectStore("meta"),t.objectStoreNames.contains("registros")||t.createObjectStore("registros",{keyPath:["tipo","id"]}),t.objectStoreNames.contains("auditoria")||t.createObjectStore("auditoria",{keyPath:"n"})};let a=await L(e);navigator.storage?.persist?.().catch(()=>{});let o=(t,r="readonly")=>a.transaction(t,r,r==="readwrite"?{durability:"strict"}:void 0);return{async leerMeta(t){return L(o("meta").objectStore("meta").get(t))},async guardarMeta(t,r){let i=o("meta","readwrite");i.objectStore("meta").put(r,t),await Z(i).catch(n=>{throw X(n)})},async todos(t){let r=IDBKeyRange.bound([t,""],[t,"￿"]);return L(o("registros").objectStore("registros").getAll(r))},async poner(t,r,i){let n=o("registros","readwrite");n.objectStore("registros").put({tipo:t,id:r,...i}),await Z(n).catch(s=>{throw X(s)})},async ponerConAuditoria(t,r,i,n){let s=o(["registros","auditoria"],"readwrite");t&&s.objectStore("registros").put({tipo:t,id:r,...i}),s.objectStore("auditoria").add(n),await Z(s).catch(c=>{throw X(c)})},async auditoria(){return L(o("auditoria").objectStore("auditoria").getAll())},async borrarTodo(){a.close(),await L(indexedDB.deleteDatabase(va))}}}var E=globalThis.crypto,$a=31e4,ea=new TextEncoder,Ga=new TextDecoder,x=e=>{let a=new Uint8Array(e),o="";for(let t=0;t<a.length;t+=32768)o+=String.fromCharCode(...a.subarray(t,t+32768));return btoa(o)},I=e=>Uint8Array.from(atob(e),a=>a.charCodeAt(0)),aa=e=>E.getRandomValues(new Uint8Array(e));function ya(e){return typeof e!="string"||!/^\d{4,8}$/.test(e)?"El PIN debe tener de 4 a 8 números.":/^(\d)\1+$/.test(e)?"No uses el mismo número repetido.":"0123456789".includes(e)||"9876543210".includes(e)?"No uses números seguidos.":null}async function wa(e,a,o){let t=await E.subtle.importKey("raw",ea.encode(e),"PBKDF2",!1,["deriveKey"]);return E.subtle.deriveKey({name:"PBKDF2",salt:a,iterations:o,hash:"SHA-256"},t,{name:"AES-GCM",length:256},!1,["wrapKey","unwrapKey"])}async function Qa(e,a){let o=aa(16),t=aa(12),r=await wa(a,o,$a),i=await E.subtle.wrapKey("raw",e,r,{name:"AES-GCM",iv:t});return{sal:x(o),iv:x(t),iter:$a,envuelta:x(i)}}async function Sa(e){let a=await E.subtle.generateKey({name:"AES-GCM",length:256},!0,["encrypt","decrypt","wrapKey"]);return{llave:a,envoltura:await Qa(a,e)}}async function Ea(e,a){try{let o=await wa(e,I(a.sal),a.iter);return await E.subtle.unwrapKey("raw",I(a.envuelta),o,{name:"AES-GCM",iv:I(a.iv)},{name:"AES-GCM",length:256},!0,["encrypt","decrypt","wrapKey"])}catch{throw new Error("PIN_INCORRECTO")}}async function O(e,a){let o=aa(12),t=await E.subtle.encrypt({name:"AES-GCM",iv:o},e,ea.encode(JSON.stringify(a)));return{iv:x(o),ct:x(t)}}async function R(e,{iv:a,ct:o}){let t=await E.subtle.decrypt({name:"AES-GCM",iv:I(a)},e,I(o));return JSON.parse(Ga.decode(t))}async function ta(e){let a=await E.subtle.digest("SHA-256",ea.encode(e));return[...new Uint8Array(a)].map(o=>o.toString(16).padStart(2,"0")).join("")}function Ma(e={fallos:0,hasta:0},a=Date.now()){let o=e.fallos+1,t=0;if(o>=5){let r=Math.min(3e4*2**(o-5),9e5);t=a+r}return{fallos:o,hasta:t}}function oa(e,a=Date.now()){return Math.max(0,(e?.hasta||0)-a)}var Ca=5;var B=["USD","EUR","CUP"];function P(e){if(typeof e=="number")return Number.isFinite(e)?e:NaN;if(typeof e!="string")return NaN;let a=e.trim().replace(/\s/g,"").replace(",",".");return/^-?\d+(\.\d+)?$/.test(a)?Number(a):NaN}var ra=e=>Math.round(e*100);function za(e,a){if(e==="CUP")return 1;let o=a?.[e];if(typeof o!="number"||!(o>0))throw new Error(`No hay tasa válida para ${e}.`);return o}function na(e,a,o){if(!(e>=0))throw new Error("El costo debe ser un número positivo.");return ra(e*za(a,o))/100}function Aa(e,a=1){a>0||(a=1);let o=ra(e),t=ra(a);return Math.ceil(o/t)*t/100}function Ka({costo:e,moneda:a,margen:o},t,r=1){if(!(o>-1))throw new Error("El margen no es válido.");let i=na(e,a,t);return Aa(i*(1+o),r)}function ia(e,a,o,t){let r=na(e,a,t);return r<=0?null:o/r-1}function Ya(e,a,o){return Aa(na(e,a,o),1)}function Ja(e,a,o=.3){if(typeof e.margen=="number")return e.margen;let t=a?.find(r=>r.id===e.categoriaId);return typeof t?.margen=="number"?t.margen:o}function Pa(e,{tasas:a,categorias:o,redondeo:t=1}){let r=Ja(e,o),i=Ka({...e,margen:r},a,t),n=Ya(e.costo,e.moneda,a),s=i,c="sugerido";e.precioFijo&&e.precioManual>0?(s=e.precioManual,c="fijo"):e.precioManual>0&&(s=e.precioManual,c="manual");let d=ia(e.costo,e.moneda,s,a),p=e.tope>0?e.tope:null;return{precio:s,sugerido:i,minimo:n,margen:r,margenReal:d,origen:c,sobreTope:p!==null&&s>p,sugeridoSobreTope:p!==null&&i>p,margenBajo:d!==null&&d<r-.01,bajoMinimo:s<n}}function D(e,a){return!(e>0)||!(a>0)?0:(a-e)/e}function F(e,a,{umbral:o=.03,confirmarDesde:t=.1}={}){let r=0;for(let i of["USD","EUR"])e?.[i]>0&&a?.[i]>0&&(r=Math.max(r,Math.abs(D(e[i],a[i]))));return e?.USD?r>t?{accion:"confirmar",cambio:r}:r>=o?{accion:"sugerir",cambio:r}:{accion:"ignorar",cambio:r}:{accion:"sugerir",cambio:0}}function sa(e){let a=P(e);if(!Number.isFinite(a))throw new Error("Escribe solo números, por ejemplo 455 o 455,50.");if(a<1||a>1e5)throw new Error("Esa tasa no parece real. Revísala.");return Math.round(a*100)/100}function v(e,a){if(!Number.isFinite(e))return"—";let o=a??(Number.isInteger(Math.round(e*100)/100)?0:2),[t,r]=Math.abs(e).toFixed(o).split("."),i=t.replace(/\B(?=(\d{3})+(?!\d))/g," ");return`${e<0?"−":""}${i}${r?`,${r}`:""}`}function w(e,a=0){return`${(e*100).toFixed(a).replace(".",",")} %`}function H(e,a=new Date){let o=a-new Date(e);if(!Number.isFinite(o))return"fecha desconocida";let t=Math.round(o/6e4);if(t<1)return"ahora mismo";if(t<60)return`hace ${t} min`;let r=Math.round(t/60);if(r<24)return`hace ${r} h`;let i=Math.round(r/24);return`hace ${i} ${i===1?"día":"días"}`}var Wa={redondeo:5,umbralSugerencia:.03,confirmarDesde:.1,margenDefecto:.3},Za=[{id:"carnicos",nombre:"Cárnicos",margen:.15},{id:"abarrotes",nombre:"Abarrotes",margen:.2},{id:"aseo",nombre:"Aseo",margen:.3},{id:"bebidas",nombre:"Bebidas",margen:.25}],Xa=[{nombre:"Pollo (paquete 1 kg)",categoriaId:"carnicos",costo:2.8,moneda:"USD",cantidad:40,minimo:10},{nombre:"Aceite 1 L",categoriaId:"abarrotes",costo:2.2,moneda:"USD",cantidad:24,minimo:12},{nombre:"Arroz 1 kg",categoriaId:"abarrotes",costo:1.1,moneda:"USD",cantidad:50,minimo:20},{nombre:"Café 250 g (nacional)",categoriaId:"abarrotes",costo:1200,moneda:"CUP",cantidad:15,minimo:5},{nombre:"Detergente 1 kg",categoriaId:"aseo",costo:1.6,moneda:"USD",cantidad:18,minimo:6},{nombre:"Refresco lata",categoriaId:"bebidas",costo:.45,moneda:"USD",cantidad:96,minimo:24},{nombre:"Cerveza lata",categoriaId:"bebidas",costo:.7,moneda:"EUR",cantidad:72,minimo:24}],Ua=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;function T(e,a=80){return String(e??"").normalize("NFC").replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e]/g,"").replace(/\s+/g," ").trim().slice(0,a)}function ca(e,{min:a=0,max:o=1e9}={}){if(e===""||e===null||e===void 0)return null;let t=P(typeof e=="number"?e:String(e));return!Number.isFinite(t)||t<a||t>o?NaN:t}function V(e){let a={},o=T(e.nombre);o.length<2&&(a.nombre="Escribe el nombre del producto.");let t=B.includes(e.moneda)?e.moneda:null;t||(a.moneda="Elige USD, EUR o CUP.");let r=ca(e.costo,{min:0,max:1e7});(r===null||Number.isNaN(r))&&(a.costo="Escribe el costo, por ejemplo 2,20.");let i=ca(e.margenPct,{min:-99,max:1e3});Number.isNaN(i)&&(a.margen="El margen debe estar entre -99 y 1000 %.");let n={};for(let d of["tope","precioManual","cantidad","minimo"])n[d]=ca(e[d],{min:0,max:1e9}),Number.isNaN(n[d])&&(a[d]="Número no válido.");let s=null;e.vence&&(!/^\d{4}-\d{2}-\d{2}$/.test(e.vence)||Number.isNaN(Date.parse(e.vence))?a.vence="Fecha no válida.":s=e.vence);let c=T(e.codigo,40).replace(/[^0-9A-Za-z\-_.]/g,"");return e.precioFijo&&!(n.precioManual>0)&&(a.precioManual="Un precio fijo necesita un precio."),Object.keys(a).length?{errores:a}:{producto:{id:e.id||Ua(),nombre:o,categoriaId:T(e.categoriaId,40)||null,codigo:c||null,foto:typeof e.foto=="string"&&e.foto.startsWith("data:image/jpeg;base64,")&&e.foto.length<2e5?e.foto:null,costo:r,moneda:t,margen:i===null?null:i/100,tope:n.tope||null,precioFijo:!!e.precioFijo,precioManual:n.precioManual||null,cantidad:n.cantidad??0,minimo:n.minimo??0,vence:s,archivado:!1}}}var C=class e{constructor(a,o){this.base=a,this.llave=o,this.productos=new Map,this.config=null,this.ultimaAuditoria={n:0,hash:"0"},this.oyentes=new Set,this._cola=Promise.resolve()}_enCola(a){let o=this._cola.then(a,a);return this._cola=o.catch(()=>{}),o}static async existe(a){return!!await a.leerMeta("envolturas")}static async crear(a,{nombreNegocio:o,pin:t,datosEjemplo:r=!0,ahora:i=new Date}){let{llave:n,envoltura:s}=await Sa(t),c={id:"dueno",nombre:"Dueño",rol:"dueno"};await a.guardarMeta("envolturas",[{usuarioId:c.id,...s}]);let d=new e(a,n);if(d.usuario=c,d.config={negocio:{nombre:T(o,60)||"Mi negocio"},usuarios:[c],ajustes:{...Wa},categorias:r?JSON.parse(JSON.stringify(Za)):[],tasas:{aplicadas:null,disponibles:null,historial:[]},creadoEn:i.toISOString()},await d._guardarConfig("crear_negocio",{nombre:d.config.negocio.nombre}),r)for(let p of Xa){let{producto:u}=V({...p,margenPct:""});await d._guardarProducto(u,"producto_ejemplo")}return d}static async abrir(a,o,t=Date.now()){let r=await a.leerMeta("intentos")||{fallos:0,hasta:0},i=oa(r,t);if(i>0){let d=new Error("BLOQUEADO");throw d.espera=i,d}let n=await a.leerMeta("envolturas")||[];for(let d of n)try{let p=await Ea(o,d);await a.guardarMeta("intentos",{fallos:0,hasta:0});let u=new e(a,p);return await u._cargar(),u.usuario=u.config.usuarios.find(g=>g.id===d.usuarioId)||{id:d.usuarioId,rol:"dependiente"},u}catch(p){if(p.message!=="PIN_INCORRECTO")throw p}let s=Ma(r,t);await a.guardarMeta("intentos",s);let c=new Error("PIN_INCORRECTO");throw c.restantes=Math.max(0,5-s.fallos),c.espera=oa(s,t),c}async _cargar(){let[a,o,t]=await Promise.all([this.base.todos("config"),this.base.todos("producto"),this.base.auditoria()]);this.danados=0;for(let n of a)try{this.config=await R(this.llave,n)}catch{this.danados++}if(!this.config)throw new Error("No se pudo leer la configuración. Restaura una copia de seguridad.");let r=await Promise.all(o.map(n=>R(this.llave,n).catch(()=>null)));for(let n of r)n?this.productos.set(n.id,n):this.danados++;let i=t[t.length-1];i&&(this.ultimaAuditoria={n:i.n,hash:i.hash})}async _entradaAuditoria(a,o){let t=this.ultimaAuditoria.n+1,r={n:t,fecha:new Date().toISOString(),usuario:this.usuario?.id||"sistema",accion:a,detalle:o,anterior:this.ultimaAuditoria.hash},i=await O(this.llave,r),n=await ta(`${r.anterior}|${i.ct}`);return{n:t,hash:n,...i}}async _confirmarAuditoria(a){this.ultimaAuditoria={n:a.n,hash:a.hash},this._avisar()}async verificarAuditoria(){let a=await this.base.auditoria(),o="0";for(let t=0;t<a.length;t++){let r=a[t];if(r.n!==t+1)return{ok:!1,motivo:`Falta la entrada ${t+1}.`};let i=await R(this.llave,r).catch(()=>null);if(!i||i.anterior!==o)return{ok:!1,motivo:`Entrada ${r.n} alterada.`};if(await ta(`${o}|${r.ct}`)!==r.hash)return{ok:!1,motivo:`Entrada ${r.n} alterada.`};o=r.hash}return{ok:!0,total:a.length}}async leerAuditoria(a=100){let t=(await this.base.auditoria()).slice(-a).reverse();return Promise.all(t.map(r=>R(this.llave,r).catch(()=>({n:r.n,accion:"ilegible"}))))}_guardarConfig(a,o){return this._enCola(()=>this._guardarConfigYa(a,o))}async _guardarConfigYa(a,o){let t=await O(this.llave,this.config),r=await this._entradaAuditoria(a,o);await this.base.ponerConAuditoria("config","principal",t,r),await this._confirmarAuditoria(r)}_guardarProducto(a,o,t={}){return this._enCola(()=>this._guardarProductoYa(a,o,t))}async _guardarProductoYa(a,o,t){let r=await O(this.llave,a),i=await this._entradaAuditoria(o,{id:a.id,nombre:a.nombre,...t});await this.base.ponerConAuditoria("producto",a.id,r,i),this.productos.set(a.id,a),await this._confirmarAuditoria(i)}escuchar(a){return this.oyentes.add(a),()=>this.oyentes.delete(a)}_avisar(){for(let a of this.oyentes)try{a()}catch(o){console.error(o)}}get ajustes(){return this.config.ajustes}get categorias(){return this.config.categorias}get tasas(){return this.config.tasas}listaProductos(){return[...this.productos.values()].filter(a=>!a.archivado).sort((a,o)=>a.nombre.localeCompare(o.nombre,"es"))}contexto(a=this.config.tasas.aplicadas){return{tasas:a,categorias:this.config.categorias,redondeo:this.config.ajustes.redondeo}}evaluar(a,o){try{return Pa(a,this.contexto(o))}catch{return null}}async guardarProducto(a){let o=V(a);if(o.errores)return o;let t=this.productos.get(o.producto.id),r={...o.producto,precioAnterior:t?.precioAnterior??null},i={};if(t){for(let c of["costo","moneda","margen","precioManual","precioFijo","cantidad","tope"])t[c]!==r[c]&&(i[c]=[t[c],r[c]]);let n=this.evaluar(t)?.precio,s=this.evaluar(r)?.precio;n!=null&&s!=null&&n!==s&&(r.precioAnterior=n)}return await this._guardarProducto(r,t?"producto_editado":"producto_creado",i),{producto:r}}async archivarProducto(a){let o=this.productos.get(a);o&&await this._guardarProducto({...o,archivado:!0},"producto_archivado")}async recibirTasaRemota(a){if(!(a&&[a.usd,a.eur].every(i=>typeof i=="number"&&i>0&&i<1e5)))throw new Error("La tasa recibida no es válida.");let t={USD:a.usd,EUR:a.eur,MLC:typeof a.mlc=="number"?a.mlc:null,actualizado_en:a.actualizado_en,desactualizada:!!a.desactualizada,fuente:"elTOQUE"},r=this.config.tasas.disponibles;return(!r||r.actualizado_en!==t.actualizado_en||r.USD!==t.USD||r.EUR!==t.EUR)&&(this.config.tasas.disponibles=t,await this._guardarConfig("tasa_recibida",{USD:t.USD,EUR:t.EUR})),this.decisionTasa()}decisionTasa(){let{aplicadas:a,disponibles:o}=this.config.tasas;return o?a&&a.USD===o.USD&&a.EUR===o.EUR?{accion:"ignorar",cambio:0}:F(a,o,{umbral:this.config.ajustes.umbralSugerencia,confirmarDesde:this.config.ajustes.confirmarDesde}):{accion:"ignorar",cambio:0}}previsualizar(a){let o=[];for(let t of this.listaProductos()){let r=this.evaluar(t)?.precio??null,i=this.evaluar(t,a)?.precio??null;i!==null&&r!==i&&o.push({id:t.id,nombre:t.nombre,antes:r,despues:i})}return o}async aplicarTasas({USD:a,EUR:o,MLC:t=null},r="manual"){let i={USD:a,EUR:o,MLC:t,fecha:new Date().toISOString(),fuente:r},n=this.previsualizar(i);for(let c of n){let d=this.productos.get(c.id);c.antes!==null&&await this._guardarProducto({...d,precioAnterior:c.antes},"precio_recalculado",{antes:c.antes,despues:c.despues})}let s=this.config.tasas;return s.aplicadas=i,s.historial=[{fecha:i.fecha,USD:a,EUR:o,MLC:t,fuente:r},...s.historial].slice(0,400),s.ultimosCambios=n.map(c=>c.id),await this._guardarConfig("tasa_aplicada",{USD:a,EUR:o,MLC:t,fuente:r,productosCambiados:n.length}),n}async guardarAjustes(a){let o={...this.config.ajustes};[1,5,10,50].includes(a.redondeo)&&(o.redondeo=a.redondeo),typeof a.umbralSugerencia=="number"&&a.umbralSugerencia>=0&&a.umbralSugerencia<=.5&&(o.umbralSugerencia=a.umbralSugerencia),this.config.ajustes=o,typeof a.nombreNegocio=="string"&&(this.config.negocio.nombre=T(a.nombreNegocio,60)||this.config.negocio.nombre),await this._guardarConfig("ajustes_cambiados",a)}async guardarCategoria({id:a,nombre:o,margenPct:t}){let r=T(o,40),i=P(String(t));if(r.length<2)return{error:"Escribe el nombre de la categoría."};if(!Number.isFinite(i)||i<-99||i>1e3)return{error:"Margen no válido."};let n=this.config.categorias,s=n.find(c=>c.id===a);return s?(s.nombre=r,s.margen=i/100):n.push({id:Ua(),nombre:r,margen:i/100}),await this._guardarConfig("categoria_guardada",{nombre:r,margen:i}),{ok:!0}}alertas(a=new Date){let o={sobreTope:[],margenBajo:[],bajoMinimo:[],porAcabarse:[],vencidos:[],porVencer:[]},t=new Date(a.getTime()+7*864e5).toISOString().slice(0,10),r=a.toISOString().slice(0,10);for(let i of this.listaProductos()){let n=this.evaluar(i);n?.sobreTope&&o.sobreTope.push(i),n?.margenBajo&&o.margenBajo.push(i),n?.bajoMinimo&&o.bajoMinimo.push(i),i.minimo>0&&i.cantidad<=i.minimo&&o.porAcabarse.push(i),i.vence&&i.vence<r?o.vencidos.push(i):i.vence&&i.vence<=t&&o.porVencer.push(i)}return o}};var G=class{constructor(a){this.v=a}toString(){return this.v}},M=e=>new G(e),ae={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","`":"&#96;"},ee=e=>String(e??"").replace(/[&<>"'`]/g,a=>ae[a]);function ja(e){return e instanceof G?e.v:Array.isArray(e)?e.map(ja).join(""):e==null||e===!1?"":ee(e)}function l(e,...a){let o=e[0];for(let t=0;t<a.length;t++)o+=ja(a[t])+e[t+1];return M(o)}var m=(e,a=document)=>a.querySelector(e),la=(e,a=document)=>[...a.querySelectorAll(e)],y=(e,a="")=>M(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${a}>${e}</svg>`),h={inicio:y('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),productos:y('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),tasa:y('<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>'),ajustes:y('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'),mas:y('<path d="M12 5v14M5 12h14"/>'),atras:y('<path d="M15 18l-6-6 6-6"/>'),buscar:y('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),borrar:y('<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"/><path d="m18 9-6 6M12 9l6 6"/>'),candado:y('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),caja:y('<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>'),escudo:y('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),info:y('<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>'),sinRed:y('<path d="M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8a15 15 0 0 0-11.5-3.7M5 12.5a10 10 0 0 1 4.6-2.4M19 12.5a10 10 0 0 0-2-1.4M8.5 16a5 5 0 0 1 7 0M12 20h.01M3 3l18 18"/>'),editar:y('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>')},U;function $(e,{tipo:a="ok",ms:o=2600}={}){U||(U=document.createElement("div"),U.className="avisos",U.setAttribute("role","status"),U.setAttribute("aria-live","polite"),document.body.append(U));let t=document.createElement("div");t.className=`aviso-toast ${a==="error"?"error":""}`,t.innerHTML=String(l`${a==="ok"?M('<svg class="check" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12"/><path d="M7 12.5l3.2 3.2L17 9"/></svg>'):""}<span>${e}</span>`),U.replaceChildren(t),setTimeout(()=>{t.classList.add("saliendo"),setTimeout(()=>t.remove(),300)},o)}function j(e,{leerCampos:a=!1}={}){return new Promise(o=>{let t=document.createElement("div");t.className="velo",t.innerHTML=`<div class="hoja" role="dialog" aria-modal="true">${e}</div>`;let r=n=>{let s={};a&&t.querySelectorAll("input[id], select[id], textarea[id]").forEach(c=>{s[c.id]=c.value}),t.remove(),document.removeEventListener("keydown",i),o(a?{valor:n,campos:s}:n)},i=n=>{n.key==="Escape"&&r(null)};t.addEventListener("click",n=>{if(n.target===t)return r(null);let s=n.target.closest("[data-valor]");s&&r(s.dataset.valor)}),document.addEventListener("keydown",i),document.body.append(t),(t.querySelector("input")||t.querySelector("[data-valor]"))?.focus({preventScroll:!0})})}var te=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;function Da(e,a,o,t,r=600){if(!e||te()||a===o||a==null){e&&(e.textContent=t(o));return}let i=performance.now(),n=s=>{let c=Math.min(1,(s-i)/r),d=1-(1-c)**3;e.textContent=t(a+(o-a)*d),c<1?requestAnimationFrame(n):e.textContent=t(o)};requestAnimationFrame(n)}function A(e=15){try{navigator.vibrate?.(e)}catch{}}function Q(e,a=120,o=48){if(!e||e.length<2)return"";let t=Math.min(...e),i=Math.max(...e)-t||1,n=e.map((d,p)=>[p/(e.length-1)*(a-4)+2,o-4-(d-t)/i*(o-10)]),s=n.map((d,p)=>`${p?"L":"M"}${d[0].toFixed(1)} ${d[1].toFixed(1)}`).join(" "),c=`${s} L${n[n.length-1][0].toFixed(1)} ${o} L${n[0][0].toFixed(1)} ${o} Z`;return`<svg class="grafico" viewBox="0 0 ${a} ${o}" aria-hidden="true"><defs><linearGradient id="degradado-grafico" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FA2FF" stop-opacity=".35"/><stop offset="1" stop-color="#7FA2FF" stop-opacity="0"/></linearGradient></defs><path class="area" d="${c}"/><path class="linea" d="${s}"/></svg>`}var oe=["1","2","3","4","5","6","7","8","9","borrar","0","ok"];function da(e="Entrar"){return l`
    <div class="puntos" aria-hidden="true">${[0,1,2,3,4,5,6,7].map(a=>l`<i data-punto="${a}" class="${a>3?"oculto":""}"></i>`)}</div>
    <div class="teclado" role="group" aria-label="Teclado del PIN">
      ${oe.map(a=>a==="borrar"?l`<button type="button" class="accion" data-tecla="borrar" aria-label="Borrar">${h.borrar}</button>`:a==="ok"?l`<button type="button" class="accion" data-tecla="ok">${e}</button>`:l`<button type="button" data-tecla="${a}">${a}</button>`)}
    </div>`}function ua(e,a){let o="",t=!1,r=m(".puntos",e),i=()=>{let p=Math.max(4,o.length);r.querySelectorAll("i").forEach((u,g)=>{u.classList.toggle("lleno",g<o.length),u.classList.toggle("oculto",g>=p)})},n=async p=>{if(!t){if(p==="borrar")o=o.slice(0,-1);else if(p==="ok"){if(o.length<4){s();return}t=!0;try{await a(o)}finally{t=!1,o="",i()}return}else o.length<8&&(o+=p,A(8));i()}},s=()=>{r.classList.remove("temblar"),r.offsetWidth,r.classList.add("temblar"),A([30,40,30])},c=p=>{let u=p.target.closest("[data-tecla]");u&&n(u.dataset.tecla)},d=p=>{/^\d$/.test(p.key)?n(p.key):p.key==="Backspace"?n("borrar"):p.key==="Enter"&&n("ok")};return e.addEventListener("click",c),document.addEventListener("keydown",d),{limpiar:()=>document.removeEventListener("keydown",d),temblar:s}}function Ta(e,{alAbrir:a}){return{conNav:!1,html:l`
      <section class="bloqueo">
        <div class="arriba">
          <img src="iconos/icono-192.png" alt="" width="72" height="72">
          <h1>Escribe tu PIN</h1>
          <p id="mensaje-pin" role="alert"></p>
          ${da()}
        </div>
      </section>`,montar(o){let t=m("#mensaje-pin",o),r=null,i=s=>{clearInterval(r);let c=Date.now()+s,d=()=>{let p=Math.ceil((c-Date.now())/1e3);if(p<=0){clearInterval(r),t.textContent="Ya puedes intentar de nuevo.";return}t.textContent=`Demasiados intentos. Espera ${p>=60?`${Math.ceil(p/60)} min`:`${p} s`}.`};d(),r=setInterval(d,1e3)},n=ua(o,async s=>{t.textContent="Comprobando…";try{let c=await C.abrir(e.base,s);A(20),a(c)}catch(c){n.temblar(),c.message==="BLOQUEADO"||c.espera>0?i(c.espera):c.message==="PIN_INCORRECTO"?t.textContent=`PIN incorrecto. ${c.restantes>0?`Te quedan ${c.restantes} intentos antes de esperar.`:""}`:t.textContent=c.message}});return()=>{n.limpiar(),clearInterval(r)}}}}function Na(e,{alCrear:a}){return{conNav:!1,html:l`<section class="bienvenida" id="bienvenida"></section>`,montar(o){let t=m("#bienvenida",o),r={nombre:"",ejemplo:!0,pin:""},i=null,n=()=>{i?.(),t.innerHTML=String(l`
          <div class="hero">
            <img src="iconos/icono-192.png" alt="" width="96" height="96">
            <h1>PrecioListo</h1>
            <p>Sube el dólar. Tus precios, listos. Todo queda en tu teléfono, cifrado, y funciona sin internet.</p>
          </div>
          <div class="pasos-progreso" aria-hidden="true"><i class="activo"></i><i></i><i></i></div>
          <form id="f1">
            <div class="campo">
              <label for="nombre">¿Cómo se llama tu negocio?</label>
              <input id="nombre" name="nombre" autocomplete="organization" maxlength="60" placeholder="Ej.: Mipyme La Esquina" value="${r.nombre}" required>
            </div>
            <label class="interruptor">
              <span>Cargar productos de ejemplo<small>Pollo, aceite, arroz, café, detergente, refresco y cerveza. Los puedes borrar después.</small></span>
              <input type="checkbox" name="ejemplo" ${r.ejemplo?"checked":""}>
            </label>
            <button class="boton bloque" type="submit">Empezar</button>
          </form>`),m("#f1",t).addEventListener("submit",c=>{c.preventDefault();let d=new FormData(c.target);if(r.nombre=String(d.get("nombre")||"").trim(),r.ejemplo=d.get("ejemplo")==="on",r.nombre.length<2){$("Escribe el nombre de tu negocio.",{tipo:"error"});return}s(1)})},s=c=>{i?.(),t.innerHTML=String(l`
          <div class="bloqueo">
            <div class="arriba">
              <div class="pasos-progreso" aria-hidden="true"><i class="activo"></i><i class="activo"></i><i class="${c===2?"activo":""}"></i></div>
              <h1>${c===1?"Crea tu PIN de dueño":"Repite tu PIN"}</h1>
              <p id="msg">${c===1?"De 4 a 8 números. Protege tus datos y tus precios.":"Para confirmar que lo escribiste bien."}</p>
              ${da(c===1?"Seguir":"Crear")}
            </div>
          </div>`);let d=m("#msg",t),p=ua(t,async u=>{if(c===1){let f=ya(u);if(f){d.textContent=f,p.temblar();return}r.pin=u,s(2);return}if(u!==r.pin){d.textContent="No coincide. Vuelve a crearlo.",p.temblar(),setTimeout(()=>s(1),900);return}d.textContent="Preparando tu negocio…";let g=await C.crear(e.base,{nombreNegocio:r.nombre,pin:u,datosEjemplo:r.ejemplo});r.pin="",$("¡Listo! Tu negocio está creado"),a(g)});i=p.limpiar};return n(),()=>i?.()}}}function z(e){let{red:a}=e,t=e.almacen?.tasas?.disponibles,r=t?.actualizado_en?(Date.now()-new Date(t.actualizado_en))/36e5:null;return l`
    ${a.enLinea?"":l`<span class="chip">Sin conexión · funciona igual</span>`}
    ${a.consultando?l`<span class="chip info latiendo">Buscando tasa</span>`:""}
    ${t&&(t.desactualizada||r>12)?l`<span class="chip aviso">Tasa de referencia desactualizada</span>`:""}
    ${a.error&&a.enLinea&&!a.consultando?l`<span class="chip">${a.error}</span>`:""}`}function pa(e,a){let o=m("#chips-estado",a);o&&o.addEventListener("refrescar",()=>{o.innerHTML=String(z(e))})}function ma(e){let a=e.almacen.tasas,o=a.aplicadas;if(!o)return l`
      <section class="tarjeta tarjeta-tasa">
        <div class="etiqueta">Tasa en uso</div>
        <div class="tasa-principal"><span class="valor">—</span></div>
        <p class="tasa-pie">Todavía no hay tasa. ${a.disponibles?"Llegó una de referencia: revísala abajo.":"Escríbela a mano o conéctate a internet un momento."}</p>
      </section>`;let t=[...a.historial].reverse().map(r=>r.USD).slice(-30);return l`
    <section class="tarjeta tarjeta-tasa" aria-label="Tasa en uso">
      ${M(Q(t))}
      <div class="etiqueta">Dólar · tasa en uso</div>
      <div class="tasa-principal"><span class="valor num" id="valor-usd">${v(o.USD)}</span><span class="moneda">CUP</span></div>
      <div class="tasas-secundarias num">
        <div><span>EUR</span><b>${v(o.EUR)}</b></div>
        ${o.MLC?l`<div><span>MLC</span><b>${v(o.MLC)}</b></div>`:""}
      </div>
      <div class="tasa-pie">
        <span>Aplicada ${H(o.fecha)}</span><span>·</span>
        <span>${o.fuente==="manual"?"Escrita por ti":"elTOQUE · referencia, no oficial"}</span>
      </div>
    </section>`}function re(e){let a=e.almacen,o=a.tasas.disponibles,t=a.decisionTasa();if(!o)return"";if(t.accion==="ignorar"){let n=a.tasas.aplicadas;return n&&(n.USD!==o.USD||n.EUR!==o.EUR)?l`<p class="ayuda-tasa tarjeta">Referencia de hoy: USD ${v(o.USD)} (${w(D(n.USD,o.USD),1)}). Es un cambio pequeño: tus precios siguen igual.</p>`:""}let r=a.previsualizar({USD:o.USD,EUR:o.EUR}).length,i=a.tasas.aplicadas?D(a.tasas.aplicadas.USD,o.USD):null;return l`
    <div class="banner" role="status">
      <p><strong>Tasa de referencia nueva: USD ${v(o.USD)}</strong></p>
      <p>${i!==null?`${i>0?"Subió":"Bajó"} ${w(Math.abs(i),1)} respecto a la que usas. `:""}${r===1?"1 precio cambiaría.":`${r} precios cambiarían.`} Tú decides si actualizas.</p>
      <button class="boton chico" type="button" data-ir="tasa">Revisar precios</button>
    </div>`}function La(e){let a=e.almacen,o=a.listaProductos(),t=a.alertas(),r=[["peligro",t.sobreTope.length,"Superan el precio tope","Revisa los productos con tope oficial"],["peligro",t.vencidos.length,"Productos vencidos","Retíralos de la venta"],["aviso",t.margenBajo.length,"Margen por debajo del elegido","El costo subió o el precio quedó bajo"],["aviso",t.porVencer.length,"Vencen en 7 días","Piensa en una oferta"],["info",t.porAcabarse.length,"Por acabarse","Llegaron al mínimo de existencia"]].filter(n=>n[1]>0),i=new Intl.DateTimeFormat("es-CU",{weekday:"long",day:"numeric",month:"long"}).format(new Date);return{html:l`
      <header class="cabecera">
        <img class="logo-mini" src="iconos/icono-96.png" alt="" width="36" height="36">
        <h1>${a.config.negocio.nombre}<span class="sub">${i}</span></h1>
        <button class="boton-icono" type="button" id="bloquear" aria-label="Bloquear">${h.candado}</button>
      </header>
      <div class="chips" id="chips-estado" aria-live="polite">${z(e)}</div>
      <div class="escalonada">
        ${ma(e)}
        ${re(e)}
        ${o.length===0?l`
          <div class="tarjeta vacio">
            <div class="ilustracion">${h.productos}</div>
            <h3>Agrega tu primer producto</h3>
            <p>Escribe su costo, la moneda y cuánto quieres ganar. PrecioListo calcula el precio por ti.</p>
            <button class="boton" type="button" data-ir="producto">${h.mas}Agregar producto</button>
          </div>`:""}
        ${r.length?l`<section class="tarjeta"><h2>Para revisar</h2>
          ${r.map(([n,s,c,d])=>l`<button class="alerta ${n}" type="button" data-ir="productos"><i class="punto"></i><span class="txt">${c}<small>${d}</small></span><span class="cuenta num">${s}</span></button>`)}
        </section>`:""}
        <div class="accesos">
          <button class="acceso" type="button" data-ir="producto"><span class="ico">${h.mas}</span><b>Agregar producto</b><span>Una sola vez, luego todo se recalcula</span></button>
          <button class="acceso" type="button" data-ir="tasa"><span class="ico">${h.tasa}</span><b>Cambiar tasa</b><span>La de El Toque o la que pagaste</span></button>
        </div>
        ${o.length?l`<section class="tarjeta"><h2>Tu negocio</h2>
          <div class="previa">
            <div><span>Productos</span><b class="num">${o.length}</b></div>
            <div><span>Unidades</span><b class="num">${v(o.reduce((n,s)=>n+(s.cantidad||0),0))}</b></div>
            <div><span>Alertas</span><b class="num">${r.reduce((n,s)=>n+s[1],0)}</b></div>
          </div></section>`:""}
      </div>`,montar(n){pa(e,n),m("#bloquear",n).addEventListener("click",()=>e.bloquear())}}}var xa=e=>e.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();function ne(e,a,o){let t=e.almacen.evaluar(a),r=e.almacen.categorias.find(s=>s.id===a.categoriaId),i=t&&a.precioAnterior!=null?t.precio-a.precioAnterior:0,n=o?.has(a.id);return l`
    <button class="item" type="button" data-ir="producto" data-id="${a.id}">
      <span class="nombre">${a.nombre}</span>
      <span class="detalle num">${r?`${r.nombre} · `:""}${v(a.costo)} ${a.moneda} · ${v(a.cantidad||0)} u</span>
      <span class="lado">
        <span class="precio num ${n?"destello":""}" ${n?l`data-desde="${a.precioAnterior??""}" data-hasta="${t?.precio??""}"`:""}>${t?v(t.precio):"—"}<small>CUP</small></span>
        ${i?l`<span class="cambio num ${i>0?"sube":"baja"}">${i>0?"↑":"↓"} ${v(Math.abs(i))} · antes ${v(a.precioAnterior)}</span>`:""}
        ${t&&(t.sobreTope||t.margenBajo||t.origen!=="sugerido")?l`<span class="marcas">
          ${t.sobreTope?l`<span class="chip peligro">Supera tope</span>`:""}
          ${t.margenBajo?l`<span class="chip aviso">Margen bajo</span>`:""}
          ${t.origen==="fijo"?l`<span class="chip">Fijo</span>`:""}
          ${t.origen==="manual"?l`<span class="chip">Manual</span>`:""}
        </span>`:""}
      </span>
    </button>`}function Ia(e){let a=e.almacen,o=e.filtroProductos||(e.filtroProductos={texto:"",categoria:""}),t=e.recienAplicado?new Set(e.recienAplicado):null;e.recienAplicado=null;let r=()=>{let n=xa(o.texto.trim());return a.listaProductos().filter(s=>(!o.categoria||s.categoriaId===o.categoria)&&(!n||xa(s.nombre).includes(n)||s.codigo&&s.codigo.includes(n)))},i=n=>n.length?l`<div class="lista ${t?"":"escalonada"}">${n.map(s=>ne(e,s,t))}</div>`:a.listaProductos().length?l`<div class="vacio"><h3>Nada con «${o.texto}»</h3><p>Prueba con otra palabra o quita el filtro.</p></div>`:l`<div class="vacio"><div class="ilustracion">${h.productos}</div><h3>Agrega tu primer producto</h3>
          <p>Cárgalo una sola vez con su costo y su margen. Cuando cambie la tasa, el precio se recalcula solo.</p>
          <button class="boton" type="button" data-ir="producto">${h.mas}Agregar producto</button></div>`;return{html:l`
      <header class="cabecera"><h1>Productos<span class="sub">${a.listaProductos().length} en total · redondeo a ${a.ajustes.redondeo} CUP</span></h1></header>
      <div class="buscador">
        <div class="campo-buscar">${h.buscar}<input type="search" id="buscar" placeholder="Buscar por nombre o código" value="${o.texto}" autocomplete="off" aria-label="Buscar"></div>
        ${a.categorias.length?l`<div class="filtros" role="group" aria-label="Categorías">
          <button class="filtro" type="button" data-cat="" aria-pressed="${!o.categoria}">Todas</button>
          ${a.categorias.map(n=>l`<button class="filtro" type="button" data-cat="${n.id}" aria-pressed="${o.categoria===n.id}">${n.nombre}</button>`)}
        </div>`:""}
      </div>
      <div id="lista">${i(r())}</div>
      <button class="fab" type="button" data-ir="producto" aria-label="Agregar producto">${h.mas}</button>`,montar(n){let s=m("#lista",n),c;m("#buscar",n).addEventListener("input",d=>{clearTimeout(c),c=setTimeout(()=>{o.texto=d.target.value,s.innerHTML=String(i(r()))},90)}),n.addEventListener("click",d=>{let p=d.target.closest("[data-cat]");p&&(o.categoria=p.dataset.cat,la("[data-cat]",n).forEach(u=>u.setAttribute("aria-pressed",String(u===p))),s.innerHTML=String(i(r())))});for(let d of la(".precio[data-hasta]",n)){let p=Number(d.dataset.desde),u=Number(d.dataset.hasta),g=d.querySelector("small").outerHTML;if(Number.isFinite(p)&&p>0&&Number.isFinite(u)){let f=document.createTextNode("");d.replaceChildren(f),d.insertAdjacentHTML("beforeend",g),Da({set textContent(S){f.textContent=S}},p,u,S=>v(Math.round(S)))}}}}}var Ra=e=>e==null?"":String(Math.round(e*1e3)/10).replace(".",","),_=e=>e==null?"":String(e).replace(".",",");async function ie(e){if(!e||!/^image\/(jpeg|png|webp)$/.test(e.type)||e.size>15e6)throw new Error("Usa una foto JPG o PNG.");let a=await createImageBitmap(e),o=Math.min(1,320/Math.max(a.width,a.height)),t=document.createElement("canvas");return t.width=Math.round(a.width*o),t.height=Math.round(a.height*o),t.getContext("2d").drawImage(a,0,0,t.width,t.height),a.close?.(),t.toDataURL("image/jpeg",.72)}function _a(e,{id:a}){let o=e.almacen,t=a?o.productos.get(a):null,r=t||{moneda:"USD",categoriaId:o.categorias[0]?.id||"",cantidad:0,minimo:0},i=t?.foto||null;return{html:l`
      <header class="cabecera">
        <button class="boton-icono" type="button" data-ir="productos" data-atras aria-label="Volver">${h.atras}</button>
        <h1>${t?"Editar producto":"Nuevo producto"}</h1>
      </header>
      <form id="form-producto" novalidate>
        <div class="previa" id="previa" aria-live="polite"></div>
        <div class="campo">
          <label for="nombre">Nombre</label>
          <input id="nombre" name="nombre" maxlength="80" value="${r.nombre||""}" placeholder="Ej.: Aceite 1 L" autocomplete="off">
          <span class="error" data-error="nombre"></span>
        </div>
        <div class="dos-columnas">
          <div class="campo">
            <label for="costo">Costo</label>
            <input id="costo" name="costo" inputmode="decimal" value="${_(r.costo)}" placeholder="2,20" autocomplete="off">
            <span class="error" data-error="costo"></span>
          </div>
          <div class="campo">
            <span class="etiqueta-campo" id="et-moneda">Moneda</span>
            <div class="segmentado" role="group" aria-labelledby="et-moneda">
              ${B.map(n=>l`<button type="button" data-moneda="${n}" aria-pressed="${r.moneda===n}">${n}</button>`)}
            </div>
          </div>
        </div>
        <div class="dos-columnas">
          <div class="campo">
            <label for="categoria">Categoría</label>
            <select id="categoria" name="categoriaId">
              <option value="">Sin categoría</option>
              ${o.categorias.map(n=>l`<option value="${n.id}" ${r.categoriaId===n.id?"selected":""}>${n.nombre} · ${w(n.margen)}</option>`)}
            </select>
          </div>
          <div class="campo">
            <label for="margen">Margen %</label>
            <input id="margen" name="margenPct" inputmode="decimal" value="${Ra(t?.margen)}" placeholder="De la categoría" autocomplete="off">
            <span class="error" data-error="margen"></span>
          </div>
        </div>
        <details class="mas" id="sin-margen">
          <summary>¿No sabes tu margen? Calcúlalo con tu precio actual</summary>
          <div class="dos-columnas">
            <div class="campo"><label for="precio-actual">Precio de venta actual (CUP)</label><input id="precio-actual" inputmode="decimal" placeholder="1 200"></div>
            <div class="campo"><span class="etiqueta-campo">&nbsp;</span><button class="boton secundario" type="button" id="calcular-margen">Calcular</button></div>
          </div>
        </details>
        <div class="dos-columnas">
          <div class="campo">
            <label for="cantidad">Cantidad</label>
            <input id="cantidad" name="cantidad" inputmode="decimal" value="${_(r.cantidad)}">
            <span class="error" data-error="cantidad"></span>
          </div>
          <div class="campo">
            <label for="minimo">Mínimo de existencia</label>
            <input id="minimo" name="minimo" inputmode="decimal" value="${_(r.minimo)}">
            <span class="error" data-error="minimo"></span>
          </div>
        </div>
        <details class="mas" ${t&&(t.tope||t.precioManual||t.vence||t.codigo||t.foto)?"open":""}>
          <summary>Más opciones: tope, precio fijo, vencimiento, foto</summary>
          <div class="campo">
            <label for="tope">Precio tope oficial (CUP)</label>
            <input id="tope" name="tope" inputmode="decimal" value="${_(r.tope)}" placeholder="Si el producto tiene tope">
            <span class="ayuda">Te avisamos si el precio lo supera.</span>
            <span class="error" data-error="tope"></span>
          </div>
          <div class="campo">
            <label for="precio-manual">Precio a mano (CUP)</label>
            <input id="precio-manual" name="precioManual" inputmode="decimal" value="${_(r.precioManual)}" placeholder="Vacío = usar el sugerido">
            <span class="ayuda">La app solo sugiere: aquí decides tú.</span>
            <span class="error" data-error="precioManual"></span>
          </div>
          <label class="interruptor">
            <span>Precio fijo<small>No cambia aunque cambie la tasa.</small></span>
            <input type="checkbox" name="precioFijo" ${r.precioFijo?"checked":""}>
          </label>
          <div class="dos-columnas">
            <div class="campo"><label for="vence">Vence</label><input type="date" id="vence" name="vence" value="${r.vence||""}"><span class="error" data-error="vence"></span></div>
            <div class="campo"><label for="codigo">Código de barras</label><input id="codigo" name="codigo" inputmode="numeric" value="${r.codigo||""}" placeholder="Opcional"></div>
          </div>
          <div class="campo">
            <span class="etiqueta-campo">Foto (opcional)</span>
            <label class="boton secundario chico" for="foto">${t?.foto?"Cambiar foto":"Tomar o elegir foto"}</label>
            <input class="sr" type="file" id="foto" accept="image/jpeg,image/png,image/webp" capture="environment">
            <span class="ayuda" id="foto-estado">${t?.foto?"Tiene foto.":"Se guarda pequeña y cifrada en tu teléfono."}</span>
          </div>
        </details>
        <div class="acciones-form">
          <button class="boton bloque" type="submit" id="guardar">Guardar</button>
          ${t?l`<button class="boton fantasma" type="button" id="archivar">Quitar de la lista</button>`:""}
        </div>
      </form>`,montar(n){let s=m("#form-producto",n),c=r.moneda,d=()=>{let u=new FormData(s);return{id:t?.id,nombre:u.get("nombre"),costo:u.get("costo"),moneda:c,categoriaId:u.get("categoriaId"),margenPct:u.get("margenPct"),cantidad:u.get("cantidad"),minimo:u.get("minimo"),tope:u.get("tope"),precioManual:u.get("precioManual"),precioFijo:u.get("precioFijo")==="on",vence:u.get("vence"),codigo:u.get("codigo"),foto:i}},p=()=>{let u=V({...d(),nombre:"xx"}),g=m("#previa",n);if(u.errores||!o.tasas.aplicadas&&c!=="CUP"){g.innerHTML=String(l`<div class="principal"><span>Precio</span><b>—</b></div><div><span>Mínimo</span><b>—</b></div><div><span>Margen</span><b>—</b></div>`);return}let f=o.evaluar(u.producto);if(!f){g.innerHTML=String(l`<div class="principal"><span>Precio</span><b>Falta tasa</b></div>`);return}g.innerHTML=String(l`
          <div class="principal"><span>${f.origen==="sugerido"?"Sugerido":"Precio"}</span><b class="num">${v(f.precio)}</b></div>
          <div><span>Mínimo</span><b class="num">${v(f.minimo)}</b></div>
          <div><span>Margen</span><b class="num ${f.margenBajo?"sube":""}">${f.margenReal===null?"—":w(f.margenReal)}</b></div>
          ${f.sobreTope?l`<span class="chip peligro">Supera el tope</span>`:""}
          ${f.bajoMinimo?l`<span class="chip peligro">Por debajo del costo de hoy</span>`:""}`)};s.addEventListener("input",u=>{if(u.target.getAttribute("aria-invalid")){u.target.removeAttribute("aria-invalid");let g=u.target.parentElement.querySelector(".error");g&&(g.textContent="")}p()}),s.addEventListener("change",p),n.addEventListener("click",u=>{let g=u.target.closest("[data-moneda]");g&&(c=g.dataset.moneda,n.querySelectorAll("[data-moneda]").forEach(f=>f.setAttribute("aria-pressed",String(f===g))),p())}),m("#calcular-margen",n).addEventListener("click",()=>{let u=P(String(s.costo.value)),g=P(String(m("#precio-actual",n).value).replace(/\s/g,""));if(!(u>0)||!(g>0)){$("Escribe el costo y tu precio actual.",{tipo:"error"});return}if(c!=="CUP"&&!o.tasas.aplicadas){$("Primero aplica una tasa.",{tipo:"error"});return}let f=ia(u,c,g,o.tasas.aplicadas||{});s.margenPct.value=Ra(f),$(`Tu margen hoy es ${w(f,1)}`,{tipo:"info"}),p()}),m("#foto",n).addEventListener("change",async u=>{let g=m("#foto-estado",n);g.textContent="Preparando foto…";try{i=await ie(u.target.files[0]),g.textContent="Foto lista."}catch(f){g.textContent=f.message}u.target.value=""}),s.addEventListener("submit",async u=>{u.preventDefault();let g=m("#guardar",n);g.disabled=!0;try{let f=await o.guardarProducto(d());if(n.querySelectorAll("[data-error]").forEach(S=>{S.textContent=""}),n.querySelectorAll("[aria-invalid]").forEach(S=>S.removeAttribute("aria-invalid")),f.errores){for(let[S,Va]of Object.entries(f.errores)){let W=n.querySelector(`[data-error="${S}"]`);W&&(W.textContent=Va),W?.previousElementSibling?.setAttribute?.("aria-invalid","true")}(f.errores.tope||f.errores.precioManual||f.errores.vence)&&(n.querySelectorAll("details.mas")[1].open=!0),$("Revisa los campos marcados.",{tipo:"error"});return}A(20),$(t?"Cambios guardados":"Producto guardado"),e.ir("productos",{},{atras:!0})}finally{g.disabled=!1}}),m("#archivar",n)?.addEventListener("click",async()=>{await j(String(l`<h2>¿Quitar «${t.nombre}» de la lista?</h2><p>No se borra: queda guardado en el historial y en el registro de cambios.</p>
          <div class="fila-botones"><button class="boton secundario" data-valor="no">Cancelar</button><button class="boton peligro" data-valor="si">Quitar</button></div>`))==="si"&&(await o.archivarProducto(t.id),$("Producto quitado de la lista"),e.ir("productos",{},{atras:!0}))}),p(),t||setTimeout(()=>s.nombre.focus({preventScroll:!0}),250)}}}async function qa(e,a,o){let t=e.almacen,r=t.previsualizar(a),i=t.tasas.aplicadas,n=F(i,a,{umbral:0,confirmarDesde:t.ajustes.confirmarDesde}),s=i?D(i.USD,a.USD):null,c=n.accion==="confirmar";if(await j(String(l`
    <h2>${c?"Cambio grande de tasa":"Actualizar precios"}</h2>
    <p>${i?`USD ${v(i.USD)} → ${v(a.USD)} (${s>0?"+":""}${w(s,1)}). `:`USD ${v(a.USD)}. `}
      ${c?"La tasa cambió más de un 10 %. Revisa bien antes de aplicar.":""}
      ${r.length?`${r.length} ${r.length===1?"precio cambia":"precios cambian"}:`:"Ningún precio cambia con esta tasa."}</p>
    ${r.length?l`<div class="cambios">${r.slice(0,60).map(u=>l`<div><span>${u.nombre}</span><b class="num">${u.antes==null?"—":v(u.antes)} → ${v(u.despues)}</b></div>`)}
      ${r.length>60?l`<div><span>y ${r.length-60} más…</span></div>`:""}</div>`:""}
    <div class="fila-botones"><button class="boton secundario" data-valor="no">Ahora no</button><button class="boton" data-valor="si">Aplicar tasa</button></div>`))!=="si")return!1;let p=await t.aplicarTasas(a,o);return A(20),e.recienAplicado=p.map(u=>u.id),$(p.length?`${p.length} ${p.length===1?"precio actualizado":"precios actualizados"}`:"Tasa aplicada"),!0}function ka(e){let a=e.almacen,{aplicadas:o,disponibles:t,historial:r}=a.tasas,i=t&&(!o||o.USD!==t.USD||o.EUR!==t.EUR),n=[...r].reverse().map(s=>s.USD).slice(-30);return{html:l`
      <header class="cabecera"><h1>Tasa<span class="sub">Recalcula todos tus precios de una vez</span></h1></header>
      <div class="chips" id="chips-estado" aria-live="polite">${z(e)}</div>
      <div class="escalonada">
        ${ma(e)}
        ${t?l`<section class="tarjeta">
          <h2>Referencia de elTOQUE</h2>
          <div class="previa">
            <div class="principal"><span>USD</span><b class="num">${v(t.USD)}</b></div>
            <div><span>EUR</span><b class="num">${v(t.EUR)}</b></div>
            <div><span>MLC</span><b class="num">${t.MLC?v(t.MLC):"—"}</b></div>
          </div>
          <p class="ayuda">Actualizada ${H(t.actualizado_en)}. Es una tasa de referencia del mercado informal, no la tasa oficial.</p>
          ${i?l`<button class="boton bloque" type="button" id="usar-referencia">Ver cambios y aplicar</button>`:l`<span class="chip ok">Ya la estás usando</span>`}
        </section>`:l`<section class="tarjeta"><h2>Referencia de elTOQUE</h2><p class="ayuda">Aún no llega. Se descarga sola cuando hay internet (pocos bytes).</p>
          <button class="boton secundario chico" type="button" id="buscar-ahora">Buscar ahora</button></section>`}
        <section class="tarjeta">
          <h2>La tasa que pagaste</h2>
          <form id="form-tasa" novalidate>
            <div class="dos-columnas">
              <div class="campo"><label for="usd">USD</label><input id="usd" name="usd" inputmode="decimal" value="${o?String(o.USD).replace(".",","):""}" placeholder="455"></div>
              <div class="campo"><label for="eur">EUR</label><input id="eur" name="eur" inputmode="decimal" value="${o?String(o.EUR).replace(".",","):""}" placeholder="500"></div>
            </div>
            <span class="error" id="error-tasa" role="alert"></span>
            <button class="boton secundario bloque" type="submit">Ver cambios y aplicar</button>
          </form>
        </section>
        ${r.length?l`<section class="tarjeta">
          <h2>Historial de tasas aplicadas</h2>
          ${n.length>1?l`<div class="grafico-grande">${M(Q(n,320,80).replace('class="grafico"','class="grafico-ancho"'))}</div>`:""}
          <div class="historial-tasas num">${r.slice(0,15).map(s=>l`<div><span>${new Date(s.fecha).toLocaleString("es-CU",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span><b>USD ${v(s.USD)}</b><span>${s.fuente==="manual"?"a mano":"elTOQUE"}</span></div>`)}</div>
        </section>`:""}
      </div>`,montar(s){pa(e,s),m("#buscar-ahora",s)?.addEventListener("click",()=>e.consultarTasa({forzar:!0})),m("#usar-referencia",s)?.addEventListener("click",async()=>{await qa(e,{USD:t.USD,EUR:t.EUR,MLC:t.MLC},"elTOQUE")&&e.ir("productos")}),m("#form-tasa",s).addEventListener("submit",async c=>{c.preventDefault();let d=m("#error-tasa",s);try{let p=sa(c.target.usd.value),u=sa(c.target.eur.value);d.textContent="",await qa(e,{USD:p,EUR:u,MLC:t?.MLC??o?.MLC??null},"manual")&&e.ir("productos")}catch(p){d.textContent=p.message}})}}}var se={crear_negocio:"Creó el negocio",producto_ejemplo:"Producto de ejemplo",producto_creado:"Agregó producto",producto_editado:"Editó producto",producto_archivado:"Quitó producto",precio_recalculado:"Precio recalculado",tasa_recibida:"Llegó tasa de referencia",tasa_aplicada:"Aplicó tasa",ajustes_cambiados:"Cambió ajustes",categoria_guardada:"Guardó categoría"};function Oa(e){let a=e.almacen,o=a.ajustes,t=new Date().getFullYear();return{html:l`
      <header class="cabecera"><h1>Ajustes</h1></header>
      <div class="escalonada">
        <div>
          <p class="titulo-grupo">Negocio</p>
          <div class="grupo">
            <form class="bloque-ajuste" id="form-negocio">
              <div class="campo"><label for="nombre-negocio">Nombre del negocio</label><input id="nombre-negocio" maxlength="60" value="${a.config.negocio.nombre}"></div>
              <button class="boton secundario chico" type="submit">Guardar nombre</button>
            </form>
          </div>
        </div>
        <div>
          <p class="titulo-grupo">Precios</p>
          <div class="grupo">
            <div class="bloque-ajuste">
              <span class="etiqueta-campo">Redondear hacia arriba a (CUP)</span>
              <div class="segmentado" role="group" aria-label="Redondeo">${[1,5,10,50].map(r=>l`<button type="button" data-redondeo="${r}" aria-pressed="${o.redondeo===r}">${r}</button>`)}</div>
            </div>
            <div class="bloque-ajuste">
              <span class="etiqueta-campo">Sugerir actualizar precios cuando la tasa cambie</span>
              <div class="segmentado" role="group" aria-label="Umbral de sugerencia">${[.01,.03,.05,.1].map(r=>l`<button type="button" data-umbral="${r}" aria-pressed="${o.umbralSugerencia===r}">${w(r)}</button>`)}</div>
              <p class="ayuda">Así no cambias precios por cada movimiento pequeño.</p>
            </div>
          </div>
        </div>
        <div>
          <p class="titulo-grupo">Categorías y margen</p>
          <div class="grupo">
            ${a.categorias.map(r=>l`<button class="fila" type="button" data-categoria="${r.id}"><span>${r.nombre}</span><b class="num">${w(r.margen)}</b></button>`)}
            <button class="fila" type="button" data-categoria=""><span>Agregar categoría</span>${h.mas}</button>
          </div>
        </div>
        <div>
          <p class="titulo-grupo">Seguridad</p>
          <div class="grupo">
            <button class="fila" type="button" id="bloquear"><span>Bloquear ahora<small>Se bloquea solo tras 5 min sin uso</small></span>${h.candado}</button>
            <button class="fila" type="button" id="auditoria"><span>Registro de cambios<small>Quién cambió qué y cuándo. No se puede borrar.</small></span>${h.escudo}</button>
          </div>
        </div>
        <div>
          <p class="titulo-grupo">Acerca de</p>
          <div class="grupo">
            <div class="fila"><span>PrecioListo<small>Versión ${e.version}</small></span></div>
            <div class="fila"><span>Contacto y soporte<small>WhatsApp: [TU WHATSAPP] · Telegram: [TU USUARIO]</small></span></div>
            <div class="fila"><span>Tus datos<small>Se guardan cifrados solo en este teléfono. Nada sale sin tu permiso.</small></span></div>
          </div>
          <p class="legal">© ${t} PrecioListo. Todos los derechos reservados.<br>La tasa mostrada es una referencia, no la tasa oficial.</p>
        </div>
      </div>`,montar(r){m("#form-negocio",r).addEventListener("submit",async i=>{i.preventDefault(),await a.guardarAjustes({nombreNegocio:m("#nombre-negocio",r).value}),$("Nombre guardado")}),r.addEventListener("click",async i=>{let n=i.target.closest("[data-redondeo]"),s=i.target.closest("[data-umbral]"),c=i.target.closest("[data-categoria]");if(n)await a.guardarAjustes({redondeo:Number(n.dataset.redondeo)}),r.querySelectorAll("[data-redondeo]").forEach(d=>d.setAttribute("aria-pressed",String(d===n))),$(`Redondeo a ${n.dataset.redondeo} CUP`);else if(s)await a.guardarAjustes({umbralSugerencia:Number(s.dataset.umbral)}),r.querySelectorAll("[data-umbral]").forEach(d=>d.setAttribute("aria-pressed",String(d===s))),$("Guardado");else if(c){let d=a.categorias.find(g=>g.id===c.dataset.categoria),p=await j(String(l`
            <h2>${d?"Editar categoría":"Nueva categoría"}</h2>
            <div class="campo"><label for="cat-nombre">Nombre</label><input id="cat-nombre" maxlength="40" value="${d?.nombre||""}" placeholder="Ej.: Lácteos"></div>
            <div class="campo"><label for="cat-margen">Margen %</label><input id="cat-margen" inputmode="decimal" value="${d?String(Math.round(d.margen*1e3)/10).replace(".",","):""}" placeholder="25"></div>
            <div class="fila-botones"><button class="boton secundario" data-valor="no">Cancelar</button><button class="boton" data-valor="si">Guardar</button></div>`),{leerCampos:!0});if(p.valor!=="si")return;let u=await a.guardarCategoria({id:d?.id,nombre:p.campos["cat-nombre"],margenPct:p.campos["cat-margen"]});u.error?$(u.error,{tipo:"error"}):($("Categoría guardada"),e.ir("ajustes"))}else if(i.target.closest("#bloquear"))e.bloquear();else if(i.target.closest("#auditoria")){let[d,p]=await Promise.all([a.leerAuditoria(40),a.verificarAuditoria()]);await j(String(l`
            <h2>Registro de cambios</h2>
            <p>${p.ok?`Completo y sin alteraciones (${p.total} entradas).`:`Atención: ${p.motivo}`}</p>
            <div class="cambios">${d.map(u=>l`<div><span>${se[u.accion]||u.accion}${u.detalle?.nombre?` · ${u.detalle.nombre}`:""}</span><b class="num">${u.fecha?new Date(u.fecha).toLocaleString("es-CU",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):""}</b></div>`)}</div>
            <button class="boton bloque secundario" data-valor="ok">Cerrar</button>`))}})}}}var ce="0.3.0",le="https://raw.githubusercontent.com/armandoprado2002-rgb/preciolisto-tasas/main/servidor-tasas/publico/tasa.json",de=30,K={inicio:La,productos:Ia,producto:_a,tasa:ka,ajustes:Oa},ue=[["inicio","Inicio"],["productos","Productos"],["tasa","Tasa"],["ajustes","Ajustes"]],b={base:null,almacen:null,ruta:null,params:{},red:{enLinea:navigator.onLine,consultando:!1,error:null,ultimaConsulta:0},recienAplicado:null,version:ce,ir:q,bloquear:J,consultarTasa:k,refrescar:Ba},N=null;function ga(e,{conNav:a=!0,atras:o=!1}={}){N?.(),N=null;let t=m("#app"),r=a?l`<nav class="nav" aria-label="Secciones">${ue.map(([i,n])=>l`
      <button type="button" data-ir="${i}" ${b.ruta===i||i==="productos"&&b.ruta==="producto"?M('aria-current="page"'):""}>${h[i]}<span>${n}</span></button>`)}</nav>`:"";t.innerHTML=String(l`<main class="pantalla ${a?"":"sin-nav"} ${o?"atras":""}">${e}</main>${r}`),window.scrollTo(0,0)}function q(e,a={},{atras:o=!1}={}){if(!b.almacen)return;let t=K[e]||K.inicio;b.ruta=K[e]?e:"inicio",b.params=a;let r=t(b,a);ga(r.html,{conNav:r.conNav!==!1,atras:o}),N=r.montar?.(m("#app main"))||null,history.replaceState(null,"",`#${b.ruta}`)}function Ba(){if(b.almacen&&b.ruta&&b.ruta!=="producto"){let e=window.scrollY;q(b.ruta,b.params),m("#app main")?.style.setProperty("animation","none"),window.scrollTo(0,e)}}var fa=Date.now(),ba=0,Fa=Ca*6e4;function J(){b.almacen=null,b.ruta=null,N?.();let e=Ta(b,{alAbrir:Ha});ga(e.html,{conNav:!1}),N=e.montar(m("#app main"))}function Ha(e){b.almacen=e,fa=Date.now(),e.danados&&$(`${e.danados} registro(s) dañado(s) no se pudieron leer. Restaura una copia si falta algo.`,{tipo:"error",ms:6e3});let a=location.hash.slice(1);q(K[a]&&a!=="producto"?a:"inicio"),k()}for(let e of["pointerdown","keydown"])addEventListener(e,()=>{fa=Date.now()},{passive:!0});setInterval(()=>{b.almacen&&Date.now()-fa>Fa&&J()},15e3);document.addEventListener("visibilitychange",()=>{document.hidden?ba=Date.now():b.almacen&&ba&&Date.now()-ba>Fa?J():b.almacen&&k()});document.addEventListener("click",e=>{let a=e.target.closest("[data-ir]");a&&(e.preventDefault(),q(a.dataset.ir,a.dataset.id?{id:a.dataset.id}:{},{atras:a.hasAttribute("data-atras")}))});addEventListener("popstate",()=>{b.almacen&&b.ruta!=="inicio"&&q("inicio",{},{atras:!0})});async function k({forzar:e=!1}={}){let a=b.almacen;if(!a||b.red.consultando||!navigator.onLine||!e&&Date.now()-b.red.ultimaConsulta<de*6e4)return;b.red.consultando=!0,Y();let o=new AbortController,t=setTimeout(()=>o.abort(),12e3);try{let r=await fetch(le,{cache:"no-store",signal:o.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw new Error(`Servidor de tasas respondió ${r.status}`);let i=await r.json();await a.recibirTasaRemota(i),b.red.error=null,b.red.ultimaConsulta=Date.now()}catch(r){b.red.error=r.name==="AbortError"?"La conexión está muy lenta.":"No se pudo consultar la tasa."}finally{clearTimeout(t),b.red.consultando=!1,b.almacen===a&&(b.ruta==="inicio"||b.ruta==="tasa")?Ba():Y()}}setInterval(()=>{document.hidden||k()},5*6e4);function Y(){let e=m("#chips-estado");e&&e.dispatchEvent(new CustomEvent("refrescar"))}addEventListener("online",()=>{b.red.enLinea=!0,Y(),k({forzar:!0})});addEventListener("offline",()=>{b.red.enLinea=!1,Y()});addEventListener("unhandledrejection",e=>{console.error(e.reason),$(e.reason?.message?.length<160?e.reason.message:"Algo falló. Tus datos guardados están a salvo; intenta de nuevo.",{tipo:"error",ms:5e3})});async function pe(){try{b.base=await ha()}catch(e){m("#app").innerHTML=String(l`<main class="pantalla sin-nav"><div class="vacio"><h3>No se pueden guardar datos</h3><p>${e.message}</p></div></main>`);return}if(await C.existe(b.base))J();else{let e=Na(b,{alCrear:Ha});ga(e.html,{conNav:!1}),N=e.montar(m("#app main"))}"serviceWorker"in navigator&&location.protocol==="https:"&&navigator.serviceWorker.register("sw.js").catch(()=>{})}pe();export{ce as VERSION};
