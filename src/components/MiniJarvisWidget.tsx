import React, { useState, useEffect, useRef } from "react";
import { 
  Tv, 
  Maximize2, 
  X, 
  Mic, 
  Radio, 
  Volume2, 
  ShieldAlert, 
  Move,
  Compass,
  Cpu,
  ExternalLink,
  Layers,
  Sparkles,
  Camera,
  Send
} from "lucide-react";
import { JarvisState, PersonalityId, UserProfile } from "../types";

interface MiniJarvisWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onMaximize: () => void;
  jarvisState: JarvisState;
  personalityId: PersonalityId;
  personalityName: string;
  userProfile: UserProfile;
  stream: MediaStream | null;
  isSimulatedCamera: boolean;
  simulatedTarget: string;
  opticalFilter: string;
  drawSimulatedScene: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    target: string,
    imgEl: HTMLImageElement | null,
    filter: string,
    frameCount: number
  ) => void;
  uploadedImageRef: React.MutableRefObject<HTMLImageElement | null>;
  getFilterCSS: (filterName: string) => string;
  isHandsFree: boolean;
  onToggleHandsFree: () => void;
  onTriggerScan: () => void;
  onAskQuestion: (query: string) => void;
  lastSpokenText?: string;
  triggerSound: (type: "startup" | "scan" | "success" | "error" | "abort" | "click" | "alarm") => void;
  onOpenEmergency: () => void;
  activeMainTab: "visor" | "chat" | "usb" | "home";
  setActiveMainTab: (tab: "visor" | "chat" | "usb" | "home") => void;
}

export const MiniJarvisWidget: React.FC<MiniJarvisWidgetProps> = ({
  isOpen,
  onClose,
  onMaximize,
  jarvisState,
  personalityId,
  personalityName,
  userProfile,
  stream,
  isSimulatedCamera,
  simulatedTarget,
  opticalFilter,
  drawSimulatedScene,
  uploadedImageRef,
  getFilterCSS,
  isHandsFree,
  onToggleHandsFree,
  onTriggerScan,
  onAskQuestion,
  lastSpokenText,
  triggerSound,
  onOpenEmergency,
}) => {
  const [position, setPosition] = useState<"bottom-right" | "bottom-left" | "top-right" | "top-left">("bottom-right");
  const [isMinimized, setIsMinimized] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFloatingOutside, setIsFloatingOutside] = useState(false);
  const [pipType, setPipType] = useState<"document" | "video" | "popout" | null>(null);

  const miniVideoRef = useRef<HTMLVideoElement | null>(null);
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pipStreamCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pipStreamVideoRef = useRef<HTMLVideoElement | null>(null);
  const pipWindowRef = useRef<any>(null);

  // Sync camera stream to mini video element
  useEffect(() => {
    if (miniVideoRef.current && stream && !isSimulatedCamera) {
      miniVideoRef.current.srcObject = stream;
    }
  }, [stream, isSimulatedCamera]);

  // Main local mini canvas rendering loop for simulated camera
  useEffect(() => {
    if (!isOpen || !isSimulatedCamera) return;

    let animationFrameId: number;
    let count = 0;

    const render = () => {
      const canvas = miniCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = canvas.parentElement?.clientWidth || 280;
          canvas.height = canvas.parentElement?.clientHeight || 160;
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
  }, [isOpen, isSimulatedCamera, simulatedTarget, opticalFilter, drawSimulatedScene, uploadedImageRef]);

  // Continuous Canvas Stream for Universal Native Video Picture-in-Picture (Floats outside of Google)
  useEffect(() => {
    let animId: number;
    let frame = 0;

    const renderPipFeed = () => {
      const canvas = pipStreamCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          frame++;
          canvas.width = 480;
          canvas.height = 320;

          // 1. Draw Background / Video Source or Simulator
          if (!isSimulatedCamera && miniVideoRef.current && miniVideoRef.current.readyState >= 2) {
            ctx.drawImage(miniVideoRef.current, 0, 0, 480, 320);
          } else {
            drawSimulatedScene(
              ctx,
              480,
              320,
              simulatedTarget,
              uploadedImageRef.current,
              opticalFilter,
              frame
            );
          }

          // 2. High-Tech Cybernetic Stark HUD Overlay on Canvas
          ctx.save();
          // Dark vignetting
          const grad = ctx.createRadialGradient(240, 160, 80, 240, 160, 240);
          grad.addColorStop(0, "rgba(0,0,0,0)");
          grad.addColorStop(1, "rgba(0,0,0,0.75)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 480, 320);

          // Top Header Bar
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.fillRect(0, 0, 480, 38);
          ctx.fillStyle = "#00f0ff";
          ctx.fillRect(0, 37, 480, 1);

          // Logo / Text
          ctx.fillStyle = "#00f0ff";
          ctx.font = "bold 13px monospace";
          ctx.fillText(`⚡ ${personalityName} // ESCRITORIO OS`, 14, 24);

          // Pilot tag
          ctx.fillStyle = "#9ca3af";
          ctx.font = "10px monospace";
          const pilotStr = `${userProfile.title ? `${userProfile.title} ` : ""}${userProfile.name || "Fernando"} (${userProfile.age || 20}a)`;
          ctx.fillText(pilotStr, 280, 24);

          // Pulsing Arc Reactor Circle on Canvas
          const isSpeaking = jarvisState === JarvisState.SPEAKING;
          const isAnalyzing = jarvisState === JarvisState.ANALYZING;
          const pulse = (Math.sin(frame * 0.1) + 1) * 3;

          ctx.beginPath();
          ctx.arc(440, 20, 10, 0, Math.PI * 2);
          ctx.strokeStyle = isSpeaking ? "#ff9900" : isAnalyzing ? "#a855f7" : "#00f0ff";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(440, 20, 4 + (isSpeaking ? pulse : 0), 0, Math.PI * 2);
          ctx.fillStyle = isSpeaking ? "#ff9900" : "#00f0ff";
          ctx.fill();

          // Bottom Subtitles Ticker Bar
          ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
          ctx.fillRect(0, 245, 480, 75);
          ctx.fillStyle = "#00f0ff";
          ctx.fillRect(0, 245, 480, 1);

          // Subtitle Status Label
          ctx.fillStyle = isSpeaking ? "#ff9900" : "#00f0ff";
          ctx.font = "bold 9px monospace";
          ctx.fillText(isSpeaking ? "🔊 TRANSMITIENDO VOZ:" : "🤖 ESTADO COGNITIVO:", 14, 260);

          // Subtitle Content
          ctx.fillStyle = "#ffffff";
          ctx.font = "12px sans-serif";
          const subtitle = lastSpokenText || `Sistemas de ${personalityName} listos fuera de Google.`;
          
          // Auto-wrap subtitle text onto 2 lines
          const words = subtitle.split(" ");
          let line1 = "";
          let line2 = "";
          for (const w of words) {
            if ((line1 + " " + w).length < 52) {
              line1 += (line1 ? " " : "") + w;
            } else if ((line2 + " " + w).length < 52) {
              line2 += (line2 ? " " : "") + w;
            }
          }
          ctx.fillText(line1, 14, 280);
          if (line2) {
            ctx.fillText(line2, 14, 300);
          }

          ctx.restore();
        }
      }
      animId = requestAnimationFrame(renderPipFeed);
    };

    renderPipFeed();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [personalityName, userProfile, jarvisState, lastSpokenText, isSimulatedCamera, simulatedTarget, opticalFilter, drawSimulatedScene, uploadedImageRef]);

  // Hook canvas stream into hidden video for OS-level Video PiP
  useEffect(() => {
    const canvas = pipStreamCanvasRef.current;
    const video = pipStreamVideoRef.current;
    if (canvas && video) {
      try {
        if (!video.srcObject && (canvas as any).captureStream) {
          const stream = (canvas as any).captureStream(30);
          video.srcObject = stream;
          video.play().catch(() => {});
        }
      } catch (err) {
        console.warn("Could not capture canvas stream for OS PiP:", err);
      }
    }
  }, []);

  // Exit floating OS window listener
  useEffect(() => {
    const handleLeavePip = () => {
      setIsFloatingOutside(false);
      setPipType(null);
    };

    const video = pipStreamVideoRef.current;
    if (video) {
      video.addEventListener("leavepictureinpicture", handleLeavePip);
    }
    return () => {
      if (video) {
        video.removeEventListener("leavepictureinpicture", handleLeavePip);
      }
    };
  }, []);

  /**
   * Universal "Salir de Google / Flotar sobre el Escritorio" (Picture-in-Picture OS & Popout)
   * Uses modern Document PiP if available in Chromium/Google Chrome,
   * or seamlessly falls back to Hardware Video Canvas PiP / Dedicated Popout Window.
   */
  const handleFloatOutsideGoogle = async () => {
    triggerSound("startup");

    // 1. Try Document Picture-in-Picture (Google Chrome 116+)
    if (typeof window !== "undefined" && "documentPictureInPicture" in window) {
      try {
        if (pipWindowRef.current) {
          pipWindowRef.current.close();
          pipWindowRef.current = null;
          setIsFloatingOutside(false);
          setPipType(null);
          return;
        }

        const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 360,
          height: 520,
        });

        pipWindowRef.current = pipWindow;
        setIsFloatingOutside(true);
        setPipType("document");

        // Copy styles to Document PiP window so Tailwind & glowing styles work natively
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join("");
            const style = pipWindow.document.createElement("style");
            style.textContent = cssRules;
            pipWindow.document.head.appendChild(style);
          } catch (e) {
            try {
              const link = pipWindow.document.createElement("link");
              link.rel = "stylesheet";
              link.type = styleSheet.type;
              link.media = styleSheet.media;
              link.href = styleSheet.href;
              pipWindow.document.head.appendChild(link);
            } catch (err) {}
          }
        });

        // Add cybernetic dark theme background to PiP document
        pipWindow.document.body.style.backgroundColor = "#030712";
        pipWindow.document.body.style.margin = "0";
        pipWindow.document.body.style.overflow = "hidden";
        pipWindow.document.body.style.fontFamily = "monospace";
        pipWindow.document.title = `⚡ ${personalityName} // FLOTANTE`;

        // Render interactive UI inside the Always-On-Top Document PiP window
        const container = pipWindow.document.createElement("div");
        container.id = "pip-root";
        container.style.width = "100%";
        container.style.height = "100vh";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.backgroundColor = "rgba(0,0,0,0.95)";
        container.style.color = "#00f0ff";
        container.style.border = "2px solid rgba(0, 240, 255, 0.7)";
        container.style.boxSizing = "border-box";
        container.style.padding = "10px";

        container.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,240,255,0.3); padding-bottom:8px; margin-bottom:8px;">
            <div style="font-weight:bold; font-size:12px; display:flex; align-items:center; gap:6px;">
              <span style="color:#00f0ff;">⚡ ${personalityName}</span>
              <span style="background:rgba(0,240,255,0.2); font-size:9px; padding:2px 6px; border-radius:4px; border:1px solid #00f0ff;">FUERA DE GOOGLE</span>
            </div>
            <div style="font-size:10px; color:#9ca3af;">${userProfile.title || "Piloto"} ${userProfile.name || "Fernando"}</div>
          </div>
          <div style="position:relative; flex:1; background:#000; border:1px solid rgba(0,240,255,0.4); border-radius:6px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
            <div style="text-align:center; padding:15px;">
              <div style="font-size:28px; margin-bottom:6px; animation:spin 8s linear infinite;">💠</div>
              <div style="font-size:11px; font-weight:bold; color:#00f0ff; letter-spacing:1px;">MATRIZ HOLOGRÁFICA ACTIVA</div>
              <div style="font-size:9px; color:#9ca3af; margin-top:4px;">Flotando sobre tu escritorio y aplicaciones</div>
            </div>
          </div>
          <div style="margin-top:10px; background:rgba(0,0,0,0.8); border:1px solid rgba(0,240,255,0.2); border-radius:6px; padding:8px;">
            <div style="font-size:9px; color:#ff9900; font-weight:bold; margin-bottom:4px;">🔊 ÚLTIMA TRANSMISIÓN:</div>
            <div style="font-size:10px; color:#e5e7eb; line-height:1.4;">${lastSpokenText || "Listo para responder a cualquier orden por voz o chat."}</div>
          </div>
          <div style="display:flex; gap:6px; margin-top:10px;">
            <button id="pip-mic-btn" style="flex:1; background:rgba(0,240,255,0.15); border:1px solid #00f0ff; color:#00f0ff; font-weight:bold; font-size:10px; padding:8px; border-radius:4px; cursor:pointer;">
              🎤 ${isHandsFree ? "MIC ENCENDIDO" : "ACTIVAR VOZ"}
            </button>
            <button id="pip-scan-btn" style="flex:1; background:#00f0ff; border:1px solid #00f0ff; color:#000; font-weight:bold; font-size:10px; padding:8px; border-radius:4px; cursor:pointer;">
              📷 ESCANEAR
            </button>
          </div>
        `;

        pipWindow.document.body.appendChild(container);

        // Bind interactive events inside Document PiP
        const micBtn = pipWindow.document.getElementById("pip-mic-btn");
        if (micBtn) {
          micBtn.onclick = () => {
            onToggleHandsFree();
            triggerSound("click");
          };
        }

        const scanBtn = pipWindow.document.getElementById("pip-scan-btn");
        if (scanBtn) {
          scanBtn.onclick = () => {
            onTriggerScan();
            triggerSound("scan");
          };
        }

        pipWindow.addEventListener("pagehide", () => {
          pipWindowRef.current = null;
          setIsFloatingOutside(false);
          setPipType(null);
        });

        return;
      } catch (e) {
        console.warn("Document Picture-in-Picture not available, falling back to Video Canvas PiP:", e);
      }
    }

    // 2. Fallback to HTML5 Video Canvas Stream Picture-in-Picture (Universal)
    try {
      const video = pipStreamVideoRef.current;
      const canvas = pipStreamCanvasRef.current;
      if (video && canvas) {
        if (!video.srcObject && (canvas as any).captureStream) {
          video.srcObject = (canvas as any).captureStream(30);
        }
        await video.play().catch(() => {});

        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsFloatingOutside(false);
          setPipType(null);
        } else if (video.requestPictureInPicture) {
          await video.requestPictureInPicture();
          setIsFloatingOutside(true);
          setPipType("video");
          return;
        }
      }
    } catch (err) {
      console.warn("Native Video PiP failed or restricted by iframe permissions:", err);
    }

    // 3. Guaranteed Standalone Window Fallback
    try {
      const popup = window.open(
        window.location.href,
        "jarvis_floating_window",
        "width=380,height=560,menubar=no,toolbar=no,location=no,status=no,resizable=yes"
      );
      if (popup) {
        setIsFloatingOutside(true);
        setPipType("popout");
      }
    } catch (popupErr) {
      console.warn("Popup blocked:", popupErr);
    }
  };

  const handleSendQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    triggerSound("click");
    setIsSubmitting(true);
    onAskQuestion(quickQuery.trim());
    setQuickQuery("");
    setTimeout(() => setIsSubmitting(false), 800);
  };

  if (!isOpen) return null;

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-16 right-4",
    "top-left": "top-16 left-4"
  }[position];

  // Minimized floating Arc Reactor pill inside the app
  if (isMinimized) {
    return (
      <div 
        id="mini-jarvis-dock-pill"
        className={`fixed ${positionClasses} z-50 transition-all duration-300 animate-bounce-short`}
      >
        <button
          onClick={() => {
            triggerSound("startup");
            setIsMinimized(false);
          }}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-black/90 border-2 border-hud-cyan/80 rounded-full shadow-[0_0_25px_rgba(0,240,255,0.4)] text-hud-cyan font-mono text-xs font-bold hover:scale-105 hover:bg-black transition-all cursor-pointer group"
          title="Expandir miniatura holográfica de JARVIS"
        >
          <div className="relative w-4 h-4 flex items-center justify-center">
            <div className={`w-3.5 h-3.5 rounded-full border border-hud-cyan bg-hud-cyan/30 ${
              jarvisState === JarvisState.SPEAKING ? "animate-ping" : "animate-pulse"
            }`} />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <span className="tracking-widest uppercase text-[11px]">
            {personalityName} // MINIATURA
          </span>
          <Maximize2 className="w-3.5 h-3.5 text-hud-cyan group-hover:rotate-45 transition-transform" />
        </button>
      </div>
    );
  }

  const isSpeaking = jarvisState === JarvisState.SPEAKING;
  const isAnalyzing = jarvisState === JarvisState.ANALYZING;

  return (
    <>
      {/* Hidden Universal Canvas Stream & Video for Native OS Picture-in-Picture */}
      <canvas ref={pipStreamCanvasRef} className="hidden" />
      <video ref={pipStreamVideoRef} autoPlay playsInline muted className="hidden" />

      {/* Interactive Main HUD Miniature Window */}
      <div 
        id="mini-jarvis-floating-hud"
        className={`fixed ${positionClasses} z-50 w-[300px] sm:w-[350px] bg-black/95 border-2 border-hud-cyan/80 rounded-xl shadow-[0_0_40px_rgba(0,240,255,0.4)] backdrop-blur-xl overflow-hidden flex flex-col font-sans transition-all duration-300 select-none`}
        style={{ animation: "fadeIn 0.25s ease-out" }}
      >
        {/* Top Window Header */}
        <div className="bg-gradient-to-r from-hud-cyan/25 via-black to-hud-cyan/15 px-3 py-2 border-b border-hud-cyan/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Compass className="w-4 h-4 text-hud-cyan animate-spin-slow" />
              <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                isSpeaking ? "bg-hud-orange animate-ping" : "bg-green-400"
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-hud-cyan tracking-wider">
                  {personalityName} // MINI VISOR
                </span>
                {isFloatingOutside ? (
                  <span className="text-[8px] font-mono bg-hud-orange/30 text-hud-orange px-1 rounded border border-hud-orange/50 animate-pulse font-bold">
                    EN ESCRITORIO
                  </span>
                ) : (
                  <span className="text-[8px] font-mono bg-hud-cyan/20 text-hud-cyan px-1 rounded border border-hud-cyan/30">
                    HUD
                  </span>
                )}
              </div>
              <span className="text-[9px] font-mono text-gray-400 block leading-none">
                {userProfile.title ? `${userProfile.title} ` : ""}{userProfile.name || "Fernando"} ({userProfile.age || 20}a)
              </span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1">
            {/* Pop Out / Float Outside Google Button */}
            <button
              onClick={handleFloatOutsideGoogle}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                isFloatingOutside
                  ? "bg-hud-orange text-black border-hud-orange shadow-[0_0_10px_rgba(255,153,0,0.6)]"
                  : "bg-hud-cyan/15 hover:bg-hud-cyan/30 text-hud-cyan border-hud-cyan/50"
              }`}
              title="Sacar miniatura fuera de Google Chrome (Flotar sobre el Escritorio)"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">{isFloatingOutside ? "FLOTANDO" : "SALIR DE GOOGLE"}</span>
            </button>

            {/* Corner Switcher */}
            <button
              onClick={() => {
                triggerSound("click");
                const order: ("bottom-right" | "bottom-left" | "top-left" | "top-right")[] = [
                  "bottom-right",
                  "bottom-left",
                  "top-left",
                  "top-right"
                ];
                const nextIdx = (order.indexOf(position) + 1) % order.length;
                setPosition(order[nextIdx]);
              }}
              className="p-1 text-gray-400 hover:text-hud-cyan rounded hover:bg-white/5 transition-colors cursor-pointer"
              title="Cambiar posición de la pantalla miniatura"
            >
              <Move className="w-3.5 h-3.5" />
            </button>

            {/* Minimize into floating pill */}
            <button
              onClick={() => {
                triggerSound("click");
                setIsMinimized(true);
              }}
              className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer font-mono text-xs"
              title="Minimizar a botón flotante"
            >
              _
            </button>

            {/* Maximize to full dashboard view */}
            <button
              onClick={() => {
                triggerSound("click");
                onMaximize();
              }}
              className="p-1 text-gray-400 hover:text-hud-cyan rounded hover:bg-white/5 transition-colors cursor-pointer"
              title="Maximizar a pantalla completa"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Close mini window */}
            <button
              onClick={() => {
                triggerSound("abort");
                onClose();
              }}
              className="p-1 text-gray-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Cerrar pantalla miniatura"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Screen Feed Section */}
        <div className="relative aspect-video bg-black overflow-hidden border-b border-hud-cyan/20 group">
          {/* Real camera video OR simulator canvas */}
          {!isSimulatedCamera && stream ? (
            <video
              ref={miniVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ filter: getFilterCSS(opticalFilter) }}
            />
          ) : (
            <canvas
              ref={miniCanvasRef}
              className="w-full h-full object-cover"
              style={{ filter: getFilterCSS(opticalFilter) }}
            />
          )}

          {/* Scan lines scan effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.08)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

          {/* Glowing Arc Reactor Center Overlay */}
          <div className="absolute top-2 right-2 pointer-events-none">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className={`w-7 h-7 rounded-full border border-hud-cyan/60 bg-black/60 flex items-center justify-center ${
                isSpeaking ? "border-hud-orange animate-spin-slow" : isAnalyzing ? "border-hud-cyan animate-pulse" : ""
              }`}>
                <div className={`w-3.5 h-3.5 rounded-full ${
                  isSpeaking ? "bg-hud-orange shadow-[0_0_10px_#ff9900]" : "bg-hud-cyan shadow-[0_0_10px_#00f0ff]"
                }`} />
              </div>
            </div>
          </div>

          {/* Status Tag Overlay */}
          <div className="absolute top-2 left-2 pointer-events-none">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/70 border border-hud-cyan/40 backdrop-blur-sm">
              <div className={`w-1.5 h-1.5 rounded-full ${
                isSpeaking 
                  ? "bg-hud-orange animate-ping" 
                  : isAnalyzing 
                  ? "bg-purple-400 animate-pulse" 
                  : "bg-green-400"
              }`} />
              <span className="text-[9px] font-mono text-hud-cyan font-bold uppercase tracking-wider">
                {isSpeaking ? "TRANSMITIENDO VOZ" : isAnalyzing ? "ANALIZANDO IA" : "EN LÍNEA"}
              </span>
            </div>
          </div>

          {/* Quick Bottom Overlay Controls inside Video */}
          <div className="absolute bottom-2 inset-x-2 flex items-center justify-between gap-1.5">
            {/* Quick Scan Button */}
            <button
              onClick={() => {
                triggerSound("scan");
                onTriggerScan();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-hud-cyan/80 hover:bg-hud-cyan text-black font-mono font-bold text-[10px] uppercase shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
              title="Escanear lo que ve la cámara ahora"
            >
              <Camera className="w-3 h-3" />
              <span>ESCANEAR</span>
            </button>

            {/* Quick Mic Voice Intercom */}
            <button
              onClick={() => {
                triggerSound("click");
                onToggleHandsFree();
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded font-mono font-bold text-[10px] uppercase border transition-all cursor-pointer ${
                isHandsFree
                  ? "bg-hud-orange border-hud-orange text-black shadow-[0_0_10px_rgba(255,153,0,0.5)] animate-pulse"
                  : "bg-black/70 border-hud-cyan/50 text-hud-cyan hover:bg-hud-cyan/20"
              }`}
              title="Encender o apagar micrófono"
            >
              {isHandsFree ? <Radio className="w-3 h-3 text-black animate-spin-slow" /> : <Mic className="w-3 h-3" />}
              <span>{isHandsFree ? "MIC ACTIVO" : "HABLAR"}</span>
            </button>

            {/* Flotar fuera de Google (OS PiP) */}
            <button
              onClick={handleFloatOutsideGoogle}
              className="p-1 rounded bg-hud-cyan/20 hover:bg-hud-cyan text-hud-cyan hover:text-black border border-hud-cyan/50 transition-all cursor-pointer flex items-center gap-1 text-[9px] font-mono font-bold"
              title="Flotar fuera de Google Chrome (Picture-in-Picture en el Escritorio)"
            >
              <Tv className="w-3 h-3" />
              <span>PIP OS</span>
            </button>

            {/* Emergency SOS Quick */}
            <button
              onClick={() => {
                triggerSound("alarm");
                onOpenEmergency();
              }}
              className="p-1 rounded bg-red-950/80 border border-red-500 text-red-300 hover:bg-red-900 cursor-pointer"
              title="Protocolo de Emergencia SOS"
            >
              <ShieldAlert className="w-3 h-3 text-red-400 animate-pulse" />
            </button>
          </div>
        </div>

        {/* Real-time Subtitle / Voice Ticker */}
        <div className="p-2.5 bg-black/80 border-b border-hud-cyan/15">
          <div className="flex items-center gap-1.5 mb-1">
            <Volume2 className={`w-3 h-3 ${isSpeaking ? "text-hud-orange animate-pulse" : "text-hud-cyan"}`} />
            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">
              {isSpeaking ? "TRANSMISIÓN VOCAL ACTIVA:" : "ESTADO COGNITIVO:"}
            </span>
          </div>
          <p className="text-[11px] font-mono text-gray-200 line-clamp-2 leading-relaxed bg-black/50 p-1.5 rounded border border-hud-cyan/10">
            {lastSpokenText || `Sistemas listos para responder con precisión, ${userProfile.title ? `${userProfile.title} ` : ""}${userProfile.name || "Fernando"}.`}
          </p>
        </div>

        {/* Quick Question Input inside Mini Window */}
        <form onSubmit={handleSendQuick} className="p-2 bg-hud-cyan/5 flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder={`Pregúntale a ${personalityName}...`}
              className="w-full bg-black/70 border border-hud-cyan/30 rounded px-2.5 py-1.5 text-xs text-hud-cyan font-mono placeholder-gray-500 focus:outline-none focus:border-hud-cyan focus:ring-1 focus:ring-hud-cyan"
            />
          </div>
          <button
            type="submit"
            disabled={!quickQuery.trim() || isSubmitting}
            className="p-1.5 bg-hud-cyan hover:bg-hud-cyan/80 disabled:opacity-40 text-black rounded font-mono font-bold cursor-pointer transition-all shadow-[0_0_8px_rgba(0,240,255,0.3)]"
            title="Enviar pregunta rápida"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </>
  );
};

export default MiniJarvisWidget;
