'use client';
import { ArrowRight, Crosshair, Footprints, ScanLine, Settings2, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { T } from '@/lib/app-types';
import IconButton from '@/components/ui/IconButton';

export default function HelpModal({ t, onClose }: { t: T; onClose: () => void }) {
  const steps: [LucideIcon, string, string][] = [
    [
      ScanLine,
      t('Show us where it hurts', 'حدّد موضع الألم'),
      t('Drag to rotate the body. Tap a region, then tap the exact spot to add a pin. Or use the region list.', 'اسحب لتدوير الجسم. اضغط على منطقة ثم الموضع الدقيق أو استخدم القائمة.'),
    ],
    [
      Settings2,
      t('Tell us a little more', 'أخبرنا بالمزيد'),
      t('Seven short questions help us choose the right kind of movement and the right dose.', 'سبعة أسئلة قصيرة تساعدنا على اختيار الحركة والجرعة المناسبتين.'),
    ],
    [
      Footprints,
      t('Take your next small step', 'خذ خطوتك التالية'),
      t('Follow a short session, check in, and let your response guide your progress.', 'اتبع جلسة قصيرة وسجّل استجابتك ودعها توجّه تقدّمك.'),
    ],
  ];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="How it works" onClick={(e) => e.stopPropagation()}>
        <IconButton icon={X} label="Close guidance" onClick={onClose} />
        <span className="round-feature"><Crosshair size={26} /></span>
        <h2>{t('A starting point, in three small steps.', 'نقطة بداية في ثلاث خطوات صغيرة.')}</h2>
        {steps.map(([Icon, title, sub]) => (
          <div className="help-step" key={title}>
            <Icon size={23} />
            <div><h3>{title}</h3><p>{sub}</p></div>
          </div>
        ))}
        <button className="primary-button wide" onClick={onClose}>{t('I’m ready', 'أنا مستعد')}<ArrowRight size={17} /></button>
      </div>
    </div>
  );
}
