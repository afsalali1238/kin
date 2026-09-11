'use client';
import { useRef } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Clock3, Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import type { Exercise } from '@/lib/clinical';
import type { T } from '@/lib/app-types';
import LazyBodyViewer from '@/components/body/LazyBodyViewer';
import ExerciseAnimation from '@/components/exercise/ExerciseAnimation';
import IconButton from '@/components/ui/IconButton';

export type SessionPlayerProps = {
  t: T;
  arabic: boolean;
  coarse: boolean;
  list: Exercise[];
  index: number;
  playing: boolean;
  seconds: number;
  sound: boolean;
  group: string;
  onLeave: () => void;
  onToggleSound: () => void;
  onTogglePlay: () => void;
  onResetTimer: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAdapt: (direction: 'easier' | 'harder') => void;
};

export default function SessionPlayer({
  t, arabic, coarse, list, index, playing, seconds, sound, group,
  onLeave, onToggleSound, onTogglePlay, onResetTimer, onNext, onPrev, onAdapt,
}: SessionPlayerProps) {
  const activeExercise = list[index];
  const touchStart = useRef(0);
  if (!activeExercise) return null;
  return (
    <div className="session-page">
      <div className="section-heading">
        <button className="back-link" onClick={onLeave}><X size={17} />{t('Finish later', 'أكمل لاحقاً')}</button>
        <span>{t('EXERCISE', 'تمرين')} 0{index + 1} / 0{list.length}</span>
        <IconButton icon={sound ? Volume2 : VolumeX} label="Toggle audio cues" onClick={onToggleSound} />
      </div>
      <div className="session-progress">{list.map((e, i) => <i key={e.id + i} className={i <= index ? 'complete' : ''} />)}</div>
      <div
        className="session-player"
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const d = touchStart.current - e.changedTouches[0].clientX;
          if (d > 70) onNext();
          else if (d < -70) onPrev();
        }}
      >
        <div className="session-visual">
          <ExerciseAnimation exercise={activeExercise} playing={playing} arabic={arabic} />
          <div className="target-mini">
            <div dir="ltr">
              <LazyBodyViewer active={activeExercise.targetRegions[0]} back={group === 'lower-back' || group === 'upper-back'} mini />
            </div>
            <span>{t('YOUR TARGET AREA', 'المنطقة المستهدفة')}</span>
          </div>
          <span className="illustration-note">{t('Movement illustration · Follow the cues for your exercise', 'رسم توضيحي للحركة · اتبع إرشادات تمرينك')}</span>
        </div>
        <div className="session-instructions">
          <span className="eyebrow">{t(activeExercise.type.replace('_', ' '), 'حركة موجّهة')}</span>
          <h1>{arabic ? activeExercise.nameAr : activeExercise.name}</h1>
          <div className="dose-box">
            <div><strong>{activeExercise.sets}</strong><span>{t('SETS', 'مجموعات')}</span></div>
            <span>×</span>
            <div>
              <strong>{activeExercise.holdSeconds || activeExercise.reps}<small>{activeExercise.holdSeconds ? 's' : ''}</small></strong>
              <span>{activeExercise.holdSeconds ? t('HOLD', 'ثبات') : t('REPS', 'تكرارات')}</span>
            </div>
            <div><Clock3 size={20} /><span>{arabic ? 'ببطء وتحكّم' : activeExercise.tempo}</span></div>
          </div>
          <ol className="cue-list">
            {activeExercise.cues.slice(0, 3).map((c, i) => (
              <li key={c}>
                <span>{i + 1}</span>
                {arabic ? ['ابدأ من وضع مريح.', 'تحرّك ببطء ضمن نطاق مناسب.', 'واصل التنفس ولا تحبس أنفاسك.'][i] : c}
              </li>
            ))}
          </ol>
          <div className="timer">
            <span>
              {Math.floor(seconds / 60).toString().padStart(2, '0')}:{(seconds % 60).toString().padStart(2, '0')}
            </span>
            <button aria-label={playing ? 'Pause timer' : 'Start timer'} onClick={onTogglePlay}>
              {playing ? <Pause size={23} /> : <Play size={23} />}
            </button>
            <IconButton icon={RotateCcw} label="Reset timer" onClick={onResetTimer} />
          </div>
          <div className="adapt-buttons">
            <button onClick={() => onAdapt('easier')}><ArrowDown size={16} />{t('Too painful', 'مؤلم جداً')}</button>
            <button onClick={() => onAdapt('harder')}>{t('Too easy', 'سهل جداً')}<ArrowUpRight size={16} /></button>
          </div>
          <button className="primary-button" onClick={onNext}>
            {index === list.length - 1 ? t('Finish & check in', 'إنهاء ومتابعة') : t('Next exercise', 'التمرين التالي')}
            <ArrowRight size={17} />
          </button>
          <span className="muted-note">
            {t('Keep it ≤ 4/10. It should settle within 24 hours.', 'أبقِ الألم ≤ ٤/١٠ ويجب أن يهدأ خلال ٢٤ ساعة.')}
            {coarse && <> · {t('Swipe for next / previous', 'اسحب للتنقل بين التمارين')}</>}
          </span>
        </div>
      </div>
    </div>
  );
}
