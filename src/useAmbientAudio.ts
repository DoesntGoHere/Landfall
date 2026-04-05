import { useEffect, useRef } from 'react';

export function useAmbientAudio(enabled: boolean) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled) {
      cleanupRef.current?.();
      cleanupRef.current = null;
      return;
    }

    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = 0.04;
    master.connect(context.destination);

    const droneA = context.createOscillator();
    droneA.type = 'sine';
    droneA.frequency.value = 143;

    const droneB = context.createOscillator();
    droneB.type = 'triangle';
    droneB.frequency.value = 196;

    const mod = context.createOscillator();
    mod.type = 'sine';
    mod.frequency.value = 0.08;

    const modGain = context.createGain();
    modGain.gain.value = 8;

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;

    const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let index = 0; index < noiseData.length; index += 1) {
      noiseData[index] = (Math.random() * 2 - 1) * 0.18;
    }

    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = context.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 240;

    const noiseGain = context.createGain();
    noiseGain.gain.value = 0.12;

    mod.connect(modGain);
    modGain.connect(filter.frequency);

    droneA.connect(filter);
    droneB.connect(filter);
    filter.connect(master);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);

    droneA.start();
    droneB.start();
    mod.start();
    noise.start();

    cleanupRef.current = () => {
      noise.stop();
      droneA.stop();
      droneB.stop();
      mod.stop();
      context.close().catch(() => undefined);
    };

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [enabled]);
}
