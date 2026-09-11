'use client';
import { ArrowRight, Clock3, Footprints, Heart, RotateCcw, Sparkles } from 'lucide-react';
import type { Journey } from '@/lib/derive';
import type { T } from '@/lib/app-types';

export type ResultStepProps = {
  t: T;
  arabic: boolean;
  flag: Journey['flag'];
  riskAcknowledged: boolean;
  top: Journey['top'];
  matches: Journey['matches'];
  onset: string;
  pattern: string;
  aggravatorCount: number;
  onAcknowledgeRisk: () => void;
  onReviewAnswers: () => void;
  onReject: () => void;
  onAccept: () => void;
};

export default function ResultStep({
  t, arabic, flag, riskAcknowledged, top, matches, onset, pattern, aggravatorCount,
  onAcknowledgeRisk, onReviewAnswers, onReject, onAccept,
}: ResultStepProps) {
  return (
    <div className="center-flow">
      <div className="eyebrow"><Sparkles size={16} />{t('CONNECTING THE DOTS', 'ربط التفاصيل')}</div>
      {flag && !riskAcknowledged ? (
        <div className="result-card">
          <span className="risk-symbol"><Heart size={27} /></span>
          <h1>{t('Let’s get a little more support.', 'لنحصل على دعم إضافي.')}</h1>
          <p>{t('A few of your answers are worth getting checked in person before starting exercises.', 'بعض إجاباتك تستحق تقييماً شخصياً قبل بدء التمارين.')}</p>
          <div className="notice amber" role="alert">
            {arabic
              ? flag.level === 'urgent'
                ? 'اطلب تقييماً طبياً عاجلاً الآن. لا تبدأ التمارين.'
                : 'احجز تقييماً شخصياً قبل بدء التمارين.'
              : flag.message}
          </div>
          <button className="primary-button" onClick={onAcknowledgeRisk}>
            {t('Continue anyway', 'المتابعة على أي حال')}<ArrowRight size={16} />
          </button>
          <button className="text-button" onClick={onReviewAnswers}>{t('Review my answers', 'مراجعة إجاباتي')}</button>
        </div>
      ) : (
        <>
          <h1>{t('This looks most like…', 'يبدو هذا أقرب إلى…')}</h1>
          <p className="flow-subtitle">{t('A useful starting point, not a definitive diagnosis.', 'نقطة بداية مفيدة، وليست تشخيصاً نهائياً.')}</p>
          <div className="result-card">
            <span className="badge"><span className="live-dot" />{t(top.confidence, 'تطابق محتمل للنمط')}</span>
            <h2>{arabic ? top.nameAr : top.name}</h2>
            <p>
              {arabic
                ? 'يمكن للحركة المريحة والحمل التدريجي أن يساعدا في بناء القدرة. استجابتك هي التي توجّه التقدّم.'
                : top.explanation}
            </p>
            <div className="result-facts">
              <div>
                <Clock3 size={20} />
                <strong>{t('What to expect', 'ما يمكن توقعه')}</strong>
                <p>{arabic ? 'غالباً يتحسن تدريجياً مع روتين منتظم ويمكن للأعراض المزمنة أن تتحسن أيضاً.' : top.course}</p>
              </div>
              <div>
                <Footprints size={20} />
                <strong>{t('What actually helps', 'ما يساعد فعلاً')}</strong>
                <p>{arabic ? 'ابدأ بجرعة يمكنك التعافي منها، وراقب استجابة صباح اليوم التالي.' : top.helps}</p>
              </div>
            </div>
            <details>
              <summary>{t('Why this pattern?', 'لماذا هذا النمط؟')}</summary>
              <p>
                {t(
                  `We matched your ${onset} onset, ${pattern} pattern, ${aggravatorCount} movement triggers and nerve symptoms. Rule score: ${top.score}. Scores describe fit, not diagnostic certainty.`,
                  'قارنا بداية الألم ونمطه والحركات المؤثرة وأعراض الأعصاب. الدرجة تعبّر عن التطابق وليس اليقين التشخيصي.',
                )}
              </p>
            </details>
            <button className="text-button" onClick={onReject}>{t('That doesn’t sound like me', 'هذا لا يشبه ما أشعر به')}<RotateCcw size={14} /></button>
          </div>
          <div className="could-be">
            <span>{t('COULD ALSO BE', 'قد يكون أيضاً')}</span>
            <strong>{arabic ? matches[1]?.nameAr : matches[1]?.name}</strong>
            <p>{arabic ? 'هناك تداخل بين الأنماط. سنراقب استجابتك ونتكيّف معها.' : matches[1]?.explanation}</p>
          </div>
          <button className="primary-button wide" onClick={onAccept}>
            {t('Let’s build my plan', 'لنُنشئ خطتي')}<ArrowRight size={18} />
          </button>
        </>
      )}
    </div>
  );
}
