import presentations from '@/data/presentations.json';
import rules from '@/data/matching-rules.json';
import exercises from '@/data/exercises.json';
import regions from '@/data/regions.json';
export { presentations, exercises, regions };
export type Region = (typeof regions)[number];
export type Exercise = (typeof exercises)[number];
export type Intake = { pain: number; best: number; worst: number; onset: string; duration: string; pattern: string; aggravators: string[]; easers: string[]; irritability: 'high'|'moderate'|'low'; neuro: string; details: string[] };
export const defaultIntake: Intake = {pain:5,best:2,worst:7,onset:'gradual',duration:'acute',pattern:'load',aggravators:[],easers:[],irritability:'moderate',neuro:'none',details:[]};
export function match(group: string, a: Intake, rejected: string[] = []) {
 return rules.filter(r=>r.group===group).map(r=> {
  const agg=r.aggravators as Record<string,number|undefined>, ease=r.easers as Record<string,number|undefined>;
  let score=r.baseScore+a.aggravators.reduce((s,k)=>s+(agg[k]||0),0)+a.easers.reduce((s,k)=>s+(ease[k]||0),0);
  if(a.neuro!=='none') score+=r.neuroWeight;
  if(a.onset==='gradual') score+=r.gradualWeight; else score+=r.incidentWeight;
  if(a.pattern==='morning') score+=agg.morning||0;
  if(a.pattern==='night') score+=agg.night||0;
  if(rejected.includes(r.presentationId)) score-=30;
  return {...presentations.find(p=>p.id===r.presentationId)!,score,confidence:score>10?'Stronger pattern match':score>5?'Possible pattern match':'Early pattern match'};
 }).sort((a,b)=>b.score-a.score);
}
export function redFlags(a:Intake,group:string) {
 const urgent=a.details.some(d=>['bladder','saddle','both-legs','chest','severe-headache'].includes(d));
 const review=a.pattern==='night'||a.details.some(d=>['weakness','weight-loss','fever','major-trauma','locked','weight-bearing'].includes(d));
 return urgent?{level:'urgent',message: a.details.includes('chest')?'Chest pain or arm pain with breathlessness needs emergency assessment now. Do not start a session.':'New bladder or bowel changes, saddle numbness, symptoms in both legs, or a sudden severe headache need urgent medical assessment. Do not start a session.'}:review?{level:'review',message:'A few of your answers are worth getting checked in person before starting exercises. Night-waking pain, progressive weakness, fever, major trauma, or unexplained weight loss need an assessment.'}:null;
}
export function makeProgramme(group:string,a:Intake,presentationId:string,phase:number,goal='') {
 // The 15-minute adherence cap takes precedence over 20–30-minute low-irritability guidance.
 const maxPhase=a.irritability==='high'||presentationId==='frozen-shoulder'?1:phase;
 let pool=exercises.filter(e=>e.presentationIds.includes(presentationId)&&e.phase===maxPhase&&!e.contraindicatedFor.includes(presentationId));
 if(a.irritability==='low'&&phase===1&&presentationId!=='frozen-shoulder')pool=exercises.filter(e=>e.presentationIds.includes(presentationId)&&e.phase===2&&!e.contraindicatedFor.includes(presentationId));
 if(presentationId==='back-extension')pool.sort((a,b)=>Number(b.name.includes('extension'))-Number(a.name.includes('extension')));
 if(phase===3&&a.irritability!=='high'){
  const words=goal.toLowerCase();const preference=/train|sport|run|تدريب|جري/.test(words)?['loaded','weighted','press','single']: /work|desk|عمل/.test(words)?['row','rotation','reach','chin']: /family|عائل/.test(words)?['carry','squat','step','bridge']:['step','calf','balance','hinge'];
  const priority=(e:Exercise)=>preference.filter(k=>e.name.toLowerCase().includes(k)).length;
  pool.sort((a,b)=>priority(b)-priority(a));
 }
 const selected=pool.slice(0,4).map(e=>({...e,sets:a.irritability==='high'?1:e.sets,holdSeconds:a.irritability==='high'&&e.holdSeconds?15:e.holdSeconds,reps:a.irritability==='high'&&e.reps?6:e.reps}));
 const seconds=(e:Exercise)=>e.sets*(e.holdSeconds||e.reps*(e.type==='mobility'?3:4))+Math.max(0,e.sets-1)*e.restSeconds;
 const budget=a.irritability==='high'?420:a.irritability==='moderate'?720:900;
 while(selected.reduce((s,e)=>s+seconds(e),0)>budget){const adjustable=[...selected].reverse().find(e=>e.sets>1);if(!adjustable)break;adjustable.sets--;}
 return selected;
}
export const doseInfo={high:{minutes:7,frequency:'2–3 short sessions daily',character:'Comfortable movement & gentle holds'},moderate:{minutes:12,frequency:'1–2 sessions daily',character:'Controlled movement & light loading'},low:{minutes:15,frequency:'3–4 sessions weekly',character:'Progressive strength & load tolerance'}};
export type CheckIn={date:string;pain:number;feeling:string;session:boolean;phase:number;settled?:boolean;morningWorse?:boolean};
export function progression(logs:CheckIn[],phase:number,planned=10) {
 const sessions=logs.filter(l=>l.session&&l.phase===phase);const pain=logs.filter(l=>l.phase===phase);
 const trend=pain.length>1?pain.slice(-3).reduce((s,l)=>s+l.pain,0)/Math.min(3,pain.length)-pain.slice(0,3).reduce((s,l)=>s+l.pain,0)/Math.min(3,pain.length):0;
 const last=sessions.at(-1);const recovered=last?.settled===true&&last?.morningWorse===false;
 const eligible=sessions.length/planned>=.7&&trend<=0&&!!last&&['easy','right'].includes(last.feeling)&&recovered;
 return {eligible,adherence:Math.min(100,Math.round(sessions.length/planned*100)),trend,action:trend>1?'regress':eligible&&phase<3?'advance':'hold'};
}
export function traffic(pain:number,settled:boolean|null=null,morningWorse:boolean|null=null){return pain>4||settled===false||morningWorse===true?'red':settled===null||morningWorse===null?'amber':'green';}
export function variant(e:Exercise,direction:'easier'|'harder',presentationId:string){const id=direction==='easier'?e.easierVariantId:e.harderVariantId;const next=exercises.find(x=>x.id===id&&!x.contraindicatedFor.includes(presentationId));return next||{...e,sets:1,reps:Math.max(3,Math.floor(e.reps/2)),holdSeconds:Math.max(5,Math.floor(e.holdSeconds/2))};}
