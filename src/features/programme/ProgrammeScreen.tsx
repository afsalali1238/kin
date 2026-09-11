'use client';
import { ArrowRight, Check, Clock3, Dumbbell, LockKeyhole, Play, Printer, Rotate3D, Settings2, Sparkles, Target } from 'lucide-react';
import type { Exercise } from '@/lib/clinical';
import type { Journey } from '@/lib/derive';
import type { T } from '@/lib/app-types';

export type ProgrammeScreenProps = {
  t: T;
  arabic: boolean;
  assessed: boolean;
  goal: string;
  phase: number;
  phaseTab: number;
  plan: Exercise[];
  dose: Journey['dose'];
  presentationName: string;
  irritability: string;
  duration: string;
  onPhaseTab: (phase: number) => void;
  onStart: () => void;
  onGetPlan: () => void;
};

const phases: [number, string, string, string][] = [
  [1, 'Calm', 'Find comfortable movement', 'Typically days 1–14'],
  [2, 'Load', 'Rebuild strength & control', 'Typically weeks 2–6'],
  [3, 'Capacity', 'Get back to what you love', 'Typically weeks 6–12'],
];

export default function ProgrammeScreen({
  t, arabic, assessed, goal, phase, phaseTab, plan, dose, presentationName, irritability, duration,
  onPhaseTab, onStart, onGetPlan,
}: ProgrammeScreenProps) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{t('YOUR WAY FORWARD', 'طريقك إلى الأمام')}</div>
          <h1>{t('Small steps. Stronger you.', 'خطوات صغيرة. أنت أقوى.')}</h1>
          <p>
            {assessed
              ? t(`Your goal: ${goal}`, 'هدفك هو العودة إلى ما تحب.')
              : t('Explore a sample programme, then build one around you.', 'استكشف نموذج برنامج ثم أنشئ برنامجك.')}
          </p>
        </div>
        <span className="badge"><Settings2 size={14} />{t(`${irritability} irritability`, 'جرعة مخصّصة')}</span>
      </div>
      {!assessed && (
        <div className="sample-banner">
          <Sparkles size={17} />
          {t('Sample programme · Complete your body assessment for your own plan.', 'نموذج برنامج · أكمل تقييمك للحصول على خطتك.')}
          <button onClick={onGetPlan}>{t('Get my plan', 'إنشاء خطتي')}<ArrowRight size={15} /></button>
        </div>
      )}
      <div className="phase-grid">
        {phases.map(([n, name, sub, time]) => (
          <button key={n} className={`phase-card ${phaseTab === n ? 'selected' : ''}`} aria-pressed={phaseTab === n} onClick={() => onPhaseTab(n)}>
            <div>
              <span className="phase-index">0{n}</span>
              {n > phase ? <LockKeyhole size={17} /> : <Check size={17} />}
            </div>
            <h2>{t(name, n === 1 ? 'تهدئة' : n === 2 ? 'تحميل' : 'قدرة')}</h2>
            <p>{t(sub, n === 1 ? 'العثور على حركة مريحة' : n === 2 ? 'بناء القوة والتحكّم' : 'العودة لما تحب')}</p>
            <small>{t(time, 'التقدّم حسب استجابتك، لا التقويم')}</small>
            <span className="phase-status">
              {n === phase
                ? t('YOUR CURRENT PHASE', 'مرحلتك الحالية')
                : n > phase
                  ? t('EARNED, NOT SCHEDULED', 'تُكتسب ولا تُجدول')
                  : t('COMPLETED', 'مكتملة')}
            </span>
          </button>
        ))}
      </div>
      <div className="programme-layout">
        <section>
          <div className="section-heading">
            <h2>{t(phaseTab === phase ? 'Your next session' : 'What’s ahead', phaseTab === phase ? 'جلستك التالية' : 'ما ينتظرك')}</h2>
            <span><Clock3 size={15} />{dose.minutes} {t('min', 'دقيقة')}<span>·</span>{plan.length} {t('exercises', 'تمارين')}</span>
          </div>
          <div className="exercise-list">
            {plan.map((e, i) => (
              <div className="exercise-row" key={e.id}>
                <span className="exercise-order">0{i + 1}</span>
                <div className="exercise-type-icon">{e.type === 'mobility' ? <Rotate3D size={25} /> : <Dumbbell size={25} />}</div>
                <div className="exercise-info">
                  <h3>{arabic ? e.nameAr : e.name}</h3>
                  <p>
                    {e.sets} {t('sets', 'مجموعات')} × {e.holdSeconds ? `${e.holdSeconds}s ${t('hold', 'ثبات')}` : `${e.reps} ${t('reps', 'تكرارات')}`}
                    <span>·</span>
                    {arabic ? 'ببطء وتحكّم' : e.tempo}
                  </p>
                  <details>
                    <summary>{t('Why this exercise?', 'لماذا هذا التمرين؟')}</summary>
                    <p>
                      {t(
                        `${e.type === 'mobility' ? 'Keeps useful movement comfortable' : e.type === 'isometric' ? 'Introduces load without a large movement' : 'Builds tolerance for everyday load'} for ${presentationName.toLowerCase()}. ${e.cues[1]}`,
                        'يساعد هذا التمرين على بناء القدرة والحفاظ على الحركة المريحة تدريجياً.',
                      )}
                    </p>
                  </details>
                </div>
                <span className="exercise-equipment">{e.equipment === 'none' ? t('No equipment', 'دون أدوات') : e.equipment}</span>
              </div>
            ))}
          </div>
          <div className="notice">
            <Sparkles size={19} />
            <span>
              {t(
                irritability === 'high'
                  ? 'Your pain is easily stirred up, so we’ve kept the range small and the session short. Gentle doses first — we’ll build from here.'
                  : duration === 'persistent'
                    ? 'You’ve been dealing with this for a while. We’ll build confidence and capacity with manageable loading — your body is adaptable.'
                    : 'Your response matters more than the calendar. We’ll add load when your pain is steady and the current exercises feel manageable.',
                'استجابتك أهم من التقويم. نزيد الحمل عندما يستقر الألم وتصبح التمارين مناسبة.',
              )}
            </span>
          </div>
        </section>
        <aside className="programme-aside">
          <span className="eyebrow">{t('MADE FOR YOUR EVERYDAY', 'مصمّم ليومك')}</span>
          <h3>{t('A little, consistently.', 'القليل، باستمرار.')}</h3>
          <p>{t(dose.frequency, 'وتيرة تتناسب مع استجابتك')}</p>
          <div className="programme-stat"><Clock3 size={20} /><div><strong>{dose.minutes} {t('minutes', 'دقيقة')}</strong><small>{t('You can make time for you.', 'وقت صغير من أجلك.')}</small></div></div>
          <div className="programme-stat"><Target size={20} /><div><strong>{t('Progress at your pace', 'تقدّم بإيقاعك')}</strong><small>{t('70% adherence + stable pain + manageable effort + next-day recovery.', 'التزام ٧٠٪ وألم مستقر وجهد مناسب وتعافٍ في اليوم التالي.')}</small></div></div>
          <button className="primary-button" onClick={onStart}>{t('Start my session', 'ابدأ جلستي')}<Play size={16} /></button>
          <a className="text-button" href="/handout" style={{ marginTop: 12 }}><Printer size={15} />{t('Print my programme', 'طباعة برنامجي')}</a>
          <span className="muted-note">{t('A small step in the right direction.', 'خطوة صغيرة في الاتجاه الصحيح.')}</span>
        </aside>
      </div>
    </>
  );
}
