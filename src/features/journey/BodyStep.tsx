'use client';
import {
  Check, ChevronDown, ChevronRight, CircleHelp, Clock3, Crosshair, Heart, LockKeyhole,
  Maximize, Minus, Plus, Rotate3D, RotateCcw, Search, Settings2, ShieldCheck, Sparkles,
  Target, UserRound, X, ArrowRight,
} from 'lucide-react';
import { regions, type Region } from '@/lib/clinical';
import type { T } from '@/lib/app-types';
import type { PainPin } from '@/components/body/BodyViewer';
import LazyBodyViewer from '@/components/body/LazyBodyViewer';
import IconButton from '@/components/ui/IconButton';

const common: [string, string, string][] = [
  ['lower-back', 'Lower back', 'أسفل الظهر'],
  ['neck', 'Neck', 'الرقبة'],
  ['shoulder-left', 'Shoulder', 'الكتف'],
  ['knee-left', 'Knee', 'الركبة'],
  ['hip-left', 'Hip', 'الورك'],
  ['ankle-left', 'Ankle & foot', 'الكاحل والقدم'],
];

const groupOrder = ['lower-back', 'neck', 'shoulder', 'upper-back', 'knee', 'hip', 'ankle', 'elbow'];
const groupLabel: Record<string, [string, string]> = {
  'lower-back': ['Lower back', 'أسفل الظهر'],
  neck: ['Neck', 'الرقبة'],
  shoulder: ['Shoulder', 'الكتف'],
  'upper-back': ['Upper back', 'أعلى الظهر'],
  knee: ['Knee', 'الركبة'],
  hip: ['Hip', 'الورك'],
  ankle: ['Ankle & foot', 'الكاحل والقدم'],
  elbow: ['Elbow & hand', 'المرفق واليد'],
};
const grouped: Record<string, Region[]> = {};
for (const r of regions) (grouped[r.group] ??= []).push(r);

export type BodyStepProps = {
  t: T;
  arabic: boolean;
  coarse: boolean;
  region: Region | undefined;
  pins: PainPin[];
  pain: number;
  pendingPin: PainPin | null;
  back: boolean;
  sex: 'male' | 'female';
  zoom: number;
  reset: number;
  query: string;
  allRegions: boolean;
  onShowHelp: () => void;
  onQueryChange: (q: string) => void;
  onQueryFocus: () => void;
  onClearQuery: () => void;
  onToggleAllRegions: () => void;
  onShowAllRegions: () => void;
  onBackChange: (back: boolean) => void;
  onSexChange: (sex: 'male' | 'female') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFocusBody: () => void;
  onSelectRegion: (id: string, point?: [number, number, number]) => void;
  onConfirmPin: () => void;
  onAdjustPin: () => void;
  onClearSelection: () => void;
  onPinIntensity: (n: number) => void;
  onContinue: () => void;
};

export default function BodyStep(props: BodyStepProps) {
  const {
    t, arabic, coarse, region, pins, pain, pendingPin, back, sex, zoom, reset, query, allRegions,
    onShowHelp, onQueryChange, onQueryFocus, onClearQuery, onToggleAllRegions, onShowAllRegions,
    onBackChange, onSexChange, onZoomIn, onZoomOut, onResetView, onFocusBody,
    onSelectRegion, onConfirmPin, onAdjustPin, onClearSelection, onPinIntensity, onContinue,
  } = props;
  const hasPin = pins.length === 1;
  const displayPin = pendingPin || pins[0] || null;
  const viewerPins: PainPin[] = pendingPin ? [pendingPin] : pins;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span /> {t('A LITTLE UNDERSTANDING. A BETTER YOU.', 'فهمٌ أعمق. حركةٌ أفضل.')}</div>
          <h1>{t('Let’s get you moving better.', 'لنساعدك على الحركة بشكل أفضل.')}</h1>
          <p>{t('Every recovery starts somewhere. Let’s find your starting point.', 'كل رحلة تعافٍ لها بداية. لنجد نقطة بدايتك.')}</p>
        </div>
        <div className="time-pill"><Clock3 size={15} />{t('About 3 minutes', 'حوالي ٣ دقائق')}</div>
      </div>
      <div className="assessment-steps">
        {[
          [t('Locate your pain', 'حدّد ألمك'), t('Show us where it hurts', 'أرنا موضع الألم')],
          [t('Help us understand', 'ساعدنا على الفهم'), t('A few questions, just for you', 'أسئلة قليلة تناسبك')],
          [t('Your personal plan', 'خطتك الشخصية'), t('Small steps. Real progress.', 'خطوات صغيرة. تقدّم حقيقي.')],
        ].map(([title, sub], i) => (
          <div className={i === 0 ? 'step active' : 'step'} key={title}>
            <span className="step-number">0{i + 1}</span>
            <div><strong>{title}</strong><small>{sub}</small></div>
            {i < 2 && <ChevronRight size={16} />}
          </div>
        ))}
      </div>
      <div className="body-workspace body-step">
        <div className="viewer-wrap">
          <div className="stage-top">
            <span className="stage-label"><span className="live-dot" />{t('INTERACTIVE BODY MAP', 'خريطة الجسم التفاعلية')}</span>
            <button className="subtle-button" onClick={onShowHelp}><CircleHelp size={17} />{t('How it works', 'كيف تعمل')}</button>
          </div>
          <div className="viewer-search" dir={arabic ? 'rtl' : 'ltr'}>
            <Search size={16} />
            <input
              aria-label={t('Search body areas', 'ابحث عن منطقة')}
              placeholder={t('Search body areas…', 'ابحث عن منطقة…')}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onFocus={onQueryFocus}
            />
            {query && <button aria-label="Clear search" className="icon-button" onClick={onClearQuery}><X size={14} /></button>}
          </div>
          <div className="body-canvas" dir="ltr">
            <LazyBodyViewer active={region?.id || ''} back={back} sex={sex} zoom={zoom} reset={reset} pins={viewerPins} onSelect={onSelectRegion} />
          </div>
          <div className="orientation-label">{back ? t('POSTERIOR VIEW', 'من الخلف') : t('ANTERIOR VIEW', 'من الأمام')}<span>—</span>{t('ANATOMICAL POSITION', 'الوضع التشريحي')}</div>
          <div className="canvas-tools">
            <IconButton icon={Plus} label="Zoom in" onClick={onZoomIn} />
            <div />
            <IconButton icon={Minus} label="Zoom out" onClick={onZoomOut} />
            <div />
            <IconButton icon={RotateCcw} label="Reset view" onClick={onResetView} />
            <div />
            <IconButton icon={Maximize} label="Focus body" onClick={onFocusBody} />
          </div>
          <div className="map-dock" dir={arabic ? 'rtl' : 'ltr'}>
            <div className="map-dock-group">
              <button className={!back ? 'selected' : ''} aria-pressed={!back} onClick={() => onBackChange(false)}><UserRound size={14} />{t('Front', 'أمام')}</button>
              <button className={back ? 'selected' : ''} aria-pressed={back} onClick={() => onBackChange(true)}><Rotate3D size={14} />{t('Back', 'خلف')}</button>
            </div>
            <div className="map-dock-group">
              <button className={sex === 'male' ? 'selected' : ''} aria-pressed={sex === 'male'} onClick={() => onSexChange('male')}>{t('Male', 'ذكر')}</button>
              <button className={sex === 'female' ? 'selected' : ''} aria-pressed={sex === 'female'} onClick={() => onSexChange('female')}>{t('Female', 'أنثى')}</button>
            </div>
            <button className="map-dock-list" aria-expanded={allRegions} onClick={onToggleAllRegions}>
              <Search size={14} />{t(allRegions ? 'Hide list' : 'Body list', allRegions ? 'إخفاء القائمة' : 'قائمة الجسم')} <ChevronDown size={12} className={allRegions ? 'rotate' : ''} />
            </button>
          </div>
          <div className="rotate-hint">
            <Rotate3D size={15} />{t('Drag to rotate', 'اسحب للتدوير')}<span>·</span>
            {coarse ? t('Pinch to zoom', 'اقرص للتكبير') : t('Scroll to zoom', 'مرّر للتكبير')}<span>·</span>
            {t('Tap body to place one precise point', 'اضغط على الجسم لوضع نقطة واحدة دقيقة')}
          </div>
          {pendingPin && (
            <div className="bv-confirm" dir={arabic ? 'rtl' : 'ltr'} aria-live="polite" aria-atomic="true">
              <div className="bv-confirm-head">
                <Crosshair size={16} />
                <strong>{t('Is this exactly where it hurts?', 'هل هذا موضع الألم تماماً؟')}</strong>
                <span>{arabic ? regions.find((r) => r.id === pendingPin.regionId)?.labelAr : regions.find((r) => r.id === pendingPin.regionId)?.label}</span>
              </div>
              <p>{t('One precise point is all we need. Confirm or drag to adjust.', 'نقطة واحدة دقيقة تكفي. أكّد أو اسحب للتعديل.')}</p>
              <div className="bv-confirm-actions">
                <button className="primary-button small" onClick={onConfirmPin}><Check size={14} />{t('Yes, that’s it', 'نعم، هذا هو')}</button>
                <button className="ghost-button small" onClick={onAdjustPin}>{t('Adjust', 'تعديل')}</button>
                <button className="ghost-button small" onClick={onClearSelection}>{t('Somewhere else', 'مكان آخر')}</button>
              </div>
            </div>
          )}
        </div>
        <div className="localise-panel">
          <div className="panel-step"><Crosshair size={19} /><span>{t('STEP 01 · LOCATE', 'الخطوة ٠١ · حدّد')}</span></div>
          <h2>{t('Where does it hurt?', 'أين تشعر بالألم؟')}</h2>
          <p>{t('Tap the 3D body for one precise point, or pick a region below.', 'اضغط على الجسم ثلاثي الأبعاد لنقطة واحدة دقيقة أو اختر منطقة أدناه.')}</p>
          {region ? (
            <div className="selection-card">
              <div className="selection-top">
                <span><span className="pain-dot" />{arabic ? region.labelAr : region.label}</span>
                <IconButton icon={X} label="Clear selection" onClick={onClearSelection} />
              </div>
              <div className="selected-body-line" />
              <strong>{t('One point is enough.', 'نقطة واحدة تكفي.')}</strong>
              <p>
                {pendingPin
                  ? t('Tap Confirm below, or tap again on the body to move the point.', 'اضغط تأكيد أدناه أو اضغط مجدداً على الجسم لتحريك النقطة.')
                  : hasPin
                    ? t('Your point is set. You can tap the body again to move it.', 'تم تحديد نقطتك. يمكنك الضغط مجدداً لنقلها.')
                    : t('Tap the exact spot on the 3D body to place your point.', 'اضغط على الموضع الدقيق في الجسم ثلاثي الأبعاد لوضع النقطة.')}
              </p>
              {displayPin && (
                <div className="pin-single">
                  <div className="pin-single-head">
                    <span>{arabic ? regions.find((r) => r.id === displayPin.regionId)?.labelAr : regions.find((r) => r.id === displayPin.regionId)?.label}</span>
                    <b>{pendingPin ? t('Preview', 'معاينة') : t('Set', 'تم')}</b>
                  </div>
                  <label>{t('Pain intensity', 'شدة الألم')}<b>{pain}<small>/10</small></b></label>
                  <input aria-label="Pain intensity" type="range" min="0" max="10" value={pain} onChange={(e) => onPinIntensity(+e.target.value)} />
                  <div className="slider-labels"><span>{t('Mild', 'خفيف')}</span><span>{t('Severe', 'شديد')}</span></div>
                  <div className="pin-single-actions">
                    {pendingPin ? (
                      <>
                        <button className="primary-button small" onClick={onConfirmPin}>{t('Confirm point', 'تأكيد النقطة')}</button>
                        <button className="ghost-button small" onClick={onAdjustPin}>{t('Move point', 'تحريك النقطة')}</button>
                      </>
                    ) : (
                      <button className="ghost-button small" onClick={onClearSelection}><X size={12} />{t('Remove point', 'إزالة النقطة')}</button>
                    )}
                  </div>
                </div>
              )}
              <button className="text-button" onClick={() => { onClearSelection(); onShowAllRegions(); }}>{t('Somewhere else', 'مكان آخر')}<ArrowRight size={14} /></button>
            </div>
          ) : (
            <>
              <div className="section-label">{t('COMMON AREAS', 'مناطق شائعة')}</div>
              <div className="region-grid">
                {common.map(([id, label, ar]) => (
                  <button key={id} onClick={() => onSelectRegion(id)}>
                    <span className="region-line-icon"><Target size={19} strokeWidth={1.3} /></span>
                    {t(label, ar)}
                    <ChevronRight size={13} />
                  </button>
                ))}
              </div>
            </>
          )}
          <button className="all-regions" aria-expanded={allRegions} onClick={onToggleAllRegions}>
            {t(allRegions ? 'Hide all body areas' : 'Explore all body areas', allRegions ? 'إخفاء مناطق الجسم' : 'استكشف جميع مناطق الجسم')}
            <ChevronDown size={15} className={allRegions ? 'rotate' : ''} />
          </button>
          {allRegions && (
            <div className="region-search sheet-body">
              <div className="sheet-search-row">
                <Search size={16} />
                <input aria-label={t('Search body areas', 'ابحث عن منطقة')} placeholder={t('Search body areas…', 'ابحث عن منطقة…')} value={query} onChange={(e) => onQueryChange(e.target.value)} />
                {query && <button aria-label="Clear" onClick={onClearQuery}><X size={14} /></button>}
              </div>
              {groupOrder.map((gid) => {
                const list = (grouped[gid] || []).filter((r) => (r.label + ' ' + r.labelAr).toLowerCase().includes(query.toLowerCase()));
                if (!list.length) return null;
                return (
                  <div key={gid} className="sheet-group">
                    <span className="sheet-group-label">{t(groupLabel[gid][0], groupLabel[gid][1])}</span>
                    <div className="chip-grid">
                      {list.map((r) => (
                        <button key={r.id} className={region?.id === r.id ? 'chip selected' : 'chip'} aria-pressed={region?.id === r.id} onClick={() => onSelectRegion(r.id)}>
                          {arabic ? r.labelAr : r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="localise-tip">
            <div className="tip-icon"><Sparkles size={18} /></div>
            <div>
              <strong>{t('You know your body best.', 'أنت الأدرى بجسمك.')}</strong>
              <p>{t('One point is enough — you can move it anytime.', 'نقطة واحدة تكفي — يمكنك تحريكها في أي وقت.')}</p>
            </div>
          </div>
          <div className="panel-bottom sticky-cta">
            <button className="primary-button" disabled={!hasPin && !pendingPin} onClick={onContinue}>
              {t(hasPin || pendingPin ? 'Yes, let’s continue' : 'Place one point to continue', hasPin || pendingPin ? 'نعم، لنتابع' : 'ضع نقطة واحدة للمتابعة')}
              <ArrowRight size={18} />
            </button>
            <span><ShieldCheck size={12} />{t('Your recovery. Your space.', 'تعافيك. مساحتك.')}</span>
          </div>
        </div>
      </div>
      <div className="trust-strip">
        <div><span className="trust-icon"><ShieldCheck size={20} /></span><span><strong>{t('Built around clinical reasoning', 'مبني على فهم سريري')}</strong><small>{t('More than a list of exercises.', 'أكثر من قائمة تمارين.')}</small></span></div>
        <div><span className="trust-icon"><Settings2 size={20} /></span><span><strong>{t('A plan that adapts to you', 'خطة تتكيّف معك')}</strong><small>{t('Your progress sets the pace.', 'تقدّمك يحدّد الإيقاع.')}</small></span></div>
        <div><span className="trust-icon"><Heart size={20} /></span><span><strong>{t('Small steps, lasting change', 'خطوات صغيرة، تغيير مستدام')}</strong><small>{t('Designed for your everyday.', 'مصمّمة لحياتك اليومية.')}</small></span></div>
      </div>
    </>
  );
}
