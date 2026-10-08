import React, { useState } from "react";
import { 
  Globe, 
  ExternalLink, 
  X, 
  Search, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  Maximize2,
  Minimize2,
  Sparkles,
  BookOpen
} from "lucide-react";
import { PersonalityId } from "../types";

interface HolographicWebModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  objectName: string;
  personalityId: PersonalityId;
  triggerSound?: (type: "startup" | "scan" | "success" | "error" | "abort" | "click") => void;
  onSpeak?: (text: string) => void;
}

export const HolographicWebModal: React.FC<HolographicWebModalProps> = ({
  isOpen,
  onClose,
  url,
  objectName,
  personalityId,
  triggerSound,
  onSpeak
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [activeUrl, setActiveUrl] = useState(url);

  React.useEffect(() => {
    setActiveUrl(url);
    setIframeError(false);
  }, [url]);

  if (!isOpen || !url) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    triggerSound?.("click");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenExternal = () => {
    triggerSound?.("success");
    window.open(activeUrl, "_blank", "noopener,noreferrer");
  };

  const searchGoogleUrl = `https://www.google.com/search?q=${encodeURIComponent(objectName || "Objeto escaneado")}`;
  const searchWikiUrl = `https://es.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(objectName || "")}`;

  let domain = "";
  try {
    const parsed = new URL(activeUrl);
    domain = parsed.hostname;
  } catch {
    domain = activeUrl;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div 
        className={`w-full ${isExpanded ? "max-w-6xl h-[92vh]" : "max-w-4xl h-[82vh]"} flex flex-col bg-zinc-950 border border-hud-cyan/40 rounded-lg shadow-[0_0_30px_rgba(0,240,255,0.25)] overflow-hidden transition-all duration-300 relative`}
      >
        {/* HUD Top Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-hud-cyan pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-hud-cyan pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-hud-cyan pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-hud-cyan pointer-events-none" />

        {/* Modal Header */}
        <div className="bg-black/80 border-b border-hud-cyan/20 px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-hud-cyan/10 border border-hud-cyan/30 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-hud-cyan animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-hud-cyan font-bold tracking-widest uppercase">
                  NAVEGADOR HOLOGRÁFICO // {personalityId}
                </span>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-mono px-1.5 py-0.2 rounded flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  SITIO SEGURO
                </span>
              </div>
              <h3 className="text-xs font-mono font-bold text-gray-200 truncate">
                {objectName || "Enlace Detectado"}
              </h3>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded text-gray-400 hover:text-hud-cyan hover:bg-hud-cyan/10 transition-colors"
              title={isExpanded ? "Reducir ventana" : "Pantalla completa"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                triggerSound?.("abort");
                onClose();
              }}
              className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Cerrar navegador"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* URL / Navigation Address Bar */}
        <div className="bg-zinc-900/90 border-b border-hud-cyan/15 px-4 py-2 flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-black/70 border border-hud-cyan/30 rounded px-3 py-1.5 text-xs font-mono text-hud-cyan">
            <Globe className="w-3.5 h-3.5 text-hud-cyan/70 flex-shrink-0" />
            <input 
              type="text" 
              value={activeUrl}
              onChange={(e) => setActiveUrl(e.target.value)}
              className="w-full bg-transparent text-hud-cyan focus:outline-none font-mono text-xs selection:bg-hud-cyan/30"
            />
            <button
              onClick={handleCopy}
              className="p-1 text-gray-400 hover:text-hud-cyan transition-colors"
              title="Copiar URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Direct External Open Button */}
          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1.5 bg-hud-cyan text-black font-mono font-bold text-xs px-3.5 py-1.5 rounded hover:bg-hud-cyan/80 transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)] cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>ABRIR EN NUEVA PESTAÑA</span>
          </button>
        </div>

        {/* Quick Hub Shortcuts */}
        <div className="bg-black/50 border-b border-hud-cyan/10 px-4 py-1.5 flex items-center gap-2 overflow-x-auto text-[10px] font-mono">
          <span className="text-gray-500 uppercase flex-shrink-0">Accesos Directos:</span>
          <button
            onClick={() => setActiveUrl(searchGoogleUrl)}
            className="flex items-center gap-1 bg-zinc-800/80 hover:bg-zinc-700 text-gray-300 hover:text-white px-2 py-0.5 rounded border border-gray-700 transition-colors flex-shrink-0"
          >
            <Search className="w-3 h-3 text-hud-cyan" />
            <span>Google: {objectName.substring(0, 20)}</span>
          </button>
          <button
            onClick={() => setActiveUrl(searchWikiUrl)}
            className="flex items-center gap-1 bg-zinc-800/80 hover:bg-zinc-700 text-gray-300 hover:text-white px-2 py-0.5 rounded border border-gray-700 transition-colors flex-shrink-0"
          >
            <BookOpen className="w-3 h-3 text-hud-cyan" />
            <span>Wikipedia</span>
          </button>
          {domain && (
            <span className="text-hud-cyan/75 ml-auto flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Dominio: {domain}
            </span>
          )}
        </div>

        {/* Content Viewer (Live iFrame + High-Tech Launch Card Fallback) */}
        <div className="flex-1 bg-zinc-900 relative overflow-hidden flex flex-col">
          {iframeError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-black/90">
              <div className="w-16 h-16 rounded-full border border-hud-cyan/30 flex items-center justify-center bg-hud-cyan/5 mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                <Globe className="w-8 h-8 text-hud-cyan animate-pulse" />
              </div>
              <h4 className="text-base font-bold text-hud-cyan font-mono mb-2 uppercase">
                Portal Enlazado con Éxito
              </h4>
              <p className="text-xs font-mono text-gray-400 max-w-md mb-6 leading-relaxed">
                Este sitio web ({domain}) solicita desplegarse en una ventana completa de navegación segura por políticas del servidor.
              </p>
              <button
                onClick={handleOpenExternal}
                className="flex items-center gap-2 bg-hud-cyan text-black font-mono font-bold text-sm px-6 py-3 rounded-md shadow-[0_0_18px_rgba(0,240,255,0.4)] hover:bg-hud-cyan/80 transition-all cursor-pointer uppercase"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Navegar a {domain} Ahora</span>
              </button>
            </div>
          ) : (
            <div className="w-full h-full relative flex flex-col">
              {activeUrl && activeUrl.trim() !== "" ? (
                <iframe
                  src={activeUrl}
                  title="Holographic Browser Preview"
                  className="w-full flex-1 border-none bg-white"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  onError={() => setIframeError(true)}
                />
              ) : (
                <div className="w-full flex-1 flex items-center justify-center bg-black/80 text-hud-cyan font-mono text-xs">
                  Cargando enlace holográfico...
                </div>
              )}
              
              {/* Floating Bottom Quick Navigator Bar */}
              <div className="bg-black/90 border-t border-hud-cyan/30 p-2.5 px-4 flex items-center justify-between gap-2 z-20">
                <span className="text-[10px] font-mono text-gray-400">
                  ¿El contenido no carga dentro del visor?
                </span>
                <button
                  onClick={handleOpenExternal}
                  className="flex items-center gap-1.5 bg-hud-cyan/20 border border-hud-cyan text-hud-cyan hover:bg-hud-cyan hover:text-black font-mono font-bold text-[11px] px-3 py-1 rounded transition-all cursor-pointer uppercase"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir en navegador exterior</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
