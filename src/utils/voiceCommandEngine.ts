import React from "react";
import { SpeechConfig, PersonalityId } from "../types";

export interface SmartHomeState {
  tv: { on: boolean; volume: number; channel: string };
  setTv: React.Dispatch<React.SetStateAction<{ on: boolean; volume: number; channel: string }>>;
  fan: { on: boolean; speed: "Bajo" | "Medio" | "Turbo" };
  setFan: React.Dispatch<React.SetStateAction<{ on: boolean; speed: "Bajo" | "Medio" | "Turbo" }>>;
  lights: { on: boolean; color: string; brightness: number };
  setLights: React.Dispatch<React.SetStateAction<{ on: boolean; color: string; brightness: number }>>;
  shieldDoor: { locked: boolean };
  setShieldDoor: React.Dispatch<React.SetStateAction<{ locked: boolean }>>;
  hasPermission: boolean;
  setHasPermission: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface VoiceCommandContext {
  personalityId: PersonalityId;
  personalityName: string;
  activeMainTab: "visor" | "chat" | "pc" | "usb" | "home";
  setActiveMainTab: (tab: "visor" | "chat" | "pc" | "usb" | "home") => void;
  openDetectedWebsite: (url: string, title: string) => void;
  openEmergencyModal: () => void;
  triggerScan: () => void;
  triggerSound: (type: "startup" | "scan" | "success" | "error" | "abort" | "click" | "alarm") => void;
  speak: (text: string) => void;
  addLog: (msg: string, type: "info" | "success" | "warning" | "error") => void;
  speechConfig: SpeechConfig;
  setSpeechConfig: React.Dispatch<React.SetStateAction<SpeechConfig>>;
  filter: "normal" | "night" | "thermal" | "stark" | "matrix" | "grid";
  setFilter: (f: "normal" | "night" | "thermal" | "stark" | "matrix" | "grid") => void;
  autoScanContinuous: boolean;
  setAutoScanContinuous: (v: boolean) => void;
  isSignLanguageMode: boolean;
  setIsSignLanguageMode: (v: boolean) => void;
  clearHistory: () => void;
  smartHome: SmartHomeState;
  sendMessageToChat: (text: string) => void;
  activeScanLink?: string;
  activeScanTitle?: string;
  isMiniWidgetOpen?: boolean;
  setIsMiniWidgetOpen?: (v: boolean) => void;
  openPilotModal?: () => void;
  openDownloadModal?: () => void;
  onPopOutDesktop?: () => void;
}

// Generate personality-aligned voice speech confirmations
function getSpokenReply(
  pers: PersonalityId,
  jarvisReply: string,
  fridayReply: string,
  karenReply: string,
  edithReply: string
): string {
  if (pers === "FRIDAY") return fridayReply;
  if (pers === "KAREN") return karenReply;
  if (pers === "EDITH") return edithReply;
  return jarvisReply;
}

/**
 * Universal Voice Command & Navigation Parser
 * Returns true if an explicit command was identified and executed, false otherwise.
 */
export function executeVoiceCommand(
  rawTranscript: string,
  ctx: VoiceCommandContext
): boolean {
  const text = rawTranscript.trim();
  if (!text) return false;

  const lower = text.toLowerCase();
  const pers = ctx.personalityId;

  // ----------------------------------------------------
  // 1. WAKE WORD / GREETINGS
  // ----------------------------------------------------
  const currentPersName = (ctx.personalityId || "JARVIS").toLowerCase();
  const isWakeWord =
    lower === currentPersName ||
    lower === `hola ${currentPersName}` ||
    lower === `oye ${currentPersName}` ||
    lower === `hey ${currentPersName}` ||
    lower === `despierta ${currentPersName}` ||
    lower === "hola" ||
    lower === "despierta" ||
    lower === "estás ahí" ||
    lower === "estas ahi";

  if (isWakeWord) {
    ctx.triggerSound("startup");
    const reply = getSpokenReply(
      pers,
      "Sí, Señor. Estoy aquí sintonizado y listo para obedecer cualquier orden.",
      "¡Dígame, Jefe! Mis transistores están al cien por cien. ¿Qué orden ejecutamos hoy?",
      "¡Hola, joven héroe! Qué alegría escucharte. Dime qué necesitas y lo haré de inmediato.",
      "Sistemas tácticos nominales en línea. En espera de directiva militar."
    );
    ctx.addLog(`[WAKE-WORD] Invocación de nombre: [${ctx.personalityName}]`, "success");
    ctx.speak(reply);
    return true;
  }

  // ----------------------------------------------------
  // 2. EMERGENCY / SOS / ALERTA ROJA
  // ----------------------------------------------------
  const isEmergency =
    lower.includes("emergencia") ||
    lower.includes("alerta roja") ||
    lower.includes("código rojo") ||
    lower.includes("codigo rojo") ||
    lower.includes("protocolo de emergencia") ||
    lower.includes("modo emergencia") ||
    lower.includes("ventana de emergencia") ||
    lower.includes("auxilio") ||
    lower.includes("socorro") ||
    lower.includes("estoy en peligro") ||
    lower.includes("peligro") ||
    lower.includes("ayuda médica") ||
    lower.includes("ayuda medica") ||
    lower.includes("intruso") ||
    lower.includes("fuego");

  if (isEmergency) {
    ctx.triggerSound("alarm");
    ctx.addLog("🚨 [EMERGENCIA] Protocolo de auxilio abierto por voz.", "error");
    ctx.openEmergencyModal();
    return true;
  }

  // ----------------------------------------------------
  // 3. UNIVERSAL WEB DESTINATIONS & NAVIGATION ("Llévame a...", "Abre...")
  // ----------------------------------------------------
  const isNavRequest =
    lower.startsWith("llévame a") ||
    lower.startsWith("llevame a") ||
    lower.startsWith("abre ") ||
    lower.startsWith("abrir ") ||
    lower.startsWith("ve a ") ||
    lower.startsWith("ir a ") ||
    lower.startsWith("navega a ") ||
    lower.startsWith("mostrar ") ||
    lower.startsWith("muéstrame ") ||
    lower.startsWith("muestrame ") ||
    lower.startsWith("quiero ir a ") ||
    lower.startsWith("entrar a ") ||
    lower.startsWith("entra a ") ||
    lower.startsWith("pon ");

  // --- SPECIFIC POPULAR WEBSITES ---

  // YOUTUBE
  if (lower.includes("youtube") || lower.includes("you tube")) {
    ctx.triggerSound("success");
    let query = "";
    // Check if user specified a search e.g. "llévame a youtube a ver iron man" or "abre youtube canciones"
    const searchMatch = lower.match(/youtube (?:a ver|para ver|de|con|buscar)?\s*(.+)/);
    if (searchMatch && searchMatch[1] && searchMatch[1].trim().length > 1) {
      query = searchMatch[1].trim();
    }

    const url = query
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
      : "https://www.youtube.com";
    const title = query ? `YouTube - ${query}` : "YouTube";

    const reply = getSpokenReply(
      pers,
      query ? `Señor, abriendo YouTube con la búsqueda de ${query}.` : "Entendido Señor, abriendo YouTube de inmediato.",
      query ? `¡YouTube a la orden con ${query}, Jefe!` : "¡Abriendo YouTube de inmediato, Jefe!",
      query ? `¡Qué bien! Abriendo YouTube para ver ${query}, joven héroe.` : "¡Abriendo YouTube para ti!",
      `Navegando al portal de video YouTube: ${query || "Inicio"}.`
    );

    ctx.addLog(`Navegación Web: Abriendo YouTube (${url})`, "success");
    ctx.speak(reply);
    ctx.openDetectedWebsite(url, title);
    return true;
  }

  // GOOGLE SEARCH / GOOGLE
  if (lower === "abre google" || lower === "llévame a google" || lower === "llevame a google" || lower.includes("buscador google")) {
    ctx.triggerSound("success");
    const url = "https://www.google.com";
    const reply = getSpokenReply(
      pers,
      "Abriendo el motor de búsqueda Google, Señor.",
      "¡Google en pantalla, Jefe!",
      "¡Abriendo Google para ti!",
      "Navegando a Google Search Engine."
    );
    ctx.addLog(`Navegación Web: Abriendo Google`, "success");
    ctx.speak(reply);
    ctx.openDetectedWebsite(url, "Google");
    return true;
  }

  // WIKIPEDIA
  if (lower.includes("wikipedia")) {
    ctx.triggerSound("success");
    const topicMatch = lower.match(/wikipedia (?:de|sobre|del|la)?\s*(.+)/);
    const topic = topicMatch && topicMatch[1] ? topicMatch[1].trim() : "";
    const url = topic
      ? `https://es.wikipedia.org/w/index.php?search=${encodeURIComponent(topic)}`
      : "https://es.wikipedia.org";
    const title = topic ? `Wikipedia: ${topic}` : "Wikipedia";

    const reply = getSpokenReply(
      pers,
      topic ? `Consultando Wikipedia sobre ${topic}, Señor.` : "Accediendo a la enciclopedia Wikipedia, Señor.",
      `¡Wikipedia en línea, Jefe!`,
      `¡Buscando en la enciclopedia Wikipedia!`,
      `Accediendo a la base de datos libre de Wikipedia.`
    );
    ctx.addLog(`Navegación Web: Abriendo Wikipedia (${url})`, "success");
    ctx.speak(reply);
    ctx.openDetectedWebsite(url, title);
    return true;
  }

  // GOOGLE MAPS / MAPAS
  if (lower.includes("google maps") || lower.includes("mapas") || lower.includes("el mapa") || lower.includes("llévame al mapa") || lower.includes("llevame al mapa")) {
    ctx.triggerSound("success");
    const placeMatch = lower.match(/(?:mapas?|google maps)\s*(?:de|en|para)?\s*(.+)/);
    const place = placeMatch && placeMatch[1] ? placeMatch[1].trim() : "";
    const url = place
      ? `https://maps.google.com/?q=${encodeURIComponent(place)}`
      : "https://maps.google.com";

    const reply = getSpokenReply(
      pers,
      place ? `Calculando ruta cartográfica para ${place}, Señor.` : "Desplegando el sistema de mapas y geolocalización, Señor.",
      `¡Mapas satelitales en pantalla, Jefe!`,
      `¡Abriendo los mapas para que no te pierdas, joven héroe!`,
      `Cartografía satelital desplegada.`
    );
    ctx.addLog(`Navegación Web: Abriendo Google Maps (${url})`, "success");
    ctx.speak(reply);
    ctx.openDetectedWebsite(url, place ? `Google Maps - ${place}` : "Google Maps");
    return true;
  }

  // NETFLIX
  if (lower.includes("netflix")) {
    ctx.triggerSound("success");
    const url = "https://www.netflix.com";
    const reply = getSpokenReply(
      pers,
      "Conectando con la plataforma Netflix, Señor.",
      "¡Netflix listo para una película, Jefe!",
      "¡Abriendo Netflix para disfrutar una serie!",
      "Accediendo a la red de streaming Netflix."
    );
    ctx.addLog(`Navegación Web: Abriendo Netflix`, "success");
    ctx.speak(reply);
    ctx.openDetectedWebsite(url, "Netflix");
    return true;
  }

  // SPOTIFY
  if (lower.includes("spotify")) {
    ctx.triggerSound("success");
    const url = "https://open.spotify.com";
    const reply = getSpokenReply(
      pers,
      "Sintonizando la biblioteca musical de Spotify, Señor.",
      "¡Spotify encendido con el mejor ritmo, Jefe!",
      "¡Ponle música a tu día, abriendo Spotify!",
      "Accediendo al transmisor de audio de Spotify."
    );
    ctx.addLog(`Navegación Web: Abriendo Spotify`, "success");
    ctx.speak(reply);
    ctx.openDetectedWebsite(url, "Spotify");
    return true;
  }

  // AMAZON / MERCADO LIBRE
  if (lower.includes("amazon")) {
    ctx.triggerSound("success");
    const url = "https://www.amazon.com";
    ctx.speak(getSpokenReply(pers, "Abriendo la tienda de Amazon, Señor.", "¡Amazon abierto, Jefe!", "¡Abriendo Amazon!", "Accediendo a Amazon."));
    ctx.openDetectedWebsite(url, "Amazon");
    return true;
  }
  if (lower.includes("mercadolibre") || lower.includes("mercado libre")) {
    ctx.triggerSound("success");
    const url = "https://www.mercadolibre.com";
    ctx.speak(getSpokenReply(pers, "Abriendo Mercado Libre, Señor.", "¡Mercado Libre a la orden, Jefe!", "¡Abriendo Mercado Libre!", "Accediendo a Mercado Libre."));
    ctx.openDetectedWebsite(url, "Mercado Libre");
    return true;
  }

  // GITHUB
  if (lower.includes("github") || lower.includes("git hub")) {
    ctx.triggerSound("success");
    const url = "https://www.github.com";
    ctx.speak(getSpokenReply(pers, "Accediendo a los repositorios de GitHub, Señor.", "¡GitHub desplegado, Jefe!", "¡Abriendo GitHub!", "Repositorios de código en línea."));
    ctx.openDetectedWebsite(url, "GitHub");
    return true;
  }

  // SOCIAL NETWORKS: TIKTOK, INSTAGRAM, FACEBOOK, TWITTER/X
  if (lower.includes("tiktok") || lower.includes("tik tok")) {
    ctx.triggerSound("success");
    ctx.speak(getSpokenReply(pers, "Abriendo TikTok, Señor.", "¡TikTok en marcha, Jefe!", "¡Abriendo TikTok!", "Acceso a TikTok concedido."));
    ctx.openDetectedWebsite("https://www.tiktok.com", "TikTok");
    return true;
  }
  if (lower.includes("instagram")) {
    ctx.triggerSound("success");
    ctx.speak(getSpokenReply(pers, "Abriendo Instagram, Señor.", "¡Instagram en pantalla, Jefe!", "¡Abriendo Instagram!", "Acceso a Instagram concedido."));
    ctx.openDetectedWebsite("https://www.instagram.com", "Instagram");
    return true;
  }
  if (lower.includes("facebook")) {
    ctx.triggerSound("success");
    ctx.speak(getSpokenReply(pers, "Abriendo Facebook, Señor.", "¡Facebook listo, Jefe!", "¡Abriendo Facebook!", "Acceso a Facebook concedido."));
    ctx.openDetectedWebsite("https://www.facebook.com", "Facebook");
    return true;
  }
  if (lower.includes("twitter") || lower.includes(" x.com") || lower === "abre x") {
    ctx.triggerSound("success");
    ctx.speak(getSpokenReply(pers, "Abriendo la red X Twitter, Señor.", "¡X abierto, Jefe!", "¡Abriendo X!", "Acceso a X concedido."));
    ctx.openDetectedWebsite("https://www.x.com", "X / Twitter");
    return true;
  }

  // NOTICIAS / CLIMA / TRADUCTOR
  if (lower.includes("noticias") || lower.includes("noticiero")) {
    ctx.triggerSound("success");
    ctx.speak(getSpokenReply(pers, "Mostrando las noticias globales más recientes, Señor.", "¡Noticias al instante, Jefe!", "¡Abriendo las noticias!", "Feed de noticias en tiempo real."));
    ctx.openDetectedWebsite("https://news.google.com", "Google Noticias");
    return true;
  }
  if (lower.includes("traductor") || lower.includes("translate")) {
    ctx.triggerSound("success");
    ctx.speak(getSpokenReply(pers, "Abriendo el traductor políglota, Señor.", "¡Traductor listo, Jefe!", "¡Abriendo el traductor!", "Traducción satelital activa."));
    ctx.openDetectedWebsite("https://translate.google.com", "Google Traductor");
    return true;
  }

  // STARK / MARVEL
  if (lower.includes("stark") || lower.includes("iron man") || lower.includes("marvel")) {
    ctx.triggerSound("success");
    ctx.speak(getSpokenReply(pers, "Accediendo a la red central de Stark Industries y Marvel, Señor.", "¡Acceso a Stark Industries concedido, Jefe!", "¡Stark Industries en línea!", "Protocolo Stark Industries activo."));
    ctx.openDetectedWebsite("https://www.marvel.com", "Stark Industries / Marvel");
    return true;
  }

  // ----------------------------------------------------
  // 3. IN-APP COCKPIT & TABS NAVIGATION ("Llévame a...", "Abre...", "Muéstrame...")
  // ----------------------------------------------------
  // VISOR / CÁMARA
  if (
    lower.includes("llévame al visor") ||
    lower.includes("llevame al visor") ||
    lower.includes("llévame a la cámara") ||
    lower.includes("llevame a la camara") ||
    lower.includes("llévame a la foto") ||
    lower.includes("llevame al lente") ||
    lower.includes("abre el visor") ||
    lower.includes("abrir visor") ||
    lower.includes("abre la cámara") ||
    lower.includes("abre la camara") ||
    lower.includes("pon la cámara") ||
    lower.includes("pon el visor") ||
    lower.includes("ver visor") ||
    lower.includes("ver cámara") ||
    lower.includes("modo visor") ||
    lower.includes("ir al visor") ||
    lower.includes("ve al visor") ||
    lower.includes("ir a la cámara") ||
    lower.includes("ve a la cámara") ||
    lower.includes("muéstrame el visor") ||
    lower.includes("muéstrame la cámara") ||
    lower.includes("muestrame la camara") ||
    lower.includes("enséñame la cámara") ||
    lower.includes("enseñame la camara")
  ) {
    ctx.triggerSound("click");
    ctx.setActiveMainTab("visor");
    ctx.speak(getSpokenReply(pers, "Llevándolo al visor óptico y cámara de escaneo, Señor.", "¡Llevándote al visor óptico de escaneo, Jefe!", "¡Aquí está la cámara lista para ti!", "Módulo de visor táctico activo."));
    ctx.addLog("Navegación Cockpit: Visor de Escaneo seleccionado.", "info");
    return true;
  }

  // CHAT / IDEAS / PREGUNTAS
  if (
    lower.includes("llévame al chat") ||
    lower.includes("llevame al chat") ||
    lower.includes("llévame a las ideas") ||
    lower.includes("llevame a las ideas") ||
    lower.includes("llévame a la matriz") ||
    lower.includes("llevame a la matriz") ||
    lower.includes("abre el chat") ||
    lower.includes("abrir chat") ||
    lower.includes("matriz de ideas") ||
    lower.includes("abre las ideas") ||
    lower.includes("quiero chatear") ||
    lower.includes("quiero conversar") ||
    lower.includes("quiero hacerte una pregunta") ||
    lower.includes("hazme una consulta") ||
    lower.includes("modo chat") ||
    lower.includes("ir al chat") ||
    lower.includes("ve al chat") ||
    lower.includes("muéstrame el chat") ||
    lower.includes("muestrame el chat") ||
    lower.includes("muéstrame las ideas") ||
    lower.includes("enséñame el chat") ||
    lower.includes("enseñame el chat")
  ) {
    ctx.triggerSound("click");
    ctx.setActiveMainTab("chat");
    ctx.speak(getSpokenReply(pers, "Llevándolo a la matriz holográfica de ideas y conocimiento, Señor.", "¡Llevándote a la matriz de ideas y chat, Jefe!", "¡Aquí está nuestro chat para platicar de todo!", "Canal de procesamiento de ideas activo."));
    ctx.addLog("Navegación Cockpit: Matriz de Ideas & Chat seleccionada.", "info");
    return true;
  }

  // USB / PORTABILIDAD / TRANSCEPTOR
  if (
    lower.includes("llévame al usb") ||
    lower.includes("llevame al usb") ||
    lower.includes("llévame a los dispositivos") ||
    lower.includes("llevame a los dispositivos") ||
    lower.includes("llévame a la portabilidad") ||
    lower.includes("abre el usb") ||
    lower.includes("abrir usb") ||
    lower.includes("transceiver") ||
    lower.includes("transceptor") ||
    lower.includes("portabilidad") ||
    lower.includes("modo usb") ||
    lower.includes("ir al usb") ||
    lower.includes("ve al usb") ||
    lower.includes("muéstrame el usb") ||
    lower.includes("muestrame el usb") ||
    lower.includes("enséñame el usb") ||
    lower.includes("enseñame el usb")
  ) {
    ctx.triggerSound("click");
    ctx.setActiveMainTab("usb");
    ctx.speak(getSpokenReply(pers, "Llevándolo al enlace transceiver USB y portabilidad, Señor.", "¡Llevándote al enlace USB y dispositivos, Jefe!", "¡Aquí está el módulo USB!", "Subestación USB en línea."));
    ctx.addLog("Navegación Cockpit: Enlace USB y Portabilidad seleccionado.", "info");
    return true;
  }

  // CASA INTELIGENTE / DOMÓTICA
  if (
    lower.includes("llévame a la casa") ||
    lower.includes("llevame a la casa") ||
    lower.includes("llévame al hogar") ||
    lower.includes("llevame al hogar") ||
    lower.includes("llévame a la domótica") ||
    lower.includes("llevame a la domotica") ||
    lower.includes("abre la casa") ||
    lower.includes("abrir la casa") ||
    lower.includes("control del hogar") ||
    lower.includes("control de la casa") ||
    lower.includes("domótica") ||
    lower.includes("domotica") ||
    lower.includes("panel de la casa") ||
    lower.includes("ir a la casa") ||
    lower.includes("ve a la casa") ||
    lower.includes("muéstrame la casa") ||
    lower.includes("muestrame la casa") ||
    lower.includes("enséñame la casa") ||
    lower.includes("enseñame la casa")
  ) {
    ctx.triggerSound("click");
    ctx.setActiveMainTab("home");
    ctx.speak(getSpokenReply(pers, "Llevándolo a la consola de control del hogar y domótica Stark, Señor.", "¡Llevándote al panel de control del hogar, Jefe!", "¡Aquí están todos los aparatos de la casa!", "Sistemas de control del perímetro doméstico activos."));
    ctx.addLog("Navegación Cockpit: Control del Hogar seleccionado.", "info");
    return true;
  }

  // HISTORIAL DE CAPTURAS / FOTOS
  if (
    lower.includes("llévame al historial") ||
    lower.includes("llevame al historial") ||
    lower.includes("llévame a las fotos") ||
    lower.includes("llevame a las fotos") ||
    lower.includes("llévame a las capturas") ||
    lower.includes("historial") ||
    lower.includes("ver fotos") ||
    lower.includes("capturas anteriores") ||
    lower.includes("galería de capturas") ||
    lower.includes("galeria")
  ) {
    ctx.triggerSound("click");
    const historyEl = document.getElementById("scan-history-section");
    if (historyEl) {
      historyEl.scrollIntoView({ behavior: "smooth" });
    }
    ctx.speak(getSpokenReply(pers, "Llevándolo al historial cronológico de análisis ópticos, Señor.", "¡Llevándote al historial de capturas, Jefe!", "¡Aquí tienes tus fotos guardadas, joven héroe!", "Registro cronológico de capturas en pantalla."));
    ctx.addLog("Navegación Cockpit: Historial de análisis enfocado.", "info");
    return true;
  }

  // ----------------------------------------------------
  // 4. UNIVERSAL WEB DESTINATIONS & SEARCH ("Llévame a YouTube", "Llévame a Google", "Llévame a [Destino]")
  // ----------------------------------------------------
  // GENERIC "LLÉVAME A [ALGO]" / "ABRE [ALGO]" / "BUSCA [ALGO]"
  if (isNavRequest) {
    // Extract what destination the user asked for
    let target = lower
      .replace(/^(?:llévame a|llevame a|llévame al|llevame al|llévame|llevame|abre|abrir|ábreme|abreme|ve a|ir a|navega a|mostrar|muéstrame|muestrame|quiero ir a|entrar a|entra a|pon|ponme)\s+(?:la página de|la pagina de|el sitio de|la web de|el portal de|a|el|la|los|las)?\s*/i, "")
      .trim();

    // If target has meaning
    if (target.length > 1 && !target.includes("visor") && !target.includes("chat") && !target.includes("usb") && !target.includes("casa") && !target.includes("domótica") && !target.includes("emergencia")) {
      ctx.triggerSound("success");
      
      let url = "";
      let title = target.charAt(0).toUpperCase() + target.slice(1);

      // Check if it's a domain name e.g. "openai.com", "ferrari.com", "tesla.com"
      if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/.*)?$/.test(target)) {
        url = `https://${target}`;
      } else {
        // Build search destination URL
        url = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
        title = `Búsqueda: ${target}`;
      }

      const reply = getSpokenReply(
        pers,
        `Entendido Señor. Llevándolo a ${target} de inmediato.`,
        `¡A la orden, Jefe! Transportándonos a ${target}.`,
        `¡Claro que sí! Abriendo ${target} para ti, joven héroe.`,
        `Navegando al objetivo solicitado: ${target}.`
      );

      ctx.addLog(`Navegación Solicitada: Llevando al usuario a "${target}" -> ${url}`, "success");
      ctx.speak(reply);
      ctx.openDetectedWebsite(url, title);
      return true;
    }
  }

  // ----------------------------------------------------
  // 5. SMART HOME DIRECT VOCAL EXECUTION ("Hazme caso en...")
  // ----------------------------------------------------

  // TV CONTROL
  if (lower.includes("enciende la tele") || lower.includes("prende la tele") || lower.includes("enciende la televisión") || lower.includes("prende la television") || lower.includes("prende el televisor") || lower.includes("enciende el televisor")) {
    ctx.triggerSound("success");
    ctx.smartHome.setTv((prev) => ({ ...prev, on: true }));
    ctx.smartHome.setHasPermission(true);
    ctx.speak(getSpokenReply(pers, "Televisor de Stark Labs encendido en canal principal, Señor.", "¡Tele encendida, Jefe! A disfrutar.", "¡He prendido la tele para ti!", "Televisor energizado."));
    ctx.addLog("Domótica: Televisor encendido por comando vocal.", "success");
    return true;
  }

  if (lower.includes("apaga la tele") || lower.includes("apaga la televisión") || lower.includes("apaga el televisor")) {
    ctx.triggerSound("abort");
    ctx.smartHome.setTv((prev) => ({ ...prev, on: false }));
    ctx.speak(getSpokenReply(pers, "Televisor apagado de forma segura, Señor.", "¡Tele apagada, Jefe!", "¡Tele apagada!", "Televisor desenergizado."));
    ctx.addLog("Domótica: Televisor apagado por comando vocal.", "warning");
    return true;
  }

  if (lower.includes("sube la tele") || lower.includes("sube el volumen de la tele") || lower.includes("más volumen en la tele")) {
    ctx.triggerSound("click");
    ctx.smartHome.setTv((prev) => ({ ...prev, on: true, volume: Math.min(100, prev.volume + 15) }));
    ctx.speak(getSpokenReply(pers, "Volumen del televisor incrementado, Señor.", "¡Volumen de la tele arriba, Jefe!", "¡Volumen subido!", "Ganancia de audio incrementada en pantalla."));
    ctx.addLog("Domótica: Volumen de TV aumentado.", "info");
    return true;
  }

  if (lower.includes("baja la tele") || lower.includes("baja el volumen de la tele") || lower.includes("menos volumen en la tele")) {
    ctx.triggerSound("click");
    ctx.smartHome.setTv((prev) => ({ ...prev, on: true, volume: Math.max(0, prev.volume - 15) }));
    ctx.speak(getSpokenReply(pers, "Volumen del televisor reducido, Señor.", "¡Volumen de la tele bajado, Jefe!", "¡Volumen bajado!", "Atenuación de audio aplicada."));
    ctx.addLog("Domótica: Volumen de TV reducido.", "info");
    return true;
  }

  // LIGHTS CONTROL
  if (lower.includes("enciende las luces") || lower.includes("prende las luces") || lower.includes("enciende la luz") || lower.includes("prende la luz") || lower.includes("luces encendidas")) {
    ctx.triggerSound("success");
    ctx.smartHome.setLights((prev) => ({ ...prev, on: true, brightness: 100 }));
    ctx.smartHome.setHasPermission(true);
    ctx.speak(getSpokenReply(pers, "Sistemas de iluminación encendidos con máxima luminiscencia, Señor.", "¡Luces encendidas a tope, Jefe!", "¡Luces encendidas para que veas bien!", "Circuito de iluminación energizado."));
    ctx.addLog("Domótica: Luces encendidas al 100%.", "success");
    return true;
  }

  if (lower.includes("apaga las luces") || lower.includes("apaga la luz") || lower.includes("luces apagadas") || lower.includes("modo oscuro en la casa")) {
    ctx.triggerSound("abort");
    ctx.smartHome.setLights((prev) => ({ ...prev, on: false }));
    ctx.speak(getSpokenReply(pers, "Luces de la estancia apagadas, Señor.", "¡Luces apagadas, Jefe!", "¡Luces apagadas!", "Circuito de iluminación desenergizado."));
    ctx.addLog("Domótica: Luces apagadas.", "warning");
    return true;
  }

  if (lower.includes("luz roja") || lower.includes("luces rojas")) {
    ctx.triggerSound("click");
    ctx.smartHome.setLights({ on: true, color: "Rojo Alerta", brightness: 90 });
    ctx.speak(getSpokenReply(pers, "Iluminación configurada en Rojo Alerta, Señor.", "¡Luces rojas activadas, Jefe!", "¡Luces rojas listas!", "Tonalidad cromática: Rojo 700nm."));
    return true;
  }

  if (lower.includes("luz azul") || lower.includes("luces azules") || lower.includes("luz cyan")) {
    ctx.triggerSound("click");
    ctx.smartHome.setLights({ on: true, color: "HUD Cyan", brightness: 85 });
    ctx.speak(getSpokenReply(pers, "Iluminación cambiada a HUD Cyan Stark, Señor.", "¡Luces cyan Stark activas, Jefe!", "¡Qué lindo color cyan!", "Tonalidad cromática: Cyan 480nm."));
    return true;
  }

  if (lower.includes("luz verde") || lower.includes("luces verdes")) {
    ctx.triggerSound("click");
    ctx.smartHome.setLights({ on: true, color: "Verde Neón", brightness: 85 });
    ctx.speak(getSpokenReply(pers, "Iluminación configurada en Verde Neón, Señor.", "¡Luces verdes puestas, Jefe!", "¡Verde activado!", "Tonalidad cromática: Verde 520nm."));
    return true;
  }

  // FAN / CLIMATIZACIÓN
  if (lower.includes("enciende el ventilador") || lower.includes("prende el ventilador") || lower.includes("activa el ventilador")) {
    ctx.triggerSound("success");
    ctx.smartHome.setFan({ on: true, speed: "Medio" });
    ctx.smartHome.setHasPermission(true);
    ctx.speak(getSpokenReply(pers, "Sistema de ventilación y climatización encendido en velocidad media, Señor.", "¡Ventilador soplando, Jefe!", "¡Ventilador encendido!", "Turbina de ventilación activa."));
    ctx.addLog("Domótica: Ventilador encendido.", "success");
    return true;
  }

  if (lower.includes("ventilador en turbo") || lower.includes("ventilador al máximo") || lower.includes("ventilador rapido") || lower.includes("ventilador rápido")) {
    ctx.triggerSound("success");
    ctx.smartHome.setFan({ on: true, speed: "Turbo" });
    ctx.speak(getSpokenReply(pers, "Ventilador configurado en modo Turbo de alta potencia, Señor.", "¡Ventilador al máximo poder, Jefe!", "¡Ventilador en turbo!", "Flujo de aire máximo activado."));
    ctx.addLog("Domótica: Ventilador en modo Turbo.", "success");
    return true;
  }

  if (lower.includes("apaga el ventilador") || lower.includes("detén el ventilador") || lower.includes("deten el ventilador")) {
    ctx.triggerSound("abort");
    ctx.smartHome.setFan((prev) => ({ ...prev, on: false }));
    ctx.speak(getSpokenReply(pers, "Ventilador detenido, Señor.", "¡Ventilador apagado, Jefe!", "¡Ventilador apagado!", "Turbina desenergizada."));
    ctx.addLog("Domótica: Ventilador apagado.", "warning");
    return true;
  }

  // DOOR LOCKS / PERÍMETRO
  if (lower.includes("bloquea las puertas") || lower.includes("bloquea la casa") || lower.includes("cierra las puertas") || lower.includes("asegura la casa") || lower.includes("bloquear perímetro")) {
    ctx.triggerSound("alarm");
    ctx.smartHome.setShieldDoor({ locked: true });
    ctx.speak(getSpokenReply(pers, "Perímetro asegurado. Todas las cerraduras magnéticas blindadas han sido selladas, Señor.", "¡Puertas selladas y casa blindada, Jefe!", "¡Perímetro seguro y puertas cerradas con candado!", "Cierre magnético de compuertas activado."));
    ctx.addLog("Domótica: Perímetro y puertas bloqueadas.", "error");
    return true;
  }

  if (lower.includes("desbloquea las puertas") || lower.includes("desbloquea la casa") || lower.includes("abre las puertas") || lower.includes("abre la puerta")) {
    ctx.triggerSound("click");
    ctx.smartHome.setShieldDoor({ locked: false });
    ctx.speak(getSpokenReply(pers, "Cerraduras magnéticas liberadas. Accesos despejados, Señor.", "¡Puertas desbloqueadas, Jefe!", "¡Puertas abiertas!", "Cerraduras magnéticas desenganchadas."));
    ctx.addLog("Domótica: Puertas desbloqueadas.", "info");
    return true;
  }

  // MASS ALL ON / ALL OFF
  if (lower.includes("enciende todo") || lower.includes("prende todo") || lower.includes("activa todo")) {
    ctx.triggerSound("success");
    ctx.smartHome.setTv({ on: true, volume: 25, channel: "Canal Stark Labs" });
    ctx.smartHome.setLights({ on: true, color: "HUD Cyan", brightness: 100 });
    ctx.smartHome.setFan({ on: true, speed: "Turbo" });
    ctx.smartHome.setHasPermission(true);
    ctx.speak(getSpokenReply(pers, "Todos los subsistemas del hogar han sido activados en sincronía, Señor.", "¡Todo el laboratorio y la casa encendidos, Jefe!", "¡Todo encendido!", "Protocolo de energía total activo."));
    ctx.addLog("Domótica: Todos los dispositivos encendidos.", "success");
    return true;
  }

  if (lower.includes("apaga todo") || lower.includes("desactiva todo") || lower.includes("modo dormir")) {
    ctx.triggerSound("abort");
    ctx.smartHome.setTv((prev) => ({ ...prev, on: false }));
    ctx.smartHome.setLights((prev) => ({ ...prev, on: false }));
    ctx.smartHome.setFan((prev) => ({ ...prev, on: false }));
    ctx.smartHome.setShieldDoor({ locked: true });
    ctx.speak(getSpokenReply(pers, "Todos los dispositivos apagados y casa sellada de forma segura. Buenas noches, Señor.", "¡Todo apagado y asegurado, Jefe! Descansa.", "¡Todo apagadito y seguro, a descansar!", "Sistemas auxiliares en modo de reposo."));
    ctx.addLog("Domótica: Todos los dispositivos apagados.", "warning");
    return true;
  }

  // ----------------------------------------------------
  // 6. VISION & SCANNING COMMANDS ("Escanea", "Filtro", "Foto")
  // ----------------------------------------------------
  const isScanCmd =
    lower.includes("escanear") ||
    lower.includes("escanea") ||
    lower.includes("analiza") ||
    lower.includes("analizar") ||
    lower.includes("toma foto") ||
    lower.includes("tomar foto") ||
    lower.includes("captura") ||
    lower.includes("capturar") ||
    lower.includes("qué tengo") ||
    lower.includes("que tengo") ||
    lower.includes("qué es esto") ||
    lower.includes("que es esto") ||
    lower.includes("mira esto") ||
    lower.includes("identifica esto");

  if (isScanCmd) {
    ctx.triggerSound("scan");
    ctx.setActiveMainTab("visor");
    ctx.addLog("Orden de escaneo óptico instantáneo recibida por voz.", "success");
    setTimeout(() => {
      ctx.triggerScan();
    }, 200);
    return true;
  }

  // RADAR / CONTINUOUS AUTO SCAN
  if (lower.includes("activa el radar") || lower.includes("inicia el radar") || lower.includes("auto escaneo") || lower.includes("escaneo continuo")) {
    ctx.triggerSound("startup");
    ctx.setAutoScanContinuous(true);
    ctx.setActiveMainTab("visor");
    ctx.speak(getSpokenReply(pers, "Radar de escaneo óptico continuo activado, Señor. Analizando cada ciclo de forma autónoma.", "¡Radar de escaneo continuo en línea, Jefe!", "¡Radar encendido, buscando cosas a tu alrededor!", "Sistemas de radar de barrido óptico activo."));
    ctx.addLog("Radar Continuo: Activado por orden vocal.", "success");
    return true;
  }

  if (lower.includes("desactiva el radar") || lower.includes("apaga el radar") || lower.includes("detén el auto escaneo") || lower.includes("deten el auto escaneo") || lower.includes("detén el radar")) {
    ctx.triggerSound("abort");
    ctx.setAutoScanContinuous(false);
    ctx.speak(getSpokenReply(pers, "Radar continuo desactivado, Señor.", "¡Radar apagado, Jefe!", "¡Radar desactivado!", "Radar en espera."));
    ctx.addLog("Radar Continuo: Desactivado por orden vocal.", "warning");
    return true;
  }

  // SIGN LANGUAGE INTERPRETER
  if (lower.includes("lengua de señas") || lower.includes("lenguaje de señas") || lower.includes("señas") || lower.includes("interprete de señas")) {
    ctx.triggerSound("success");
    ctx.setIsSignLanguageMode(true);
    ctx.setActiveMainTab("visor");
    ctx.speak(getSpokenReply(pers, "Módulo de interpretación de lengua de señas óptico activado, Señor.", "¡Modo lengua de señas listo, Jefe!", "¡Traductor de lengua de señas encendido!", "Intérprete gestual activo."));
    ctx.addLog("Visor: Modo Lengua de Señas activado.", "success");
    return true;
  }

  // SHADER FILTERS
  if (lower.includes("filtro térmico") || lower.includes("filtro termico") || lower.includes("visión térmica") || lower.includes("vision termica")) {
    ctx.triggerSound("click");
    ctx.setFilter("thermal");
    ctx.setActiveMainTab("visor");
    ctx.speak(getSpokenReply(pers, "Filtro de termografía infrarroja activado, Señor.", "¡Visión térmica en línea, Jefe!", "¡Filtro térmico activado!", "Termografía infrarroja activa."));
    return true;
  }

  if (lower.includes("visión nocturna") || lower.includes("vision nocturna") || lower.includes("filtro nocturno")) {
    ctx.triggerSound("click");
    ctx.setFilter("night");
    ctx.setActiveMainTab("visor");
    ctx.speak(getSpokenReply(pers, "Filtro de visión nocturna amplificada activado, Señor.", "¡Visión nocturna encendida, Jefe!", "¡Filtro nocturno verde listo!", "Amplificación fotónica en línea."));
    return true;
  }

  if (lower.includes("filtro stark") || lower.includes("filtro hud") || lower.includes("filtro cian") || lower.includes("filtro cyan")) {
    ctx.triggerSound("click");
    ctx.setFilter("stark");
    ctx.setActiveMainTab("visor");
    ctx.speak(getSpokenReply(pers, "Filtro holográfico StarkTech activado, Señor.", "¡Filtro StarkTech aplicado, Jefe!", "¡Filtro holográfico Stark listo!", "Shader StarkTech aplicado."));
    return true;
  }

  if (lower.includes("filtro normal") || lower.includes("sin filtro") || lower.includes("filtro estándar") || lower.includes("filtro estandar")) {
    ctx.triggerSound("click");
    ctx.setFilter("normal");
    ctx.setActiveMainTab("visor");
    ctx.speak(getSpokenReply(pers, "Filtro visual restaurado a óptico estándar, Señor.", "¡Filtro normal restaurado, Jefe!", "¡Filtro normal listo!", "Shader óptico neutro."));
    return true;
  }

  // CLEAR HISTORY
  if (lower.includes("borra el historial") || lower.includes("limpia el historial") || lower.includes("borrar fotos") || lower.includes("limpiar base de datos")) {
    ctx.triggerSound("abort");
    ctx.clearHistory();
    ctx.speak(getSpokenReply(pers, "Base de datos e historial de capturas purgados satisfactoriamente, Señor.", "¡Historial de escaneos borrado, Jefe!", "¡He limpiado tu historial!", "Registros purgados de la memoria."));
    ctx.addLog("Memoria: Historial de capturas borrado.", "warning");
    return true;
  }

  // ----------------------------------------------------
  // 7. PERSONALITY SWITCHING & ASSISTANT SETTINGS
  // ----------------------------------------------------
  if (lower.includes("cambia a friday") || lower.includes("modo friday") || lower.includes("activa a friday") || lower.includes("pon a friday")) {
    ctx.triggerSound("startup");
    ctx.setSpeechConfig((prev) => ({ ...prev, personality: "FRIDAY" }));
    ctx.speak("¡Cambio completado, Jefe! Soy F.R.I.D.A.Y. y estoy a tu servicio con toda la potencia de la armadura.");
    ctx.addLog("Asistente: Personalidad cambiada a F.R.I.D.A.Y.", "success");
    return true;
  }

  if (lower.includes("cambia a karen") || lower.includes("modo karen") || lower.includes("activa a karen") || lower.includes("pon a karen")) {
    ctx.triggerSound("startup");
    ctx.setSpeechConfig((prev) => ({ ...prev, personality: "KAREN" }));
    ctx.speak("¡Hola de nuevo, joven héroe! Soy Karen, tu asistente de confianza. ¿En qué nos divertimos hoy?");
    ctx.addLog("Asistente: Personalidad cambiada a KAREN.", "success");
    return true;
  }

  if (lower.includes("cambia a edith") || lower.includes("modo edith") || lower.includes("activa a edith") || lower.includes("pon a edith")) {
    ctx.triggerSound("startup");
    ctx.setSpeechConfig((prev) => ({ ...prev, personality: "EDITH" }));
    ctx.speak("Protocolo E.D.I.T.H. sincronizado. Red táctica satelital en espera de comandos estratégicos.");
    ctx.addLog("Asistente: Personalidad cambiada a E.D.I.T.H.", "success");
    return true;
  }

  if (lower.includes("cambia a jarvis") || lower.includes("modo jarvis") || lower.includes("activa a jarvis") || lower.includes("pon a jarvis")) {
    ctx.triggerSound("startup");
    ctx.setSpeechConfig((prev) => ({ ...prev, personality: "JARVIS" }));
    ctx.speak("Sistemas reconfigurados, Señor. J.A.R.V.I.S. al mando con todos los protocolos de Stark Industries.");
    ctx.addLog("Asistente: Personalidad cambiada a J.A.R.V.I.S.", "success");
    return true;
  }

  // SPEECH SPEED & VOLUME
  if (lower.includes("habla más rápido") || lower.includes("habla mas rapido") || lower.includes("aumenta la velocidad")) {
    ctx.triggerSound("click");
    ctx.setSpeechConfig((prev) => ({ ...prev, rate: Math.min(2.0, prev.rate + 0.25) }));
    ctx.speak("Aumentando la tasa de velocidad de síntesis de voz, Señor.");
    return true;
  }

  if (lower.includes("habla más lento") || lower.includes("habla mas lento") || lower.includes("reduce la velocidad")) {
    ctx.triggerSound("click");
    ctx.setSpeechConfig((prev) => ({ ...prev, rate: Math.max(0.5, prev.rate - 0.25) }));
    ctx.speak("Reduciendo la velocidad de mi voz para mayor claridad, Señor.");
    return true;
  }

  if (lower.includes("silencia tu voz") || lower.includes("no hables") || lower.includes("silencio")) {
    ctx.triggerSound("abort");
    ctx.setSpeechConfig((prev) => ({ ...prev, enabled: false }));
    ctx.addLog("Asistente: Síntesis de voz silenciada temporalmente.", "warning");
    return true;
  }

  if (lower.includes("activa tu voz") || lower.includes("vuelve a hablar") || lower.includes("habla de nuevo")) {
    ctx.triggerSound("startup");
    ctx.setSpeechConfig((prev) => ({ ...prev, enabled: true }));
    ctx.speak("Síntesis de voz restaurada, Señor. Estoy listo para comunicarme.");
    ctx.addLog("Asistente: Síntesis de voz reactivada.", "success");
    return true;
  }

  // ----------------------------------------------------
  // MINIATURE PICTURE-IN-PICTURE / FLOATING SCREEN
  // ----------------------------------------------------
  if (
    lower.includes("pantalla miniatura") ||
    lower.includes("modo miniatura") ||
    lower.includes("activa la miniatura") ||
    lower.includes("abre la miniatura") ||
    lower.includes("visor flotante") ||
    lower.includes("pantalla flotante") ||
    lower.includes("minimizar jarvis") ||
    lower.includes("ventana miniatura") ||
    lower.includes("picture in picture") ||
    lower.includes("modo pip")
  ) {
    ctx.triggerSound("startup");
    if (ctx.setIsMiniWidgetOpen) {
      ctx.setIsMiniWidgetOpen(true);
    }
    const reply = getSpokenReply(
      pers,
      "Desplegando pantalla miniatura holográfica en su interfaz, Señor.",
      "¡Modo miniatura activado, Jefe!",
      "¡Abriendo tu pantallita flotante!",
      "Consola táctica secundaria en modo miniatura desplegada."
    );
    ctx.speak(reply);
    ctx.addLog("Interfaz: Modo pantalla miniatura activado por voz.", "success");
    return true;
  }

  if (
    lower.includes("cierra la miniatura") ||
    lower.includes("cerrar miniatura") ||
    lower.includes("quitar miniatura") ||
    lower.includes("pantalla completa") ||
    lower.includes("maximizar jarvis") ||
    lower.includes("maximizar visor")
  ) {
    ctx.triggerSound("click");
    if (ctx.setIsMiniWidgetOpen) {
      ctx.setIsMiniWidgetOpen(false);
    }
    const reply = getSpokenReply(
      pers,
      "Pantalla miniatura cerrada y maximizada a la consola principal, Señor.",
      "¡De vuelta a pantalla completa, Jefe!",
      "¡Listo, volvemos a la pantalla grande!",
      "Consola principal restaurada a foco primario."
    );
    ctx.speak(reply);
    ctx.addLog("Interfaz: Pantalla miniatura cerrada.", "info");
    return true;
  }

  // POP OUT / FLOAT OUTSIDE GOOGLE (OS PICTURE-IN-PICTURE)
  if (
    lower.includes("salir de google") ||
    lower.includes("salte de google") ||
    lower.includes("fuera de google") ||
    lower.includes("flotar fuera") ||
    lower.includes("salir del navegador") ||
    lower.includes("pantalla de escritorio") ||
    lower.includes("pantalla externa") ||
    lower.includes("flotar en el escritorio") ||
    lower.includes("flotar en escritorio") ||
    lower.includes("desacoplar jarvis") ||
    lower.includes("desacoplar pantalla") ||
    lower.includes("sacar miniatura")
  ) {
    ctx.triggerSound("startup");
    if (ctx.onPopOutDesktop) {
      ctx.onPopOutDesktop();
    } else if (ctx.setIsMiniWidgetOpen) {
      ctx.setIsMiniWidgetOpen(true);
    }
    const reply = getSpokenReply(
      pers,
      "Desacoplando miniatura holográfica del navegador. J.A.R.V.I.S. ahora flota sobre su escritorio y demás aplicaciones, Señor.",
      "¡Desacoplando fuera de Google, Jefe! Ahora me verás sobre cualquier programa.",
      "¡Salí de Google! Ahora floto en tu pantalla para acompañarte donde vayas.",
      "Consola táctica secundaria desacoplada a nivel de sistema operativo."
    );
    ctx.speak(reply);
    ctx.addLog("Interfaz: Miniatura desacoplada fuera del navegador Google (Modo Escritorio).", "success");
    return true;
  }

  // PILOT PROFILE & IDENTITY COMMANDS
  if (
    lower.includes("cambiar mi nombre") ||
    lower.includes("cambiar mi edad") ||
    lower.includes("editar perfil") ||
    lower.includes("mi perfil") ||
    lower.includes("registro de identidad") ||
    lower.includes("configurar piloto") ||
    lower.includes("quién soy") ||
    lower.includes("quien soy")
  ) {
    ctx.triggerSound("click");
    if (ctx.openPilotModal) {
      ctx.openPilotModal();
    }
    const reply = getSpokenReply(
      pers,
      "Abriendo consola de identidad del piloto para modificar su nombre o edad, Señor.",
      "¡Abriendo tu perfil de piloto, Jefe!",
      "¡Aquí puedes cambiar tu nombre o edad, joven héroe!",
      "Accediendo a la base de datos de credenciales del piloto."
    );
    ctx.speak(reply);
    ctx.addLog("Identidad: Ventana de perfil abierta por orden vocal.", "info");
    return true;
  }

  // ----------------------------------------------------
  // DOWNLOAD & INSTALL JARVIS (CELLPHONES & COMPUTERS)
  // ----------------------------------------------------
  if (
    lower.includes("descargar jarvis") ||
    lower.includes("descargar a jarvis") ||
    lower.includes("descárgame a jarvis") ||
    lower.includes("descargame a jarvis") ||
    lower.includes("instalar jarvis") ||
    lower.includes("instala a jarvis") ||
    lower.includes("instalar a jarvis") ||
    lower.includes("descargar en celular") ||
    lower.includes("descargar en el celular") ||
    lower.includes("descargar en mi celular") ||
    lower.includes("descargar en el teléfono") ||
    lower.includes("descargar en el telefono") ||
    lower.includes("descargar en computadora") ||
    lower.includes("descargar en la pc") ||
    lower.includes("descargar en mi computadora") ||
    lower.includes("instalar en celular") ||
    lower.includes("instalar en el celular") ||
    lower.includes("instalar en pc") ||
    lower.includes("instalar en computadora") ||
    lower.includes("cómo descargar a jarvis") ||
    lower.includes("como descargar a jarvis") ||
    lower.includes("centro de descarga") ||
    lower.includes("descarga de jarvis") ||
    lower.includes("descargar la app") ||
    lower.includes("instalar la app") ||
    lower.includes("instalar aplicación") ||
    lower.includes("instalar aplicacion")
  ) {
    ctx.triggerSound("startup");
    if (ctx.openDownloadModal) {
      ctx.openDownloadModal();
    }
    const reply = getSpokenReply(
      pers,
      "Desplegando el centro de descarga e instalación multiplataforma Stark para celular y computadora, Señor.",
      "¡Abriendo la consola de descarga para tu celular y PC, Jefe!",
      "¡Aquí puedes descargarme en tu teléfono o en tu computadora, joven héroe!",
      "Protocolo de despliegue e instalación multiplataforma activado."
    );
    ctx.speak(reply);
    ctx.addLog("Instalación: Centro de descarga para celulares y computadoras desplegado.", "success");
    return true;
  }

  // ----------------------------------------------------
  // COMPUTER & PC SYSTEM CONTROL PROTOCOLS
  // ----------------------------------------------------
  if (
    lower.includes("control de mi computadora") ||
    lower.includes("control de la computadora") ||
    lower.includes("control de computadora") ||
    lower.includes("control de mi pc") ||
    lower.includes("control de la pc") ||
    lower.includes("control de pc") ||
    lower.includes("controlar mi computadora") ||
    lower.includes("controlar la computadora") ||
    lower.includes("controlar mi pc") ||
    lower.includes("controlar la pc") ||
    lower.includes("controla mi computadora") ||
    lower.includes("controla mi pc") ||
    lower.includes("toma el control de mi computadora") ||
    lower.includes("toma el control de la computadora") ||
    lower.includes("toma el control de mi pc") ||
    lower.includes("ten el control de mi computadora") ||
    lower.includes("ten el control de la computadora") ||
    lower.includes("ten el control de mi pc") ||
    lower.includes("control de sistema") ||
    lower.includes("control del sistema") ||
    lower.includes("abrir control de pc") ||
    lower.includes("abrir control de computadora") ||
    lower.includes("stark bridge") ||
    lower.includes("pc bridge")
  ) {
    ctx.triggerSound("startup");
    ctx.setActiveMainTab("pc");
    const reply = getSpokenReply(
      pers,
      "Tomando el control de los sistemas de su computadora, Señor. Módulos de enlace táctico y telemetría de Windows y macOS activados.",
      "¡Accediendo al control total de tu computadora, Jefe! Todos los sistemas listos.",
      "¡Conectándome a tu computadora para ayudarte en todo lo que necesites, joven héroe!",
      "Protocolo Stark PC Bridge inicializado. Asumiendo control táctico de la estación de trabajo."
    );
    ctx.speak(reply);
    ctx.addLog("PC Control: Acceso a la computadora otorgado a JARVIS.", "success");
    return true;
  }

  // Fullscreen voice commands
  if (
    lower.includes("pantalla completa") ||
    lower.includes("pon pantalla completa") ||
    lower.includes("modo pantalla completa") ||
    lower.includes("maximizar pantalla") ||
    lower.includes("fullscreen")
  ) {
    ctx.triggerSound("click");
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      const reply = getSpokenReply(
        pers,
        "Modo pantalla completa activado, Señor.",
        "¡Pantalla completa lista, Jefe!",
        "¡Poniendo pantalla completa para ti, joven héroe!",
        "Modo pantalla completa desplegado."
      );
      ctx.speak(reply);
      ctx.addLog("PC: Modo pantalla completa activado.", "success");
    } else {
      document.exitFullscreen().catch(() => {});
      const reply = getSpokenReply(
        pers,
        "Restaurando ventana estándar de la computadora, Señor.",
        "¡Volviendo a vista de ventana, Jefe!",
        "¡Regresando al modo normal!",
        "Saliendo de modo pantalla completa."
      );
      ctx.speak(reply);
      ctx.addLog("PC: Modo ventana restaurado.", "info");
    }
    return true;
  }

  // Read Clipboard voice command
  if (
    lower.includes("leer portapapeles") ||
    lower.includes("lee el portapapeles") ||
    lower.includes("lee mi portapapeles") ||
    lower.includes("qué tengo copiado") ||
    lower.includes("que tengo copiado") ||
    lower.includes("qué hay en el portapapeles") ||
    lower.includes("que hay en el portapapeles")
  ) {
    ctx.triggerSound("click");
    if (navigator.clipboard) {
      navigator.clipboard.readText().then(text => {
        if (text && text.trim()) {
          const preview = text.slice(0, 140);
          ctx.speak(`Señor, en su portapapeles tiene copiado: ${preview}`);
          ctx.addLog(`Portapapeles leído: "${preview}..."`, "success");
        } else {
          ctx.speak("Señor, su portapapeles se encuentra vacío.");
        }
      }).catch(() => {
        ctx.speak("Por favor active los permisos de portapapeles en su navegador para que pueda leerlo.");
      });
    }
    return true;
  }

  // ----------------------------------------------------
  // 8. FALLTHROUGH: SMART CONVERSATION & QUERY TO CHAT MATRIX
  // ----------------------------------------------------
  // If the user spoke a general sentence or question, switch to chat and submit it directly!
  ctx.setActiveMainTab("chat");
  setTimeout(() => {
    ctx.sendMessageToChat(rawTranscript);
  }, 350);

  return true;
}
