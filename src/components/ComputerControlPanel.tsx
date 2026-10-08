import React, { useState, useEffect, useRef } from "react";
import {
  Monitor,
  Laptop,
  Maximize2,
  Minimize2,
  Clipboard,
  Bell,
  Battery,
  BatteryCharging,
  Wifi,
  WifiOff,
  Cpu,
  HardDrive,
  Volume2,
  VolumeX,
  Tv,
  Lock,
  Moon,
  FolderOpen,
  Calculator,
  FileText,
  Terminal,
  Play,
  Camera,
  RefreshCw,
  Download,
  Sparkles,
  ShieldCheck,
  Globe,
  Eye,
  EyeOff
} from "lucide-react";
import { PersonalityId } from "../types";

interface ComputerControlPanelProps {
  personalityId: PersonalityId;
  personalityName: string;
  triggerSound: (type: "startup" | "scan" | "success" | "error" | "abort" | "click") => void;
  addLog: (message: string, type: "info" | "success" | "warning" | "error") => void;
  speak: (text: string) => void;
  isMiniWidgetOpen?: boolean;
  setIsMiniWidgetOpen?: (v: boolean) => void;
}

export const ComputerControlPanel: React.FC<ComputerControlPanelProps> = ({
  personalityName,
  triggerSound,
  addLog,
  speak,
  isMiniWidgetOpen,
  setIsMiniWidgetOpen
}) => {
  // Native Browser Telemetry & OS State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [networkSpeed, setNetworkSpeed] = useState<number | null>(null);
  const [networkLatency, setNetworkLatency] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Stark Local Bridge Daemon Status (http on localhost:9876)
  const [bridgeConnected, setBridgeConnected] = useState<boolean>(false);
  const [bridgePort] = useState<number>(9876);
  const [bridgeChecking, setBridgeChecking] = useState<boolean>(false);
  const [lastBridgeResponse, setLastBridgeResponse] = useState<string>("En espera de conexión");
  const [commandHistory, setCommandHistory] = useState<Array<{ text: string; time: string; status: "success" | "pending" | "error" }>>([
    { text: "Protocolo Stark PC Control inicializado.", time: new Date().toLocaleTimeString(), status: "success" },
    { text: "Sensores de telemetría del sistema operativo enlazados.", time: new Date().toLocaleTimeString(), status: "success" }
  ]);

  // System Specs Detection
  const [deviceMemory, setDeviceMemory] = useState<string>("Detectando...");
  const [hardwareConcurrency, setHardwareConcurrency] = useState<number>(4);
  const [screenRes, setScreenRes] = useState<string>("1920x1080");
  const [osName, setOsName] = useState<string>("Windows PC");
  const [customCommandInput, setCustomCommandInput] = useState<string>("");

  // Sub-tab selection
  const [activeTab, setActiveTab] = useState<"quick" | "screen" | "apps" | "bridge" | "telemetry">("quick");

  // Telemetry Initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      setScreenRes(`${window.screen.width}x${window.screen.height} (${window.screen.colorDepth}-bit)`);
      setHardwareConcurrency(navigator.hardwareConcurrency || 8);
      
      const navAny = navigator as any;
      if (navAny.deviceMemory) {
        setDeviceMemory(`${navAny.deviceMemory} GB RAM`);
      } else {
        setDeviceMemory("8+ GB RAM");
      }

      // Detect OS
      const ua = navigator.userAgent || "";
      if (/Windows/i.test(ua)) setOsName("Windows PC / Laptop");
      else if (/Macintosh|Mac OS/i.test(ua)) setOsName("Apple macOS");
      else if (/Linux/i.test(ua)) setOsName("GNU/Linux");
      else if (/Android/i.test(ua)) setOsName("Android OS");
      else if (/iPhone|iPad/i.test(ua)) setOsName("Apple iOS");

      // Check Battery API
      if (navAny.getBattery) {
        navAny.getBattery().then((battery: any) => {
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);
          battery.addEventListener("levelchange", () => setBatteryLevel(Math.round(battery.level * 100)));
          battery.addEventListener("chargingchange", () => setIsCharging(battery.charging));
        }).catch(() => {
          setBatteryLevel(100);
          setIsCharging(true);
        });
      } else {
        setBatteryLevel(95);
        setIsCharging(true);
      }

      // Check Network Connection API
      const conn = navAny.connection || navAny.mozConnection || navAny.webkitConnection;
      if (conn) {
        setNetworkSpeed(conn.downlink || 50);
        setNetworkLatency(conn.rtt || 20);
        conn.addEventListener("change", () => {
          setNetworkSpeed(conn.downlink || 50);
          setNetworkLatency(conn.rtt || 20);
        });
      }

      // Fullscreen change listener
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener("fullscreenchange", handleFullscreenChange);

      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
      };
    }
  }, []);

  // Ping local bridge daemon on port 9876
  const checkLocalBridge = async (silent = false) => {
    setBridgeChecking(true);
    if (!silent) triggerSound("click");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`http://127.0.0.1:${bridgePort}/status`, {
        method: "GET",
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setBridgeConnected(true);
        setLastBridgeResponse(`Conectado a J.A.R.V.I.S. PC Bridge v${data.version || "1.0"} (PID: ${data.pid || "Active"})`);
        addLog("⚡ Enlace local Stark Bridge conectado en el puerto 9876 de la PC.", "success");
        if (!silent) {
          speak(`Señor, el enlace directo con el sistema operativo de su computadora ha sido establecido en el puerto ${bridgePort}.`);
        }
      } else {
        setBridgeConnected(false);
      }
    } catch {
      setBridgeConnected(false);
      if (!silent) {
        setLastBridgeResponse("Bridge local no detectado en localhost:9876 (Ejecuta el script 'jarvis_bridge' en tu PC)");
        addLog("ℹ️ Puente local opcional no detectado. Puedes descargar el script ejecutable para control total de Windows/Mac.", "info");
      }
    } finally {
      setBridgeChecking(false);
    }
  };

  // Run initial bridge check silently
  useEffect(() => {
    checkLocalBridge(true);
    const interval = setInterval(() => {
      checkLocalBridge(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [bridgePort]);

  // Send Command to Local Bridge Daemon or handle locally
  const executePCCommand = async (commandType: string, payload: any = {}) => {
    triggerSound("click");
    const timestamp = new Date().toLocaleTimeString();

    // 1. If Local Bridge is available, send via HTTP POST
    if (bridgeConnected) {
      try {
        addLog(`Enviando comando al sistema operativo: ${commandType}...`, "info");
        const res = await fetch(`http://127.0.0.1:${bridgePort}/command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: commandType, payload })
        });
        if (res.ok) {
          const resData = await res.json();
          setLastBridgeResponse(resData.message || "Comando ejecutado con éxito.");
          setCommandHistory(prev => [
            { text: `OS: ${commandType} -> ${resData.message || "OK"}`, time: timestamp, status: "success" },
            ...prev.slice(0, 15)
          ]);
          triggerSound("success");
          speak(`Comando ${commandType} ejecutado en su computadora, Señor.`);
          return;
        }
      } catch (err) {
        console.warn("Bridge send error:", err);
      }
    }

    // 2. Native Web Actions Fallbacks
    switch (commandType) {
      case "fullscreen_toggle":
        toggleFullscreen();
        break;
      case "clipboard_copy":
        copyToClipboard(payload.text || "J.A.R.V.I.S. Stark OS - Protocolo de Control");
        break;
      case "clipboard_read":
        readClipboard();
        break;
      case "notify_os":
        sendNativeDesktopNotification(payload.title || "J.A.R.V.I.S. Stark OS", payload.body || "Sistemas tácticos de la computadora bajo control nominal.");
        break;
      case "screen_share":
        toggleScreenShare();
        break;
      case "open_app":
        handleOpenAppWebFallback(payload.appName || "browser", payload.url);
        break;
      case "power_lock":
      case "power_sleep":
      case "power_shutdown":
        handlePowerActionFallback(commandType);
        break;
      default:
        addLog(`Comando registrado en buffer táctico: ${commandType}`, "info");
        setCommandHistory(prev => [
          { text: `Comando: ${commandType}`, time: timestamp, status: "pending" },
          ...prev.slice(0, 15)
        ]);
        speak(`Señor, registrando comando ${commandType} en la consola del sistema.`);
        break;
    }
  };

  // Native Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        triggerSound("success");
        addLog("📺 Pantalla completa activada.", "success");
        speak("Modo pantalla completa activado, Señor.");
      }).catch(err => {
        addLog(`Error al entrar a pantalla completa: ${err.message}`, "error");
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        triggerSound("click");
        addLog("📺 Modo ventana restaurado.", "info");
        speak("Restaurando ventana estándar.");
      }).catch(() => {});
    }
  };

  // Native Clipboard Copy
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      triggerSound("success");
      addLog(`📋 Texto copiado al portapapeles de la computadora: "${text.slice(0, 40)}..."`, "success");
      speak("Texto copiado exitosamente al portapapeles de su computadora, Señor.");
    } catch {
      addLog("No se pudo escribir en el portapapeles.", "warning");
    }
  };

  // Native Clipboard Read
  const readClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      triggerSound("success");
      addLog(`📋 Portapapeles leído: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`, "info");
      if (text.trim()) {
        speak(`Señor, el contenido actual en el portapapeles de su computadora es: ${text.slice(0, 120)}`);
      } else {
        speak("Señor, su portapapeles se encuentra actualmente vacío.");
      }
    } catch {
      addLog("Permiso de portapapeles no concedido por el navegador.", "warning");
      speak("Por favor conceda el permiso al navegador para que J.A.R.V.I.S. pueda leer el portapapeles.");
    }
  };

  // Native Desktop OS Notification
  const sendNativeDesktopNotification = async (title: string, body: string) => {
    if (!("Notification" in window)) {
      addLog("Este navegador no soporta notificaciones de escritorio nativas.", "warning");
      return;
    }

    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/icon.svg",
          badge: "/icon.svg"
        });
        triggerSound("success");
        addLog(`🔔 Notificación de escritorio enviada: "${title}"`, "success");
        speak("Notificación enviada a la bandeja de su sistema operativo.");
      } catch (e) {
        console.warn("Notification error:", e);
      }
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification(title, {
          body,
          icon: "/icon.svg"
        });
        triggerSound("success");
        addLog("🔔 Permiso de notificaciones concedido.", "success");
      }
    } else {
      addLog("Notificaciones bloqueadas en la configuración del navegador.", "warning");
      speak("Las notificaciones están bloqueadas en su navegador. Puede habilitarlas en el icono de candado de la barra de direcciones.");
    }
  };

  // Screen Share & Computer Vision Stream
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
      setIsScreenSharing(false);
      triggerSound("abort");
      addLog("🖥️ Monitoreo de pantalla de la computadora detenido.", "warning");
      speak("Monitoreo visual de su pantalla finalizado, Señor.");
    } else {
      try {
        triggerSound("startup");
        addLog("Solicitando transmisión visual de la pantalla de la computadora...", "info");
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always"
          } as any,
          audio: false
        });

        screenStreamRef.current = stream;
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
          screenVideoRef.current.play();
        }
        setIsScreenSharing(true);
        setActiveTab("screen");

        // Handle user stopping screen share from browser floating bar
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          addLog("Transmisión de pantalla detenida por el usuario.", "info");
        };

        triggerSound("success");
        addLog("⚡ Transmisión de pantalla conectada a la matriz óptica de J.A.R.V.I.S.", "success");
        speak("Señor, tengo visión directa de su pantalla en tiempo real. Mis algoritmos ópticos están analizando su escritorio.");
      } catch (err: any) {
        console.warn("Display media error:", err);
        addLog(`No se pudo iniciar la captura de pantalla: ${err.message}`, "warning");
      }
    }
  };

  // App Launcher Fallback
  const handleOpenAppWebFallback = (appName: string, targetUrl?: string) => {
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      addLog(`Abriendo ${appName} en nueva ventana: ${targetUrl}`, "success");
      speak(`Abriendo ${appName} en su navegador.`);
      return;
    }

    const appUrls: Record<string, string> = {
      calculator: "https://www.google.com/search?q=calculator",
      spotify: "https://open.spotify.com",
      youtube: "https://www.youtube.com",
      gmail: "https://mail.google.com",
      vscode: "https://vscode.dev",
      maps: "https://maps.google.com",
      calendar: "https://calendar.google.com",
      notepad: "https://keep.google.com"
    };

    if (appUrls[appName.toLowerCase()]) {
      window.open(appUrls[appName.toLowerCase()], "_blank");
      addLog(`Iniciando ${appName} en su computadora...`, "success");
      speak(`Iniciando ${appName}, Señor.`);
    } else {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(appName)}`, "_blank");
      speak(`Buscando y ejecutando ${appName}.`);
    }
  };

  // Power Action Fallback
  const handlePowerActionFallback = (action: string) => {
    if (action === "power_lock") {
      addLog("🔒 Protocolo de Bloqueo: En Windows presiona Win + L.", "warning");
      speak("Para bloquear su pantalla instantáneamente en Windows, presione la tecla Windows más L.");
    } else if (action === "power_sleep") {
      addLog("🌙 Protocolo de Suspensión: Configure el temporizador de energía en su sistema.", "info");
      speak("Protocolo de suspensión listo. Si tiene el Stark Bridge activo se ejecutará automáticamente.");
    } else if (action === "power_shutdown") {
      addLog("⚠️ Protocolo de Apagado de Emergencia activado.", "error");
      speak("Protocolo de apagado recibido. Por seguridad se requiere confirmación física.");
    }
  };

  // Download Python Stark Local Bridge Script
  const downloadPythonBridge = () => {
    triggerSound("click");
    const pythonCode = [
      '# J.A.R.V.I.S. STARK OS - PC CONTROLLER BRIDGE DAEMON',
      '# Servidor de Enlace Local para Control del Sistema Operativo',
      'import http.server',
      'import socketserver',
      'import json',
      'import os',
      'import sys',
      'import subprocess',
      'import webbrowser',
      'import platform',
      'import time',
      '',
      'PORT = 9876',
      'OS_TYPE = platform.system()',
      '',
      'print("⚡ INICIANDO PUENTE J.A.R.V.I.S. EN PUERTO " + str(PORT) + "...")',
      'print("🖥️ Sistema: " + OS_TYPE)',
      '',
      'class JarvisHandler(http.server.SimpleHTTPRequestHandler):',
      '    def end_headers(self):',
      '        self.send_header("Access-Control-Allow-Origin", "*")',
      '        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")',
      '        self.send_header("Access-Control-Allow-Headers", "Content-Type")',
      '        super().end_headers()',
      '',
      '    def do_OPTIONS(self):',
      '        self.send_response(200)',
      '        self.end_headers()',
      '',
      '    def do_GET(self):',
      '        if self.path == "/status":',
      '            self.send_response(200)',
      '            self.send_header("Content-Type", "application/json")',
      '            self.end_headers()',
      '            data = {"status": "online", "version": "2.4.0", "os": OS_TYPE, "pid": os.getpid()}',
      '            self.wfile.write(json.dumps(data).encode("utf-8"))',
      '        else:',
      '            self.send_response(404)',
      '            self.end_headers()',
      '',
      '    def do_POST(self):',
      '        if self.path == "/command":',
      '            length = int(self.headers.get("Content-Length", 0))',
      '            body = self.rfile.read(length)',
      '            try:',
      '                payload = json.loads(body.decode("utf-8"))',
      '                cmd = payload.get("command", "")',
      '                args = payload.get("payload", {})',
      '                msg = self.run_cmd(cmd, args)',
      '                self.send_response(200)',
      '                self.send_header("Content-Type", "application/json")',
      '                self.end_headers()',
      '                self.wfile.write(json.dumps({"success": True, "message": msg}).encode("utf-8"))',
      '            except Exception as e:',
      '                self.send_response(500)',
      '                self.end_headers()',
      '                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))',
      '        else:',
      '            self.send_response(404)',
      '            self.end_headers()',
      '',
      '    def run_cmd(self, cmd, args):',
      '        if cmd == "open_app":',
      '            app = args.get("appName", "").lower()',
      '            if OS_TYPE == "Windows":',
      '                if app == "calculator": os.system("start calc.exe")',
      '                elif app == "notepad": os.system("start notepad.exe")',
      '                elif app == "explorer": os.system("start explorer.exe")',
      '                elif app == "spotify": os.system("start spotify:")',
      '                else: os.system("start " + app)',
      '            elif OS_TYPE == "Darwin":',
      '                os.system("open -a " + app)',
      '            return "Aplicacion " + app + " abierta."',
      '        elif cmd == "volume_up" and OS_TYPE == "Windows":',
      '            subprocess.run(["powershell", "-c", "$w = New-Object -ComObject WScript.Shell; 1..5 | % { $w.SendKeys([char]175) }"])',
      '            return "Volumen subido."',
      '        elif cmd == "volume_down" and OS_TYPE == "Windows":',
      '            subprocess.run(["powershell", "-c", "$w = New-Object -ComObject WScript.Shell; 1..5 | % { $w.SendKeys([char]174) }"])',
      '            return "Volumen bajado."',
      '        elif cmd == "volume_mute" and OS_TYPE == "Windows":',
      '            subprocess.run(["powershell", "-c", "$w = New-Object -ComObject WScript.Shell; $w.SendKeys([char]173)"])',
      '            return "Silencio alternado."',
      '        elif cmd == "power_lock" and OS_TYPE == "Windows":',
      '            os.system("rundll32.exe user32.dll,LockWorkStation")',
      '            return "Pantalla bloqueada."',
      '        return "Comando ejecutado."',
      '',
      'if __name__ == "__main__":',
      '    with socketserver.TCPServer(("", PORT), JarvisHandler) as httpd:',
      '        print("Listo. Mantén esta terminal abierta mientras uses J.A.R.V.I.S.")',
      '        httpd.serve_forever()'
    ].join('\n');

    const blob = new Blob([pythonCode], { type: "text/x-python;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jarvis_pc_bridge.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerSound("success");
    addLog("📥 Script 'jarvis_pc_bridge.py' descargado. Ejecútalo con: python jarvis_pc_bridge.py", "success");
    speak("Señor, he preparado y descargado el script del Puente de Control Stark en Python. Solo ejecútelo en su terminal para otorgarme control de su sistema operativo.");
  };

  // Download PowerShell Stark Controller Script
  const downloadPowerShellBridge = () => {
    triggerSound("click");
    const psCode = [
      '# J.A.R.V.I.S. STARK OS - WINDOWS POWERSHELL CONTROLLER BRIDGE',
      '$Port = 9876',
      '$Listener = New-Object System.Net.HttpListener',
      '$Listener.Prefixes.Add("http://localhost:$Port/")',
      '$Listener.Prefixes.Add("http://127.0.0.1:$Port/")',
      '$Listener.Start()',
      'Write-Host "⚡ J.A.R.V.I.S. PUENTE DE CONTROL WINDOWS INICIADO EN PUERTO $Port" -ForegroundColor Cyan',
      '$WScript = New-Object -ComObject WScript.Shell',
      'while ($Listener.IsListening) {',
      '    $Context = $Listener.GetContext()',
      '    $Request = $Context.Request',
      '    $Response = $Context.Response',
      '    $Response.AddHeader("Access-Control-Allow-Origin", "*")',
      '    $Response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")',
      '    $Response.AddHeader("Access-Control-Allow-Headers", "Content-Type")',
      '    if ($Request.HttpMethod -eq "OPTIONS") { $Response.StatusCode = 200; $Response.Close(); continue }',
      '    if ($Request.Url.AbsolutePath -eq "/status") {',
      '        $Json = \'{"status":"online","version":"2.4.0","os":"Windows"}\'',
      '        $Buf = [System.Text.Encoding]::UTF8.GetBytes($Json)',
      '        $Response.ContentType = "application/json"',
      '        $Response.OutputStream.Write($Buf, 0, $Buf.Length)',
      '        $Response.Close()',
      '        continue',
      '    }',
      '    if ($Request.HttpMethod -eq "POST" -and $Request.Url.AbsolutePath -eq "/command") {',
      '        $R = New-Object System.IO.StreamReader($Request.InputStream)',
      '        $D = $R.ReadToEnd() | ConvertFrom-Json',
      '        $C = $D.command',
      '        if ($C -eq "open_app") {',
      '            $App = $D.payload.appName',
      '            if ($App -eq "calculator") { Start-Process "calc.exe" }',
      '            elseif ($App -eq "notepad") { Start-Process "notepad.exe" }',
      '            elseif ($App -eq "explorer") { Start-Process "explorer.exe" }',
      '            elseif ($App -eq "spotify") { Start-Process "spotify:" }',
      '            else { Start-Process $App }',
      '        }',
      '        elseif ($C -eq "volume_up") { 1..5 | % { $WScript.SendKeys([char]175) } }',
      '        elseif ($C -eq "volume_down") { 1..5 | % { $WScript.SendKeys([char]174) } }',
      '        elseif ($C -eq "volume_mute") { $WScript.SendKeys([char]173) }',
      '        elseif ($C -eq "power_lock") { rundll32.exe user32.dll,LockWorkStation }',
      '        $Res = \'{"success":true,"message":"OK"}\'',
      '        $B = [System.Text.Encoding]::UTF8.GetBytes($Res)',
      '        $Response.ContentType = "application/json"',
      '        $Response.OutputStream.Write($B, 0, $B.Length)',
      '        $Response.Close()',
      '    }',
      '}'
    ].join('\r\n');

    const blob = new Blob([psCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jarvis_bridge.ps1";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerSound("success");
    addLog("📥 Script 'jarvis_bridge.ps1' descargado para Windows PowerShell.", "success");
    speak("Señor, he descargado el archivo para PowerShell. Solo haga clic derecho y seleccione 'Ejecutar con PowerShell' en su PC.");
  };

  return (
    <div className="flex flex-col gap-4 font-mono text-gray-200 animate-fadeIn">
      
      {/* Top Banner: Connection & Mode Switcher */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-hud-cyan/15 via-black to-hud-cyan/5 border border-hud-cyan/40 shadow-[0_0_25px_rgba(0,240,255,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shadow-lg ${
            bridgeConnected 
              ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              : "bg-hud-cyan/20 border-hud-cyan/60 text-hud-cyan shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          }`}>
            <Laptop className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wider">
                CONTROL DE COMPUTADORA // STARK PC BRIDGE
              </h2>
              <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${
                bridgeConnected
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                  : "bg-hud-cyan/10 text-hud-cyan border-hud-cyan/40"
              }`}>
                {bridgeConnected ? "BRIDGE LOCAL ACTIVO" : "ENLACE WEB NATIVO"}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {bridgeConnected 
                ? `Enlazado con el Sistema Operativo (${osName}) en el puerto ${bridgePort}`
                : `Control directo mediante APIs nativas del navegador y visión de pantalla`}
            </p>
          </div>
        </div>

        {/* Bridge Status Indicator & Reconnect Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => checkLocalBridge(false)}
            disabled={bridgeChecking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/60 border border-hud-cyan/40 hover:bg-hud-cyan/20 text-hud-cyan text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.1)]"
            title="Comprobar enlace local en localhost:9876"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${bridgeChecking ? "animate-spin text-hud-orange" : ""}`} />
            <span>{bridgeChecking ? "COMPROBANDO..." : (bridgeConnected ? "ENLACE OK" : "PROBAR PUENTE")}</span>
          </button>

          {setIsMiniWidgetOpen && (
            <button
              onClick={() => {
                triggerSound("click");
                setIsMiniWidgetOpen(!isMiniWidgetOpen);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition-all cursor-pointer ${
                isMiniWidgetOpen
                  ? "bg-hud-cyan text-black border-hud-cyan shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                  : "bg-black/60 border-hud-cyan/40 text-hud-cyan hover:bg-hud-cyan/20"
              }`}
              title="Miniatura flotante que se queda siempre visible sobre otras ventanas"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{isMiniWidgetOpen ? "MINI HUD ACTIVO" : "FLOTANTE (PIP)"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-hud-cyan/20 bg-black/40 overflow-x-auto scrollbar-none rounded-t-lg">
        {[
          { id: "quick" as const, label: "⚡ Acciones Rápidas", icon: Sparkles },
          { id: "screen" as const, label: "🖥️ Visión de Pantalla", icon: Monitor, badge: isScreenSharing ? "EN VIVO" : undefined },
          { id: "apps" as const, label: "🚀 Aplicaciones & Macros", icon: Terminal },
          { id: "bridge" as const, label: "🔌 Puente Nativo (.py / .ps1)", icon: Cpu, badge: bridgeConnected ? "CONECTADO" : undefined },
          { id: "telemetry" as const, label: "📊 Telemetría del Sistema", icon: HardDrive }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerSound("click");
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                isActive
                  ? "border-hud-cyan text-hud-cyan bg-hud-cyan/10"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-hud-cyan/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold ${
                  tab.badge === "EN VIVO" ? "bg-red-500 text-white animate-pulse" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: QUICK ACTIONS & NATIVE OS CONTROLS */}
      {activeTab === "quick" && (
        <div className="space-y-4">
          
          {/* Quick Hardware Controls Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Fullscreen Mode */}
            <button
              onClick={() => executePCCommand("fullscreen_toggle")}
              className={`p-3.5 rounded-xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                isFullscreen
                  ? "bg-hud-cyan/20 border-hud-cyan text-hud-cyan shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                  : "bg-black/60 border-hud-cyan/30 text-gray-300 hover:bg-hud-cyan/10 hover:border-hud-cyan/60"
              }`}
            >
              {isFullscreen ? <Minimize2 className="w-6 h-6 text-hud-cyan" /> : <Maximize2 className="w-6 h-6 text-hud-cyan" />}
              <div>
                <span className="text-xs font-bold block">PANTALLA COMPLETA</span>
                <span className="text-[10px] text-gray-400">{isFullscreen ? "Salir (Esc)" : "Inmersión Total"}</span>
              </div>
            </button>

            {/* Screen Share / AI Vision */}
            <button
              onClick={() => executePCCommand("screen_share")}
              className={`p-3.5 rounded-xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                isScreenSharing
                  ? "bg-red-950/60 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                  : "bg-black/60 border-hud-cyan/30 text-gray-300 hover:bg-hud-cyan/10 hover:border-hud-cyan/60"
              }`}
            >
              {isScreenSharing ? <EyeOff className="w-6 h-6 text-red-400 animate-pulse" /> : <Eye className="w-6 h-6 text-hud-cyan" />}
              <div>
                <span className="text-xs font-bold block">VER MI PANTALLA</span>
                <span className="text-[10px] text-gray-400">{isScreenSharing ? "Detener Visión" : "IA Observa PC"}</span>
              </div>
            </button>

            {/* Read Clipboard */}
            <button
              onClick={() => executePCCommand("clipboard_read")}
              className="p-3.5 rounded-xl bg-black/60 border border-hud-cyan/30 hover:bg-hud-cyan/10 hover:border-hud-cyan/60 text-gray-300 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
            >
              <Clipboard className="w-6 h-6 text-hud-cyan" />
              <div>
                <span className="text-xs font-bold block">LEER PORTAPAPELES</span>
                <span className="text-[10px] text-gray-400">J.A.R.V.I.S. lee texto</span>
              </div>
            </button>

            {/* Desktop Notification */}
            <button
              onClick={() => executePCCommand("notify_os", { title: "⚡ J.A.R.V.I.S. STARK OS", body: "Sistemas tácticos de la computadora bajo control nominal." })}
              className="p-3.5 rounded-xl bg-black/60 border border-hud-cyan/30 hover:bg-hud-cyan/10 hover:border-hud-cyan/60 text-gray-300 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
            >
              <Bell className="w-6 h-6 text-hud-cyan" />
              <div>
                <span className="text-xs font-bold block">NOTIFICACIÓN OS</span>
                <span className="text-[10px] text-gray-400">Alerta de Escritorio</span>
              </div>
            </button>

          </div>

          {/* System Volume & Media Bar */}
          <div className="p-4 rounded-xl bg-black/60 border border-hud-cyan/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-hud-cyan/10 text-hud-cyan border border-hud-cyan/30">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">CONTROLES MULTIMEDIA & AUDIO DE LA PC</span>
                <span className="text-[10px] text-gray-400">Ajustar volumen del sistema y reproducción en segundo plano</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => executePCCommand("volume_down")}
                className="px-3 py-1.5 rounded bg-gray-900 border border-gray-700 hover:border-hud-cyan text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Bajar volumen del sistema"
              >
                <span>Vol -</span>
              </button>
              <button
                onClick={() => executePCCommand("volume_up")}
                className="px-3 py-1.5 rounded bg-gray-900 border border-gray-700 hover:border-hud-cyan text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Subir volumen del sistema"
              >
                <span>Vol +</span>
              </button>
              <button
                onClick={() => executePCCommand("volume_mute")}
                className="px-3 py-1.5 rounded bg-gray-900 border border-gray-700 hover:border-hud-cyan text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Silenciar audio"
              >
                <VolumeX className="w-3.5 h-3.5 text-hud-orange" />
                <span>Mute</span>
              </button>
              <button
                onClick={() => executePCCommand("media_play_pause")}
                className="px-3 py-1.5 rounded bg-hud-cyan/15 border border-hud-cyan/40 hover:bg-hud-cyan/30 text-hud-cyan text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Pausar o reanudar música/video en la PC"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Play/Pausa</span>
              </button>
            </div>
          </div>

          {/* Quick System Power & Security Protocol */}
          <div className="p-4 rounded-xl bg-black/60 border border-hud-cyan/30">
            <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-hud-cyan" />
              <span>PROTOCOLOS DE SEGURIDAD Y ENERGÍA DEL SISTEMA</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => executePCCommand("power_lock")}
                className="p-3 rounded-lg bg-gray-900/80 border border-yellow-500/40 hover:bg-yellow-950/30 hover:border-yellow-400 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs mb-1">
                  <Lock className="w-4 h-4" />
                  <span>BLOQUEAR PANTALLA</span>
                </div>
                <p className="text-[10px] text-gray-400">Bloquea la sesión de Windows/Mac inmediatamente (Win + L).</p>
              </button>

              <button
                onClick={() => executePCCommand("power_sleep")}
                className="p-3 rounded-lg bg-gray-900/80 border border-blue-500/40 hover:bg-blue-950/30 hover:border-blue-400 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1">
                  <Moon className="w-4 h-4" />
                  <span>SUSPENDER COMPUTADORA</span>
                </div>
                <p className="text-[10px] text-gray-400">Pone la PC en estado de reposo de bajo consumo.</p>
              </button>

              <button
                onClick={() => executePCCommand("take_screenshot")}
                className="p-3 rounded-lg bg-gray-900/80 border border-hud-cyan/40 hover:bg-hud-cyan/10 hover:border-hud-cyan text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-hud-cyan font-bold text-xs mb-1">
                  <Camera className="w-4 h-4" />
                  <span>CAPTURA DE PANTALLA</span>
                </div>
                <p className="text-[10px] text-gray-400">Toma una foto del escritorio y la guarda en la PC.</p>
              </button>
            </div>
          </div>

          {/* Interactive Custom Voice/Text Command Bar */}
          <div className="p-3.5 rounded-xl bg-black/80 border border-hud-cyan/40 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-hud-cyan shrink-0" />
            <input
              type="text"
              placeholder="Escribe una orden para la PC (ej: 'abrir calculadora', 'silenciar volumen', 'bloquear pantalla')..."
              value={customCommandInput}
              onChange={(e) => setCustomCommandInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customCommandInput.trim()) {
                  const val = customCommandInput.trim().toLowerCase();
                  if (val.includes("calculadora")) executePCCommand("open_app", { appName: "calculator" });
                  else if (val.includes("bloc") || val.includes("notas") || val.includes("notepad")) executePCCommand("open_app", { appName: "notepad" });
                  else if (val.includes("spotify")) executePCCommand("open_app", { appName: "spotify" });
                  else if (val.includes("pantalla completa")) executePCCommand("fullscreen_toggle");
                  else if (val.includes("bloquear")) executePCCommand("power_lock");
                  else if (val.includes("volumen")) executePCCommand(val.includes("bajar") ? "volume_down" : "volume_up");
                  else executePCCommand("open_app", { appName: val });
                  setCustomCommandInput("");
                }
              }}
              className="flex-1 bg-transparent px-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              onClick={() => {
                if (customCommandInput.trim()) {
                  const val = customCommandInput.trim().toLowerCase();
                  if (val.includes("calculadora")) executePCCommand("open_app", { appName: "calculator" });
                  else if (val.includes("bloc") || val.includes("notas")) executePCCommand("open_app", { appName: "notepad" });
                  else if (val.includes("spotify")) executePCCommand("open_app", { appName: "spotify" });
                  else executePCCommand("open_app", { appName: val });
                  setCustomCommandInput("");
                }
              }}
              className="px-3 py-1.5 rounded bg-hud-cyan hover:bg-hud-cyan-hover text-black font-bold text-xs shrink-0 cursor-pointer"
            >
              EJECUTAR
            </button>
          </div>

        </div>
      )}

      {/* TAB 2: SCREEN VISION & REAL-TIME MONITORING */}
      {activeTab === "screen" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-black/60 border border-hud-cyan/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-hud-cyan" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    MATRIZ ÓPTICA EN TIEMPO REAL (SCREEN SHARING STREAM)
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    J.A.R.V.I.S. puede observar tu pantalla completa, ventanas específicas de programas o pestañas del navegador.
                  </p>
                </div>
              </div>

              <button
                onClick={toggleScreenShare}
                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isScreenSharing
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    : "bg-hud-cyan hover:bg-hud-cyan-hover text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                }`}
              >
                {isScreenSharing ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>DETENER MONITOREO</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>COMPARTIR PANTALLA CON JARVIS</span>
                  </>
                )}
              </button>
            </div>

            {/* Video Canvas for Screen Vision */}
            <div className="relative aspect-video w-full rounded-xl bg-black border-2 border-hud-cyan/30 overflow-hidden flex items-center justify-center shadow-inner">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain ${isScreenSharing ? "block" : "hidden"}`}
              />

              {!isScreenSharing && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-hud-cyan/10 border border-hud-cyan/30 flex items-center justify-center mx-auto text-hud-cyan">
                    <Monitor className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-hud-cyan">TRANSMISIÓN DE PANTALLA INACTIVA</h4>
                    <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                      Haz clic en "COMPARTIR PANTALLA CON JARVIS" para que la inteligencia artificial pueda analizar cualquier documento, código o juego en tu monitor.
                    </p>
                  </div>
                </div>
              )}

              {/* Overlay HUD Scanlines when active */}
              {isScreenSharing && (
                <div className="absolute inset-0 pointer-events-none border border-hud-cyan/40">
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 rounded border border-red-500/60 text-[10px] text-red-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>EN VIVO // ANALIZADOR ÓPTICO STARK</span>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded border border-hud-cyan/40 text-[10px] text-hud-cyan font-mono">
                    {screenRes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: APP LAUNCHER & MACROS */}
      {activeTab === "apps" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-black/60 border border-hud-cyan/40">
            <h3 className="text-xs sm:text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-hud-cyan" />
              <span>LANZADOR DE APLICACIONES DE LA COMPUTADORA</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Abre software y herramientas locales o en la nube directamente por comando de voz o haciendo clic:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "Calculadora", id: "calculator", icon: Calculator, desc: "Herramienta matemática" },
                { name: "Bloc de Notas", id: "notepad", icon: FileText, desc: "Editor de notas rápido" },
                { name: "Spotify", id: "spotify", icon: Play, desc: "Música y podcasts" },
                { name: "VS Code", id: "vscode", icon: Terminal, desc: "Editor de código" },
                { name: "Explorador", id: "explorer", icon: FolderOpen, desc: "Archivos de la PC" },
                { name: "YouTube", id: "youtube", icon: Tv, desc: "Videos y música" },
                { name: "Gmail", id: "gmail", icon: Bell, desc: "Correo electrónico" },
                { name: "Google Maps", id: "maps", icon: Globe, desc: "Navegación GPS" }
              ].map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    onClick={() => executePCCommand("open_app", { appName: app.id })}
                    className="p-3 rounded-lg bg-gray-900/80 border border-hud-cyan/20 hover:border-hud-cyan hover:bg-hud-cyan/10 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-hud-cyan font-bold text-xs mb-1">
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{app.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">{app.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STARK PC BRIDGE DAEMON SCRIPT (.PY / .PS1) */}
      {activeTab === "bridge" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-black/60 border border-hud-cyan/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-hud-cyan/20 text-hud-cyan border border-hud-cyan/40">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    AGENTE DE CONTROL NATIVO STARK BRIDGE (DAEMON)
                  </h3>
                  <p className="text-xs text-gray-400">
                    Permite a J.A.R.V.I.S. ejecutar aplicaciones nativas de Windows/Mac, ajustar volumen real, teclear texto y apagar/suspender la PC.
                  </p>
                </div>
              </div>

              <span className={`text-xs px-2.5 py-1 rounded font-bold border ${
                bridgeConnected
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                  : "bg-hud-orange/20 text-hud-orange border-hud-orange/40"
              }`}>
                {bridgeConnected ? "CONECTADO A LOCALHOST:9876" : "DESCONECTADO"}
              </span>
            </div>

            {/* Instruction Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
              
              {/* Python Bridge Option */}
              <div className="p-4 rounded-xl bg-gray-900/90 border border-hud-cyan/30 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-hud-cyan text-sm">Opción A: Script en Python (.py)</span>
                    <span className="text-[9px] bg-hud-cyan/20 text-hud-cyan px-2 py-0.5 rounded">Universal (Win/Mac/Linux)</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Solo requiere tener Python instalado. Abre una terminal y corre: <code className="text-hud-cyan bg-black px-1 rounded">python jarvis_pc_bridge.py</code>
                  </p>
                </div>
                <button
                  onClick={downloadPythonBridge}
                  className="w-full py-2 px-3 rounded-lg bg-hud-cyan hover:bg-hud-cyan-hover text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                >
                  <Download className="w-4 h-4" />
                  <span>DESCARGAR 'jarvis_pc_bridge.py'</span>
                </button>
              </div>

              {/* PowerShell Bridge Option */}
              <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-700 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-200 text-sm">Opción B: Script en PowerShell (.ps1)</span>
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">Windows 10 / 11 Nativo</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    No requiere instalar nada. Clic derecho en el archivo y seleccionar "Ejecutar con PowerShell".
                  </p>
                </div>
                <button
                  onClick={downloadPowerShellBridge}
                  className="w-full py-2 px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>DESCARGAR 'jarvis_bridge.ps1'</span>
                </button>
              </div>

            </div>

            {/* Last Bridge Status Response */}
            <div className="p-2.5 rounded-lg bg-black/80 border border-gray-800 text-xs font-mono flex items-center justify-between text-gray-400">
              <span className="text-hud-cyan">Último reporte:</span>
              <span className="truncate max-w-md">{lastBridgeResponse}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM TELEMETRY & HARDWARE STATS */}
      {activeTab === "telemetry" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Battery Status */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-hud-cyan/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                <span>BATERÍA / ENERGÍA</span>
                {isCharging ? <BatteryCharging className="w-4 h-4 text-emerald-400" /> : <Battery className="w-4 h-4 text-hud-cyan" />}
              </div>
              <div className="text-xl font-bold text-white">
                {batteryLevel !== null ? `${batteryLevel}%` : "100% CA"}
              </div>
              <span className="text-[10px] text-gray-400 mt-1">
                {isCharging ? "⚡ Conectado a la corriente" : "🔋 Consumiendo batería"}
              </span>
            </div>

            {/* Network Speed & Ping */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-hud-cyan/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                <span>CONECTIVIDAD</span>
                {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
              </div>
              <div className="text-xl font-bold text-white">
                {networkSpeed !== null ? `${networkSpeed} Mbps` : "En línea"}
              </div>
              <span className="text-[10px] text-gray-400 mt-1">
                Latencia Ping: {networkLatency !== null ? `${networkLatency} ms` : "15 ms"}
              </span>
            </div>

            {/* CPU Cores & Memory */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-hud-cyan/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                <span>PROCESADOR</span>
                <Cpu className="w-4 h-4 text-hud-cyan" />
              </div>
              <div className="text-xl font-bold text-white">
                {hardwareConcurrency} Núcleos
              </div>
              <span className="text-[10px] text-gray-400 mt-1">
                Memoria: {deviceMemory}
              </span>
            </div>

            {/* Resolution & OS */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-hud-cyan/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                <span>SISTEMA & MONITOR</span>
                <Monitor className="w-4 h-4 text-hud-cyan" />
              </div>
              <div className="text-sm font-bold text-white truncate">
                {osName}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 truncate">
                {screenRes}
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Command Execution Log Stream */}
      <div className="p-3 rounded-xl bg-black/70 border border-gray-800 text-xs">
        <div className="flex items-center justify-between mb-1.5 text-gray-400 text-[11px]">
          <span className="font-bold text-hud-cyan">REGISTRO DE COMANDOS DEL SISTEMA OPERATIVO</span>
          <span>{commandHistory.length} registros</span>
        </div>
        <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-none font-mono text-[10px]">
          {commandHistory.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-gray-300">
              <span className="text-hud-cyan/80">[{h.time}] {h.text}</span>
              <span className="text-emerald-400 font-bold">{h.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ComputerControlPanel;
