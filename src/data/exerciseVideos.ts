/**
 * Central registry of exercise video/GIF paths.
 * GIFs must be placed in /public/media/exercises/
 * Source of truth: README_EXERCISE_MEDIA.md
 * When a GIF is not yet available, the UI will show a premium fallback placeholder.
 */
export const EXERCISE_VIDEO_PATHS: Record<string, string> = {
  'db-incline-press':            '/media/exercises/incline-db-press.gif',
  'lat-pulldown-neutral':        '/media/exercises/neutral-lat-pulldown.gif',
  'chest-supported-row':         '/media/exercises/chest-supported-row.gif',
  'shoulder-press-machine':      '/media/exercises/machine-shoulder-press.gif',
  'lateral-raises-db':           '/media/exercises/db-lateral-raise.gif',
  'curl-incline-db':             '/media/exercises/incline-db-curl.gif',
  'triceps-rope':                '/media/exercises/rope-tricep-pushdown.gif',
  'leg-press':                   '/media/exercises/leg-press.gif',
  'romanian-deadlift':           '/media/exercises/romanian-deadlift.gif',
  'bulgarian-split-squat':       '/media/exercises/bulgarian-split-squat.gif',
  'leg-curl':                    '/media/exercises/leg-curl.gif',
  'calf-press':                  '/media/exercises/calf-press.gif',
  'treadmill-incline':           '/media/exercises/incline-treadmill.gif',
  'reverse-pec-deck':            '/media/exercises/reverse-pec-deck.gif',
  'crunch-cable':                '/media/exercises/cable-crunch.gif',
  'hanging-knee-raise':          '/media/exercises/hanging-knee-raise.gif',
  'lateral-raises-cable':        '/media/exercises/cable-lateral-raise.gif',
  'assisted-pullup':             '/media/exercises/assisted-pull-up.gif',
  'seated-cable-row':            '/media/exercises/seated-cable-row.gif',
  'incline-chest-press-machine': '/media/exercises/incline-machine-chest-press.gif',
  'cable-crossover-high':        '/media/exercises/low-to-high-cable-fly.gif',
  'face-pull':                   '/media/exercises/face-pull.gif',
  'curl-hammer-db':              '/media/exercises/hammer-db-curl.gif',
  'triceps-overhead-rope':       '/media/exercises/overhead-rope-tricep-extension.gif',
  'hack-squat':                  '/media/exercises/hack-squat.gif',
  'hip-thrust':                  '/media/exercises/machine-hip-thrust.gif',
  'leg-extension':               '/media/exercises/leg-extension.gif',
  'ez-bar-curl':                 '/media/exercises/ez-bar-curl.gif',
  'assisted-dip':                '/media/exercises/assisted-dips.gif',
  'shoulder-press-db':           '/media/exercises/seated-db-shoulder-press.gif',
  'plank':                       '/media/exercises/plank.gif',
  'lateral-raises-cable-uni':    '/media/exercises/cable-lateral-raise.gif',
};

/**
 * All GIF filenames required in /public/media/exercises/
 * See README_EXERCISE_MEDIA.md for full mapping and instructions.
 */
export const REQUIRED_GIF_FILES = [
  'incline-db-press.gif',
  'neutral-lat-pulldown.gif',
  'chest-supported-row.gif',
  'machine-shoulder-press.gif',
  'seated-db-shoulder-press.gif',
  'db-lateral-raise.gif',
  'cable-lateral-raise.gif',
  'reverse-pec-deck.gif',
  'incline-db-curl.gif',
  'hammer-db-curl.gif',
  'ez-bar-curl.gif',
  'rope-tricep-pushdown.gif',
  'overhead-rope-tricep-extension.gif',
  'face-pull.gif',
  'seated-cable-row.gif',
  'incline-machine-chest-press.gif',
  'low-to-high-cable-fly.gif',
  'assisted-pull-up.gif',
  'assisted-dips.gif',
  'leg-press.gif',
  'romanian-deadlift.gif',
  'bulgarian-split-squat.gif',
  'leg-curl.gif',
  'leg-extension.gif',
  'calf-press.gif',
  'hack-squat.gif',
  'machine-hip-thrust.gif',
  'cable-crunch.gif',
  'hanging-knee-raise.gif',
  'plank.gif',
  'incline-treadmill.gif',
];

export function getExerciseVideoPath(exerciseId: string): string | undefined {
  return EXERCISE_VIDEO_PATHS[exerciseId];
}
