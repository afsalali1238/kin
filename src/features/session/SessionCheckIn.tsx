'use client';
import { Check } from 'lucide-react';
import type { T } from '@/lib/app-types';
import ChoiceChip from '@/components/ui/ChoiceChip';

export type SessionCheckInProps = {
  t: T;
  sessionPain: number;
  feeling: string;
  onSessionPain: (pain: number) => void;
  onFeeling: (feeling: string) => void;
  onSave: () => void;
};

export default function SessionCheckIn({ t, sessionPain, feeling, onSessionPain, onFeeling, onSave }: SessionCheckInProps) {
  return (
    <div className="center-flow checkin-flow">
      <span className="round-feature"><Check size={30} /></span>
      <span className="eyebrow">{t('YOU SHOWED UP FOR YOURSELF', 'لقد اعتنيت بنفسك')}</span>
      <h1>{t('That’s a step forward.', 'هذه خطوة إلى الأمام.')}</h1>
      <p>{t('One quick check-in helps us make your next session better.', 'متابعة سريعة تساعدنا على تحسين جلستك التالية.')}</p>
      <div className="result-card">
        <div className="pain-slider">
          <label>{t('Highest pain during your session?', 'أعلى ألم أثناء الجلسة؟')}<b>{sessionPain}<small>/10</small></b></label>
          <input aria-label="Pain during session" type="range" min="0" max="10" value={sessionPain} onChange={(e) => onSessionPain(+e.target.value)} />
          <div className="slider-labels"><span>{t('No pain', 'لا ألم')}</span><span>{t('Worst imaginable', 'أشد ألم ممكن')}</span></div>
        </div>
        <h3>{t('How did the exercises feel?', 'كيف كانت التمارين؟')}</h3>
        <div className="chips">
          {[
            ['easy', t('Easy', 'سهلة')],
            ['right', t('Just right', 'مناسبة')],
            ['hard', t('Too challenging', 'صعبة جداً')],
          ].map(([v, l]) => (
            <ChoiceChip key={v} label={l} selected={feeling === v} onClick={() => onFeeling(v)} />
          ))}
        </div>
        <div className={`notice ${sessionPain > 4 ? 'amber' : ''}`}>
          {t(
            sessionPain > 4
              ? 'That was above your comfortable zone. We’ll keep your next session gentle. Check how you feel tomorrow morning.'
              : 'Good work. The last part of the traffic light is tomorrow: symptoms should settle within 24 hours and not be worse in the morning.',
            'راقب استجابتك غداً: يجب أن يهدأ الألم خلال ٢٤ ساعة وألا يكون أسوأ صباحاً.',
          )}
        </div>
        <button className="primary-button wide" onClick={onSave}>
          {t('Save & finish', 'حفظ وإنهاء')}<Check size={17} />
        </button>
      </div>
    </div>
  );
}
