import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  RotateCcw, 
  ExternalLink, 
  Globe, 
  AlertTriangle, 
  Keyboard, 
  History, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Play,
  Square,
  Compass,
  Cpu,
  Tv,
  Zap,
  Music,
  MessageSquare,
  Mic,
  MicOff,
  Eye,
  Radio,
  Home,
  ShieldAlert,
  PhoneCall,
  User,
  Download,
  Laptop
} from "lucide-react";
import { JarvisState, ScanItem, SpeechConfig, SystemDiagnostic, PersonalityId, UserProfile } from "./types";
import ArcReactor from "./components/ArcReactor";
import SoundWave from "./components/SoundWave";
import DiagnosticLogs, { LogEntry } from "./components/DiagnosticLogs";
import SpeechSynthesizerControls from "./components/SpeechSynthesizerControls";
import { playSciFiSound } from "./utils/audioEffects";
import IdeaChatPanel from "./components/IdeaChatPanel";
import USBTransceiverPanel from "./components/USBTransceiverPanel";
import SmartHomePanel from "./components/SmartHomePanel";
import ComputerControlPanel from "./components/ComputerControlPanel";
import { HolographicWebModal } from "./components/HolographicWebModal";
import { EmergencyCommsModal } from "./components/EmergencyCommsModal";
import PilotRegistrationModal from "./components/PilotRegistrationModal";
import MiniJarvisWidget from "./components/MiniJarvisWidget";
import DownloadJarvisModal from "./components/DownloadJarvisModal";
import { executeVoiceCommand } from "./utils/voiceCommandEngine";
import { cleanTextForSpeech } from "./utils/speechCleaner";


// Personality Presets Metadata
const PERSONALITIES = {
  JARVIS: {
    id: "JARVIS" as const,
    name: "J.A.R.V.I.S.",
    welcome: "Sistemas en línea, Señor. Presione la tecla ESPACIO para que analice un objeto o presione ESC para reiniciar.",
    abortWord: "Acción abortada, Señor. Listo para nueva lectura.",
    rate: 1.05,
    pitch: 0.85,
  },
  FRIDAY: {
    id: "FRIDAY" as const,
    name: "F.R.I.D.A.Y.",
    welcome: "Todos los motores listos, Jefe. ¡Listo para escanear cuando guste!",
    abortWord: "Filtro cancelado, Jefe. El traje está estable.",
    rate: 1.15,
    pitch: 1.05,
  },
  KAREN: {
    id: "KAREN" as const,
    name: "KAREN",
    welcome: "Hola, joven héroe. Los sensores de mi matriz están calibrados para escanear.",
    abortWord: "Operación reiniciada, joven héroe. ¿Qué analizamos ahora?",
    rate: 1.25,
    pitch: 1.15,
  },
  EDITH: {
    id: "EDITH" as const,
    name: "E.D.I.T.H.",
    welcome: "Sistema E.D.I.T.H. activado y conectado. Análisis táctico satelital listo.",
    abortWord: "Cálculo cerrado. Protocolos de seguridad en standby.",
    rate: 1.10,
    pitch: 1.0,
  }
};

interface SimulatedFeedCanvasProps {
  opticalFilter: string;
  simulatedTarget: string;
  customUploadedImage: string | null;
  uploadedImageRef: React.MutableRefObject<HTMLImageElement | null>;
  drawSimulatedScene: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    target: string,
    imgEl: HTMLImageElement | null,
    filter: string,
    frameCount: number
  ) => void;
  getFilterCSS: (filterName: string) => string;
}

function SimulatedFeedCanvas({
  opticalFilter,
  simulatedTarget,
  customUploadedImage,
  uploadedImageRef,
  drawSimulatedScene,
  getFilterCSS
}: SimulatedFeedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let count = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = canvas.parentElement?.clientWidth || 640;
          canvas.height = canvas.parentElement?.clientHeight || 480;
          count++;
          drawSimulatedScene(
            ctx,
            canvas.width,
            canvas.height,
            simulatedTarget,
            uploadedImageRef.current,
            opticalFilter,
            count
          );
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [opticalFilter, simulatedTarget, customUploadedImage, drawSimulatedScene]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-cover transition-all duration-300"
      style={{ filter: getFilterCSS(opticalFilter) }}
    />
  );
}

export default function App() {
  // --- STATE ---
  const [jarvisState, setJarvisState] = useState<JarvisState>(JarvisState.INITIALIZING);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [history, setHistory] = useState<ScanItem[]>([]);
  const [activeScan, setActiveScan] = useState<ScanItem | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeMainTab, setActiveMainTab] = useState<"visor" | "chat" | "pc" | "usb" | "home">("visor");
  const [isHandsFree, setIsHandsFree] = useState<boolean>(false);
  const [opticalFilter, setOpticalFilter] = useState<string>("normal");
  const [isSimulatedCamera, setIsSimulatedCamera] = useState<boolean>(false);
  const [simulatedTarget, setSimulatedTarget] = useState<string>("arc_reactor");
  const [customUploadedImage, setCustomUploadedImage] = useState<string | null>(null);
  const [isSignLanguageMode, setIsSignLanguageMode] = useState<boolean>(false);
  const [autoOpenWebsite, setAutoOpenWebsite] = useState<boolean>(true);
  const [autoScanContinuous, setAutoScanContinuous] = useState<boolean>(false);
  const [isWebModalOpen, setIsWebModalOpen] = useState<boolean>(false);
  const [webModalUrl, setWebModalUrl] = useState<string>("");
  const [webModalTitle, setWebModalTitle] = useState<string>("");
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isMiniWidgetOpen, setIsMiniWidgetOpen] = useState<boolean>(false);
  const [lastSpokenText, setLastSpokenText] = useState<string>("");
  const uploadedImageRef = useRef<HTMLImageElement | null>(null);
  const sendMessageRef = useRef<((text: string) => void) | null>(null);

  // User Identity and Profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem("jarvis_user_profile");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load user profile:", e);
    }
    return {
      name: "",
      age: 20,
      title: "Señor",
      isRegistered: false,
    };
  });
  const [isPilotModalOpen, setIsPilotModalOpen] = useState<boolean>(false);

  // Automatic onboarding prompt if user has not registered name and age
  useEffect(() => {
    if (!userProfile.isRegistered || !userProfile.name) {
      const timer = setTimeout(() => {
        setIsPilotModalOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [userProfile.isRegistered, userProfile.name]);

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    try {
      localStorage.setItem("jarvis_user_profile", JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to persist user profile:", e);
    }
    setIsPilotModalOpen(false);
    triggerSound("success");
    addLog(`[IDENTIDAD] Perfil de Piloto registrado: ${profile.name} (${profile.age} años, ${profile.title || "Piloto"}).`, "success");

    // Dynamic tailored voice confirmation
    const currentPers = speechConfig.personality;
    let greetingText = "";
    if (currentPers === "FRIDAY") {
      greetingText = `¡Enlace establecido, ${profile.title ? `${profile.title} ` : ""}${profile.name}! Edad registrada: ${profile.age} años. ¡Estoy lista para lo que me ordenes!`;
    } else if (currentPers === "KAREN") {
      greetingText = `Hola, ${profile.name}. He registrado tu edad en ${profile.age} años. Es genial ser tu asistente personal.`;
    } else if (currentPers === "EDITH") {
      greetingText = `Protocolo táctico sincronizado con ${profile.title ? `${profile.title} ` : ""}${profile.name}, ${profile.age} años. Sistemas en línea.`;
    } else {
      greetingText = `Protocolos Stark enlazados para usted, ${profile.title ? `${profile.title} ` : ""}${profile.name}. Registro de edad establecido en ${profile.age} años. Es un honor estar a su servicio personal. Mis sistemas de visión, asistencia domótica y conocimiento universal están listos para obedecer sus órdenes.`;
    }
    speak(greetingText);
  };

  // Shared Smart Home states
  const [smartTv, setSmartTv] = useState({ on: false, volume: 18, channel: "Canal Stark Labs" });
  const [smartFan, setSmartFan] = useState({ on: false, speed: "Medio" as "Bajo" | "Medio" | "Turbo" });
  const [smartLights, setSmartLights] = useState({ on: true, color: "HUD Cyan", brightness: 70 });
  const [smartShieldDoor, setSmartShieldDoor] = useState({ locked: true });
  const [smartPermission, setSmartPermission] = useState<boolean>(true);

  // Progressive Web App (PWA) & Multiplatform Installation State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [isInstalledPWA, setIsInstalledPWA] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      addLog("📦 Instalador PWA detectado: J.A.R.V.I.S. listo para instalar en celular o computadora.", "info");
    };

    const handleAppInstalled = () => {
      setIsInstalledPWA(true);
      setDeferredInstallPrompt(null);
      addLog("✨ ¡J.A.R.V.I.S. instalado con éxito en su dispositivo!", "success");
    };

    if (typeof window !== "undefined") {
      if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true) {
        setIsInstalledPWA(true);
      }
      window.addEventListener("beforeinstallprompt", handleBeforeInstall);
      window.addEventListener("appinstalled", handleAppInstalled);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        window.removeEventListener("appinstalled", handleAppInstalled);
      }
    };
  }, []);

  const handleTriggerInstall = async (): Promise<boolean> => {
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const choiceResult = await deferredInstallPrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          setIsInstalledPWA(true);
          setDeferredInstallPrompt(null);
          addLog("🚀 J.A.R.V.I.S. instalado como aplicación nativa.", "success");
          return true;
        }
      } catch (err) {
        console.warn("Native install error:", err);
      }
    }
    return false;
  };

  
  // Audio settings configuration with support for sound effects & multi personalities
  const [speechConfig, setSpeechConfig] = useState<SpeechConfig>({
    enabled: true,
    voiceName: "",
    rate: 1.05,
    pitch: 0.85,
    volume: 1.0,
    personality: "JARVIS",
    soundEffectsEnabled: true
  });

  // Simulated metrics and diagnostics
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostic[]>([
    { label: "AI CORE LATENCY", value: "0ms", status: "nominal" },
    { label: "WEBCAM RESOLUTION", value: "N/A", status: "warning" },
    { label: "SPEECH SYSTEM", value: "ONLINE", status: "nominal" },
    { label: "COGNITIVE MATRIX STATUS", value: "STABLE", status: "nominal" },
  ]);

  // --- REFS ---
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const logsCountRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);

  // --- COMPONENT HELPERS ---
  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    const timestamp = new Date().toLocaleTimeString("es-ES", { hour12: false });
    const id = `${Date.now()}-${logsCountRef.current++}`;
    setLogs((prev) => [...prev, { id, timestamp, message, type }]);
  };

  const getFilterCSS = (filterName: string) => {
    switch (filterName) {
      case "thermal":
        return "hue-rotate(220deg) saturate(6) contrast(1.6) invert(0.9) brightness(1.1)";
      case "nightvision":
        return "grayscale(1) sepia(1) hue-rotate(85deg) saturate(6) brightness(1.3) contrast(1.1)";
      case "starktech":
        return "grayscale(1) sepia(1) hue-rotate(175deg) saturate(7) brightness(1.4) contrast(1.1)";
      case "sepia":
        return "sepia(1) brightness(0.95) contrast(1.1)";
      case "grayscale":
        return "grayscale(1) brightness(1.13) contrast(1.15)";
      default:
        return "none";
    }
  };

  const drawSimulatedScene = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    target: string,
    imgEl: HTMLImageElement | null,
    filter: string,
    frameCount: number
  ) => {
    // Clear background
    ctx.fillStyle = "#070c14";
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Grid Lines
    ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Scanline
    const scanY = (frameCount * 1.8) % height;
    ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, scanY);
    ctx.lineTo(width, scanY);
    ctx.stroke();

    const centerX = width / 2;
    const centerY = height / 2;

    // 3. Targets
    if (target === "custom" && imgEl) {
      try {
        const imgRatio = imgEl.width / imgEl.height;
        const maxW = width * 0.75;
        const maxH = height * 0.75;
        let drawW = maxW;
        let drawH = maxW / imgRatio;
        if (drawH > maxH) {
          drawH = maxH;
          drawW = maxH * imgRatio;
        }
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.drawImage(imgEl, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
        ctx.restore();

        // Overlay cyan targets
        ctx.strokeStyle = "rgba(0, 240, 255, 0.65)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.min(drawW, drawH) / 2.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.min(drawW, drawH) / 1.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } catch (e) {
        console.warn("Could not draw uploaded image on canvas:", e);
      }
    } else if (target === "arc_reactor") {
      ctx.save();
      // Glowing Core
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      ctx.fill();

      // Draw radial coils index
      ctx.strokeStyle = "rgba(245, 158, 11, 0.9)";
      ctx.lineWidth = 6;
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI * 2) / 10 + (frameCount * 0.005);
        const cX1 = centerX + Math.cos(angle) * 65;
        const cY1 = centerY + Math.sin(angle) * 65;
        const cX2 = centerX + Math.cos(angle) * 95;
        const cY2 = centerY + Math.sin(angle) * 95;
        ctx.beginPath();
        ctx.moveTo(cX1, cY1);
        ctx.lineTo(cX2, cY2);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(0, 240, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, 110, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.fillStyle = "#00f0ff";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("STARK CORES: ARC INTEGRITY NOMINAL - COILS ACTIVE [10]", centerX, centerY + 130);
    } else if (target === "dron_anomalia") {
      ctx.save();
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(centerX - 100, centerY);
      ctx.lineTo(centerX + 100, centerY);
      ctx.moveTo(centerX, centerY - 100);
      ctx.lineTo(centerX, centerY + 100);
      ctx.stroke();

      const pulseRad = 60 + Math.sin(frameCount * 0.1) * 8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRad, 0, Math.PI * 2);
      ctx.stroke();

      // Drone model sketch
      ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX - 50, centerY - 10);
      ctx.lineTo(centerX - 80, centerY - 30);
      ctx.lineTo(centerX + 80, centerY - 30);
      ctx.lineTo(centerX + 50, centerY - 10);
      ctx.lineTo(centerX + 15, centerY + 15);
      ctx.lineTo(centerX - 15, centerY + 15);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      if (Math.floor(frameCount / 20) % 2 === 0) {
        ctx.fillText("⚠️ AMENAZA ENEMIGA DETECTADA [DRON DR-4]", centerX, centerY - 120);
      } else {
        ctx.fillText("   AMENAZA ENEMIGA DETECTADA [DRON DR-4]", centerX, centerY - 120);
      }
      ctx.fillText("SISTEMAS TÁCTICOS RECOMIENDAN DESPLIEGUE MARK 85", centerX, centerY + 130);
      ctx.restore();
    } else if (target === "suit_mark85") {
      ctx.save();
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(centerX - 35, centerY - 60);
      ctx.lineTo(centerX + 35, centerY - 60);
      ctx.lineTo(centerX + 45, centerY - 10);
      ctx.lineTo(centerX + 30, centerY + 50);
      ctx.lineTo(centerX - 30, centerY + 50);
      ctx.lineTo(centerX - 45, centerY - 10);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = "#00f0ff";
      ctx.beginPath();
      ctx.ellipse(centerX - 15, centerY - 15, 12, 3, Math.PI / 12, 0, Math.PI * 2);
      ctx.ellipse(centerX + 15, centerY - 15, 12, 3, -Math.PI / 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("PROPUESTA DE ARMADURA MARK LXXXV - EFICIENCIA 98.4%", centerX, centerY + 130);
      ctx.restore();
    } else if (target === "sign_saludo" || target === "sign_gracias" || target === "sign_te_quiero" || target === "sign_ayuda") {
      ctx.save();
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 1.5;

      // Draw hand skeleton base elements
      const wristX = centerX;
      const wristY = centerY + 80;

      // Define knuckle base coordinates
      const tBaseX = centerX - 40, tBaseY = centerY + 30;
      const iBaseX = centerX - 25, iBaseY = centerY + 15;
      const mBaseX = centerX - 5,  mBaseY = centerY + 15;
      const rBaseX = centerX + 15, rBaseY = centerY + 17;
      const pBaseX = centerX + 35, pBaseY = centerY + 22;

      // Draw connection palm lines
      ctx.beginPath();
      ctx.moveTo(wristX, wristY);
      ctx.lineTo(tBaseX, tBaseY);
      ctx.lineTo(iBaseX, iBaseY);
      ctx.lineTo(mBaseX, mBaseY);
      ctx.lineTo(rBaseX, rBaseY);
      ctx.lineTo(pBaseX, pBaseY);
      ctx.lineTo(wristX, wristY);
      ctx.stroke();

      // Finger tips definitions based on gesture
      let tTipX = tBaseX - 35, tTipY = tBaseY - 15;
      let iTipX = iBaseX - 10, iTipY = iBaseY - 60;
      let mTipX = mBaseX,      mTipY = mBaseY - 70;
      let rTipX = rBaseX + 5,  rTipY = rBaseY - 65;
      let pTipX = pBaseX + 15, pTipY = pBaseY - 50;

      if (target === "sign_te_quiero") {
        // Index, Pinky and Thumb extended. Middle and Ring folded.
        tTipX = tBaseX - 45; tTipY = tBaseY - 25;
        iTipX = iBaseX - 15; iTipY = iBaseY - 80;
        mTipX = mBaseX;      mTipY = mBaseY + 15; // Folded
        rTipX = rBaseX;      rTipY = rBaseY + 15; // Folded
        pTipX = pBaseX + 20; pTipY = pBaseY - 75;
      } else if (target === "sign_gracias") {
        // Hand extended flat pointing down and outward from chin concept
        tTipX = tBaseX - 25; tTipY = tBaseY - 5;
        iTipX = iBaseX + 20; iTipY = iBaseY + 15;
        mTipX = mBaseX + 20; mTipY = mBaseY + 20;
        rTipX = rBaseX + 15; rTipY = rBaseY + 20;
        pTipX = pBaseX + 10; pTipY = pBaseY + 15;
      } else if (target === "sign_ayuda") {
        // Thumb tucked inside a flat horizontal closed block
        tTipX = tBaseX + 15; tTipY = tBaseY - 5;
        iTipX = iBaseX - 5;  iTipY = iBaseY - 15;
        mTipX = mBaseX - 5;  mTipY = mBaseY - 15;
        rTipX = rBaseX - 5;  rTipY = rBaseY - 15;
        pTipX = pBaseX - 5;  pTipY = pBaseY - 15;
      }

      // Draw finger bone lines
      const drawFinger = (bx: number, by: number, tx: number, ty: number) => {
        const midX = (bx + tx) / 2;
        const midY = (by + ty) / 2;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(midX, midY);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        // Draw joint sensor tracking dot
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(midX, midY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#00f0ff";
        ctx.beginPath();
        ctx.arc(tx, ty, 5, 0, Math.PI * 2);
        ctx.fill();
      };

      drawFinger(tBaseX, tBaseY, tTipX, tTipY);
      drawFinger(iBaseX, iBaseY, iTipX, iTipY);
      drawFinger(mBaseX, mBaseY, mTipX, mTipY);
      drawFinger(rBaseX, rBaseY, rTipX, rTipY);
      drawFinger(pBaseX, pBaseY, pTipX, pTipY);

      // Wrist tracking circle
      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.arc(wristX, wristY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Bounding box for tracking sign language gesture
      ctx.strokeStyle = "rgba(234, 179, 8, 0.4)";
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(centerX - 95, centerY - 105, 190, 210);
      ctx.setLineDash([]);

      ctx.fillStyle = "#00f0ff";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      
      const gestureName = 
        target === "sign_saludo" ? "HOLA (SALUDO CORDIAL)" :
        target === "sign_gracias" ? "GRACIAS (AGRADECIMIENTO)" :
        target === "sign_te_quiero" ? "TE QUIERO (AFECTO ASL)" : "SEÑA DE AUXILIO / AYUDA";

      ctx.fillText(`TRANSDUCCIÓN DE GESTOS: ACTIVO [${gestureName}]`, centerX, centerY - 120);
      ctx.fillStyle = "#eab308";
      ctx.fillText(`SENSORES ÓPTICOS: DETECTANDO SKELETON_TRACKER_V4`, centerX, centerY + 130);
      ctx.restore();
    } else if (target === "edith_glasses") {
      ctx.save();
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.rect(centerX - 70, centerY - 25, 60, 40);
      ctx.rect(centerX + 10, centerY - 25, 60, 40);
      ctx.moveTo(centerX - 10, centerY - 15);
      ctx.lineTo(centerX + 10, centerY - 15);
      ctx.stroke();

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("PROTI-GOGGLES E.D.I.T.H. - DISPOSITIVO NOMINAL", centerX, centerY + 130);
      ctx.restore();
    } else {
      ctx.save();
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#a855f7";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("FOTO ADJUNTO CARGADA : LISTO PARA ANÁLISIS", centerX, centerY + 130);
      ctx.restore();
    }

    // Diagnostic HUD edges
    ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
    ctx.lineWidth = 1;
    const offset = 10;
    // Top left
    ctx.beginPath(); ctx.moveTo(offset, offset + 20); ctx.lineTo(offset, offset); ctx.lineTo(offset + 20, offset); ctx.stroke();
    // Top right
    ctx.beginPath(); ctx.moveTo(width - offset, offset + 20); ctx.lineTo(width - offset, offset); ctx.lineTo(width - offset - 20, offset); ctx.stroke();
    // Bottom left
    ctx.beginPath(); ctx.moveTo(offset, height - offset - 20); ctx.lineTo(offset, height - offset); ctx.lineTo(offset + 20, height - offset); ctx.stroke();
    // Bottom right
    ctx.beginPath(); ctx.moveTo(width - offset, height - offset - 20); ctx.lineTo(width - offset, height - offset); ctx.lineTo(width - offset - 20, height - offset); ctx.stroke();

    ctx.fillStyle = "rgba(0, 240, 255, 0.6)";
    ctx.font = "600 8px monospace";
    ctx.textAlign = "left";
    ctx.fillText("STARK_OPTIC: EMULATOR_ON", offset + 15, offset + 35);
    ctx.fillText(`FILTER: ${filter.toUpperCase()}`, offset + 15, offset + 47);
    ctx.fillText("FRAME_LOCK: SYNC_OK", offset + 15, offset + 59);

    ctx.textAlign = "right";
    ctx.fillText("DIAGNOSTIC: SECURE_LINK", width - offset - 15, offset + 35);
    ctx.fillText("FEED: ONLINE_SIMULATOR", width - offset - 15, offset + 47);
  };

  // Sound effect helper
  const triggerSound = (type: "startup" | "scan" | "success" | "error" | "abort" | "click" | "alarm") => {
    if (speechConfig.soundEffectsEnabled) {
      playSciFiSound(type, speechConfig.volume);
    }
  };

  // Dynamic time-of-day greeting generator for voice speech
  const getDynamicWelcomeText = (id: PersonalityId) => {
    const preset = PERSONALITIES[id];
    const displayName = userProfile?.name || "Fernando";
    const displayTitle = userProfile?.title ? `${userProfile.title} ` : "";
    if (id === "JARVIS") {
      const hour = new Date().getHours();
      let salutation = `Buenas tardes, ${displayTitle}${displayName}`;
      if (hour >= 6 && hour < 12) {
        salutation = `Buenos días, ${displayTitle}${displayName}`;
      } else if (hour >= 12 && hour < 20) {
        salutation = `Buenas tardes, ${displayTitle}${displayName}`;
      } else {
        salutation = `Buenas noches, ${displayTitle}${displayName}`;
      }
      return `${salutation}. Sistemas Stark calibrados para sus ${userProfile?.age || 20} años. Presione ESPACIO para escanear un objeto con la cámara, hábleme o pregúnteme cualquier consulta en el chat.`;
    }
    if (id === "FRIDAY") {
      return `¡Hola ${displayTitle}${displayName}! Sistemas listos para sus ${userProfile?.age || 20} años. ¡Dígame qué desea hacer hoy!`;
    }
    if (id === "KAREN") {
      return `Hola ${displayName}. Todos mis sensores de ayuda están activos y calibrados. ¿Qué analizamos hoy?`;
    }
    if (id === "EDITH") {
      return `Consola táctica Stark en línea para ${displayTitle}${displayName}, ${userProfile?.age || 20} años. En espera de instrucciones.`;
    }
    return preset.welcome;
  };

  // --- VOICES & AUDIO SUBSYSTEM ---
  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      addLog("El navegador no soporta sintetizador de voz.", "error");
      return;
    }

    // Abort active voices
    window.speechSynthesis.cancel();

    if (!speechConfig.enabled) {
      addLog("Transmisión vocal del asistente apagada.", "warning");
      return;
    }

    // Clean text of markdown, URLs and code artifacts for crystal clear voice articulation
    const cleanSpeech = cleanTextForSpeech(text);
    if (!cleanSpeech) return;

    setLastSpokenText(cleanSpeech);

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    currentUtteranceRef.current = utterance;

    // Pin utterance to window object to prevent Chrome/Safari garbage collection cutting off audio mid-speech
    if (typeof window !== "undefined") {
      (window as any)._activeUtterances = (window as any)._activeUtterances || [];
      (window as any)._activeUtterances.push(utterance);
    }

    const cleanGlobalUtterance = () => {
      if (typeof window !== "undefined" && (window as any)._activeUtterances) {
        (window as any)._activeUtterances = (window as any)._activeUtterances.filter((u: any) => u !== utterance);
      }
    };

    // Apply voice profiles
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (speechConfig.voiceName) {
      selectedVoice = voices.find((v) => v.name === speechConfig.voiceName);
    }

    if (!selectedVoice) {
      const esVoices = voices.filter((v) => v.lang.toLowerCase().includes("es"));
      if (speechConfig.personality === "JARVIS") {
        const maleHints = ["julio", "daniel", "david", "jorge", "diego", "carlos", "juan", "javier", "miguel", "pablo", "enrique", "antonio", "male", "hombre", "masculino"];
        selectedVoice = esVoices.find((v) => {
          const lower = v.name.toLowerCase();
          return maleHints.some((hint) => lower.includes(hint));
        });
      } else if (speechConfig.personality === "KAREN") {
        const femaleHints = ["helena", "sabina", "maria", "monica", "elena", "lucia", "clara", "laura", "female", "mujer", "rosa", "sandra", "sofia"];
        selectedVoice = esVoices.find((v) => {
          const lower = v.name.toLowerCase();
          return femaleHints.some((hint) => lower.includes(hint));
        });
      }
      
      // Fallback to general Spanish if still not found
      if (!selectedVoice && esVoices.length > 0) {
        selectedVoice = esVoices[0];
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = speechConfig.rate;
    utterance.pitch = speechConfig.pitch;
    utterance.volume = speechConfig.volume;

    utterance.onstart = () => {
      setJarvisState(JarvisState.SPEAKING);
      addLog(`[${speechConfig.personality}] Reproduciendo transmisión auditiva...`, "info");
    };

    utterance.onend = () => {
      cleanGlobalUtterance();
      setJarvisState(JarvisState.ACTIVE);
      currentUtteranceRef.current = null;
    };

    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      cleanGlobalUtterance();
      setJarvisState(JarvisState.ACTIVE);
      currentUtteranceRef.current = null;

      // Ignore normal lifecycle events such as canceled or interrupted speech
      if (e.error === "canceled" || e.error === "interrupted") {
        return;
      }

      // Handle browser autoplay policy before user interaction
      if (e.error === "not-allowed") {
        console.warn("Speech synthesis requires user gesture before playback:", e.error);
        return;
      }

      console.warn("Speech synthesis notice:", e.error || "audio event");
      addLog("Discrepancia en canal auditivo del asistente.", "warning");
    };

    window.speechSynthesis.speak(utterance);
  };

  // Helper to open detected website both externally and in Holographic Visor
  const openDetectedWebsite = (urlToOpen?: string, titleToOpen?: string) => {
    const targetUrl = urlToOpen || activeScan?.link;
    const targetTitle = titleToOpen || activeScan?.objectName || "Enlace Detectado";
    if (!targetUrl) {
      addLog("No se ha detectado ningún enlace web en el escaneo actual.", "warning");
      speak("Señor, no dispongo de un enlace web activo. Permítame escanear el objetivo primero.");
      return;
    }

    setWebModalUrl(targetUrl);
    setWebModalTitle(targetTitle);
    setIsWebModalOpen(true);
    triggerSound("success");
    addLog(`Transportando interfaz al portal web: ${targetUrl}`, "success");

    // Attempt external tab launch safely
    try {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.warn("Popup blocked or not allowed, showing holographic viewer:", e);
    }
  };

  // Continuous Radar Auto-Detection mode
  useEffect(() => {
    if (!autoScanContinuous) return;
    if (jarvisState === JarvisState.ANALYZING || jarvisState === JarvisState.SPEAKING || jarvisState === JarvisState.CAPTURING) return;

    const radarTimer = setTimeout(() => {
      if (autoScanContinuous && activeMainTab === "visor" && (stream || isSimulatedCamera)) {
        addLog("📡 [RADAR DE AUTO-DETECCIÓN] Escaneando automáticamente lo que muestra a la cámara...", "info");
        handleCapture(true);
      }
    }, 6500);

    return () => clearTimeout(radarTimer);
  }, [autoScanContinuous, jarvisState, activeMainTab, stream, isSimulatedCamera]);

  // --- CAMERA SUBSYSTEM ---
  const startCamera = async (deviceId?: string) => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      setJarvisState(JarvisState.INITIALIZING);
      addLog("Interconectando con puerto visual...", "info");

      let mediaStream: MediaStream;
      try {
        const constraints: MediaStreamConstraints = {
          video: deviceId 
            ? { deviceId: { exact: deviceId } } 
            : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setIsSimulatedCamera(false);
      } catch (firstErr) {
        console.warn("Retrying camera with simple video constraints due to error:", firstErr);
        addLog("Detectando puerto visual directo alterno...", "warning");
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setIsSimulatedCamera(false);
        } catch (secondErr) {
          console.warn("No physical camera device found or accessed. Falling back to Simulated Stark Optics Mode:", secondErr);
          setIsSimulatedCamera(true);
          setStream(null);
          setJarvisState(JarvisState.ACTIVE);
          addLog("Cámara física no disponible. Puerto de simulación holográfica de Stark Industries ACTIVO.", "success");
          triggerSound("startup");
          
          setDiagnostics(prev => prev.map(diag => {
            if (diag.label === "WEBCAM RESOLUTION") {
              return { ...diag, value: "SIMULATOR (1280x720)", status: "nominal" };
            }
            return diag;
          }));
          return;
        }
      }
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Update resolution meta
      const videoTrack = mediaStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const resolutionStr = settings.width && settings.height 
        ? `${settings.width}x${settings.height}` 
        : "N/A";

      setDiagnostics(prev => prev.map(diag => {
        if (diag.label === "WEBCAM RESOLUTION") {
          return { ...diag, value: resolutionStr, status: "nominal" };
        }
        return diag;
      }));

      // Find other camera devices
      const devicesInfo = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devicesInfo.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (!selectedDevice && videoTrack.getSettings().deviceId) {
        setSelectedDevice(videoTrack.getSettings().deviceId || "");
      }

      setJarvisState(JarvisState.ACTIVE);
      addLog("Matriz de video sincronizada.", "success");
      triggerSound("startup");
    } catch (err: any) {
      console.error("Camera access error:", err);
      setIsSimulatedCamera(true);
      setJarvisState(JarvisState.ACTIVE);
      addLog(`Cámara física no encontrada (${err.message || "Falta de permisos"}). Modo simulado ACTIVO.`, "success");
      triggerSound("startup");
      
      setDiagnostics(prev => prev.map(diag => {
        if (diag.label === "WEBCAM RESOLUTION") {
          return { ...diag, value: "SIMULATOR", status: "nominal" };
        }
        return diag;
      }));
    }
  };

  // Initialize JARVIS subsystems on load
  useEffect(() => {
    addLog("=== SUBSISTEMAS STARK MULTI-IA COGNITIVOS ===", "success");
    addLog("Iniciando acoplamiento biónico de interfaz visual...", "info");
    
    startCamera();

    // Trigger initial welcome voice clip
    setTimeout(() => {
      const welcomeText = getDynamicWelcomeText(speechConfig.personality);
      speak(welcomeText);
    }, 1800);

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Keyboard Hotkey Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input, textarea or contentEditable field
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.hasAttribute("contenteditable") ||
          activeEl.closest("[contenteditable='true']"))
      ) {
        return;
      }

      // Spacebar: Capture/Analyze
      if (e.code === "Space") {
        e.preventDefault(); // Stop default scroll behavior
        if (jarvisState === JarvisState.ACTIVE || jarvisState === JarvisState.SPEAKING) {
          handleCapture();
        } else {
          addLog("Sistemas ocupados en otro cálculo. Por favor espere...", "warning");
        }
      }

      // Escape: Abort/Mute/Reset active state
      if (e.code === "Escape") {
        e.preventDefault();
        cancelActiveSystems();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jarvisState, selectedDevice, stream, speechConfig]);

  // --- SPEECH RECOGNITION (HOT MIC / ALWAYS LISTENING & INSTANT BARGE-IN INTERRUPTION) ---
  useEffect(() => {
    const isSpeechRecognitionSupported = typeof window !== "undefined" && 
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    if (!isSpeechRecognitionSupported || !isHandsFree) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
      return;
    }

    let startTimeout: NodeJS.Timeout | null = null;
    let recognition: any = null;

    const initRecognition = () => {
      if (!isHandsFree) return;

      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true; // Enables instant detection when user begins speaking
        
        // Multi-country Spanish compatibility, defaults beautifully to Spanish Latino (es-419 / es-MX) representing local voice
        recognition.lang = "es-MX";

        recognition.onstart = () => {
          addLog("Micrófono abierto con éxito. Sensor acústico activo analizando ambiente...", "info");
        };

        // When the acoustic sensor detects user speech start, IMMEDIATELY silence J.A.R.V.I.S.!
        recognition.onspeechstart = () => {
          if (typeof window !== "undefined" && window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
            window.speechSynthesis.cancel();
            setJarvisState(JarvisState.ACTIVE);
            addLog("🤫 Usuario comenzó a hablar: J.A.R.V.I.S. silenciado para escuchar atentamente.", "info");
          }
        };

        recognition.onaudiostart = () => {
          if (typeof window !== "undefined" && window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
            window.speechSynthesis.cancel();
            setJarvisState(JarvisState.ACTIVE);
          }
        };

        recognition.onresult = (event: any) => {
          // Immediately cut off any spoken output when user utters anything
          if (typeof window !== "undefined" && window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
            window.speechSynthesis.cancel();
            setJarvisState(JarvisState.ACTIVE);
          }

          const results = event.results;
          const resultObj = results[results.length - 1];
          
          // If this is an interim partial result, we've already silenced TTS; wait for final transcript to execute command
          if (!resultObj || resultObj.isFinal === false) {
            return;
          }

          const transcript = resultObj[0].transcript.trim();
          if (!transcript) return;

          addLog(`[Voz Detectada] "${transcript}"`, "info");

          // Universal Voice & Intent Action Engine
          executeVoiceCommand(transcript, {
            personalityId: speechConfig.personality,
            personalityName: persMeta.name,
            activeMainTab,
            setActiveMainTab,
            openDetectedWebsite,
            openEmergencyModal: () => {
              triggerSound("alarm");
              setIsEmergencyModalOpen(true);
            },
            triggerScan: () => handleCapture(true),
            triggerSound,
            speak,
            addLog,
            speechConfig,
            setSpeechConfig,
            filter: opticalFilter as any,
            setFilter: (f: any) => setOpticalFilter(f),
            autoScanContinuous,
            setAutoScanContinuous,
            isSignLanguageMode,
            setIsSignLanguageMode,
            clearHistory: () => setHistory([]),
            smartHome: {
              tv: smartTv,
              setTv: setSmartTv,
              fan: smartFan,
              setFan: setSmartFan,
              lights: smartLights,
              setLights: setSmartLights,
              shieldDoor: smartShieldDoor,
              setShieldDoor: setSmartShieldDoor,
              hasPermission: smartPermission,
              setHasPermission: setSmartPermission,
            },
            isMiniWidgetOpen,
            setIsMiniWidgetOpen,
            openPilotModal: () => setIsPilotModalOpen(true),
            openDownloadModal: () => setIsDownloadModalOpen(true),
            onPopOutDesktop: () => {
              setIsMiniWidgetOpen(true);
              addLog("🖥️ Miniatura de J.A.R.V.I.S. desacoplada fuera de Google Chrome.", "success");
            },
            sendMessageToChat: (text: string) => {
              if (sendMessageRef.current) {
                sendMessageRef.current(text);
              } else {
                addLog("Enlace de ideas y chat ocupado.", "warning");
              }
            },
            activeScanLink: activeScan?.link,
            activeScanTitle: activeScan?.objectName,
          });
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'no-speech') return;
          console.warn("Speech Recognition error:", event.error);
          addLog(`Ruido o anomalía acústica: ${event.error}`, "warning");
        };

        recognition.onend = () => {
          // Restart microphone continuously if hands-free is enabled
          if (isHandsFree) {
            setTimeout(() => {
              if (recognitionRef.current === recognition) {
                try {
                  recognition.start();
                } catch (e) {}
              }
            }, 300);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Speech Recognition setup failure:", err);
      }
    };

    startTimeout = setTimeout(() => {
      initRecognition();
    }, 200);

    return () => {
      if (startTimeout) clearTimeout(startTimeout);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, [isHandsFree, speechConfig]);

  // Cancel running operations
  const cancelActiveSystems = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setJarvisState(JarvisState.ACTIVE);
    triggerSound("abort");
    const persMeta = PERSONALITIES[speechConfig.personality];
    addLog(`Acción abortada. Sistema de voz ${persMeta.name} regresando a standby.`, "warning");
    speak(persMeta.abortWord);
  };

  // Handle personality preset switch
  const handlePersonalityChange = (id: PersonalityId) => {
    const preset = PERSONALITIES[id];
    triggerSound("startup");
    
    // Dynamically auto-select masculine/normal voices for JARVIS or specified voice profiles for others
    let autoVoiceName = "";
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      const esVoices = voices.filter((v) => v.lang.toLowerCase().includes("es"));
      
      if (id === "JARVIS") {
        const maleHints = ["julio", "daniel", "david", "jorge", "diego", "carlos", "juan", "javier", "miguel", "pablo", "enrique", "antonio", "male", "hombre", "masculino"];
        const maleVoice = esVoices.find((v) => {
          const lower = v.name.toLowerCase();
          return maleHints.some((hint) => lower.includes(hint));
        });
        if (maleVoice) {
          autoVoiceName = maleVoice.name;
        }
      } else if (id === "KAREN") {
        const femaleHints = ["helena", "sabina", "maria", "monica", "elena", "lucia", "clara", "laura", "female", "mujer", "rosa", "sandra", "sofia"];
        const femaleVoice = esVoices.find((v) => {
          const lower = v.name.toLowerCase();
          return femaleHints.some((hint) => lower.includes(hint));
        });
        if (femaleVoice) {
          autoVoiceName = femaleVoice.name;
        }
      }
    }

    setSpeechConfig(prev => ({
      ...prev,
      personality: id,
      rate: preset.rate,
      pitch: preset.pitch,
      voiceName: autoVoiceName || prev.voiceName
    }));

    addLog(`Reconfigurando matriz virtual de la IA principal a: [${preset.name}]`, "info");
    
    // Lazy delay welcome call
    setTimeout(() => {
      const welcomeText = getDynamicWelcomeText(id);
      speak(welcomeText);
    }, 150);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomUploadedImage(base64);
        
        const img = new Image();
        img.onload = () => {
          uploadedImageRef.current = img;
          setSimulatedTarget("custom");
          addLog("Archivo visual integrado con éxito en la simulación espectral.", "success");
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    }
  };

  // --- CAPTURE & GEMINI ANALYSIS PIPELINE ---
  const handleCapture = async (forceOpenSite?: boolean) => {
    if (!isSimulatedCamera && (!videoRef.current || !canvasRef.current || !stream)) {
      addLog("Línea de video desconectada o cargando. Re-conectando...", "error");
      return;
    }
    if (isSimulatedCamera && !canvasRef.current) {
      addLog("Línea de canvas desconectada o cargando.", "error");
      return;
    }

    setJarvisState(JarvisState.CAPTURING);
    setFlashActive(true);
    triggerSound("scan");
    addLog(isSimulatedCamera ? "Capturando cuadro holográfico simulado..." : "Capturando fotograma de video actual...", "info");

    // Camera flash effect
    setTimeout(() => {
      setFlashActive(false);
    }, 150);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      canvas.width = 640;
      canvas.height = 480;
      
      if (isSimulatedCamera) {
        // Draw the simulated viewport exactly as is
        const currentFrame = Math.floor(Date.now() / 33);
        drawSimulatedScene(ctx, canvas.width, canvas.height, simulatedTarget, uploadedImageRef.current, opticalFilter, currentFrame);
      } else {
        const video = videoRef.current!;
        // Clean target dimensions matches raw properties
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Mirror horizontal frame if required to matches video mirror preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Restore transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }

      const base64Image = canvas.toDataURL("image/jpeg", 0.85);

      setJarvisState(JarvisState.ANALYZING);
      addLog(`Procesando imagen con la personalidad [${speechConfig.personality}]...`, "info");
      
      const isFriday = speechConfig.personality === "FRIDAY";
      const isKaren = speechConfig.personality === "KAREN";
      const isEdith = speechConfig.personality === "EDITH";
      
      let speechIntro = isSignLanguageMode 
        ? "Traduciendo gesto de señas al instante, un momento."
        : "Analizando el objeto, un momento por favor.";
        
      if (isFriday) {
        speechIntro = isSignLanguageMode 
          ? "Traduciendo esa seña de inmediato, Jefe." 
          : "Buscando coincidencias en la base de datos, Jefe. Un segundo.";
      }
      if (isKaren) {
        speechIntro = isSignLanguageMode 
          ? "Estoy leyendo tus señas con mucho cuidado, joven héroe..."
          : "Estoy analizando qué objeto tienes allí, joven héroe.";
      }
      if (isEdith) {
        speechIntro = isSignLanguageMode
          ? "Decodificando vector de señas ópticas tácticas."
          : "Escaneo táctico satelital en proceso. Aguarde.";
      }

      speak(speechIntro);

      const startTime = Date.now();

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            image: base64Image,
            personality: speechConfig.personality,
            signMode: isSignLanguageMode
          }),
        });

        const latency = Date.now() - startTime;
        setDiagnostics(prev => prev.map(diag => {
          if (diag.label === "AI CORE LATENCY") {
            return { ...diag, value: `${latency}ms`, status: latency > 3000 ? "warning" : "nominal" };
          }
          return diag;
        }));

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Fallo en respuesta de análisis.");
        }

        const data = await response.json();
        const geminiText = data.result;

        // Parse object name and links from results
        const { objectName, url, threatLevel, threatDetail } = parseResponseText(geminiText);

        const newScanItem: ScanItem = {
          id: `${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false }),
          image: base64Image,
          objectName,
          link: url,
          fullResponse: geminiText,
          success: true,
          threatLevel,
          threatDetail
        };

        setActiveScan(newScanItem);
        setHistory(prev => [newScanItem, ...prev]);
        triggerSound("success");
        addLog(`Cognición Completada: Objeto detectado -> [${objectName}]`, "success");
        addLog(`Enlace extraído: ${url || "Ninguno"}`, "output");

        // Synthesize parsed result details
        speak(geminiText);

        // Auto-navigate to website if detected and enabled
        if (url && (autoOpenWebsite || forceOpenSite)) {
          addLog(`Auto-Navegación activada: Transportando al portal [${url}]`, "success");
          setTimeout(() => {
            openDetectedWebsite(url, objectName);
          }, 500);
        }

      } catch (err: any) {
        console.error("Cognition processing failed:", err);
        addLog(`FALLO NEURONAL EN PROCESO: ${err.message || "Fallo de conexión en API."}`, "error");
        setJarvisState(JarvisState.ERROR);
        triggerSound("error");
        
        const errorScan: ScanItem = {
          id: `${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false }),
          image: base64Image,
          objectName: "Error de Análisis",
          link: "",
          fullResponse: "Lo siento Señor, hubo un error al procesar la información de la imagen. Compruebe la conexión o las claves de API.",
          success: false
        };
        setActiveScan(errorScan);
        speak(errorScan.fullResponse);
      }
    }
  };

  // Parse object name and url from the formatting guideline response
  const parseResponseText = (text: string) => {
    // Regex for parsing URL links
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const matchUrls = text.match(urlRegex);
    let url = "";
    if (matchUrls && matchUrls.length > 0) {
      url = matchUrls[0].replace(/[.,);]$/, ""); // Clean punctuation from URL match
    }

    // Extract object name
    let objectName = "Objeto Identificado";
    const veoMatch = text.match(/(?:Veo un|Sistemas ópticos detectan:|Mis sensores detectan un|Sensores detectan un|He detectado un|He analizado un)\s?(?:[^\s.]+\s?){1,5}/i);
    if (veoMatch) {
      objectName = veoMatch[0].replace(/Veo un|Sistemas ópticos detectan:|Mis sensores detectan un|Sensores detectan un|He detectado un|He analizado un/i, "").trim().replace(/[.,:;]$/, "");
    } else {
      // Fallback: extract from sentence
      const cleanText = text.replace(/ Puede encontrar | Enlace de datos: | He cargado .*/i, "");
      objectName = cleanText.length > 35 ? cleanText.substring(0, 35) + "..." : cleanText;
    }

    // Capitalize first letter of parsed name
    objectName = objectName.charAt(0).toUpperCase() + objectName.slice(1);

    // Fallback URL if none was explicitly in text
    if (!url && objectName && objectName !== "Objeto Identificado" && objectName !== "Error de Análisis") {
      url = `https://www.google.com/search?q=${encodeURIComponent(objectName)}`;
    }

    // Parse threat level and detail
    let threatLevel: "Ninguno" | "Bajo" | "Medio" | "Alto" = "Ninguno";
    let threatDetail = "Análisis de riesgo nominal de Stark Industries.";

    const threatMatch = text.match(/Amenaza:\s*\[?(Ninguno|Bajo|Medio|Alto)\]?\s*-\s*([^\n.]+)/i);
    if (threatMatch) {
      const matchLevel = threatMatch[1].trim();
      const capitalized = (matchLevel.charAt(0).toUpperCase() + matchLevel.slice(1).toLowerCase()) as any;
      if (["Ninguno", "Bajo", "Medio", "Alto"].includes(capitalized)) {
        threatLevel = capitalized;
      }
      threatDetail = threatMatch[2].trim();
    }

    return { objectName, url, threatLevel, threatDetail };
  };

  // Render a specific scan card details from History list
  const handleLoadItem = (item: ScanItem) => {
    setActiveScan(item);
    addLog(`Cargando diagnóstico histórico del visor: ${item.objectName}`, "info");
    speak(item.fullResponse);
  };

  const getStatusBadge = (status: SystemDiagnostic["status"]) => {
    switch (status) {
      case "nominal":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "warning":
        return "bg-hud-orange/10 text-hud-orange border-hud-orange/20";
      case "alert":
        return "bg-hud-red/10 text-hud-red border-hud-red/20 animate-pulse";
      default:
        return "bg-hud-cyan/10 text-hud-cyan border-hud-cyan/20";
    }
  };

  const persMeta = PERSONALITIES[speechConfig.personality];

  return (
    <div 
      id="jarvis-cockpit-canvas" 
      className="min-h-screen bg-hud-bg text-gray-200 font-sans relative overflow-x-hidden hud-grid select-none"
    >
      {/* HUD Scanner Flash Highlight Overlay */}
      {flashActive && (
        <div className="absolute inset-0 bg-white opacity-40 z-50 pointer-events-none transition-opacity duration-150" />
      )}

      {/* Grid Scan Overlay Details */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,10,25,0)_0%,rgba(0,5,15,0.7)_100%)] pointer-events-none" />

      {/* --- HUD HEADER --- */}
      <header className="border-b border-hud-cyan/15 bg-black/40 backdrop-blur-md px-4 md:px-8 py-3 relative z-20 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full border border-hud-cyan/30 flex items-center justify-center bg-hud-cyan/5">
              <Compass className="w-5 h-5 text-hud-cyan animate-spin-slow" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-hud-bg rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm tracking-[0.25em] font-bold text-hud-cyan font-mono leading-none">
                SISTEMA {persMeta.name} // LABORATORIO INTELIGENTE
              </h1>
              <span className="text-[8px] font-mono border border-hud-cyan/30 text-hud-cyan px-1.5 py-0.2 rounded bg-hud-cyan/5">
                V5.2
              </span>
            </div>
            <p className="text-[9px] font-mono text-gray-400 uppercase mt-0.5 tracking-wider">
              Subsistema de Reconocimiento Stark Industries v3.5 // MULTI-CORE ACTIVE
            </p>
          </div>
        </div>

        {/* Real-time telemetry items */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {diagnostics.map((diag, index) => (
            <div key={index} className="flex flex-col items-center border border-hud-border/10 bg-black/20 rounded shadow-sm px-3 py-1">
              <span className="text-[8px] font-mono text-gray-500 leading-none">{diag.label}</span>
              <span className={`text-[10px] font-mono font-bold leading-none mt-1 ${
                diag.status === 'nominal' ? 'text-hud-cyan' : diag.status === 'warning' ? 'text-hud-orange' : 'text-hud-red'
              }`}>{diag.value}</span>
            </div>
          ))}

          {/* Pilot Identity Profile Badge */}
          <button
            id="pilot-profile-btn"
            onClick={() => {
              triggerSound("click");
              setIsPilotModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold border border-hud-cyan/40 bg-hud-cyan/10 hover:bg-hud-cyan/20 text-hud-cyan shadow-[0_0_10px_rgba(0,240,255,0.15)] transition-all cursor-pointer uppercase"
            title="Configurar Nombre, Edad y Título del Piloto"
          >
            <User className="w-3.5 h-3.5 text-hud-cyan animate-pulse" />
            <span className="tracking-wider">
              {userProfile.name
                ? `${userProfile.title ? `${userProfile.title} ` : ""}${userProfile.name} (${userProfile.age} AÑOS)`
                : "REGISTRAR PILOTO"}
            </span>
            <span className="text-[8px] bg-hud-cyan/25 text-white px-1.5 py-0.5 rounded ml-1 border border-hud-cyan/40">
              PERFIL
            </span>
          </button>

          {/* Download & Install Multiplatform Button (Cellphones & Computers) */}
          <button
            id="download-jarvis-header-btn"
            onClick={() => {
              triggerSound("click");
              setIsDownloadModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold border border-hud-cyan/50 bg-hud-cyan/15 hover:bg-hud-cyan/25 text-hud-cyan shadow-[0_0_12px_rgba(0,240,255,0.25)] transition-all cursor-pointer uppercase group"
            title="Descargar e instalar J.A.R.V.I.S. en celulares (Android/iOS) y computadoras (Windows/Mac)"
          >
            <Download className="w-3.5 h-3.5 group-hover:animate-bounce text-hud-cyan" />
            <span className="hidden sm:inline">DESCARGAR EN CELULAR / PC</span>
            <span className="sm:hidden">DESCARGAR</span>
            <span className="text-[8px] bg-hud-cyan/30 text-white px-1.5 py-0.5 rounded font-mono border border-hud-cyan/50 ml-0.5">
              APP
            </span>
          </button>

          {/* Mini Floating HUD Picture-in-Picture Button */}
          <button
            id="toggle-mini-widget-btn"
            onClick={() => {
              triggerSound("click");
              const nextState = !isMiniWidgetOpen;
              setIsMiniWidgetOpen(nextState);
              if (nextState) {
                addLog("🖥️ Modo Pantalla Miniatura de JARVIS desplegado.", "success");
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold border transition-all cursor-pointer uppercase ${
              isMiniWidgetOpen
                ? "bg-hud-cyan text-black border-hud-cyan shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                : "bg-black/40 border-hud-cyan/40 text-hud-cyan hover:bg-hud-cyan/15 hover:border-hud-cyan"
            }`}
            title="Abrir o cerrar pantalla flotante en miniatura de JARVIS (PIP)"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>{isMiniWidgetOpen ? "MINI HUD ACTIVO" : "MINIATURA (PIP)"}</span>
          </button>

          {/* Emergency SOS Protocol Button */}
          <button
            id="emergency-sos-header-btn"
            onClick={() => {
              triggerSound("alarm");
              setIsEmergencyModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold border border-red-500/60 bg-red-950/80 hover:bg-red-900 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer uppercase"
            title="Abrir ventana de emergencia con enlace de voz prioritario"
          >
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            <span>🚨 EMERGENCIA / SOS</span>
          </button>
        </div>
      </header>

      {/* --- MAIN COCKPIT SECTION --- */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COLUMN: CAMERA ENGINE & MULTI-DEVICES CONTROLS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* HIGH-TECH HUD NAVIGATION TABS & HOT MIC TOGGLE */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex bg-black/60 p-1 rounded border border-hud-cyan/15 gap-1.5 select-none self-start flex-wrap sm:flex-nowrap">
              <button
                onClick={() => {
                  triggerSound("click");
                  setActiveMainTab("visor");
                }}
                className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase transition-all rounded cursor-pointer ${
                  activeMainTab === "visor"
                    ? "bg-hud-cyan text-black shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>Visor de Escaneo</span>
              </button>
              <button
                id="chat-tab-button"
                onClick={() => {
                  triggerSound("click");
                  setActiveMainTab("chat");
                }}
                className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase transition-all rounded cursor-pointer ${
                  activeMainTab === "chat"
                    ? "bg-hud-cyan text-black shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Matriz de Ideas & Chat</span>
              </button>
              <button
                id="pc-tab-button"
                onClick={() => {
                  triggerSound("click");
                  setActiveMainTab("pc");
                }}
                className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase transition-all rounded cursor-pointer ${
                  activeMainTab === "pc"
                    ? "bg-hud-cyan text-black shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Control de PC</span>
              </button>
              <button
                id="usb-tab-button"
                onClick={() => {
                  triggerSound("click");
                  setActiveMainTab("usb");
                }}
                className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase transition-all rounded cursor-pointer ${
                  activeMainTab === "usb"
                    ? "bg-hud-cyan text-black shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>Enlace USB y Portabilidad</span>
              </button>
              <button
                id="home-tab-button"
                onClick={() => {
                  triggerSound("click");
                  setActiveMainTab("home");
                }}
                className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase transition-all rounded cursor-pointer ${
                  activeMainTab === "home"
                    ? "bg-hud-cyan text-black shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Control del Hogar (Casa)</span>
              </button>
            </div>

            {/* SPEECH RECOGNITION HOT MIC TOGGLE BUTTON */}
            <button
              onClick={() => {
                triggerSound("click");
                setIsHandsFree(!isHandsFree);
                if (!isHandsFree) {
                  addLog("Solicitando activación del receptor vocal de la armadura...", "info");
                } else {
                  addLog("Desactivando sensor acústico ambiental. Canal reservado.", "warning");
                }
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 font-mono text-xs font-bold uppercase transition-all rounded border cursor-pointer select-none self-start sm:self-auto ${
                isHandsFree
                  ? "bg-hud-orange/15 border-hud-orange/50 text-hud-orange shadow-[0_0_12px_rgba(255,153,0,0.2)] hover:bg-hud-orange/25"
                  : "bg-black/60 border-hud-border/15 text-gray-400 hover:text-white hover:border-hud-cyan/40"
              }`}
              title="Activar detección continua de voz (Manos Libres) sin presionar botones"
            >
              {isHandsFree ? (
                <>
                  <Mic className="w-4 h-4 animate-pulse text-hud-orange" />
                  <span className="flex items-center gap-1.5">
                    HOT MIC ACTIVO [HABLA]
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                  </span>
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4 text-gray-500" />
                  <span>MANOS LIBRES APAGADO</span>
                </>
              )}
            </button>
          </div>

          {activeMainTab === "visor" ? (
            <div className="hud-panel rounded relative overflow-hidden flex-1 flex flex-col">
              {/* Visual Header overlay inside panels */}
              <div className="border-b border-hud-border/15 bg-black/40 px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-hud-cyan" />
                  <span className="text-xs font-mono font-bold text-hud-cyan tracking-widest uppercase">
                    Canal Óptico Directo: {persMeta.name} Visor
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="text-[9px] font-mono text-hud-cyan flex items-center gap-1 bg-hud-cyan/5 border border-hud-cyan/20 px-2 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    SENSOR ACTIVO
                  </span>
                  
                  {/* Select Filtro Óptico */}
                  <div className="flex items-center gap-1 bg-black/60 text-hud-cyan border border-hud-cyan/20 rounded py-0.5 px-1.5 text-[9px] font-mono uppercase">
                    <Eye className="w-3 h-3 text-hud-cyan/75" />
                    <select
                      value={opticalFilter}
                      onChange={(e) => {
                        const newFilter = e.target.value;
                        setOpticalFilter(newFilter);
                        triggerSound("click");
                        
                        const filterNames: Record<string, string> = {
                          normal: "Estándar",
                          thermal: "Visión Térmica",
                          nightvision: "Visión Nocturna",
                          starktech: "Óptica Stark Holográfica",
                          sepia: "Retro Sepia",
                          grayscale: "Espectro de Grises Avanzado"
                        };
                        addLog(`Ajustando canal óptico a modo: ${filterNames[newFilter] || newFilter}`, "info");
                      }}
                      className="bg-transparent text-hud-cyan focus:outline-none cursor-pointer font-bold uppercase text-[9px] outline-none"
                      title="Seleccionar Filtro Óptico Avanzado"
                    >
                      <option value="normal" className="bg-zinc-950 text-hud-cyan">ÓPTICA ESTÁNDAR</option>
                      <option value="thermal" className="bg-zinc-950 text-hud-cyan">VISIÓN TÉRMICA</option>
                      <option value="nightvision" className="bg-zinc-950 text-hud-cyan">VISIÓN NOCTURNA</option>
                      <option value="starktech" className="bg-zinc-950 text-hud-cyan">ÓPTICA STARK HOLOGRÁFICA</option>
                      <option value="sepia" className="bg-zinc-950 text-hud-cyan">RETRO SEPIA</option>
                      <option value="grayscale" className="bg-zinc-950 text-hud-cyan">ANÁLISIS ESPECTRAL</option>
                    </select>
                  </div>

                  {/* Modo Intérprete de Señas Toggle */}
                  <button
                    onClick={() => {
                      const newMode = !isSignLanguageMode;
                      setIsSignLanguageMode(newMode);
                      triggerSound("click");
                      addLog(
                        newMode 
                          ? "Canal de enlace activado: Modo Intérprete de Lenguaje de Señas habilitado. El asistente traducirá gestos visuales a voz."
                          : "Modo Intérprete de Lenguaje de Señas desactivado. Regresando a reconocimiento de objetos ordinarios.",
                        newMode ? "success" : "warning"
                      );
                      
                      // Auto switch simulated target to a nice sign language target if user turns on the mode
                      if (newMode && isSimulatedCamera) {
                        setSimulatedTarget("sign_te_quiero");
                      } else if (!newMode && isSimulatedCamera && simulatedTarget.startsWith("sign_")) {
                        setSimulatedTarget("arc_reactor");
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-[9px] font-bold font-mono uppercase transition-all border cursor-pointer ${
                      isSignLanguageMode
                        ? "bg-hud-orange/15 border-hud-orange text-hud-orange shadow-[0_0_8px_rgba(255,153,0,0.25)] animate-pulse"
                        : "bg-black/40 border-hud-cyan/20 text-hud-cyan hover:bg-hud-cyan/10 hover:border-hud-cyan/40"
                    }`}
                    title="Habilitar/Deshabilitar traductor e intérprete sónico de lenguaje de señas para mudos"
                  >
                    <Sparkles className="w-3 h-3 text-current animate-pulse" />
                    <span>🖐️ INTÉRPRETE SEÑAS: {isSignLanguageMode ? "ACTIVO" : "DESACTIVADO"}</span>
                  </button>

                  {/* Switch Camera Dropdown */}
                  {devices.length > 1 && (
                    <select
                      value={selectedDevice}
                      onChange={(e) => {
                        setSelectedDevice(e.target.value);
                        startCamera(e.target.value);
                      }}
                      className="bg-black/60 text-hud-cyan border border-hud-cyan/20 rounded py-0.5 px-2 text-[9px] font-mono uppercase focus:outline-none focus:border-hud-cyan"
                    >
                      {devices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Lente [${device.deviceId.substring(0, 5)}]`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Video Canvas Container */}
              <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-[420px] overflow-hidden">
                {stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1] transition-all duration-300" // Normal mirrored webcam view
                    style={{ filter: getFilterCSS(opticalFilter) }}
                  />
                ) : isSimulatedCamera ? (
                  <SimulatedFeedCanvas 
                    opticalFilter={opticalFilter}
                    simulatedTarget={simulatedTarget}
                    customUploadedImage={customUploadedImage}
                    uploadedImageRef={uploadedImageRef}
                    drawSimulatedScene={drawSimulatedScene}
                    getFilterCSS={getFilterCSS}
                  />
                ) : (
                  <div className="text-center p-6 max-w-sm flex flex-col items-center gap-3">
                    <AlertTriangle className="w-10 h-10 text-hud-orange animate-bounce" />
                    <p className="text-xs font-mono text-gray-400 leading-normal uppercase">
                      El puerto óptico está inactivo o no se pudo acceder.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => startCamera(selectedDevice)}
                        className="flex items-center gap-1.5 text-xs font-mono border border-hud-orange/40 hover:bg-hud-orange/10 hover:border-hud-orange text-hud-orange px-3.5 py-1.5 rounded uppercase cursor-pointer transition-all"
                      >
                        Activar Cámara Real
                      </button>
                      <button
                        onClick={() => {
                          setIsSimulatedCamera(true);
                          addLog("Puerto óptico simulado de Stark Industries activado.", "success");
                        }}
                        className="flex items-center gap-1.5 text-xs font-mono border border-hud-cyan/40 hover:bg-hud-cyan/10 hover:border-hud-cyan text-hud-cyan px-3.5 py-1.5 rounded uppercase cursor-pointer transition-all"
                      >
                        Iniciar Simulador
                      </button>
                    </div>
                  </div>
                )}

                {/* Simulated Target Selector HUD Overlay */}
                {isSimulatedCamera && (
                  <div className="absolute top-12 left-4 right-4 z-20 flex flex-wrap gap-1.5 justify-center bg-black/85 border border-hud-cyan/20 p-2.5 rounded backdrop-blur-md shadow-lg shadow-black/80">
                    <div className="text-[8px] font-mono text-hud-cyan font-bold uppercase w-full text-center tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-hud-cyan rounded-full animate-ping" />
                      SIMULADOR ESPECTRAL DE INDUSTRIAS STARK
                    </div>
                    <button 
                      onClick={() => { setSimulatedTarget("arc_reactor"); triggerSound("click"); }}
                      className={`px-2 py-1 rounded text-[8px] font-mono uppercase transition-all ${simulatedTarget === "arc_reactor" ? "bg-hud-cyan text-black font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]" : "bg-black/55 text-hud-cyan border border-hud-cyan/15 hover:bg-hud-cyan/10"}`}
                    >
                      💥 CENTRAL ARC
                    </button>
                    <button 
                      onClick={() => { setSimulatedTarget("dron_anomalia"); triggerSound("click"); }}
                      className={`px-2 py-1 rounded text-[8px] font-mono uppercase transition-all ${simulatedTarget === "dron_anomalia" ? "bg-red-500 text-white font-bold animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-black/55 text-hud-cyan border border-hud-cyan/15 hover:bg-hud-cyan/10"}`}
                    >
                      🛸 DRON ENEMIGO
                    </button>
                    <button 
                      onClick={() => { setSimulatedTarget("suit_mark85"); triggerSound("click"); }}
                      className={`px-2 py-1 rounded text-[8px] font-mono uppercase transition-all ${simulatedTarget === "suit_mark85" ? "bg-rose-500 text-white font-bold shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "bg-black/55 text-hud-cyan border border-hud-cyan/15 hover:bg-hud-cyan/10"}`}
                    >
                      🛡️ MARK LXXXV
                    </button>
                    <button 
                      onClick={() => { setSimulatedTarget("edith_glasses"); triggerSound("click"); }}
                      className={`px-2 py-1 rounded text-[8px] font-mono uppercase transition-all ${simulatedTarget === "edith_glasses" ? "bg-emerald-500 text-black font-bold shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-black/55 text-hud-cyan border border-hud-cyan/15 hover:bg-hud-cyan/10"}`}
                    >
                      👓 E.D.I.T.H.
                    </button>
                    
                    {/* GESTOS SEÑAS ACÚSTICAS */}
                    <button 
                      onClick={() => { setSimulatedTarget("sign_saludo"); triggerSound("click"); }}
                      className={`px-2 py-1 rounded text-[8px] font-mono uppercase transition-all ${simulatedTarget === "sign_saludo" ? "bg-purple-500 text-white font-bold shadow-[0_0_8px_rgba(168,85,247,0.4)]" : "bg-black/55 text-pink-400 border border-pink-500/20 hover:bg-pink-500/10"}`}
                      title="Simular seña de 'Hola'"
                    >
                      🖐️ SEÑA SALUDO
                    </button>
                    <button 
                      onClick={() => { setSimulatedTarget("sign_gracias"); triggerSound("click"); }}
                      className={`px-2 py-1 rounded text-[8px] font-mono uppercase transition-all ${simulatedTarget === "sign_gracias" ? "bg-purple-500 text-white font-bold shadow-[0_0_8px_rgba(168,85,247,0.4)]" : "bg-black/55 text-pink-400 border border-pink-500/20 hover:bg-pink-500/10"}`}
                      title="Simular seña de 'Gracias'"
                    >
                      🙏 SEÑA GRACIAS
                    </button>
                    <button 
                      onClick={() => { setSimulatedTarget("sign_te_quiero"); triggerSound("click"); }}
                      className={`px-2 py-1 rounded text-[8px] font-mono uppercase transition-all ${simulatedTarget === "sign_te_quiero" ? "bg-purple-500 text-white font-bold shadow-[0_0_8px_rgba(168,85,247,0.4)]" : "bg-black/55 text-pink-400 border border-pink-500/20 hover:bg-pink-500/10"}`}
                      title="Simular seña de 'Te quiero'"
                    >
                      🤟 SEÑA ASL LOVE
                    </button>
                    <button 
                      onClick={() => { setSimulatedTarget("sign_ayuda"); triggerSound("click"); }}
                      className={`px-2 py-1 rounded text-[8px] font-mono uppercase transition-all ${simulatedTarget === "sign_ayuda" ? "bg-orange-500 text-white font-bold shadow-[0_0_8px_rgba(249,115,22,0.4)] animate-pulse" : "bg-black/55 text-pink-400 border border-pink-500/20 hover:bg-pink-500/10"}`}
                      title="Simular seña de socorro (Ayuda)"
                    >
                      🆘 SEÑA AUXILIO
                    </button>

                    <label className={`px-2 py-1 rounded text-[8px] font-mono uppercase cursor-pointer flex items-center gap-1 transition-all ${simulatedTarget === "custom" ? "bg-amber-500 text-black font-bold shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-black/55 text-hud-cyan border border-hud-cyan/15 hover:bg-hud-cyan/10"}`}>
                      <span>📁 COPIAR ARCHIVO</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                    </label>
                    {stream === null && devices.length > 0 && (
                      <button 
                        onClick={() => { startCamera(selectedDevice); }}
                        className="px-2 py-1 rounded text-[8px] font-mono uppercase bg-zinc-900 border border-hud-orange/30 text-hud-orange hover:bg-hud-orange/15 transition-all"
                      >
                        ⚡ CONECTAR CÁMARA
                      </button>
                    )}
                  </div>
                )}

                {/* Holographic Diagnostic HUD Overlays */}
                {(stream || isSimulatedCamera) && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 mix-blend-screen select-none">
                    {/* Top corners HUD indicators */}
                    <div className="flex justify-between w-full">
                      <div className="text-[10px] font-mono text-hud-cyan bg-black/40 px-2 py-0.5 rounded border border-hud-cyan/15">
                        SEC_OPT_STREAM // 001
                      </div>
                      
                      {/* Top center optical filter HUD alert if not normal */}
                      {opticalFilter !== "normal" && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                          <div className="bg-black/95 border border-hud-orange text-hud-orange px-3 py-1 rounded text-[9px] font-mono tracking-[0.15em] font-bold uppercase animate-pulse flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,153,0,0.4)]">
                            <span className="w-1.5 h-1.5 bg-hud-orange rounded-full animate-ping" />
                            STARK OPTICS: {
                              opticalFilter === "thermal" ? "SISTEMA TÉRMICO" : 
                              opticalFilter === "nightvision" ? "VISIÓN NOCTURNA" : 
                              opticalFilter === "starktech" ? "TIPO: HOLOGRÁFICO CYAN" : 
                              opticalFilter === "sepia" ? "MODO SEPIA RETRO" : "ANÁLISIS ESPECTRAL"
                            }
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] font-mono text-hud-cyan text-right flex flex-col items-end">
                        <span>ELAPSED: {new Date().toISOString().substring(11, 19)}</span>
                        <span className="text-[8px] text-gray-400 mt-0.5">GRID SCALE: [Y: 480 // X: 640]</span>
                      </div>
                    </div>

                    {/* Horizontal and Vertical Target Grid Crosshair lines */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Ring Crosshair */}
                      <div className="w-28 h-28 border border-dashed border-hud-cyan/30 rounded-full flex items-center justify-center relative animate-spin-slow">
                        <div className="w-20 h-20 border border-hud-cyan/40 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-hud-cyan rounded-full animate-ping" />
                        </div>
                        <div className="absolute w-4 h-0.5 bg-hud-cyan -left-2" />
                        <div className="absolute w-4 h-0.5 bg-hud-cyan -right-2" />
                        <div className="absolute h-4 w-0.5 bg-hud-cyan -top-2" />
                        <div className="absolute h-4 w-0.5 bg-hud-cyan -bottom-2" />
                      </div>

                      {/* Left coordinate ticks */}
                      <div className="absolute left-6 text-[8px] font-mono text-hud-cyan/40 flex flex-col gap-10">
                        <span>+150px</span>
                        <span>+0.00px</span>
                        <span>-150px</span>
                      </div>

                      {/* Right compass roses */}
                      <div className="absolute right-6 opacity-40">
                        <div className="w-8 h-8 rounded-full border border-hud-cyan/50 flex items-center justify-center relative rotate-45">
                          <div className="w-0.5 h-6 bg-hud-cyan absolute" />
                          <div className="w-6 h-0.5 bg-hud-cyan absolute" />
                        </div>
                      </div>
                    </div>

                    {/* Visual laser scanner bar overlay animation */}
                    {jarvisState === JarvisState.ANALYZING && (
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-hud-orange to-transparent opacity-85 shadow-[0_0_12px_#ff9900] animate-scan-laser z-10" />
                    )}

                    {/* Camera bracket borders */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-hud-cyan" />
                    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-hud-cyan" />
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-hud-cyan" />
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-hud-cyan" />

                    {/* Bottom details of stream overlay */}
                    <div className="flex justify-between w-full mt-auto">
                      <div className="text-[9px] font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-hud-cyan" />
                        <span>{speechConfig.personality} COGNITION ONLINE</span>
                      </div>
                      <div className="text-[9px] font-mono text-hud-cyan bg-black/40 px-2 py-0.5 rounded">
                        FOCAL RATE: AUTO
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Action bar underneath camera */}
              <div className="p-3 bg-black/40 border-t border-hud-border/10 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div>
                    <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                      <Keyboard className="w-4 h-4 text-hud-cyan animate-pulse" />
                      <span className="text-xs font-mono font-semibold text-hud-cyan uppercase">
                        Modo Analizador Táctico ({persMeta.name})
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-gray-400 uppercase mt-0.5">
                      Presione <kbd className="border border-hud-cyan/30 px-1 bg-hud-cyan/5 text-hud-cyan text-[9px] rounded font-bold uppercase mx-0.5">Espacio</kbd> o use los botones de captura inteligente.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center">
                    {/* Primary Button: Scan & Auto-Take to Website */}
                    <button
                      onClick={() => handleCapture(true)}
                      disabled={(!stream && !isSimulatedCamera) || jarvisState === JarvisState.ANALYZING || jarvisState === JarvisState.INITIALIZING}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-hud-cyan hover:bg-hud-cyan/80 text-black font-bold text-xs font-mono px-4 py-2.5 rounded shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      title="Escanear lo que muestras a la cámara y abrir automáticamente su página web"
                    >
                      <Globe className="w-4 h-4 animate-spin-slow" />
                      <span>ESCANEAR Y LLEVAR AL SITIO</span>
                    </button>

                    <button
                      onClick={() => handleCapture(false)}
                      disabled={(!stream && !isSimulatedCamera) || jarvisState === JarvisState.ANALYZING || jarvisState === JarvisState.INITIALIZING}
                      className="flex items-center justify-center gap-1.5 bg-black/60 hover:bg-black/90 text-hud-cyan border border-hud-cyan/40 hover:border-hud-cyan font-semibold text-xs font-mono px-3.5 py-2.5 rounded transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      title="Escanear solo para diagnóstico"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Solo Escaneo</span>
                    </button>

                    {(jarvisState === JarvisState.SPEAKING || jarvisState === JarvisState.ANALYZING) && (
                      <button
                        onClick={cancelActiveSystems}
                        className="flex items-center justify-center p-2.5 border border-hud-orange hover:bg-hud-orange/15 text-hud-orange rounded transition-all cursor-pointer"
                        title="Abortar operación"
                      >
                        <Square className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-bar options: Auto-Open Toggle and Continuous Radar Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-hud-cyan/10 text-[10px] font-mono">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        triggerSound("click");
                        setAutoOpenWebsite(!autoOpenWebsite);
                        addLog(`Auto-Navegación al escanear: ${!autoOpenWebsite ? "HABILITADA" : "DESHABILITADA"}`, "info");
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all cursor-pointer uppercase ${
                        autoOpenWebsite 
                          ? "bg-hud-cyan/15 border-hud-cyan text-hud-cyan shadow-[0_0_8px_rgba(0,240,255,0.2)]" 
                          : "bg-black/40 border-gray-700 text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      <span>AUTO-IR AL SITIO: {autoOpenWebsite ? "ACTIVADO" : "DESACTIVADO"}</span>
                    </button>

                    <button
                      onClick={() => {
                        triggerSound("click");
                        setAutoScanContinuous(!autoScanContinuous);
                        addLog(`Radar de Auto-Detección: ${!autoScanContinuous ? "ENCENDIDO (cada 6s)" : "APAGADO"}`, "info");
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all cursor-pointer uppercase ${
                        autoScanContinuous 
                          ? "bg-hud-orange/15 border-hud-orange text-hud-orange shadow-[0_0_10px_rgba(255,153,0,0.3)] animate-pulse" 
                          : "bg-black/40 border-gray-700 text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <Radio className="w-3 h-3" />
                      <span>RADAR AUTO-ESCANEO: {autoScanContinuous ? "EN LÍNEA" : "STANDBY"}</span>
                    </button>
                  </div>

                  {activeScan?.link && (
                    <button
                      onClick={() => openDetectedWebsite(activeScan.link, activeScan.objectName)}
                      className="flex items-center gap-1 text-hud-cyan hover:underline ml-auto"
                    >
                      <span>Abrir portal de {activeScan.objectName.substring(0, 16)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : activeMainTab === "chat" ? (
            <IdeaChatPanel
              personalityId={speechConfig.personality}
              personalityName={persMeta.name}
              onSpeak={speak}
              triggerSound={triggerSound}
              volume={speechConfig.volume}
              onSendMessageRef={sendMessageRef}
              userProfile={userProfile}
            />
          ) : activeMainTab === "pc" ? (
            <ComputerControlPanel
              personalityId={speechConfig.personality}
              personalityName={persMeta.name}
              triggerSound={triggerSound}
              addLog={addLog}
              speak={speak}
              isMiniWidgetOpen={isMiniWidgetOpen}
              setIsMiniWidgetOpen={setIsMiniWidgetOpen}
            />
          ) : activeMainTab === "usb" ? (
            <USBTransceiverPanel
              personalityId={speechConfig.personality}
              personalityName={persMeta.name}
              triggerSound={triggerSound}
              addLog={addLog}
              speechConfig={speechConfig}
              onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
            />
          ) : (
            <SmartHomePanel
              personalityId={speechConfig.personality}
              personalityName={persMeta.name}
              triggerSound={triggerSound}
              addLog={addLog}
              speak={speak}
              tvState={smartTv}
              setTvState={setSmartTv}
              fanState={smartFan}
              setFanState={setSmartFan}
              lightsState={smartLights}
              setLightsState={setSmartLights}
              shieldDoorState={smartShieldDoor}
              setShieldDoorState={setSmartShieldDoor}
              hasPermissionState={smartPermission}
              setHasPermissionState={setSmartPermission}
            />
          )}

          {/* Diagnostic Console panel */}
          <div className="h-[210px] relative">
            <DiagnosticLogs logs={logs} onClear={() => setLogs([])} />
          </div>
        </div>

        {/* RIGHT COLUMN: COGNITIVE DECODER & REACTOR CENTRE */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Active ARC Reactor and Sound indicators */}
          <div className="hud-panel rounded p-3 text-center">
            <ArcReactor state={jarvisState} />
            <div className="mt-4">
              <SoundWave state={jarvisState} speakerVolume={speechConfig.volume} />
            </div>

            {/* INTERCOMUNICADOR / BOTÓN PARA HABLAR CON JARVIS */}
            <div className="mt-4 pt-3 border-t border-hud-cyan/10">
              <button
                id="voice-intercom-btn"
                onClick={() => {
                  triggerSound("click");
                  setIsHandsFree(!isHandsFree);
                  const currentPersName = PERSONALITIES[speechConfig.personality]?.name || "J.A.R.V.I.S.";
                  if (!isHandsFree) {
                    addLog(`Iniciando conexión con canal acústico de ${currentPersName}...`, "info");
                  } else {
                    addLog(`Desconectando intercomunicador de la armadura.`, "warning");
                  }
                }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded border-2 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isHandsFree
                    ? "bg-hud-orange/15 border-hud-orange text-hud-orange shadow-[0_0_15px_rgba(255,153,0,0.3)] hover:bg-hud-orange/25 animate-pulse"
                    : "bg-hud-cyan/5 border-hud-cyan/30 text-hud-cyan hover:bg-hud-cyan/15 hover:border-hud-cyan shadow-[0_0_8px_rgba(0,240,255,0.05)]"
                }`}
                title={`Iniciar o detener el receptor de voz por micrófono de ${PERSONALITIES[speechConfig.personality]?.name || "J.A.R.V.I.S."}`}
              >
                {isHandsFree ? (
                  <>
                    <Radio className="w-4 h-4 text-hud-orange animate-spin-slow" />
                    <span>INTERCOM DE {PERSONALITIES[speechConfig.personality]?.name || "ASISTENTE"} ACTIVO</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-hud-cyan" />
                    <span>HABLAR CON {PERSONALITIES[speechConfig.personality]?.name || "ASISTENTE"} (VÍA DE VOZ)</span>
                  </>
                )}
              </button>

              <div className="mt-2 text-center space-y-1">
                {isHandsFree ? (
                  <p className="text-[9px] font-mono text-hud-orange/95 leading-tight uppercase animate-pulse">
                    🎤 MICRÓFONO ESCUCHANDO: Di "Escanear" o hazle una pregunta libremente.
                  </p>
                ) : (
                  <p className="text-[9px] font-mono text-gray-500 leading-tight uppercase">
                    Presione arriba para encender el sensor de voz continuo o use ESPACIO.
                  </p>
                )}
                
                <p className="text-[8px] font-mono text-gray-600 uppercase">
                  Nota: En caso de que el navegador restrinja el micrófono, use la pestaña de Chat.
                </p>
              </div>
            </div>
          </div>

          {/* Speech synthesizer params slider controls */}
          <SpeechSynthesizerControls 
            config={speechConfig} 
            onChange={(updated) => setSpeechConfig(updated)}
            onPreview={(testText) => speak(testText)}
            activePersonality={speechConfig.personality}
            onPersonalityChange={handlePersonalityChange}
          />

          {/* Active scan result cards */}
          <div className="hud-panel rounded p-4 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-10">
              <Sparkles className="w-full h-full text-hud-cyan" />
            </div>

            <div className="flex items-center gap-1.5 mb-3 border-b border-hud-cyan/10 pb-2">
              <Zap className="w-4 h-4 text-hud-cyan" />
              <h4 className="text-xs font-mono font-bold text-hud-cyan tracking-wider uppercase">
                Lectura Analítica actual
              </h4>
            </div>

            {activeScan ? (
              <div id="readout-card" className="space-y-4">
                <div className="flex gap-3">
                  {/* Photo Thumbnail */}
                  <div className="w-20 h-20 rounded border border-hud-cyan/20 bg-black overflow-hidden flex-shrink-0 relative">
                    {activeScan.image && activeScan.image.trim() !== "" ? (
                      <img 
                        src={activeScan.image} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-hud-cyan/5 text-hud-cyan/60 font-mono text-[9px] text-center p-1">
                        SCAN OK
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 bg-hud-cyan/80 text-black text-[7px] font-bold px-1 font-mono">
                      CAPT
                    </div>
                  </div>

                  {/* Identified object title */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-mono text-gray-500 uppercase">IDENTIFICADO POR {persMeta.name}:</span>
                    <h5 className="text-base font-bold text-hud-cyan tracking-wide truncate mb-1">
                      {activeScan.objectName}
                    </h5>
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded">
                      <span>STARK.DB // {activeScan.timestamp}</span>
                    </span>
                  </div>
                </div>

                {/* Threat Assessment Panel */}
                {activeScan.success && (
                  <div className={`p-2.5 rounded border ${
                    activeScan.threatLevel === "Alto" 
                      ? "bg-red-500/10 border-red-500/30 text-red-400" 
                      : activeScan.threatLevel === "Medio"
                      ? "bg-amber-500/10 border-amber-500/35 text-amber-500"
                      : activeScan.threatLevel === "Bajo"
                      ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-400"
                      : "bg-green-500/5 border-green-500/20 text-green-400"
                  } font-mono text-[11px] space-y-1`}>
                    <div className="flex items-center justify-between font-bold text-xs tracking-wider uppercase">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className={`w-3.5 h-3.5 ${activeScan.threatLevel === 'Alto' ? 'animate-bounce' : ''}`} />
                        EVALUACIÓN DE AMENAZA:
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        activeScan.threatLevel === "Alto" 
                          ? "bg-red-500 text-white animate-pulse" 
                          : activeScan.threatLevel === "Medio"
                          ? "bg-amber-500 text-black"
                          : activeScan.threatLevel === "Bajo"
                          ? "bg-yellow-400 text-black"
                          : "bg-green-500 text-white"
                      }`}>
                        {activeScan.threatLevel || "Ninguno"}
                      </span>
                    </div>
                    <p className="opacity-90 leading-relaxed text-[11px]">
                      {activeScan.threatDetail || "Entorno o dispositivo seguro sin incidencias de riesgo."}
                    </p>
                  </div>
                )}

                {/* Response speech transcription text */}
                <div className="bg-black/40 border border-hud-cyan/10 p-3 rounded text-xs font-mono leading-relaxed max-h-[140px] overflow-y-auto hud-scrollbar select-text selection:bg-hud-cyan/30 text-gray-300">
                  <p className="whitespace-pre-line text-xs font-mono text-hud-orange/95">
                    {activeScan.fullResponse}
                  </p>
                </div>

                {/* Extracted external link section */}
                {activeScan.link ? (
                  <div className="pt-1.5 space-y-2">
                    <button
                      onClick={() => openDetectedWebsite(activeScan.link, activeScan.objectName)}
                      className="w-full flex items-center justify-between bg-hud-cyan text-black hover:bg-hud-cyan/85 font-mono text-xs font-bold px-4 py-2.5 rounded shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all group cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="w-4 h-4 animate-spin-slow" />
                        <span>🚀 IR AL SITIO WEB DETECTADO</span>
                      </span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => {
                        setWebModalUrl(activeScan.link);
                        setWebModalTitle(activeScan.objectName);
                        setIsWebModalOpen(true);
                        triggerSound("click");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 bg-black/40 hover:bg-black/70 border border-hud-cyan/30 hover:border-hud-cyan text-hud-cyan text-[10px] font-mono py-1.5 rounded transition-all uppercase cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Ver en Navegador Holográfico HUD</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-2 border border-dashed border-hud-cyan/10 rounded text-[10px] font-mono text-gray-400 uppercase">
                    Ningún enlace de dominio detectado en los resultados
                  </div>
                )}

                {/* Vocal playback controls on card */}
                {activeScan.success && (
                  <button
                    onClick={() => speak(activeScan.fullResponse)}
                    className="w-full flex items-center justify-center gap-1.5 bg-black/40 border border-hud-cyan/20 hover:border-hud-cyan/50 text-gray-300 text-[10px] font-mono py-1.5 rounded transition-all uppercase cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-hud-cyan animate-pulse" />
                    Re-reproducir respuesta de {persMeta.name}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-10 px-4 animate-pulse">
                <p className="text-xs font-mono text-gray-500 uppercase leading-relaxed max-w-xs mx-auto">
                  Enfoque la cámara al dispositivo u objeto y presione "Escanear Objetivo" para que {persMeta.name} lo identifique.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- PANEL SECTOR: HISTORICAL DETECT TAPES --- */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-12 relative z-10">
        <div className="hud-panel rounded p-4">
          
          <div className="flex items-center justify-between border-b border-hud-cyan/15 pb-2 mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-hud-orange animate-pulse" />
              <h4 className="text-xs font-mono font-bold text-hud-orange tracking-widest uppercase">
                Historial de Capturas de la Armadura // MEMORIA DIGITAL
              </h4>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              {history.length} {history.length === 1 ? 'registro guardado' : 'registros guardado'}
            </span>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-hud-border/10 rounded bg-black/20">
              <p className="text-xs font-mono text-gray-500 uppercase">
                La base de datos cognitiva de la memoria visual de la IA está vacía.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleLoadItem(item)}
                  className={`bg-black/40 border rounded p-2 overflow-hidden hover:bg-black/60 cursor-pointer group transition-all duration-200 ${
                    activeScan?.id === item.id 
                      ? "border-hud-cyan shadow-[0_0_12px_rgba(0,240,255,0.15)] bg-hud-cyan/5" 
                      : "border-hud-border/10 hover:border-hud-cyan/30"
                  }`}
                >
                  {/* Photo container */}
                  <div className="relative aspect-square rounded border border-hud-border/10 overflow-hidden mb-2 bg-black/40">
                    {item.image && item.image.trim() !== "" ? (
                      <img 
                        src={item.image} 
                        alt={item.objectName} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-hud-cyan/40 font-mono text-[9px]">
                        STARK
                      </div>
                    )}
                    <div className="absolute top-1 left-1 font-mono text-[8px] bg-black/60 text-hud-cyan px-1.5 rounded border border-hud-cyan/10">
                      {item.timestamp}
                    </div>
                    {item.threatLevel && item.threatLevel !== "Ninguno" && (
                      <div className={`absolute top-1 right-1 font-mono text-[7px] font-bold px-1.5 rounded uppercase border ${
                        item.threatLevel === "Alto" 
                          ? "bg-red-500/95 text-white border-red-400 animate-pulse" 
                          : item.threatLevel === "Medio"
                          ? "bg-amber-500/95 text-black border-amber-400"
                          : "bg-yellow-400/95 text-black border-yellow-300"
                      }`}>
                        {item.threatLevel}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h6 className="text-[11px] font-mono font-bold text-hud-cyan tracking-wide truncate">
                    {item.objectName}
                  </h6>

                  {/* Hover indicator link */}
                  <div className="flex items-center justify-between text-[8px] font-mono text-gray-500 mt-1 uppercase">
                    <span>Recuperar</span>
                    <span className="text-hud-cyan group-hover:underline">CARGAR</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Holographic HUD Web Viewer Modal */}
      <HolographicWebModal
        isOpen={isWebModalOpen}
        onClose={() => setIsWebModalOpen(false)}
        url={webModalUrl}
        objectName={webModalTitle}
        personalityId={speechConfig.personality}
        triggerSound={triggerSound}
        onSpeak={speak}
      />

      {/* Emergency Priority Communications Window with Full Voice Interaction */}
      <EmergencyCommsModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        personalityId={speechConfig.personality}
        personalityName={persMeta.name}
        threatContext={activeScan?.threatDetail || (activeScan?.threatLevel && activeScan.threatLevel !== "Ninguno" ? `Amenaza detectada: ${activeScan.threatLevel}` : undefined)}
        triggerSound={triggerSound}
        speak={speak}
        stopSpeaking={cancelActiveSystems}
        addLog={addLog}
        onLockdownPerimeter={() => {
          addLog("🛡️ Protocolo de bloqueo perimetral Stark ejecutado.", "error");
        }}
      />

      {/* Pilot Identity & Age Registration Modal */}
      <PilotRegistrationModal
        isOpen={isPilotModalOpen}
        currentProfile={userProfile}
        personalityId={speechConfig.personality}
        onSave={handleSaveProfile}
        onClose={() => setIsPilotModalOpen(false)}
        triggerSound={triggerSound}
      />

      {/* Miniature Floating HUD Widget / Picture-in-Picture Mode */}
      <MiniJarvisWidget
        isOpen={isMiniWidgetOpen}
        onClose={() => setIsMiniWidgetOpen(false)}
        onMaximize={() => {
          setIsMiniWidgetOpen(false);
          setActiveMainTab("visor");
          triggerSound("startup");
        }}
        jarvisState={jarvisState}
        personalityId={speechConfig.personality}
        personalityName={persMeta.name}
        userProfile={userProfile}
        stream={stream}
        isSimulatedCamera={isSimulatedCamera}
        simulatedTarget={simulatedTarget}
        opticalFilter={opticalFilter}
        drawSimulatedScene={drawSimulatedScene}
        uploadedImageRef={uploadedImageRef}
        getFilterCSS={getFilterCSS}
        isHandsFree={isHandsFree}
        onToggleHandsFree={() => setIsHandsFree(!isHandsFree)}
        onTriggerScan={() => handleCapture(true)}
        onAskQuestion={(query) => {
          if (sendMessageRef.current) {
            sendMessageRef.current(query);
          } else {
            setActiveMainTab("chat");
            setTimeout(() => {
              sendMessageRef.current?.(query);
            }, 300);
          }
        }}
        lastSpokenText={lastSpokenText}
        triggerSound={triggerSound}
        onOpenEmergency={() => {
          triggerSound("alarm");
          setIsEmergencyModalOpen(true);
        }}
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
      />

      {/* Multiplatform Download & Installation Modal (Cellphones & Computers) */}
      <DownloadJarvisModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        personalityId={speechConfig.personality}
        personalityName={persMeta.name}
        isInstalled={isInstalledPWA}
        hasDeferredPrompt={!!deferredInstallPrompt}
        onTriggerInstall={handleTriggerInstall}
        triggerSound={triggerSound}
        speak={speak}
      />

      {/* Hidden processing core canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
