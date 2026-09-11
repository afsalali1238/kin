'use client';
import type { Exercise } from '@/lib/clinical';

// Map each exercise id to a distinct animation key.
// This ensures every exercise has a truly tailored motion – not a generic family pose.
const animationFor: Record<string, string> = {
  // lower-back
  'lower-back-1': 'breathe-supine',
  'lower-back-2': 'pelvic-tilt',
  'lower-back-3': 'knee-rock',
  'lower-back-4': 'prone-press',
  'lower-back-5': 'brace-supine',
  'lower-back-6': 'heel-slide',
  'lower-back-7': 'bridge',
  'lower-back-8': 'birddog-prep',
  'lower-back-9': 'sit-stand',
  'lower-back-10': 'hinge',
  'lower-back-11': 'bridge-march',
  'lower-back-12': 'birddog-full',
  'lower-back-13': 'chair-squat',
  'lower-back-14': 'weighted-hinge',
  'lower-back-15': 'suitcase-carry',
  'lower-back-1-supported': 'breathe-supine',
  'lower-back-15-progressed': 'suitcase-carry-loaded',
  // neck
  'neck-1': 'neck-rest',
  'neck-2': 'neck-turn',
  'neck-3': 'chin-nod',
  'neck-4': 'neck-hold-rotate',
  'neck-5': 'shoulder-roll',
  'neck-6': 'chin-tuck',
  'neck-7': 'neck-rotate-full',
  'neck-8': 'neck-isometric',
  'neck-9': 'wall-slide',
  'neck-10': 'band-row',
  'neck-11': 'chin-tuck-standing',
  'neck-12': 'resisted-rotation',
  'neck-13': 'incline-push',
  'neck-14': 'band-pullapart',
  'neck-15': 'overhead-reach',
  'neck-1-supported': 'neck-rest',
  'neck-15-progressed': 'overhead-reach-loaded',
  // shoulder
  'shoulder-1': 'shoulder-rest',
  'shoulder-2': 'pendulum',
  'shoulder-3': 'table-slide',
  'shoulder-4': 'scap-set',
  'shoulder-5': 'er-hold',
  'shoulder-6': 'assisted-elevation',
  'shoulder-7': 'wall-slide-shoulder',
  'shoulder-8': 'band-er',
  'shoulder-9': 'scaption',
  'shoulder-10': 'wall-push',
  'shoulder-11': 'er-standing',
  'shoulder-12': 'band-row-shoulder',
  'shoulder-13': 'incline-push-shoulder',
  'shoulder-14': 'weighted-scaption',
  'shoulder-15': 'overhead-press',
  'shoulder-1-supported': 'shoulder-rest',
  'shoulder-15-progressed': 'overhead-press-loaded',
  // knee
  'knee-1': 'knee-rest',
  'knee-2': 'knee-extension-hold',
  'knee-3': 'heel-slide-knee',
  'knee-4': 'quad-set',
  'knee-5': 'seated-knee-bend',
  'knee-6': 'seated-knee-extension',
  'knee-7': 'high-sit-stand',
  'knee-8': 'low-step-up',
  'knee-9': 'mini-squat',
  'knee-10': 'slow-knee-extension',
  'knee-11': 'chair-squat-knee',
  'knee-12': 'step-down',
  'knee-13': 'split-squat',
  'knee-14': 'weighted-squat',
  'knee-15': 'single-leg-sit-stand',
  'knee-1-supported': 'knee-rest',
  'knee-15-progressed': 'single-leg-sit-stand-loaded',
  // hip
  'hip-1': 'hip-rest',
  'hip-2': 'hip-roll',
  'hip-3': 'glute-set',
  'hip-4': 'hip-abduction-hold',
  'hip-5': 'seated-hip-rotation',
  'hip-6': 'bridge-hip',
  'hip-7': 'hip-abduction',
  'hip-8': 'high-chair-hip',
  'hip-9': 'low-step-hip',
  'hip-10': 'hinge-hip',
  'hip-11': 'single-bridge',
  'hip-12': 'lateral-step-up',
  'hip-13': 'split-squat-hip',
  'hip-14': 'weighted-hinge-hip',
  'hip-15': 'lateral-step-down',
  'hip-1-supported': 'hip-rest',
  'hip-15-progressed': 'lateral-step-down-loaded',
  // ankle
  'ankle-1': 'ankle-rest',
  'ankle-2': 'ankle-pump',
  'ankle-3': 'ankle-circle',
  'ankle-4': 'calf-hold',
  'ankle-5': 'toe-spread',
  'ankle-6': 'seated-heel-raise',
  'ankle-7': 'double-calf',
  'ankle-8': 'band-eversion',
  'ankle-9': 'balance-supported',
  'ankle-10': 'heel-lowering',
  'ankle-11': 'single-calf',
  'ankle-12': 'step-calf',
  'ankle-13': 'balance-reach',
  'ankle-14': 'loaded-calf',
  'ankle-15': 'quick-calf',
  'ankle-1-supported': 'ankle-rest',
  'ankle-15-progressed': 'quick-calf-loaded',
  // elbow / wrist / hand
  'elbow-1': 'wrist-rest',
  'elbow-2': 'wrist-circle',
  'elbow-3': 'wrist-hold-extension',
  'elbow-4': 'hand-open',
  'elbow-5': 'thumb-slide',
  'elbow-6': 'wrist-extension',
  'elbow-7': 'wrist-flexion',
  'elbow-8': 'forearm-rotation',
  'elbow-9': 'towel-grip',
  'elbow-10': 'eccentric-wrist',
  'elbow-11': 'loaded-wrist-extension',
  'elbow-12': 'loaded-wrist-flexion',
  'elbow-13': 'towel-twist',
  'elbow-14': 'farmer-carry-elbow',
  'elbow-15': 'pinch-release',
  'elbow-1-supported': 'wrist-rest',
  'elbow-15-progressed': 'pinch-release-loaded',
  // upper-back / thoracic
  'upper-back-1': 'rib-breathing',
  'upper-back-2': 'shoulder-roll-upper',
  'upper-back-3': 'thoracic-rotation',
  'upper-back-4': 'scap-upper',
  'upper-back-5': 'chest-opening',
  'upper-back-6': 'thoracic-extension',
  'upper-back-7': 'open-book',
  'upper-back-8': 'wall-slide-upper',
  'upper-back-9': 'band-row-upper',
  'upper-back-10': 'thoracic-rotation-standing',
  'upper-back-11': 'band-pullapart-upper',
  'upper-back-12': 'prone-arm-lift',
  'upper-back-13': 'resisted-row-upper',
  'upper-back-14': 'rotation-press',
  'upper-back-15': 'overhead-reach-upper',
  'upper-back-1-supported': 'rib-breathing',
  'upper-back-15-progressed': 'overhead-reach-upper-loaded',
};

const labelEn: Record<string, string> = {
  'breathe-supine': 'Breathe into the ribs, let the belly soften',
  'pelvic-tilt': 'Gently rock the pelvis, flatten the low back',
  'knee-rock': 'Knees rock side to side, small and easy',
  'prone-press': 'Press gently onto forearms, pelvis stays soft',
  'brace-supine': 'Lightly brace as if for a gentle nudge',
  'heel-slide': 'Slide heel toward you, then away with control',
  'bridge': 'Press through feet, lift hips without arching',
  'birddog-prep': 'Slide one leg back, pelvis stays level',
  'sit-stand': 'Nose over toes, press through both feet to stand',
  'hinge': 'Hips back, back flat, then drive hips forward',
  'bridge-march': 'Hold bridge, lift one knee a little',
  'birddog-full': 'Opposite arm and leg reach, hold steady',
  'chair-squat': 'Sit back as if to a chair, chest proud',
  'weighted-hinge': 'Hinge with weight close, flat back',
  'suitcase-carry': 'Stand tall, carry close, walk steady',
  'suitcase-carry-loaded': 'Carry a little heavier, same tall posture',
  'neck-rest': 'Support the neck, let the muscles soften',
  'neck-turn': 'Turn the head small, eyes follow',
  'chin-nod': 'Small nod – chin glides down, not poking',
  'neck-hold-rotate': 'Turn against hand, hold, breathe',
  'shoulder-roll': 'Roll shoulders back and down, neck easy',
  'chin-tuck': 'Glide chin straight back, lengthen the neck',
  'neck-rotate-full': 'Rotate fully within comfort, slow',
  'neck-isometric': 'Press head into hand, no movement',
  'wall-slide': 'Forearms slide up the wall, ribs stay down',
  'band-row': 'Elbows drive back, shoulder blades together',
  'chin-tuck-standing': 'Standing chin glide, tall posture',
  'resisted-rotation': 'Hand resists gentle turning',
  'incline-push': 'Hands on wall, chest lowers with control',
  'band-pullapart': 'Band apart at chest height, squeeze blades',
  'overhead-reach': 'Reach overhead, ribs stay soft',
  'overhead-reach-loaded': 'Reach with a light load, control down',
  'shoulder-rest': 'Arm supported, let the shoulder settle',
  'pendulum': 'Let the arm hang, body makes the swing',
  'table-slide': 'Hand slides forward on the towel',
  'scap-set': 'Blades gently together then relax',
  'er-hold': 'Elbow at side, press outward into hand',
  'assisted-elevation': 'Other arm helps lift, lower slowly',
  'wall-slide-shoulder': 'Arm slides up wall within comfort',
  'band-er': 'Elbow tucked, rotate out against band',
  'scaption': 'Thumbs up, lift in scapular plane to shoulder height',
  'wall-push': 'Chest to wall and press away slowly',
  'er-standing': 'Standing external rotation, no trunk twist',
  'band-row-shoulder': 'Band row, elbows close',
  'incline-push-shoulder': 'Incline push, body in line',
  'weighted-scaption': 'Light weight scaption, control down 3s',
  'overhead-press': 'Press overhead, neck stays relaxed',
  'overhead-press-loaded': 'Press with a little more load',
  'knee-rest': 'Knee supported, let it settle',
  'knee-extension-hold': 'Tighten front thigh, straighten gently',
  'heel-slide-knee': 'Heel slides in, knee bends comfortably',
  'quad-set': 'Press knee gently down, quad tightens',
  'seated-knee-bend': 'Foot slides back, knee bends',
  'seated-knee-extension': 'Straighten knee, toe up',
  'high-sit-stand': 'Higher seat, press through feet',
  'low-step-up': 'Whole foot on step, knee over toes',
  'mini-squat': 'Mini squat by support, knees with toes',
  'slow-knee-extension': 'Straighten slowly, lower 3s',
  'chair-squat-knee': 'Chair squat, steady pace',
  'step-down': 'Slow step down, pelvis level',
  'split-squat': 'Short split, lower a little',
  'weighted-squat': 'Hold weight close, squat controlled',
  'single-leg-sit-stand': 'More weight through one leg',
  'single-leg-sit-stand-loaded': 'Single-leg sit-stand with load',
  'hip-rest': 'Hip supported, breathing easy',
  'hip-roll': 'Knees rock, pelvis follows gently',
  'glute-set': 'Squeeze buttocks without arching back',
  'hip-abduction-hold': 'Leg out to wall, press gently',
  'seated-hip-rotation': 'Foot in-out, thigh stays',
  'bridge-hip': 'Hip bridge, pelvis level',
  'hip-abduction': 'Lift leg sideways, pelvis still',
  'high-chair-hip': 'Sit-stand from high seat',
  'low-step-hip': 'Step up, whole foot',
  'hinge-hip': 'Hinge from hips, soft knees',
  'single-bridge': 'One leg bridge, hold level',
  'lateral-step-up': 'Side step up, knee tracks',
  'split-squat-hip': 'Split squat, upright torso',
  'weighted-hinge-hip': 'Weight close, hinge',
  'lateral-step-down': 'Side step down, control',
  'lateral-step-down-loaded': 'Side step down with more load',
  'ankle-rest': 'Ankle supported, rest',
  'ankle-pump': 'Pump ankle up and down',
  'ankle-circle': 'Gentle ankle circles',
  'calf-hold': 'Heels lifted, hold steady',
  'toe-spread': 'Spread and relax toes',
  'seated-heel-raise': 'Heels rise, seated tall',
  'double-calf': 'Rise onto toes, both feet',
  'band-eversion': 'Foot turns out against band',
  'balance-supported': 'Weight on one foot, fingertips ready',
  'heel-lowering': 'Rise up, lower 3s on level ground',
  'single-calf': 'One foot rise, steady',
  'step-calf': 'Heels off step edge',
  'balance-reach': 'Reach while balanced',
  'loaded-calf': 'Calf raise with load',
  'quick-calf': 'Quick spring, still controlled',
  'quick-calf-loaded': 'Quick calf with added load',
  'wrist-rest': 'Forearm supported, wrist neutral',
  'wrist-circle': 'Slow wrist circles, elbow still',
  'wrist-hold-extension': 'Wrist holds against other hand',
  'hand-open': 'Open and close hand gently',
  'thumb-slide': 'Thumb slides, wrist neutral',
  'wrist-extension': 'Wrist lifts, forearm supported',
  'wrist-flexion': 'Wrist curls down, control up',
  'forearm-rotation': 'Palm up to down, elbow still',
  'towel-grip': 'Light towel squeeze, then relax',
  'eccentric-wrist': 'Lift with help, lower slowly 3s',
  'loaded-wrist-extension': 'Wrist extension with weight',
  'loaded-wrist-flexion': 'Wrist flexion with weight',
  'towel-twist': 'Twist towel, gentle resistance',
  'farmer-carry-elbow': 'Hold and walk, shoulders set',
  'pinch-release': 'Pinch and release, light grip',
  'pinch-release-loaded': 'Pinch with more resistance',
  'rib-breathing': 'Hands on ribs, widen with inhale',
  'shoulder-roll-upper': 'Shoulder rolls, tall spine',
  'thoracic-rotation': 'Upper back twists, pelvis still',
  'scap-upper': 'Blades set down and together',
  'chest-opening': 'Open chest gently, no forcing',
  'thoracic-extension': 'Lift chest a little over chair back',
  'open-book': 'Side-lying, arm opens like a book',
  'wall-slide-upper': 'Arms slide up wall, neck easy',
  'band-row-upper': 'Band row, elbows low',
  'thoracic-rotation-standing': 'Rotate upper back while standing',
  'band-pullapart-upper': 'Band pull-apart, pinch blades',
  'prone-arm-lift': 'Lying, arm lifts a little',
  'resisted-row-upper': 'Resisted row, slow return',
  'rotation-press': 'Rotate then press gently',
  'overhead-reach-upper': 'Reach up, ribs down',
  'overhead-reach-upper-loaded': 'Overhead reach with light load',
};

const labelAr: Record<string, string> = {
  'breathe-supine': 'تنفّس في الأضلاع ودع البطن يرتاح',
  'pelvic-tilt': 'حرّك الحوض بلطف وسوّ سطح أسفل الظهر',
  'knee-rock': 'حرّك الركبتين جانبا بمدى صغير',
  'prone-press': 'اتكئ على الساعدين وابق الحوض مرتاحا',
  'brace-supine': 'شدّ البطن بخفة كاستعداد لدفعة',
  'heel-slide': 'اسحب الكعب نحوك ثم أبعده بتحكم',
  'bridge': 'ادفع عبر القدمين وارفع الحوض بلا تقوّس',
  'birddog-prep': 'مدّ ساقا للخلف مع ثبات الحوض',
  'sit-stand': 'اتكئ قليلا للأمام وانهض عبر القدمين',
  'hinge': 'ادفع الوركين للخلف ثم انهض',
  'bridge-march': 'حافظ على الجسر وارفع ركبة قليلا',
  'birddog-full': 'مدّ ذراعا وساقا متعاكستين بثبات',
  'chair-squat': 'اجلس للخلف كأنك تجلس على كرسي',
  'weighted-hinge': 'انحن مع حمل قريب وظهر مستقيم',
  'suitcase-carry': 'قف منتصبا واحمل وامش بثبات',
  'suitcase-carry-loaded': 'احمل أثقل قليلا بنفس الوضعية',
  'neck-rest': 'ادعم الرقبة ودع العضلات ترتاح',
  'neck-turn': 'التف بالرأس قليلا مع حركة العين',
  'chin-nod': 'إيماءة صغيرة للأسفل بلا بروز ذقن',
  'neck-hold-rotate': 'اضغط الرأس على اليد بثبات',
  'shoulder-roll': 'حرّك الكتفين للخلف والأسفل',
  'chin-tuck': 'اسحب الذقن للخلف وأطِل الرقبة',
  'neck-rotate-full': 'دوران كامل ضمن الراحة',
  'neck-isometric': 'اضغط الرأس على اليد دون حركة',
  'wall-slide': 'حرّك الساعدين على الجدار',
  'band-row': 'اسحب المرفقين للخلف',
  'chin-tuck-standing': 'سحب الذقن وقوفا',
  'resisted-rotation': 'قاوم الدوران باليد',
  'incline-push': 'ادفع صدرك عن الجدار',
  'band-pullapart': 'افتح الشريط على مستوى الصدر',
  'overhead-reach': 'مدّ الذراع للأعلى برفق',
  'overhead-reach-loaded': 'مدّ مع حمل خفيف',
  'shoulder-rest': 'ادعم الذراع ودع الكتف يرتاح',
  'pendulum': 'دع الذراع يتدلى وتمايل بالجسم',
  'table-slide': 'حرّك اليد للأمام على المنشفة',
  'scap-set': 'قرّب لوحي الكتف بلطف',
  'er-hold': 'المرفق بجانبك واضغط للخارج',
  'assisted-elevation': 'ساعد الذراع الأخرى على الرفع',
  'wall-slide-shoulder': 'حرّك الذراع على الجدار ضمن الراحة',
  'band-er': 'أدر الساعد للخارج ضد الشريط',
  'scaption': 'ارفع بزاوية الكتف وإبهام لأعلى',
  'wall-push': 'ادفع الحائط ببطء',
  'er-standing': 'دوران خارجي وقوفا',
  'band-row-shoulder': 'سحب الشريط والمرفق قريب',
  'incline-push-shoulder': 'ضغط مائل والجسم مستقيم',
  'weighted-scaption': 'رفع بوزن خفيف وتحكم ٣ث',
  'overhead-press': 'ادفع للأعلى والرقبة مرتاحة',
  'overhead-press-loaded': 'ادفع بحمل أكثر قليلا',
  'knee-rest': 'ادعم الركبة ودعها ترتاح',
  'knee-extension-hold': 'شدّ الفخذ وافرد الركبة بلطف',
  'heel-slide-knee': 'اسحب الكعب واثن الركبة',
  'quad-set': 'اضغط الركبة للأسفل',
  'seated-knee-bend': 'حرّك القدم للخلف',
  'seated-knee-extension': 'افرد الركبة وأصابع القدم لأعلى',
  'high-sit-stand': 'انهض من كرسي مرتفع',
  'low-step-up': 'قدم كاملة على الدرجة',
  'mini-squat': 'قرفصاء مصغر بجانب دعم',
  'slow-knee-extension': 'افرد ببطء واخفض ٣ث',
  'chair-squat-knee': 'قرفصاء كرسي بإيقاع ثابت',
  'step-down': 'انزل ببطء والحوض مستوٍ',
  'split-squat': 'وضع منقسم واخفض قليلا',
  'weighted-squat': 'احمل ثقلا قريبا',
  'single-leg-sit-stand': 'حمل أكثر على ساق واحدة',
  'single-leg-sit-stand-loaded': 'ساق واحدة مع حمل',
  'hip-rest': 'ادعم الورك وتنفس بهدوء',
  'hip-roll': 'تمايل الركبتان مع الحوض',
  'glute-set': 'شدّ الألية بلا تقوّس ظهر',
  'hip-abduction-hold': 'اضغط الساق على الجدار',
  'seated-hip-rotation': 'حرّك القدم للداخل والخارج',
  'bridge-hip': 'جسر الورك بحوض مستوٍ',
  'hip-abduction': 'ارفع الساق جانبا',
  'high-chair-hip': 'انهض من كرسي مرتفع',
  'low-step-hip': 'اصعد بكامل القدم',
  'hinge-hip': 'انحن من الوركين',
  'single-bridge': 'جسر بساق واحدة',
  'lateral-step-up': 'اصعد جانبيا',
  'split-squat-hip': 'قرفصاء منقسم وجذع مستقيم',
  'weighted-hinge-hip': 'انحن مع وزن',
  'lateral-step-down': 'انزل جانبيا بتحكم',
  'lateral-step-down-loaded': 'نزول جانبي مع حمل',
  'ankle-rest': 'ادعم الكاحل',
  'ankle-pump': 'حرّك الكاحل لأعلى وأسفل',
  'ankle-circle': 'دوائر كاحل لطيفة',
  'calf-hold': 'ارفع العقبين وثبّت',
  'toe-spread': 'افتح الأصابع وارتح',
  'seated-heel-raise': 'ارفع العقبين جلوسا',
  'double-calf': 'ارتفع على أطراف القدمين',
  'band-eversion': 'أدر القدم للخارج ضد الشريط',
  'balance-supported': 'قف على ساق واحدة بدعم',
  'heel-lowering': 'ارتفع واخفض ٣ث',
  'single-calf': 'ارتفع بساق واحدة',
  'step-calf': 'عقبان خارج الحافة',
  'balance-reach': 'توازن ومدّ الذراع',
  'loaded-calf': 'رفع ربلة بحمل',
  'quick-calf': 'حركة زنبركية سريعة',
  'quick-calf-loaded': 'حركة سريعة مع حمل',
  'wrist-rest': 'اسند الساعد والرسغ محايد',
  'wrist-circle': 'دوائر رسغ بطيئة',
  'wrist-hold-extension': 'ثبّت الرسغ ضد اليد',
  'hand-open': 'افتح وأغلق اليد',
  'thumb-slide': 'حرّك الإبهام',
  'wrist-extension': 'ارفع الرسغ',
  'wrist-flexion': 'اثن الرسغ للأسفل',
  'forearm-rotation': 'أدر الساعد',
  'towel-grip': 'اعصر منشفة بخفة',
  'eccentric-wrist': 'ارفع بمساعدة واخفض ببطء',
  'loaded-wrist-extension': 'مدّ رسغ مع وزن',
  'loaded-wrist-flexion': 'ثني رسغ مع وزن',
  'towel-twist': 'اعصر منشفة بمقاومة',
  'farmer-carry-elbow': 'احمل وامش بثبات',
  'pinch-release': 'اقرص واترك',
  'pinch-release-loaded': 'اقرص بمقاومة أكبر',
  'rib-breathing': 'يداك على الأضلاع وتوسع بالشهيق',
  'shoulder-roll-upper': 'لف الكتفين وطوّل العمود',
  'thoracic-rotation': 'التف بالصدر والحوض ثابت',
  'scap-upper': 'ثبّت لوحي الكتف للأسفل',
  'chest-opening': 'افتح الصدر بلطف',
  'thoracic-extension': 'ارفع الصدر قليلا',
  'open-book': 'جانبا ككتاب مفتوح',
  'wall-slide-upper': 'انزلق الذراعان على الجدار',
  'band-row-upper': 'سحب شريط والمرفقان منخفضان',
  'thoracic-rotation-standing': 'دوران صدري وقوفا',
  'band-pullapart-upper': 'شد الشريط وقرّب الألواح',
  'prone-arm-lift': 'مستلق على البطن وارفع ذراعا',
  'resisted-row-upper': 'سحب بمقاومة وعودة بطيئة',
  'rotation-press': 'دوران ثم دفع بلطف',
  'overhead-reach-upper': 'مدّ للأعلى والأضلاع للأسفل',
  'overhead-reach-upper-loaded': 'مدّ علوي مع حمل خفيف',
};

export default function ExerciseAnimation({ exercise, playing, arabic }: { exercise: Exercise; playing: boolean; arabic?: boolean }) {
  const key = animationFor[exercise.id] || 'hinge';
  const label = arabic ? (labelAr[key] || exercise.nameAr) : (labelEn[key] || exercise.name);
  const painColor = painGlowColor(exercise.id);
  const isIsometric = exercise.type === 'isometric' || key.includes('hold') || key.includes('isometric') || key.includes('set');
  const tempoText = arabic ? 'ببطء وتحكم' : exercise.tempo;

  return (
    <div className={`exercise-demo ex-${key} ${playing ? 'moving' : ''} ${isIsometric ? 'is-hold' : ''}`}>
      <div className="ex-stage">
        <svg viewBox="0 0 560 300" role="img" aria-label={exercise.name} className="ex-svg">
          <defs>
            <radialGradient id="ex-mat" cx="50%" cy="55%" r="55%">
              <stop offset="0%" stopColor="#eef1e7" />
              <stop offset="100%" stopColor="#e7ecd8" />
            </radialGradient>
            <linearGradient id="ex-body-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f2f7e8" />
              <stop offset="100%" stopColor="#dfe8d1" />
            </linearGradient>
            <filter id="ex-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#8b9a7a" floodOpacity="0.18" />
            </filter>
            <linearGradient id="ex-pain" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={painColor} stopOpacity="0.95" />
              <stop offset="100%" stopColor={painColor} stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* soft background blobs */}
          <ellipse cx="282" cy="278" rx="175" ry="16" fill="#d9dfc9" opacity="0.55" />
          <ellipse cx="282" cy="278" rx="135" ry="8" fill="#eef2e6" opacity="0.9" />

          {/* props layer */}
          <g className="ex-props">{renderProps(key)}</g>

          {/* figure layer */}
          <g className="ex-figure" filter="url(#ex-shadow)">{renderFigure(key, painColor)}</g>

          {/* motion guide */}
          <g className="ex-guide" opacity={playing ? 0.95 : 0.5}>{renderGuide(key)}</g>

          {/* breath / hold indicator */}
          {renderIndicator(key, playing, isIsometric)}
        </svg>

        {/* pain badge */}
        <div className="ex-pain-badge" style={{ borderColor: painColor, color: painColor }}>
          <span className="ex-pain-dot" style={{ background: painColor }} />
          {painLabel(exercise.id, arabic)}
        </div>
      </div>

      {/* caption */}
      <div className="ex-caption">
        <span className="ex-live-dot" />
        <span className="ex-caption-text">{label}</span>
        <span className="ex-tempo">{isIsometric ? (arabic ? 'ثبّت وتنفّس' : 'hold · breathe') : tempoText}</span>
      </div>

      {/* rep dots for non-hold */}
      {!isIsometric && (
        <div className="ex-rep-dots" aria-hidden>
          <i className="ex-dot" /><i className="ex-dot" /><i className="ex-dot" /><i className="ex-dot" />
        </div>
      )}
    </div>
  );
}

function painGlowColor(id: string) {
  if (id.startsWith('lower-back')) return '#c28b6a';
  if (id.startsWith('neck')) return '#c59b6a';
  if (id.startsWith('shoulder')) return '#b89a6a';
  if (id.startsWith('knee')) return '#a99a6d';
  if (id.startsWith('hip')) return '#9d8e6a';
  if (id.startsWith('ankle')) return '#8fa07a';
  if (id.startsWith('elbow')) return '#9a8a7a';
  if (id.startsWith('upper-back')) return '#b0a07a';
  return '#8ea07a';
}
function painLabel(id: string, arabic?: boolean) {
  if (id.startsWith('lower-back')) return arabic ? 'أسفل الظهر' : 'low back focused';
  if (id.startsWith('neck')) return arabic ? 'الرقبة' : 'neck focused';
  if (id.startsWith('shoulder')) return arabic ? 'الكتف' : 'shoulder focused';
  if (id.startsWith('knee')) return arabic ? 'الركبة' : 'knee focused';
  if (id.startsWith('hip')) return arabic ? 'الورك' : 'hip focused';
  if (id.startsWith('ankle')) return arabic ? 'الكاحل' : 'ankle · foot focused';
  if (id.startsWith('elbow')) return arabic ? 'الذراع · الرسغ' : 'elbow · wrist focused';
  if (id.startsWith('upper-back')) return arabic ? 'أعلى الظهر' : 'upper back focused';
  return '';
}

// ---------------- props ----------------
function renderProps(key: string) {
  const mat = <g><rect x="38" y="242" width="484" height="14" rx="7" fill="#d6ddc8" /><rect x="38" y="242" width="484" height="14" rx="7" fill="none" stroke="#c7d1b6" strokeWidth="1.2" /></g>;
  const matThin = <g><rect x="58" y="246" width="444" height="10" rx="5" fill="#d6ddc8" /></g>;
  const stool = (
    <g>
      <rect x="192" y="182" width="108" height="10" rx="5" fill="#c9d3b8" stroke="#b5c1a3" strokeWidth="1.2" />
      <rect x="202" y="192" width="8" height="48" rx="4" fill="#bfcab0" />
      <rect x="284" y="192" width="8" height="48" rx="4" fill="#bfcab0" />
      <rect x="198" y="234" width="96" height="4" rx="2" fill="#c4cfb5" />
    </g>
  );
  const chairBack = (
    <g>
      {stool}
      <rect x="286" y="112" width="10" height="78" rx="5" fill="#c9d3b8" />
      <rect x="268" y="118" width="28" height="8" rx="4" fill="#cfd9bd" />
    </g>
  );
  const wall = <g><line x1="96" y1="42" x2="96" y2="248" stroke="#c2cab4" strokeWidth="3" strokeLinecap="round" /><line x1="96" y1="58" x2="96" y2="232" stroke="#dde3d1" strokeWidth="10" strokeDasharray="0 12" opacity="0.5" /></g>;
  const wallRight = <g><line x1="464" y1="42" x2="464" y2="248" stroke="#c2cab4" strokeWidth="3" /><line x1="464" y1="58" x2="464" y2="232" stroke="#dde3d1" strokeWidth="10" strokeDasharray="0 12" opacity="0.5" /></g>;
  const step = <g><rect x="352" y="212" width="104" height="28" rx="6" fill="#dfe6d1" stroke="#c2cdb3" strokeWidth="1.3" /><rect x="352" y="228" width="104" height="6" rx="3" fill="#c8d3b8" opacity="0.8" /></g>;
  const lowStep = <g><rect x="308" y="222" width="88" height="18" rx="5" fill="#dfe6d1" stroke="#c2cdb3" strokeWidth="1.2" /></g>;
  const table = <g><rect x="178" y="146" width="176" height="10" rx="5" fill="#d8e0c8" stroke="#c0cdb2" strokeWidth="1.2" /><rect x="188" y="156" width="8" height="66" rx="4" fill="#c2ceb2" /><rect x="336" y="156" width="8" height="66" rx="4" fill="#c2ceb2" /></g>;
  const band = <g className="ex-band"><path d="M 214 124 C 242 122 358 122 382 124" stroke="#b8c6a6" strokeWidth="6" strokeLinecap="round" fill="none" /><circle cx="214" cy="124" r="8" fill="#fefefe" stroke="#b8c6a6" strokeWidth="2" /><circle cx="382" cy="124" r="8" fill="#fefefe" stroke="#b8c6a6" strokeWidth="2" /></g>;
  const weight = <g><rect x="334" y="132" width="22" height="22" rx="5" fill="#e8ddd0" stroke="#b7a99a" strokeWidth="1.4" /><circle cx="345" cy="128" r="3" fill="#b7a99a" /></g>;

  if (['breathe-supine','pelvic-tilt','knee-rock','brace-supine','heel-slide','bridge','bridge-march','heel-slide-knee','quad-set','knee-rest','hip-roll','hip-rest','ankle-rest','rib-breathing'].includes(key)) return mat;
  if (['prone-press','prone-arm-lift'].includes(key)) return <g>{mat}<ellipse cx="282" cy="228" rx="64" ry="10" fill="#cbd6b8" opacity="0.25" /></g>;
  if (['birddog-prep','birddog-full','single-bridge','glute-set'].includes(key)) return matThin;
  if (['seated-knee-bend','seated-knee-extension','seated-hip-rotation','seated-heel-raise','wrist-rest','wrist-circle','wrist-hold-extension','hand-open','thumb-slide','wrist-extension','wrist-flexion','forearm-rotation','towel-grip','eccentric-wrist','loaded-wrist-extension','loaded-wrist-flexion','resisted-rotation','pinch-release','pinch-release-loaded'].includes(key)) return <g>{stool}{table}</g>;
  if (['sit-stand','chair-squat','chair-squat-knee','high-sit-stand','high-chair-hip','single-leg-sit-stand','single-leg-sit-stand-loaded','neck-rest','neck-turn','chin-nod','chin-tuck','shoulder-roll','knee-extension-hold','seated-knee-bend','knee-rest'].includes(key)) return stool;
  if (key.includes('chair')) return chairBack;
  if (['wall-slide','wall-slide-shoulder','wall-slide-upper','wall-push','pendulum','shoulder-rest','assisted-elevation'].includes(key)) return <g>{wall}<ellipse cx="222" cy="248" rx="58" ry="7" fill="#d9dfc9" opacity="0.45" /></g>;
  if (['band-row','band-er','band-pullapart','band-row-shoulder','band-row-upper','band-pullapart-upper','band-eversion','resisted-row-upper'].includes(key)) return <g><ellipse cx="222" cy="248" rx="58" ry="7" fill="#d9dfc9" opacity="0.45" />{band}</g>;
  if (key.includes('step') || key.includes('lateral-step')) return <g><ellipse cx="222" cy="248" rx="58" ry="7" fill="#d9dfc9" opacity="0.45" />{step}</g>;
  if (['low-step-up','low-step-hip','step-down','step-calf'].includes(key)) return <g><ellipse cx="222" cy="248" rx="58" ry="7" fill="#d9dfc9" opacity="0.45" />{lowStep}</g>;
  if (key.includes('weighted') || key.includes('loaded') || key.includes('farmer') || key.includes('suitcase')) return <g><ellipse cx="222" cy="248" rx="58" ry="7" fill="#d9dfc9" opacity="0.45" />{weight}</g>;
  if (['open-book','thoracic-rotation'].includes(key)) return mat;
  // default standing ground
  return <g><ellipse cx="222" cy="248" rx="58" ry="7" fill="#d9dfc9" opacity="0.45" /></g>;
}

// ---------------- guide arrows ----------------
function renderGuide(key: string) {
  const arc = (d: string) => (
    <g className="ex-arc">
      <path d={d} fill="none" stroke="#a8b89f" strokeWidth="1.6" strokeDasharray="5 5" strokeLinecap="round" opacity="0.9" />
      <path d="M 0 0 l 7 3 l -3 7" fill="none" stroke="#a8b89f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
  // position arrow tip via transform in CSS per key
  const guides: Record<string, string> = {
    'breathe-supine': 'M 318 168 Q 350 150 318 132',
    'pelvic-tilt': 'M 262 202 Q 282 186 262 170',
    'knee-rock': 'M 358 188 Q 382 172 358 156',
    'prone-press': 'M 268 138 Q 268 110 288 102',
    'bridge': 'M 282 198 Q 302 166 282 134',
    'hinge': 'M 312 84 Q 348 92 336 124',
    'wall-slide': 'M 132 118 Q 132 86 150 66',
    'band-row': 'M 382 124 Q 348 124 314 118',
    'pendulum': 'M 272 146 Q 306 166 272 186',
    'scaption': 'M 264 88 Q 302 58 322 36',
    'ankle-pump': 'M 424 212 Q 438 196 424 180',
    'wrist-circle': 'M 312 152 Q 332 138 312 124',
    'open-book': 'M 272 148 Q 310 132 312 94',
    'thoracic-rotation': 'M 262 132 Q 298 118 298 82',
  };
  const d = guides[key] || 'M 338 88 Q 372 96 338 128';
  const tip = d.split(' ').slice(-2).join(' ');
  // tip marker position
  const [tx, ty] = tip.split(' ').map(Number);
  return (
    <g className="ex-guide-path">
      <path d={d} fill="none" stroke="#aab993" strokeWidth="1.7" strokeDasharray="5 6" strokeLinecap="round" opacity="0.85" />
      {/* arrow head */}
      <g transform={`translate(${isNaN(tx) ? 338 : tx}, ${isNaN(ty) ? 88 : ty}) rotate(-18)`}>
        <path d="M -10 -4 L 0 0 L -10 4" fill="none" stroke="#aab993" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}

function renderIndicator(key: string, playing: boolean, isHold: boolean) {
  if (isHold) {
    return (
      <g className={`ex-hold ${playing ? 'pulse' : ''}`}>
        <circle cx="482" cy="46" r="18" fill="none" stroke="#c8d7b4" strokeWidth="1.4" opacity={playing ? 0.9 : 0.45} />
        <circle cx="482" cy="46" r="10" fill="#eef3e6" stroke="#b7c6a5" strokeWidth="1.2" />
        <text x="482" y="50" textAnchor="middle" fontSize="8" fontWeight="700" fill="#6f7f5a">HOLD</text>
        {playing && <circle cx="482" cy="46" r="26" fill="none" stroke="#c8d7b4" strokeWidth="1" opacity="0.35" className="ex-hold-ripple" />}
      </g>
    );
  }
  if (key.includes('breathe') || key === 'rib-breathing') {
    return (
      <g className={`ex-breath ${playing ? 'breathing' : ''}`}>
        <circle cx="482" cy="46" r="20" fill="#f4f6ec" stroke="#d0dbbf" strokeWidth="1.2" />
        <text x="482" y="44" textAnchor="middle" fontSize="7" fill="#7e8d6b" fontWeight="600">{playing ? 'INHALE' : 'BREATHE'}</text>
        <text x="482" y="52" textAnchor="middle" fontSize="6.5" fill="#9aa88c">slow</text>
        {playing && <circle cx="482" cy="46" r="28" fill="none" stroke="#b8c9a6" strokeWidth="1" opacity="0.28" className="ex-breath-ripple" />}
      </g>
    );
  }
  return (
    <g className="ex-pace" opacity={playing ? 0.85 : 0.42}>
      <rect x="464" y="34" width="36" height="22" rx="11" fill="#f4f6ec" stroke="#d0dbbf" strokeWidth="1.1" />
      <text x="482" y="48" textAnchor="middle" fontSize="7.5" fill="#7e8d6b" fontWeight="600">3s down</text>
    </g>
  );
}

// ---------------- figure rendering ----------------
function renderFigure(key: string, painColor: string) {
  // shared styles
  const skin = { fill: '#e9ddd1', stroke: '#b8a89a', strokeWidth: 1.4 };
  const limb = { stroke: '#7e8f66', strokeWidth: 11, strokeLinecap: 'round' as const, fill: 'none' as const };
  const thin = { stroke: '#7e8f66', strokeWidth: 9, strokeLinecap: 'round' as const, fill: 'none' as const };
  const torsoFill = { fill: '#f1f6e7', stroke: '#b8c6a6', strokeWidth: 1.5 };
  const joint = { fill: '#f7f9f3', stroke: '#8fa07a', strokeWidth: 1.2 };

  // helpers for pain glow
  const glow = (x: number, y: number, rx = 22, ry = 13) => (
    <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={painColor} opacity={0.14} className="ex-pain-glow" />
  );
  const dot = (x: number, y: number) => <circle cx={x} cy={y} r="4.5" fill={painColor} stroke="#fff" strokeWidth="1.2" opacity="0.95" />;

  // --- SUPINE family ---
  if (['breathe-supine','rib-breathing','pelvic-tilt','knee-rock','brace-supine','heel-slide','bridge','bridge-march','heel-slide-knee','quad-set'].includes(key)) {
    const isBreathe = key === 'breathe-supine' || key === 'rib-breathing';
    const isPelvic = key === 'pelvic-tilt';
    const isKneeRock = key === 'knee-rock' || key === 'hip-roll';
    const isBridge = key === 'bridge' || key === 'bridge-march';
    const isHeel = key === 'heel-slide' || key === 'heel-slide-knee';
    return (
      <g className={`fig-supine fig-${key}`}>
        {/* mat shadow */}
        <ellipse cx="282" cy="238" rx="198" ry="10" fill="#c9d1b8" opacity="0.18" />
        {/* head */}
        <g className="ex-head"><circle cx="112" cy="196" r="19" {...skin} /><circle cx="118" cy="192" r="1.3" fill="#8c8275" /><path d="M 108 202 Q 112 206 118 202" fill="none" stroke="#a99d8f" strokeWidth="1.1" strokeLinecap="round" /></g>
        {/* torso */}
        <g className="ex-torso"><path d="M 132 192 L 242 190 Q 258 190 258 202 L 258 214 Q 258 226 242 226 L 132 224 Q 122 224 122 214 L 122 202 Q 122 192 132 192" {...torsoFill} />{isBreathe && <path d="M 172 198 Q 206 198 240 198" stroke="#b8c6a6" strokeWidth="1.2" opacity="0.7" />}{glow(208, 210, 34, 16)}{dot(208,210)}</g>
        {/* pelvis */}
        <g className="ex-pelvis"><ellipse cx="258" cy="216" rx="20" ry="14" fill="#e9efe0" stroke="#b8c6a6" strokeWidth="1.2" /></g>
        {/* arms resting */}
        <path d="M 152 194 L 178 188 L 198 196" {...thin} opacity="0.95" />
        <path d="M 152 212 L 176 216 L 194 212" {...thin} opacity="0.95" />
        {/* legs */}
        <g className="ex-legs">
          <g className="ex-thigh-l"><path d="M 258 216 L 322 204" {...limb} /><g className="ex-shin-l"><path d="M 322 204 L 382 202" {...limb} /><ellipse cx="392" cy="202" rx="10" ry="5" fill="#7e8f66" /></g></g>
          <g className="ex-thigh-r"><path d="M 258 216 L 322 218" {...limb} opacity="0.72" /><g className="ex-shin-r"><path d="M 322 218 L 382 216" {...limb} opacity="0.72" /><ellipse cx="392" cy="216" rx="10" ry="5" fill="#7e8f66" opacity="0.72" /></g></g>
        </g>
        {/* pillow */}
        <ellipse cx="98" cy="214" rx="18" ry="9" fill="#fefefe" stroke="#d8ddd0" strokeWidth="1" />
        {/* knees slightly bent indicator */}
        {isPelvic && <path d="M 258 204 Q 262 194 272 194" fill="none" stroke={painColor} strokeWidth="1.4" strokeDasharray="3 3" opacity="0.65" />}
        {isKneeRock && <g className="ex-knees">{dot(322,211)}</g>}
        {isBridge && <ellipse cx="258" cy="228" rx="28" ry="6" fill={painColor} opacity="0.12" />}
        {isHeel && <circle cx="382" cy="202" r="7" fill="none" stroke={painColor} strokeWidth="1.3" strokeDasharray="2 3" />}
        {/* breathing halo */}
        {isBreathe && <ellipse cx="208" cy="210" rx="56" ry="22" fill="none" stroke="#b8c9a6" strokeWidth="1.1" opacity="0.45" className="ex-breath-halo" />}
      </g>
    );
  }

  if (['prone-press','prone-arm-lift'].includes(key)) {
    const isArmLift = key === 'prone-arm-lift';
    return (
      <g className={`fig-prone fig-${key}`}>
        <ellipse cx="282" cy="238" rx="198" ry="10" fill="#c9d1b8" opacity="0.18" />
        <g className="ex-head"><circle cx="112" cy="202" r="18" {...skin} /><ellipse cx="94" cy="218" rx="18" ry="8" fill="#fefefe" stroke="#d8ddd0" strokeWidth="1" /></g>
        <path d="M 132 202 L 238 200 Q 254 200 254 212 L 254 218 Q 254 230 238 230 L 132 228 Q 122 228 122 218 L 122 212 Q 122 202 132 202" fill="#f1f6e7" stroke="#b8c6a6" strokeWidth="1.5" />
        {glow(236, 214, 22, 12)}{dot(236,214)}
        {/* forearms prop */}
        <path d="M 132 228 L 152 232 L 172 220" {...thin} />
        <path d="M 238 230 L 258 216 L 278 206" {...thin} className="ex-arm-lift" />
        {isArmLift && <g className="ex-prone-arm"><path d="M 254 212 L 294 184 L 326 172" {...limb} /><circle cx="326" cy="172" r="5" fill="#e9ddd1" stroke="#b8a89a" strokeWidth="1.2" /></g>}
        {!isArmLift && <g className="ex-prone-press"><path d="M 132 214 L 142 244" stroke="#7e8f66" strokeWidth="9" strokeLinecap="round" /><path d="M 238 218 L 248 244" stroke="#7e8f66" strokeWidth="9" strokeLinecap="round" /></g>}
        <g className="ex-legs-prone">
          <path d="M 254 222 L 322 222 L 382 222" {...limb} />
          <path d="M 254 230 L 322 230 L 382 230" {...limb} opacity="0.72" />
          <ellipse cx="392" cy="222" rx="10" ry="5" fill="#7e8f66" />
          <ellipse cx="392" cy="230" rx="10" ry="5" fill="#7e8f66" opacity="0.72" />
        </g>
      </g>
    );
  }

  if (['birddog-prep','birddog-full','single-bridge'].includes(key)) {
    const isFull = key === 'birddog-full';
    return (
      <g className={`fig-quad fig-${key}`}>
        <ellipse cx="282" cy="248" rx="176" ry="10" fill="#c9d1b8" opacity="0.16" />
        {/* torso */}
        <g className="ex-torso-quad"><ellipse cx="258" cy="168" rx="62" ry="22" fill="#f1f6e7" stroke="#b8c6a6" strokeWidth="1.45" />{glow(258, 172, 26, 12)}{dot(258,172)}<circle cx="172" cy="158" r="16" {...skin} /></g>
        {/* legs / arms quadruped */}
        <path d="M 208 182 L 202 238" {...thin} />
        <g className="ex-q-leg-l"><path d="M 292 182 L 322 204 L 352 238" {...limb} /><ellipse cx="352" cy="238" rx="9" ry="4.5" fill="#7e8f66" /></g>
        <path d="M 216 180 L 228 148" {...thin} />
        <g className="ex-q-leg-r"><path d="M 292 182 L 314 218 L 318 238" {...limb} opacity="0.92" /></g>
        {isFull && <g className="ex-q-arm"><path d="M 218 162 L 148 138 L 112 126" {...limb} /><circle cx="112" cy="126" r="5" fill="#e9ddd1" stroke="#b8a89a" strokeWidth="1.2" /></g>}
        {!isFull && <path d="M 218 162 L 192 196" {...thin} opacity="0.95" />}
      </g>
    );
  }

  if (['open-book'].includes(key)) {
    return (
      <g className="fig-side">
        <ellipse cx="282" cy="238" rx="198" ry="10" fill="#c9d1b8" opacity="0.18" />
        <g className="ex-head"><circle cx="136" cy="184" r="17" {...skin} /></g>
        <path d="M 154 184 L 248 184 Q 264 184 264 198 L 264 210 Q 264 224 248 224 L 154 224 Q 144 224 144 210 L 144 198 Q 144 184 154 184" fill="#f1f6e7" stroke="#b8c6a6" strokeWidth="1.4" />
        {glow(232, 204, 20, 12)}{dot(232,204)}
        <path d="M 248 200 L 290 188 L 322 178" {...limb} className="ex-open-arm" />
        <path d="M 248 212 L 292 224 L 336 228" {...limb} opacity="0.72" />
        <path d="M 154 208 L 178 238" {...thin} />
        <path d="M 154 216 L 162 238" {...thin} opacity="0.7" />
      </g>
    );
  }

  // Seated / desk
  if (['seated-knee-bend','seated-knee-extension','seated-hip-rotation','seated-heel-raise','wrist-rest','wrist-circle','wrist-hold-extension','hand-open','thumb-slide','wrist-extension','wrist-flexion','forearm-rotation','towel-grip','eccentric-wrist','loaded-wrist-extension','loaded-wrist-flexion','resisted-rotation','pinch-release','pinch-release-loaded','knee-extension-hold','quad-set','seated-knee-bend'].includes(key)) {
    const isLeg = key.includes('knee') || key.includes('heel') || key.includes('hip-rotation');
    return (
      <g className={`fig-seated fig-${key}`}>
        {/* stool + table already in props */}
        <g className="ex-head-seated"><circle cx="244" cy="94" r="18" {...skin} /><path d="M 244 112 L 246 158" stroke="#7e8f66" strokeWidth="8" strokeLinecap="round" /></g>
        <path d="M 246 126 L 282 138 L 312 140" stroke="#7e8f66" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M 246 126 L 214 142" stroke="#7e8f66" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.92" />
        {/* torso */}
        <path d="M 232 112 L 246 112 L 258 158 L 242 158" fill="#f1f6e7" stroke="#b8c6a6" strokeWidth="1.35" />{glow(244, 134, 16, 10)}{dot(244,134)}
        {/* thighs seated */}
        <path d="M 242 158 L 302 158" stroke="#7e8f66" strokeWidth="12" strokeLinecap="round" />
        <path d="M 242 168 L 298 168" stroke="#7e8f66" strokeWidth="12" strokeLinecap="round" opacity="0.72" />
        {/* shins */}
        <g className="ex-shin-seated"><path d="M 302 158 L 304 222" stroke="#7e8f66" strokeWidth="10" strokeLinecap="round" /><ellipse cx="304" cy="226" rx="12" ry="5" fill="#7e8f66" /></g>
        <g className="ex-shin-seated-2"><path d="M 298 168 L 300 222" stroke="#7e8f66" strokeWidth="10" strokeLinecap="round" opacity="0.72" /><ellipse cx="300" cy="226" rx="12" ry="5" fill="#7e8f66" opacity="0.72" /></g>
        {/* forearm on table */}
        <g className="ex-forearm-table">
          <path d="M 226 152 L 298 152 L 322 150" {...thin} />
          <g className="ex-hand-table"><ellipse cx="328" cy="150" rx="9" ry="7" fill="#e9ddd1" stroke="#b8a89a" strokeWidth="1.2" />{key === 'wrist-circle' && <circle cx="328" cy="150" r="12" fill="none" stroke={painColor} strokeWidth="1.1" strokeDasharray="2 3" opacity="0.5" />}</g>
          {key === 'thumb-slide' && <ellipse cx="338" cy="142" rx="6" ry="4" fill="#e9ddd1" stroke="#b8a89a" strokeWidth="1" className="ex-thumb" />}
          {(key.includes('loaded') || key.includes('wrist-extension')) && <rect x="328" y="128" width="28" height="14" rx="4" fill="#e8ddd0" stroke="#b7a99a" strokeWidth="1.2" className="ex-weight-hand" />}
        </g>
        {isLeg && <circle cx="304" cy="158" r="6" fill="#fff" stroke="#8fa07a" strokeWidth="1.2" className="ex-knee-joint" />}
      </g>
    );
  }

  // Standing family – most versatile
  const isCalf = key.includes('calf') || key.includes('heel') || key === 'ankle-pump' || key === 'ankle-circle' || key === 'ankle-rest' || key === 'toe-spread';
  const isBalance = key.includes('balance');
  const isSquat = key.includes('squat') || key === 'mini-squat' || key === 'split-squat' || key === 'split-squat-hip';
  const isHingeFam = key.includes('hinge');
  const isWall = key.includes('wall');
  const isBand = key.includes('band');
  const isPush = key.includes('push') || key.includes('press');
  const isShoulder = key.includes('scaption') || key.includes('overhead') || key === 'wall-slide' || key === 'wall-slide-shoulder';
  const isNeck = key.includes('neck') || key.includes('chin') || key.includes('head');
  const isWristCarry = key.includes('farmer') || key.includes('suitcase') || key.includes('carry');

  return (
    <g className={`fig-standing fig-${key}`}>
      {/* head */}
      <g className="ex-head-stand"><circle cx="244" cy="64" r="19" {...skin} /><circle cx="249" cy="62" r="1.4" fill="#8c8275" /><path d="M 238 70 Q 244 74 250 70" fill="none" stroke="#a99d8f" strokeWidth="1.1" strokeLinecap="round" />{isNeck && glow(244, 78, 14, 9)}</g>
      {/* torso */}
      <g className="ex-torso-stand"><path d="M 232 84 L 256 84 L 260 138 L 228 138" fill="#f1f6e7" stroke="#b8c6a6" strokeWidth="1.4" />{(key.includes('thoracic') || key.includes('rib') || key.includes('chest') || key.includes('upper')) && glow(244, 108, 20, 14)}{(key.includes('low back') || key === 'hinge' || key === 'bridge-hip' || key === 'hinge-hip') && glow(244, 138, 16, 10)}</g>
      {/* pain glow per region */}
      {key.startsWith('shoulder') || key.includes('pendulum') || key.includes('table-slide') || key.includes('scap') || key.includes('er-') ? glow(268, 92, 14, 10) : null}
      {key.includes('knee') ? glow(268, 176, 14, 11) : null}
      {key.includes('hip') && !key.includes('hinge') ? glow(242, 148, 14, 11) : null}
      {isCalf && glow(272, 214, 14, 10)}
      {key.includes('elbow') || key.includes('wrist') || key.includes('forearm') || key.includes('towel') || key.includes('pinch') ? glow(302, 144, 12, 9) : null}
      {/* arms */}
      <g className="ex-arm-l"><path d="M 232 90 L 202 118 L 182 148" {...thin} /><circle cx="182" cy="148" r="4.5" fill="#e9ddd1" stroke="#b8a89a" strokeWidth="1.1" /></g>
      <g className="ex-arm-r"><path d="M 256 90 L 286 118 L 306 148" {...thin} /><circle cx="306" cy="148" r="4.5" fill="#e9ddd1" stroke="#b8a89a" strokeWidth="1.1" /></g>
      {/* band overlay if needed handled in props, but arm position changes */}
      {isBand && <g className="ex-band-arms"><path d="M 214 124 L 382 124" stroke="#b8c6a6" strokeWidth="4" strokeDasharray="2 0" opacity="0.15" /></g>}
      {/* legs */}
      <g className="ex-leg-l"><path d="M 234 138 L 222 182 L 216 236" stroke="#7e8f66" strokeWidth="11" strokeLinecap="round" fill="none" /><ellipse cx="216" cy="240" rx="11" ry="5" fill="#7e8f66" /></g>
      <g className="ex-leg-r"><path d="M 254 138 L 266 182 L 272 236" stroke="#7e8f66" strokeWidth="11" strokeLinecap="round" fill="none" /><ellipse cx="272" cy="240" rx="11" ry="5" fill="#7e8f66" /></g>
      {/* special overlays */}
      {isSquat && <rect x="208" y="192" width="72" height="4" rx="2" fill={painColor} opacity="0.18" className="ex-squat-depth" />}
      {isHingeFam && <path d="M 228 138 L 244 92" stroke={painColor} strokeWidth="1.3" strokeDasharray="3 3" opacity="0.35" />}
      {isCalf && <g className="ex-calf-highlight"><ellipse cx="268" cy="204" rx="10" ry="16" fill="none" stroke={painColor} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.45" /></g>}
      {isWall && <line x1="96" y1="46" x2="96" y2="242" stroke="#d6ddd0" strokeWidth="1" strokeDasharray="4 5" opacity="0.5" />}
      {isWristCarry && <rect x="306" y="132" width="20" height="20" rx="4" fill="#e8ddd0" stroke="#b7a99a" strokeWidth="1.2" />}
      {key === 'pendulum' && <path d="M 244 90 L 244 148 L 272 182" stroke="#7e8f66" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.45" strokeDasharray="6 6" />}
      {key === 'shoulder-rest' && <rect x="268" y="106" width="42" height="18" rx="9" fill="#fefefe" stroke="#d8ddd0" strokeWidth="1" opacity="0.9" />}
      {dotForKey(key)}
    </g>
  );
}

function dotForKey(key: string) {
  // small pain dot placement refinement
  if (key === 'breathe-supine' || key === 'rib-breathing') return <circle cx="208" cy="210" r="3.5" fill="#c28b6a" opacity="0.85" />;
  if (key.includes('neck')) return <circle cx="244" cy="78" r="3.5" fill="#c59b6a" opacity="0.85" />;
  if (key.includes('shoulder')) return <circle cx="268" cy="96" r="3.5" fill="#b89a6a" opacity="0.85" />;
  return null;
}
