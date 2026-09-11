'use client';
import { Activity, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Footprints, Heart, ScanLine, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Journey } from '@/lib/derive';
import type { T } from '@/lib/app-types';

export type LearnScreenProps = {
  t: T;
  arabic: boolean;
  learnArticle: number | null;
  presentation: Journey['currentPresentation'];
  onOpenArticle: (index: number | null) => void;
  onPractice: () => void;
};

export default function LearnScreen({ t, arabic, learnArticle, presentation, onOpenArticle, onPractice }: LearnScreenProps) {
  const articles: { title: string; tag: string; text: string; icon: LucideIcon }[] = [
    {
      title: t('Hurt doesn’t always mean harm.', 'الألم لا يعني دائماً الضرر.'),
      tag: t('UNDERSTANDING PAIN', 'فهم الألم'),
      text: t(
        'Pain is real, but it is not a precise damage meter. The nervous system can become more protective after an injury or a long period of discomfort. Comfortable, repeatable movement helps it learn that you can move safely. New or worsening neurological symptoms are different: stop and get assessed.',
        'الألم حقيقي لكنه ليس مقياساً دقيقاً للضرر. قد يصبح الجهاز العصبي أكثر حماية بعد الإصابة. تساعد الحركة المريحة المتكررة على استعادة الثقة. أوقف التمرين واطلب تقييماً عند ظهور أعراض عصبية جديدة أو متفاقمة.',
      ),
      icon: Heart,
    },
    {
      title: t('Your back is not fragile.', 'ظهرك ليس هشّاً.'),
      tag: t('MOVEMENT CONFIDENCE', 'الثقة بالحركة'),
      text: t(
        'Your spine is built to bend, turn, and carry load. There is no single perfect posture, and changing position often matters more than sitting perfectly. Start with a movement that feels manageable, repeat it, and expand your range as confidence grows.',
        'عمودك الفقري مصمّم للانحناء والدوران وتحمل الأحمال. لا توجد وضعية مثالية واحدة. تغيير الوضعية أهم من الجلوس المثالي. ابدأ بحركة مناسبة وزد النطاق تدريجياً.',
      ),
      icon: Footprints,
    },
    {
      title: t('A scan is not the whole story.', 'الصورة ليست القصة كاملة.'),
      tag: t('PUTTING THINGS IN PERSPECTIVE', 'وضع الأمور في سياقها'),
      text: t(
        'Changes such as disc bulges and joint wear are common in people who have no pain at all. Imaging is useful for specific clinical questions, but it does not determine your future. How you move, sleep, recover and gradually load your body matters too.',
        'تغيّرات مثل بروز الأقراص شائعة لدى أشخاص دون ألم. التصوير مفيد لأسئلة محددة لكنه لا يحدّد مستقبلك. الحركة والنوم والتعافي والحمل التدريجي مهمة أيضاً.',
      ),
      icon: ScanLine,
    },
    {
      title: t('Your own traffic light for movement.', 'إشارتك الخاصة للحركة.'),
      tag: t('EVERYDAY SELF-MANAGEMENT', 'إدارة يومية ذاتية'),
      text: t(
        'Green: discomfort up to 4/10, settling within 24 hours, and no worse the next morning. Amber: the next-day response is not known yet — keep the dose steady and check in tomorrow. Red: pain above 4/10, symptoms that linger beyond a day, or a worse morning — ease off or swap down. New weakness or spreading numbness needs assessment.',
        'أخضر: ألم حتى ٤/١٠ يهدأ خلال ٢٤ ساعة وليس أسوأ صباحاً. كهرماني: استجابة الغد غير معروفة، حافظ على الجرعة. أحمر: ألم فوق ٤/١٠ أو مستمر أو أسوأ صباحاً، خفف الحمل. الضعف الجديد والخدر الممتد يحتاجان تقييماً.',
      ),
      icon: Activity,
    },
  ];

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{t('UNDERSTAND MORE. WORRY LESS.', 'افهم أكثر. اطمئن أكثر.')}</div>
          <h1>{t('Knowledge is part of your recovery.', 'المعرفة جزء من تعافيك.')}</h1>
          <p>{t('Small reads. A new way to think about your body.', 'قراءات قصيرة. طريقة جديدة لفهم جسمك.')}</p>
        </div>
        <BookOpen className="heading-icon" size={36} strokeWidth={1} />
      </div>
      {learnArticle !== null ? (
        <div className="article-detail">
          <button className="back-link" onClick={() => onOpenArticle(null)}><ArrowLeft size={17} />{t('All articles', 'جميع المقالات')}</button>
          <span className="eyebrow">{articles[learnArticle].tag}</span>
          <h1>{articles[learnArticle].title}</h1>
          <p>{articles[learnArticle].text}</p>
          <div className="notice">
            <Sparkles size={21} />
            {t('Try one small, comfortable movement today. Confidence is something you practise.', 'جرّب حركة صغيرة ومريحة اليوم. الثقة تُبنى بالممارسة.')}
          </div>
          <button className="primary-button" onClick={onPractice}>{t('Put it into practice', 'حوّلها إلى ممارسة')}<ArrowRight size={17} /></button>
        </div>
      ) : (
        <>
          <div
            className="featured-article"
            onClick={() => onOpenArticle(0)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onOpenArticle(0); }}
          >
            <div>
              <span className="eyebrow">{t('A GOOD PLACE TO START · 2 MIN READ', 'بداية جيدة · دقيقتان للقراءة')}</span>
              <h2>{articles[0].title}</h2>
              <p>{t('Your pain is real. But it might not mean what you think it means.', 'ألمك حقيقي. لكنه قد لا يعني ما تتصوّره.')}</p>
              <span className="text-button">{t('Let’s understand pain', 'لنفهم الألم')}<ArrowUpRight size={17} /></span>
            </div>
            <div className="learning-art"><Heart size={100} strokeWidth={.7} /><span className="art-orbit" /></div>
          </div>
          <div className="article-grid">
            {articles.slice(1).map((a, i) => (
              <button className="article-card" key={a.title} onClick={() => onOpenArticle(i + 1)}>
                <a.icon size={31} strokeWidth={1.2} />
                <span className="eyebrow">{a.tag}</span>
                <h3>{a.title}</h3>
                <span>{t('2 min read', 'دقيقتان للقراءة')}<ArrowUpRight size={18} /></span>
              </button>
            ))}
          </div>
          <div className="presentation-education">
            <span className="eyebrow">{t('A LITTLE MORE ABOUT YOUR PATTERN', 'المزيد عن نمط ألمك')}</span>
            <h2>{arabic ? presentation.nameAr : presentation.name}</h2>
            <p>{arabic ? 'الحركة المريحة والتحميل التدريجي مع مراقبة الأعراض يدعمان التعافي.' : presentation.explanation}</p>
            <details>
              <summary>{t('What helps, and what to expect', 'ما يساعد وما يمكن توقعه')}</summary>
              <p>{presentation.helps} {presentation.course}</p>
            </details>
          </div>
        </>
      )}
    </>
  );
}
