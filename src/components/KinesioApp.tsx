'use client';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  Activity, ArrowUpRight, BookOpen, Check, ChevronDown, ChevronRight, CircleHelp,
  House, Layers3, ScanLine, UserRound, WifiOff, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { exercises, makeProgramme, regions, variant, type CheckIn, type Exercise } from '@/lib/clinical';
import type { Screen } from '@/lib/app-types';
import { deriveJourney } from '@/lib/derive';
import { makeId } from '@/lib/id';
import { RECOVERY_ID_KEY, RECOVERY_STORAGE_KEY } from '@/lib/recovery-storage';
import { useRecovery } from '@/hooks/useRecovery';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { PainPin } from '@/components/body/BodyViewer';
import BodyStep from '@/features/journey/BodyStep';
import IntakeStep from '@/features/journey/IntakeStep';
import ResultStep from '@/features/journey/ResultStep';
import GoalStep from '@/features/journey/GoalStep';
import ProgrammeScreen from '@/features/programme/ProgrammeScreen';
import HomeScreen from '@/features/home/HomeScreen';
import SessionPlayer from '@/features/session/SessionPlayer';
import SessionCheckIn from '@/features/session/SessionCheckIn';
import ProgressScreen from '@/features/progress/ProgressScreen';
import LearnScreen from '@/features/learn/LearnScreen';
import HelpModal from '@/features/app/HelpModal';
import TrafficModal from '@/features/app/TrafficModal';

const navs: { screen: Screen; label: string; ar: string; icon: LucideIcon }[] = [
  { screen: 'home', label: 'Overview', ar: 'نظرة عامة', icon: House },
  { screen: 'body', label: 'Your body', ar: 'جسمك', icon: ScanLine },
  { screen: 'programme', label: 'My programme', ar: 'برنامجي', icon: Layers3 },
  { screen: 'progress', label: 'My progress', ar: 'تقدّمي', icon: Activity },
  { screen: 'learn', label: 'Learn & understand', ar: 'تعلّم وافهم', icon: BookOpen },
];
const assessmentScreens: Screen[] = ['body', 'intake', 'result', 'goal'];

export default function KinesioApp() {
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }, []);
  const [screen, setScreen] = useState<Screen>('body');
  const scrollMemory = useRef<Partial<Record<Screen, number>>>({});
  const online = useOnlineStatus();
  const { state, update, answer, sync } = useRecovery((restored) => {
    if (restored.assessed) setScreen('home');
  }, online);

  // Language (app chrome), persisted outside the recovery journey.
  const [arabic, setArabic] = useState(false);
  const t = (en: string, ar: string) => (arabic ? ar : en);

  // Viewer chrome.
  const [back, setBack] = useState(false);
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [zoom, setZoom] = useState(1);
  const [reset, setReset] = useState(0);
  const [allRegions, setAllRegions] = useState(false);
  const [query, setQuery] = useState('');

  // Journey flow.
  const [pendingPin, setPendingPin] = useState<PainPin | null>(null);
  const [step, setStep] = useState(0);
  const [rejected, setRejected] = useState<string[]>([]);
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);

  // App chrome + session player.
  const [toast, setToast] = useState('');
  const [removedPin, setRemovedPin] = useState<PainPin | null>(null);
  const [help, setHelp] = useState(false);
  const [phaseTab, setPhaseTab] = useState(1);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);
  const [trafficOpen, setTrafficOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [sound, setSound] = useState(true);
  const [sessionPain, setSessionPain] = useState(3);
  const [feeling, setFeeling] = useState('right');
  const [dailyPain, setDailyPain] = useState(3);
  const [dailyFeeling, setDailyFeeling] = useState('same');
  const [sessionList, setSessionList] = useState<Exercise[]>([]);
  const [learnArticle, setLearnArticle] = useState<number | null>(null);
  const [sessionHadPain, setSessionHadPain] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const timerEnd = useRef<number | null>(null);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (state.session?.startedAt && screen !== 'session') {
      setExerciseIndex(state.session.exerciseIndex); // eslint-disable-line react-hooks/set-state-in-effect -- restore persisted session on load
      setSeconds(state.session.seconds);
      setCompletedSets(state.session.completedSets || 0); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [state.session?.startedAt, state.session?.exerciseIndex, state.session?.seconds, state.session?.completedSets, screen]);

  // Read persisted language after mount (localStorage is unavailable during SSR).
  useEffect(() => {
    setArabic(localStorage.getItem('kinesio-language') === 'ar'); // eslint-disable-line react-hooks/set-state-in-effect -- hydrate persisted language after mount
  }, []);
  useEffect(() => {
    document.documentElement.lang = arabic ? 'ar' : 'en';
    document.documentElement.dir = arabic ? 'rtl' : 'ltr';
    localStorage.setItem('kinesio-language', arabic ? 'ar' : 'en');
  }, [arabic]);
  useEffect(() => {
    const mq = window.matchMedia('(pointer:coarse)');
    setCoarse(mq.matches); // eslint-disable-line react-hooks/set-state-in-effect -- pointer capability only exists client-side
    const fn = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => { setToast(''); setRemovedPin(null); }, 5500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const y = learnArticle !== null ? 0 : scrollMemory.current[screen];
    requestAnimationFrame(() => window.scrollTo(0, y || 0));
  }, [screen, learnArticle]);

  useEffect(() => {
    if (!playing) return;
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then((lock) => { wakeLock.current = lock; }).catch(() => undefined);
    timerEnd.current = Date.now() + seconds * 1000;
    const timer = setInterval(
      () =>
        setSeconds((s) => {
          const next = Math.max(0, Math.ceil(((timerEnd.current || Date.now()) - Date.now()) / 1000));
          if (next <= 0) {
            setPlaying(false);
            if (sound && 'speechSynthesis' in window) {
              const cue = new SpeechSynthesisUtterance(arabic ? 'أحسنت، استرح قليلاً' : 'Well done. Take a short rest.');
              cue.lang = arabic ? 'ar' : 'en';
              speechSynthesis.speak(cue);
            }
            return 0;
          }
          return next;
        }),
      1000,
    );
    return () => { clearInterval(timer); wakeLock.current?.release().catch(() => undefined); wakeLock.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timer is initialized once per play/exercise change; update is stable
  }, [playing, sound, arabic, exerciseIndex]);

  // Flush session progress to storage when paused or advancing, to prevent write amplification on every timer tick.
  useEffect(() => {
    if (!playing && state.session?.startedAt) {
      update({ session: { exerciseIndex, seconds, completedSets, startedAt: state.session.startedAt } });
    }
  }, [playing, exerciseIndex, seconds, completedSets, state.session?.startedAt, update]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && playing && 'wakeLock' in navigator) {
        navigator.wakeLock.request('screen').then((lock) => { wakeLock.current = lock; }).catch(() => undefined);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [playing]);

  const journey = deriveJourney(state, phaseTab, rejected);
  const { region, group, matches, top, currentPresentation, flag, dose, plan, progress, real, painValues, doneSessions, streak, dailyDone } = journey;
  const activeExercise = sessionList[exerciseIndex];

  const notify = (message: string) => setToast(message);
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), recovery: state }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kine-recovery-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const deleteData = () => {
    if (!window.confirm(t('Delete all recovery data stored on this device? This cannot be undone.', 'حذف جميع بيانات التعافي المحفوظة على هذا الجهاز؟ لا يمكن التراجع عن ذلك.'))) return;
    localStorage.removeItem(RECOVERY_STORAGE_KEY);
    localStorage.removeItem(RECOVERY_ID_KEY);
    window.location.reload();
  };

  // --- Pin flow (one precise point) ---------------------------------------
  const selectRegion = (regionId: string, point?: [number, number, number]) => {
    const found = regions.find((r) => r.id === regionId);
    if (!found) return;
    setRemovedPin(null);
    if (point) {
      const newPin: PainPin = { id: makeId(), regionId, point, intensity: state.intake.pain };
      setPendingPin(newPin);
      update({ region: regionId });
      try {
        navigator.vibrate?.(10);
      } catch {
        // haptics are optional feedback
      }
    } else {
      update({ region: regionId, pins: [] });
      setPendingPin(null);
      if (found.view === 'back') setBack(true);
    }
  };
  const confirmPin = () => {
    if (pendingPin) {
      update({ region: pendingPin.regionId, pins: [pendingPin] });
      setPendingPin(null);
      setRemovedPin(null);
      notify(t('Spot saved. One precise point is enough.', 'تم حفظ الموضع. نقطة واحدة تكفي.'));
    }
  };
  const adjustPin = () => setPendingPin(null);
  const clearSelection = () => {
    const removed = state.pins[0] || null;
    if (removed) {
      setRemovedPin(removed);
      notify(t('Point removed.', '\u062a\u0645\u062a \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0646\u0642\u0637\u0629.'));
    }
    update({ region: '', pins: [] });
    setPendingPin(null);
  };

  const undoRemovePin = () => {
    if (!removedPin) return;
    update({ region: removedPin.regionId, pins: [removedPin] });
    setRemovedPin(null);
    notify(t('Point restored.', '\u062a\u0645\u062a \u0627\u0633\u062a\u0639\u0627\u062f\u0629 \u0627\u0644\u0646\u0642\u0637\u0629.'));
  };
  const changePinIntensity = (n: number) => {
    answer({ pain: n });
    if (pendingPin) setPendingPin((p) => (p ? { ...p, intensity: n } : null));
    else if (state.pins[0]) update({ pins: [{ ...state.pins[0], intensity: n }] });
  };

  // --- Journey navigation ---------------------------------------------------
  const beginAssessment = () => {
    // Confirming an unconfirmed pin and continuing must work in one tap, so
    // navigation can't rely on state that updates asynchronously.
    let ready = state.pins.length === 1 && !!state.region;
    if (pendingPin) {
      update({ region: pendingPin.regionId, pins: [pendingPin] });
      setPendingPin(null);
      notify(t('Spot saved. One precise point is enough.', 'تم حفظ الموضع. نقطة واحدة تكفي.'));
      ready = true;
    }
    if (!ready) return;
    setStep(0);
    setRejected([]);
    setRiskAcknowledged(false);
    setScreen('intake');
  };
  const acknowledgeRisk = () => {
    setRiskAcknowledged(true);
    notify(t('You can explore the explanation. Urgent symptoms keep sessions paused.', 'يمكنك قراءة الشرح. الأعراض العاجلة توقف الجلسات.'));
  };
  const reviewAnswers = () => {
    setStep(6);
    setScreen('intake');
  };
  const rejectTop = () => {
    if (rejected.length >= matches.length - 1) {
      setRejected([]);
      setStep(4);
      setScreen('intake');
    } else setRejected([...rejected, top.id]);
  };
  const acceptResult = () => {
    update({ presentationId: top.id });
    setScreen('goal');
  };
  const confirmGoal = () => {
    update({ assessed: true, phase: 1 });
    setPhaseTab(1);
    setScreen('programme');
    notify(t('Your plan is ready. Built around your answers, at your pace.', 'خطتك جاهزة ومبنية على إجاباتك وبإيقاع يناسبك.'));
  };
  const navigate = (s: Screen) => {
    const apply = () => {
      setPlaying(false);
      scrollMemory.current[screen] = window.scrollY;
      setScreen(s);
      if (s === 'programme') setPhaseTab(state.phase);
    };
    const doc = document as Document & { startViewTransition?: (update: () => void) => void };
    if (doc.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doc.startViewTransition(() => flushSync(apply));
    } else {
      apply();
    }
  };

  // --- Session --------------------------------------------------------------
  const startSession = () => {
    if (!state.assessed) {
      notify(t('Let’s understand your pain first.', 'لنبدأ بفهم ألمك.'));
      setScreen('body');
      return;
    }
    if (flag?.level === 'urgent') {
      notify(t('Please get urgent medical assessment before exercising. Your plan is paused.', 'يرجى الحصول على تقييم طبي عاجل قبل التمرين.'));
      return;
    }
    setTrafficOpen(true);
  };
  const launchSession = () => {
    const list = makeProgramme(group, state.intake, state.presentationId, state.phase, state.goal).map(
      (e) => exercises.find((x) => x.id === state.swaps[e.id] && !x.contraindicatedFor.includes(state.presentationId)) || e,
    );
    const savedSession = state.session?.startedAt ? state.session : null;
    const index = savedSession ? Math.min(savedSession.exerciseIndex, Math.max(0, list.length - 1)) : 0;
    const initialSeconds = list[index]?.holdSeconds || 30;
    setSessionList(list);
    setExerciseIndex(index);
    setCompletedSets(0);
    setSeconds(savedSession?.seconds || initialSeconds);
    update({ session: { exerciseIndex: index, seconds: savedSession?.seconds || initialSeconds, completedSets: savedSession?.completedSets || 0, startedAt: savedSession?.startedAt || new Date().toISOString() } });
    setSessionHadPain(false);
    setPlaying(false);
    setTrafficOpen(false);
    setScreen('session');
  };
  const adapt = (direction: 'easier' | 'harder') => {
    if (!activeExercise) return;
    const next = variant(activeExercise, direction, state.presentationId);
    setSessionList((list) => list.map((e, i) => (i === exerciseIndex ? next : e)));
    update({ swaps: { ...state.swaps, [activeExercise.id]: next.id } });
    setSeconds(next.holdSeconds || 30);
    setPlaying(false);
    if (direction === 'easier') setSessionHadPain(true);
    notify(
      direction === 'easier'
        ? t(`Swapped to ${next.name}. We’ve reduced the load to keep this manageable.`, 'تم استبدال التمرين ببديل أسهل وتقليل الحمل.')
        : t(`Try ${next.name}. Keep your next-morning response in mind.`, 'جرّب البديل الأصعب وراقب استجابتك صباح الغد.'),
    );
  };
  const nextExercise = () => {
    setPlaying(false);
    const current = sessionList[exerciseIndex];
    if (current && completedSets + 1 < current.sets) {
      setCompletedSets((value) => value + 1);
      setSeconds(current.holdSeconds || 30);
      return;
    }
    setCompletedSets(0);
    if (exerciseIndex < sessionList.length - 1) {
      setExerciseIndex((i) => i + 1);
      setSeconds(sessionList[exerciseIndex + 1].holdSeconds || 30);
    } else {
      setSessionPain(state.intake.pain);
      setScreen('checkin');
    }
  };
  const prevExercise = () => {
    setPlaying(false);
    if (exerciseIndex > 0) {
      setExerciseIndex((i) => i - 1);
      setSeconds(sessionList[exerciseIndex - 1].holdSeconds || 30);
    }
  };
  const togglePlay = () => {
    if (seconds === 0 && activeExercise) setSeconds(activeExercise.holdSeconds || 30);
    setPlaying((p) => !p);
  };
  const resetTimer = () => {
    setSeconds(activeExercise?.holdSeconds || 30);
    setPlaying(false);
  };
  const leaveSession = () => {
    setPlaying(false);
    scrollMemory.current.session = window.scrollY;
    setScreen('home');
  };
  const finish = () => {
    const log: CheckIn = { date: new Date().toISOString(), pain: sessionPain, feeling: sessionHadPain ? 'painful' : feeling, session: true, phase: state.phase };
    update({ logs: [...state.logs, log], session: { exerciseIndex: 0, seconds: 0, completedSets: 0, startedAt: null } });
    notify(t('Session complete. A little consistency goes a long way.', 'اكتملت الجلسة. الاستمرارية تصنع الفرق.'));
    setScreen('home');
  };
  const saveCheckIn = () => {
    if (sessionPain > 4 || feeling === 'hard') answer({ irritability: 'high' });
    finish();
  };

  // --- Check-ins & progression ------------------------------------------------
  const saveDaily = () => {
    const today = new Date().toISOString().slice(0, 10);
    const priorSession = state.logs.map((l) =>
      l.session && l.settled === undefined && l.date.slice(0, 10) !== today && Date.now() - new Date(l.date).getTime() <= 36 * 60 * 60 * 1000
        ? { ...l, settled: dailyFeeling !== 'worse' && dailyPain <= l.pain, morningWorse: dailyFeeling === 'worse' || dailyPain > l.pain }
        : l,
    );
    update({ logs: [...priorSession, { date: new Date().toISOString(), pain: dailyPain, feeling: dailyFeeling, session: false, phase: state.phase }] });
    notify(t('Check-in saved. Your next-morning response will guide your plan.', 'تم حفظ المتابعة وستوجّه استجابتك خطة التمارين.'));
  };
  const advancePhase = () => {
    update({ phase: state.phase + 1, intake: { ...state.intake, irritability: 'moderate' } });
    setPhaseTab(state.phase + 1);
    setScreen('programme');
    notify(t('Phase unlocked. Your next session now includes more controlled loading.', 'تم فتح المرحلة التالية وزيادة الحمل المتحكّم به.'));
  };
  const regressPhase = () => {
    answer({ irritability: 'high' });
    update({ phase: Math.max(1, state.phase - 1) });
    notify(t('Your dose is reduced to short, gentle sessions.', 'تم تقليل الجرعة إلى جلسات قصيرة ولطيفة.'));
  };

  const screenName =
    navs.find((n) => n.screen === screen)?.label ||
    ({ intake: 'Your assessment', result: 'Understanding your pain', goal: 'Your recovery goal', session: 'Today’s session', checkin: 'Session check-in' } as Record<string, string>)[screen];

  return (
    <div className="app-shell" dir={arabic ? 'rtl' : 'ltr'}>
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate('body')} aria-label="Kinesio home">
          <span className="brand-mark"><i /><i /><i /><i /></span>kinē<span className="brand-period">.</span>
        </button>
        <div className="brand-caption">{t('MOVE TOWARDS BETTER', 'تحرّك نحو الأفضل')}</div>
        <div className="nav-label">{t('YOUR RECOVERY', 'رحلتك للتعافي')}</div>
        <nav>
          {navs.map((n) => (
            <button
              key={n.screen}
              className={screen === n.screen || (n.screen === 'body' && assessmentScreens.includes(screen)) ? 'nav-item active' : 'nav-item'}
              onClick={() => navigate(n.screen)}
            >
              <n.icon size={19} strokeWidth={1.65} />
              <span>{t(n.label, n.ar)}</span>
              {n.screen === 'body' && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="daily-reminder">
            <span className="reminder-art"><span /><span /><span /></span>
            <span className="eyebrow">{t('ONE DAY AT A TIME', 'يوماً بيوم')}</span>
            <h3>{t('Better is a direction.', 'الأفضل وجهة.')}</h3>
            <p>{t('Not a deadline.', 'وليس موعداً نهائياً.')}</p>
            <span className="reminder-line" />
          </div>
          <button className="support-link" onClick={() => setHelp(true)}>
            <CircleHelp size={18} />{t('A little guidance', 'القليل من الإرشاد')}<ArrowUpRight size={14} />
          </button>
          <div className="sidebar-profile">
            <div className="avatar"><UserRound size={19} /></div>
            <div>
              <strong>{t('Your personal space', 'مساحتك الشخصية')}</strong>
              <span>
                <span className="live-dot" />
                {t(sync === 'synced' ? 'Progress saved' : 'Saved on this device', sync === 'synced' ? 'تم حفظ التقدّم' : 'محفوظ على هذا الجهاز')}
              </span>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            {t('Your recovery', 'رحلتك للتعافي')}
            <ChevronRight size={13} />
            <span>{t(screenName, navs.find((n) => n.screen === screen)?.ar || 'تقييمك الشخصي')}</span>
          </div>
          <div className="topbar-right">
            <span className="quiet-message"><span className="live-dot" />{t('A little better, every day.', 'أفضل قليلاً، كل يوم.')}</span>
            <button className="language-button" onClick={() => setArabic(!arabic)}>
              {arabic ? 'العربية' : 'EN'}
              <ChevronDown size={12} />
              <span>{arabic ? 'English' : 'العربية'}</span>
            </button>
            <div className="top-avatar">{t('You', 'أنت')}</div>
          </div>
        </header>
        <main className={`main-content screen-${screen}`}>
          {!online && (
            <div className="offline-banner" role="status">
              <WifiOff size={16} />
              <span>
                {t(
                  'You’re offline. Everything keeps working — your plan is saved on this device and syncs when you’re back.',
                  'أنت غير متصل. التطبيق يعمل بالكامل — خطتك محفوظة على جهازك وتتزامن فور عودتك.',
                )}
              </span>
            </div>
          )}
          {screen === 'body' ? (
            <BodyStep
              t={t}
              arabic={arabic}
              coarse={coarse}
              region={region}
              pins={state.pins}
              pain={state.intake.pain}
              pendingPin={pendingPin}
              back={back}
              sex={sex}
              zoom={zoom}
              reset={reset}
              query={query}
              allRegions={allRegions}
              onShowHelp={() => setHelp(true)}
              onQueryChange={(q) => {
                setQuery(q);
                if (q) setAllRegions(true);
              }}
              onQueryFocus={() => setAllRegions(true)}
              onClearQuery={() => setQuery('')}
              onToggleAllRegions={() => setAllRegions((v) => !v)}
              onShowAllRegions={() => setAllRegions(true)}
              onBackChange={setBack}
              onSexChange={setSex}
              onZoomIn={() => setZoom((z) => Math.min(1.8, z + 0.15))}
              onZoomOut={() => setZoom((z) => Math.max(0.75, z - 0.15))}
              onResetView={() => {
                setZoom(1);
                setBack(false);
                setReset((r) => r + 1);
              }}
              onFocusBody={() => setZoom((z) => (z === 1 ? 1.28 : 1))}
              onSelectRegion={selectRegion}
              onConfirmPin={confirmPin}
              onAdjustPin={adjustPin}
              onClearSelection={clearSelection}
              onPinIntensity={changePinIntensity}
              onContinue={beginAssessment}
            />
          ) : screen === 'intake' ? (
            <IntakeStep
              t={t}
              arabic={arabic}
              step={step}
              intake={state.intake}
              region={region}
              group={group}
              pins={state.pins}
              answer={answer}
              onBack={() => (step ? setStep(step - 1) : setScreen('body'))}
              onContinue={() => (step < 6 ? setStep(step + 1) : setScreen('result'))}
            />
          ) : screen === 'result' ? (
            <ResultStep
              t={t}
              arabic={arabic}
              flag={flag}
              riskAcknowledged={riskAcknowledged}
              top={top}
              matches={matches}
              onset={state.intake.onset}
              pattern={state.intake.pattern}
              aggravatorCount={state.intake.aggravators.length}
              onAcknowledgeRisk={acknowledgeRisk}
              onReviewAnswers={reviewAnswers}
              onReject={rejectTop}
              onAccept={acceptResult}
            />
          ) : screen === 'goal' ? (
            <GoalStep t={t} goal={state.goal} dose={dose} onGoalChange={(goal) => update({ goal })} onConfirm={confirmGoal} />
          ) : screen === 'programme' ? (
            <ProgrammeScreen
              t={t}
              arabic={arabic}
              assessed={state.assessed}
              goal={state.goal}
              phase={state.phase}
              phaseTab={phaseTab}
              plan={plan}
              dose={dose}
              presentationName={currentPresentation.name}
              irritability={state.intake.irritability}
              duration={state.intake.duration}
              onPhaseTab={setPhaseTab}
              onStart={startSession}
              onGetPlan={() => setScreen('body')}
            />
          ) : screen === 'home' ? (
            <HomeScreen
              t={t}
              arabic={arabic}
              assessed={state.assessed}
              phase={state.phase}
              streak={streak}
              dose={dose}
              region={region}
              dailyDone={dailyDone}
              dailyPain={dailyPain}
              dailyFeeling={dailyFeeling}
              real={real}
              painValues={painValues}
              onDailyPain={setDailyPain}
              onDailyFeeling={setDailyFeeling}
              onSaveDaily={saveDaily}
              onStart={startSession}
              onFindStart={() => setScreen('body')}
              onSeeProgress={() => setScreen('progress')}
              onLearn={() => {
                setLearnArticle(0);
                setScreen('learn');
              }}
            />
          ) : screen === 'session' ? (
            <SessionPlayer
              t={t}
              arabic={arabic}
              coarse={coarse}
              list={sessionList}
              index={exerciseIndex}
              completedSets={completedSets}
              playing={playing}
              seconds={seconds}
              sound={sound}
              group={group}
              onLeave={leaveSession}
              onToggleSound={() => setSound(!sound)}
              onTogglePlay={togglePlay}
              onResetTimer={resetTimer}
              onNext={nextExercise}
              onPrev={prevExercise}
              onAdapt={adapt}
            />
          ) : screen === 'checkin' ? (
            <SessionCheckIn t={t} sessionPain={sessionPain} feeling={feeling} onSessionPain={setSessionPain} onFeeling={setFeeling} onSave={saveCheckIn} />
          ) : screen === 'progress' ? (
            <ProgressScreen
              t={t}
              real={real}
              painValues={painValues}
              progress={progress}
              doneSessions={doneSessions}
              phase={state.phase}
              firstLogAt={state.logs[0]?.date}
              regionId={state.region}
              pins={state.pins}
              onAdvance={advancePhase}
              onRegress={regressPhase}
            />
          ) : (
            <LearnScreen
              t={t}
              arabic={arabic}
              learnArticle={learnArticle}
              presentation={currentPresentation}
              onOpenArticle={setLearnArticle}
              onPractice={startSession}
            />
          )}
          <footer className="page-footer">
            <span>kinē. <span>{t('A better relationship with your body.', 'علاقة أفضل مع جسمك.')}</span></span>
            <span>{t('Thoughtfully built. Human by design.', 'صُمّم بعناية. من أجلك.')}</span>
          </footer>
        </main>
      </div>
      <nav className="mobile-bottom-nav" aria-label={t('Primary navigation', 'التنقل الرئيسي')}>
        {navs.filter((item) => item.screen !== 'body').map((item) => {
          const Icon = item.icon;
          const active = screen === item.screen || (item.screen === 'home' && assessmentScreens.includes(screen));
          return (
            <button key={item.screen} className={active ? 'active' : ''} onClick={() => navigate(item.screen)} aria-current={active ? 'page' : undefined}>
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span>{t(item.label === 'Overview' ? 'Today' : item.label === 'My programme' ? 'Programme' : item.label === 'My progress' ? 'Progress' : 'Learn', item.ar)}</span>
            </button>
          );
        })}
        <button onClick={() => setHelp(true)}><CircleHelp size={20} strokeWidth={1.8} /><span>{t('Help', 'مساعدة')}</span></button>
      </nav>
      {toast && (
        <div className="toast" role="status">
          <Check size={19} />
          <span>{toast}</span>
          {removedPin && (
            <button className="toast-action" onClick={undoRemovePin}>{t('Undo', '\u062a\u0631\u0627\u062c\u0639')}</button>
          )}
          <button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={16} /></button>
        </div>
      )}
      {help && <HelpModal t={t} onClose={() => setHelp(false)} onExport={exportData} onDelete={deleteData} />}
      {trafficOpen && <TrafficModal t={t} onClose={() => setTrafficOpen(false)} onLaunch={launchSession} />}
    </div>
  );
}
