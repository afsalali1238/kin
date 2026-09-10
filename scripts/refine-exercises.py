import json
path='src/data/exercises.json';ex=json.load(open(path))
# Movement-specific cues supplement the clinical stop rule for every exercise.
for e in ex:
 n=e['name'].lower();g=e['id'].rsplit('-',1)[0]
 cues=None
 if 'breathing' in n:cues=['Lie supported with your knees bent and your shoulders relaxed.','Rest your hands around the lower ribs.','Breathe in gently through your nose and let the ribs widen.','Breathe out slowly without bracing or forcing the breath.'];e.update(sets=1,reps=6,positionRequired='lying')
 elif 'rest' in n:cues=['Support the painful area with a pillow or folded towel.','Choose a position that reduces discomfort rather than stretching it.','Let the surrounding muscles relax as you breathe slowly.'];e.update(sets=1,reps=0,holdSeconds=45)
 elif 'pelvic tilt' in n:cues=['Lie on your back with your knees bent and feet supported.','Gently roll your pelvis to soften the space beneath your lower back.','Return to the middle without pushing into a large arch.']
 elif 'knee rocks' in n or 'hip rolls' in n:cues=['Lie on your back with both knees bent and feet together.','Let the knees move a small distance to one side.','Return to centre, then repeat to the other side without forcing range.']
 elif 'back extension' in n:cues=['Lie on your stomach with a pillow under the chest if needed.','Prop gently onto your forearms, keeping your pelvis relaxed.','Return down if symptoms spread farther into the leg.'];e['contraindicatedFor']=['back-flexion']
 elif 'brace' in n:cues=['Lie on your back with your knees bent.','Gently tighten the lower abdomen as if preparing for a light nudge.','Keep breathing normally and release fully between holds.']
 elif 'bridge' in n:cues=['Lie on your back with knees bent and feet hip-width apart.','Press through the feet and lift your hips without arching the back.','Lower slowly and keep the pelvis level.'];e['positionRequired']='lying'
 elif 'bird dog' in n:cues=['Start on hands and knees with your back comfortable.','Slide one leg back; add the opposite arm only if you stay steady.','Keep your pelvis level and return slowly without holding your breath.'];e['positionRequired']='four_point'
 elif 'heel slide' in n:cues=['Lie with your legs supported.','Slide one heel towards your bottom through a comfortable range.','Slide it away again without forcing the knee or back.'];e['positionRequired']='lying'
 elif 'sit to stand' in n or 'chair squat' in n:cues=['Sit near the front of a stable chair with feet hip-width apart.','Lean forward slightly and press through both feet to stand.','Lower slowly to the chair; use the armrests if needed.'];e['equipment']='chair'
 elif 'hip hinge' in n:cues=['Stand with feet hip-width apart and knees softly bent.','Send your hips backwards while keeping the load close to your body.','Press through the feet to stand tall without leaning backwards.']
 elif 'split squat' in n:cues=['Stand in a short split stance beside a stable support.','Lower a small distance by bending both knees.','Push through the front foot and keep the knee pointing with your toes.']
 elif 'squat' in n:cues=['Stand with feet comfortably apart beside a stable support.','Bend hips and knees together as if sitting back.','Push through the feet to return, staying within a manageable range.']
 elif 'step' in n:cues=['Use a low, stable step and keep a hand near a rail.','Place your whole foot on the step and keep the knee aligned with your toes.','Move slowly up or down without dropping the pelvis.']
 elif 'carry' in n:cues=['Choose a light load you can hold without increasing symptoms.','Stand comfortably tall and take slow, even steps.','Keep breathing and avoid leaning to compensate for the load.']
 elif 'calf' in n or 'heel rais' in n or 'heel lowering' in n:cues=['Hold a stable support and keep your feet pointing forwards.','Rise onto the balls of your feet without rolling the ankles outwards.','Lower the heels over three seconds; begin on level ground.'];e['tempo']='3 seconds down';e['contraindicatedFor']=[]
 elif 'balance' in n:cues=['Stand beside a counter with your fingertips ready for support.','Shift weight onto one foot without gripping with your toes.','Keep the pelvis level; put the other foot down whenever needed.']
 elif 'ankle' in n or 'toe' in n:cues=['Sit with the leg supported and the foot free to move.','Move the ankle or toes slowly through a comfortable range.','Keep the knee still and avoid forcing into the painful direction.'];e['positionRequired']='seated'
 elif 'pendulum' in n:cues=['Support one hand on a stable table and lean forward.','Let the other arm relax and hang freely.','Shift your body gently to create small, easy circles without actively lifting the arm.']
 elif 'table slide' in n:cues=['Sit facing a table with the hand resting on a towel.','Slide the hand forward as you lean gently from the hips.','Stop before sharp pain and slide back without shrugging.'];e['positionRequired']='seated'
 elif 'external rotation' in n:cues=['Keep your elbow bent to a right angle and close to your side.','Turn the forearm outwards without twisting your trunk.','For a hold, press gently into a wall or the other hand without moving.']
 elif 'wall slide' in n or 'arm elevation' in n or 'overhead' in n:cues=['Support your arm on a wall or with your other hand.','Reach upwards only as far as feels comfortable.','Keep the neck relaxed and lower slowly without forcing the range.']
 elif 'scaption' in n:cues=['Stand with thumbs pointing up and arms slightly forward of your sides.','Raise the arms slowly to a comfortable height, no higher than the shoulders at first.','Lower over three seconds without shrugging.']
 elif 'push up' in n or 'wall press' in n:cues=['Place your hands on a wall or a stable raised surface.','Bend your elbows slowly while keeping your body in a comfortable line.','Press away without shrugging or forcing shoulder pain.']
 elif 'row' in n or 'pull apart' in n:cues=['Secure a light band to a stable anchor, or hold it between your hands for a pull-apart.','Draw your elbows back while keeping the shoulders relaxed.','Return slowly without leaning backwards or jutting your chin.'];e['equipment']='band'
 elif 'neck' in n or 'chin' in n:cues=['Sit supported with your shoulders relaxed.','For turns, rotate your head gently; for chin nods, make a small yes movement.','For a hold, press lightly into your hand without moving your head.','Stop if you develop dizziness, spreading tingling, or a new headache.'];e['positionRequired']='seated'
 elif 'shoulder' in n or 'chest' in n:cues=['Sit or stand comfortably without bracing your neck.','Let your shoulder blades move gently back and then relax.','Keep the movement small and do not pull hard downwards.']
 elif 'quadriceps' in n or 'knee extension' in n:cues=['Sit or lie with the thigh supported.','Straighten the knee gently by tightening the front of the thigh.','Keep the hip relaxed; lower slowly or release the hold completely.']
 elif 'knee bend' in n:cues=['Sit on a stable chair with your foot on the floor.','Slide the foot backwards to bend the knee comfortably.','Slide it forwards again without forcing stiffness.'];e['positionRequired']='seated'
 elif 'gluteal' in n:cues=['Lie or stand with your hips supported comfortably.','Squeeze the buttock muscles gently without arching your back.','Keep breathing and relax completely between efforts.']
 elif 'hip abduction' in n:cues=['Stand beside a stable support and keep your pelvis level.','Move one leg a small distance sideways without leaning your trunk.','For a hold, press the outer leg gently into a wall without moving.'];e['contraindicatedFor']=[]
 elif 'hip rotation' in n:cues=['Sit tall with both thighs supported.','Keep the thigh still and move your foot gently inwards and outwards.','Avoid twisting the pelvis or forcing groin pain.'];e['positionRequired']='seated'
 elif 'wrist' in n or 'forearm' in n:cues=['Rest your forearm on a table with your hand just beyond the edge.','Move the wrist or rotate the forearm slowly while keeping the elbow still.','For a hold, press lightly into the other hand without moving.','Start with no weight and add a small load only if the next morning is no worse.'];e['positionRequired']='seated'
 elif 'thumb' in n or 'pinch' in n or 'hand' in n or 'grip' in n:cues=['Rest your forearm on a support and keep the wrist near neutral.','Open and close the fingers or move the thumb gently without forcing a stretch.','Use only a light grip and stop if numbness increases.'];e['positionRequired']='seated'
 elif 'thoracic' in n or 'open book' in n or 'rotation' in n:cues=['Sit supported, or lie on your side for an open book.','Turn through the upper back while keeping your pelvis comfortable and steady.','Breathe out gently into the movement and return without forcing range.']
 elif 'prone arm' in n:cues=['Lie on your stomach with your forehead supported on a towel.','Lift an arm a small distance while keeping your neck relaxed.','Lower slowly without shrugging or arching your back.'];e['positionRequired']='lying'
 if cues:e['cues']=cues
 e['commonMistakes']=['Forcing the movement beyond a comfortable range.','Holding your breath or rushing the lowering phase.']
 if e['phase']==1 and e['id'].endswith('-1'):
  # A true step-down for the floor variant is a reduced-dose version, not a self-link.
  e['easierVariantId']=e['id']+'-supported'
# Keep the library at 120 primary movements plus explicit floor/cap variants.
variants=[]
for e in ex:
 if e['id'].endswith('-1'):
  v=dict(e);v.update(id=e['id']+'-supported',name='Short '+e['name'].lower(),sets=1,reps=3,holdSeconds=10 if e['holdSeconds'] else 0,harderVariantId=e['id'],easierVariantId=e['id']+'-supported');variants.append(v)
 if e['id'].endswith('-15'):
  v=dict(e);v.update(id=e['id']+'-progressed',name=e['name']+' with a little more resistance',harderVariantId=e['id']+'-progressed',easierVariantId=e['id']);e['harderVariantId']=v['id'];variants.append(v)
json.dump(ex+variants,open(path,'w'),indent=2,ensure_ascii=False)
print('Refined',len(ex),'primary exercises and added',len(variants),'boundary variants')
