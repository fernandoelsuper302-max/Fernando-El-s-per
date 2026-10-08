import React, { useState, useEffect } from "react";
import { 
  X, 
  Download, 
  Smartphone, 
  Monitor, 
  Laptop, 
  Share2, 
  CheckCircle2, 
  Copy, 
  QrCode, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Terminal, 
  HardDrive,
  Cpu,
  ArrowRight,
  Tv
} from "lucide-react";
import { playSciFiSound } from "../utils/audioEffects";

interface DownloadJarvisModalProps {
  isOpen: boolean;
  onClose: () => void;
  personalityName?: string;
  deferredInstallPrompt: any;
  onTriggerInstall: () => Promise<boolean>;
  isInstalledPWA: boolean;
}

export const DownloadJarvisModal: React.FC<DownloadJarvisModalProps> = ({
  isOpen,
  onClose,
  personalityName = "J.A.R.V.I.S.",
  deferredInstallPrompt,
  onTriggerInstall,
  isInstalledPWA
}) => {
  const [activeTab, setActiveTab] = useState<"auto" | "mobile" | "desktop" | "qr" | "launcher">("auto");
  const [detectedPlatform, setDetectedPlatform] = useState<string>("Detectando...");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isWindows, setIsWindows] = useState<boolean>(false);
  const [isMac, setIsMac] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [appUrl, setAppUrl] = useState<string>("");

  // Platform detection logic
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAppUrl(window.location.href);
      const ua = navigator.userAgent || "";
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isApple = /iPhone|iPad|iPod/i.test(ua);
      const isDroid = /Android/i.test(ua);
      const isWin = /Windows/i.test(ua);
      const isAppleMac = /Macintosh|Mac OS X/i.test(ua) && !isApple;

      setIsMobile(isMobileDevice);
      setIsIOS(isApple);
      setIsAndroid(isDroid);
      setIsWindows(isWin);
      setIsMac(isAppleMac);

      if (isDroid) {
        setDetectedPlatform("Android (Celular/Tablet)");
        setActiveTab("mobile");
      } else if (isApple) {
        setDetectedPlatform("iOS (iPhone/iPad)");
        setActiveTab("mobile");
      } else if (isWin) {
        setDetectedPlatform("Windows PC / Laptop");
        setActiveTab("desktop");
      } else if (isAppleMac) {
        setDetectedPlatform("Apple macOS");
        setActiveTab("desktop");
      } else if (/Linux/i.test(ua)) {
        setDetectedPlatform("Linux OS");
        setActiveTab("desktop");
      } else {
        setDetectedPlatform("Navegador Web Multiplataforma");
        setActiveTab("auto");
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      playSciFiSound("click");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeInstall = async () => {
    setIsInstalling(true);
    playSciFiSound("startup");
    try {
      const success = await onTriggerInstall();
      if (success) {
        playSciFiSound("success");
      }
    } catch (e) {
      console.warn("Install prompt failed or dismissed:", e);
    } finally {
      setIsInstalling(false);
    }
  };

  // Generate downloadable Windows .BAT Launcher
  const handleDownloadWindowsLauncher = () => {
    playSciFiSound("click");
    const currentUrl = window.location.href;
    const batContent = `@echo off
title Iniciando J.A.R.V.I.S. Stark OS
echo ========================================================
echo       SISTEMAS TACTICOS STARK INDUSTRIES
echo       Iniciando J.A.R.V.I.S. en Modo Aplicacion Nativa
echo ========================================================
echo.

:: Intentar abrir con Google Chrome en modo app dedicada
start chrome.exe --app="${currentUrl}" --window-size=1280,820 --start-maximized 2>nul
if %errorlevel% equ 0 goto final

:: Si Chrome no esta, intentar abrir con Microsoft Edge en modo app
start msedge.exe --app="${currentUrl}" --window-size=1280,820 --start-maximized 2>nul
if %errorlevel% equ 0 goto final

:: Fallback navegador predeterminado
start "" "${currentUrl}"

:final
echo J.A.R.V.I.S. desplegado correctamente.
timeout /t 2 >nul
exit
`;
    const blob = new Blob([batContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Lanzador_JARVIS_Stark_OS.bat";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    playSciFiSound("success");
  };

  // Generate downloadable Desktop Shortcut (.URL)
  const handleDownloadDesktopUrl = () => {
    playSciFiSound("click");
    const currentUrl = window.location.href;
    const urlContent = `[InternetShortcut]
URL=${currentUrl}
IconIndex=0
IconFile=https://raw.githubusercontent.com/google/material-design-icons/master/png/action/visibility/materialicons/48dp/2x/baseline_visibility_black_48dp.png
`;
    const blob = new Blob([urlContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "JARVIS_Stark_OS.url";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    playSciFiSound("success");
  };

  // Encoded dynamic QR Code generator image URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(appUrl || (typeof window !== "undefined" ? window.location.href : ""))}&bgcolor=030712&color=00f0ff&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Container with Stark Industrial Cybernetic Borders */}
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-gray-950 border-2 border-hud-cyan/60 rounded-xl shadow-[0_0_40px_rgba(0,240,255,0.25)] overflow-hidden text-gray-200">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-hud-cyan/20 via-black to-hud-cyan/10 border-b border-hud-cyan/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-hud-cyan/20 border border-hud-cyan/60 flex items-center justify-center text-hud-cyan shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              <Download className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-mono text-hud-cyan tracking-wider">
                  CENTRO DE DESCARGA & INSTALACIÓN
                </h2>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-hud-cyan/20 text-hud-cyan border border-hud-cyan/50 font-bold hidden sm:inline-block">
                  MULTIPLATAFORMA
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Instalar {personalityName} en Celulares (Android / iPhone) y Computadoras (PC / Mac)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSciFiSound("click");
              onClose();
            }}
            className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-900/60 hover:text-white transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Device Detection Status Badge */}
        <div className="px-4 sm:px-6 py-2 bg-black/60 border-b border-hud-cyan/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-gray-400">Dispositivo detectado:</span>
            <span className="text-hud-cyan font-bold bg-hud-cyan/10 px-2 py-0.5 rounded border border-hud-cyan/30">
              {detectedPlatform}
            </span>
          </div>

          {isInstalledPWA && (
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>J.A.R.V.I.S. ya instalado como Aplicación</span>
            </div>
          )}
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex border-b border-hud-cyan/20 bg-black/40 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              playSciFiSound("click");
              setActiveTab("mobile");
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-mono whitespace-nowrap border-b-2 transition-all ${
              activeTab === "mobile"
                ? "border-hud-cyan text-hud-cyan bg-hud-cyan/10 font-bold"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-hud-cyan/5"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>📱 Celulares (Android / iOS)</span>
          </button>

          <button
            onClick={() => {
              playSciFiSound("click");
              setActiveTab("desktop");
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-mono whitespace-nowrap border-b-2 transition-all ${
              activeTab === "desktop"
                ? "border-hud-cyan text-hud-cyan bg-hud-cyan/10 font-bold"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-hud-cyan/5"
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>💻 Computadora (Windows / Mac / PC)</span>
          </button>

          <button
            onClick={() => {
              playSciFiSound("click");
              setActiveTab("qr");
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-mono whitespace-nowrap border-b-2 transition-all ${
              activeTab === "qr"
                ? "border-hud-cyan text-hud-cyan bg-hud-cyan/10 font-bold"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-hud-cyan/5"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>📲 Escanear QR con Celular</span>
          </button>

          <button
            onClick={() => {
              playSciFiSound("click");
              setActiveTab("launcher");
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-mono whitespace-nowrap border-b-2 transition-all ${
              activeTab === "launcher"
                ? "border-hud-cyan text-hud-cyan bg-hud-cyan/10 font-bold"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-hud-cyan/5"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>⚡ Lanzadores & Accesos Directos</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Quick Direct 1-Click Install Banner if browser supports beforeinstallprompt */}
          {deferredInstallPrompt && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-hud-cyan/20 via-black to-hud-cyan/10 border-2 border-hud-cyan shadow-[0_0_20px_rgba(0,240,255,0.3)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-hud-cyan/20 border border-hud-cyan flex items-center justify-center text-hud-cyan shrink-0">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold font-mono text-white flex items-center gap-2">
                    <span>⚡ INSTALACIÓN NATIVA 1-CLIC DISPONIBLE</span>
                  </h4>
                  <p className="text-xs text-gray-300 font-mono mt-0.5">
                    Tu navegador permite instalar J.A.R.V.I.S. directamente en tu dispositivo como aplicación nativa independiente.
                  </p>
                </div>
              </div>

              <button
                onClick={handleNativeInstall}
                disabled={isInstalling}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-hud-cyan hover:bg-hud-cyan-hover text-black font-mono font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(0,240,255,0.6)] flex items-center justify-center gap-2 transition-all transform active:scale-95 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{isInstalling ? "INSTALANDO..." : "INSTALAR AHORA EN 1 CLIC"}</span>
              </button>
            </div>
          )}

          {/* TAB 1: CELULARES (ANDROID & IPHONE) */}
          {activeTab === "mobile" && (
            <div className="space-y-6">
              
              {/* Android Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-black/60 border border-emerald-500/40 hover:border-emerald-400 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-white text-sm sm:text-base flex items-center gap-2">
                        <span>Android (Chrome, Edge, Samsung Internet, Brave)</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                          PWA / APK
                        </span>
                      </h3>
                      <p className="text-xs text-gray-400 font-mono">
                        Instalar en teléfonos Samsung, Xiaomi, Motorola, Google Pixel, Huawei, etc.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                  <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 text-xs font-mono">
                    <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 text-center leading-4 text-[10px]">1</span>
                      Abre el Menú ⋮
                    </div>
                    <p className="text-gray-300 text-[11px]">
                      En tu navegador móvil (Chrome o Edge), toca los tres puntos <strong>(⋮)</strong> en la esquina superior derecha.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 text-xs font-mono">
                    <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 text-center leading-4 text-[10px]">2</span>
                      Instalar Aplicación
                    </div>
                    <p className="text-gray-300 text-[11px]">
                      Selecciona la opción <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla de inicio"</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 text-xs font-mono">
                    <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 text-center leading-4 text-[10px]">3</span>
                      ¡Acceso Directo!
                    </div>
                    <p className="text-gray-300 text-[11px]">
                      J.A.R.V.I.S. aparecerá en tu menú de apps y escritorio con el icono del Reactor Arc y pantalla completa.
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 items-center justify-between pt-2 border-t border-gray-800 text-xs font-mono">
                  <span className="text-gray-400">Ventajas en Android: Micrófono continuo, cámara HUD y respuesta táctica.</span>
                  {deferredInstallPrompt && (
                    <button
                      onClick={handleNativeInstall}
                      className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Instalar en este Android</span>
                    </button>
                  )}
                </div>
              </div>

              {/* iPhone / iPad (iOS Safari) Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-black/60 border border-hud-cyan/40 hover:border-hud-cyan transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded bg-hud-cyan/20 text-hud-cyan border border-hud-cyan/40">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-white text-sm sm:text-base flex items-center gap-2">
                        <span>iPhone & iPad (Apple iOS Safari)</span>
                        <span className="text-[10px] bg-hud-cyan/20 text-hud-cyan px-2 py-0.5 rounded border border-hud-cyan/40">
                          iOS WebApp
                        </span>
                      </h3>
                      <p className="text-xs text-gray-400 font-mono">
                        Instalación nativa a pantalla completa para cualquier iPhone o iPad
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                  <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 text-xs font-mono">
                    <div className="font-bold text-hud-cyan mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-hud-cyan/20 border border-hud-cyan text-center leading-4 text-[10px]">1</span>
                      Abrir en Safari
                    </div>
                    <p className="text-gray-300 text-[11px]">
                      Abre el enlace de la aplicación en el navegador <strong>Safari</strong> de tu iPhone o iPad.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 text-xs font-mono">
                    <div className="font-bold text-hud-cyan mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-hud-cyan/20 border border-hud-cyan text-center leading-4 text-[10px]">2</span>
                      Botón Compartir (⎋)
                    </div>
                    <p className="text-gray-300 text-[11px]">
                      Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba en la barra inferior).
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 text-xs font-mono">
                    <div className="font-bold text-hud-cyan mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-hud-cyan/20 border border-hud-cyan text-center leading-4 text-[10px]">3</span>
                      Añadir a Pantalla de Inicio
                    </div>
                    <p className="text-gray-300 text-[11px]">
                      Desliza hacia abajo, selecciona <strong>"Añadir a pantalla de inicio" (+)</strong> y pulsa <strong>"Añadir"</strong>.
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-800 text-xs font-mono text-gray-400">
                  <span>Icono Apple Touch de Stark Industries optimizado para pantallas Retina OLED.</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: COMPUTADORAS (WINDOWS / MAC / LINUX) */}
          {activeTab === "desktop" && (
            <div className="space-y-6">
              
              {/* Windows & Mac Native Desktop PWA Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-black/60 border border-hud-cyan/40 hover:border-hud-cyan transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded bg-hud-cyan/20 text-hud-cyan border border-hud-cyan/40">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-white text-sm sm:text-base flex items-center gap-2">
                        <span>Instalación en Computadora (Windows / Mac / Linux)</span>
                        <span className="text-[10px] bg-hud-cyan/20 text-hud-cyan px-2 py-0.5 rounded border border-hud-cyan/40">
                          Aplicación de Escritorio
                        </span>
                      </h3>
                      <p className="text-xs text-gray-400 font-mono">
                        Ejecutar en ventana independiente, anclar a la Barra de Tareas de Windows o Dock de macOS.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                  <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 text-xs font-mono">
                    <div className="font-bold text-hud-cyan mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-hud-cyan/20 border border-hud-cyan text-center leading-4 text-[10px]">A</span>
                      Icono en la Barra URL
                    </div>
                    <p className="text-gray-300 text-[11px]">
                      En Chrome, Edge o Brave, mira la barra de direcciones arriba y haz clic en el icono <strong>🖥️ Instalar</strong> o <strong>⊕</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 text-xs font-mono">
                    <div className="font-bold text-hud-cyan mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-hud-cyan/20 border border-hud-cyan text-center leading-4 text-[10px]">B</span>
                      Menú del Navegador
                    </div>
                    <p className="text-gray-300 text-[11px]">
                      O haz clic en menú ⋮ &gt; <strong>"Guardar y compartir"</strong> &gt; <strong>"Instalar J.A.R.V.I.S."</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 text-xs font-mono">
                    <div className="font-bold text-hud-cyan mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-hud-cyan/20 border border-hud-cyan text-center leading-4 text-[10px]">C</span>
                      Ventana Autónoma
                    </div>
                    <p className="text-gray-300 text-[11px]">
                      Se abrirá sin marcos de navegador y podrás arrastrar la miniatura flotante fuera de Google a tu pantalla.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 items-center justify-between pt-3 border-t border-gray-800">
                  <span className="text-xs text-gray-400 font-mono">Descarga de ejecutables y accesos directos:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleDownloadWindowsLauncher}
                      className="px-3.5 py-2 rounded-lg bg-hud-cyan/15 hover:bg-hud-cyan/30 text-hud-cyan border border-hud-cyan/60 font-mono font-bold text-xs flex items-center gap-2 transition-colors"
                    >
                      <Terminal className="w-4 h-4" />
                      <span>Descargar Lanzador Windows (.BAT)</span>
                    </button>
                    <button
                      onClick={handleDownloadDesktopUrl}
                      className="px-3.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 font-mono font-bold text-xs flex items-center gap-2 transition-colors"
                    >
                      <HardDrive className="w-4 h-4" />
                      <span>Descargar Acceso Directo (.URL)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Multi-Window & Mini Widget Feature highlight */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-black to-purple-950/40 border border-hud-cyan/30 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-hud-cyan/10 text-hud-cyan border border-hud-cyan/30 shrink-0">
                  <Tv className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-mono font-bold text-white text-sm">
                    Modo Miniatura Flotante (Siempre al Frente en tu Escritorio)
                  </h4>
                  <p className="text-xs text-gray-300 font-mono mt-0.5">
                    Al instalar en PC, puedes usar la opción <strong>"SALIR DE GOOGLE"</strong> para mantener a J.A.R.V.I.S. flotando en una esquina de tu monitor mientras juegas o trabajas en otras aplicaciones.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: QR CODE GENERATOR FOR PHONE */}
          {activeTab === "qr" && (
            <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-black/60 rounded-xl border border-hud-cyan/40 text-center space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-mono font-bold text-hud-cyan text-base sm:text-lg flex items-center justify-center gap-2">
                  <QrCode className="w-5 h-5" />
                  <span>ESCANEA CON LA CÁMARA DE TU CELULAR</span>
                </h3>
                <p className="text-xs text-gray-400 font-mono max-w-md mx-auto">
                  Apunta la cámara de tu teléfono Android o iPhone a este código QR para abrir e instalar J.A.R.V.I.S. en segundos.
                </p>
              </div>

              {/* Holographic QR Frame */}
              <div className="relative p-4 rounded-2xl bg-black border-2 border-hud-cyan shadow-[0_0_30px_rgba(0,240,255,0.4)]">
                <img
                  src={qrCodeUrl}
                  alt="Código QR de Instalación J.A.R.V.I.S."
                  className="w-56 h-56 rounded-lg object-contain bg-black"
                />
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-hud-cyan" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-hud-cyan" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-hud-cyan" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-hud-cyan" />
              </div>

              {/* Direct Copy Link Tool */}
              <div className="w-full max-w-lg flex items-center gap-2 p-2 rounded-lg bg-gray-900 border border-gray-700">
                <input
                  type="text"
                  readOnly
                  value={appUrl || (typeof window !== "undefined" ? window.location.href : "")}
                  className="flex-1 bg-transparent px-2 text-xs font-mono text-hud-cyan focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded bg-hud-cyan hover:bg-hud-cyan-hover text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      <span>¡COPIADO!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPIAR ENLACE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: LAUNCHERS & DESKTOP FILES */}
          {activeTab === "launcher" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/60 border border-hud-cyan/40">
                <h3 className="font-mono font-bold text-white text-sm sm:text-base flex items-center gap-2 mb-2">
                  <Terminal className="w-5 h-5 text-hud-cyan" />
                  <span>Lanzadores de Escritorio & Scripts Autónomos</span>
                </h3>
                <p className="text-xs text-gray-300 font-mono mb-4">
                  Descarga un archivo ejecutable directo en tu PC para abrir J.A.R.V.I.S. con 1 solo clic desde tu Escritorio sin tener que recordar la dirección web.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-gray-900/90 border border-hud-cyan/30 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-hud-cyan text-sm">Lanzador Windows .BAT</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-hud-cyan/20 text-hud-cyan">Windows 10/11</span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        Inicia J.A.R.V.I.S. en modo aplicación nativa sin barras de Chrome/Edge maximizado.
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadWindowsLauncher}
                      className="w-full py-2 px-3 rounded-lg bg-hud-cyan hover:bg-hud-cyan-hover text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                    >
                      <Download className="w-4 h-4" />
                      <span>DESCARGAR .BAT</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-900/90 border border-gray-700 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-gray-200 text-sm">Acceso Directo .URL</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">Universal</span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        Archivo de acceso directo estándar para colocar en tu Escritorio o carpeta personal.
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadDesktopUrl}
                      className="w-full py-2 px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 font-mono font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>DESCARGAR .URL</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer Bar */}
        <div className="px-4 sm:px-6 py-3 bg-black/90 border-t border-hud-cyan/30 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-gray-400">
            <ShieldCheck className="w-4 h-4 text-hud-cyan" />
            <span className="hidden sm:inline">Arquitectura PWA Segura y Certificada por Stark Industries</span>
            <span className="sm:hidden">PWA Segura</span>
          </div>

          <button
            onClick={() => {
              playSciFiSound("click");
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 font-bold"
          >
            ENTENDIDO
          </button>
        </div>

      </div>
    </div>
  );
};

export default DownloadJarvisModal;
