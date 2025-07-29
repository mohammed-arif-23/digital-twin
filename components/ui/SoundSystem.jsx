"use client";

import { useEffect, useRef } from "react";

export function SoundSystem({
  engineRunning,
  rpm,
}) {
  const audioContextRef = useRef(null);
  const engineOscillatorRef = useRef(null);
  const exhaustOscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const filterNodeRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.AudioContext) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();

      gainNodeRef.current = audioContextRef.current.createGain();
      filterNodeRef.current = audioContextRef.current.createBiquadFilter();

      filterNodeRef.current.type = "lowpass";
      filterNodeRef.current.frequency.setValueAtTime(
        800,
        audioContextRef.current.currentTime
      );

      gainNodeRef.current.connect(filterNodeRef.current);
      filterNodeRef.current.connect(audioContextRef.current.destination);

      return () => {
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (!audioContextRef.current) return;

    if (engineRunning && rpm > 0) {
      if (!engineOscillatorRef.current) {
        const osc1 = audioContextRef.current.createOscillator();
        const osc2 = audioContextRef.current.createOscillator();

        osc1.type = "sawtooth";
        osc2.type = "triangle";

        const gain1 = audioContextRef.current.createGain();
        const gain2 = audioContextRef.current.createGain();

        osc1.connect(gain1);
        osc2.connect(gain2);

        gain1.connect(gainNodeRef.current);
        gain2.connect(gainNodeRef.current);

        gain1.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
        gain2.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);

        engineOscillatorRef.current = { osc1, osc2 };
        exhaustOscillatorRef.current = { gain1, gain2 };

        osc1.start();
        osc2.start();
      }

      const rpmRatio = Math.max(rpm / 8000, 0.1);
      const baseFreq = 50 + rpmRatio * 200;
      const harmonic2 = baseFreq * 1.5;

      engineOscillatorRef.current.osc1.frequency.setValueAtTime(
        baseFreq,
        audioContextRef.current.currentTime
      );
      engineOscillatorRef.current.osc2.frequency.setValueAtTime(
        harmonic2,
        audioContextRef.current.currentTime
      );

      const idleVolume = 0.25;
      const maxVolume = 0.6;
      const volume = idleVolume + rpmRatio * (maxVolume - idleVolume);

      gainNodeRef.current.gain.setValueAtTime(
        volume,
        audioContextRef.current.currentTime
      );

      const filterFreq = 200 + rpmRatio * 1200;
      filterNodeRef.current.frequency.setValueAtTime(
        filterFreq,
        audioContextRef.current.currentTime
      );
    } else {
      if (engineOscillatorRef.current) {
        engineOscillatorRef.current.osc1.stop();
        engineOscillatorRef.current.osc2.stop();
        engineOscillatorRef.current = null;
        exhaustOscillatorRef.current = null;
      }
    }
  }, [engineRunning, rpm]);

  return null;
}
