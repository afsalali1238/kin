'use client';
import { ArrowLeft, ArrowRight, Crosshair, ShieldCheck } from 'lucide-react';
import type { Intake, Region } from '@/lib/clinical';
import type { AnswerIntake, T } from '@/lib/app-types';
import type { PainPin } from '@/components/body/BodyViewer';
import { aggravators, arabicChips } from '@/lib/intake-data';
import LazyBodyViewer from '@/components/body/LazyBodyViewer';
import ChoiceChip from '@/components/ui/ChoiceChip';

export type IntakeStepProps = {
  t: T;
  arabic: boolean;
  step: number;
  intake: Intake;
  region: Region | undefined;
  group: string;
  pins: PainPin[];
  answer: AnswerIntake;
  onBack: () => void;
  onContinue: () => void;
};

export default function IntakeStep({ t, arabic, step, intake, region, group, pins, answer, onBack, onContinue }: IntakeStepProps) {
  const questionTitles = [
    t('How does it feel right now?', 'كيف تشعر الآن؟'),
    t('How did your pain begin?', 'كيف بدأ الألم؟'),
    t('How long has this been going on?', 'منذ متى تشعر بهذا الألم؟'),
    t('When do you notice it most?', 'متى تلاحظ الألم أكثر؟'),
    t('Which movements change your pain?', 'ما الحركات التي تغيّر ألمك؟'),
    t('How easily is your pain stirred up?', 'ما مدى سهولة إثارة الألم؟'),
    t('Any tingling, numbness or weakness?', 'هل هناك وخز أو خدر أو ضعف؟'),
  ];
  const toggleDetail = (key: string) =>
    answer({ details: intake.details.includes(key) ? intake.details.filter((d) => d !== key) : [...intake.details, key] });

  return (
    <div className="assessment-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} />{t('Back', 'رجوع')}</button>
      <div className="assessment-layout">
        <div className="intake-card">
          <div className="eyebrow">{t('HELP US UNDERSTAND', 'ساعدنا على الفهم')}<span className="question-count">0{step + 1} / 07</span></div>
          <div className="question-progress"><i style={{ width: `${((step + 1) / 7) * 100}%` }} /></div>
          <h1>{questionTitles[step]}</h1>
          <p>
            {step === 5
              ? t('This helps us find the right dose — not just the right exercises.', 'يساعدنا هذا في تحديد الجرعة المناسبة، وليس التمارين فقط.')
              : t(`A few details about your ${region?.label.toLowerCase() || 'pain'} will help make your plan feel like yours.`, 'تفاصيل قليلة عن ألمك تساعدنا في تخصيص خطتك.')}
          </p>
          <div className="question-body">
            {step === 0 &&
              (['pain', 'worst', 'best'] as const).map((key, i) => (
                <div className="pain-slider" key={key}>
                  <label>
                    {[t('Right now', 'الآن'), t('At its worst', 'في أسوأ حالاته'), t('At its best', 'في أفضل حالاته')][i]}
                    <b>{intake[key]}<small>/10</small></b>
                  </label>
                  <input
                    aria-label={key}
                    aria-valuetext={`${intake[key]} out of 10`}
                    type="range"
                    min="0"
                    max="10"
                    value={intake[key]}
                    onChange={(e) => {
                      const n = +e.target.value;
                      if (key === 'pain') answer({ pain: n, best: Math.min(intake.best, n), worst: Math.max(intake.worst, n) });
                      else answer({ [key]: key === 'best' ? Math.min(n, intake.pain) : Math.max(n, intake.pain) });
                    }}
                  />
                  <div className="slider-labels"><span>{t('No pain', 'لا ألم')}</span><span>{t('Worst imaginable', 'أشد ألم ممكن')}</span></div>
                </div>
              ))}
            {step === 1 && (
              <>
                <div className="option-stack">
                  {[
                    ['incident', t('Suddenly, after an incident', 'فجأة بعد حادث'), t('A twist, fall, lift or specific moment.', 'التواء أو سقوط أو رفع أو لحظة محددة.')],
                    ['gradual', t('It crept up over time', 'تدريجياً مع الوقت'), t('No single moment — it gradually appeared.', 'لا توجد لحظة محددة، ظهر تدريجياً.')],
                  ].map(([v, label, sub]) => (
                    <button key={v} className={intake.onset === v ? 'option selected' : 'option'} aria-pressed={intake.onset === v} onClick={() => answer({ onset: v, details: intake.details.filter((d) => d !== 'major-trauma') })}>
                      <span className="radio-dot" /><span><strong>{label}</strong><small>{sub}</small></span>
                    </button>
                  ))}
                </div>
                {intake.onset === 'incident' && (
                  <div className="detail-chips">
                    <span>{t('Was it a significant fall or collision?', 'هل كان سقوطاً أو اصطداماً كبيراً؟')}</span>
                    <ChoiceChip label={t('Yes, a major impact', 'نعم، إصابة شديدة')} selected={intake.details.includes('major-trauma')} onClick={() => toggleDetail('major-trauma')} />
                  </div>
                )}
              </>
            )}
            {step === 2 && (
              <div className="option-stack">
                {[
                  ['acute', t('Less than 6 weeks', 'أقل من ٦ أسابيع'), t('A fairly recent change', 'تغيّر حديث نسبياً')],
                  ['subacute', t('6–12 weeks', '٦–١٢ أسبوعاً'), t('It’s been a little while', 'مستمر منذ فترة')],
                  ['persistent', t('More than 12 weeks', 'أكثر من ١٢ أسبوعاً'), t('I’ve been living with this', 'أتعايش معه منذ مدة')],
                ].map(([v, label, sub]) => (
                  <button key={v} className={`option ${intake.duration === v ? 'selected' : ''}`} aria-pressed={intake.duration === v} onClick={() => answer({ duration: v })}>
                    <span className="radio-dot" /><span><strong>{label}</strong><small>{sub}</small></span>
                  </button>
                ))}
              </div>
            )}
            {step === 3 && (
              <>
                <div className="option-stack">
                  {[
                    ['morning', t('In the morning, then it eases', 'في الصباح ثم يخف'), t('Moving around helps loosen things up.', 'تساعد الحركة على تخفيف التيبس.')],
                    ['load', t('With activity or later in the day', 'مع النشاط أو نهاية اليوم'), t('It builds up as I do more.', 'يزداد مع زيادة النشاط.')],
                    ['night', t('At night — it wakes me up', 'ليلاً ويوقظني'), t('Not just when I roll onto it.', 'ليس فقط عند النوم على المنطقة.')],
                  ].map(([v, label, sub]) => (
                    <button key={v} className={`option ${intake.pattern === v ? 'selected' : ''}`} aria-pressed={intake.pattern === v} onClick={() => answer({ pattern: v })}>
                      <span className="radio-dot" /><span><strong>{label}</strong><small>{sub}</small></span>
                    </button>
                  ))}
                </div>
                {intake.pattern === 'night' && (
                  <div className="detail-chips">
                    <span>{t('Anything else alongside this? Select only if present.', 'هل يصاحب ذلك شيء آخر؟ اختر إن وجد.')}</span>
                    {[
                      ['fever', t('Fever or feeling unwell', 'حمى أو شعور بالمرض')],
                      ['weight-loss', t('Unexplained weight loss', 'نقص وزن غير مبرر')],
                    ].map(([v, l]) => (
                      <ChoiceChip key={v} label={l} selected={intake.details.includes(v)} onClick={() => toggleDetail(v)} />
                    ))}
                  </div>
                )}
              </>
            )}
            {step === 4 && (
              <>
                <div className="section-label">{t('MAKES IT WORSE · CHOOSE ANY', 'يزيد الألم · اختر ما ينطبق')}</div>
                <div className="chips">
                  {aggravators[group].map(([v, l]) => (
                    <ChoiceChip
                      key={v}
                      label={arabic ? arabicChips[v] : l}
                      selected={intake.aggravators.includes(v)}
                      onClick={() =>
                        answer({
                          aggravators: intake.aggravators.includes(v) ? intake.aggravators.filter((x) => x !== v) : [...intake.aggravators, v],
                          easers: intake.easers.filter((x) => x !== v),
                        })
                      }
                    />
                  ))}
                </div>
                <div className="section-label space-top">{t('HELPS IT EASE', 'يساعد على تخفيفه')}</div>
                <div className="chips">
                  {[...aggravators[group].filter(([v]) => !intake.aggravators.includes(v)), ['rest', 'Resting']].map(([v, l]) => (
                    <ChoiceChip
                      key={v}
                      label={arabic ? arabicChips[v] || 'الراحة' : l}
                      selected={intake.easers.includes(v)}
                      onClick={() =>
                        answer({ easers: intake.easers.includes(v) ? intake.easers.filter((x) => x !== v) : [...intake.easers, v] })
                      }
                    />
                  ))}
                </div>
              </>
            )}
            {step === 5 && (
              <div className="option-stack">
                {[
                  ['high', t('Very little sets it off', 'نشاط بسيط يثير الألم'), t('It lingers for hours afterwards.', 'يستمر الألم لساعات بعد ذلك.')],
                  ['moderate', t('A moderate amount of activity', 'كمية معتدلة من النشاط'), t('It settles within about an hour.', 'يهدأ خلال ساعة تقريباً.')],
                  ['low', t('It takes quite a lot', 'يحتاج إلى نشاط كثير'), t('It settles again within minutes.', 'يهدأ مجدداً خلال دقائق.')],
                ].map(([v, label, sub]) => (
                  <button key={v} className={`option ${intake.irritability === v ? 'selected' : ''}`} aria-pressed={intake.irritability === v} onClick={() => answer({ irritability: v as Intake['irritability'] })}>
                    <span className="radio-dot" /><span><strong>{label}</strong><small>{sub}</small></span>
                  </button>
                ))}
              </div>
            )}
            {step === 6 && (
              <>
                <div className="chips">
                  {[
                    ['none', t('No, none of these', 'لا شيء من ذلك')],
                    ['tingling', t('Yes, tingling or numbness', 'نعم، وخز أو خدر')],
                    ['weakness', t('Yes, weakness', 'نعم، ضعف')],
                  ].map(([v, l]) => (
                    <ChoiceChip
                      key={v}
                      label={l}
                      selected={intake.neuro === v}
                      onClick={() => answer({ neuro: v, details: intake.details.filter((d) => !['weakness', 'arm', 'leg', 'both-legs', 'saddle', 'bladder'].includes(d)) })}
                    />
                  ))}
                </div>
                {intake.neuro !== 'none' && (
                  <div className="detail-chips">
                    <span>{t('Where does it travel, or what have you noticed?', 'إلى أين يمتد أو ماذا لاحظت؟')}</span>
                    {(group === 'lower-back' || group === 'hip'
                      ? [
                          ['leg', t('Into one leg', 'إلى ساق واحدة')],
                          ['both-legs', t('Into both legs', 'إلى الساقين')],
                          ['saddle', t('Numb around my seat / groin', 'خدر حول المقعد أو الأربية')],
                          ['bladder', t('New bladder or bowel changes', 'تغيّرات جديدة في المثانة أو الأمعاء')],
                        ]
                      : [['arm', t('Into my arm or hand', 'إلى الذراع أو اليد')]]
                    )
                      .concat([['weakness', t('Weakness is getting worse', 'الضعف يزداد')]])
                      .map(([v, l]) => (
                        <ChoiceChip key={v} label={l} selected={intake.details.includes(v)} onClick={() => toggleDetail(v)} />
                      ))}
                  </div>
                )}
                {['neck', 'shoulder', 'upper-back'].includes(group) && (
                  <div className="detail-chips">
                    <span>{t('Any associated symptoms?', 'هل توجد أعراض مصاحبة؟')}</span>
                    <ChoiceChip label={t('Chest pain / breathlessness', 'ألم صدر أو ضيق تنفس')} selected={intake.details.includes('chest')} onClick={() => toggleDetail('chest')} />
                    {group === 'neck' && (
                      <ChoiceChip label={t('First sudden, severe headache', 'أول صداع مفاجئ وشديد')} selected={intake.details.includes('severe-headache')} onClick={() => toggleDetail('severe-headache')} />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="intake-footer">
            <span><ShieldCheck size={15} />{t('Your answers shape your plan.', 'إجاباتك تشكّل خطتك.')}</span>
            <button className="primary-button" onClick={onContinue}>
              {step === 6 ? t('Understand my pain', 'افهم ألمي') : t('Continue', 'متابعة')}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <aside className="intake-aside">
          <div className="mini-body" dir="ltr">
            <LazyBodyViewer active={region?.id || ''} back={region?.view === 'back'} pins={pins} mini />
          </div>
          <span className="badge"><Crosshair size={13} />{arabic ? region?.labelAr : region?.label}</span>
          <h3>{t('A person, not a body part.', 'أنت إنسان، لا مجرد منطقة ألم.')}</h3>
          <p>{t('Your symptoms, your day, your goals. They all help us choose what’s right for you.', 'أعراضك ويومك وأهدافك، كلها تساعدنا على اختيار ما يناسبك.')}</p>
        </aside>
      </div>
    </div>
  );
}
