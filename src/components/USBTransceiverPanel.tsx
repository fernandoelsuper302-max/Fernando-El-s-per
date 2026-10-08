import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Tv, 
  Globe, 
  Zap,
  Sparkles,
  ExternalLink
} from "lucide-react";

// Portability tips & targets data
interface TargetDevice {
  id: string;
  name: string;
  icon: string;
  description: string;
  instructions: string;
}

const TARGET_DEVICES: TargetDevice[] = [
  {
    id: "desktop",
    name: "Terminal de Escritorio (PC/Mac/Linux)",
    icon: "🖥️",
    description: "Ideal para computadoras de laboratorio, laptops u oficinas locales. Soporta reconocimiento por micrófono y sintetizador de voz nativo a máxima frecuencia.",
    instructions: "Copie el archivo HTML descargado a su USB. Enchufe la USB en cualquier PC de destino y abra el archivo en Chrome, Edge o Safari. Para la versión completa de desarrollo, exporte el ZIP desde el menú superior de IA Studio, descomprímalo en la USB y ejecute 'npm install && npm run dev'."
  },
  {
    id: "mobile",
    name: "Dispositivo de Campaña (Móvil/Tablet)",
    icon: "📱",
    description: "Excelente portabilidad táctica para celulares Android o iOS. Interfaz adaptada para pantallas táctiles de armaduras móviles.",
    instructions: "Conecte su dispositivo móvil mediante OTG o por red local. Puede transferir el archivo portátil HTML vía USB y abrirlo desde el explorador del celular utilizando cualquier navegador moderno para interactuar con la voz en tiempo real."
  },
  {
    id: "iot",
    name: "Núcleo Embebido (Raspberry Pi / IoT)",
    icon: "⚙️",
    description: "Para despliegues en hardware dedicado y módulos independientes con recursos de bajo consumo.",
    instructions: "La Raspberry Pi con Linux es perfecta para un asistente de voz en el hogar. Instale Node.js en la placa, copie la carpeta de desarrollo de Jarvis desde su USB, y ejecútelo en modo headless con un servidor web local."
  },
  {
    id: "optical",
    name: "Enlace SmartTV u Holo-Pantallas",
    icon: "📺",
    description: "Para proyectar el visor táctico en pantallas secundarias y proyectores inteligentes compatibles.",
    instructions: "Copie el archivo portátil a una memoria USB e instálela en el puerto USB de su SmartTV. Muchos televisores inteligentes con explorador de Internet admiten cargar archivos locales o transmitir el enlace dev directo por red de área local."
  }
];

interface USBTransceiverPanelProps {
  personalityName: string;
  personalityId: string;
  triggerSound: (type: "startup" | "scan" | "success" | "error" | "abort" | "click") => void;
  addLog: (message: string, type: "info" | "success" | "warning" | "error") => void;
  speechConfig: { volume: number; rate: number; pitch: number };
  onOpenDownloadModal?: () => void;
}

export default function USBTransceiverPanel({
  personalityName,
  personalityId,
  triggerSound,
  addLog,
  speechConfig,
  onOpenDownloadModal
}: USBTransceiverPanelProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>("desktop");
  const [selectedBus, setSelectedBus] = useState<string>("3.2");
  const [transferState, setTransferState] = useState<"idle" | "transmitting" | "completed" | "error">("idle");
  const [progress, setProgress] = useState<number>(0);
  const [transferLogs, setTransferLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transferLogs]);

  const activeDevice = TARGET_DEVICES.find(d => d.id === selectedTarget) || TARGET_DEVICES[0];

  const pushLocalLog = (text: string) => {
    const time = new Date().toLocaleTimeString("es-ES", { hour12: false });
    setTransferLogs(prev => [...prev, `[${time}] ${text}`]);
  };

  const startTransmission = () => {
    if (transferState === "transmitting") return;
    
    triggerSound("scan");
    setTransferState("transmitting");
    setProgress(0);
    setTransferLogs([]);
    
    pushLocalLog(`INICIANDO PROTOCOLO DE ENLACE DE COOPERACIÓN TECNOLÓGICA...`);
    pushLocalLog(`Identificando puerto USB - BUS_SPEED: USB ${selectedBus === "3.2" ? "3.2 HyperSpeed" : selectedBus === "3.0" ? "3.0 SuperSpeed" : "2.0 Legado"}`);
    pushLocalLog(`Cargando Matriz Cognitiva de ${personalityName}...`);

    let currentProgress = 0;
    const phrases = [
      { prg: 10, text: "Buscando sectores libres en el disco de destino..." },
      { prg: 22, text: `Extrayendo presets y configuración vocal de ${personalityName} (Rate: ${speechConfig.rate}, Pitch: ${speechConfig.pitch})...` },
      { prg: 38, text: "Compilando módulo offline del reactor Arc holográfico para renderizado portátil..." },
      { prg: 50, text: "Sincronizando logs de diagnósticos del sistema..." },
      { prg: 65, text: "Configurando script web offline de síntesis de voz (Web Speech Synthesis)..." },
      { prg: 80, text: "Empaquetando interfaz web de campaña autoejecutable..." },
      { prg: 95, text: "Comprobando la integridad del paquete de transferencia..." },
      { prg: 100, text: "¡Transmisión completada! Generando descarga de archivo portátil..." }
    ];

    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(Math.min(currentProgress, 100));

      const matchingPhrase = phrases.find(p => p.prg === currentProgress);
      if (matchingPhrase) {
        pushLocalLog(matchingPhrase.text);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTransferState("completed");
        triggerSound("success");
        addLog(`Asistente ${personalityName} transmitido a USB con un nivel de compatibilidad alto.`, "success");
        
        // Trigger the actual generation of the beautiful standalone offline file!
        generatePortableHTML();
      }
    }, 70);
  };

  // Generate a fully real, working, single-file HTML featuring ARC animations & speech Synthesis
  const generatePortableHTML = () => {
    const welcomeText = personalityId === "JARVIS" 
      ? `Canal de enlace USB activado. Sistemas de campaña de JARVIS listos y a su disposición, Señor.` 
      : personalityId === "FRIDAY" 
      ? `¡Hola, Jefe! Traje y sistemas portátiles activos listos para la acción desde la USB.`
      : personalityId === "KAREN"
      ? `Sistemas de Karen estabilizados desde puerto USB. Bienvenido de vuelta, joven héroe.`
      : `Sistema de defensa táctico EDITH listo desde la vía portátil. Protocolos en línea.`;

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>STARK PORTABLE LINK // ${personalityName}</title>
  <style>
    :root {
      --hud-cyan: #00f0ff;
      --hud-orange: #ff9900;
      --hud-bg: #070c14;
      --hud-metal: #101c2c;
    }
    body {
      background-color: var(--hud-bg);
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow-x: hidden;
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
      padding: 20px;
    }
    .hud-grid {
      background-image: 
        radial-gradient(ellipse at center, rgba(0, 10, 25, 0) 0%, rgba(0, 5, 15, 0.8) 100%),
        linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
      background-size: cover, 40px 40px, 40px 40px;
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 1;
    }
    .container {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 600px;
      background: rgba(16, 28, 44, 0.75);
      border: 1px solid rgba(0, 240, 255, 0.2);
      border-radius: 8px;
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.07);
      padding: 30px;
      text-align: center;
      backdrop-filter: blur(10px);
    }
    h1 {
      font-family: monospace;
      color: var(--hud-cyan);
      letter-spacing: 0.15em;
      font-size: 1.25rem;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .subtitle {
      font-family: monospace;
      font-size: 0.8rem;
      color: rgba(0, 240, 255, 0.6);
      letter-spacing: 0.08em;
      margin-bottom: 25px;
    }
    /* Visual Reactor */
    .reactor-container {
      position: relative;
      width: 160px;
      height: 160px;
      margin: 0 auto 30px;
      cursor: pointer;
    }
    .reactor-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 4px dashed var(--hud-cyan);
      box-sizing: border-box;
      animation: rotate-clockwise 10s linear infinite;
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.15);
    }
    .reactor-core {
      position: absolute;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 3px solid rgba(0, 240, 255, 0.3);
      top: 20px; left: 20px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 240, 255, 0.05);
      animation: pulse-core 2.5s infinite ease-in-out;
    }
    .reactor-inner {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 0 30px 10px #ffffff, 0 0 50px var(--hud-cyan);
    }
    /* Controls and Speech box */
    .chat-box {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(0, 240, 255, 0.1);
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 25px;
      text-align: left;
      font-family: monospace;
      font-size: 0.85rem;
      max-height: 120px;
      overflow-y: auto;
    }
    .btn {
      background: var(--hud-cyan);
      color: #000000;
      font-family: monospace;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border: none;
      border-radius: 4px;
      padding: 12px 24px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
      outline: none;
    }
    .btn:hover {
      background: #ffffff;
      box-shadow: 0 0 25px rgba(255, 255, 255, 0.5);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: monospace;
      font-size: 0.7rem;
      background: rgba(255, 153, 0, 0.1);
      border: 1px solid rgba(255, 153, 0, 0.3);
      color: var(--hud-orange);
      padding: 3px 8px;
      border-radius: 3px;
      text-transform: uppercase;
      margin-bottom: 15px;
    }
    @keyframes rotate-clockwise {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes pulse-core {
      0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(0, 240, 255, 0.15); }
      50% { transform: scale(1.04); box-shadow: 0 0 25px rgba(0, 240, 255, 0.35); }
    }
    .terminal-footer {
      font-family: monospace;
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.3);
      margin-top: 25px;
    }
  </style>
</head>
<body>
  <div class="hud-grid"></div>
  <div class="container">
    <div class="status-badge">
      ⚡ ENLACE USB PORTÁTIL COMPATIBLE
    </div>
    <h1>NÚCLEO DIGITAL: ${personalityName}</h1>
    <div class="subtitle">ESTADO DEL VÍNCULO COGNITIVO // STARK_LABS_v85</div>
    
    <div class="reactor-container" onclick="testVoice()">
      <div class="reactor-ring"></div>
      <div class="reactor-core">
        <div class="reactor-inner"></div>
      </div>
    </div>

    <div class="chat-box" id="output-box">
      [STARK SYSTEM] Conectando receptor de salida vocal...<br>
      [DISPOSITIVO] Localizado en puerto USB compatible.<br>
      [ALERTA] Haga click en el botón inferior para activar la modulación sónica u ordenar el protocolo de bienvenida.
    </div>

    <button class="btn" onclick="testVoice()">
      🔊 Inicializar Voz de Asistente
    </button>

    <div class="terminal-footer">
      SISTEMA PORTÁTIL AUTÓNOMO - RESPALDADO EN EXCEPCIÓN DE REDES EXTERNAS.
    </div>
  </div>

  <script>
    const welcomeMsg = "${welcomeText}";
    const voiceName = "${personalityName}";
    const rateVal = ${speechConfig.rate};
    const pitchVal = ${speechConfig.pitch};
    const volVal = ${speechConfig.volume};
    
    function log(msg) {
      const box = document.getElementById("output-box");
      const time = new Date().toLocaleTimeString("es-ES", { hour12: false });
      box.innerHTML += '<br>[' + time + '] ' + msg;
      box.scrollTop = box.scrollHeight;
    }

    function testVoice() {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        log("Iniciando síntesis de voz...");
        
        const utterance = new SpeechSynthesisUtterance(welcomeMsg);
        utterance.lang = "es-ES";
        utterance.rate = rateVal;
        utterance.pitch = pitchVal;
        utterance.volume = volVal;
        
        // Find best local Spanish speaker if possible
        const voices = window.speechSynthesis.getVoices();
        for (let v of voices) {
          if (v.lang.startsWith("es")) {
            utterance.voice = v;
            log("Vocero: " + v.name);
            break;
          }
        }
        
        utterance.onstart = () => {
          log("${personalityName}: \\"" + welcomeMsg + "\\"");
        };
        utterance.onend = () => {
          log("Síntesis sónica completada.");
        };
        utterance.onerror = (e) => {
          log("Aviso de modulación vocal: " + e.error);
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        log("CRÍTICO: El motor web del dispositivo destino no admite la tecnología Web Speech Synthesis.");
      }
    }
    
    // Auto-load voices on browser start
    if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        log("Sistemas de modulación sónica de Stark calibrados.");
      };
    }
  </script>
</body>
</html>`;

    try {
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${personalityId}_OFFLINE_CORE_USB.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      pushLocalLog(`¡CORTE DE ARCHIVO COMPLETADO! Descargando archivo offline autoejecutable...`);
    } catch (err: any) {
      console.error("Failed to generate file download:", err);
      pushLocalLog(`FALLO EN LA COPIA LOCAL DEL DISCO: ${err.message || "Error al escribir el archivo."}`);
      setTransferState("error");
      triggerSound("error");
    }
  };

  return (
    <div className="hud-panel rounded relative overflow-hidden flex-1 flex flex-col p-4 md:p-5 text-gray-300">
      
      {/* Title block */}
      <div className="border-b border-hud-cyan/15 pb-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-hud-cyan animate-pulse" />
          <h3 className="text-sm font-mono font-bold text-hud-cyan tracking-wider uppercase">
            Soporte de Respaldo y Enlace USB para Dispositivos
          </h3>
        </div>
        <span className="text-[10px] font-mono text-gray-400 uppercase bg-hud-cyan/5 border border-hud-cyan/15 px-2 py-0.5 rounded">
          Módulo Portátil
        </span>
      </div>

      <p className="text-xs font-sans text-gray-400 mb-4 leading-relaxed">
        Configure y empaquete la matriz cognitiva de <strong className="text-hud-cyan">{personalityName}</strong> para guardarla en una memoria USB (Pendrive) u otro dispositivo. Podrá ejecutar su interfaz de audio y diagnósticos en computadoras portátiles u otros soportes, independientemente de la conexión principal.
      </p>

      {/* Grid selector targeting device instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        
        {/* Left Side: Targets selection and Bus options */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-hud-cyan uppercase tracking-wider mb-2">
              1. Seleccione el dispositivo de destino compatible:
            </label>
            <div className="space-y-2 max-h-[175px] overflow-y-auto pr-1.5 hud-scrollbar">
              {TARGET_DEVICES.map(device => (
                <button
                  key={device.id}
                  onClick={() => { setSelectedTarget(device.id); triggerSound("click"); }}
                  className={`w-full text-left p-2.5 rounded border transition-all text-xs font-mono flex items-center gap-3 cursor-pointer ${
                    selectedTarget === device.id
                      ? "bg-hud-cyan/10 border-hud-cyan text-white shadow-[0_0_8px_rgba(0,240,255,0.1)]"
                      : "bg-black/40 border-hud-border/10 hover:border-hud-cyan/35 text-gray-400 hover:text-gray-300"
                  }`}
                >
                  <span className="text-xl leading-none">{device.icon}</span>
                  <div className="truncate">
                    <div className="font-bold uppercase text-[10px]">{device.name}</div>
                    <div className="text-[9px] text-gray-500 truncate mt-0.5">{device.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-hud-cyan uppercase tracking-wider mb-2">
              2. Bus de entrada USB configurado:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "3.2", label: "USB 3.2 Gen 2 (HyperSpeed)", desc: "10 Gbps" },
                { id: "3.0", label: "USB 3.0 / Enlace C", desc: "5 Gbps" },
                { id: "2.0", label: "USB 2.0 (Legado Stark)", desc: "480 Mbps" }
              ].map(bus => (
                <button
                  key={bus.id}
                  onClick={() => { setSelectedBus(bus.id); triggerSound("click"); }}
                  className={`p-2 rounded border text-center transition-all cursor-pointer ${
                    selectedBus === bus.id
                      ? "bg-hud-orange/10 border-hud-orange text-hud-orange shadow-[0_0_8px_rgba(255,153,0,0.1)]"
                      : "bg-black/40 border-hud-border/10 hover:border-hud-orange/20 text-gray-500 hover:text-gray-400"
                  }`}
                >
                  <div className="font-bold text-[10px] font-mono text-center uppercase">{bus.id === "3.2" ? "USB 3.2" : bus.id === "3.0" ? "USB 3.0" : "USB 2.0"}</div>
                  <div className="text-[7.5px] font-mono text-center mt-0.5 opacity-60">{bus.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Device Instructions Preview of current target */}
        <div className="bg-black/35 border border-hud-cyan/10 rounded p-3.5 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono text-hud-cyan uppercase tracking-widest block mb-2">
              ⚙️ PROTOCOLO LOCAL RECOMENDADO:
            </span>
            <h4 className="text-xs font-mono font-bold text-white uppercase mb-1">
              {activeDevice.icon} {activeDevice.name}
            </h4>
            <p className="text-[10px] font-mono text-gray-400 leading-relaxed mb-4">
              {activeDevice.instructions}
            </p>
          </div>

          <div className="border-t border-hud-cyan/10 pt-3.5 flex flex-col gap-2">
            <div>
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block mb-1">
                CONSEJO DE TONY STARK:
              </span>
              <div className="bg-hud-orange/5 border border-hud-orange/25 p-2 rounded text-[9px] font-mono text-hud-orange/85 leading-relaxed leading-normal">
                🌐 Para una portabilidad completa, puedes instalar J.A.R.V.I.S. directamente como App en tu celular o PC sin necesidad de USB.
              </div>
            </div>

            {onOpenDownloadModal && (
              <button
                onClick={() => {
                  triggerSound("click");
                  onOpenDownloadModal();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-hud-cyan/15 hover:bg-hud-cyan/25 border border-hud-cyan/40 text-hud-cyan text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.15)]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar J.A.R.V.I.S. en Celular o PC (App Nativa)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Transfer interface */}
      <div className="space-y-4 border-t border-hud-cyan/10 pt-4 mt-auto">
        
        {/* Transmission execution button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={startTransmission}
            disabled={transferState === "transmitting"}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-hud-cyan hover:bg-hud-cyan/80 text-black font-semibold text-xs font-mono px-6 py-3 rounded shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {transferState === "transmitting" ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Transmitiendo Matriz...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-black" />
                <span>Iniciar Transmisión a USB</span>
              </>
            )}
          </button>
          
          <div className="text-center sm:text-left">
            <div className="text-[10px] font-mono text-gray-400">
              ESTADO DEL ENLACE: {" "}
              <strong className={
                transferState === "idle" ? "text-hud-cyan" :
                transferState === "transmitting" ? "text-hud-orange animate-pulse" :
                transferState === "completed" ? "text-green-400 animate-pulse" : "text-red-500"
              }>
                {transferState === "idle" ? "DISPONIBLE PARA COPIA" :
                 transferState === "transmitting" ? `TRANSMITIENDO (${progress}%)` :
                 transferState === "completed" ? "UNIDAD USB COPIADA CON éxito" : "ERROR DE SECTOR"}
              </strong>
            </div>
            <div className="text-[8px] font-mono text-gray-500 uppercase mt-0.5">
              Tamaño estimado del archivo portable de campaña: ~10 KB
            </div>
          </div>
        </div>

        {/* Live progress logs bar */}
        {transferState !== "idle" && (
          <div className="space-y-2">
            <div className="w-full bg-black/60 rounded border border-hud-cyan/10 overflow-hidden h-2.5 relative">
              <div 
                className="h-full bg-hud-cyan transition-all duration-100 ease-out shadow-[0_0_8px_rgba(0,240,255,0.7)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Dark technical terminal feedback */}
            <div className="bg-black/85 rounded border border-hud-orange/20 p-2.5 h-[100px] overflow-y-auto font-mono text-[9px] text-gray-400 select-text selection:bg-hud-orange/30 scrollbar-thin">
              {transferLogs.map((logStr, index) => (
                <div key={index} className="leading-relaxed font-bold tracking-wide">
                  <span className="text-hud-orange">&gt;&gt;</span> {logStr}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
