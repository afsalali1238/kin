import assert from 'node:assert/strict';
import {defaultIntake, makeProgramme, match, progression, redFlags, variant, type CheckIn} from '../src/lib/clinical';
const high={...defaultIntake,irritability:'high' as const};const low={...defaultIntake,irritability:'low' as const};
const highPlan=makeProgramme('shoulder',high,'rotator-cuff',1);const lowPlan=makeProgramme('shoulder',low,'rotator-cuff',1);
assert.equal(highPlan.length,4);assert.equal(lowPlan.length,4);assert.notDeepEqual(highPlan.map(x=>x.id),lowPlan.map(x=>x.id));assert.ok(highPlan.every(e=>e.phase===1));assert.ok(lowPlan.every(e=>e.phase===2));
for(const a of [high,low,defaultIntake])for(const phase of [1,2,3]){const frozen=makeProgramme('shoulder',a,'frozen-shoulder',phase);assert.equal(frozen.length,4);assert.ok(frozen.every(e=>e.phase===1));}
assert.equal(match('lower-back',{...defaultIntake,aggravators:['sitting','bending'],easers:['arching']})[0].id,'back-extension');
assert.equal(match('shoulder',{...defaultIntake,aggravators:['stiff-all','dressing']})[0].id,'frozen-shoulder');
assert.equal(redFlags({...high,details:['bladder']},'lower-back')?.level,'urgent');
assert.equal(redFlags({...high,pattern:'night'},'neck')?.level,'review');
assert.equal(redFlags(defaultIntake,'knee'),null);
const logs:CheckIn[]=Array.from({length:7},(_,i)=>({date:new Date(2026,0,i+1).toISOString(),pain:6-i*.5,feeling:'right',session:true,phase:1,settled:true,morningWorse:false}));
assert.equal(progression(logs,1).action,'advance');assert.equal(progression(logs.slice(0,6),1).action,'hold');
assert.equal(progression(logs.map(e=>({...e,settled:undefined,morningWorse:undefined})),1).action,'hold');
assert.equal(progression(logs.map((e,i)=>({...e,pain:i+1})),1).action,'regress');
assert.notEqual(variant(highPlan[0],'easier','rotator-cuff').id,highPlan[0].id);
console.log('Clinical checks passed: irritability split, frozen-shoulder safety, pattern matching, red flags, earned progression, easier variants.');
