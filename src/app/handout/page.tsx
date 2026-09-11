'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Printer } from 'lucide-react';
import { defaultIntake, doseInfo, makeProgramme, regions, type Intake } from '@/lib/clinical';
import { RECOVERY_STORAGE_KEY } from '@/lib/recovery-storage';

type Recovery = { region: string; intake: Intake; goal: string; presentationId: string; phase: number; assessed: boolean };
const initial: Recovery = { region: '', intake: defaultIntake, goal: 'Walk and move comfortably', presentationId: 'back-extension', phase: 1, assessed: false };

export default function Handout() {
 const [state, setState] = useState<Recovery>(initial);
 const [ready, setReady] = useState(false);
 // Post-mount read is intentional: localStorage is unavailable during SSR and
 // the printout must not flash the empty plan before hydrating.
 useEffect(() => {
  try {
   const saved = localStorage.getItem(RECOVERY_STORAGE_KEY);
   if (saved) setState({ ...initial, ...JSON.parse(saved) }); // eslint-disable-line react-hooks/set-state-in-effect -- hydrate persisted recovery after mount
  } catch {}
  setReady(true);
 }, []);
 const region = regions.find(r => r.id === state.region);
 const group = region?.group || 'lower-back';
 const dose = doseInfo[state.intake.irritability];
 const plan = makeProgramme(group, state.intake, state.presentationId, state.phase, state.goal);

 if (!ready) return null;

 return (
  <main className="handout-page">
   <div className="handout-toolbar">
    <Link className="text-button" href="/"><ArrowLeft size={16} />Back to kinē</Link>
    <button className="primary-button" onClick={() => window.print()}><Printer size={16} />Print my programme</button>
   </div>

   {!state.assessed && (
    <div className="notice amber">
     No saved programme was found on this device yet. Complete your body assessment in the app first, then return here to print your plan.
    </div>
   )}

   <div className="eyebrow"><span />kinē · YOUR PERSONAL MOVEMENT PLAN</div>
   <h1>Small steps. Stronger days.</h1>
   <p className="handout-sub">
    {region ? `For your ${region.label.toLowerCase()}` : 'Your recovery plan'} · Phase {state.phase} · {dose.frequency}
    <br />Your goal: {state.goal}
   </p>

   {plan.map((e, i) => (
    <section className="handout-exercise" key={e.id}>
     <span className="eyebrow">EXERCISE {i + 1}</span>
     <h2>{e.name}</h2>
     <p className="handout-dose">
      {e.sets} {e.sets === 1 ? 'set' : 'sets'} × {e.holdSeconds ? `${e.holdSeconds}s hold` : `${e.reps} reps`}
      {e.tempo ? ` · ${e.tempo}` : ''}
      {e.equipment && e.equipment !== 'none' ? ` · ${e.equipment}` : ''}
     </p>
     <div className="handout-cue-row">
      {e.cues.slice(0, 3).flatMap((cue, n) => [
       ...(n ? [<ArrowRight key={'arrow' + n} size={16} />] : []),
       <div className="handout-cue-card" key={n}>
        <span>0{n + 1}</span>
        <p>{cue}</p>
       </div>,
      ])}
     </div>
     <ol className="handout-cue-list">
      {e.cues.map(c => <li key={c}>{c}</li>)}
     </ol>
     {e.commonMistakes?.length ? (
      <p className="handout-mistakes"><strong>Avoid:</strong> {e.commonMistakes.join(' ')}</p>
     ) : null}
     <p className="handout-note">If this is too sensitive: make the range smaller, reduce the effort, or pause. Do not push into increasing symptoms.</p>
    </section>
   ))}

   <section className="handout-exercise handout-traffic">
    <h2>Your pain traffic light</h2>
    <p>
     🟢 <strong>Green:</strong> Up to 4/10 can be acceptable if it settles within 24 hours and is not worse the next morning.
     <br />🟡 <strong>Amber:</strong> Above 4/10, or discomfort building? Reduce the range and effort, or switch to an easier option.
     <br />🔴 <strong>Red:</strong> Sharp or spreading pain, new numbness or weakness, or symptoms that linger? Pause and reassess. Arrange an in-person assessment for new or worsening symptoms.
    </p>
   </section>

   <p className="handout-footer-note">Written instruction edition. A movement pattern is not a diagnosis; this is not a substitute for in-person clinical assessment.</p>

   <style>{`
    .handout-page{max-width:900px;margin:0 auto;padding:48px 30px 80px;background:var(--bg);min-height:100vh}
    .handout-toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:38px}
    .handout-page h1{margin-top:14px;font-size:36px}
    .handout-sub{margin-top:14px;color:var(--muted);line-height:1.9;font-size:13px}
    .handout-exercise{padding:28px 0;border-top:1px solid var(--line);break-inside:avoid}
    .handout-exercise h2{font-size:22px;margin-top:9px;font-weight:600;color:#4c5b3f}
    .handout-dose{margin-top:9px;font-size:13px;color:var(--olive-dark)}
    .handout-cue-row{display:grid;grid-template-columns:1fr 20px 1fr 20px 1fr;align-items:center;gap:9px;margin:20px 0}
    .handout-cue-row svg{color:var(--olive)}
    .handout-cue-card{background:var(--pale);padding:15px;border-radius:6px;min-height:100px}
    .handout-cue-card>span{font-size:11px;color:var(--olive)}
    .handout-cue-card>p{font-size:13px;line-height:1.7;margin-top:6px;color:var(--ink)}
    .handout-cue-list{font-size:14px;line-height:1.9;padding-inline-start:22px;color:var(--muted)}
    .handout-mistakes{font-size:12px;color:#a17b52;margin-top:12px}
    .handout-note{font-size:12px;color:var(--muted);margin-top:12px}
    .handout-footer-note{font-size:11px;color:var(--muted);margin-top:20px}
    @media print{
     .handout-toolbar{display:none!important}
     .handout-page{padding:0!important;background:white}
     .handout-exercise{break-inside:avoid}
    }
    @media(max-width:720px){
     .handout-cue-row{grid-template-columns:1fr}
     .handout-cue-row svg{display:none}
    }
   `}</style>
  </main>
 );
}
