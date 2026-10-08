const THEMES = {
  'first-light': { notes: [261.63, 329.63, 392, 440, 392, 329.63], wave: 'sine', beat: 1.35, bass: 130.81 },
  'market-roots': { notes: [196, 246.94, 293.66, 369.99, 293.66, 246.94], wave: 'triangle', beat: 1.05, bass: 98 },
  'mountain-echo': { notes: [174.61, 220, 261.63, 329.63, 261.63, 220], wave: 'sine', beat: 1.6, bass: 87.31 }
};

let audioContext = null;
let master = null;
let musicBus = null;
let effectsBus = null;
let musicTimer = null;
let currentStory = null;
let step = 0;
let muted = localStorage.getItem('buea-muted') === 'true';

function ensureAudio() {
  if (!audioContext) {
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextType) return null;
    try {
      audioContext = new AudioContextType();
    } catch {
      return null;
    }
    master = audioContext.createGain();
    musicBus = audioContext.createGain();
    effectsBus = audioContext.createGain();
    musicBus.connect(master);
    effectsBus.connect(master);
    master.connect(audioContext.destination);
    master.gain.value = muted ? 0 : 0.72;
  }
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function tone(frequency, duration, bus, { wave = 'sine', gain = 0.12, when = 0, endFrequency = null } = {}) {
  const context = ensureAudio();
  if (!context || !bus) return;
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime + when);
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, context.currentTime + when + duration);
  volume.gain.setValueAtTime(0.0001, context.currentTime + when);
  volume.gain.exponentialRampToValueAtTime(gain, context.currentTime + when + 0.025);
  volume.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + when + duration);
  oscillator.connect(volume);
  volume.connect(bus);
  oscillator.start(context.currentTime + when);
  oscillator.stop(context.currentTime + when + duration + 0.02);
}

function scheduleTheme() {
  if (!currentStory || !musicBus) return;
  const theme = THEMES[currentStory] || THEMES['first-light'];
  const note = theme.notes[step % theme.notes.length];
  tone(note, 0.75, musicBus, { wave: theme.wave, gain: 0.035 });
  tone(note * 1.5, 1.15, musicBus, { wave: 'sine', gain: 0.012, when: 0.08 });
  if (step % 3 === 0) tone(theme.bass, 1.15, musicBus, { gain: 0.024 });
  step += 1;
}

function stopTheme() {
  clearInterval(musicTimer);
  musicTimer = null;
  if (musicBus && audioContext) {
    musicBus.gain.cancelScheduledValues(audioContext.currentTime);
    musicBus.gain.setTargetAtTime(0, audioContext.currentTime, 0.1);
  }
}

export function setStoryTheme(storyId) {
  if (currentStory === storyId) return;
  stopTheme();
  currentStory = storyId;
  if (!storyId) return;
  if (!ensureAudio()) return;
  musicBus.gain.setTargetAtTime(0.9, audioContext.currentTime, 0.25);
  step = 0;
  scheduleTheme();
  musicTimer = setInterval(scheduleTheme, THEMES[storyId]?.beat * 1000 || 1350);
}

export function playGameSound(kind = 'tap') {
  if (!ensureAudio()) return;
  if (kind === 'complete') {
    [392, 493.88, 587.33, 783.99].forEach((note, index) => tone(note, 0.32, effectsBus, { wave: 'triangle', gain: 0.11, when: index * 0.09 }));
  } else if (kind === 'chapter') {
    [261.63, 329.63, 392, 523.25, 659.25].forEach((note, index) => tone(note, 0.65, effectsBus, { wave: 'sine', gain: 0.1, when: index * 0.13 }));
  } else if (kind === 'travel') {
    tone(190, 0.35, effectsBus, { wave: 'triangle', gain: 0.06, endFrequency: 260 });
    tone(380, 0.22, effectsBus, { wave: 'sine', gain: 0.025, when: 0.12 });
  } else if (kind === 'meal') {
    tone(392, 0.24, effectsBus, { wave: 'sine', gain: 0.06 });
    tone(587.33, 0.35, effectsBus, { wave: 'sine', gain: 0.045, when: 0.12 });
  } else if (kind === 'commerce') {
    tone(330, 0.12, effectsBus, { wave: 'triangle', gain: 0.05 });
    tone(440, 0.16, effectsBus, { wave: 'triangle', gain: 0.045, when: 0.1 });
  } else if (kind === 'social' || kind === 'community') {
    tone(523.25, 0.2, effectsBus, { wave: 'sine', gain: 0.045 });
    tone(659.25, 0.28, effectsBus, { wave: 'sine', gain: 0.04, when: 0.1 });
  } else if (kind === 'work') {
    tone(246.94, 0.12, effectsBus, { wave: 'triangle', gain: 0.05 });
    tone(369.99, 0.19, effectsBus, { wave: 'triangle', gain: 0.045, when: 0.1 });
  } else if (kind === 'learn') {
    [440, 554.37, 659.25].forEach((note, index) => tone(note, 0.35, effectsBus, { wave: 'sine', gain: 0.045, when: index * 0.07 }));
  } else if (kind === 'rest') {
    tone(261.63, 0.5, effectsBus, { wave: 'sine', gain: 0.045, endFrequency: 329.63 });
  } else if (kind === 'fitness') {
    tone(196, 0.16, effectsBus, { wave: 'triangle', gain: 0.04, endFrequency: 293.66 });
  } else if (kind === 'error') {
    tone(220, 0.22, effectsBus, { wave: 'triangle', gain: 0.065, endFrequency: 150 });
  } else {
    tone(540, 0.12, effectsBus, { wave: 'sine', gain: 0.035, endFrequency: 720 });
  }
}

export function toggleGameAudio() {
  muted = !muted;
  localStorage.setItem('buea-muted', String(muted));
  if (master && audioContext) master.gain.setTargetAtTime(muted ? 0 : 0.72, audioContext.currentTime, 0.06);
  return muted;
}

export function isGameAudioMuted() {
  return muted;
}
