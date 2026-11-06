import * as THREE from 'three';

// Shared uniforms keep visible geometry and its shadow cutout in agreement.
const noiseGLSL=`
float hash3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
`;
export function revealEffect(material,kind,progress,inverse=false,depth=false){
 material.onBeforeCompile=shader=>{
  shader.uniforms.uReveal=progress;
  const declaration=`uniform float uReveal; varying vec3 vRevealLocal; varying vec3 vRevealWorld; ${noiseGLSL}`;
  shader.vertexShader=declaration+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vRevealLocal=position;
   vec3 rw=(modelMatrix*vec4(transformed,1.)).xyz;
   vRevealWorld=rw;
   ${kind==='room'?`float radius=mix(-.8,9.,uReveal);
   float distanceToCenter=length(rw-vec3(0.,.55,0.));
   float edge=1.-smoothstep(.0,.65,abs(distanceToCenter+(noise3(rw*2.7)-.5)*.65-radius));
   vec3 displacement=normalize(rw-vec3(0.,.55,0.)+vec3(.001))*edge*(noise3(rw*6.)+.2)*.19*sin(uReveal*3.14159);
   transformed+=(inverse(mat3(modelMatrix))*displacement);`:''}
  `);
  shader.fragmentShader=declaration+shader.fragmentShader;
  const mask=kind==='room'?`
   float threshold=mix(-.8,9.,uReveal);
   float field=length(vRevealWorld-vec3(0.,.55,0.))+(noise3(vRevealWorld*2.7)-.5)*.65;
   float mask=1.-smoothstep(threshold-.14,threshold+.14,field);
  `:`
   float field=(vRevealLocal.x*.5+(1.15-vRevealLocal.y)*.65)+.12*(noise3(vRevealLocal*17.)-.5);
   float threshold=mix(-.7,1.5,uReveal);
   float mask=1.-smoothstep(threshold-.055,threshold+.055,field);
   ${inverse?'mask=1.-mask;':''}
  `;
  shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
   ${mask}
   if(mask<.015)discard;
  `);
  if(!depth)shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`diffuseColor.a*=mask;\n#include <opaque_fragment>`);
 };
 material.customProgramCacheKey=()=>`${kind}-${inverse}-${depth}`;
 material.needsUpdate=true;
}

// Each effect is a single instanced draw call, with a fixed mobile particle cap.
export function triangleParticles(parent,count,color){
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([-.5,-.35,0,.5,-.35,0,0,.55,0],3));geometry.computeVertexNormals();
 const material=new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,depthWrite:false});
 const mesh=new THREE.InstancedMesh(geometry,material,count);mesh.frustumCulled=false;parent.add(mesh);
 const dummy=new THREE.Object3D();
 const seeds=Array.from({length:count},(_,i)=>{const h=n=>{const x=Math.sin((i+1)*n)*43758.5453;return x-Math.floor(x)};return[h(12.989),h(78.233),h(39.425)];});
 return {mesh,update(amount,mode){
  mesh.visible=amount>.015&&amount<.985;if(!mesh.visible)return;
  material.opacity=Math.sin(amount*Math.PI)*.8;
  for(let i=0;i<count;i++){
   const [a,b,c]=seeds[i];
   let onEdge=true;
   if(mode==='chair'){
    const x=(a-.5)*1.4,threshold=-.7+2.2*amount;
    const y=1.15-(threshold-x*.5)/.65+(.5-b)*.12;
    onEdge=y>=0&&y<=1.2;
    dummy.position.set(x,y,.42*Math.sin(c*6.283)+(b-.5)*.35);
    dummy.position.x+=(b-.5)*Math.sin(amount*Math.PI)*.5;
   }else{
    const r=Math.max(0,-.8+amount*9.8),angle=a*Math.PI*2,elevation=b*2-1,ring=Math.sqrt(1-elevation*elevation);
    dummy.position.set(Math.cos(angle)*r*ring,.55+elevation*r,Math.sin(angle)*r*ring);
   }
   dummy.rotation.set(a*8+amount*6,b*8+amount*5,c*8);
   dummy.scale.setScalar(onEdge?(mode==='chair'?.025:.06)*(c+.4):0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
  }mesh.instanceMatrix.needsUpdate=true;
 }};
}
