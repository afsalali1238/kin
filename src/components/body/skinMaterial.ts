import * as THREE from 'three';
export function skinMaterial(map:THREE.Texture,normal:THREE.Texture,mask:THREE.Texture,active:number){
 map.colorSpace=THREE.SRGBColorSpace;map.flipY=false;normal.flipY=false;mask.flipY=true;mask.needsUpdate=true;mask.colorSpace=THREE.NoColorSpace;mask.minFilter=mask.magFilter=THREE.NearestFilter;mask.generateMipmaps=false;
 const material=new THREE.MeshPhysicalMaterial({map,normalMap:normal,normalScale:new THREE.Vector2(.24,.24),roughness:.6,metalness:0,clearcoat:.04,clearcoatRoughness:.65});
 material.onBeforeCompile=shader=>{
  shader.uniforms.regionMask={value:mask};shader.uniforms.activeRegion={value:active/255};shader.uniforms.breathTime={value:0};material.userData.shader=shader;
  shader.vertexShader='uniform float breathTime;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float torso = smoothstep(0.85,1.14,position.y) * (1.0-smoothstep(1.4,1.55,position.y));
   transformed.xz *= 1.0 + sin(breathTime * 1.256637) * 0.004 * torso;
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <lights_physical_pars_fragment>',THREE.ShaderChunk.lights_physical_pars_fragment.replace('float dotNL = saturate( dot( geometryNormal, directLight.direction ) );','float dotNL = saturate( (dot( geometryNormal, directLight.direction ) + 0.4) / 1.4 );'));
  shader.fragmentShader='uniform sampler2D regionMask;\nuniform float activeRegion;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   float regionValue = texture2D(regionMask, vMapUv).r;
   float selected = activeRegion > 0.001 ? 1.0 - step(0.012, abs(regionValue-activeRegion)) : 0.0;
   diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.73,0.32,0.12), selected * 0.64);
   if(activeRegion > 0.001) diffuseColor.rgb = mix(diffuseColor.rgb * 0.80, diffuseColor.rgb, selected);
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`float warmRim = pow(1.0 - max(dot(normal, normalize(vViewPosition)),0.0), 3.0);
   outgoingLight += vec3(0.14,0.043,0.015) * warmRim;
   #include <opaque_fragment>`);
 };
 material.customProgramCacheKey=()=>`skin-${active}`;
 return material;
}
