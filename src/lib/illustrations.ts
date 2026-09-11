// Per-exercise movement illustrations for kinē.
//
// Pure data + geometry with zero runtime imports, so one source of truth powers:
//  - the session player (src/components/ExerciseFigure.tsx)
//  - the printable handout (src/app/handout/page.tsx)
//  - the regression check (scripts/illustration-check.mjs, run with
//    `node --experimental-strip-types scripts/illustration-check.mjs`)
//
// Every one of the 136 exercises maps onto one of 10 pose archetypes
// (hinge · squat · reach · heel-raise · gait · wall · four-point · supine ·
// prone · seated), parameterised per exercise with a motion variant, a range
// and props. Each exercise is then sampled at FRAME_COUNT distinct phases of
// its movement arc — those 10 frames are both the animation keyframes for the
// session player and a pose library for print.
//
// Geometry rules that scripts/illustration-check.mjs asserts:
//   · limbs are drawn exactly as solved two-bone chains rooted at the
//     neck (arms) and pelvis (legs), so segment lengths are constant across
//     frames by construction;
//   · dynamic variants move monotonically with the phase u ∈ [0, 1];
//   · held (isometric) exercises take one anchored pose plus a
//     length-preserving whole-body breathing sway.

export type Pt = { x: number; y: number };

export type Skeleton = {
  head: Pt; neck: Pt; pelvis: Pt;
  elbowF: Pt; handF: Pt; kneeF: Pt; footF: Pt; // far side of the body
  elbowN: Pt; handN: Pt; kneeN: Pt; footN: Pt; // near side of the body
  face: number;     // face marker offset (head turns), px along +x
  faceY: number;    // face marker vertical offset (nods), px
  handOpen: number; // hand "openness" for grip work, 0..1
  breath: number;   // ribcage expansion for breathing work, 0..1
  spineBow: number; // torso bow (cat-camel / tilts), + = towards sky
};

export type Prop = 'chair' | 'wall' | 'band' | 'weight' | 'step' | 'table';

export type ArchKey =
  | 'hinge' | 'squat' | 'reach' | 'heel-raise' | 'gait'
  | 'wall' | 'four-point' | 'supine' | 'prone' | 'seated';

export type Position = 'standing' | 'seated' | 'lying' | 'four_point';

export type MovingPart = 'handN' | 'footN' | 'head' | 'kneeN' | 'pelvis' | 'handF' | 'footF';

export type Illustration = {
  exerciseId: string;
  key: ArchKey;
  variant: string;
  position: Position;
  label: string;      // human-readable, e.g. "Standing hip hinge"
  moving: MovingPart;
  isHold: boolean;
  range: number;      // movement amplitude multiplier
  props: Prop[];
  frames: Skeleton[]; // exactly FRAME_COUNT, pairwise distinct
};

export type ExerciseLike = {
  id: string; name: string; type: string;
  equipment: string; positionRequired: string;
};

export const FRAME_COUNT = 10;

export const ARCHETYPES: { key: ArchKey; position: Position; label: string }[] = [
  { key: 'hinge', position: 'standing', label: 'Standing hinge' },
  { key: 'squat', position: 'standing', label: 'Standing squat / lunge' },
  { key: 'reach', position: 'standing', label: 'Standing reach / raise' },
  { key: 'heel-raise', position: 'standing', label: 'Standing heel raise / balance' },
  { key: 'gait', position: 'standing', label: 'Stepping / walking' },
  { key: 'wall', position: 'standing', label: 'Wall-supported' },
  { key: 'four-point', position: 'four_point', label: 'Hands & knees' },
  { key: 'supine', position: 'lying', label: 'Lying on your back' },
  { key: 'prone', position: 'lying', label: 'Lying on your front' },
  { key: 'seated', position: 'seated', label: 'Seated' },
];

// ---------------------------------------------------------------- geometry

const RAD = (d: number) => (d * Math.PI) / 180;
const P = (x: number, y: number): Pt => ({ x, y });
const lerpPt = (a: Pt, b: Pt, t: number): Pt => P(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);

// Point at `len` from `from`, `deg` from straight down (0 = down, 90 = +x, 180 = up).
const J = (from: Pt, deg: number, len: number): Pt =>
  P(from.x + len * Math.sin(RAD(deg)), from.y + len * Math.cos(RAD(deg)));

// Two-bone inverse kinematics. Returns the mid joint and a (possibly clamped)
// end point so root→mid→end always measures exactly l1 + l2.
// `bend` = +1 puts the joint on the clockwise side of the root→end axis.
function solve(root: Pt, end: Pt, l1: number, l2: number, bend: number): { mid: Pt; end: Pt } {
  const dx = end.x - root.x, dy = end.y - root.y;
  const d0 = Math.hypot(dx, dy);
  const max = (l1 + l2) * 0.999, min = Math.abs(l1 - l2) * 1.001 + 0.01;
  const d = Math.min(max, Math.max(min, d0));
  const ux = d0 < 1e-6 ? 0 : dx / d0, uy = d0 < 1e-6 ? 1 : dy / d0;
  const e = P(root.x + ux * d, root.y + uy * d);
  const cosA = Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  const a = Math.acos(cosA);
  const base = Math.atan2(e.y - root.y, e.x - root.x);
  const ang = base + bend * a;
  return { mid: P(root.x + l1 * Math.cos(ang), root.y + l1 * Math.sin(ang)), end: e };
}

// Body proportions (viewBox 500 x 240, floor y = 204).
const TORSO = 58, UARM = 30, FARM = 28, THIGH = 36, SHIN = 34, HEAD_R = 16;

const baseSkeleton = (): Skeleton => ({
  head: P(250, 64), neck: P(250, 80), pelvis: P(250, 138),
  elbowF: P(236, 130), handF: P(230, 158), kneeF: P(238, 172), footF: P(236, 204),
  elbowN: P(264, 130), handN: P(270, 158), kneeN: P(262, 172), footN: P(264, 204),
  face: 6, faceY: 0, handOpen: 0.4, breath: 0, spineBow: 0,
});

// Arms hang from the neck (the anatomical shoulder line) — roots coincide with
// the drawn torso endpoints so limb chains measure exactly as drawn.
function hangArms(sk: Skeleton, nearTarget: Pt, farTarget: Pt) {
  const a = solve(sk.neck, nearTarget, UARM, FARM, -1);
  const b = solve(sk.neck, farTarget, UARM, FARM, 1);
  sk.elbowN = a.mid; sk.handN = a.end; sk.elbowF = b.mid; sk.handF = b.end;
}

// Standing figure with feet planted at ±16 around pelvisX.
function standingBase(lean: number, pelvisX = 250): Skeleton {
  const sk = baseSkeleton();
  sk.pelvis = P(pelvisX, 138);
  sk.neck = P(pelvisX + TORSO * Math.sin(RAD(lean)), 138 - TORSO * Math.cos(RAD(lean)));
  const legN = solve(sk.pelvis, P(pelvisX + 16, 204), THIGH, SHIN, 1);
  const legF = solve(sk.pelvis, P(pelvisX - 16, 204), THIGH, SHIN, 1);
  sk.kneeN = legN.mid; sk.footN = legN.end; sk.kneeF = legF.mid; sk.footF = legF.end;
  sk.head = J(sk.neck, 180 + lean * 0.55, HEAD_R + 6);
  hangArms(sk, P(sk.neck.x + 4, sk.neck.y + 55), P(sk.neck.x - 6, sk.neck.y + 53));
  return sk;
}

function seatedBase(): Skeleton {
  const sk = baseSkeleton();
  sk.pelvis = P(272, 164); sk.neck = P(268, 106);
  sk.kneeN = P(318, 168); sk.footN = P(316, 204);
  sk.kneeF = P(312, 172); sk.footF = P(308, 202);
  sk.head = J(sk.neck, 181, HEAD_R + 6);
  hangArms(sk, P(298, 150), P(240, 152));
  return sk;
}

function supineBase(): Skeleton {
  const sk = baseSkeleton();
  sk.head = P(114, 172); sk.neck = P(138, 176); sk.pelvis = P(198, 180);
  const legN = solve(sk.pelvis, P(246, 202), THIGH, SHIN, -1);
  const legF = solve(sk.pelvis, P(240, 203), THIGH, SHIN, -1);
  sk.kneeN = legN.mid; sk.footN = legN.end; sk.kneeF = legF.mid; sk.footF = legF.end;
  hangArms(sk, P(184, 172), P(162, 196));
  sk.face = 10; // face up
  return sk;
}

function proneBase(): Skeleton {
  const sk = baseSkeleton();
  sk.head = P(112, 182); sk.neck = P(136, 184); sk.pelvis = P(196, 186);
  const legN = solve(sk.pelvis, P(266, 194), THIGH, SHIN, -1);
  const legF = solve(sk.pelvis, P(260, 196), THIGH, SHIN, -1);
  sk.kneeN = legN.mid; sk.footN = legN.end; sk.kneeF = legF.mid; sk.footF = legF.end;
  hangArms(sk, P(162, 200), P(122, 198));
  sk.face = 8; sk.faceY = 4; // face turned to the side
  return sk;
}

function fourPointBase(): Skeleton {
  const sk = baseSkeleton();
  sk.head = P(152, 128); sk.neck = P(174, 138); sk.pelvis = P(312, 140);
  sk.kneeN = P(310, 190); sk.footN = P(344, 198);
  sk.kneeF = P(304, 192); sk.footF = P(336, 200);
  hangArms(sk, P(172, 190), P(164, 192));
  sk.face = 10; sk.faceY = 2;
  return sk;
}

// ------------------------------------------------------------- the variants

type Spec = {
  key: ArchKey; variant: string; position: Position; label: string;
  moving: MovingPart; isHold?: boolean; range?: number; props?: Prop[];
};

function buildPose(spec: Spec, u: number): Skeleton {
  const v = spec.variant;
  switch (v) {
    // ---- standing · hinge family ------------------------------------------
    case 'hinge': {
      const lean = 52 * u;
      const sk = standingBase(lean, 250 - 20 * u);
      sk.pelvis = P(250 - 20 * u, 138 + 8 * u);
      sk.neck = P(sk.pelvis.x + TORSO * Math.sin(RAD(lean)), sk.pelvis.y - TORSO * Math.cos(RAD(lean)));
      const legN = solve(sk.pelvis, P(268, 204), THIGH, SHIN, 1);
      const legF = solve(sk.pelvis, P(232, 204), THIGH, SHIN, 1);
      sk.kneeN = legN.mid; sk.footN = legN.end; sk.kneeF = legF.mid; sk.footF = legF.end;
      sk.head = J(sk.neck, 180 + lean * 0.5, HEAD_R + 6);
      hangArms(sk, P(sk.neck.x - 2, sk.neck.y + 57), P(sk.neck.x - 10, sk.neck.y + 55));
      return sk;
    }
    case 'hinge-back': {
      const sk = standingBase(-32 * u, 250 + 6 * u);
      hangArms(sk, P(sk.pelvis.x + 12, sk.pelvis.y + 4), P(sk.pelvis.x + 4, sk.pelvis.y + 6));
      sk.face = 6 + 5 * u; sk.faceY = 2 * u;
      return sk;
    }
    case 'pendulum': {
      const sk = standingBase(34, 244);
      const swing = -26 + 52 * u;
      const armN = solve(sk.neck, J(sk.neck, swing, UARM + FARM - 2), UARM, FARM, -1);
      sk.elbowN = armN.mid; sk.handN = armN.end;
      const armF = solve(sk.neck, P(sk.kneeF.x + 6, sk.kneeF.y - 8), UARM, FARM, 1);
      sk.elbowF = armF.mid; sk.handF = armF.end;
      return sk;
    }
    case 'rest': {
      const sk = standingBase(2);
      sk.breath = 0.45;
      return sk;
    }

    // ---- standing · squat family -------------------------------------------
    case 'squat': case 'squat-mini': {
      const depth = v === 'squat-mini' ? 0.55 * u : u;
      const sk = standingBase(12 + 16 * depth, 250 - 5 * depth);
      sk.pelvis = P(250 - 5 * depth, 138 + 40 * depth);
      sk.neck = P(sk.pelvis.x + TORSO * Math.sin(RAD(12 + 16 * depth)), sk.pelvis.y - TORSO * Math.cos(RAD(12 + 16 * depth)));
      const legN = solve(sk.pelvis, P(268, 204), THIGH, SHIN, 1);
      const legF = solve(sk.pelvis, P(234, 204), THIGH, SHIN, 1);
      sk.kneeN = legN.mid; sk.footN = legN.end; sk.kneeF = legF.mid; sk.footF = legF.end;
      sk.head = J(sk.neck, 178, HEAD_R + 6);
      hangArms(sk, P(sk.neck.x + 46 * depth + 6, sk.neck.y + 25 + 26 * depth), P(sk.neck.x - 2, sk.neck.y + 55));
      return sk;
    }
    case 'squat-split': {
      const sk = standingBase(8, 252);
      sk.pelvis = P(252, 142 + 20 * u);
      sk.neck = P(252 + TORSO * Math.sin(RAD(6)), 142 + 20 * u - TORSO * Math.cos(RAD(6)));
      const legN = solve(sk.pelvis, P(282, 204), THIGH, SHIN, 1); // front leg
      const legF = solve(sk.pelvis, P(218, 200), THIGH, SHIN, -1); // back leg
      sk.kneeN = legN.mid; sk.footN = legN.end; sk.kneeF = legF.mid; sk.footF = legF.end;
      sk.head = J(sk.neck, 180, HEAD_R + 6);
      hangArms(sk, P(sk.neck.x + 20 * u + 4, sk.neck.y + 37), P(sk.neck.x - 6, sk.neck.y + 53));
      return sk;
    }
    case 'sit-to-stand': {
      const sk = standingBase(16 - 14 * u, 244 + 6 * u);
      sk.pelvis = P(244 + 6 * u, 166 - 28 * u);
      sk.neck = P(sk.pelvis.x + TORSO * Math.sin(RAD(16 - 14 * u)), sk.pelvis.y - TORSO * Math.cos(RAD(16 - 14 * u)));
      const legN = solve(sk.pelvis, P(270, 204), THIGH, SHIN, 1);
      const legF = solve(sk.pelvis, P(230, 204), THIGH, SHIN, 1);
      sk.kneeN = legN.mid; sk.footN = legN.end; sk.kneeF = legF.mid; sk.footF = legF.end;
      sk.head = J(sk.neck, 180, HEAD_R + 6);
      hangArms(sk, P(sk.neck.x + 26 - 22 * u, sk.neck.y + 41 - 10 * u), P(sk.neck.x - 4, sk.neck.y + 55));
      return sk;
    }

    // ---- standing · reach / raise family ------------------------------------
    case 'arm-over': {
      const sk = standingBase(-2 - 3 * u, 250 - 3 * u);
      const armN = solve(sk.neck, J(sk.neck, 10 + 148 * u, UARM + FARM - 4), UARM, FARM, -1);
      sk.elbowN = armN.mid; sk.handN = armN.end;
      const armF = solve(sk.neck, J(sk.neck, 8 + 88 * u, UARM + FARM - 6), UARM, FARM, 1);
      sk.elbowF = armF.mid; sk.handF = armF.end;
      sk.face = 6 + 4 * u; sk.faceY = -2 * u;
      return sk;
    }
    case 'arm-scap': {
      const sk = standingBase(-2, 250);
      const armN = solve(sk.neck, J(sk.neck, 14 + 128 * u, UARM + FARM - 4), UARM, FARM, -1);
      sk.elbowN = armN.mid; sk.handN = armN.end;
      const armF = solve(sk.neck, J(sk.neck, 10 + 76 * u, UARM + FARM - 6), UARM, FARM, 1);
      sk.elbowF = armF.mid; sk.handF = armF.end;
      return sk;
    }
    case 'arm-row': {
      const sk = standingBase(16 + 6 * u, 246);
      hangArms(sk, P(sk.neck.x + 46 - 52 * u, sk.neck.y + 13 + 6 * u), P(sk.neck.x + 38 - 46 * u, sk.neck.y + 17 + 6 * u));
      return sk;
    }
    case 'arm-pull-apart': {
      const sk = standingBase(2, 250);
      const armN = solve(sk.neck, P(sk.neck.x + 40 - 62 * u, sk.neck.y + 10), UARM, FARM, -1);
      sk.elbowN = armN.mid; sk.handN = armN.end;
      const armF = solve(sk.neck, P(sk.neck.x - 26 - 42 * u, sk.neck.y + 14), UARM, FARM, 1);
      sk.elbowF = armF.mid; sk.handF = armF.end;
      return sk;
    }
    case 'arm-ext-rot': {
      const sk = standingBase(0, 250);
      const elb = P(sk.neck.x + 3, sk.neck.y + 26); // elbow tucked at the side
      sk.elbowN = elb;
      sk.handN = J(elb, -6 + 62 * u, FARM);
      const armF = solve(sk.neck, P(sk.neck.x - 6, sk.neck.y + 54), UARM, FARM, 1);
      sk.elbowF = armF.mid; sk.handF = armF.end;
      return sk;
    }
    case 'chest-open': {
      const sk = standingBase(-8 * u, 250);
      hangArms(sk, P(sk.neck.x - 30 * u + 8, sk.neck.y + 23 - 8 * u), P(sk.neck.x - 26 * u - 2, sk.neck.y + 27 - 6 * u));
      sk.breath = 0.4 + 0.3 * u;
      return sk;
    }
    case 'leg-raise': {
      const sk = standingBase(-4 * u, 252);
      const legN = solve(sk.pelvis, J(sk.pelvis, 8 + 52 * u, THIGH + SHIN - 2), THIGH, SHIN, -1);
      sk.kneeN = legN.mid; sk.footN = legN.end;
      hangArms(sk, P(sk.pelvis.x + 6, sk.pelvis.y + 2), P(sk.pelvis.x - 4, sk.pelvis.y + 4));
      return sk;
    }
    case 'leg-back': {
      const sk = standingBase(4 * u, 250);
      const legN = solve(sk.pelvis, J(sk.pelvis, -4 - 46 * u, THIGH + SHIN - 2), THIGH, SHIN, 1);
      sk.kneeN = legN.mid; sk.footN = legN.end;
      hangArms(sk, P(sk.neck.x + 6, sk.neck.y + 49 - 16 * u), P(sk.neck.x - 6, sk.neck.y + 53));
      return sk;
    }
    case 'shoulder-roll': {
      const sk = standingBase(1, 250);
      const lift = u;
      sk.neck = P(sk.neck.x, sk.neck.y - 19 * lift);
      sk.head = P(sk.head.x, sk.head.y - 19 * lift);
      const armN = solve(sk.neck, P(sk.neck.x + 6, sk.neck.y + 50), UARM, FARM, -1);
      sk.elbowN = armN.mid; sk.handN = armN.end;
      const armF = solve(sk.neck, P(sk.neck.x - 6, sk.neck.y + 52), UARM, FARM, 1);
      sk.elbowF = armF.mid; sk.handF = armF.end;
      return sk;
    }
    case 'neck-turn': {
      const sk = standingBase(1, 250);
      sk.head = P(sk.head.x + 19 * u, sk.head.y - 3 * u);
      sk.face = 6 + 12 * u; sk.faceY = -1 * u;
      return sk;
    }
    case 'neck-nod': {
      const sk = standingBase(1, 250);
      sk.head = P(sk.head.x + 7 * u, sk.head.y + 17.5 * u);
      sk.faceY = 9 * u;
      return sk;
    }
    case 'neck-tuck': {
      const sk = standingBase(1, 250);
      sk.head = P(sk.head.x - 14 * u, sk.head.y + 3 * u);
      sk.face = 6 - 6 * u; sk.faceY = 2 * u;
      return sk;
    }

    // ---- standing · heel raise / gait ---------------------------------------
    case 'calf-raise': {
      const sk = standingBase(1, 250);
      const rise = 13 * u;
      sk.pelvis = P(250, 138 - rise); sk.neck = P(250, 80 - rise); sk.head = P(250, 64 - rise);
      const legN = solve(sk.pelvis, P(262, 204 - 12 * u), THIGH, SHIN, 1);
      const legF = solve(sk.pelvis, P(238, 204 - 12 * u), THIGH, SHIN, 1);
      sk.kneeN = legN.mid; sk.footN = legN.end; sk.kneeF = legF.mid; sk.footF = legF.end;
      hangArms(sk, P(sk.neck.x + 4, sk.neck.y + 55), P(sk.neck.x - 6, sk.neck.y + 53));
      return sk;
    }
    case 'calf-balance': {
      const sk = standingBase(0, 250);
      const sway = 6 * (u - 0.5);
      sk.pelvis = P(250 + sway, 138); sk.neck = P(250 + sway, 80); sk.head = P(250 + sway, 64);
      const legN = solve(sk.pelvis, P(264, 204), THIGH, SHIN, 1);
      const legF = solve(sk.pelvis, P(240, 172), THIGH, SHIN, -1); // far foot lifted
      sk.kneeN = legN.mid; sk.footN = legN.end; sk.kneeF = legF.mid; sk.footF = legF.end;
      hangArms(sk, P(sk.neck.x + 10 + 14 * u, sk.neck.y + 26 + 10 * u), P(sk.neck.x - 6, sk.neck.y + 53));
      return sk;
    }
    case 'walk': case 'carry': {
      const sk = standingBase(4, 250);
      sk.pelvis = P(250, 134);
      sk.neck = P(250 + TORSO * Math.sin(RAD(4)), 134 - TORSO * Math.cos(RAD(4)));
      sk.head = J(sk.neck, 178, HEAD_R + 6);
      const A = -30 + 60 * u;
      sk.kneeN = J(sk.pelvis, A * 0.75, THIGH); sk.footN = J(sk.kneeN, A * 1.25, SHIN);
      sk.kneeF = J(sk.pelvis, -A * 0.75, THIGH); sk.footF = J(sk.kneeF, -A * 1.25, SHIN);
      sk.elbowN = J(sk.neck, -A * 0.85, UARM); sk.handN = J(sk.elbowN, -A * 0.85 + 12, FARM);
      sk.elbowF = J(sk.neck, A * 0.85, UARM); sk.handF = J(sk.elbowF, A * 0.85 + 12, FARM);
      return sk;
    }
    case 'step-up': {
      const sk = standingBase(8, 266 + 38 * u);
      sk.pelvis = P(266 + 38 * u, 138 - 14 * u);
      sk.neck = P(sk.pelvis.x + TORSO * Math.sin(RAD(6)), sk.pelvis.y - TORSO * Math.cos(RAD(6)));
      const legN = solve(sk.pelvis, lerpPt(P(288, 204), P(330, 184), u), THIGH, SHIN, 1);
      const legF = solve(sk.pelvis, lerpPt(P(244, 204), P(318, 186), u), THIGH, SHIN, -1);
      sk.kneeN = legN.mid; sk.footN = legN.end; sk.kneeF = legF.mid; sk.footF = legF.end;
      sk.head = J(sk.neck, 180, HEAD_R + 6);
      hangArms(sk, P(sk.neck.x + 8 + 16 * u, sk.neck.y + 37 - 8 * u), P(sk.neck.x - 6, sk.neck.y + 53));
      return sk;
    }
    case 'thoracic-rotate': {
      const sk = standingBase(0, 250);
      sk.elbowN = J(sk.neck, 60 + 50 * u, UARM); sk.handN = J(sk.elbowN, 150 - 40 * u, FARM);
      sk.elbowF = J(sk.neck, -30 - 40 * u, UARM); sk.handF = J(sk.elbowF, -120 + 30 * u, FARM);
      sk.face = 6 + 10 * u;
      return sk;
    }

    // ---- wall -----------------------------------------------------------------
    case 'wall-press': {
      const sk = baseSkeleton();
      const shX = 208 - 22 * u, shY = 98;
      const ankleN = P(252, 204), ankleF = P(230, 204);
      const pelvis = lerpPt(ankleN, P(shX, shY), 0.52);
      sk.pelvis = pelvis;
      sk.neck = P(shX, shY);
      const legN = solve(sk.pelvis, ankleN, THIGH, SHIN, 1);
      const legF = solve(sk.pelvis, ankleF, THIGH, SHIN, 1);
      sk.kneeN = legN.mid; sk.footN = legN.end; sk.kneeF = legF.mid; sk.footF = legF.end;
      const armN = solve(sk.neck, P(152, 104), UARM, FARM, 1);
      sk.elbowN = armN.mid; sk.handN = armN.end;
      const armF = solve(sk.neck, P(158, 112), UARM, FARM, 1);
      sk.elbowF = armF.mid; sk.handF = armF.end;
      sk.head = P(shX - 22, shY - 16);
      sk.face = -8; sk.faceY = -2;
      return sk;
    }
    case 'wall-slide': {
      const sk = standingBase(-2, 352);
      const legN = solve(sk.pelvis, P(372, 204), THIGH, SHIN, 1);
      const legF = solve(sk.pelvis, P(346, 204), THIGH, SHIN, 1);
      sk.kneeN = legN.mid; sk.footN = legN.end; sk.kneeF = legF.mid; sk.footF = legF.end;
      const armN = solve(sk.neck, P(384, 118 - 58 * u), UARM, FARM, 1);
      sk.elbowN = armN.mid; sk.handN = armN.end;
      const armF = solve(sk.neck, P(380, 124 - 50 * u), UARM, FARM, 1);
      sk.elbowF = armF.mid; sk.handF = armF.end;
      return sk;
    }

    // ---- four-point --------------------------------------------------------------
    case 'bird-dog': {
      const sk = fourPointBase();
      const armN = solve(sk.neck, lerpPt(P(172, 190), P(140, 162), u), UARM, FARM, -1);
      sk.elbowN = armN.mid; sk.handN = armN.end;
      const legN = solve(sk.pelvis, lerpPt(P(344, 198), P(372, 166), u), THIGH, SHIN, -1);
      sk.kneeN = legN.mid; sk.footN = legN.end;
      return sk;
    }
    case 'cat-camel': {
      const sk = fourPointBase();
      sk.neck = P(174, 138 - 16 * u);
      sk.head = P(152, 128 - 20 * u);
      sk.spineBow = -26 * u;
      const armN = solve(sk.neck, P(172, 190), UARM, FARM, 1);
      sk.elbowN = armN.mid; sk.handN = armN.end;
      const armF = solve(sk.neck, P(164, 192), UARM, FARM, 1);
      sk.elbowF = armF.mid; sk.handF = armF.end;
      return sk;
    }

    // ---- supine ---------------------------------------------------------------------
    case 'supine-breath': {
      const sk = supineBase();
      sk.breath = 0.8;
      sk.handN = P(sk.handN.x, sk.handN.y - 8);
      sk.handF = P(sk.handF.x, sk.handF.y - 6);
      return sk;
    }
    case 'supine-tilt': {
      const sk = supineBase();
      sk.pelvis = P(198, 180 - 20 * u);
      sk.spineBow = -18 * u;
      const legN = solve(sk.pelvis, P(246, 202), THIGH, SHIN, -1);
      const legF = solve(sk.pelvis, P(240, 203), THIGH, SHIN, -1);
      sk.kneeN = legN.mid; sk.footN = legN.end; sk.kneeF = legF.mid; sk.footF = legF.end;
      return sk;
    }
    case 'supine-rocks': {
      const sk = supineBase();
      const legN = solve(sk.pelvis, P(sk.footN.x - 18 * u, sk.footN.y + 12 * u - 8 * u * u), THIGH, SHIN, -1);
      sk.kneeN = legN.mid; sk.footN = legN.end;
      return sk;
    }
    case 'bridge': {
      const sk = supineBase();
      sk.pelvis = P(198, 180 - 24 * u);
      const legN = solve(sk.pelvis, P(248, 202), THIGH, SHIN, -1);
      const legF = solve(sk.pelvis, P(242, 203), THIGH, SHIN, -1);
      sk.kneeN = legN.mid; sk.footN = legN.end; sk.kneeF = legF.mid; sk.footF = legF.end;
      return sk;
    }
    case 'heel-slide': {
      const sk = supineBase();
      const legN = solve(sk.pelvis, P(202 + 58 * u, 202), THIGH, SHIN, -1);
      sk.kneeN = legN.mid; sk.footN = legN.end;
      return sk;
    }
    case 'arm-sweep': {
      const sk = supineBase();
      const armN = solve(sk.neck, J(sk.neck, 75 + 118 * u, UARM + FARM - 4), UARM, FARM, 1);
      sk.elbowN = armN.mid; sk.handN = armN.end;
      sk.face = 10 + 8 * u;
      return sk;
    }

    // ---- prone -----------------------------------------------------------------------
    case 'prone-extend': {
      const sk = proneBase();
      sk.head = P(108, 182 - 26 * u);
      sk.neck = P(134, 184 - 20 * u);
      sk.spineBow = 14 * u;
      hangArms(sk, P(150, 202 - 10 * u), P(122, 198));
      return sk;
    }
    case 'prone-lift': {
      const sk = proneBase();
      const armN = solve(sk.neck, J(sk.neck, 82 + 118 * u, UARM + FARM - 4), UARM, FARM, 1);
      sk.elbowN = armN.mid; sk.handN = armN.end;
      return sk;
    }

    // ---- seated -------------------------------------------------------------------------
    case 'seated-rotate': {
      const sk = seatedBase();
      sk.elbowN = J(sk.neck, 60 + 45 * u, UARM); sk.handN = J(sk.elbowN, 140 - 50 * u, FARM);
      sk.elbowF = J(sk.neck, -35 - 40 * u, UARM); sk.handF = J(sk.elbowF, -130 + 40 * u, FARM);
      sk.face = 6 + 10 * u;
      return sk;
    }
    case 'seated-extend': {
      const sk = seatedBase();
      sk.neck = P(260 - 8 * u, 104 - 2 * u); sk.head = P(254 - 14 * u, 60 - 6 * u);
      sk.breath = 0.3 + 0.4 * u;
      hangArms(sk, P(sk.neck.x + 2 - 16 * u, sk.neck.y + 27), P(sk.neck.x - 28, sk.neck.y + 46));
      return sk;
    }
    case 'seated-hip-rotate': {
      const sk = seatedBase();
      sk.elbowN = J(sk.neck, 55 + 45 * u, UARM); sk.handN = J(sk.elbowN, 145 - 45 * u, FARM);
      sk.face = 6 + 10 * u;
      return sk;
    }
    case 'seated-knee': {
      const sk = seatedBase();
      sk.kneeN = P(318, 168);
      sk.footN = J(sk.kneeN, 2 + 82 * u, SHIN);
      return sk;
    }
    case 'seated-ankle': {
      const sk = seatedBase();
      sk.kneeN = P(318, 168);
      sk.footN = J(sk.kneeN, 8 - 40 * u, SHIN);
      return sk;
    }
    case 'seated-forearm': {
      const sk = seatedBase();
      const elb = P(300, 150);
      sk.elbowN = elb;
      sk.handN = J(elb, 64 - 58 * u, FARM);
      return sk;
    }
    case 'seated-hand': {
      const sk = seatedBase();
      const elb = P(300, 150);
      sk.elbowN = elb;
      sk.handN = J(elb, 74 + 40 * u, FARM);
      sk.handOpen = 0.25 + 0.6 * u;
      return sk;
    }
    case 'elbow-curl': {
      const sk = seatedBase();
      const elb = P(284, 142);
      sk.elbowN = elb;
      sk.handN = J(elb, 8 + 128 * u, FARM);
      return sk;
    }
    case 'table-slide': {
      const sk = seatedBase();
      const armN = solve(sk.neck, P(300 + 44 * u, 148), UARM, FARM, -1);
      sk.elbowN = armN.mid; sk.handN = armN.end;
      return sk;
    }
    case 'seated-neck-turn': {
      const sk = seatedBase();
      sk.head = P(sk.head.x + 19 * u, sk.head.y - 3 * u);
      sk.face = 6 + 12 * u;
      return sk;
    }
    case 'seated-neck-nod': {
      const sk = seatedBase();
      sk.head = P(sk.head.x + 7 * u, sk.head.y + 17.5 * u);
      sk.faceY = 9 * u;
      return sk;
    }
    case 'seated-neck-tuck': {
      const sk = seatedBase();
      sk.head = P(sk.head.x - 14 * u, sk.head.y + 3 * u);
      sk.face = 6 - 6 * u; sk.faceY = 2 * u;
      return sk;
    }
    case 'seated-shoulder-roll': {
      const sk = seatedBase();
      sk.neck = P(sk.neck.x, sk.neck.y - 12 * u); sk.head = P(sk.head.x, sk.head.y - 19 * u);
      hangArms(sk, P(298, 150), P(240, 152));
      return sk;
    }
    default: {
      return standingBase(2);
    }
  }
}

// --------------------------------------------------------------- the mapping

type Rule = { re: RegExp; spec: Spec };

const rules: Rule[] = [
  // four-point
  { re: /bird dog/i, spec: { key: 'four-point', variant: 'bird-dog', position: 'four_point', label: 'Hands & knees · opposite arm & leg', moving: 'handN' } },
  { re: /cat|camel/i, spec: { key: 'four-point', variant: 'cat-camel', position: 'four_point', label: 'Hands & knees · spine round & lengthen', moving: 'head' } },
  // lying, specific
  { re: /belly breathing|rib breathing/i, spec: { key: 'supine', variant: 'supine-breath', position: 'lying', label: 'Lying · supported breathing', moving: 'pelvis', isHold: true, range: 0.6 } },
  { re: /pelvic tilt/i, spec: { key: 'supine', variant: 'supine-tilt', position: 'lying', label: 'Lying · gentle pelvic rocking', moving: 'pelvis', range: 0.7 } },
  { re: /knee rock/i, spec: { key: 'supine', variant: 'supine-rocks', position: 'lying', label: 'Lying · knees rocking gently', moving: 'footN', range: 0.7 } },
  { re: /back extension/i, spec: { key: 'prone', variant: 'prone-extend', position: 'lying', label: 'Lying on your front · gentle extension', moving: 'head' } },
  { re: /abdominal brace/i, spec: { key: 'supine', variant: 'supine-breath', position: 'lying', label: 'Lying · gentle abdominal support', moving: 'pelvis', isHold: true, range: 0.5 } },
  { re: /heel slide/i, spec: { key: 'supine', variant: 'heel-slide', position: 'lying', label: 'Lying · heel sliding', moving: 'footN' } },
  { re: /bridge/i, spec: { key: 'supine', variant: 'bridge', position: 'lying', label: 'Lying · hip lift', moving: 'pelvis' } },
  { re: /prone arm lift/i, spec: { key: 'prone', variant: 'prone-lift', position: 'lying', label: 'Lying on your front · arm lift', moving: 'handN' } },
  // standing, specific
  { re: /suitcase carry|farmer carry/i, spec: { key: 'gait', variant: 'carry', position: 'standing', label: 'Walking with a steady load', moving: 'footN', props: ['weight'] } },
  { re: /step up|step down|stair/i, spec: { key: 'gait', variant: 'step-up', position: 'standing', label: 'Stepping up & down', moving: 'footN', props: ['step'] } },
  { re: /split squat|lunge/i, spec: { key: 'squat', variant: 'squat-split', position: 'standing', label: 'Split stance · controlled lowering', moving: 'pelvis' } },
  { re: /sit to stand|chair squat/i, spec: { key: 'squat', variant: 'sit-to-stand', position: 'standing', label: 'Sit to stand', moving: 'pelvis', props: ['chair'] } },
  { re: /calf raise|heel raise|heel lowering|^calf/i, spec: { key: 'heel-raise', variant: 'calf-raise', position: 'standing', label: 'Rising onto the toes', moving: 'pelvis' } },
  { re: /balance/i, spec: { key: 'heel-raise', variant: 'calf-balance', position: 'standing', label: 'Steady single-leg balance', moving: 'handN', isHold: true, range: 0.8 } },
  { re: /hip hinge/i, spec: { key: 'hinge', variant: 'hinge', position: 'standing', label: 'Standing hip hinge', moving: 'pelvis' } },
  { re: /hip roll/i, spec: { key: 'hinge', variant: 'hinge-back', position: 'standing', label: 'Standing · gentle hip rolling', moving: 'head', range: 0.7 } },
  { re: /gluteal squeeze/i, spec: { key: 'hinge', variant: 'rest', position: 'standing', label: 'Standing · gentle squeeze', moving: 'pelvis', isHold: true, range: 0.35 } },
  { re: /abduction/i, spec: { key: 'reach', variant: 'leg-raise', position: 'standing', label: 'Standing leg lift', moving: 'footN' } },
  { re: /pendulum/i, spec: { key: 'hinge', variant: 'pendulum', position: 'standing', label: 'Leaning · arm swinging gently', moving: 'handN' } },
  { re: /overhead press|overhead reach/i, spec: { key: 'reach', variant: 'arm-over', position: 'standing', label: 'Standing · reaching overhead', moving: 'handN' } },
  { re: /scaption/i, spec: { key: 'reach', variant: 'arm-scap', position: 'standing', label: 'Standing · diagonal raise', moving: 'handN' } },
  { re: /arm elevation|assisted arm/i, spec: { key: 'reach', variant: 'arm-over', position: 'standing', label: 'Standing · assisted elevation', moving: 'handN', range: 0.7 } },
  { re: /pull apart/i, spec: { key: 'reach', variant: 'arm-pull-apart', position: 'standing', label: 'Standing · arms drawing apart', moving: 'handN', props: ['band'] } },
  { re: /external rotation/i, spec: { key: 'reach', variant: 'arm-ext-rot', position: 'standing', label: 'Standing · outward rotation', moving: 'handN' } },
  { re: /row/i, spec: { key: 'reach', variant: 'arm-row', position: 'standing', label: 'Standing · drawing back', moving: 'handN', props: ['band'] } },
  { re: /chest opening/i, spec: { key: 'reach', variant: 'chest-open', position: 'standing', label: 'Standing · chest opening', moving: 'handN' } },
  { re: /shoulder roll/i, spec: { key: 'reach', variant: 'shoulder-roll', position: 'standing', label: 'Gentle shoulder rolls', moving: 'head' } },
  { re: /shoulder blade setting/i, spec: { key: 'reach', variant: 'chest-open', position: 'standing', label: 'Shoulder blades settling', moving: 'handN', isHold: true, range: 0.4 } },
  { re: /thoracic rotation|rotation press|open book/i, spec: { key: 'gait', variant: 'thoracic-rotate', position: 'standing', label: 'Standing · upper-back rotation', moving: 'handN' } },
  { re: /chin tuck/i, spec: { key: 'reach', variant: 'neck-tuck', position: 'standing', label: 'Gentle chin tuck', moving: 'head' } },
  { re: /chin nod/i, spec: { key: 'reach', variant: 'neck-nod', position: 'standing', label: 'Gentle chin nod', moving: 'head' } },
  { re: /neck turn|neck rotation/i, spec: { key: 'reach', variant: 'neck-turn', position: 'standing', label: 'Head turning gently', moving: 'head' } },
  { re: /wall slide|angel/i, spec: { key: 'wall', variant: 'wall-slide', position: 'standing', label: 'Back to the wall · arms sliding', moving: 'handN', props: ['wall'] } },
  { re: /wall push|incline push|incline wall/i, spec: { key: 'wall', variant: 'wall-press', position: 'standing', label: 'Hands on the wall · gentle press', moving: 'head', props: ['wall'] } },
  { re: /rest$/i, spec: { key: 'hinge', variant: 'rest', position: 'standing', label: 'Supported resting position', moving: 'pelvis', isHold: true, range: 0.15 } },
  { re: /knee extension hold/i, spec: { key: 'reach', variant: 'leg-raise', position: 'standing', label: 'Supported leg extension', moving: 'footN', isHold: true, range: 0.7 } },
  { re: /slow knee extension/i, spec: { key: 'reach', variant: 'leg-raise', position: 'standing', label: 'Supported leg extension', moving: 'footN' } },
  { re: /quadriceps squeeze/i, spec: { key: 'squat', variant: 'squat-mini', position: 'standing', label: 'Standing · thigh gently working', moving: 'kneeN', isHold: true, range: 0.3 } },
  { re: /mini squat/i, spec: { key: 'squat', variant: 'squat-mini', position: 'standing', label: 'Small squat', moving: 'pelvis' } },
  // seated, specific
  { re: /table slide/i, spec: { key: 'seated', variant: 'table-slide', position: 'seated', label: 'Seated · arm sliding forward', moving: 'handN', props: ['table'] } },
  { re: /seated knee/i, spec: { key: 'seated', variant: 'seated-knee', position: 'seated', label: 'Seated · knee bending & lengthening', moving: 'footN', props: ['chair'] } },
  { re: /seated calf|seated heel/i, spec: { key: 'seated', variant: 'seated-ankle', position: 'seated', label: 'Seated · heel rising', moving: 'footN', props: ['chair'] } },
  { re: /ankle pump|ankle circle|toe spread|ankle eversion/i, spec: { key: 'seated', variant: 'seated-ankle', position: 'seated', label: 'Seated · ankle moving gently', moving: 'footN' } },
  { re: /hand opening|thumb|pinch|towel grip/i, spec: { key: 'seated', variant: 'seated-hand', position: 'seated', label: 'Seated · hand & fingers', moving: 'handN' } },
  { re: /wrist|forearm/i, spec: { key: 'seated', variant: 'seated-forearm', position: 'seated', label: 'Seated · wrist & forearm', moving: 'handN' } },
  { re: /seated hip rotation/i, spec: { key: 'seated', variant: 'seated-hip-rotate', position: 'seated', label: 'Seated · hip turning', moving: 'handN', props: ['chair'] } },
  { re: /seated rotation|gentle rotation/i, spec: { key: 'seated', variant: 'seated-rotate', position: 'seated', label: 'Seated · upper-back rotation', moving: 'handN', props: ['chair'] } },
  { re: /seated thoracic extension/i, spec: { key: 'seated', variant: 'seated-extend', position: 'seated', label: 'Seated · upper-back lengthening', moving: 'head', props: ['chair'] } },
  { re: /seated shoulder roll/i, spec: { key: 'seated', variant: 'seated-shoulder-roll', position: 'seated', label: 'Seated shoulder rolls', moving: 'head', props: ['chair'] } },
  { re: /seated neck rotation/i, spec: { key: 'seated', variant: 'seated-neck-turn', position: 'seated', label: 'Seated · head turning', moving: 'head', props: ['chair'] } },
];

// Name-driven standing variants that must render seated when the exercise's
// recorded position is seated (the dataset has a few crossover names).
const toSeated: Record<string, { variant: string; moving?: MovingPart }> = {
  'neck-turn': { variant: 'seated-neck-turn' },
  'neck-nod': { variant: 'seated-neck-nod' },
  'neck-tuck': { variant: 'seated-neck-tuck' },
  'shoulder-roll': { variant: 'seated-shoulder-roll' },
  'calf-raise': { variant: 'seated-ankle', moving: 'footN' },
};

function defaultSpec(e: ExerciseLike): Spec {
  if (e.positionRequired === 'four_point') return { key: 'four-point', variant: 'bird-dog', position: 'four_point', label: 'Hands & knees', moving: 'handN' };
  if (e.positionRequired === 'lying') return { key: 'supine', variant: 'supine-breath', position: 'lying', label: 'Lying comfortably', moving: 'pelvis', isHold: true, range: 0.6 };
  if (e.positionRequired === 'seated') {
    const fam = e.id.split('-')[0];
    if (fam === 'neck') return { key: 'seated', variant: 'seated-neck-turn', position: 'seated', label: 'Seated · head movement', moving: 'head' };
    if (fam === 'elbow') return { key: 'seated', variant: 'seated-forearm', position: 'seated', label: 'Seated · wrist & forearm', moving: 'handN' };
    if (fam === 'knee') return { key: 'seated', variant: 'seated-knee', position: 'seated', label: 'Seated · knee movement', moving: 'footN' };
    if (fam === 'ankle') return { key: 'seated', variant: 'seated-ankle', position: 'seated', label: 'Seated · ankle movement', moving: 'footN' };
    return { key: 'seated', variant: 'seated-rotate', position: 'seated', label: 'Seated · controlled movement', moving: 'handN' };
  }
  // standing
  if (e.equipment === 'wall') return { key: 'wall', variant: 'wall-press', position: 'standing', label: 'Wall-supported movement', moving: 'head', props: ['wall'] };
  const fam = e.id.split('-')[0] === 'lower' ? 'lower-back' : e.id.split('-')[0] === 'upper' ? 'upper-back' : e.id.split('-')[0];
  if (fam === 'ankle') return { key: 'heel-raise', variant: 'calf-raise', position: 'standing', label: 'Rising onto the toes', moving: 'pelvis' };
  if (fam === 'knee' || fam === 'hip') return { key: 'squat', variant: 'squat', position: 'standing', label: 'Controlled squatting', moving: 'pelvis' };
  if (fam === 'shoulder' || fam === 'neck') return { key: 'reach', variant: 'arm-over', position: 'standing', label: 'Controlled reaching', moving: 'handN' };
  return { key: 'hinge', variant: 'hinge', position: 'standing', label: 'Standing hip hinge', moving: 'pelvis' };
}

// Strictly increasing phase samples → 10 pairwise-distinct monotonic poses.
const PHASES = [0, 0.13, 0.26, 0.38, 0.5, 0.61, 0.72, 0.82, 0.92, 1];

// Held exercises: one anchored pose + a length-preserving whole-body sway.
// The sway is a pure translation (plus a free head bob and a breath pulse),
// so limb segment lengths are untouched while every frame stays distinct.
const SWAY_Y = Array.from({ length: FRAME_COUNT }, (_, i) => Math.sin(RAD(36 * i + 17)));
const SWAY_X = Array.from({ length: FRAME_COUNT }, (_, i) => Math.sin(RAD(36 * i + 47)));

function cloneSk(sk: Skeleton): Skeleton {
  const c = (p: Pt): Pt => ({ x: p.x, y: p.y });
  return {
    head: c(sk.head), neck: c(sk.neck), pelvis: c(sk.pelvis),
    elbowF: c(sk.elbowF), handF: c(sk.handF), kneeF: c(sk.kneeF), footF: c(sk.footF),
    elbowN: c(sk.elbowN), handN: c(sk.handN), kneeN: c(sk.kneeN), footN: c(sk.footN),
    face: sk.face, faceY: sk.faceY, handOpen: sk.handOpen, breath: sk.breath, spineBow: sk.spineBow,
  };
}

function holdSway(sk: Skeleton, i: number): Skeleton {
  const out = cloneSk(sk);
  const dx = 3 * SWAY_X[i], dy = -3 * SWAY_Y[i];
  const shift = (p: Pt): Pt => P(p.x + dx, p.y + dy);
  out.neck = shift(sk.neck); out.pelvis = shift(sk.pelvis);
  out.elbowF = shift(sk.elbowF); out.handF = shift(sk.handF); out.kneeF = shift(sk.kneeF); out.footF = shift(sk.footF);
  out.elbowN = shift(sk.elbowN); out.handN = shift(sk.handN); out.kneeN = shift(sk.kneeN); out.footN = shift(sk.footN);
  out.head = P(sk.head.x + dx, sk.head.y + dy - 3 * SWAY_Y[i]);
  out.breath = 0.35 + 0.3 * (SWAY_Y[i] + 1) / 2;
  return out;
}

export function illustrationFor(e: ExerciseLike): Illustration {
  const rule = rules.find(r => r.re.test(e.name));
  let spec: Spec = rule ? { ...rule.spec } : defaultSpec(e);

  // Position consistency: adapt crossover names, or fall back to the default
  // spec for the exercise's actual position.
  if (spec.position !== e.positionRequired) {
    const adapted = toSeated[spec.variant];
    if (e.positionRequired === 'seated' && adapted) {
      spec = { ...spec, key: 'seated', variant: adapted.variant, position: 'seated', ...(adapted.moving ? { moving: adapted.moving } : {}) };
    } else {
      spec = defaultSpec(e);
    }
  }
  spec.props = [...(spec.props || [])];

  // Equipment-driven props always apply.
  if (e.equipment === 'chair' && !spec.props.includes('chair')) spec.props.push('chair');
  if (e.equipment === 'wall' && !spec.props.includes('wall')) spec.props.push('wall');
  if (e.equipment === 'band' && !spec.props.includes('band')) spec.props.push('band');
  if (e.equipment === 'weight' && !spec.props.includes('weight')) spec.props.push('weight');
  if (/step|stair/i.test(e.name) && e.positionRequired === 'standing' && !spec.props.includes('step')) spec.props.push('step');

  // Amplitude refinements from the exercise's own wording.
  let range = spec.range ?? 1;
  if (/preparation/i.test(e.name)) range = Math.min(range, 0.5);
  if (/^small|^gentle/i.test(e.name)) range = Math.min(range, 0.65);
  if (/a little more resistance/i.test(e.name)) range = Math.min(1.15, range * 1.15);

  // Holds: isometric type or "hold" wording (but not overhead *press*).
  const isHold = spec.isHold || e.type === 'isometric' || (/hold|press(?! up| up)/i.test(e.name) && !/overhead press/i.test(e.name));

  let frames: Skeleton[];
  if (isHold) {
    const anchor = buildPose(spec, 0.5 * range);
    frames = SWAY_Y.map((_, i) => holdSway(anchor, i));
  } else {
    frames = PHASES.map(u => buildPose(spec, range * u));
  }

  return {
    exerciseId: e.id, key: spec.key, variant: spec.variant, position: spec.position,
    label: spec.label, moving: spec.moving, isHold, range, props: spec.props, frames,
  };
}

// ------------------------------------------------------------------ rendering

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const f = (n: number) => Math.round(n * 10) / 10;
const C = {
  near: '#7c8a62', far: '#b3bfa1', head: '#e6d5bd', headStroke: '#b7a68e',
  floor: '#d6ddc8', floorLine: '#c2cab4', arc: '#98a37f',
  prop: '#c9d2b8', propFill: '#e6ebda', band: '#a9825f', weight: '#6f7a66',
};

function limb(a: Pt, b: Pt, c: Pt, color: string, w: number): string {
  return `<path d="M${f(a.x)} ${f(a.y)}L${f(b.x)} ${f(b.y)}L${f(c.x)} ${f(c.y)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
}

function propsMarkup(spec: Illustration): string {
  let out = '';
  if (spec.props.includes('wall')) {
    const x = spec.variant === 'wall-slide' ? 396 : 142;
    out += `<line x1="${x}" y1="36" x2="${x}" y2="206" stroke="${C.prop}" stroke-width="5"/>`;
    for (let y = 48; y < 200; y += 18) out += `<line x1="${x - 2}" y1="${y}" x2="${x - 12}" y2="${y - 8}" stroke="${C.prop}" stroke-width="2"/>`;
  }
  if (spec.props.includes('chair')) {
    out += `<g stroke="${C.prop}" stroke-width="4" fill="none"><path d="M234 172h92"/><path d="M234 172v-58"/><path d="M238 172l-2 32"/><path d="M322 172l2 32"/></g><rect x="236" y="164" width="84" height="8" rx="2" fill="${C.propFill}"/>`;
  }
  if (spec.props.includes('step')) {
    out += `<rect x="304" y="184" width="96" height="20" rx="3" fill="${C.propFill}" stroke="${C.prop}" stroke-width="3"/>`;
  }
  if (spec.props.includes('table')) {
    out += `<rect x="298" y="152" width="120" height="8" rx="2" fill="${C.propFill}" stroke="${C.prop}" stroke-width="3"/><path d="M406 160v44" stroke="${C.prop}" stroke-width="4"/>`;
  }
  return out;
}

function frontPropsMarkup(spec: Illustration, frame: number): string {
  const sk = spec.frames[frame];
  let out = '';
  if (spec.props.includes('weight')) {
    const h = spec.variant === 'carry' ? sk.handN : sk.handN;
    out += `<rect x="${f(h.x - 9)}" y="${f(h.y - 4)}" width="18" height="9" rx="3" fill="${C.weight}"/>`;
  }
  if (spec.props.includes('band')) {
    const a = spec.frames[0].handN, b = spec.frames[FRAME_COUNT - 1].handN;
    out += `<path d="M${f(a.x)} ${f(a.y)}Q${f((a.x + b.x) / 2 + 12)} ${f((a.y + b.y) / 2 - 10)} ${f(b.x)} ${f(b.y)}" stroke="${C.band}" stroke-width="3" fill="none" stroke-dasharray="5 4" opacity=".7"/>`;
    if (spec.variant !== 'arm-row') {
      out += `<line x1="${f(sk.handN.x)}" y1="${f(sk.handN.y)}" x2="${f(sk.handF.x)}" y2="${f(sk.handF.y)}" stroke="${C.band}" stroke-width="3" stroke-dasharray="5 4" opacity=".7"/>`;
    }
  }
  return out;
}

function figureMarkup(spec: Illustration, frame: number): string {
  const sk = spec.frames[frame];
  const lying = spec.position === 'lying' || spec.position === 'four_point';
  let out = '';
  if (lying) {
    out += `<line x1="70" y1="205" x2="430" y2="205" stroke="${C.floorLine}" stroke-width="2"/>`;
  } else {
    out += `<ellipse cx="250" cy="210" rx="150" ry="9" fill="${C.floor}"/><path d="M100 205H400" stroke="${C.floorLine}" stroke-width="2"/>`;
  }
  out += propsMarkup(spec);
  out += limb(sk.neck, sk.elbowF, sk.handF, C.far, 10);
  out += limb(sk.pelvis, sk.kneeF, sk.footF, C.far, 10);
  if (sk.spineBow !== 0) {
    const mx = (sk.neck.x + sk.pelvis.x) / 2, my = (sk.neck.y + sk.pelvis.y) / 2;
    out += `<path d="M${f(sk.neck.x)} ${f(sk.neck.y)}Q${f(mx)} ${f(my + sk.spineBow)} ${f(sk.pelvis.x)} ${f(sk.pelvis.y)}" stroke="${C.near}" stroke-width="14" stroke-linecap="round" fill="none"/>`;
  } else {
    out += `<path d="M${f(sk.neck.x)} ${f(sk.neck.y)}L${f(sk.pelvis.x)} ${f(sk.pelvis.y)}" stroke="${C.near}" stroke-width="14" stroke-linecap="round"/>`;
  }
  if (sk.breath > 0.05) {
    const mx = (sk.neck.x + sk.pelvis.x) / 2, my = (sk.neck.y + sk.pelvis.y) / 2;
    out += `<ellipse cx="${f(mx + (lying ? 2 : 0))}" cy="${f(my + (spec.position === 'lying' ? -10 : 0))}" rx="${f(9 + 15 * sk.breath)}" ry="${f(18 + 6 * sk.breath)}" stroke="${C.arc}" stroke-width="1.5" fill="none" stroke-dasharray="3 4" opacity="${f(0.35 + 0.3 * sk.breath)}"/>`;
  }
  out += `<circle cx="${f(sk.head.x)}" cy="${f(sk.head.y)}" r="${HEAD_R}" fill="${C.head}" stroke="${C.headStroke}" stroke-width="2"/>`;
  out += `<circle cx="${f(sk.head.x + sk.face)}" cy="${f(sk.head.y + 2 + sk.faceY)}" r="1.8" fill="#a1937a"/>`;
  out += limb(sk.pelvis, sk.kneeN, sk.footN, C.near, 12);
  out += limb(sk.neck, sk.elbowN, sk.handN, C.near, 12);
  const hr = 4 + 3 * sk.handOpen;
  out += `<circle cx="${f(sk.handN.x)}" cy="${f(sk.handN.y)}" r="${f(hr)}" fill="${C.near}"/>`;
  out += `<circle cx="${f(sk.handF.x)}" cy="${f(sk.handF.y)}" r="4" fill="${C.far}"/>`;
  out += frontPropsMarkup(spec, frame);
  return out;
}

function motionMarkup(spec: Illustration): string {
  const a = spec.frames[0][spec.moving], b = spec.frames[FRAME_COUNT - 1][spec.moving];
  if (spec.isHold) {
    const mid = spec.frames[5][spec.moving];
    return `<ellipse cx="${f(mid.x)}" cy="${f(mid.y)}" rx="17" ry="13" stroke="${C.arc}" stroke-width="1.5" fill="none" stroke-dasharray="4 4"/>`;
  }
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * 26, cy = my + (dx / len) * 26;
  const ang = Math.atan2(b.y - cy, b.x - cx);
  const ax = b.x + 6 * Math.cos(ang), ay = b.y + 6 * Math.sin(ang);
  const wing = 0.5;
  return `<path d="M${f(a.x)} ${f(a.y)}Q${f(cx)} ${f(cy)} ${f(ax)} ${f(ay)}" stroke="${C.arc}" stroke-width="2" stroke-dasharray="4 5" fill="none"/><path d="M${f(ax)} ${f(ay)}l${f(-9 * Math.cos(ang - wing))} ${f(-9 * Math.sin(ang - wing))}M${f(ax)} ${f(ay)}l${f(-9 * Math.cos(ang + wing))} ${f(-9 * Math.sin(ang + wing))}" stroke="${C.arc}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
}

/** Full animation-ready SVG: all 10 frames stacked, frame `frame` visible. */
export function figureSvg(e: ExerciseLike, frame: number): string {
  const spec = illustrationFor(e);
  const i = ((Math.round(frame) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;
  let groups = '';
  for (let k = 0; k < FRAME_COUNT; k++) {
    groups += `<g class="fig-frame${k === i ? ' on' : ''}">${figureMarkup(spec, k)}</g>`;
  }
  return `<svg class="k-figure" viewBox="0 0 500 240" role="img" aria-label="${esc(e.name)} — ${esc(spec.label)}">${groups}${motionMarkup(spec)}</svg>`;
}

/** Print-friendly SVG: start and end-range poses side by side. */
export function figurePairSvg(e: ExerciseLike): string {
  const spec = illustrationFor(e);
  const a = figureMarkup(spec, 1);
  const b = figureMarkup(spec, 8);
  return `<svg class="k-figure k-figure-pair" viewBox="0 0 500 150" role="img" aria-label="${esc(e.name)} — ${esc(spec.label)}"><g transform="translate(-10 6) scale(0.56)">${a}</g><g transform="translate(212 6) scale(0.56)">${b}</g></svg>`;
}

export function framesFor(e: ExerciseLike): Skeleton[] { return illustrationFor(e).frames; }
export function archetypeOf(e: ExerciseLike): ArchKey { return illustrationFor(e).key; }
