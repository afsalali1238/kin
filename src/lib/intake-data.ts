/**
 * Intake-form content: movement aggravator/easer options per region group and
 * their Arabic chip labels. Kept out of components so the split screens stay
 * presentation-only.
 */
export const aggravators: Record<string, [string, string][]> = {
  'lower-back': [['bending', 'Bending forward'], ['arching', 'Arching back'], ['sitting', 'Sitting > 20 min'], ['standing', 'Standing'], ['walking', 'Walking'], ['lifting', 'Lifting'], ['one-leg', 'Standing on one leg']],
  neck: [['turning', 'Turning my head'], ['desk', 'Working at a desk'], ['sitting', 'Sitting'], ['headache', 'Headache with neck movement'], ['overhead', 'Looking up']],
  shoulder: [['overhead', 'Reaching overhead'], ['lifting', 'Lifting'], ['dressing', 'Getting dressed'], ['stiff-all', 'Stiff in every direction'], ['cross-body', 'Reaching across my body'], ['side-lying', 'Lying on my side']],
  knee: [['stairs', 'Stairs'], ['squatting', 'Squatting'], ['running', 'Running'], ['jumping', 'Jumping'], ['twisting', 'Twisting'], ['deep-bend', 'Deep bending'], ['walking', 'Walking']],
  hip: [['side-lying', 'Lying on my side'], ['one-leg', 'Standing on one leg'], ['walking', 'Walking'], ['running', 'Running'], ['stairs', 'Stairs']],
  ankle: [['running', 'Running'], ['standing', 'Standing'], ['heel-raise', 'Rising onto my toes'], ['walking', 'Walking'], ['twisting', 'Turning my ankle']],
  elbow: [['gripping', 'Gripping'], ['lifting', 'Lifting'], ['pulling', 'Pulling'], ['wrist-flexion', 'Bending my wrist'], ['thumb', 'Moving my thumb'], ['pinching', 'Pinching']],
  'upper-back': [['sitting', 'Sitting'], ['turning', 'Turning'], ['breathing', 'Deep breathing'], ['twisting', 'Twisting'], ['lifting', 'Lifting']],
};

export const arabicChips: Record<string, string> = {
  bending: 'الانحناء للأمام', arching: 'تقويس الظهر', sitting: 'الجلوس', standing: 'الوقوف', walking: 'المشي', lifting: 'الرفع',
  'one-leg': 'الوقوف على ساق واحدة', turning: 'الالتفات', desk: 'العمل المكتبي', headache: 'صداع مع حركة الرقبة',
  overhead: 'الوصول فوق الرأس', dressing: 'ارتداء الملابس', 'stiff-all': 'تيبس في كل الاتجاهات', 'cross-body': 'مد الذراع عبر الجسم',
  'side-lying': 'النوم على الجانب', stairs: 'الدرج', squatting: 'القرفصاء', running: 'الجري', jumping: 'القفز',
  twisting: 'الالتواء', 'deep-bend': 'الانحناء العميق', 'heel-raise': 'رفع الكعب', gripping: 'القبض', pulling: 'السحب',
  'wrist-flexion': 'ثني الرسغ', thumb: 'تحريك الإبهام', pinching: 'القرص', breathing: 'التنفس العميق',
};
