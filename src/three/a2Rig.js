// Rig configuration for the community A2 model (media/a2-urdf → public/models/a2.glb, see ORIGIN.md).
// Joint semantics measured from the URDF and probe renders:
//   arm_joint1 = shoulder pitch (+ = raise forward), limits ±2.97
//   arm_joint2 = shoulder roll   (+ = down, limits [-0.52, 1.66]; -0.52 already lifts 45° up)
//   arm_joint4 = elbow flex      (+ = bend, limits [0, 2.09])
// Legs: hip_pitch = hip flex, tarsus = knee (+ = bend), toe_pitch = ankle.
// The head chain is fixed (head_joint1/2) so emotes never move it; there is no waist joint.

import { MODEL as X2_MODEL, EMOTES, EYE_MOOD } from './x2Rig';

export const A2_MODEL = { desktop: '/models/a2.glb', mobile: '/models/a2-mobile.glb' };

// Resting stance: arms hanging with a little clearance from the thighs and a soft elbow.
export const A2_NEUTRAL = {
  left_arm_joint1: 0.05,
  right_arm_joint1: 0.05,
  left_arm_joint2: 1.28,
  right_arm_joint2: 1.28,
  left_arm_joint4: 0.16,
  right_arm_joint4: 0.16
};

export const A2_CONFIG = {
  pelvisName: 'base_link',
  feetRe: /toe_pitch|toe_roll/,
  headLink: 'head_link02',
  neutral: A2_NEUTRAL,
  eyeColor: '#3563ff',
  eye: { y: 0.55, gap: 0.16, width: 0.1, height: 0.2 }
};

// Emote keyframes. Measured joint semantics (world frame: robot faces +X, T-pose arms along ±Z):
//   arm_joint1 = shoulder rotation about the side axis (+ swings a hanging arm forward; twist at T-pose)
//   arm_joint2 = shoulder swing (+ = down toward body, − = up); arm direction = (sin j1·sin j2, −cos j1·sin j2, ±cos j2)
//   arm_joint4 = elbow (+ = bend forward). Head chain and waist are fixed; legs stay planted.
// Keyframes use absolute seconds; joints not listed keep their previous value. Every emote ends back at A2_NEUTRAL.
export const A2_EMOTES = [
  {
    id: 'wave',
    label: 'Lambai',
    keys: [
      { t: 0.7, pose: { right_arm_joint1: -0.32, right_arm_joint2: -1.12, right_arm_joint4: 0.95 } },
      { t: 1.05, pose: { right_arm_joint1: -0.45, right_arm_joint4: 1.45 } },
      { t: 1.4, pose: { right_arm_joint1: -0.22, right_arm_joint4: 0.6 } },
      { t: 1.75, pose: { right_arm_joint1: -0.45, right_arm_joint4: 1.45 } },
      { t: 2.1, pose: { right_arm_joint1: -0.25, right_arm_joint4: 0.65 } },
      { t: 2.5, pose: { right_arm_joint1: -0.32, right_arm_joint4: 0.95 } }
    ]
  },
  {
    id: 'handshake',
    label: 'Jabat tangan',
    keys: [
      { t: 0.8, pose: { right_arm_joint1: -2.3, right_arm_joint2: -1.5, right_arm_joint4: 0.75 } },
      { t: 1.05, pose: { right_arm_joint4: 1.05 } },
      { t: 1.3, pose: { right_arm_joint4: 0.7 } },
      { t: 1.55, pose: { right_arm_joint4: 1.05 } },
      { t: 1.8, pose: { right_arm_joint4: 0.8 } },
      { t: 2.4, pose: { right_arm_joint4: 0.8 } }
    ]
  },
  {
    id: 'point',
    label: 'Menunjuk',
    keys: [
      { t: 0.8, pose: { right_arm_joint1: -1.52, right_arm_joint2: -1.5, right_arm_joint4: 0.12 } },
      { t: 1.15, pose: { right_arm_joint1: -1.45, right_arm_joint4: 0.35 } },
      { t: 1.5, pose: { right_arm_joint1: -1.52, right_arm_joint4: 0.1 } },
      { t: 2, pose: { right_arm_joint1: -1.52 } }
    ]
  },
  {
    id: 'cheer',
    label: 'Selebrasi',
    keys: [
      { t: 0.6, pose: { left_arm_joint1: 0, right_arm_joint1: 0, left_arm_joint2: -1.35, right_arm_joint2: -1.35, left_arm_joint4: 0.5, right_arm_joint4: 0.5 } },
      { t: 0.9, pose: { left_arm_joint2: -1.45, right_arm_joint2: -1.45, left_arm_joint4: 1, right_arm_joint4: 1 } },
      { t: 1.2, pose: { left_arm_joint2: -1.35, right_arm_joint2: -1.35, left_arm_joint4: 0.5, right_arm_joint4: 0.5 } },
      { t: 1.5, pose: { left_arm_joint2: -1.45, right_arm_joint2: -1.45, left_arm_joint4: 1, right_arm_joint4: 1 } },
      { t: 2.1, pose: { left_arm_joint2: -1.38, right_arm_joint2: -1.38, left_arm_joint4: 0.7, right_arm_joint4: 0.7 } }
    ]
  }
];

export const A2_EYE_MOOD = { wave: 0.5, handshake: 0.6, point: 1, cheer: 0.42 };

// Idle breathing: radians added on top of neutral while no emote is running.
const A2_BREATH = { left_arm_joint2: 0.045, right_arm_joint2: 0.045, left_arm_joint4: 0.03, right_arm_joint4: 0.03 };
const X2_BREATH = { left_shoulder_roll_joint: 0.03, right_shoulder_roll_joint: 0.03, left_elbow_joint: -0.02, right_elbow_joint: -0.02 };

// Model lookup shared by the robot pages: cutout robots keep `model: undefined`.
export const PAGE_RIG = {
  x2: { model: X2_MODEL, config: null, chest: true, credit: '/models/X2-ULTRA-LICENSE.txt', emotes: EMOTES, eyeMood: EYE_MOOD, breath: X2_BREATH },
  a2: { model: A2_MODEL, config: A2_CONFIG, chest: false, credit: '/models/A2-CREDITS.txt', emotes: A2_EMOTES, eyeMood: A2_EYE_MOOD, breath: A2_BREATH }
};
