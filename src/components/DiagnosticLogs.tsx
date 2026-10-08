import React, { useEffect, useRef } from "react";

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "input" | "output";
}

interface DiagnosticLogsProps {
  logs: LogEntry[];
  onClear: () => void;
}

export default function DiagnosticLogs({ logs, onClear }: DiagnosticLogsProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smooth scroll to bottom of diagnostics on update
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-hud-red font-bold";
      case "warning":
        return "text-hud-orange";
      case "output":
        return "text-hud-cyan font-bold";
      case "input":
        return "text-magenta-400 font-mono italic";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div 
      id="diagnostic-logs-module" 
      className="flex flex-col h-full bg-black/60 border border-hud-cyan/15 rounded-sm p-3 relative overflow-hidden"
    >
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-hud-cyan" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-hud-cyan" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-hud-cyan" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-hud-cyan" />

      {/* Terminal Title */}
      <div className="flex items-center justify-between border-b border-hud-cyan/10 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-hud-cyan animate-pulse" />
          <h4 className="text-xs font-mono font-medium tracking-widest text-hud-cyan uppercase">
            REGISTRO DE SISTEMA // CONSOLA COGNITIVA
          </h4>
        </div>
        <button 
          onClick={onClear}
          className="text-[9px] font-mono border border-hud-cyan/25 hover:border-hud-cyan/60 hover:bg-hud-cyan/10 text-hud-cyan px-2 py-0.5 rounded transition-all transition-duration-150 uppercase bg-transparent"
        >
          Borrar log
        </button>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto pr-1 text-[10px] font-mono space-y-1.5 hud-scrollbar max-h-[160px] md:max-h-none">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-1 p-1 hover:bg-hud-cyan/5 rounded transition-all">
            <span className="text-hud-cyan/40 select-none">[{log.timestamp}]</span>
            <span className={`${getTypeStyle(log.type)} flex-1 whitespace-pre-wrap leading-relaxed`}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Grid footer watermark */}
      <div className="mt-2 pt-1 border-t border-hud-cyan/5 flex items-center justify-between text-[9px] font-mono text-gray-500">
        <span>CORE.DIAG.STREAM: ENABLED</span>
        <span>BUFFER OK // STARK-LINK CONECTADO</span>
      </div>
    </div>
  );
}
