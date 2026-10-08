import React, { useEffect, useState } from "react";
import { SpeechConfig, PersonalityId } from "../types";
import { Volume2, VolumeX, Play, Settings, Sparkles, Music } from "lucide-react";
import { playSciFiSound } from "../utils/audioEffects";

interface SpeechSynthesizerControlsProps {
  config: SpeechConfig;
  onChange: (updated: SpeechConfig) => void;
  onPreview: (testText: string) => void;
  activePersonality: PersonalityId;
  onPersonalityChange: (id: PersonalityId) => void;
}

export default function SpeechSynthesizerControls({ 
  config, 
  onChange,
  onPreview,
  activePersonality,
  onPersonalityChange
}: SpeechSynthesizerControlsProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleToggleMute = () => {
    if (config.soundEffectsEnabled) playSciFiSound("click", config.volume);
    onChange({ ...config, enabled: !config.enabled });
  };

  const handleToggleSoundEffects = () => {
    // Play a test beep before toggling
    if (!config.soundEffectsEnabled) {
      playSciFiSound("click", config.volume);
    }
    onChange({ ...config, soundEffectsEnabled: !config.soundEffectsEnabled });
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (config.soundEffectsEnabled) playSciFiSound("click", config.volume);
    onChange({ ...config, voiceName: e.target.value });
  };

  const handleSliderChange = (field: keyof SpeechConfig, val: number) => {
    onChange({ ...config, [field]: val });
  };

  const handlePersonalityClick = (id: PersonalityId) => {
    onPersonalityChange(id);
  };

  // Find Spanish voices to highlight / pre-select
  const spanishVoices = voices.filter(v => v.lang.toLowerCase().includes("es"));
  const otherVoices = voices.filter(v => !v.lang.toLowerCase().includes("es"));

  return (
    <div id="speech-controls-pane" className="bg-black/60 border border-hud-cyan/15 rounded-sm p-4 relative">
      {/* Subtle glowing header */}
      <div className="flex items-center justify-between mb-3 border-b border-hud-cyan/10 pb-2">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-hud-cyan animate-spin-slow" />
          <h4 className="text-xs font-mono font-bold text-hud-cyan tracking-wider uppercase">
            CONFIGURACIÓN VIRTUAL // I.A. MÓDULO VIA
          </h4>
        </div>
        
        {/* Sound FX Toggle (Pure Iron Man style) */}
        <button
          onClick={handleToggleSoundEffects}
          className={`flex items-center gap-1 px-2 py-0.5 border text-[8px] font-mono rounded transition-all uppercase ${
            config.soundEffectsEnabled
              ? "bg-hud-orange/15 border-hud-orange/40 text-hud-orange"
              : "bg-transparent border-gray-700 text-gray-500"
          }`}
          title="Sonidos de Interfaz de Traje Stark"
        >
          <Music className="w-2.5 h-2.5" />
          {config.soundEffectsEnabled ? "Efectos ON" : "Efectos OFF"}
        </button>
      </div>

      <div className="space-y-4">
        {/* Personality Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wide flex justify-between">
            <span>IA Central // Asistente Digital</span>
            <span className="text-hud-cyan text-[8px] animate-pulse flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> PERSONALIDAD ACTIVA
            </span>
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "JARVIS" as const, name: "J.A.R.V.I.S.", desc: "IA de Tony Stark (MCU)", color: "border-hud-cyan/30 text-hud-cyan text-hud-cyan/20 bg-hud-cyan/5 hover:bg-hud-cyan/10" },
              { id: "FRIDAY" as const, name: "F.R.I.D.A.Y.", desc: "IA de Armadura / MCU", color: "border-hud-orange/30 text-hud-orange bg-hud-orange/5 hover:bg-hud-orange/10" },
              { id: "KAREN" as const, name: "KAREN", desc: "Suit Lady Spider-Man", color: "border-purple-500/30 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10" },
              { id: "EDITH" as const, name: "E.D.I.T.H.", desc: "Gafas Tácticas Stark", color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10" },
            ].map((p) => {
              const isActive = activePersonality === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePersonalityClick(p.id)}
                  className={`flex flex-col items-center justify-center py-1.5 px-2.5 border rounded cursor-pointer transition-all uppercase text-center ${
                    isActive
                      ? "border-current bg-current/20 scale-[1.02] shadow-[0_0_10px_rgba(0,240,255,0.15)] font-bold text-hud-cyan"
                      : "border-gray-800 text-gray-400 bg-transparent hover:text-gray-200"
                  }`}
                  style={{
                    borderColor: isActive ? undefined : "rgba(255, 255, 255, 0.08)",
                    color: isActive ? undefined : ""
                  }}
                >
                  <span className="text-[10px] font-mono tracking-wider">{p.name}</span>
                  <span className="text-[7px] font-mono opacity-60 leading-none mt-0.5">{p.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggle Speech */}
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">
            Narrador del Asistente
          </label>
          <button
            onClick={handleToggleMute}
            className={`flex items-center gap-1.5 px-3 py-1 border text-[10px] font-mono rounded transition-all uppercase ${
              config.enabled
                ? "bg-hud-cyan/10 border-hud-cyan text-hud-cyan shadow-[0_0_8px_rgba(0,240,255,0.2)] font-bold"
                : "bg-transparent border-gray-600 text-gray-500"
            }`}
          >
            {config.enabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                Voz Activa
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                Silenciado
              </>
            )}
          </button>
        </div>

        {/* Voice Select */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wide flex justify-between">
            <span>Perfil de Voz del Sistema</span>
            {spanishVoices.length > 0 && <span className="text-hud-cyan text-[9px] font-bold">Español detectado</span>}
          </label>
          <select
            value={config.voiceName}
            onChange={handleVoiceChange}
            className="w-full bg-black/60 border border-hud-cyan/20 text-hud-cyan text-xs font-mono rounded px-2.5 py-1.5 focus:outline-none focus:border-hud-cyan/60"
            disabled={!config.enabled}
          >
            <option value="">-- Voz por Defecto en Español --</option>
            
            {spanishVoices.length > 0 && (
              <optgroup label="Voces prioritarias en Español">
                {spanishVoices.map((voice, idx) => (
                  <option key={`${voice.name}-${voice.lang}-${idx}`} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </optgroup>
            )}

            {otherVoices.length > 0 && (
              <optgroup label="Otras voces del Sistema">
                {otherVoices.map((voice, idx) => (
                  <option key={`${voice.name}-${voice.lang}-${idx}`} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Speed / Rate */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-gray-400 uppercase">Velocidad del Habla</span>
            <span className="text-hud-cyan font-semibold">{config.rate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.8"
            step="0.05"
            value={config.rate}
            onChange={(e) => handleSliderChange("rate", parseFloat(e.target.value))}
            className="w-full accent-hud-cyan bg-hud-cyan/10 rounded h-1 cursor-pointer"
            disabled={!config.enabled}
          />
        </div>

        {/* Pitch */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-gray-400 uppercase">Tono / Frecuencia</span>
            <span className="text-hud-cyan font-semibold">{config.pitch.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={config.pitch}
            onChange={(e) => handleSliderChange("pitch", parseFloat(e.target.value))}
            className="w-full accent-hud-cyan bg-hud-cyan/10 rounded h-1 cursor-pointer"
            disabled={!config.enabled}
          />
        </div>

        {/* Volume */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-gray-400 uppercase">Volumen General</span>
            <span className="text-hud-cyan font-semibold">{(config.volume * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.volume}
            onChange={(e) => handleSliderChange("volume", parseFloat(e.target.value))}
            className="w-full accent-hud-cyan bg-hud-cyan/10 rounded h-1 cursor-pointer"
            disabled={!config.enabled}
          />
        </div>

        {/* Test Prompt Speech */}
        <button
          onClick={() => {
            let greet = "Sistemas interactivos listos, Señor.";
            if (activePersonality === "FRIDAY") greet = "Sistemas interactivos listos, Jefe.";
            if (activePersonality === "KAREN") greet = "Hola, joven héroe. ¿Qué necesitas analizar hoy?";
            if (activePersonality === "EDITH") greet = "E.D.I.T.H. activa y conectada. Definiendo perímetros tácticos.";
            onPreview(greet);
          }}
          className="w-full flex items-center justify-center gap-1.5 border border-hud-cyan/30 bg-hud-cyan/5 hover:bg-hud-cyan/20 hover:border-hud-cyan text-hud-cyan text-[10px] font-mono py-1.5 py-2' rounded uppercase cursor-pointer transition-all"
          disabled={!config.enabled}
        >
          <Play className="w-3.5 h-3.5" />
          Probar Altavoz de {activePersonality}
        </button>
      </div>

      {/* Paul Bettany / Idzi Dutkiewicz Spanish Accent tip */}
      {config.enabled && (
        <div className="mt-3.5 text-center px-1 text-[8px] font-mono text-hud-cyan/40 hover:text-hud-cyan/80 leading-relaxed uppercase select-none transition-colors border-t border-hud-cyan/5 pt-2">
          {activePersonality === "JARVIS" && "💡 JARVIS (Idzi Dutkiewicz): Voz en español latino oficial de Tony Stark / J.A.R.V.I.S. Máxima fidelidad carismática, tono grave seguro (pitch 0.85)."}
          {activePersonality === "FRIDAY" && "💡 F.R.I.D.A.Y. (Kerry Condon): Velocidad rápida (1.15x), tono enérgico irlandés de confianza."}
          {activePersonality === "KAREN" && "💡 KAREN (Jennifer Connelly): Tono agudo dulce (1.15) de la asistente confidencial."}
          {activePersonality === "EDITH" && "💡 E.D.I.T.H.: Velocidad rápida táctica, tono plano severo militar."}
        </div>
      )}
    </div>
  );
}
