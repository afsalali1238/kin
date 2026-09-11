'use client';
import { Activity, ArrowDown, ArrowRight, Check, Flame, Heart, Sparkles, TrendingDown } from 'lucide-react';
import demo from '@/data/demo.json';
import type { Journey } from '@/lib/derive';
import type { T } from '@/lib/app-types';
import type { PainPin } from '@/components/body/BodyViewer';
import LazyBodyViewer from '@/components/body/LazyBodyViewer';
import Sparkline from '@/components/ui/Sparkline';

export type ProgressScreenProps = {
  t: T;
  real: boolean;
  painValues: number[];
  progress: Journey['progress'];
  doneSessions: number;
  phase: number;
  firstLogAt: string | undefined;
  regionId: string;
  pins: PainPin[];
  onAdvance: () => void;
  onRegress: () => void;
};

export default function ProgressScreen({
  t, real, painValues, progress, doneSessions, phase, firstLogAt, regionId, pins, onAdvance, onRegress,
}: ProgressScreenProps) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{t('THE BIGGER PICTURE', 'الصورة الأكبر')}</div>
          <h1>{t('Progress isn’t always a straight line.', 'التقدّم ليس دائماً خطاً مستقيماً.')}</h1>
          <p>{t('Look at how far you’ve come, not just how today feels.', 'انظر إلى المسافة التي قطعتها، لا إلى شعور اليوم فقط.')}</p>
        </div>
        <span className="badge"><Activity size={15} />{t('Weekly review', 'المراجعة الأسبوعية')}</span>
      </div>
      {!real && (
        <div className="sample-banner">
          <Sparkles size={17} />
          {t('Sample recovery journey · Your own check-ins will replace this example.', 'رحلة تعافٍ نموذجية · ستحل بياناتك محل هذا المثال.')}
        </div>
      )}
      <div className="progress-stat-grid">
        <div className="dashboard-card">
          <span>{t('LATEST PAIN', 'أحدث مستوى ألم')}</span>
          <strong>{painValues.at(-1)}<small> / 10</small></strong>
          <p><TrendingDown size={16} />{t(`Started at ${painValues[0]}/10`, `بدأ عند ${painValues[0]}/١٠`)}</p>
        </div>
        <div className="dashboard-card">
          <span>{t('SESSIONS COMPLETED', 'الجلسات المكتملة')}</span>
          <strong>{real ? doneSessions : demo.sessions}<small> / {real ? 10 : demo.planned}</small></strong>
          <p><Check size={16} />{t('Every session counts.', 'كل جلسة مهمة.')}</p>
        </div>
        <div className="dashboard-card">
          <span>{t('PHASE CONSISTENCY', 'الالتزام في المرحلة')}</span>
          <strong>{real ? progress.adherence : 80}<small>%</small></strong>
          <p><Flame size={16} />{t('70% unlocks the next check.', '٧٠٪ تسمح بفحص شروط التقدّم.')}</p>
        </div>
      </div>
      <div className="progress-main">
        <div className="dashboard-card">
          <div className="section-heading">
            <h3>{t('A little better, over time', 'أفضل قليلاً مع الوقت')}</h3>
            <span className="chart-key"><i />{t('Pain score', 'درجة الألم')}</span>
          </div>
          <Sparkline values={painValues} large />
          <div className="chart-dates"><span>{t('Your starting point', 'نقطة البداية')}</span><span>{t('Today', 'اليوم')}</span></div>
        </div>
        <div className="dashboard-card pain-map-card">
          <div className="section-heading">
            <h3>{t('Your pain map', 'خريطة ألمك')}</h3>
            <span className="badge">{painValues.at(-1)}/10</span>
          </div>
          <div dir="ltr">
            <LazyBodyViewer
              active={(painValues.at(-1) || 0) > 2 ? regionId || 'lower-back' : ''}
              back={true}
              pins={pins.map((p) => ({ ...p, intensity: painValues.at(-1) || 0 }))}
              mini
            />
          </div>
          <span>{t('Less pain. More possibility.', 'ألم أقل. إمكانيات أكثر.')}</span>
        </div>
      </div>
      <div className="review-card">
        <div className="review-icon"><Sparkles size={25} /></div>
        <div>
          <span className="eyebrow">{t('YOUR NEXT CHAPTER', 'فصلك التالي')}</span>
          <h2>
            {t(
              real
                ? progress.action === 'advance'
                  ? 'You’ve earned a little more.'
                  : progress.action === 'regress'
                    ? 'Let’s make a little more room for recovery.'
                    : 'Let’s keep building a steady foundation.'
                : 'Consistency is making a difference.',
              'لنواصل بناء أساس ثابت.',
            )}
          </h2>
          <p>
            {t(
              real
                ? progress.action === 'advance'
                  ? `You’ve completed ${progress.adherence}% of sessions, pain is steady or falling, and the last session felt manageable with next-day recovery. You’re ready for the next phase.`
                  : progress.action === 'regress'
                    ? 'Your recent pain trend is rising. We’ll reduce the dose. An in-person assessment can help us understand what’s changed.'
                    : `You’ve completed ${doneSessions} sessions. We’ll hold this phase until at least 7 of 10 are complete, pain is steady, exercises feel right, and your next-morning response is good.`
                : 'In this sample journey, pain dropped from 6 to 2 with 8 of 10 sessions complete. Your own reviews will explain exactly when and why your programme changes.',
              'يرتبط التقدّم بالالتزام واستقرار الألم وسهولة التمارين والتعافي في اليوم التالي.',
            )}
          </p>
          {real && progress.action === 'advance' && phase < 3 && (
            <button className="primary-button" onClick={onAdvance}>
              {t('Move to the next phase', 'انتقل للمرحلة التالية')}<ArrowRight size={17} />
            </button>
          )}
          {real && progress.action === 'regress' && (
            <button className="text-button" onClick={onRegress}>
              {t('Reduce my dose', 'تقليل جرعتي')}<ArrowDown size={16} />
            </button>
          )}
        </div>
      </div>
      {real && ((firstLogAt && new Date().getTime() - new Date(firstLogAt).getTime() > 28 * 86400000 && progress.trend >= 0) || progress.trend > 1) && (
        <div className="notice amber">
          <Heart size={20} />
          {t('You haven’t been improving as expected. An in-person physiotherapy assessment is a good next step.', 'التحسّن ليس كما هو متوقع. التقييم الشخصي للعلاج الطبيعي خطوة مناسبة.')}
        </div>
      )}
      <div className="phase-history">
        <h3>{t('Your phase journey', 'رحلة مراحلك')}</h3>
        {['Calm', 'Load', 'Capacity'].map((p, i) => (
          <div key={p}>
            <span className={phase >= i + 1 ? 'history-dot filled' : 'history-dot'} />
            <strong>{t(p, ['تهدئة', 'تحميل', 'قدرة'][i])}</strong>
            <span>
              {phase === i + 1
                ? t('Building here', 'هنا الآن')
                : phase > i + 1
                  ? t('Completed', 'مكتملة')
                  : t('When you’re ready', 'حين تكون مستعداً')}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
