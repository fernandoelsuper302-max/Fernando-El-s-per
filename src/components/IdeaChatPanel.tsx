import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, Lightbulb, Trash2, Shield, Cpu, RefreshCw, Volume2, HelpCircle } from "lucide-react";
import { ChatMessage, PersonalityId, UserProfile } from "../types";

interface IdeaChatPanelProps {
  personalityId: PersonalityId;
  personalityName: string;
  onSpeak: (text: string) => void;
  triggerSound: (type: "click" | "scan" | "success" | "error" | "startup") => void;
  volume: number;
  onSendMessageRef?: React.MutableRefObject<((text: string) => void) | null>;
  userProfile?: UserProfile;
}

// Spark plug futuristic suggestions
const SUGGESTIONS = {
  JARVIS: [
    { title: "Reactor Arc Portable", text: "Crear un mini reactor Arc para alimentar una ciudad limpia" },
    { title: "Nanotecnología Ósea", text: "Malla de nanobots médicos para soldar fracturas en segundos" },
  ],
  FRIDAY: [
    { title: "Propulsores de Botas v3", text: "Sistemas de estabilización de empuje para vuelos estratosféricos" },
    { title: "Escudo Térmico Reentradas", text: "Campo de fuerza de plasma para reentradas atmosféricas sin desgaste" },
  ],
  KAREN: [
    { title: "Lanzador Telaraña Dual", text: "Lanzadores con fluidos de nylon conductor para hackear redes eléctricas" },
    { title: "Paracaídas Inteligente Mk2", text: "Un paracaídas de planeo silencioso integrado que detecta el viento" },
  ],
  EDITH: [
    { title: "Dron Detector de Señales", text: "Enlace satelital holográfico con drones de rastreo para zonas ciegas del radar" },
    { title: "Escáner Óptico de Gafas", text: "Lentes con sensor térmico que revela debilidades estructurales" },
  ],
};

export default function IdeaChatPanel({
  personalityId,
  personalityName,
  onSpeak,
  triggerSound,
  volume,
  onSendMessageRef,
  userProfile
}: IdeaChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const hour = new Date().getHours();
    const displayName = userProfile?.name || "Fernando";
    const displayTitle = userProfile?.title ? `${userProfile.title} ` : "";
    let salutation = `Buenas tardes, ${displayTitle}${displayName}`;
    if (hour >= 6 && hour < 12) {
      salutation = `Buenos días, ${displayTitle}${displayName}`;
    } else if (hour >= 12 && hour < 20) {
      salutation = `Buenas tardes, ${displayTitle}${displayName}`;
    } else {
      salutation = `Buenas noches, ${displayTitle}${displayName}`;
    }
    return [
      {
        id: "initial-welcome",
        sender: "ai",
        text: `${salutation}. Los servidores principales de la red Stark están en línea. Puede formularme cualquier pregunta de conocimiento general, ciencia, tecnología o vida diaria, o compartirme sus ideas e inventos. Responderé con total exactitud y adaptaré mi nivel a sus ${userProfile?.age || 20} años.`,
        timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false }),
      }
    ];
  });
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Expose the handleSendMessage helper to App parent so speech recognition results are automatically piped
  useEffect(() => {
    if (onSendMessageRef) {
      onSendMessageRef.current = handleSendMessage;
    }
    return () => {
      if (onSendMessageRef) {
        onSendMessageRef.current = null;
      }
    };
  }, [onSendMessageRef, personalityId, isLoading, userProfile]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle personality change message injection
  useEffect(() => {
    const displayName = userProfile?.name || "Fernando";
    const displayTitle = userProfile?.title ? `${userProfile.title} ` : "";
    let greeting = "";
    if (personalityId === "FRIDAY") {
      greeting = `¡Hola ${displayTitle}${displayName}! Estoy lista en este terminal de la armadura. Pregúntame lo que quieras o pásame tus ideas; responderé con total precisión y le meteré toda la potencia Stark.`;
    } else if (personalityId === "KAREN") {
      greeting = `Hola de nuevo, ${displayName}. Me alegra saludarte. Puedes hacerme cualquier pregunta que tengas o contarme tus inventos; te ayudaré con todo mi cariño y base de datos.`;
    } else if (personalityId === "EDITH") {
      greeting = `Consola táctica Stark activa para ${displayTitle}${displayName} (${userProfile?.age || 20} años). Ingrese consulta de datos o directiva técnica.`;
    } else {
      const hour = new Date().getHours();
      let salutation = `Sistemas de asistencia cognitiva holográfica encendidos, ${displayTitle}${displayName}`;
      if (hour >= 6 && hour < 12) {
        salutation = `Buenos días, ${displayTitle}${displayName}. Sistemas en línea`;
      } else if (hour >= 12 && hour < 20) {
        salutation = `Buenas tardes, ${displayTitle}${displayName}. Sistemas en línea`;
      } else {
        salutation = `Buenas noches, ${displayTitle}${displayName}. Sistemas en línea`;
      }
      greeting = `${salutation}. Puede hacerme preguntas de cualquier tema o proponerme ideas de ingeniería; le responderé con exactitud de inteligencia artificial y rigor de Industrias Stark.`;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `greet-${Date.now()}`,
        sender: "ai",
        text: greeting,
        timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false }),
      }
    ]);
  }, [personalityId, userProfile?.name, userProfile?.age, userProfile?.title]);

  // Song matching algorithm to open song direct links in YouTube
  const matchSongRequest = (text: string) => {
    const normalized = text.toLowerCase().trim();
    const prefixes = [
      "reproducir la canción",
      "reproducir la cancion",
      "reproducir cancion",
      "reproducir canción",
      "ponme la cancion de",
      "ponme la canción de",
      "ponme la cancion",
      "ponme la canción",
      "pon la cancion de",
      "pon la canción de",
      "pon la cancion",
      "pon la canción",
      "poner la cancion",
      "poner la canción",
      "busca en youtube la cancion de",
      "busca en youtube la cancion",
      "busca la cancion de",
      "busca la cancion",
      "busca en youtube",
      "escuchar cancion de",
      "escuchar cancion",
      "reproduce la cancion de",
      "reproduce la cancion",
      "reproduce cancion de",
      "reproduce cancion",
      "poner cancion de",
      "poner cancion",
      "cancion de",
      "canción de",
      "reproduce",
      "reproducir",
      "ponme",
      "pon "
    ];

    for (const prefix of prefixes) {
      if (normalized.startsWith(prefix)) {
        const query = text.slice(prefix.length).trim();
        if (query) return query;
      }
    }

    if (normalized.includes("canción") || normalized.includes("cancion") || normalized.includes("youtube")) {
      const clean = normalized
        .replace("en youtube", "")
        .replace("la cancion de", "")
        .replace("la canción de", "")
        .replace("la cancion", "")
        .replace("la canción", "")
        .replace("de youtube", "")
        .replace("busca", "")
        .replace("reproduce", "")
        .trim();
      if (clean.length > 2) return clean;
    }

    return null;
  };

  // YouTuber/Channel matching algorithm
  const matchChannelRequest = (text: string) => {
    const normalized = text.toLowerCase().trim();
    
    // Check if user is asking for "todos los canales" or general list
    if (
      normalized === "todos los canales" || 
      normalized === "todos los canales de youtube" || 
      normalized.includes("todos los canales de youtube") ||
      normalized === "canales de youtube" ||
      normalized === "todos los youtubers"
    ) {
      return "Todos los Canales";
    }

    if (normalized.startsWith("@") && normalized.length > 2) {
      return text.trim();
    }
    
    // Famous creator direct matching lists to avoid collision with generic search phrases
    const popularCreators = [
      "fernanfloo",
      "fernanflo",
      "fernan",
      "elrubius",
      "rubius",
      "rubius z",
      "rubiusz",
      "auronplay",
      "auron",
      "mrbeast",
      "mr beast",
      "ibai",
      "vegetta777",
      "vegetta",
      "willyrex",
      "thegrefg",
      "grefg",
      "fedevigevani",
      "fede vigevani",
      "fede",
      "salvatretzzo",
      "luisito comunica",
      "pewdiepie",
      "mikecrack",
      "el mariana",
      "elmariana",
      "spreen",
      "quackity",
      "missasinfonia",
      "fedelobo",
      "german garmendia",
      "juega german",
      "juegagerman",
      "holasoygerman",
      "wismichu",
      "dross",
      "drossrotzank",
      "triline",
      "bizarrap",
      "bzrp",
      "coscu",
      "lulu99",
      "yolo aventuras",
      "yolo",
      "badabun",
      "doctops",
      "tiktak draw",
      "arigameplays",
      "juansguarnizo",
      "juan guarnizo",
      "rivers",
      "samy rivers",
      "rivers_gg",
      "xokas",
      "elxokas",
      "illojuan",
      "alexby11",
      "alexby",
      "staxx",
      "bytarifa",
      "shooter",
      "berth oh",
      "luisito",
      "dylantero",
      "domelipa",
      "iamferv",
      "jashlem",
      "kimberly loaiza",
      "jd pantoja",
      "lyna",
      "invictor",
      "raptorgamer",
      "trollino",
      "eltrollino",
      "sparta356",
      "timba vk",
      "riusplay",
      "acenix"
    ];

    if (popularCreators.includes(normalized)) {
      // Find casing from original text
      const idx = text.toLowerCase().indexOf(normalized);
      if (idx !== -1) {
        return text.slice(idx, idx + normalized.length).trim();
      }
      return text.trim();
    }

    const prefixes = [
      "canal de youtube de",
      "canal de youtube",
      "canal de",
      "canal",
      "ir al canal de",
      "ir al canal",
      "abre el canal de",
      "abre el canal",
      "abrir el canal de",
      "abrir canal de",
      "llévame al canal de",
      "llevame al canal de",
      "llévame al canal",
      "llevame al canal",
      "buscar canal de",
      "busca el canal de",
      "busca canal de",
      "ir a youtube de",
      "ir al youtube de",
      "cuenta de youtube de",
      "cuenta de",
      "perfil de",
      "youtuber",
      "youtube de",
      "youtube",
      "abre el de",
      "abre el",
      "ir a",
      "ir al",
      "llevale al canal de",
      "llevame a",
      "llévame a"
    ];

    for (const prefix of prefixes) {
      if (normalized.startsWith(prefix)) {
        const query = text.slice(prefix.length).trim();
        if (query) return query;
      }
    }

    if (normalized.includes("canal") || normalized.includes("youtuber") || normalized.includes("youtube")) {
      const clean = normalized
        .replace("canal de youtube de", "")
        .replace("canal de youtube", "")
        .replace("canal de", "")
        .replace("canal", "")
        .replace("ir al de", "")
        .replace("llévame al de", "")
        .replace("llevame al de", "")
        .replace("youtuber", "")
        .replace("youtube", "")
        .replace("abre", "")
        .replace("abrir", "")
        .replace("busca", "")
        .replace("buscar", "")
        .trim();
      if (clean.length > 2) {
        const idx = text.toLowerCase().indexOf(clean);
        if (idx !== -1) {
          return text.slice(idx, idx + clean.length).trim();
        }
        return clean;
      }
    }

    // Dynamic extraction: Any 1 to 3 words that do not match default conversational chat keywords
    const excludedConversational = new Set([
      "hola", "buenas", "buenos", "buenos dias", "buenas tardes", "buenas noches", "cómo", "cómo estás", "como estas", "que haces", "qué haces",
      "ayuda", "help", "si", "sí", "no", "gracias", "ok", "okay", "vale", "entendido", "de acuerdo", "bien", "mal", "mas o menos",
      "stark", "jarvis", "friday", "karen", "edith", "tony", "iron man", "ironman", "vengadores", "avengers", "casa", "bunker",
      "luces", "ventilador", "tele", "television", "pantalla", "temperatura", "clima", "seguridad", "camaras", "puerta", "cerradura",
      "musica", "cancion", "reproducir", "reproduce", "pon", "poner", "escuchar", "ideas", "idea", "mejorar", "crear", "analizar", "puedes",
      "quiero", "ver", "cualquier", "nombre", "la", "el", "los", "las", "un", "una", "unos", "unas"
    ]);

    const words = normalized.split(/\s+/);
    if (words.length <= 3 && words.length > 0) {
      const allConversational = words.every(w => {
        const cleanW = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
        return excludedConversational.has(cleanW);
      });
      if (!allConversational) {
        if (/[a-zA-Z]/g.test(normalized)) {
          return text.trim();
        }
      }
    }

    return null;
  };

  const getCreatorYoutubeUrl = (creator: string) => {
    const lower = creator.toLowerCase().trim();
    
    if (lower === "todos los canales" || lower === "todos los canales de youtube" || lower.includes("todos los canales")) {
      return "https://www.youtube.com/feed/channels";
    }

    const handleMap: Record<string, string> = {
      "fernanfloo": "@Fernanfloo",
      "fernanflo": "@Fernanfloo",
      "fernan": "@Fernanfloo",
      "elrubius": "@elrubius",
      "rubius": "@elrubius",
      "rubius z": "@RubiusZ",
      "rubiusz": "@RubiusZ",
      "auronplay": "@Auron",
      "auron": "@Auron",
      "mrbeast": "@MrBeast",
      "mr beast": "@MrBeast",
      "ibai": "@ibai",
      "vegetta777": "@vegetta777",
      "vegetta": "@vegetta777",
      "willyrex": "@Willyrex",
      "thegrefg": "@TheGrefg",
      "grefg": "@TheGrefg",
      "fedevigevani": "@FedeVigevani",
      "fede vigevani": "@FedeVigevani",
      "fede": "@FedeVigevani",
      "salvatretzzo": "@salvatretzzo",
      "luisito comunica": "@luisito_comunica",
      "luisito": "@luisito_comunica",
      "pewdiepie": "@pewdiepie",
      "mikecrack": "@Mikecrack",
      "mike": "@Mikecrack",
      "el mariana": "@ElMariana",
      "elmariana": "@ElMariana",
      "mariana": "@ElMariana",
      "spreen": "@SpreenDMC",
      "quackity": "@Quackity",
      "missasinfonia": "@MissaSinfonia",
      "missa": "@MissaSinfonia",
      "fedelobo": "@ElFedelobo",
      "german garmendia": "@JuegaGerman",
      "juega german": "@JuegaGerman",
      "juegagerman": "@JuegaGerman",
      "holasoygerman": "@HolaSoyGerman",
      "wismichu": "@wismichu",
      "dross": "@DrossRotzank",
      "drossrotzank": "@DrossRotzank",
      "triline": "@Tri-line",
      "bizarrap": "@Bizarrap",
      "bzrp": "@Bizarrap",
      "coscu": "@Coscu",
      "lulu99": "@Lulugo",
      "yolo aventuras": "@YOLOAVENTURAS",
      "yolo": "@YOLOAVENTURAS",
      "badabun": "@BadabunOficial",
      "doctops": "@DocTops",
      "tiktak draw": "@TikTakDraw",
      "arigameplays": "@arigameplays",
      "juansguarnizo": "@juansguarnizo",
      "juan guarnizo": "@juansguarnizo",
      "rivers": "@rivers_gg",
      "samy rivers": "@rivers_gg",
      "rivers_gg": "@rivers_gg",
      "xokas": "@ElXokas",
      "elxokas": "@ElXokas",
      "illojuan": "@IlloJuan",
      "alexby11": "@AlexBY11",
      "alexby": "@AlexBY11",
      "staxx": "@sTaXxCraft",
      "bytarifa": "@byTarifa",
      "shooter": "@TheShooterCoc",
      "berth oh": "@BerthOh",
      "dylantero": "@DylanteroSinImaginacion",
      "domelipa": "@domelipa",
      "iamferv": "@iamferv",
      "jashlem": "@jashlem",
      "kimberly loaiza": "@kimberly.loaiza",
      "jd pantoja": "@jdpantoja",
      "lyna": "@Lyna",
      "invictor": "@invictor",
      "raptorgamer": "@RaptorGamer",
      "trollino": "@ElTrollino",
      "eltrollino": "@ElTrollino",
      "sparta356": "@Sparta356",
      "timba vk": "@TimbaVk",
      "riusplay": "@RiusPlay",
      "acenix": "@Acenix"
    };

    if (handleMap[lower]) {
      return `https://www.youtube.com/${handleMap[lower]}`;
    }

    if (lower.startsWith("@")) {
      return `https://www.youtube.com/${creator.trim()}`;
    }

    // Force channel type filtering in YouTube search outputs (sp=EgIQAg%253D%253D)
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(creator)}&sp=EgIQAg%253D%253D`;
  };

  const getChannelResponse = (creator: string, personality: PersonalityId) => {
    const isAll = creator.toLowerCase().includes("todos los canales");
    switch (personality) {
      case "JARVIS":
        return isAll 
          ? "Sí, Señor. He desplegado el localizador perimetral para todos los canales de YouTube. Abriendo el feed de canales en su dispositivo secundario."
          : `Sí, Señor. He localizado la señal satelital para el canal de "${creator}".\nReenviando el enlace cuántico de YouTube de inmediato a su visualizador secundario.`;
      case "FRIDAY":
        return isAll
          ? "¡Listo Jefe! Abriendo la consola de suscripciones de YouTube al instante. ¡Eche un vistazo!"
          : `¡A la orden, Jefe! Enlace encontrado para "${creator}".\n¡Enlace del canal de YouTube abierto en su pantalla principal! Que lo disfrute.`;
      case "KAREN":
        return isAll
          ? "¡Qué increíble! Vamos a ver todos los canales de YouTube juntos. Abriendo la ventana de canales para ti, joven héroe."
          : `¡Me encanta "${creator}"! Qué divertido es su canal. Estoy abriendo el enlace directo en YouTube para ti.\n¡Disfruta el video, joven héroe!`;
      case "EDITH":
        return isAll
          ? "Visualizador global de canales mapeado. Abriendo listado multimedia perimetral en YouTube."
          : `Localizando coordenadas de transmisión para el canal de "${creator}".\nEnlace de canal de YouTube autorizado y eyectado con éxito.`;
      default:
        return isAll
          ? "Sintonizando la feed de canales oficiales en YouTube."
          : `Enlace del canal de "${creator}" sintonizado con éxito en los servidores de YouTube.`;
    }
  };

  const getSongResponse = (song: string, personality: PersonalityId) => {
    switch (personality) {
      case "JARVIS":
        return `Muy bien, Señor. He sintonizado la frecuencia acústica de Stark Industries y localicé la pista "${song}".\nAbriendo el enlace satelital de YouTube en su pantalla secundaria de inmediato para reproducirla.`;
      case "FRIDAY":
        return `¡Entendido, Jefe! Encendiendo el reproductor sónico para la pista "${song}".\n¡Enlace de YouTube cargado! Ruede la música.`;
      case "KAREN":
        return `¡Qué bonita elección! Estoy buscando la canción "${song}" en YouTube para ti.\nHe abierto la ventana para que puedas disfrutarla de inmediato, joven héroe.`;
      case "EDITH":
        return `Búsqueda sónica autorizada: "${song}".\nEnlace multimedia de YouTube proyectado con éxito en su terminal holográfico perimetral.`;
      default:
        return `Búsqueda musical iniciada para: "${song}". Cargando enlace inteligente de YouTube...`;
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    triggerSound("click");
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);
    triggerSound("scan");

    // Intercept YouTuber Channel Request
    const channelQuery = matchChannelRequest(textToSend);
    if (channelQuery) {
      setTimeout(() => {
        try {
          const ytUrl = getCreatorYoutubeUrl(channelQuery);
          window.open(ytUrl, "_blank");
          
          triggerSound("success");
          const aiResponseText = getChannelResponse(channelQuery, personalityId);

          const aiMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: aiResponseText,
            timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false }),
            isChannelRequest: true,
            youtubeUrl: ytUrl,
            channelName: channelQuery
          };

          setMessages((prev) => [...prev, aiMsg]);
          onSpeak(aiResponseText);
        } catch (e) {
          console.error("Popup window block caught:", e);
        } finally {
          setIsLoading(false);
        }
      }, 600);
      return;
    }

    // Intercept Song Request
    const songQuery = matchSongRequest(textToSend);
    if (songQuery) {
      setTimeout(() => {
        try {
          const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songQuery)}`;
          // Try to open YouTube in new tab directly
          window.open(ytUrl, "_blank");
          
          triggerSound("success");
          const aiResponseText = getSongResponse(songQuery, personalityId);

          const aiMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: aiResponseText,
            timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false }),
            isSongRequest: true,
            youtubeUrl: ytUrl,
            songTitle: songQuery
          };

          setMessages((prev) => [...prev, aiMsg]);
          onSpeak(aiResponseText);
        } catch (e) {
          console.error("Popup window block caught:", e);
        } finally {
          setIsLoading(false);
        }
      }, 600);
      return;
    }

    try {
      const response = await fetch("/api/improve-idea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: textToSend,
          personality: personalityId,
          userName: userProfile?.name,
          userAge: userProfile?.age,
          userTitle: userProfile?.title,
        }),
      });

      if (!response.ok) {
        let errMessage = "Error en la conexión del servidor de ideas.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMessage = errData.error;
          }
        } catch (_) {}
        throw new Error(errMessage);
      }

      const data = await response.json();
      triggerSound("success");

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.result,
        timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false }),
        isImprovedIdea: true,
      };

      setMessages((prev) => [...prev, aiMsg]);
      onSpeak(data.result);

    } catch (err: any) {
      console.error("Failed to enhance idea:", err);
      triggerSound("error");
      
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: `Lo lamento, se ha detectado una interrupción en el enlace cuántico: ${err.message || "Fallo en los servidores neurálgicos de Stark"}. Por favor intente de nuevo.`,
          timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    triggerSound("click");
    setMessages([
      {
        id: "cleared-welc",
        sender: "ai",
        text: "Matriz creativa reiniciada. ¿Qué otra idea mejoramos hoy?",
        timestamp: new Date().toLocaleTimeString("es-ES", { hour12: false }),
      }
    ]);
  };

  // Glow colors depending on current personality style
  const getThemeColors = () => {
    switch (personalityId) {
      case "FRIDAY":
        return {
          bg: "bg-hud-orange/5",
          border: "border-hud-orange/30 focus:border-hud-orange",
          text: "text-hud-orange",
          bubbleUser: "bg-hud-orange/10 border-hud-orange/20 text-orange-200",
          bubbleAI: "bg-black/60 border-hud-orange/30 text-gray-200 shadow-[0_0_8px_rgba(255,153,0,0.1)]",
          accentGlow: "rgba(255,153,0,0.3)"
        };
      case "KAREN":
        return {
          bg: "bg-purple-500/5",
          border: "border-purple-500/30 focus:border-purple-500",
          text: "text-purple-400",
          bubbleUser: "bg-purple-500/10 border-purple-500/20 text-purple-200",
          bubbleAI: "bg-black/60 border-purple-500/30 text-gray-200 shadow-[0_0_8px_rgba(168,85,247,0.1)]",
          accentGlow: "rgba(168,85,247,0.3)"
        };
      case "EDITH":
        return {
          bg: "bg-emerald-500/5",
          border: "border-emerald-500/30 focus:border-emerald-500",
          text: "text-emerald-400",
          bubbleUser: "bg-emerald-500/10 border-emerald-500/20 text-emerald-200",
          bubbleAI: "bg-black/60 border-emerald-500/30 text-gray-200 shadow-[0_0_8px_rgba(16,185,129,0.1)]",
          accentGlow: "rgba(16,185,129,0.3)"
        };
      default:
        return {
          bg: "bg-hud-cyan/5",
          border: "border-hud-cyan/30 focus:border-hud-cyan",
          text: "text-hud-cyan",
          bubbleUser: "bg-hud-cyan/10 border-hud-cyan/20 text-cyan-200",
          bubbleAI: "bg-black/60 border-hud-cyan/30 text-gray-200 shadow-[0_0_8px_rgba(0,240,255,0.1)]",
          accentGlow: "rgba(0,240,255,0.3)"
        };
    }
  };

  const themeColors = getThemeColors();
  const suggestions = SUGGESTIONS[personalityId] || SUGGESTIONS.JARVIS;

  return (
    <div id="ideas-chat-panel" className="hud-panel rounded p-4 relative flex flex-col h-[500px]">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-hud-cyan/15 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className={`w-4 h-4 ${themeColors.text} animate-pulse`} />
          <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white">
            MATRIZ COGNITIVA // ASISTENCIA INTELIGENTE & PREGUNTAS
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-hud-cyan/70 bg-hud-cyan/10 px-2 py-0.5 rounded border border-hud-cyan/20">
            {userProfile?.name ? `PILOTO: ${userProfile.name.toUpperCase()} (${userProfile.age || 20} AÑOS)` : "PILOTO STARK"}
          </span>
          <button
            onClick={clearChat}
            className="text-[10px] font-mono text-gray-500 hover:text-hud-red rounded px-1.5 py-0.5 border border-gray-800 hover:border-hud-red/40 transition-colors uppercase cursor-pointer"
            title="Borrar memoria local"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Suggestion Spark Chips */}
      <div className="mb-3.5">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 uppercase mb-1.5">
          <Lightbulb className={`w-3.5 h-3.5 ${themeColors.text}`} />
          <span>Consultas sugeridas (Preguntas de conocimiento o ideas Stark):</span>
        </div>
        <div className="flex gap-2 shrink-0 overflow-x-auto pb-1.5 select-none hud-scrollbar">
          <button
            onClick={() => handleSendMessage("¿Cómo funciona el reactor Arc de Tony Stark?")}
            disabled={isLoading}
            className="text-[9px] font-mono border border-hud-cyan/15 hover:border-hud-cyan/40 bg-black/40 hover:bg-black/80 px-2.5 py-1.5 rounded text-gray-300 hover:text-hud-cyan text-left flex flex-col min-w-[140px] max-w-[190px] cursor-pointer transition-all shrink-0 uppercase"
          >
            <span className={`font-bold transition-colors ${themeColors.text}`}>¿Reactor Arc?</span>
            <span className="text-[7.5px] text-gray-400 truncate mt-0.5">Explicar física y funcionamiento</span>
          </button>
          <button
            onClick={() => handleSendMessage("¿Por qué el cielo es azul?")}
            disabled={isLoading}
            className="text-[9px] font-mono border border-hud-cyan/15 hover:border-hud-cyan/40 bg-black/40 hover:bg-black/80 px-2.5 py-1.5 rounded text-gray-300 hover:text-hud-cyan text-left flex flex-col min-w-[140px] max-w-[190px] cursor-pointer transition-all shrink-0 uppercase"
          >
            <span className={`font-bold transition-colors ${themeColors.text}`}>¿Cielo azul?</span>
            <span className="text-[7.5px] text-gray-400 truncate mt-0.5">Dispersión de Rayleigh</span>
          </button>
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(sug.text)}
              disabled={isLoading}
              className="text-[9px] font-mono border border-hud-cyan/15 hover:border-hud-cyan/40 bg-black/40 hover:bg-black/80 px-2.5 py-1.5 rounded text-gray-300 hover:text-hud-cyan text-left flex flex-col min-w-[140px] max-w-[190px] cursor-pointer transition-all shrink-0 uppercase"
            >
              <span className={`font-bold transition-colors ${themeColors.text}`}>{sug.title}</span>
              <span className="text-[7.5px] text-gray-400 truncate mt-0.5">{sug.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream viewport */}
      <div className="flex-1 overflow-y-auto mb-3.5 pr-1.5 space-y-3 hud-scrollbar bg-black/30 border border-hud-cyan/5 p-3 rounded">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[90%] ${
              msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            }`}
          >
            {/* Timestamp & Label */}
            <div className="flex items-center gap-1.5 mb-1 text-[8px] font-mono text-gray-500 uppercase">
              <span>{msg.sender === "user" ? "TU PROPUESTA" : personalityName}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Bubble body */}
            <div
              className={`p-2.5 rounded text-xs leading-relaxed font-mono whitespace-pre-line relative group ${
                msg.sender === "user" ? themeColors.bubbleUser : themeColors.bubbleAI
              }`}
            >
              {msg.isImprovedIdea && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                  <span className={`text-[7px] font-mono font-extrabold px-1.5 rounded-sm bg-gradient-to-r from-hud-cyan to-blue-500 text-black animate-pulse`}>
                    PRO-STARK UPGRADE
                  </span>
                </div>
              )}
              {msg.text}

              {/* YouTube Link Launcher Interactive Block */}
              {msg.isSongRequest && msg.youtubeUrl && (
                <div className="mt-3 p-3 bg-red-600/15 border border-red-500/30 rounded flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_12px_rgba(239,68,68,0.15)]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-600 rounded-full text-white animate-pulse shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.948.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.948 24 12 24 12s0-3.948-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] uppercase font-mono font-bold text-white tracking-wider flex items-center gap-1 select-none">
                        <span>Enlace de YouTube</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      </div>
                      <div className="text-[8px] font-mono text-gray-400 mt-0.5 truncate max-w-[170px] xs:max-w-xs">
                        Pista: <b className="text-red-400">"{msg.songTitle}"</b>
                      </div>
                    </div>
                  </div>
                  
                  <a
                    href={msg.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerSound("click")}
                    className="w-full sm:w-auto text-center px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-[8.5px] uppercase rounded border border-transparent hover:shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>▶️ Reproducir Canción</span>
                  </a>
                </div>
              )}

              {/* YouTube Creator Channel Interactive Block */}
              {msg.isChannelRequest && msg.youtubeUrl && (
                <div className="mt-3 p-3 bg-red-600/15 border border-red-500/30 rounded flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_12px_rgba(239,68,68,0.15)]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-600 rounded-full text-white animate-pulse shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.948.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.948 24 12 24 12s0-3.948-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] uppercase font-mono font-bold text-white tracking-wider flex items-center gap-1 select-none">
                        <span>Canal de YouTube</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      </div>
                      <div className="text-[8px] font-mono text-gray-400 mt-0.5 truncate max-w-[170px] xs:max-w-xs">
                        Creador: <b className="text-red-400">"{msg.channelName}"</b>
                      </div>
                    </div>
                  </div>
                  
                  <a
                    href={msg.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerSound("click")}
                    className="w-full sm:w-auto text-center px-4 py-1.5 bg-red-650 hover:bg-red-550 text-white font-mono font-bold text-[8.5px] uppercase rounded border border-transparent hover:shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>📺 Abrir Canal Oficial</span>
                  </a>
                </div>
              )}

              {/* Speak reply button */}
              {msg.sender === "ai" && (
                <div className="mt-2 pt-1 border-t border-hud-cyan/10 flex justify-end">
                  <button
                    onClick={() => {
                      triggerSound("click");
                      onSpeak(msg.text);
                    }}
                    className="opacity-40 group-hover:opacity-100 flex items-center gap-1 text-[8px] font-mono text-hud-cyan uppercase hover:underline transition-opacity cursor-pointer"
                    title="Reproducir de nuevo"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Halar Altavoz</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-[10px] font-mono text-hud-orange animate-pulse p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>ALINEANDO COMPUTACIÓN CUÁNTICA STARK... OPTIMIZANDO PLANOS...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input controls form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="flex items-center gap-2 mt-auto"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escriba cualquier pregunta, idea o duda (Ej: '¿Por qué brilla el sol?', '¿Cómo hacer un dron?')..."
          disabled={isLoading}
          maxLength={400}
          className={`flex-1 bg-black/60 text-white border text-xs font-mono rounded px-3 py-2.5 outline-none transition-all ${themeColors.border}`}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className={`px-4 py-2.5 font-mono text-xs font-bold rounded cursor-pointer transition-all flex items-center gap-1.5 uppercase ${
            inputText.trim() && !isLoading
              ? "bg-hud-cyan text-black hover:bg-hud-cyan/80 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Enviar</span>
        </button>
      </form>
    </div>
  );
}
