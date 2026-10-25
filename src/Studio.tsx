import { Suspense, useMemo, useRef, useState, useEffect, Component, type ReactNode } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { RoundedBox, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { makeRenderer } from './liteRenderer';

type V3 = [number, number, number];
type StudioProps = { progress: React.RefObject<number>; night: boolean; paused: boolean; explore: boolean; onNavigate: (section: string) => void; onReady: () => void };
const palette = { wood:'#a56e41', edge:'#d1a77a', dark:'#302a24', cream:'#e8dcc2', green:'#779384', leaf:'#49715a', brass:'#c49d60' };

function Box({position=[0,0,0],size=[1,1,1],color=palette.wood,rotation=[0,0,0],radius=0, ...props}:any){
  const {gl}=useThree();if((gl as any).isLiteRenderer)radius=0;
  const material=<meshStandardMaterial color={color} roughness={.78}/>;
  return radius ? <RoundedBox args={size} position={position} rotation={rotation} radius={radius} smoothness={2} castShadow receiveShadow {...props}>{material}</RoundedBox> : <mesh position={position} rotation={rotation} castShadow receiveShadow {...props}><boxGeometry args={size}/>{material}</mesh>;
}
function Cylinder({position=[0,0,0],radius=.1,bottom, height=1,color=palette.dark,rotation=[0,0,0],...props}:any){return <mesh position={position} rotation={rotation} castShadow receiveShadow {...props}><cylinderGeometry args={[radius,bottom??radius,height,20]}/><meshStandardMaterial color={color} roughness={.7}/></mesh>}
function Ball({position=[0,0,0],scale=[1,1,1],color=palette.green,...props}:any){const {gl}=useThree();const lite=(gl as any).isLiteRenderer;return <mesh position={position} scale={scale} castShadow {...props}><sphereGeometry args={[1,lite?8:16,lite?6:12]}/><meshStandardMaterial color={color} roughness={.85}/></mesh>}
function Rod({from,to,radius=.025,color=palette.dark}: {from:V3;to:V3;radius?:number;color?:string}){
  const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),dir=b.clone().sub(a);
  const quaternion=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize());
  return <mesh position={a.add(b).multiplyScalar(.5)} quaternion={quaternion} castShadow><cylinderGeometry args={[radius,radius,dir.length(),10]}/><meshStandardMaterial color={color}/></mesh>;
}
function Label({text,position,width=1,height=.4,bg='#e4dac1',color='#273f35',font=38,rotation=[0,0,0]}:any){
  const {gl}=useThree();const lite=(gl as any).isLiteRenderer;
  const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d')!;ctx.fillStyle=bg;ctx.fillRect(0,0,512,256);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${font}px Georgia`;text.split('\n').forEach((line:string,i:number,all:string[])=>ctx.fillText(line,256,128+(i-(all.length-1)/2)*58));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t},[text,bg,color,font]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <group position={position} rotation={rotation}><mesh><planeGeometry args={[width,height]}/><meshStandardMaterial map={texture} roughness={1}/></mesh></group>;
}
function Plant({position,scale=1}: {position:V3;scale?:number}){
  return <group position={position} scale={scale}><Cylinder position={[0,.18,0]} radius={.22} bottom={.16} height={.36} color='#b56f4e'/><Cylinder position={[0,.365,0]} radius={.19} height={.015} color='#423528'/>{Array.from({length:7},(_,i)=>{const a=i*2.4,x=Math.cos(a)*.25,z=Math.sin(a)*.25,y=.55+(i%3)*.16;return <group key={i}><Rod from={[0,.35,0]} to={[x,y,z]} radius={.012} color='#526d42'/><Ball position={[x,y,z]} scale={[.13,.24,.065]} color={i%2?'#638459':'#3e654c'} rotation={[.3,a,.5*Math.sin(a)]}/></group>})}</group>
}
function Books({position,count=8,scale=1}:any){const colors=['#627d6c','#ac6348','#d5bd90','#263e36','#d5d3bb','#b78e55'];return <group position={position} scale={scale}>{Array.from({length:count},(_,i)=><group key={i} position={[i*.115,0,0]} rotation={[0,0,i===count-1?-.15:0]}><Box position={[0,.23+(i%3)*.025,0]} size={[.085,.46+(i%3)*.05,.31]} color={colors[i%colors.length]}/><Box position={[0,.12,.16]} size={[.065,.014,.006]} color='#e6d9b7'/><Box position={[0,.39,.16]} size={[.065,.012,.006]} color='#e6d9b7'/></group>)}</group>}

function Screen({position,rotation=[0,0,0],laptop=false}:any){
  const {gl}=useThree();const lite=(gl as any).isLiteRenderer;
  const map=useMemo(()=>{const c=document.createElement('canvas');c.width=768;c.height=440;const ctx=c.getContext('2d')!;ctx.fillStyle='#172b2e';ctx.fillRect(0,0,768,440);ctx.fillStyle='#253c3d';ctx.fillRect(0,0,768,32);['#dd8c73','#e6c678','#83b49a'].forEach((v,i)=>{ctx.fillStyle=v;ctx.beginPath();ctx.arc(18+i*18,16,5,0,7);ctx.fill()});ctx.fillStyle='#abc4b3';ctx.font='14px monospace';ctx.fillText('studio / create-something-good.tsx',110,22);ctx.fillStyle='#1d3234';ctx.fillRect(0,32,160,408);ctx.font='16px monospace';['EXPLORER','src','  components','  Studio.tsx','  ideas.ts','  styles.css'].forEach((l,i)=>ctx.fillText(l,15,66+i*30));const lines=[['#cf9b7e','import { curiosity } from "life";'],['#93b9aa',''],['#d8cda7','const Prakhar = () => {'],['#95b6a5','  const craft = usePassion();'],['#abc6d6','  return ('],['#d5aa83','    <Developer'],['#d7c6a1','      stack="React + TypeScript"'],['#8fb9a4','      mindset="always learning"'],['#d7c6a1','      details="thoughtfully made"'],['#d5aa83','    />'],['#abc6d6','  );'],['#d8cda7','};']];ctx.font='18px monospace';lines.forEach(([color,line],i)=>{ctx.fillStyle='#53696b';ctx.fillText(String(i+1),172,65+i*27);ctx.fillStyle=color;ctx.fillText(line,207,65+i*27)});ctx.fillStyle='#648f7c';ctx.fillRect(0,420,768,20);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t},[]);
  useEffect(()=>()=>map.dispose(),[map]);
  const w=laptop?.78:1.58,h=laptop?.48:.98;
  return <group position={position} rotation={rotation}><Box size={[w+.08,h+.08,.07]} color='#292f2b' radius={.025}/><mesh position={[0,0,.041]}><planeGeometry args={[w,h]}/><meshStandardMaterial map={map} emissiveMap={map} emissive='#ffffff' emissiveIntensity={.5}/></mesh>{!laptop&&<><Cylinder position={[0,-h/2-.18,0]} radius={.04} height={.32}/><Box position={[0,-h/2-.33,.05]} size={[.52,.035,.3]} color='#393e36' radius={.01}/></>}</group>
}
function Desk(){
  return <group position={[-.55,0,-1.05]}>
    <Box position={[0,1.2,0]} size={[3.55,.13,1.05]} radius={.035}/>
    {[-1.5,1.5].map(x=>[-.35,.35].map(z=><Box key={`${x}${z}`} position={[x,.59,z]} size={[.075,1.14,.075]} color='#333e36'/>))}
    <Box position={[-1.22,.57,0]} size={[.58,1.02,.82]} color='#d8cbb2' radius={.03}/>
    {[.28,.58,.88].map(y=><group key={y}><Box position={[-1.22,y,.42]} size={[.5,.26,.025]} color='#ded2bd'/><Box position={[-1.22,y+.04,.44]} size={[.14,.025,.02]} color='#7e7967'/></group>)}
    <Screen position={[-.28,2.04,-.2]}/><Screen position={[.97,1.58,.06]} rotation={[-.12,-.2,0]} laptop/>
    <Box position={[.98,1.29,.28]} size={[.84,.04,.48]} color='#9eaaa2' radius={.02}/>
    <Box position={[-.28,1.28,.25]} size={[.92,.035,.3]} color='#ded8c2' radius={.015}/>
    {Array.from({length:11},(_,i)=>Array.from({length:3},(_,j)=><Box key={`${i}-${j}`} position={[-.67+i*.075,1.305,.15+j*.08]} size={[.06,.015,.055]} color={j===0?'#637b6b':'#b4b5a2'}/>))}
    <Ball position={[.43,1.29,.29]} scale={[.065,.035,.105]} color='#e6ddc7'/>
    <Cylinder position={[-1.35,1.43,.18]} radius={.1} height={.29} color='#e5b86c'/>
    <mesh position={[-1.23,1.43,.18]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.075,.019,8,16]}/><meshStandardMaterial color='#e5b86c'/></mesh>
    <Cylinder position={[-1.35,1.58,.18]} radius={.078} height={.005} color='#43352b'/>
    <Plant position={[1.47,1.27,-.2]} scale={.55}/>
    <Cylinder position={[-1.55,1.28,-.36]} radius={.13} height={.04} color='#313c33'/>
    <Rod from={[-1.55,1.3,-.36]} to={[-1.55,2.05,-.36]} radius={.025} color='#313c33'/>
    <Rod from={[-1.55,2.05,-.36]} to={[-1.15,2.2,-.3]} radius={.025} color='#313c33'/>
    <Cylinder position={[-1.12,2.15,-.3]} radius={.045} bottom={.16} height={.16} color='#3a5545' rotation={[0,0,.4]}/>
  </group>
}
function Chair(){return <group position={[-.75,0,.32]}><Cylinder position={[0,.35,0]} radius={.055} height={.65} color='#3d443c'/>{[0,1,2,3,4].map(i=>{const a=i*Math.PI*2/5;return <group key={i}><Rod from={[0,.14,0]} to={[Math.sin(a)*.38,.08,Math.cos(a)*.38]} radius={.03} color='#343e34'/><Ball position={[Math.sin(a)*.38,.075,Math.cos(a)*.38]} scale={[.065,.065,.065]} color='#313d35'/></group>})}<Box position={[0,.65,0]} size={[.63,.14,.6]} color='#596e56' radius={.08}/><Box position={[0,1.04,.28]} size={[.65,.73,.11]} color='#596e56' radius={.1}/>{[-.35,.35].map(x=><Box key={x} position={[x,.83,.02]} size={[.07,.055,.46]} color='#a5794f' radius={.02}/>)}</group>}

function Guitar(){return <group position={[-2.7,.1,1.55]} rotation={[0,.4,-.18]}><Ball position={[0,.38,0]} scale={[.28,.33,.105]} color='#c38c49'/><Ball position={[0,.64,0]} scale={[.22,.25,.09]} color='#c38c49'/><Ball position={[0,.55,.091]} scale={[.105,.105,.012]} color='#423b2b'/><Box position={[0,1.06,0]} size={[.095,.78,.055]} color='#73543a'/><Box position={[0,1.5,0]} size={[.14,.22,.065]} color='#ab7842' radius={.02}/><Box position={[0,.27,.11]} size={[.16,.04,.025]} color='#523c2a'/>{[-.028,-.014,0,.014,.028].map(x=><Rod key={x} from={[x,.28,.123]} to={[x,1.55,.044]} radius={.002} color='#dacfae'/>)}{[.85,.98,1.11,1.24].map(y=><Box key={y} position={[0,y,.031]} size={[.095,.009,.004]} color='#ceb77d'/>)}</group>}
function Vinyl({paused,spin,night}: {paused:boolean;spin:boolean;night:boolean}){
  const record=useRef<THREE.Group>(null);
  useFrame((_,d)=>{if(record.current&&!paused&&spin)record.current.rotation.y+=d*.75});
  return <group position={[2.05,0,-1.48]}>
    <Box position={[0,.54,0]} size={[1.6,1,.67]} color='#ba9264' radius={.02}/>
    <Box position={[0,.51,.35]} size={[1.45,.76,.025]} color='#5d5240'/>
    {[-.69,0,.69].map(x=><Box key={x} position={[x,.51,.4]} size={[.045,.79,.08]} color='#c8a275'/>)}
    <Books position={[-.57,.14,.35]} count={5} scale={.9}/><Books position={[.14,.14,.35]} count={5} scale={.9}/>
    <Box position={[0,1.09,0]} size={[1.36,.13,.6]} color='#573f31' radius={.025}/>
    <group position={[-.2,1.17,0]} ref={record}><Cylinder radius={.25} height={.02} color='#242823'/>{[.08,.14,.19,.23].map(r=><mesh key={r} rotation={[-Math.PI/2,0,0]} position={[0,.012,0]}><torusGeometry args={[r,.0018,4,48]}/><meshStandardMaterial color='#5a5d4d'/></mesh>)}<Cylinder radius={.079} height={.025} color='#dcac68'/><Box position={[.03,.016,0]} size={[.025,.002,.075]} color='#f6dfad'/></group>
    <Rod from={[.49,1.19,-.17]} to={[.33,1.21,.12]} radius={.014} color='#c9b78c'/><Rod from={[.33,1.21,.12]} to={[.12,1.21,.16]} radius={.014} color='#c9b78c'/>
    <Box position={[.62,1.5,-.02]} size={[.33,.62,.38]} color='#3a3c31' radius={.02}/>{[1.38,1.64].map(y=><mesh key={y} position={[.62,y,.18]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.105,.105,.017,24]}/><meshStandardMaterial color='#b8a274'/></mesh>)}
    <pointLight position={[0,1.8,.4]} intensity={night?.7:.1} color='#f4b56e' distance={3}/>
  </group>
}
function Lounge(){return <group position={[1.8,0,1.3]} rotation={[0,-.35,0]}>{[-.37,.37].map(x=>[-.3,.3].map(z=><Box key={`${x}-${z}`} position={[x,.28,z]} size={[.07,.55,.07]} color='#805c3e' rotation={[z*.2,0,-x*.15]}/>))}<Box position={[0,.51,0]} size={[.86,.17,.84]} color='#bf8b50' radius={.09}/><Box position={[0,.91,-.35]} size={[.84,.81,.17]} rotation={[-.18,0,0]} color='#bf8b50' radius={.09}/>{[-.46,.46].map(x=><group key={x}><Box position={[x,.74,.02]} size={[.1,.09,.83]} color='#805c3e' radius={.035}/><Box position={[x,.54,.29]} size={[.06,.39,.07]} color='#805c3e'/></group>)}<Box position={[.17,.94,-.23]} size={[.36,.37,.12]} color='#c9d2b3' radius={.04} rotation={[.03,0,-.2]}/></group>}

function Character({progress,paused}: {progress:React.RefObject<number>;paused:boolean}){
  const group=useRef<THREE.Group>(null),head=useRef<THREE.Group>(null),leftArm=useRef<THREE.Group>(null),rightArm=useRef<THREE.Group>(null),legs=useRef<THREE.Group>(null);
  const knees=useRef<(THREE.Group|null)[]>([]),tablet=useRef<THREE.Group>(null);
  const curls=useMemo(()=>Array.from({length:42},(_,i)=>{const phi=(i/42)*Math.PI*2*2.618;const y=.05+(i%6)*.055;const r=Math.sqrt(Math.max(.01,.135-y*y));return {x:Math.cos(phi)*r,z:Math.sin(phi)*r,y,scale:.085+(i%3)*.012}}),[]);
  const skin='#b98258';
  useFrame(({clock},delta)=>{
    if(!group.current)return;
    const p=progress.current,chapter=p<.6?0:p<1.65?1:2;
    const pos:V3=chapter===0?[-.75,.72,.26]:chapter===1?[.32,.85,.8]:[1.8,.64,1.35];
    const t=paused?0:clock.elapsedTime;
    const f=1-Math.exp(-delta*4);
    group.current.position.lerp(new THREE.Vector3(...pos),f);
    group.current.rotation.y=THREE.MathUtils.damp(group.current.rotation.y,chapter===0?-2.65:chapter===1?.2:.1,4,delta);
    if(head.current){head.current.rotation.y=paused?0:Math.sin(t*.55)*.12;head.current.rotation.z=paused?0:Math.sin(t*.65)*.035;}
    if(leftArm.current){leftArm.current.rotation.x=chapter===0?-1.05:chapter===2?-1.1:.1;leftArm.current.rotation.z=chapter===1?-.22:0;}
    if(rightArm.current){rightArm.current.rotation.x=chapter===0?-1.05:chapter===2?-1.1:-2.4;rightArm.current.rotation.z=chapter===1?.4+Math.sin(t*3)*.2:Math.sin(t*4)*.04;}
    if(legs.current)legs.current.rotation.x=THREE.MathUtils.damp(legs.current.rotation.x,chapter===1?0:-Math.PI/2,5,delta);
    knees.current.forEach(k=>{if(k)k.rotation.x=THREE.MathUtils.damp(k.rotation.x,chapter===1?0:Math.PI/2,5,delta)});
    if(tablet.current)tablet.current.visible=chapter===2;
  });
  return <group ref={group} position={[-.75,.72,.26]}>
    <Box position={[0,.41,0]} size={[.45,.6,.29]} color='#313e35' radius={.08}/>
    <Box position={[0,.37,.158]} size={[.09,.5,.015]} color='#9f8c69'/>
    <Box position={[-.15,.56,.16]} size={[.09,.3,.035]} rotation={[0,0,-.25]} color='#b5a17b'/><Box position={[.15,.56,.16]} size={[.09,.3,.035]} rotation={[0,0,.25]} color='#b5a17b'/>
    <Cylinder position={[0,.77,0]} radius={.09} height={.15} color={skin}/>
    <group ref={head} position={[0,1.01,0]}>
      <Ball scale={[.26,.29,.235]} color={skin}/>
      <Ball position={[0,-.14,.08]} scale={[.24,.17,.19]} color='#302921'/>
      <Ball position={[0,-.07,.218]} scale={[.14,.08,.026]} color={skin}/>
      <Ball position={[0,-.1,.243]} scale={[.093,.025,.012]} color='#f2ddbd'/>
      <Ball position={[0,.01,.24]} scale={[.048,.06,.05]} color={skin}/>
      {[-1,1].map(s=><group key={s}><Ball position={[s*.26,0,0]} scale={[.048,.07,.04]} color={skin}/><Box position={[s*.13,.064,.225]} size={[.23,.16,.027]} color='#252d29' radius={.035}/><Box position={[s*.13,.064,.242]} size={[.177,.11,.007]} color='#b79a72' radius={.02}/><Ball position={[s*.12,.06,.251]} scale={[.025,.031,.012]} color='#262c25'/><Ball position={[s*.112,.07,.262]} scale={[.007,.008,.004]} color='#fff5db'/><Rod from={[s*.24,.09,.23]} to={[s*.25,.09,0]} radius={.012} color='#252d29'/></group>)}
      <Box position={[0,.07,.24]} size={[.045,.024,.024]} color='#252d29'/>
      <Ball position={[0,.18,-.03]} scale={[.28,.19,.245]} color='#30271f'/>
      {curls.map((c,i)=><Ball key={i} position={[c.x*.8,c.y+.11,c.z*.66-.025]} scale={[c.scale,c.scale,c.scale]} color={i%4===0?'#503b29':'#30271f'}/>)}
    </group>
    {[-1,1].map(s=><group key={s} ref={s===-1?leftArm:rightArm} position={[s*.28,.63,0]}><Box position={[0,-.16,0]} size={[.15,.34,.16]} color='#344238' radius={.055}/><group position={[0,-.32,0]} rotation={[-.45,0,0]}><Box position={[0,-.12,0]} size={[.13,.26,.14]} color='#344238' radius={.04}/><Ball position={[0,-.27,0]} scale={[.08,.095,.065]} color={skin}/></group></group>)}
    <group ref={tablet} position={[0,.38,.44]} rotation={[-.8,0,0]} visible={false}><Box size={[.42,.32,.025]} color='#3c4540' radius={.015}/><Box position={[0,0,.015]} size={[.37,.26,.004]} color='#9fae8e'/><Rod from={[.08,-.02,.025]} to={[.18,.08,.025]} radius={.008} color='#d7bd8e'/></group>
    <group ref={legs} position={[0,.13,0]}>{[-.125,.125].map((x,i)=><group key={x} position={[x,0,0]}><Box position={[0,-.23,0]} size={[.19,.44,.21]} color='#344a4b' radius={.045}/><group ref={g=>{knees.current[i]=g}} position={[0,-.43,0]} rotation={[Math.PI/2,0,0]}><Box position={[0,-.2,0]} size={[.17,.4,.18]} color='#344a4b' radius={.035}/><Box position={[0,-.41,.065]} size={[.2,.12,.33]} color='#dbd8c6' radius={.045}/><Box position={[0,-.47,.065]} size={[.205,.027,.335]} color='#a4a899' radius={.01}/></group></group>)}</group>
  </group>
}

function Walls(){
  return <>
    <Box position={[0,-.15,0]} size={[7,.28,5.7]} color='#765337' radius={.07}/>
    {Array.from({length:14},(_,i)=><Box key={i} position={[-3.24+i*.5,.006,0]} size={[.485,.025,5.55]} color={['#bc956c','#b38a61','#c6a279','#bc9972'][i%4]}/>)}
    <Box position={[0,1.8,-2.78]} size={[7,3.6,.13]} color='#809889'/>
    <Box position={[-3.44,.6,0]} size={[.13,1.2,5.7]} color='#d2c7a9'/>
    <Box position={[-3.44,2.4,-2.28]} size={[.13,2.4,1.05]} color='#d2c7a9'/>
    <Box position={[-3.44,2.4,2.21]} size={[.13,2.4,1.28]} color='#d2c7a9'/>
    <Box position={[-3.44,3.47,-.07]} size={[.13,.28,3.45]} color='#d2c7a9'/>
    <Box position={[-3.35,2.22,-.06]} size={[.055,2.12,3.3]} color='#d6e7ce'/>
    {[-1.7,-.07,1.57].map(z=><Box key={z} position={[-3.29,2.22,z]} size={[.14,2.23,.065]} color='#f0e2c3'/>)}
    {[1.1,2.22,3.35].map(y=><Box key={y} position={[-3.29,y,-.065]} size={[.15,.07,3.4]} color='#f0e2c3'/>)}
    <Box position={[-3.23,1.06,-.07]} size={[.5,.1,3.6]} color='#e9d8b5'/>
    <Box position={[0,.1,-2.68]} size={[6.9,.15,.06]} color='#b7b99c'/>
    <Box position={[-3.33,.1,0]} size={[.05,.15,5.5]} color='#d8c8a9'/>
    <Plant position={[-3.16,1.11,-1.25]} scale={.62}/>
    <Books position={[-3.16,1.11,.35]} count={4} scale={.6}/>
    <Box position={[-.65,2.99,-2.59]} size={[2.45,.09,.35]} color='#bd956a'/>
    <Books position={[-1.64,3.04,-2.51]} count={7} scale={.7}/><Plant position={[.33,3.04,-2.53]} scale={.51}/>
    <Box position={[1.77,2.63,-2.68]} size={[1.03,1.32,.08]} color='#b99769'/>
    <Label position={[1.77,2.63,-2.63]} width={.91} height={1.2} text={'MAKE\nGOOD\nTHINGS.'} font={56} bg='#e0c99b' color='#3c5b47'/>
    <Box position={[2.77,2.69,-2.69]} size={[.64,.87,.08]} color='#c9b48a'/>
    <Label position={[2.77,2.69,-2.64]} width={.54} height={.77} text={'STAY\nCURIOUS'} font={46} bg='#b16e4e' color='#efdab4'/>
    {[-2.52,-1.97].map((x,i)=><mesh key={i} position={[x,2.58+i*.28,-2.68]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.22,.22,.02,32]}/><meshStandardMaterial color='#293d33'/><mesh position={[0,.012,0]}><cylinderGeometry args={[.065,.065,.007,20]}/><meshStandardMaterial color={i?'#d1af68':'#ba7457'}/></mesh></mesh>)}
    {Array.from({length:11},(_,i)=>{const x=-3.1+i*.61,y=3.5-.25*Math.sin(i/10*Math.PI);return <group key={i}><Rod from={[x,y,-2.48]} to={[x+.61,3.5-.25*Math.sin((i+1)/10*Math.PI),-2.48]} radius={.009} color='#514f39'/><mesh position={[x,y-.06,-2.48]}><sphereGeometry args={[.034,8,8]}/><meshStandardMaterial color='#ffdc93' emissive='#ffbd61' emissiveIntensity={2}/></mesh></group>})}
  </>
}
function Rug(){return <group position={[.45,.04,.9]}><Box size={[3.7,.025,2.6]} color='#b9bb91' radius={.015}/><Box position={[0,.017,0]} size={[3.52,.008,2.42]} color='#d9cba7'/><Box position={[0,.022,0]} size={[3.29,.008,2.2]} color='#7c8d77'/><Box position={[0,.028,0]} size={[3.08,.005,1.97]} color='#b9bb91'/>{Array.from({length:8},(_,i)=><Box key={i} position={[-1.28+i*.37,.032,0]} size={[.025,.005,1.93]} color='#d4c6a3'/>)}{Array.from({length:20},(_,i)=>[-1,1].map(s=><Box key={`${i}-${s}`} position={[-1.7+i*.18,.013,s*1.36]} size={[.025,.025,.14]} color='#d8c6a0'/>))}</group>}

function World({progress,night,paused,explore,onNavigate,onReady}:StudioProps){
  const {camera,size}=useThree();
  const target=useRef(new THREE.Vector3(0,1.3,0));
  const [spin,setSpin]=useState(true);
  const initial=useRef(false);
  const [hint,setHint]=useState('');
  useEffect(()=>{onReady()},[onReady]);
  useFrame((state,d)=>{
    if(explore)return;
    const p=progress.current;
    const second=THREE.MathUtils.smoothstep(p,.65,1.05),third=THREE.MathUtils.smoothstep(p,1.65,2.05);
    const dest=new THREE.Vector3(8.6,7.1,10.5).lerp(new THREE.Vector3(6.7,5.8,9.2),second).lerp(new THREE.Vector3(8.8,6.2,8.1),third);
    if(!paused&&size.width>600){dest.x+=state.pointer.x*.22;dest.y+=state.pointer.y*.12;}
    const focal=new THREE.Vector3(0,1.25,0).lerp(new THREE.Vector3(-.1,1.4,-.15),second).lerp(new THREE.Vector3(.55,1.15,.4),third);
    const f=initial.current?1-Math.exp(-d*3):1;
    camera.position.lerp(dest,f);target.current.lerp(focal,f);camera.lookAt(target.current);
    const c=camera as THREE.OrthographicCamera;c.zoom=THREE.MathUtils.damp(c.zoom,Math.min(size.width/(size.width<600?10.4:11.9),size.height/8.4)*(1+second*.06),5,d);c.updateProjectionMatrix();initial.current=true;
  });
  function interact(e:ThreeEvent<MouseEvent>,section:string){e.stopPropagation();onNavigate(section)}
  return <>
    <ambientLight intensity={night?.65:1.15} color={night?'#a3bcbf':'#fff5df'}/>
    <hemisphereLight args={['#fff4d9','#6f806a',night?.6:1.3]}/>
    <directionalLight position={[-3,7,5]} intensity={night?1.4:3} color={night?'#f7c78f':'#ffe5b4'} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-normalBias={.04}/>
    <pointLight position={[0,3,-1.4]} color='#ffbf78' intensity={night?6:.7} distance={8}/>
    <group>
      <Walls/><Rug/><Desk/><Chair/><Guitar/><Lounge/><Vinyl paused={paused} spin={spin} night={night}/><Character progress={progress} paused={paused}/>
      <Plant position={[-2.82,.02,-1.87]} scale={1.65}/><Plant position={[2.9,.01,1.5]} scale={1.35}/>
      <Cylinder position={[2.9,.45,.2]} radius={.35} height={.07} color='#b99060'/><Cylinder position={[2.9,.23,.2]} radius={.035} height={.45}/>
      <Box position={[2.92,.51,.2]} size={[.3,.04,.36]} color='#e1d4b0' rotation={[0,.3,0]}/><Box position={[2.9,.55,.2]} size={[.3,.04,.36]} color='#bb7455' rotation={[0,.1,0]}/>
      <Cylinder position={[2.82,.62,.2]} radius={.06} height={.12} color='#e4c591'/>
      <Cylinder position={[2.9,.06,-.65]} radius={.24} height={.06} color='#3b4a3a'/><Cylinder position={[2.9,1.2,-.65]} radius={.022} height={2.3} color='#8d8057'/><Cylinder position={[2.9,2.37,-.65]} radius={.19} bottom={.3} height={.4} color='#e2c797'/>
      <mesh position={[0,-.32,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[200,200]}/><shadowMaterial transparent opacity={night?.18:.12}/></mesh>
      <Html position={[-.8,2.9,-.7]} center zIndexRange={[12,0]}><button className="hotspot" onClick={()=>onNavigate('work')} aria-label="Explore my work"><span>↗</span><em>The work desk</em></button></Html>
      <Html position={[2,1.55,-1.05]} center zIndexRange={[12,0]}><button className={`hotspot ${spin?'record-playing':''}`} onClick={()=>{setSpin(!spin);setHint(spin?'Record paused':'Record spinning');}} aria-label={spin?'Pause the record':'Spin the record'}><span>♫</span><em>{spin?'Pause the vinyl':'Spin the vinyl'}</em></button></Html>
      <Html position={[-2.65,1.85,1.55]} center zIndexRange={[12,0]}><button className="hotspot" onClick={()=>onNavigate('about')} aria-label="Explore my creative side"><span>✧</span><em>Beyond the code</em></button></Html>
      {hint&&<Html position={[2,1.9,-1]} center zIndexRange={[10,0]}><span className="record-hint" onAnimationEnd={()=>setHint('')}>{hint}</span></Html>}
    </group>
    {explore&&<OrbitControls makeDefault target={[0,1.3,0]} enablePan={false} enableZoom minZoom={30} maxZoom={160} minPolarAngle={.35} maxPolarAngle={Math.PI/2.05} minAzimuthAngle={-.15} maxAzimuthAngle={1.6}/>}
  </>
}
class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}};render(){return this.state.failed?<div className="scene-fallback"><img src="/assets/prakhar-portrait.png" alt="Illustrated portrait of Prakhar in his creative studio"/><p>The full studio needs WebGL. You can still explore all my work below.</p></div>:this.props.children}}
export default function Studio(props:StudioProps){const host=useRef<HTMLDivElement>(null);const [visible,setVisible]=useState(true);useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));if(host.current)observer.observe(host.current);return()=>observer.disconnect()},[]);return <div ref={host} style={{width:'100%',height:'100%'}}><SceneBoundary><Canvas frameloop={visible?'always':'never'} orthographic shadows dpr={[1,1.5]} camera={{position:[8.6,7.1,10.5],zoom:75,near:.1,far:200}} gl={makeRenderer} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.12;props.onReady();}} fallback={<div className="scene-fallback"><img src="/assets/prakhar-portrait.png" alt="Prakhar's illustrated studio"/><p>Explore Prakhar’s developer studio. All portfolio content is also available below.</p></div>}><Suspense fallback={null}><World {...props}/></Suspense></Canvas></SceneBoundary></div>}
