/**
 * Rest timer feedback — audio bip + vibration fallback.
 * Never throws. Safe on all browsers and mobile.
 */

async function playBip(): Promise<boolean> {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return false;

    const ctx = new AudioCtx();

    // Some browsers start context in suspended state — resume it
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5 — soft, clear

    gainNode.gain.setValueAtTime(0.18, ctx.currentTime); // low volume
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15); // 150ms fade-out

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);

    // Clean up context after bip
    oscillator.onended = () => { ctx.close().catch(() => {}); };

    return true;
  } catch {
    return false;
  }
}

function triggerVibration(): void {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([120, 40, 80]);
    }
  } catch {
    // Silently ignore — vibration not supported
  }
}

/**
 * Play end-of-rest feedback.
 * @param soundEnabled - from AppSettings.restTimerSound
 *
 * If soundEnabled:
 *   - attempt Web Audio bip
 *   - fallback to vibration if audio fails
 * If soundEnabled is false:
 *   - vibration only
 */
export async function playRestTimerFeedback(soundEnabled: boolean): Promise<void> {
  if (soundEnabled) {
    const played = await playBip();
    if (!played) {
      triggerVibration();
    }
  } else {
    triggerVibration();
  }
}
