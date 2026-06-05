let context;

function getContext() {
  if (!context) {
    context = new (window.AudioContext || window.webkitAudioContext)();
  }
  return context;
}

function tone({ frequency, duration, type = 'sine', startGain = 0.08, bendTo }) {
  const audio = getContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  const now = audio.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  if (bendTo) {
    oscillator.frequency.exponentialRampToValueAtTime(bendTo, now + duration);
  }

  gain.gain.setValueAtTime(startGain, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

export function playSuccess() {
  tone({ frequency: 740, duration: 0.09, type: 'triangle', startGain: 0.07 });
  window.setTimeout(() => tone({ frequency: 990, duration: 0.12, type: 'triangle', startGain: 0.06 }), 70);
}

export function playError() {
  tone({ frequency: 220, duration: 0.18, type: 'square', startGain: 0.055, bendTo: 120 });
}
