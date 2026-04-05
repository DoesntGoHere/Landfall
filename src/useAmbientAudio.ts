import { useEffect, useRef } from 'react';

const ambientTrackUrl = new URL('../Ambient.m4a', import.meta.url).href;

export function useAmbientAudio(enabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(ambientTrackUrl);
      audio.loop = true;
      audio.volume = 0.08;
      audio.preload = 'auto';
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (enabled) {
      audio
        .play()
        .catch(() => undefined);
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
    };
  }, [enabled]);
}
