import React from "react";
import { JarvisState } from "../types";

interface ArcReactorProps {
  state: JarvisState;
}

export default function ArcReactor({ state }: ArcReactorProps) {
  // Determine energy color based on active state
  const getColor = () => {
    switch (state) {
      case JarvisState.ANALYZING:
        return "text-hud-orange drop-shadow-[0_0_15px_#ffaa00]";
      case JarvisState.CAPTURING:
        return "text-white drop-shadow-[0_0_20px_#ffffff]";
      case JarvisState.SPEAKING:
        return "text-hud-cyan drop-shadow-[0_0_20px_#00f0ff] scale-105 animate-pulse";
      case JarvisState.ERROR:
        return "text-hud-red drop-shadow-[0_0_15px_#ff3b3b]";
      case JarvisState.ACTIVE:
        return "text-hud-cyan drop-shadow-[0_0_10px_#00f0ff]";
      default:
        return "text-hud-cyan/40 drop-shadow-none";
    }
  };

  const glowColor = () => {
    switch (state) {
      case JarvisState.ANALYZING:
        return "rgba(255, 170, 0, 0.4)";
      case JarvisState.CAPTURING:
        return "rgba(255, 255, 255, 0.6)";
      case JarvisState.SPEAKING:
        return "rgba(0, 240, 255, 0.6)";
      case JarvisState.ERROR:
        return "rgba(255, 59, 59, 0.4)";
      default:
        return "rgba(0, 240, 255, 0.15)";
    }
  };

  const isSpinning = state !== JarvisState.OFFLINE && state !== JarvisState.ERROR;

  return (
    <div id="arc-reactor-module" className="flex flex-col items-center justify-center p-4 relative">
      {/* Reactor Wrapper */}
      <div 
        className="w-48 h-48 rounded-full border border-hud-cyan/10 bg-black/60 flex items-center justify-center relative transition-all duration-500"
        style={{
          boxShadow: `inset 0 0 30px ${glowColor()}, 0 0 25px ${glowColor()}`
        }}
      >
        {/* Holographic Radar Radial Line */}
        {state === JarvisState.ANALYZING && (
          <div className="absolute inset-2 rounded-full overflow-hidden pointer-events-none">
            <div 
              className="w-1/2 h-full bg-gradient-to-r from-hud-orange/20 to-transparent absolute left-1/2 origin-left animate-radar-sweep"
            />
          </div>
        )}

        {/* Outer Tech Ring with ticks */}
        <svg 
          className={`absolute w-[95%] h-[95%] ${getColor()} ${isSpinning ? "animate-spin-slow" : ""}`}
          viewBox="0 0 100 100"
        >
          <circle 
            cx="50" 
            cy="50" 
            r="44" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.75" 
            strokeDasharray="4 2 12 2"
          />
          <circle 
            cx="50" 
            cy="50" 
            r="41" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            strokeDasharray="1 3"
          />
        </svg>

        {/* Counter Rotating Ring */}
        <svg 
          className={`absolute w-[80%] h-[80%] ${getColor()} ${isSpinning ? "animate-spin-reverse" : ""}`}
          viewBox="0 0 100 100"
        >
          <circle 
            cx="50" 
            cy="50" 
            r="38" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeDasharray="40 10 20 10"
          />
          {/* Inner ticks */}
          <circle 
            cx="50" 
            cy="50" 
            r="34" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="2 6"
          />
        </svg>

        {/* Arc Core Segmented Ring */}
        <svg 
          className={`absolute w-[62%] h-[62%] ${getColor()} ${state === JarvisState.SPEAKING ? "scale-110" : ""}`}
          viewBox="0 0 100 100"
        >
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i * 360) / 10;
            return (
              <g key={i} transform={`rotate(${angle} 50 50)`}>
                {/* Copper coil/pendant simulation */}
                <path
                  d="M 45 16 L 55 16 L 53 26 L 47 26 Z"
                  fill="currentColor"
                  opacity={state === JarvisState.OFFLINE ? "0.2" : "0.85"}
                />
                <circle cx="50" cy="12" r="1.5" fill="currentColor" />
              </g>
            );
          })}
          <circle 
            cx="50" 
            cy="50" 
            r="28" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="8 4"
          />
        </svg>

        {/* Inner Reactor Crystal glowing center */}
        <div 
          className={`w-14 h-14 rounded-full flex items-center justify-center border border-hud-cyan/20 bg-hud-cyan/10 transition-all duration-300 relative z-10 ${getColor()}`}
        >
          {/* Floating glowing crystal graphic */}
          <div 
            className={`w-8 h-8 rounded-full border-2 border-current bg-transparent transition-all duration-500 flex items-center justify-center ${
              state === JarvisState.SPEAKING ? "scale-125 bg-hud-cyan/20" : ""
            }`}
          >
            {/* Center Core dot */}
            <div 
              className={`w-3 h-3 rounded-full bg-current transition-all duration-300 ${
                state === JarvisState.ANALYZING ? "animate-ping" : ""
              }`}
            />
          </div>
          
          {/* Hexagonal holographic design details */}
          <span className="absolute text-[6px] font-mono top-1 opacity-70">CORE</span>
          <span className="absolute text-[6px] font-mono bottom-1 opacity-70">
            {state === JarvisState.ANALYZING ? "COMPUTING" : state === JarvisState.SPEAKING ? "VOICE" : "STABLE"}
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <div className="flex items-center gap-1.5 justify-center">
          <span 
            className={`w-2 h-2 rounded-full ${
              state === JarvisState.OFFLINE ? "bg-gray-500" :
              state === JarvisState.ANALYZING ? "bg-hud-orange animate-ping" :
              state === JarvisState.SPEAKING ? "bg-hud-cyan animate-pulse shadow-[0_0_8px_#00f0ff]" :
              state === JarvisState.ERROR ? "bg-hud-red animate-pulse" : "bg-hud-cyan animate-pulse shadow-[0_0_8px_#00f0ff]"
            }`}
          />
          <h3 className="text-xs font-mono tracking-widest uppercase text-hud-cyan">
            {state === JarvisState.OFFLINE ? "SISTEMAS DESCONECTADOS" :
             state === JarvisState.INITIALIZING ? "INICIALIZANDO..." :
             state === JarvisState.ACTIVE ? "STANDBY // COGNICIÓN LISTA" :
             state === JarvisState.CAPTURING ? "CAPTURANDO OBJETIVO" :
             state === JarvisState.ANALYZING ? "LOGICA EN Proceso..." :
             state === JarvisState.SPEAKING ? "TRANSMISIÓN DE VOZ" :
             "ERROR DE BUFFER"}
          </h3>
        </div>
        <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase">
          STARK INDUSTRIES // MATRIX ENG. VER 5.2
        </p>
      </div>
    </div>
  );
}
