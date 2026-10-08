import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, 
  Mic, 
  MicOff, 
  PhoneCall, 
  MapPin, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  X, 
  Send, 
  Activity, 
  Lock, 
  Heart, 
  Flame, 
  Radio, 
  Sparkles,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Zap,
  ShieldCheck
} from "lucide-react";
import { PersonalityId } from "../types";

interface EmergencyCommsModalProps {
  isOpen: boolean;
  onClose: () => void;
  personalityId: PersonalityId;
  personalityName: string;
  threatContext?: string;
  triggerSound: (type: "startup" | "scan" | "success" | "error" | "abort" | "click" | "alarm") => void;
  speak: (text: string) => void;
  stopSpeaking?: () => void;
  addLog: (message: string, type: "info" | "success" | "warning" | "error") => void;
  onLockdownPerimeter?: () => void;
}

interface EmergencyMessage {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: string;
}

export const EmergencyCommsModal: React.FC<EmergencyCommsModalProps> = ({
  isOpen,
  onClose,
  personalityId,
  personalityName,
  threatContext,
  triggerSound,
  speak,
  stopSpeaking,
  addLog,
  onLockdownPerimeter
}) => {
  const [messages, setMessages] = useState<EmergencyMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [alarmActive, setAlarmActive] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [perimeterLocked, setPerimeterLocked] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const alarmIntervalRef = useRef<any>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, liveTranscript]);

  // Initial setup when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      setAlarmActive(false);
      stopListening();
      return;
    }

    triggerSound("alarm");
    addLog(`🚨 [CANAL DE EMERGENCIA] Protocolo activado. Enlace de voz directo con ${personalityName} en curso.`, "error");

    // Fetch GPS coordinates immediately for emergency safety
    fetchLocation();

    // Initial greeting based on personality
    let greeting = "";
    if (personalityId === "FRIDAY") {
      greeting = "¡Protocolo de emergencia activo, Jefe! Estoy en línea prioritaria escuchando su voz. ¿Qué peligro o situación tenemos enfrente?";
    } else if (personalityId === "KAREN") {
      greeting = "¡Alerta activada, joven héroe! No te asustes, estoy aquí contigo y te escucho. Dime qué está pasando para ayudarte.";
    } else if (personalityId === "EDITH") {
      greeting = "Protocolo de emergencia táctica en línea. Canal de voz abierto para recepción de directiva militar. Reporte situación.";
    } else {
      greeting = "Señor, protocolo de emergencia y máxima seguridad activo. Mantenga la calma, estoy enlazado por voz y listo para asistirlo. ¿Cuál es la emergencia?";
    }

    setMessages([
      {
        id: `sys-${Date.now()}`,
        sender: "system",
        text: "SISTEMA DE EMERGENCIA EN LÍNEA // FRECUENCIA TÁCTICA STARK 911 // CANAL DE VOZ PRIORITARIO",
        timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false })
      },
      {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: greeting,
        timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false })
      }
    ]);

    // Speak the greeting
    speak(greeting);

    // Automatically activate voice recognition listening
    setTimeout(() => {
      startListening();
    }, 1200);

    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
      }
      stopListening();
    };
  }, [isOpen]);

  // Alarm sound toggle
  useEffect(() => {
    if (alarmActive) {
      triggerSound("alarm");
      alarmIntervalRef.current = setInterval(() => {
        triggerSound("alarm");
      }, 1500);
    } else {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    }

    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
      }
    };
  }, [alarmActive]);

  // Geolocation fetcher
  const fetchLocation = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setGpsLoading(false);
      },
      (err) => {
        console.warn("GPS telemetry unavailable:", err);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Start continuous voice recognition inside emergency modal
  const startListening = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      addLog("Reconocimiento de voz no soportado por este navegador.", "warning");
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "es-ES";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const results = event.results;
        const lastResult = results[results.length - 1];
        const transcript = lastResult[0].transcript;

        if (lastResult.isFinal) {
          const finalText = transcript.trim();
          setLiveTranscript("");
          if (finalText) {
            handleSendEmergencyMessage(finalText);
          }
        } else {
          setLiveTranscript(transcript);
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error in emergency modal:", e.error);
        if (e.error !== "no-speech") {
          setIsListening(false);
        }
      };

      rec.onend = () => {
        // Auto restart if modal is still open and listening is intended
        if (isOpen) {
          try {
            rec.start();
          } catch {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
    } catch (e) {
      console.warn("Failed to start voice recognition:", e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setLiveTranscript("");
  };

  const toggleMic = () => {
    triggerSound("click");
    if (isListening) {
      stopListening();
      addLog("Micrófono de emergencia silenciado manualmente.", "warning");
    } else {
      startListening();
      addLog("Micrófono de emergencia activado. Transmitiendo voz...", "success");
    }
  };

  // Send message to emergency backend and synthesize response
  const handleSendEmergencyMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isProcessing) return;

    triggerSound("click");
    const userMsgObj: EmergencyMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userMessage.trim(),
      timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false })
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setInputText("");
    setIsProcessing(true);

    try {
      const response = await fetch("/api/emergency-assistance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          personality: personalityId,
          location: gpsLocation,
          threatContext: threatContext || undefined
        })
      });

      const data = await response.json();
      const aiReply = data.response || "Protocolo de contingencia ejecutado. Manténgase a salvo.";

      const aiMsgObj: EmergencyMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiReply,
        timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false })
      };

      setMessages((prev) => [...prev, aiMsgObj]);
      triggerSound("success");

      // Read aloud via voice speech synthesis
      speak(aiReply);
    } catch (err: any) {
      console.error("Emergency assistance error:", err);
      const fallback = personalityId === "JARVIS"
        ? "Señor, he registrado su mensaje. Por favor mantenga la calma, permanezca resguardado y contacte al 911 de inmediato si su integridad corre riesgo."
        : "Alerta procesada. Por favor mantén la calma y comunícate con emergencias al 911 si estás en peligro.";

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: fallback,
          timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false })
        }
      ]);
      speak(fallback);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick Action Buttons
  const handleTriggerQuickAction = (actionPrompt: string) => {
    handleSendEmergencyMessage(actionPrompt);
  };

  const handleLockPerimeter = () => {
    triggerSound("alarm");
    setPerimeterLocked(true);
    if (onLockdownPerimeter) {
      onLockdownPerimeter();
    }
    const msg = personalityId === "JARVIS"
      ? "Señor, protocolo de confinamiento perimetral ejecutado. Accesos sellados e iluminación táctica al máximo."
      : "¡Perímetro asegurado y puertas bloqueadas, Jefe!";
    
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: "system",
        text: "🛡️ [BLOQUEO PERIMETRAL] Protocolo de confinamiento y seguridad Stark activado.",
        timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false })
      }
    ]);
    speak(msg);
  };

  const handleCopyCoords = () => {
    if (!gpsLocation) return;
    const coordsText = `Emergencia - Coordenadas: ${gpsLocation.lat.toFixed(6)}, ${gpsLocation.lng.toFixed(6)} (https://www.google.com/maps?q=${gpsLocation.lat},${gpsLocation.lng})`;
    navigator.clipboard.writeText(coordsText);
    setCopiedCoords(true);
    triggerSound("success");
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn select-none">
      <div 
        className="w-full max-w-5xl h-[92vh] flex flex-col bg-zinc-950 border-2 border-red-500/60 rounded-xl shadow-[0_0_40px_rgba(239,68,68,0.35)] overflow-hidden relative"
      >
        {/* HUD Tactical Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500 pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500 pointer-events-none" />

        {/* Top Emergency Banner */}
        <div className="bg-red-950/70 border-b border-red-500/40 px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded bg-red-500/20 border border-red-500 flex items-center justify-center flex-shrink-0 animate-pulse">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-red-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                  PROTOCOLO DE EMERGENCIA // {personalityName}
                </span>
                <span className="bg-red-500 text-black text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                  ALERTA MÁXIMA
                </span>
              </div>
              <p className="text-xs font-mono text-gray-300 truncate">
                Canal de voz bidireccional de auxilio y directivas tácticas de Stark Industries
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Alarm Siren Toggle */}
            <button
              onClick={() => {
                triggerSound("click");
                setAlarmActive(!alarmActive);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded font-mono text-[10px] font-bold border transition-all cursor-pointer uppercase ${
                alarmActive 
                  ? "bg-red-600 text-white border-red-400 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]" 
                  : "bg-black/60 text-red-400 border-red-500/30 hover:bg-red-500/10"
              }`}
              title="Activar/Desactivar sirena sonora SOS"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{alarmActive ? "SIRENA ENCENDIDA" : "SIRENA SOS"}</span>
            </button>

            {/* Direct 911 Call Link */}
            <a
              href="tel:911"
              className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold px-3 py-1.5 rounded shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all uppercase cursor-pointer"
              title="Llamar directamente a servicios de emergencia"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>LLAMAR 911</span>
            </a>

            <button
              onClick={() => {
                triggerSound("abort");
                onClose();
              }}
              className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Cerrar protocolo de emergencia"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* GPS Telemetry and Status Sub-Bar */}
        <div className="bg-black/80 border-b border-red-500/20 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-red-300">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>UBICACIÓN GPS:</span>
              {gpsLoading ? (
                <span className="text-gray-400 animate-pulse">Triangulando satélites...</span>
              ) : gpsLocation ? (
                <span className="text-white font-bold">
                  {gpsLocation.lat.toFixed(5)}, {gpsLocation.lng.toFixed(5)}
                </span>
              ) : (
                <span className="text-gray-500">No disponible</span>
              )}
            </div>

            {gpsLocation && (
              <button
                onClick={handleCopyCoords}
                className="flex items-center gap-1 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-[10px] px-2 py-0.5 rounded transition-all cursor-pointer"
                title="Copiar enlace de Google Maps con tu ubicación"
              >
                {copiedCoords ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCoords ? "¡Copiado!" : "Copiar Coordenadas"}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLockPerimeter}
              disabled={perimeterLocked}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer uppercase ${
                perimeterLocked
                  ? "bg-emerald-950/80 border-emerald-500 text-emerald-400"
                  : "bg-red-950/80 hover:bg-red-900 border-red-500 text-red-300"
              }`}
            >
              {perimeterLocked ? <ShieldCheck className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              <span>{perimeterLocked ? "PERÍMETRO SELLADO" : "BLOQUEAR PERÍMETRO"}</span>
            </button>
          </div>
        </div>

        {/* Tactical Voice Active Sensor & Waveform Banner */}
        <div className={`border-b px-4 py-2.5 flex items-center justify-between gap-3 transition-all ${
          isListening 
            ? "bg-red-950/40 border-red-500/50" 
            : "bg-zinc-900/50 border-gray-800"
        }`}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={toggleMic}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all flex-shrink-0 cursor-pointer ${
                isListening
                  ? "bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse"
                  : "bg-black/60 border-gray-700 text-gray-400 hover:text-white"
              }`}
              title={isListening ? "Desactivar micrófono" : "Hablar con el asistente de emergencia"}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold uppercase ${isListening ? "text-red-400" : "text-gray-400"}`}>
                  {isListening ? "🎙️ MICRÓFONO EN VIVO // HABLA CON EL ASISTENTE AHORA" : "MICRÓFONO SILENCIADO (Presione para hablar)"}
                </span>
                {isListening && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                )}
              </div>
              
              {liveTranscript ? (
                <p className="text-xs font-mono text-yellow-300 font-semibold truncate animate-pulse">
                  Escuchando: "{liveTranscript}"
                </p>
              ) : (
                <p className="text-[11px] font-mono text-gray-400 truncate">
                  Puedes decir: "¿Qué hago en caso de quemadura?", "Hay alguien afuera", "Guía de RCP", etc.
                </p>
              )}
            </div>
          </div>

          {/* Quick Voice Mode indicator bars */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className={`w-1 h-6 rounded-full bg-red-500 ${isListening ? "animate-pulse" : "opacity-30"}`} />
            <div className={`w-1 h-8 rounded-full bg-red-400 ${isListening ? "animate-bounce" : "opacity-30"}`} />
            <div className={`w-1 h-5 rounded-full bg-red-500 ${isListening ? "animate-pulse" : "opacity-30"}`} />
            <div className={`w-1 h-7 rounded-full bg-red-400 ${isListening ? "animate-bounce" : "opacity-30"}`} />
            <div className={`w-1 h-4 rounded-full bg-red-500 ${isListening ? "animate-pulse" : "opacity-30"}`} />
          </div>
        </div>

        {/* Quick Emergency Voice Actions Chips */}
        <div className="bg-black/60 border-b border-red-500/15 px-4 py-2 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
          <span className="text-red-400 font-bold uppercase flex-shrink-0">Órdenes Rápidas:</span>
          
          <button
            onClick={() => handleTriggerQuickAction("Estoy en una emergencia médica y necesito asistencia inmediata")}
            className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900/80 border border-red-500/30 text-red-200 px-3 py-1 rounded transition-colors flex-shrink-0 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <span>Emergencia Médica</span>
          </button>

          <button
            onClick={() => handleTriggerQuickAction("Indícame paso a paso cómo realizar Reanimación Cardiopulmonar (RCP)")}
            className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900/80 border border-red-500/30 text-red-200 px-3 py-1 rounded transition-colors flex-shrink-0 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-red-400" />
            <span>Guía de RCP</span>
          </button>

          <button
            onClick={() => handleTriggerQuickAction("Hay fuego o humo en mi habitación, ¿qué protocolo debo seguir de inmediato?")}
            className="flex items-center gap-1.5 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/30 text-amber-200 px-3 py-1 rounded transition-colors flex-shrink-0 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Fuego o Humo</span>
          </button>

          <button
            onClick={() => handleTriggerQuickAction("Detecto una intrusión o peligro exterior. Asegura todos los accesos")}
            className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900/80 border border-red-500/30 text-red-200 px-3 py-1 rounded transition-colors flex-shrink-0 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span>Intrusión / Bloqueo</span>
          </button>

          <button
            onClick={() => handleTriggerQuickAction("Siento un ataque de pánico o ansiedad intensa, ayúdame a tranquilizarme con una técnica de respiración guiada")}
            className="flex items-center gap-1.5 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/30 text-blue-200 px-3 py-1 rounded transition-colors flex-shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Calmar Crisis / Pánico</span>
          </button>
        </div>

        {/* Conversation Dialogue Hub */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-950/95 font-mono text-xs">
          {messages.map((msg) => {
            if (msg.sender === "system") {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="bg-red-950/40 border border-red-500/30 text-red-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-2xl ${isUser ? "ml-auto" : "mr-auto"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className={`text-[10px] font-bold uppercase ${isUser ? "text-gray-400" : "text-red-400"}`}>
                    {isUser ? "👤 USUARIO" : `🤖 ${personalityName} (PROTOCOLO AUXILIO)`}
                  </span>
                  <span className="text-[9px] text-gray-500">{msg.timestamp}</span>
                </div>
                <div
                  className={`p-3.5 rounded-lg border leading-relaxed ${
                    isUser
                      ? "bg-zinc-900 text-gray-200 border-zinc-700 shadow-md"
                      : "bg-red-950/40 text-red-100 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono bg-red-950/30 border border-red-500/30 p-2.5 rounded-md w-fit animate-pulse">
              <Activity className="w-4 h-4 animate-spin" />
              <span>Procesando directiva de emergencia con el núcleo cognitivo de Stark...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Text and Voice Input Bar */}
        <div className="p-3 bg-black/90 border-t border-red-500/30 flex items-center gap-2">
          <button
            onClick={toggleMic}
            className={`p-2.5 rounded-md border transition-all cursor-pointer ${
              isListening
                ? "bg-red-600 border-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                : "bg-zinc-900 border-gray-700 text-gray-400 hover:text-white"
            }`}
            title={isListening ? "Micrófono activado" : "Activar micrófono"}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendEmergencyMessage(inputText);
              }
            }}
            placeholder="Escribe o habla tu situación de emergencia..."
            className="flex-1 bg-zinc-900/90 border border-red-500/30 rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-mono"
          />

          <button
            onClick={() => handleSendEmergencyMessage(inputText)}
            disabled={!inputText.trim() || isProcessing}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-mono font-bold text-xs px-4 py-2.5 rounded-md transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>TRANSMITIR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
