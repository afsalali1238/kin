import { defaultIntake, type CheckIn, type Intake } from '@/lib/clinical';
import type { PainPin } from '@/components/body/BodyViewer';

export type Screen =
  | 'body'
  | 'home'
  | 'intake'
  | 'result'
  | 'goal'
  | 'programme'
  | 'session'
  | 'checkin'
  | 'progress'
  | 'learn';

/** The one persisted recovery journey. Keep this serialisable and versioned. */
export type Recovery = {
  region: string;
  pins: PainPin[];
  intake: Intake;
  goal: string;
  presentationId: string;
  phase: number;
  assessed: boolean;
  logs: CheckIn[];
  swaps: Record<string, string>;
  session?: { exerciseIndex: number; seconds: number; completedSets: number; startedAt: string | null };
};

export const initialRecovery: Recovery = {
  region: '',
  pins: [],
  intake: defaultIntake,
  goal: 'Walk and move comfortably',
  presentationId: 'back-extension',
  phase: 1,
  assessed: false,
  logs: [],
  swaps: {},
  session: { exerciseIndex: 0, seconds: 0, completedSets: 0, startedAt: null },
};

/** Bilingual copy helper: t(english, arabic). */
export type T = (en: string, ar: string) => string;
export type Notify = (message: string) => void;
export type UpdateRecovery = (patch: Partial<Recovery>) => void;
export type AnswerIntake = (patch: Partial<Intake>) => void;
