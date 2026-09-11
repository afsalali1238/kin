'use client';
import { ArrowRight, Check, Dumbbell, Footprints, Heart, House, Sparkles, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { T } from '@/lib/app-types';
import type { Journey } from '@/lib/derive';

const goalOptions: [LucideIcon, string, string][] = [
  [Footprints, 'Walk and move comfortably', 'المشي والحركة براحة'],
  [Dumbbell, 'Get back to training', 'العودة إلى التدريب'],
  [Heart, 'Keep up with my family', 'مواكبة عائلتي'],
  [House, 'Feel better at work', 'الشعور براحة في العمل'],
];

export type GoalStepProps = {
  t: T;
  goal: string;
  dose: Journey['dose'];
  onGoalChange: (goal: string) => void;
  onConfirm: () => void;
};

export default function GoalStep({ t, goal, dose, onGoalChange, onConfirm }: GoalStepProps) {
  return (
    <div className="center-flow">
      <span className="round-feature"><Target size={30} strokeWidth={1.5} /></span>
      <div className="eyebrow">{t('YOUR REASON TO MOVE', 'سببك للحركة')}</div>
      <h1>{t('What do you want to get back to?', 'إلى ماذا تريد العودة؟')}</h1>
      <p className="flow-subtitle">{t('Recovery means more when it’s about something you love.', 'للتعافي معنى أكبر عندما يرتبط بشيء تحبه.')}</p>
      <div className="goal-grid">
        {goalOptions.map(([Icon, en, ar]) => (
          <button key={en} className={goal === en ? 'goal-card selected' : 'goal-card'} aria-pressed={goal === en} onClick={() => onGoalChange(en)}>
            <Icon size={27} />
            <span>{t(en, ar)}</span>
            {goal === en && <Check size={17} />}
          </button>
        ))}
      </div>
      <label className="custom-goal">
        {t('Or, in your own words', 'أو بكلماتك')}
        <input value={goal} maxLength={160} onChange={(e) => onGoalChange(e.target.value)} placeholder={t('I want to…', 'أريد أن…')} />
      </label>
      <div className="notice">
        <Sparkles size={20} />
        <span>
          {t(
            `${dose.character}. About ${dose.minutes} minutes, ${dose.frequency.toLowerCase()}. That’s where we’ll start.`,
            `سنبدأ بحركة تناسب استجابتك، حوالي ${dose.minutes} دقيقة لكل جلسة.`,
          )}
        </span>
      </div>
      <button className="primary-button wide" disabled={!goal.trim()} onClick={onConfirm}>
        {t('See my personal programme', 'عرض برنامجي الشخصي')}<ArrowRight size={18} />
      </button>
    </div>
  );
}
