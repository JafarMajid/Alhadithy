import * as THREE from 'three';
import {GLTFLoader} from './vendor/examples/jsm/loaders/GLTFLoader.js';

const $=id=>document.getElementById(id);
const mobile=matchMedia('(max-width: 700px)').matches || navigator.connection?.saveData;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
const lerp=THREE.MathUtils.lerp;
const scene=new THREE.Scene();scene.background=new THREE.Color('#eeece5');
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.05,180);
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:$('stage'),antialias:!mobile,alpha:false,powerPreference:'low-power'});}catch(error){fail(error);}
function fail(error){console.error(error);document.body.classList.add('failed');$('fallback').style.display='block';$('status').textContent='3D unavailable';}
if(renderer){
renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.75));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
const chairRoot=new THREE.Group();scene.add(chairRoot);
const solid=new THREE.Group(),wire=new THREE.Group();chairRoot.add(solid,wire);
const chairMat=new THREE.MeshStandardMaterial({color:0x92928c,roughness:.62,metalness:0,transparent:true});
const wireMat=new THREE.MeshBasicMaterial({color:0x66705c,wireframe:true,transparent:true,opacity:.27,depthWrite:false});
const studio=new THREE.Group();scene.add(studio);
const main=new THREE.PointLight(0xfff5e7,58,18,2);main.position.set(3,3.4,4);studio.add(main);
const rim=new THREE.PointLight(0xffffff,78,16,2);rim.position.set(-3,2.2,-2.7);studio.add(rim);
const fill=new THREE.AmbientLight(0xfff7e9,1.05);studio.add(fill);
// Shadow-only receiver: untouched pixels remain exactly the flat background color.
const studioShadowLight=new THREE.DirectionalLight(0xfff4df,.65);studioShadowLight.position.set(-3,6,4);studio.add(studioShadowLight,studioShadowLight.target);
studioShadowLight.castShadow=true;studioShadowLight.shadow.mapSize.set(mobile?512:1024,mobile?512:1024);studioShadowLight.shadow.camera.left=-2.8;studioShadowLight.shadow.camera.right=2.8;studioShadowLight.shadow.camera.top=2.8;studioShadowLight.shadow.camera.bottom=-2.8;studioShadowLight.shadow.camera.near=.1;studioShadowLight.shadow.camera.far=15;studioShadowLight.shadow.normalBias=.015;studioShadowLight.shadow.bias=-.0001;
const studioFloorMaterial=new THREE.ShadowMaterial({color:0x25271f,opacity:.42});
const studioFloor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),studioFloorMaterial);studioFloor.rotation.x=-Math.PI/2;studioFloor.receiveShadow=true;scene.add(studioFloor);
let progress=0,target=0,frame=0,lastTime=0;
function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
function renderStudy(p){
  chairRoot.position.y=3.8;chairRoot.rotation.y=-.5+p*.7;studio.position.y=3.8;
  camera.position.set(2.5,5.6,mobile?7.7:6.2);camera.lookAt(0,4.35,0);
  const reveal=smooth(.12,.29,p);chairMat.opacity=reveal;solid.visible=true;chairMat.depthWrite=reveal>.99;wireMat.opacity=(1-reveal)*.27;wire.visible=reveal<.999;
}
let updateScene=renderStudy;
function tick(time){frame=0;const dt=Math.min((time-(lastTime||time))/1000,.1);lastTime=time;progress=reduced?target:lerp(progress,target,1-Math.exp(-10*dt));if(Math.abs(progress-target)<.00015)progress=target;updateScene(progress);renderer.render(scene,camera);$('progress').style.transform=`scaleX(${progress})`;if(progress!==target)schedule();}
function readScroll(){target=clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight));schedule();}
addEventListener('scroll',readScroll,{passive:true});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);readScroll();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{lastTime=0;schedule();}});
document.querySelectorAll('[data-progress]').forEach(button=>button.addEventListener('click',()=>scrollTo({top:Number(button.dataset.progress)*(document.documentElement.scrollHeight-innerHeight),behavior:reduced?'instant':'smooth'})));
$('stage').addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;$('status').textContent='Graphics paused — reload to resume';});
new GLTFLoader().load(mobile?'./assets/chair-mobile.glb':'./assets/chair.glb',gltf=>{
  gltf.scene.traverse(object=>{if(object.isMesh){const mesh=new THREE.Mesh(object.geometry,chairMat);object.updateWorldMatrix(true,false);mesh.applyMatrix4(object.matrixWorld);mesh.castShadow=true;mesh.receiveShadow=true;solid.add(mesh);const lines=new THREE.Mesh(object.geometry,wireMat);lines.applyMatrix4(object.matrixWorld);wire.add(lines);}});
  $('status').textContent='Jafar Alhadithy';renderer.shadowMap.needsUpdate=true;readScroll();
},undefined,fail);
readScroll();

// One continuous scene. Geometry and light groups are culled when their weight is zero.
const room=new THREE.Group(),outside=new THREE.Group();scene.add(room,outside);
const roomMaterials=[],outsideMaterials=[];
const cube=new THREE.BoxGeometry(1,1,1);
function material(color,list){const m=new THREE.MeshStandardMaterial({color,roughness:.86,transparent:true});list.push(m);return m;}
const plaster=material(0xd6d0c1,roomMaterials),floor=material(0xb2a18a,roomMaterials),fabric=material(0xada998,roomMaterials),dark=material(0x555b4b,roomMaterials),stone=material(0xc2bda9,roomMaterials);
const facade=material(0xd5cdbc,outsideMaterials),earth=material(0xc5c6b3,outsideMaterials),foliage=material(0x7c876b,outsideMaterials),glazing=material(0x4b5a56,outsideMaterials);
function box(group,mat,size,pos){const mesh=new THREE.Mesh(cube,mat);mesh.scale.set(...size);mesh.position.set(...pos);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;}
box(room,floor,[8,.2,6],[0,-.1,0]);
box(room,plaster,[8,3.6,.18],[0,1.8,-3]);
box(room,plaster,[.18,3.6,6],[4,1.8,0]);
// Side window lets sunlight into the room; front window is the camera's exit.
box(room,plaster,[.18,3.6,1.2],[-4,1.8,-2.4]);
box(room,plaster,[.18,3.6,1.6],[-4,1.8,2.2]);
box(room,plaster,[.18,.55,3.2],[-4,.275,-.2]);
box(room,plaster,[.18,.5,3.2],[-4,3.35,-.2]);
box(room,plaster,[1.25,3.6,.18],[-3.375,1.8,3]);
box(room,plaster,[1.25,3.6,.18],[3.375,1.8,3]);
box(room,plaster,[5.5,.48,.18],[0,.24,3]);
box(room,plaster,[5.5,.45,.18],[0,3.375,3]);
box(room,dark,[.07,2.68,.13],[-2.7,1.82,3]);box(room,dark,[.07,2.68,.13],[2.7,1.82,3]);
box(room,dark,[5.5,.07,.13],[0,.5,3]);box(room,dark,[5.5,.07,.13],[0,3.12,3]);
// Furniture blockout: sofa, coffee table, rug, sideboard, wall art and planter.
box(room,fabric,[2.7,.45,.95],[1.8,.4,-1.8]);box(room,fabric,[2.7,.85,.25],[1.8,.7,-2.25]);
box(room,fabric,[.25,.65,1.1],[.45,.57,-1.8]);box(room,fabric,[.25,.65,1.1],[3.15,.57,-1.8]);
box(room,stone,[1.5,.12,.85],[1.55,.48,-.1]);box(room,dark,[.85,.43,.4],[1.55,.215,-.1]);
box(room,stone,[4.5,.015,3.2],[.5,.012,-.45]);
box(room,dark,[1.9,.65,.45],[-2.2,.325,-2.6]);
box(room,stone,[1.2,1.25,.07],[-2.2,1.7,-2.87]);
box(room,dark,[.7,.7,.7],[3.3,.35,1.65]);box(room,fabric,[.85,1.2,.85],[3.3,1.3,1.65]);
// Lower storey and roof match the room's footprint exactly.
box(outside,facade,[8,.25,6.3],[0,3.72,0]);
box(outside,facade,[8,3.6,6],[0,-2,0]);
box(outside,facade,[9,.25,7],[0,-3.86,.2]);
box(outside,glazing,[2.5,2.5,.04],[-1.9,-1.9,3.025]);box(outside,glazing,[2.5,2.5,.04],[1.9,-1.9,3.025]);
box(outside,facade,[8.4,.18,1.4],[0,-.12,3.65]);
box(outside,dark,[8.3,.07,.07],[0,.8,4.3]);
for(const x of [-4,0,4])box(outside,dark,[.05,.8,.05],[x,.4,4.3]);
box(outside,earth,[100,.2,100],[0,-4.05,0]);
box(outside,stone,[3,.05,8],[0,-3.92,8]);
for(const [x,z,h] of [[-6,2,2.5],[-7,-4,3],[6,-1,3.4],[8,6,2.2],[-9,9,2.8]]){
 box(outside,facade,[.28,1.8,.28],[x,-3.1,z]);box(outside,foliage,[1.7,h,1.7],[x,-2+h/2,z]);
}
for(const [x,z,h] of [[-17,-12,6],[15,-17,9],[23,-5,5],[-23,5,4]])box(outside,facade,[6,h,7],[x,-4+h/2,z]);
// Low-cost contact shading: one small procedural texture shared by all contacts.
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=64;shadowCanvas.height=64;
const ctx=shadowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,2,32,32,32);
gradient.addColorStop(0,'rgba(28,26,20,.36)');gradient.addColorStop(.45,'rgba(28,26,20,.18)');gradient.addColorStop(1,'rgba(28,26,20,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
const contactTexture=new THREE.CanvasTexture(shadowCanvas);
const contactMaterial=new THREE.MeshBasicMaterial({map:contactTexture,transparent:true,depthWrite:false,opacity:0});
const contact=new THREE.Mesh(new THREE.PlaneGeometry(2.3,2),contactMaterial);contact.rotation.x=-Math.PI/2;contact.position.set(-.6,.035,.4);room.add(contact);
const roomLights=new THREE.Group(),exteriorLights=new THREE.Group();scene.add(roomLights,exteriorLights);
const sun=new THREE.DirectionalLight(0xffe3b4,3.1);sun.position.set(-7,8,2);sun.target.position.set(0,0,-.3);roomLights.add(sun,sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(mobile?512:1024,mobile?512:1024);sun.shadow.camera.left=-6;sun.shadow.camera.right=6;sun.shadow.camera.top=6;sun.shadow.camera.bottom=-6;sun.shadow.camera.near=.5;sun.shadow.camera.far=25;sun.shadow.normalBias=.025;sun.shadow.bias=-.00015;
const bounce=new THREE.PointLight(0xffe3b4,16,11,2);bounce.position.set(0,2.4,0);roomLights.add(bounce);
const warmAmbient=new THREE.AmbientLight(0xffe8c6,.72);roomLights.add(warmAmbient);
const daylight=new THREE.DirectionalLight(0xffedcf,2.8);daylight.position.set(-8,12,6);exteriorLights.add(daylight);
const skyAmbient=new THREE.AmbientLight(0xf6f3e9,1.25);exteriorLights.add(skyAmbient);
const lightSets=[[studio,[[main,58],[rim,78],[fill,1.05],[studioShadowLight,.65]]],[roomLights,[[sun,3.1],[bounce,16],[warmAmbient,.72]]],[exteriorLights,[[daylight,2.8],[skyAmbient,1.25]]]];
function lightWeight(index,weight){const [group,lights]=lightSets[index];group.visible=weight>.001;for(const [light,base]of lights){light.intensity=weight>.001?base*weight:0;light.visible=weight>.001;}}
function fadeGeometry(group,materials,weight){group.visible=weight>.001;for(const m of materials){m.opacity=weight;m.transparent=weight<.999;m.depthWrite=weight>.98;}}
const keys=[
 [0,[2.5,5.6,6.2],[0,4.35,0]],
 [.3,[2.3,5.5,5.8],[0,4.35,0]],
 [.55,[2.1,2.05,2.35],[-.35,.8,-.3]],
 [.66,[1.25,1.95,2.6],[0,1,-.5]],
 [.76,[1.1,2.1,5.4],[0,1,0]],
 [1,[13,7.5,18],[0,-.25,0]]
];
function cameraAt(p){let i=0;while(i<keys.length-2&&p>keys[i+1][0])i++;const a=keys[i],b=keys[i+1],t=smooth(a[0],b[0],p);camera.position.set(...a[1].map((v,j)=>lerp(v,b[1][j],t)));const look=new THREE.Vector3(...a[2].map((v,j)=>lerp(v,b[2][j],t)));if(innerWidth<700){const offset=camera.position.clone().sub(look);camera.position.copy(look).addScaledVector(offset,1.3);look.y+=.7*(1-smooth(.34,.55,p));}camera.lookAt(look);if(innerWidth>=700){camera.setViewOffset(innerWidth,innerHeight,-innerWidth*.20*(1-smooth(.36,.58,p)),0,innerWidth,innerHeight);}else{camera.clearViewOffset();}}
let lastShadow=-1,lastCaption='';
updateScene=p=>{
 const descent=smooth(.32,.54,p),roomWeight=smooth(.32,.48,p),exteriorWeight=smooth(.68,.86,p);
 chairRoot.position.set(-.6*descent,3.8*(1-descent),.4*descent);
 const tumble=Math.sin(Math.PI*descent);
 chairRoot.rotation.set(tumble*.65,lerp(-.55,.12,smooth(0,.54,p))+tumble*1.25,-tumble*.45);
 studio.position.copy(chairRoot.position);
 studioFloor.position.y=3.795;studioFloor.visible=p<.45;studioFloorMaterial.opacity=.42*(1-smooth(.31,.45,p));
 const reveal=smooth(.12,.29,p);chairMat.opacity=reveal;chairMat.transparent=reveal<.999;solid.visible=true;chairMat.depthWrite=reveal>.99;wireMat.opacity=(1-reveal)*.27;wire.visible=reveal<.999;
 fadeGeometry(room,roomMaterials,roomWeight);fadeGeometry(outside,outsideMaterials,exteriorWeight);
 contactMaterial.opacity=descent*roomWeight;
 lightWeight(0,1-smooth(.34,.52,p));lightWeight(1,smooth(.34,.52,p)*(1-smooth(.72,.87,p)));lightWeight(2,smooth(.72,.87,p));
 if((roomLights.visible||studio.visible)&&Math.abs(p-lastShadow)>.0001){renderer.shadowMap.needsUpdate=true;lastShadow=p;}
 cameraAt(p);
 $('identity').style.opacity=1-smooth(.06,.18,p);
 const chapter=p<.34?0:p<.72?1:2;
 const headline=p<.16?'From concept.':p<.34?'Into reality.':p<.72?'Objects become spaces.':'Spaces tell stories.';
 if(headline!==lastCaption){$('headline').textContent=headline;$('chapter').textContent=['01 / The object','02 / The interior','03 / The architecture'][chapter];$('description').textContent=['','A place for every detail.','A wider perspective.'][chapter];document.querySelectorAll('[data-progress]').forEach((button,i)=>button.setAttribute('aria-current',String(i===chapter)));lastCaption=headline;}
 $('scroll-hint').textContent=p>.98?'Back to the beginning ↑':'Scroll to explore ↓';
 // Inspectable performance readout without a debug overlay in the portfolio.
 $('stage').dataset.scene=String(chapter+1);$('stage').dataset.activeLights=String(lightSets.reduce((n,[g,lights])=>n+(g.visible?lights.length:0),0));
};
schedule();
}

