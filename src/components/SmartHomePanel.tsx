import React, { useState } from "react";
import { 
  Tv, 
  Wind, 
  Lightbulb, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Volume2, 
  Activity,
  PlayCircle,
  Radio,
  Power,
  Sliders,
  Cpu,
  Monitor,
  VolumeX,
  Smartphone,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface SmartHomePanelProps {
  personalityName: string;
  personalityId: string;
  triggerSound: (type: "startup" | "scan" | "success" | "error" | "abort" | "click" | "alarm") => void;
  addLog: (message: string, type: "info" | "success" | "warning" | "error") => void;
  speak: (text: string) => void;
  tvState?: { on: boolean; volume: number; channel: string };
  setTvState?: React.Dispatch<React.SetStateAction<{ on: boolean; volume: number; channel: string }>>;
  fanState?: { on: boolean; speed: "Bajo" | "Medio" | "Turbo" };
  setFanState?: React.Dispatch<React.SetStateAction<{ on: boolean; speed: "Bajo" | "Medio" | "Turbo" }>>;
  lightsState?: { on: boolean; color: string; brightness: number };
  setLightsState?: React.Dispatch<React.SetStateAction<{ on: boolean; color: string; brightness: number }>>;
  shieldDoorState?: { locked: boolean };
  setShieldDoorState?: React.Dispatch<React.SetStateAction<{ locked: boolean }>>;
  hasPermissionState?: boolean;
  setHasPermissionState?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SmartHomePanel({
  personalityName,
  personalityId,
  triggerSound,
  addLog,
  speak,
  tvState,
  setTvState,
  fanState,
  setFanState,
  lightsState,
  setLightsState,
  shieldDoorState,
  setShieldDoorState,
  hasPermissionState,
  setHasPermissionState
}: SmartHomePanelProps) {
  // Global subtab selection
  const [activeSubTab, setActiveSubTab] = useState<"devices" | "activation">("devices");
  
  // Smart Home Permissions (Controlled or Local)
  const [localHasPermission, setLocalHasPermission] = useState<boolean>(true);
  const hasPermission = hasPermissionState !== undefined ? hasPermissionState : localHasPermission;
  const setHasPermission = setHasPermissionState || setLocalHasPermission;
  
  // Smart Home Device States (Controlled or Local)
  const [localTv, setLocalTv] = useState({ on: false, volume: 18, channel: "Canal Stark Labs" });
  const tv = tvState !== undefined ? tvState : localTv;
  const setTv = setTvState || setLocalTv;

  const [localFan, setLocalFan] = useState({ on: false, speed: "Medio" as "Bajo" | "Medio" | "Turbo" });
  const fan = fanState !== undefined ? fanState : localFan;
  const setFan = setFanState || setLocalFan;

  const [localLights, setLocalLights] = useState({ on: true, color: "HUD Cyan", brightness: 70 });
  const lights = lightsState !== undefined ? lightsState : localLights;
  const setLights = setLightsState || setLocalLights;

  const [localShieldDoor, setLocalShieldDoor] = useState({ locked: true });
  const shieldDoor = shieldDoorState !== undefined ? shieldDoorState : localShieldDoor;
  const setShieldDoor = setShieldDoorState || setLocalShieldDoor;

  // Activation Config States
  const [autoBootGreeting, setAutoBootGreeting] = useState<boolean>(true);
  const [backgroundHotMic, setBackgroundHotMic] = useState<boolean>(false);
  const [acousticSensitivity, setAcousticSensitivity] = useState<number>(75);

  const togglePermission = () => {
    triggerSound("click");
    const nextPermission = !hasPermission;
    setHasPermission(nextPermission);
    
    if (nextPermission) {
      triggerSound("success");
      addLog(`ACCESO CONCEDIDO: El Asistente ${personalityName} ahora tiene control absoluto de los sistemas domóticos de Stark Labs.`, "success");
      
      const welcomeMsg = personalityId === "JARVIS" 
        ? "Señor, protocolo domótico integrado de forma exitosa. Red de la casa en línea y bajo mi supervisión activa."
        : personalityId === "FRIDAY"
        ? "¡Excelente, Jefe! Tengo acceso directo a la tele, las luces y el ventilador de la casa. Todo listo."
        : personalityId === "KAREN"
        ? "¡Genial! Los controles del hogar están conectados. Prometo cuidar tu casa con la máxima seguridad, joven héroe."
        : "Llave del perímetro integrada. Control de energía de Stark Labs activo. Listo para seguir órdenes.";
        
      speak(welcomeMsg);
    } else {
      triggerSound("abort");
      addLog("ACCESO DENEGADO: El permiso de control inteligente de Stark Labs ha sido revocado del asistente.", "warning");
      
      const revokeMsg = personalityId === "JARVIS"
        ? "Entendido, Señor. Me he retirado de los sistemas auxiliares de la casa de forma segura."
        : personalityId === "FRIDAY"
        ? "Acceso cortado, Jefe. El control de la casa ya no está en mi rango de red."
        : personalityId === "KAREN"
        ? "Acceso removido del traje. No te preocupes, regresando al modo autónomo local."
        : "Permisos restringidos. Retirándome del sistema del perímetro auxiliar.";
        
      speak(revokeMsg);
    }
  };

  // Run structured vocal command simulator
  const runVoiceCommand = (commandId: string, commandText: string) => {
    triggerSound("click");
    
    // Safety check for permissions
    if (!hasPermission) {
      triggerSound("error");
      addLog(`ORDEN BLOQUEADA: Intento de comando sin permisos de Stark Home.`, "error");
      
      const failMsg = personalityId === "JARVIS"
        ? "Lo lamento Señor, pero no me ha concedido los permisos digitales necesarios para interactuar con la red doméstica."
        : personalityId === "FRIDAY"
        ? "Oye, Jefe, no puedo hacer eso. Dame los permisos domóticos primero si quieres que controle las cosas."
        : personalityId === "KAREN"
        ? "Oh, lo siento, no tengo los accesos inteligentes necesarios en el panel superior, joven héroe."
        : "Operación abortada por restricción de credenciales. Se requiere permiso explícito en la red auxiliar.";
        
      speak(failMsg);
      return;
    }

    addLog(`Comando de voz detectado: "${commandText}"`, "info");
    
    if (commandId === "youtube_all_channels") {
      const ytUrl = "https://www.youtube.com/feed/channels";
      try {
        window.open(ytUrl, "_blank");
      } catch (e) {
        console.error(e);
      }
      triggerSound("success");
      
      const msg = personalityId === "JARVIS"
        ? `Señor, he sintonizado el portal global de canales de YouTube para su exploración.`
        : personalityId === "FRIDAY"
        ? `¡Todos los canales de YouTube a la orden, Jefe! Consola abierta de inmediato.`
        : personalityId === "KAREN"
        ? `¡Qué divertido! He abierto la lista de canales de YouTube para que elijas tu favorito.`
        : `Mapeo de canales completado. Visualizando feed global de YouTube.`;
      
      speak(msg);
      addLog(`Servicio de Red: Portal global de canales en YouTube abierto de forma remota.`, "success");
    }

    else if (commandId === "youtube_channel") {
      const creatorName = "Fernanfloo";
      const ytUrl = "https://www.youtube.com/@Fernanfloo";
      try {
        window.open(ytUrl, "_blank");
      } catch (e) {
        console.error(e);
      }
      triggerSound("success");
      
      const msg = personalityId === "JARVIS"
        ? `Excelente Señor, he sintonizado el canal principal de "${creatorName}" en YouTube para usted.`
        : personalityId === "FRIDAY"
        ? `¡Canal de "${creatorName}" localizado, Jefe! Abriendo YouTube de inmediato.`
        : personalityId === "KAREN"
        ? `¡Qué divertido! Abriendo el canal de "${creatorName}" en YouTube para ti, joven héroe.`
        : `Acceso concedido al canal de "${creatorName}" en YouTube. Enlace satelital abierto.`;
      
      speak(msg);
      addLog(`Servicio de Red: Canal de "${creatorName}" abierto de forma remota en YouTube.`, "success");
    }

    else if (commandId === "music_play") {
      const songTitle = "Back In Black de AC/DC";
      const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songTitle)}`;
      try {
        window.open(ytUrl, "_blank");
      } catch (e) {
        console.error(e);
      }
      triggerSound("success");
      
      const msg = personalityId === "JARVIS"
        ? `Excelente Señor, he sintonizado la pista "${songTitle}" en YouTube para amenizar el laboratorio.`
        : personalityId === "FRIDAY"
        ? `¡"Back in Black" a tope, Jefe! Abriendo YouTube para que ruede la música.`
        : personalityId === "KAREN"
        ? `¡Qué temazo! Abriendo "${songTitle}" en YouTube para ti, joven héroe.`
        : `Reproducción acústica autorizada: "${songTitle}". Transmisión satelital de YouTube activa.`;
      
      speak(msg);
      addLog(`Música Inteligente: Reproduciendo "${songTitle}" en YouTube de forma remota.`, "success");
    }

    else if (commandId === "tv_on") {
      setTv(prev => ({ ...prev, on: true, channel: "Transmisión Stark Labs" }));
      triggerSound("scan");
      
      const msg = personalityId === "JARVIS"
        ? "Enseguida, Señor. He encendido el televisor OLED y configurado el canal de diagnóstico en Stark Labs."
        : personalityId === "FRIDAY"
        ? "¡Tele encendida, Jefe! Te puse nuestro canal especial de Stark Labs de una vez."
        : personalityId === "KAREN"
        ? "Claro que sí, joven héroe. Encendí la tele en tu canal favorito en un santiamén."
        : "Televisión de pantalla ancha activada. Canal de datos Stark Labs sintonizado de inmediato.";
      
      speak(msg);
      addLog("Televisor de la sala: ENCENDIDO (Canal: Transmisión Stark Labs)", "success");
    } 
    
    else if (commandId === "fan_turbo") {
      setFan({ on: true, speed: "Turbo" });
      triggerSound("startup");
      
      const msg = personalityId === "JARVIS"
        ? "Como ordene. He encendido el ventilador a la máxima potencia. Velocidad Turbo en línea."
        : personalityId === "FRIDAY"
        ? "¡Ventilador al máximo, Jefe! Flujo de aire de campaña activado en modo Turbo."
        : personalityId === "KAREN"
        ? "¡Uf, hace calor! Ventilador en marcha a velocidad Turbo, joven héroe."
        : "Sistemas de enfriamiento al 100%. Flujo del ventilador regulado en nivel Turbo táctico.";
        
      speak(msg);
      addLog("Ventilador inteligente: ENCENDIDO (Flujo: Turbo)", "success");
    } 
    
    else if (commandId === "lights_red") {
      setLights({ on: true, color: "Stark Red", brightness: 100 });
      triggerSound("scan");
      
      const msg = personalityId === "JARVIS"
        ? "Entendido. Modificando tonos visuales a Rojo Stark. Brillo al cien por ciento para iluminación de protocolo de alarma militar."
        : personalityId === "FRIDAY"
        ? "¡Tono Rojo Stark encendido! Alerta visual activa en toda la residencia, Jefe."
        : personalityId === "KAREN"
        ? "¡Qué genial se ve! Luces de la casa en el color Rojo Stark para tus misiones de héroe."
        : "Ajuste de reflectores prioritario. Tono Rojo Stark activado al máximo nivel de lúmenes.";
        
      speak(msg);
      addLog("Iluminación inteligente: Rojo Stark (Brillo 100%)", "success");
    } 
    
    else if (commandId === "door_lock") {
      setShieldDoor({ locked: true });
      triggerSound("success");
      
      const msg = personalityId === "JARVIS"
        ? "Cerrando y reforzando los pestillos automáticos. El cerrojo biométrico perimetral principal está completamente asegurado."
        : personalityId === "FRIDAY"
        ? "Puertas blindadas y cerrojo asegurado al momento, Jefe. Nadie entra sin tu permiso."
        : personalityId === "KAREN"
        ? "Entendido, joven héroe. Aseguré el cerrojo biométrico inmediatamente para total seguridad."
        : "Medida de defensa preventiva ejecutada. Cerrojo blindado de la residencia asegurada.";
        
      speak(msg);
      addLog("Cerrojo biométrico Stark: TOTALMENTE ASEGURADO", "success");
    } 
    
    else if (commandId === "all_off") {
      setTv(prev => ({ ...prev, on: false }));
      setFan(prev => ({ ...prev, on: false }));
      setLights(prev => ({ ...prev, on: false }));
      setShieldDoor({ locked: true });
      triggerSound("abort");
      
      const msg = personalityId === "JARVIS"
        ? "Señor, he ejecutado el apagado general del hogar. Luces, ventilador y tele apagados. Que descanse."
        : personalityId === "FRIDAY"
        ? "¡Ok, Jefe! Apagué toda la casa para ahorrar energía. El cerrojo sigue cerrado por seguridad."
        : personalityId === "KAREN"
        ? "Listo. Apagué todo lo que estaba encendido en la casa para que puedas descansar tranquilo."
        : "Protocolo de hibernación domótico ejecutado. Todos los módulos exteriores desconectados.";
        
      speak(msg);
      addLog("Apagado integral de Stark Home activado con éxito.", "warning");
    }
  };

  // Simulates various smart ways to trigger/wake Jarvis
  const simulateWakeMethod = (type: "app_opening" | "voice_wakeword" | "hand_clap" | "device_knock") => {
    triggerSound("startup");
    
    if (type === "app_opening") {
      addLog(`[INICIALIZACIÓN AUTO-BOOT] Simulando apertura instantánea de la aplicación.`, "info");
      const msg = personalityId === "JARVIS"
        ? "Sistemas en línea Señor. Matriz de sensores ópticos acoplada. Listo para interactuar."
        : personalityId === "FRIDAY"
        ? "¡Hola Jefe! Ya se cargó todo en pantalla. Dime qué analizamos hoy."
        : personalityId === "KAREN"
        ? "¡Hola de nuevo! Traje cargado y listo para nuestra siguiente gran aventura."
        : "Vigilancia iniciada de forma automática. Base de datos global cargada de inmediato.";
      speak(msg);
      addLog(`Auto-arranque verificado: Asistente respondió al iniciar la app.`, "success");
    }
    
    else if (type === "voice_wakeword") {
      addLog(`[WAKE-WORD SIMULADA] Sensor acústico perimetral recibió la llamada: "Oye ${personalityName}"`, "success");
      const msg = personalityId === "JARVIS"
        ? `Sí, Señor. Aquí me tiene a su total servicio, incluso en segundo plano. ¿Cuál es su directiva?`
        : personalityId === "FRIDAY"
        ? `¡Dime Jefa! ¿O debería decir, Jefe? Te escucho bien y claro.`
        : personalityId === "KAREN"
        ? `¡Aquí estoy! Te escuché llamarme y aparecí de inmediato. ¿En qué soy de ayuda?`
        : `Servidor auxiliar reaccionando a la clave nominal. En espera de instrucciones de voz.`;
      speak(msg);
    }
    
    else if (type === "hand_clap") {
      addLog(`[ANÁLISIS SÓNICO] Doble aplauso de manos detectado (Modo Domótico Libre).`, "info");
      const msg = personalityId === "JARVIS"
        ? "Señor, mis micrófonos detectaron el patrón de doble aplauso perimetral. Activando iluminación de cortesía."
        : personalityId === "FRIDAY"
        ? "¡Ese aplauso lo dice todo! Encendiendo el ambiente al instante, Jefe."
        : personalityId === "KAREN"
        ? "¡Vaya! Escuché tus aplausos. Déjame configurar todo rápidamente para ti."
        : "Patrón sónico binario decodificado. Alternando matriz de energía principal.";
      
      setLights({ on: true, color: "HUD Cyan", brightness: 90 });
      speak(msg);
    }
    
    else if (type === "device_knock") {
      addLog(`[ACELERÓMETRO DISPOSITIVO] Golpe del chasquido biométrico detectado en el armazón.`, "warning");
      const msg = personalityId === "JARVIS"
        ? "He detectado el chasquido manual físico en el marco del visualizador. Ejecutando diagnóstico de alarma perimetral."
        : personalityId === "FRIDAY"
        ? "¡Uy! Sentí ese chasquido táctil en el traje. Iniciando escaneo de inmediato."
        : personalityId === "KAREN"
        ? "¡Eso debió doler un poco! Escaneando el traje táctil a tu orden, joven héroe."
        : "Vibración estructural detectada. Diagnóstico de resistencia iniciado en Stark Labs.";
      speak(msg);
    }
  };

  const handleTvToggle = () => {
    if (!hasPermission) return;
    triggerSound("click");
    const nextOn = !tv.on;
    setTv(prev => ({ ...prev, on: nextOn }));
    addLog(`Televisor Stark: ${nextOn ? "ENCENDIDO" : "APAGADO"}`, nextOn ? "success" : "warning");
  };

  const handleFanToggle = () => {
    if (!hasPermission) return;
    triggerSound("click");
    const nextOn = !fan.on;
    setFan(prev => ({ ...prev, on: nextOn }));
    addLog(`Ventilador inteligente: ${nextOn ? "ENCENDIDO" : "APAGADO"}`, nextOn ? "success" : "warning");
  };

  const handleLightsToggle = () => {
    if (!hasPermission) return;
    triggerSound("click");
    const nextOn = !lights.on;
    setLights(prev => ({ ...prev, on: nextOn }));
    addLog(`Luces inteligentes de la sala: ${nextOn ? "ENCENDIDAS" : "APAGADAS"}`, nextOn ? "success" : "warning");
  };

  const handleDoorToggle = () => {
    if (!hasPermission) return;
    triggerSound("click");
    const nextLocked = !shieldDoor.locked;
    setShieldDoor({ locked: nextLocked });
    addLog(`Cerrojo biométrico Stark: ${nextLocked ? "ASEGURADO" : "DESBLOQUEADO"}`, nextLocked ? "success" : "warning");
  };

  return (
    <div className="hud-panel rounded relative overflow-hidden flex-1 flex flex-col p-4 md:p-5 text-gray-300">
      
      {/* Title */}
      <div className="border-b border-hud-cyan/15 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-hud-cyan animate-pulse" />
          <h3 className="text-sm font-mono font-bold text-hud-cyan tracking-wider uppercase">
            Sistemas Domóticos y Métodos de Despertar Stark
          </h3>
        </div>
        
        {/* Toggle Panel Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => { triggerSound("click"); setActiveSubTab("devices"); }}
            className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase transition-all rounded border cursor-pointer ${
              activeSubTab === "devices"
                ? "bg-hud-cyan text-black border-hud-cyan font-bold"
                : "bg-black/40 border-hud-cyan/15 text-gray-400 hover:text-hud-cyan"
            }`}
          >
            🏠 Control de Dispositivos
          </button>
          <button
            onClick={() => { triggerSound("click"); setActiveSubTab("activation"); }}
            className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase transition-all rounded border cursor-pointer ${
              activeSubTab === "activation"
                ? "bg-hud-cyan text-black border-hud-cyan font-bold"
                : "bg-black/40 border-hud-cyan/15 text-gray-400 hover:text-hud-cyan"
            }`}
          >
            🔌 Protocolos Wake-up J.A.R.V.I.S.
          </button>
        </div>
      </div>

      {activeSubTab === "devices" ? (
        <>
          <p className="text-xs font-sans text-gray-400 mb-4 leading-relaxed">
            Controle de forma remota los dispositivos inteligentes de su hogar desde el sistema de red de Stark Labs. Al conceder los permisos correspondientes, <strong className="text-hud-cyan">{personalityName}</strong> enlazará de manera inalámbrica con su televisión, aire/ventiladores y cerraduras biométricas.
          </p>

          {/* Permission Section (Give Permission First) */}
          <div className={`mb-5 p-4 rounded border transition-all ${
            hasPermission 
              ? "bg-green-500/5 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.05)]" 
              : "bg-red-500/5 border-red-500/25"
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full ${hasPermission ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {hasPermission ? <ShieldCheck className="w-6 h-6 animate-pulse" /> : <ShieldAlert className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
                    Permisos de Control Doméstico: 
                    <span className={hasPermission ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                      {hasPermission ? "CONCEDIDOS" : "RESTRINGIDOS"}
                    </span>
                  </h4>
                  <p className="text-[10px] font-mono text-gray-400 mt-1 leading-normal max-w-lg">
                    Conceda permisos perimetrales para que el asistente regule el voltaje, apague luces y cierre cerrojos biométricos automáticamente.
                  </p>
                </div>
              </div>
              
              <button
                onClick={togglePermission}
                className={`w-full sm:w-auto px-5 py-2.5 font-mono font-bold text-xs uppercase rounded cursor-pointer transition-all border ${
                  hasPermission
                    ? "bg-red-500/10 border-red-500 text-red-400 hover:bg-red-500/20"
                    : "bg-green-500 text-black border-transparent font-bold hover:bg-green-400 hover:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                }`}
              >
                {hasPermission ? "Revocar Permisos" : "Dar Permiso al Asistente"}
              </button>
            </div>
          </div>

          {/* Grid of Interactive Smart Home Devices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            
            {/* Device 1: Televisión */}
            <div className={`p-3.5 bg-black/45 border rounded transition-all flex flex-col justify-between ${
              !hasPermission 
                ? "opacity-50 border-hud-border/5" 
                : tv.on 
                ? "border-hud-cyan/50 bg-hud-cyan/5 shadow-[0_0_12px_rgba(0,240,255,0.04)]" 
                : "border-hud-border/10 hover:border-hud-cyan/30"
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                    PANTALLA DE ENTRETENIMIENTO
                  </span>
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded border uppercase ${
                    !hasPermission ? "bg-gray-800 text-gray-500 border-gray-700/20" : tv.on ? "bg-hud-cyan/10 text-hud-cyan border-hud-cyan/30" : "bg-black/60 text-gray-400 border-hud-border/20"
                  }`}>
                    {tv.on ? "ENCENDIDO" : "APAGADO"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${tv.on ? "bg-hud-cyan/15 text-hud-cyan text-glow" : "bg-black/55 text-gray-600"}`}>
                    <Tv className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase">SmarTV OLED 8K</h4>
                    <p className="text-[10px] font-mono text-gray-500">{tv.channel} (Vol: {tv.volume}%)</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-hud-border/5 flex items-center justify-between gap-3">
                <button
                  onClick={handleTvToggle}
                  disabled={!hasPermission}
                  className={`text-[9px] font-mono font-bold px-3 py-1.5 rounded uppercase border transition-all cursor-pointer ${
                    !hasPermission 
                      ? "bg-transparent border-gray-800 text-gray-600 cursor-not-allowed" 
                      : tv.on 
                      ? "bg-red-500/10 border-red-500/35 text-red-400 hover:bg-red-500/20" 
                      : "bg-hud-cyan/10 border-hud-cyan/30 text-hud-cyan hover:bg-hud-cyan/20"
                  }`}
                >
                  {tv.on ? "Apagar Tele" : "Encender Tele"}
                </button>
                
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-gray-500" />
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={tv.volume}
                    disabled={!hasPermission || !tv.on}
                    onChange={(e) => {
                      setTv(prev => ({ ...prev, volume: parseInt(e.target.value) }));
                    }}
                    className="w-16 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-hud-cyan disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Device 2: Ventilador/Climatizador */}
            <div className={`p-3.5 bg-black/45 border rounded transition-all flex flex-col justify-between ${
              !hasPermission 
                ? "opacity-50 border-hud-border/5" 
                : fan.on 
                ? "border-hud-cyan/50 bg-hud-cyan/5 shadow-[0_0_12px_rgba(0,240,255,0.04)]" 
                : "border-hud-border/10 hover:border-hud-cyan/30"
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                    CLIMATIZACIÓN AUTOMATIZADA
                  </span>
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded border uppercase ${
                    !hasPermission ? "bg-gray-800 text-gray-500 border-gray-700/20" : fan.on ? "bg-hud-cyan/10 text-hud-cyan border-hud-cyan/30" : "bg-black/60 text-gray-400 border-hud-border/20"
                  }`}>
                    {fan.on ? "ENCENIDO" : "APAGADO"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${fan.on ? "bg-hud-cyan/15 text-hud-cyan animate-spin" : "bg-black/55 text-gray-600"}`} style={{ animationDuration: fan.speed === "Turbo" ? "1s" : fan.speed === "Medio" ? "2.5s" : "4s" }}>
                    <Wind className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase">Aire y Ventilador</h4>
                    <p className="text-[10px] font-mono text-gray-500">Intensidad de giro: {fan.speed}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-hud-border/5 flex items-center justify-between gap-3">
                <button
                  onClick={handleFanToggle}
                  disabled={!hasPermission}
                  className={`text-[9px] font-mono font-bold px-3 py-1.5 rounded uppercase border transition-all cursor-pointer ${
                    !hasPermission 
                      ? "bg-transparent border-gray-800 text-gray-600 cursor-not-allowed" 
                      : fan.on 
                      ? "bg-red-500/10 border-red-500/35 text-red-400 hover:bg-red-500/20" 
                      : "bg-hud-cyan/10 border-hud-cyan/30 text-hud-cyan hover:bg-hud-cyan/20"
                  }`}
                >
                  {fan.on ? "Apagar Ventilador" : "Encender Ventilador"}
                </button>

                <select
                  value={fan.speed}
                  disabled={!hasPermission || !fan.on}
                  onChange={(e) => {
                    const spd = e.target.value as "Bajo" | "Medio" | "Turbo";
                    setFan(prev => ({ ...prev, speed: spd }));
                    triggerSound("click");
                    addLog(`Velocidad de flujo domótico regulado a un nivel [${spd}].`, "info");
                  }}
                  className="bg-black/60 border border-hud-border/20 text-gray-300 font-mono text-[9px] px-2 py-1 rounded outline-none disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="Bajo">Mínimo (Bajo)</option>
                  <option value="Medio">Regular (Medio)</option>
                  <option value="Turbo">Máximo (Turbo) 💨</option>
                </select>
              </div>
            </div>

            {/* Device 3: Luces Inteligentes */}
            <div className={`p-3.5 bg-black/45 border rounded transition-all flex flex-col justify-between ${
              !hasPermission 
                ? "opacity-50 border-hud-border/5" 
                : lights.on 
                ? "border-hud-orange/50 bg-hud-orange/5 shadow-[0_0_12px_rgba(255,153,0,0.04)]" 
                : "border-hud-border/10 hover:border-hud-cyan/30"
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                    ILUMINACIÓN LED AUTOMÁTICA
                  </span>
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded border uppercase ${
                    !hasPermission ? "bg-gray-800 text-gray-500 border-gray-700/20" : lights.on ? "bg-hud-orange/10 text-hud-orange border-hud-orange/30" : "bg-black/60 text-gray-400 border-hud-border/20"
                  }`}>
                    {lights.on ? "ENCENDIDO" : "APAGADO"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${lights.on ? "bg-hud-orange/15 text-hud-orange animate-pulse" : "bg-black/55 text-gray-600"}`}>
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase">Reflectores Perimetrales</h4>
                    <p className="text-[10px] font-mono text-gray-500">Tonalidad: {lights.color} (Intensidad: {lights.brightness}%)</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-hud-border/5 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                <button
                  onClick={handleLightsToggle}
                  disabled={!hasPermission}
                  className={`text-[9px] font-mono font-bold px-4 py-1.5 rounded uppercase border transition-all cursor-pointer ${
                    !hasPermission 
                      ? "bg-transparent border-gray-800 text-gray-600 cursor-not-allowed" 
                      : lights.on 
                      ? "bg-red-500/10 border-red-500/35 text-red-400 hover:bg-red-500/20" 
                      : "bg-hud-cyan/10 border-hud-cyan/30 text-hud-cyan hover:bg-hud-cyan/20"
                  }`}
                >
                  {lights.on ? "Apagar Luces" : "Encender Luces"}
                </button>

                <div className="flex gap-1.5">
                  {["HUD Cyan", "Stark Red", "Gold Aura"].map(c => (
                    <button
                      key={c}
                      disabled={!hasPermission || !lights.on}
                      onClick={() => {
                        setLights(prev => ({ ...prev, color: c }));
                        triggerSound("click");
                        addLog(`Luces transformadas al preset cromático [${c}].`, "info");
                      }}
                      className={`w-4.5 h-4.5 rounded-full border cursor-pointer ${
                        c === "HUD Cyan" ? "bg-hud-cyan border-hud-cyan/40" : c === "Stark Red" ? "bg-hud-red border-red-500/40" : "bg-yellow-500 border-yellow-500/40"
                      } ${lights.color === c ? "scale-125 ring-2 ring-white/50" : "opacity-50 hover:opacity-100"} disabled:opacity-20 disabled:cursor-not-allowed`}
                      title={`Tonalidad: ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Device 4: Cerrojo Biométrico */}
            <div className={`p-3.5 bg-black/45 border rounded transition-all flex flex-col justify-between ${
              !hasPermission 
                ? "opacity-50 border-hud-border/5" 
                : shieldDoor.locked 
                ? "border-green-500/40 bg-green-500/5 shadow-[0_0_12px_rgba(34,197,94,0.03)]" 
                : "border-ref-500/40 bg-red-500/5 shadow-[0_0_12px_rgba(239,68,68,0.03)]"
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                    RED DE SEGURIDAD GENERAL
                  </span>
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded border uppercase ${
                    !hasPermission ? "bg-gray-800 text-gray-500 border-gray-700/20" : shieldDoor.locked ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}>
                    {shieldDoor.locked ? "BLOQUEADO" : "DESTRABADO"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${shieldDoor.locked ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                    {shieldDoor.locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase">Cerrojo Stark Biométrico</h4>
                    <p className="text-[10px] font-mono text-gray-500">Estado de compresión: {shieldDoor.locked ? "Pestillo perimetral magnético de alta resistencia activo" : "Abierto / Tránsito libre perimetral"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-hud-border/5 flex items-center justify-between gap-3">
                <button
                  onClick={handleDoorToggle}
                  disabled={!hasPermission}
                  className={`text-[9px] font-mono font-bold px-3 py-1.5 rounded uppercase border transition-all cursor-pointer ${
                    !hasPermission 
                      ? "bg-transparent border-gray-800 text-gray-600 cursor-not-allowed" 
                      : shieldDoor.locked 
                      ? "bg-red-500/10 border-red-500/35 text-red-400 hover:bg-red-500/20" 
                      : "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                  }`}
                >
                  {shieldDoor.locked ? "Destrabar Cerrojo" : "Bloquear Cerradura"}
                </button>
              </div>
            </div>

          </div>

          {/* Voice Command Testing section */}
          <div className="border-t border-hud-cyan/10 pt-4 mt-auto">
            <span className="text-[9px] font-mono text-hud-cyan uppercase tracking-widest block mb-1.5 font-bold">
              🗣️ SIMULAR ÓRDENES DE VOZ DE CONTROL INTELIGENTE:
            </span>
            <p className="text-[10px] font-mono text-gray-400 mb-3 leading-normal">
              Pulsa en cualquiera de las siguientes claves verbales para comprobar cómo el asistente procesa órdenes del hogar:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { id: "tv_on", cmd: "Enciende la tele en Stark Labs", label: "📺 Encender Pantalla OLED" },
                { id: "fan_turbo", cmd: "Pon la velocidad del ventilador en Turbo", label: "💨 Aire al Máximo" },
                { id: "music_play", cmd: "Reproduce la canción Back In Black de AC/DC", label: "🎵 Reproducir en YouTube" },
                { id: "youtube_channel", cmd: "Llévame al canal de Fernanfloo", label: "📺 Canal de Fernanfloo" },
                { id: "youtube_all_channels", cmd: "Muéstrame todos los canales de youtube", label: "📋 Todos los Canales" },
                { id: "lights_red", cmd: "Enciende las luces en Rojo Stark", label: "🔥 Cambiar a Alerta Roja" },
                { id: "door_lock", cmd: "Asegura la cerradura principal", label: "🔐 Cerrar Búnker" },
                { id: "all_off", cmd: "Apaga todos los dispositivos de la casa", label: "💤 Hibernar Todo" }
              ].map(command => (
                <button
                  key={command.id}
                  onClick={() => runVoiceCommand(command.id, command.cmd)}
                  className="p-2.5 rounded bg-black/65 border border-hud-border/15 hover:border-hud-cyan/45 text-left font-mono transition-all hover:bg-black/90 flex items-start gap-2 group cursor-pointer"
                >
                  <PlayCircle className="w-3.5 h-3.5 text-hud-cyan group-hover:scale-110 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[9px] font-bold text-gray-300 group-hover:text-hud-cyan transition-colors">{command.label}</div>
                    <div className="text-[8px] text-gray-500 italic mt-0.5">"{command.cmd}"</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Tab 2: J.A.R.V.I.S. WAKE-UP & ACTIVATION PROTOCOLS */
        <div className="flex-1 flex flex-col">
          <p className="text-xs font-sans text-gray-400 mb-4 leading-relaxed">
            El asistente virtual cuenta con múltiples canales analógicos y digitales para despertarse (Wake-up) e integrarse instantáneamente a su ambiente sin necesidad de forzar acciones manuales en el monitor central.
          </p>

          {/* Wake up configurations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            
            {/* 1. Auto-Boot al Abrir la aplicación */}
            <div className="p-3.5 bg-black/45 border border-hud-border/10 rounded flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Monitor className="w-4 h-4 text-hud-cyan" />
                  <h4 className="text-[11px] font-mono font-bold uppercase text-white">Auto-Arranque Instantáneo</h4>
                </div>
                <p className="text-[9.5px] font-mono text-gray-500 leading-normal mb-3">
                  El asistente inicia automáticamente los buffers acústicos y emite un discurso de bienvenida al momento exacto en que la aplicación establece conexión con su navegador.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-hud-border/5">
                <span className="text-[8px] font-mono text-gray-400 uppercase">ESTADO DE AUTO-BOOT</span>
                <button 
                  onClick={() => { triggerSound("click"); setAutoBootGreeting(!autoBootGreeting); }}
                  className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold cursor-pointer transition-all ${
                    autoBootGreeting ? "bg-hud-cyan/15 border border-hud-cyan text-hud-cyan" : "bg-black border border-gray-850 text-gray-500"
                  }`}
                >
                  {autoBootGreeting ? "HABILITADO" : "DESHABILITADO"}
                </button>
              </div>
            </div>

            {/* 2. Micro Always-Listening en Segundo Plano */}
            <div className="p-3.5 bg-black/45 border border-hud-border/10 rounded flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Radio className="w-4 h-4 text-hud-orange animate-pulse" />
                  <h4 className="text-[11px] font-mono font-bold uppercase text-white">Siempre Escuchando</h4>
                </div>
                <p className="text-[9.5px] font-mono text-gray-500 leading-normal mb-3">
                  Escucha continua activa (Hot Mic). El módulo táctico perimetral procesa ruidos ambientales y espera de manera pasiva el llamado sónico de su nombre para reaccionar.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-hud-border/5">
                <span className="text-[8px] font-mono text-gray-400 uppercase">HOT MIC CONTINUO</span>
                <button 
                  onClick={() => { 
                    triggerSound("click");
                    const next = !backgroundHotMic;
                    setBackgroundHotMic(next);
                    addLog(next 
                      ? "Fila de micro-vigilancia del asistente iniciada en segundo plano sónico." 
                      : "Micro de segundo plano suspendido temporalmente por el usuario.", 
                      next ? "success" : "warning"
                    );
                  }}
                  className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold cursor-pointer transition-all ${
                    backgroundHotMic ? "bg-hud-orange/15 border border-hud-orange text-hud-orange animate-pulse" : "bg-black border border-gray-850 text-gray-500"
                  }`}
                >
                  {backgroundHotMic ? "CONECTADO" : "PAUSADO"}
                </button>
              </div>
            </div>

            {/* 3. Ajuste de Sensibilidad Vocálica */}
            <div className="p-3.5 bg-black/45 border border-hud-border/10 rounded flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sliders className="w-4 h-4 text-yellow-500" />
                  <h4 className="text-[11px] font-mono font-bold uppercase text-white">Sensibilidad de Captura</h4>
                </div>
                <p className="text-[9.5px] font-mono text-gray-500 leading-normal mb-3">
                  Regula el umbral de decibelios requeridos para evitar falsas activaciones por viento o ruido estático en la residencia principal.
                </p>
              </div>

              <div className="pt-2 border-t border-hud-border/5">
                <div className="flex justify-between text-[8px] font-mono text-gray-400 uppercase mb-1">
                  <span>UMBRAL ACÚSTICO</span>
                  <span className="text-yellow-500 font-bold">{acousticSensitivity}%</span>
                </div>
                <input 
                  type="range"
                  min="30"
                  max="100"
                  value={acousticSensitivity}
                  onChange={(e) => setAcousticSensitivity(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded appearance-none cursor-pointer accent-yellow-500"
                />
              </div>
            </div>

          </div>

          {/* Interactive Simulated triggers block (Especialmente llama sin hablar o sin poner la app) */}
          <div className="bg-black/40 border border-hud-cyan/10 p-4 rounded mt-2 flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-hud-cyan uppercase tracking-wider block font-bold mb-1.5">
                📢 PANEL DE EXPERIMENTACIÓN Y LLAMADA FANTASMA ("LLAMAR AL ASISTENTE SIN TOCAR"):
              </span>
              <p className="text-[10px] font-sans text-gray-400 mb-4 leading-normal">
                Pruebe las diferentes interfaces de arranque que hacen que <strong className="text-hud-cyan">{personalityName}</strong> despierte e irrumpa en la pantalla de inmediato, simulando que es llamado desde otra habitación o que se activa mágicamente al hablar:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                
                {/* Simulated Trigger Button 1 */}
                <button
                  onClick={() => simulateWakeMethod("voice_wakeword")}
                  className="px-3 py-3 rounded bg-hud-cyan/5 border border-hud-cyan/30 hover:bg-hud-cyan/10 hover:border-hud-cyan/60 text-left transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div className="p-2 bg-hud-cyan/10 rounded text-hud-cyan shrink-0">
                    <Activity className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-white uppercase group-hover:text-hud-cyan transition-colors">
                      Simular Clave de Voz ("Oye {personalityName}")
                    </div>
                    <div className="text-[8.5px] font-mono text-gray-500 leading-normal mt-0.5">
                      Invoca al asistente solo con la voz. El asistente interrumpe las tareas y se presenta con sonido y habla personalizada.
                    </div>
                  </div>
                </button>

                {/* Simulated Trigger Button 2 */}
                <button
                  onClick={() => simulateWakeMethod("app_opening")}
                  className="px-3 py-3 rounded bg-hud-cyan/5 border border-hud-cyan/30 hover:bg-hud-cyan/10 hover:border-hud-cyan/60 text-left transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div className="p-2 bg-hud-cyan/10 rounded text-hud-cyan shrink-0">
                    <Power className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-white uppercase group-hover:text-hud-cyan transition-colors">
                      Auto-Arranque de Apertura
                    </div>
                    <div className="text-[8.5px] font-mono text-gray-500 leading-normal mt-0.5">
                      Simula el encendido directo al cargar la interfaz de Stark Industries. El asistente te da el reporte inicial.
                    </div>
                  </div>
                </button>

                {/* Simulated Trigger Button 3 */}
                <button
                  onClick={() => simulateWakeMethod("hand_clap")}
                  className="px-3 py-3 rounded bg-amber-500/5 border border-amber-550/20 hover:bg-amber-500/10 hover:border-amber-500/50 text-left transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div className="p-2 bg-amber-500/10 rounded text-amber-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-white uppercase group-hover:text-amber-400 transition-colors">
                      Sonidos de Cortesía (Aplauso Binario)
                    </div>
                    <div className="text-[8.5px] font-mono text-gray-500 leading-normal mt-0.5">
                      Un patrón sónico analógico (doble palmada) enciende reflectores auxiliares y cambia colores a modo de cortesía.
                    </div>
                  </div>
                </button>

                {/* Simulated Trigger Button 4 */}
                <button
                  onClick={() => simulateWakeMethod("device_knock")}
                  className="px-3 py-3 rounded bg-amber-500/5 border border-amber-550/20 hover:bg-amber-500/10 hover:border-amber-500/50 text-left transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div className="p-2 bg-amber-500/10 rounded text-amber-400 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-white uppercase group-hover:text-amber-400 transition-colors">
                      Chasquido/Vibración Física en Armazón
                    </div>
                    <div className="text-[8.5px] font-mono text-gray-500 leading-normal mt-0.5">
                      Usa sensores de movimiento del traje (acelerómetro) para activar defensas y autodiagnósticos al propinar toques leves.
                    </div>
                  </div>
                </button>

              </div>
            </div>

            {/* Telemetry log preview representing background wake activity */}
            <div className="p-3 bg-black/75 rounded border border-hud-cyan/10 font-mono">
              <div className="flex items-center justify-between text-[8.5px] font-bold text-hud-cyan mb-1.5 uppercase">
                <span>BUFFER DEL ACOPLADOR SÓNICO DE FONDO (BACKGROUND SERVICE)</span>
                <span className="animate-pulse flex items-center gap-1 text-green-400">
                  <span className="w-1 h-1 bg-green-400 rounded-full" />
                  ESCUCHA DE RED VIRTUAL ONLINE
                </span>
              </div>
              <div className="text-[8px] text-gray-500 space-y-1">
                <div>[01:56:02] STARK_DAEMON: Iniciando servicio de escucha fantasma en segundo plano (Puerto 3000 proxy)...</div>
                <div>[01:56:04] INPUT_REC: Micrófono calibrándose para decibelios de voz neutra...</div>
                <div>[01:56:10] SPEECH_ENGINE: Listo para detectar palabras clave: ["{personalityName.toUpperCase()}", "HOLA", "DESPIERTA"]</div>
                <div className="text-hud-cyan font-bold">[ESPERANDO VOCALIZACIÓN INTERNA O PULSADOR SIMULADO]</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
