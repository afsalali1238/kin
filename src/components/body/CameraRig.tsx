'use client';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { OrbitControls as Controls } from 'three-stdlib';
import { Vector3, MathUtils, Spherical } from 'three';
import regions from '@/data/regions.json';
export default function CameraRig({back,zoom,reset,active='',mini=false,onDrag}:{back:boolean;zoom:number;reset:number;active?:string;mini?:boolean;onDrag?:(drag:boolean)=>void}){
 const ref=useRef<Controls>(null);const moving=useRef(true);const {invalidate,camera}=useThree();const angle=useRef(back?Math.PI:0);const target=useRef(new Vector3(0,.93,0));const distance=useRef(3.45);
 useEffect(()=>{const r=!mini?regions.find(r=>r.id===active):null;target.current.set(r?r.focusTarget[0]*.3:0,r?MathUtils.clamp(r.focusTarget[1],.58,1.27):.93,0);distance.current=(r?2.65:3.45)/zoom;angle.current=back?Math.PI:0;moving.current=true;invalidate();},[back,reset,active,zoom,mini,invalidate]);
 useFrame((_,delta)=>{const c=ref.current;if(!c||!moving.current)return;const dt=Math.min(delta,.04);const spherical=new Spherical().setFromVector3(camera.position.clone().sub(c.target));const desiredAngle=angle.current; spherical.theta=MathUtils.damp(spherical.theta,desiredAngle,8,dt);spherical.radius=MathUtils.damp(spherical.radius,distance.current,7,dt);spherical.phi=MathUtils.damp(spherical.phi,Math.PI/2,7,dt);c.target.lerp(target.current,1-Math.exp(-7*dt));camera.position.copy(c.target).add(new Vector3().setFromSpherical(spherical));c.update();if(Math.abs(spherical.theta-desiredAngle)<.001&&Math.abs(spherical.radius-distance.current)<.002&&c.target.distanceTo(target.current)<.002)moving.current=false;else invalidate();});
 return <OrbitControls ref={ref} target={[0,.93,0]} enablePan={false} enableDamping dampingFactor={.12} minDistance={1.4} maxDistance={5} minPolarAngle={Math.PI/2-.6} maxPolarAngle={Math.PI/2+.6} onStart={()=>{moving.current=false;onDrag?.(true);}} onEnd={()=>onDrag?.(false)} onChange={()=>invalidate()}/>;
}
