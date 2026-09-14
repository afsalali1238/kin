'use client';
import { Play, X } from 'lucide-react';
import type { T } from '@/lib/app-types';
import IconButton from '@/components/ui/IconButton';

export default function TrafficModal({ t, onClose, onLaunch }: { t: T; onClose: () => void; onLaunch: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal traffic-modal" role="dialog" aria-modal="true" aria-label="Your pain traffic light" tabIndex={-1} autoFocus onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} onClick={(e) => e.stopPropagation()}>
        <IconButton icon={X} label="Close" onClick={onClose} />
        <span className="eyebrow">{t('BEFORE WE MOVE', 'قبل أن نتحرّك')}</span>
        <h2>{t('Your body has a traffic light.', 'لجسمك إشارة مرور.')}</h2>
        <p>{t('A little discomfort can be okay. Here’s how to listen.', 'قد يكون القليل من الانزعاج مقبولاً. إليك كيف تُنصت.')}</p>
        <div className="traffic-rule green">
          <i />
          <div>
            <strong>{t('Green · I can keep going', 'أخضر · يمكنني المتابعة')}</strong>
            <p>{t('Up to 4/10, settles within 24 hours, and not worse the next morning.', 'حتى ٤/١٠، يهدأ خلال ٢٤ ساعة وليس أسوأ صباحاً.')}</p>
          </div>
        </div>
        <div className="traffic-rule amber">
          <i />
          <div>
            <strong>{t('Amber · I’ll check tomorrow', 'كهرماني · سأراقب غداً')}</strong>
            <p>{t('Next-day response still unknown? Keep the dose steady. No need to push.', 'استجابة الغد غير معروفة؟ حافظ على الجرعة ولا تضغط على نفسك.')}</p>
          </div>
        </div>
        <div className="traffic-rule red">
          <i />
          <div>
            <strong>{t('Red · I’ll ease off', 'أحمر · سأخفف الحمل')}</strong>
            <p>{t('Above 4/10, lingering beyond a day, or worse in the morning? Swap down or pause.', 'فوق ٤/١٠ أو مستمر أو أسوأ صباحاً؟ اختر بديلاً أسهل أو توقّف.')}</p>
          </div>
        </div>
        <button className="primary-button wide" onClick={onLaunch}>
          {t('Got it. Let’s move.', 'فهمت. لنتحرّك.')}<Play size={17} />
        </button>
      </div>
    </div>
  );
}
