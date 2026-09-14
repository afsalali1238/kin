'use client';
import { ArrowRight, ArrowUpRight, BookOpen, Check, Clock3, Dumbbell, Flame, Heart, Play, ScanLine, TrendingDown } from 'lucide-react';
import type { Region } from '@/lib/clinical';
import type { Journey } from '@/lib/derive';
import type { T } from '@/lib/app-types';
import LazyBodyViewer from '@/components/body/LazyBodyViewer';
import Sparkline from '@/components/ui/Sparkline';
import ChoiceChip from '@/components/ui/ChoiceChip';

export type HomeScreenProps = {
  t: T;
  arabic: boolean;
  assessed: boolean;
  phase: number;
  streak: number;
  dose: Journey['dose'];
  region: Region | undefined;
  dailyDone: boolean;
  dailyPain: number;
  dailyFeeling: string;
  real: boolean;
  painValues: number[];
  onDailyPain: (pain: number) => void;
  onDailyFeeling: (feeling: string) => void;
  onSaveDaily: () => void;
  onStart: () => void;
  onFindStart: () => void;
  onSeeProgress: () => void;
  onLearn: () => void;
};

export default function HomeScreen({
  t, arabic, assessed, phase, streak, dose, region, dailyDone, dailyPain, dailyFeeling, real, painValues,
  onDailyPain, onDailyFeeling, onSaveDaily, onStart, onFindStart, onSeeProgress, onLearn,
}: HomeScreenProps) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span />{t('YOUR DAILY DOSE OF BETTER', 'جرعتك اليومية للتحسّن')}</div>
          <h1>{t('A little movement. A good day.', 'قليل من الحركة. يوم أفضل.')}</h1>
          <p>{t('No catching up. No falling behind. Just your next small step.', 'لا تأخّر ولا سباق. فقط خطوتك الصغيرة التالية.')}</p>
        </div>
        <span className="badge"><Flame size={15} />{streak} {t('day streak', 'أيام متتالية')}</span>
      </div>
      {!assessed ? (
        <div className="home-session">
          <div>
            <span className="eyebrow">{t('YOUR RECOVERY STARTS HERE', 'تعافيك يبدأ هنا')}</span>
            <h2>{t('A plan that starts with you.', 'خطة تبدأ بك.')}</h2>
            <p>{t('Show us where it hurts. Answer a few questions. Find a manageable way forward.', 'حدّد الألم وأجب عن أسئلة قليلة، ثم ابدأ طريقك المناسب.')}</p>
            <button className="primary-button" onClick={onFindStart}>{t('Find my starting point', 'ابحث عن نقطة بدايتي')}<ArrowRight size={18} /></button>
          </div>
          <div className="home-art"><ScanLine size={120} strokeWidth={.6} /></div>
        </div>
      ) : (
        <div className="home-session">
          <div>
            <span className="badge">{t(`PHASE ${phase} · ${['CALM', 'LOAD', 'CAPACITY'][phase - 1]}`, 'مرحلتك الحالية')}</span>
            <h2>{t('Your next step is a small one.', 'خطوتك التالية صغيرة.')}</h2>
            <p>{t(`${dose.minutes} minutes of ${dose.character.toLowerCase()}, chosen for your ${region?.label.toLowerCase()}.`, `جلسة من ${dose.minutes} دقيقة صُممت خصيصاً لك.`)}</p>
            <div className="session-meta">
              <span><Clock3 size={16} />{dose.minutes} {t('min', 'دقيقة')}</span>
              <span><Dumbbell size={16} />{t('4 exercises', '٤ تمارين')}</span>
              <span><Heart size={16} />{t('At your pace', 'بإيقاعك')}</span>
            </div>
            <button className="primary-button" onClick={onStart}><Play size={17} />{t('Start today’s session', 'ابدأ جلسة اليوم')}<ArrowRight size={18} /></button>
          </div>
          <div className="home-body" dir="ltr">
            <LazyBodyViewer active={region?.id || ''} back={region?.view === 'back'} mini />
          </div>
        </div>
      )}
      <div className="home-grid">
        <div className="dashboard-card">
          <div className="section-heading">
            <h3>{t('How’s the pain today?', 'كيف الألم اليوم؟')}</h3>
            <span className="eyebrow">{t('A QUICK CHECK-IN', 'متابعة سريعة')}</span>
          </div>
          {dailyDone ? (
            <div className="checkin-done">
              <Check size={25} />
              <h3>{t('You’ve checked in today.', 'سجّلت متابعتك اليوم.')}</h3>
              <p>{t('Thank you for listening to your body.', 'شكراً لإنصاتك لجسمك.')}</p>
            </div>
          ) : (
            <>
              <div className="daily-pain-number">{dailyPain}<span>/ 10</span></div>
              <input aria-label="Pain today" aria-valuetext={`${dailyPain} out of 10`} type="range" min="0" max="10" value={dailyPain} onChange={(e) => onDailyPain(+e.target.value)} />
              <div className="slider-labels"><span>{t('No pain', 'لا ألم')}</span><span>{t('Worst imaginable', 'أشد ألم ممكن')}</span></div>
              <p className="checkin-question">{t('Compared with before your last session?', 'مقارنة بما قبل جلستك السابقة؟')}</p>
              <div className="chips">
                {[
                  ['better', t('Better', 'أفضل')],
                  ['same', t('About the same', 'نفسه تقريباً')],
                  ['worse', t('Worse', 'أسوأ')],
                ].map(([v, l]) => (
                  <ChoiceChip key={v} label={l} selected={dailyFeeling === v} onClick={() => onDailyFeeling(v)} />
                ))}
              </div>
              <button className="text-button" onClick={onSaveDaily}>{t('Save my check-in', 'حفظ متابعتي')}<ArrowRight size={16} /></button>
            </>
          )}
        </div>
        <div className="dashboard-card">
          <div className="section-heading">
            <h3>{t('Your bigger picture', 'صورتك الأكبر')}</h3>
            <TrendingDown size={19} />
          </div>
          {!real && <span className="sample-label">{t('SAMPLE JOURNEY', 'رحلة نموذجية')}</span>}
          <div className="trend-summary">
            <strong>{painValues.at(-1)}<span>/ 10</span></strong>
            <span>{t('Latest pain score', 'أحدث مستوى ألم')}</span>
          </div>
          <Sparkline values={painValues} />
          <button className="text-button" onClick={onSeeProgress}>{t('See my progress', 'عرض تقدّمي')}<ArrowRight size={16} /></button>
        </div>
      </div>
      <div className="education-banner">
        <BookOpen size={27} />
        <div>
          <strong>{t('Your body is stronger than you think.', 'جسمك أقوى مما تظن.')}</strong>
          <p>{t('A little understanding can change the way you move.', 'القليل من الفهم قد يغيّر طريقة حركتك.')}</p>
        </div>
        <button onClick={onLearn}>{t('Take a minute to learn', 'دقيقة للتعلّم')}<ArrowUpRight size={16} /></button>
      </div>
    </>
  );
}
