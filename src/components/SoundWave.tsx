import React, { useEffect, useState } from "react";
import { JarvisState } from "../types";

interface SoundWaveProps {
  state: JarvisState;
  speakerVolume: number;
}

export default function SoundWave({ state, speakerVolume }: SoundWaveProps) {
  const isSpeaking = state === JarvisState.SPEAKING;
  const isAnalyzing = state === JarvisState.ANALYZING;
  const [heights, setHeights] = useState<number[]>(new Array(16).fill(4));

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSpeaking) {
      interval = setInterval(() => {
        setHeights(
          Array.from({ length: 16 }).map(() => 
            Math.max(4, Math.floor(Math.random() * 32 * (speakerVolume || 1)))
          )
        );
      }, 80);
    } else if (isAnalyzing) {
      // Small, uniform wave when thinking
      interval = setInterval(() => {
        setHeights(
          Array.from({ length: 16 }).map((_, i) => 
            4 + Math.abs(Math.sin((Date.now() / 200) + i)) * 8
          )
        );
      }, 50);
    } else {
      setHeights(new Array(16).fill(3));
    }

    return () => clearInterval(interval);
  }, [isSpeaking, isAnalyzing, speakerVolume]);

  return (
    <div id="vocal-spectrum-module" className="flex flex-col items-center gap-1.5 p-2 bg-black/40 border border-hud-cyan/10 rounded-sm">
      <div className="flex items-center justify-between w-full text-[9px] font-mono tracking-wider text-hud-cyan/70 px-1 border-b border-hud-cyan/10 pb-1 mb-1">
        <span>TRANSMISOR DE AUDIO</span>
        <span>{isSpeaking ? "OUTPUT ACTIVE" : isAnalyzing ? "COMPUTING WAVE" : "MUTED / IDLE"}</span>
      </div>
      
      {/* Wave Bars Container */}
      <div className="flex items-center justify-center gap-1 h-10 w-full px-2">
        {heights.map((h, i) => (
          <div
            key={i}
            className={`w-1 rounded-sm transition-all duration-75 ${
              isSpeaking
                ? "bg-hud-cyan shadow-[0_0_6px_#00f0ff]"
                : isAnalyzing
                ? "bg-hud-orange shadow-[0_0_4px_#ffaa00]"
                : "bg-hud-cyan/20"
            }`}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
    </div>
  );
}
