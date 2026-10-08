import React, { useState } from "react";
import { User, Sparkles, Shield, Cpu, Check, Calendar, Award, X, AlertCircle } from "lucide-react";
import { UserProfile, PersonalityId } from "../types";

interface PilotRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  currentProfile: UserProfile;
  personalityId?: PersonalityId;
  currentPersonality?: PersonalityId;
  triggerSound?: (type: "startup" | "click" | "success" | "error") => void;
}

export const PilotRegistrationModal: React.FC<PilotRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentProfile,
  personalityId,
  currentPersonality,
  triggerSound,
}) => {
  const [name, setName] = useState(currentProfile.name || "");
  const [age, setAge] = useState<number | string>(currentProfile.age || 20);
  const [title, setTitle] = useState(currentProfile.title || "Señor");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const numAge = Number(age);

    if (!cleanName) {
      setErrorMsg("Por favor ingrese su nombre o alias para el enlace biométrico.");
      triggerSound("error");
      return;
    }

    if (!numAge || numAge < 3 || numAge > 120) {
      setErrorMsg("Por favor ingrese una edad válida (entre 3 y 120 años).");
      triggerSound("error");
      return;
    }

    const updatedProfile: UserProfile = {
      name: cleanName,
      age: numAge,
      title: title || "Señor",
      isRegistered: true,
    };

    triggerSound("success");
    onSave(updatedProfile);
  };

  const titlesList = [
    { label: "Señor / Señora", value: "Señor", desc: "Clásico respetuoso de JARVIS" },
    { label: "Jefe / Jefa", value: "Jefe", desc: "Estilo dinámico de FRIDAY" },
    { label: "Capitán / Comandante", value: "Capitán", desc: "Protocolo táctico militar" },
    { label: "Joven Héroe", value: "Joven Héroe", desc: "Estilo cariñoso de KAREN" },
    { label: "Por mi Nombre de Pila", value: "", desc: "Directo sin título formal" },
  ];

  const parsedAge = Number(age);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Background Holographic Glow */}
      <div className="absolute inset-0 bg-radial-gradient from-hud-cyan/10 via-transparent to-black pointer-events-none" />

      <div className="relative w-full max-w-xl bg-zinc-950/95 border-2 border-hud-cyan/40 rounded-xl shadow-[0_0_35px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col">
        {/* Top Decorative Scanning Beam */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-hud-cyan to-transparent animate-pulse" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-hud-cyan/20 bg-black/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-hud-cyan/10 border border-hud-cyan/30 text-hud-cyan shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              <User className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-hud-orange tracking-widest uppercase bg-hud-orange/10 px-1.5 py-0.5 rounded border border-hud-orange/30">
                  STARK PROTOCOL // BIOMETRICS
                </span>
              </div>
              <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider mt-0.5 flex items-center gap-2">
                Identidad y Edad del Piloto
              </h2>
            </div>
          </div>

          {currentProfile.isRegistered && (
            <button
              onClick={() => {
                triggerSound("click");
                onClose();
              }}
              className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          <p className="text-xs font-mono text-gray-300 leading-relaxed">
            Configure su nombre y edad para que <strong className="text-hud-cyan">{currentPersonality}</strong> y todo el sistema de asistencia holográfica conozca su identidad, calibre su tono y responda con total exactitud y naturalidad a todas sus preguntas.
          </p>

          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/50 rounded text-red-300 text-xs font-mono flex items-center gap-2 animate-pulse">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Nombre */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-hud-cyan uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>¿Cuál es tu Nombre?</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="Ejemplo: Fernando"
                autoFocus
                className="w-full bg-black/70 border border-hud-cyan/30 rounded px-3.5 py-2.5 text-sm font-mono text-white placeholder-gray-600 focus:border-hud-cyan focus:outline-none focus:ring-1 focus:ring-hud-cyan transition-all"
              />
              <span className="text-[10px] font-mono text-gray-400">
                Así te llamará J.A.R.V.I.S. en cada respuesta.
              </span>
            </div>

            {/* Input Edad */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-hud-cyan uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>¿Cuál es tu Edad?</span>
              </label>
              <input
                type="number"
                min="3"
                max="120"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="Ejemplo: 20"
                className="w-full bg-black/70 border border-hud-cyan/30 rounded px-3.5 py-2.5 text-sm font-mono text-white placeholder-gray-600 focus:border-hud-cyan focus:outline-none focus:ring-1 focus:ring-hud-cyan transition-all"
              />
              <div className="flex items-center gap-1 text-[10px] font-mono">
                {parsedAge > 0 && parsedAge < 13 ? (
                  <span className="text-emerald-400 font-bold">✨ Modo Infantil Didáctico & Heroico</span>
                ) : parsedAge >= 13 && parsedAge < 21 ? (
                  <span className="text-hud-cyan font-bold">🚀 Modo Joven Cadete de Alta Tecnología</span>
                ) : parsedAge >= 21 ? (
                  <span className="text-hud-orange font-bold">🛡️ Modo Ejecutivo & Rigor Científico Stark</span>
                ) : (
                  <span className="text-gray-400">Para adaptar la forma de responderte.</span>
                )}
              </div>
            </div>
          </div>

          {/* Título de tratamiento preferido */}
          <div className="space-y-2 pt-2 border-t border-hud-cyan/10">
            <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-hud-cyan" />
              <span>Tratamiento o Título de Respeto:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {titlesList.map((t) => (
                <button
                  type="button"
                  key={t.label}
                  onClick={() => {
                    setTitle(t.value);
                    triggerSound("click");
                  }}
                  className={`p-2.5 rounded border text-left font-mono transition-all flex flex-col cursor-pointer ${
                    title === t.value
                      ? "bg-hud-cyan/15 border-hud-cyan text-white shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                      : "bg-black/40 border-zinc-800 text-gray-400 hover:border-zinc-700 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{t.label}</span>
                    {title === t.value && <Check className="w-3.5 h-3.5 text-hud-cyan" />}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview of How JARVIS greets the user */}
          <div className="p-3.5 bg-black/60 rounded-lg border border-hud-cyan/20 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-hud-cyan font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulación de Respuesta Personalizada:</span>
            </div>
            <p className="text-xs font-mono text-gray-300 italic">
              "{title ? `${title} ` : ""}{name || "Fernando"}, sus sistemas de asistencia cognitiva están calibrados para sus {age || "20"} años. Cualquier pregunta que me formule será respondida con exactitud y carisma."
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-hud-cyan hover:bg-hud-cyan/90 text-black font-mono font-bold text-xs uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>GUARDAR IDENTIDAD Y ENLAZAR CON J.A.R.V.I.S.</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PilotRegistrationModal;
