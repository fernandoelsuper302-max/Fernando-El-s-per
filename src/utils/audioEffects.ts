/**
 * High-tech Synthesizer Audio Effects for JARVIS HUD Cockpit
 * Generates high-fidelity Iron Man sci-fi sound effects using Web Audio API
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playSciFiSound = (type: "startup" | "scan" | "success" | "error" | "abort" | "click" | "alarm", volume: number = 0.5) => {
  try {
    if (typeof window === "undefined") return;
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    
    // Create master volume node
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, time + 0.02);
    gainNode.connect(ctx.destination);

    switch (type) {
      case "alarm": {
        // High-priority dual tactical red alert emergency warble
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sawtooth";
        osc2.type = "sine";
        
        osc1.frequency.setValueAtTime(880, time);
        osc1.frequency.linearRampToValueAtTime(440, time + 0.18);
        osc1.frequency.linearRampToValueAtTime(880, time + 0.36);
        
        osc2.frequency.setValueAtTime(440, time);
        osc2.frequency.linearRampToValueAtTime(220, time + 0.18);
        osc2.frequency.linearRampToValueAtTime(440, time + 0.36);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        
        gainNode.gain.setValueAtTime(volume * 0.35, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
        
        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.5);
        osc2.stop(time + 0.5);
        break;
      }
      case "startup": {
        // Glorious Arc Reactor power-up sound (ascending frequency sweeps)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(120, time);
        // Sweep up to 880Hz
        osc1.frequency.exponentialRampToValueAtTime(880, time + 0.6);
        
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(50, time);
        osc2.frequency.exponentialRampToValueAtTime(330, time + 0.8);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(volume * 0.25, time + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.9);
        
        osc1.start(time);
        osc2.start(time);
        
        osc1.stop(time + 1.0);
        osc2.stop(time + 1.0);
        break;
      }
      
      case "scan": {
        // High pitched laser sonar sweep
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1500, time);
        osc.frequency.exponentialRampToValueAtTime(400, time + 0.35);
        
        osc.connect(gainNode);
        
        gainNode.gain.setValueAtTime(volume * 0.2, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        
        osc.start(time);
        osc.stop(time + 0.45);
        break;
      }
      
      case "success": {
        // Double positive chime (Power up/Locked confirmation)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(523.25, time); // C5
        osc1.frequency.setValueAtTime(659.25, time + 0.12); // E5
        osc1.frequency.setValueAtTime(783.99, time + 0.24); // G5
        
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(1046.50, time + 0.12); // C6
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(volume * 0.2, time + 0.02);
        gainNode.gain.setValueAtTime(volume * 0.2, time + 0.24);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
        
        osc1.start(time);
        osc2.start(time + 0.12);
        
        osc1.stop(time + 0.6);
        osc2.stop(time + 0.6);
        break;
      }
      
      case "error": {
        // Warning low double buzzer (BEEP BEEP)
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, time);
        
        // Lowpass filter to make it warmer/buzzier instead of harsh
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, time);
        
        osc.connect(filter);
        filter.connect(gainNode);
        
        // Double pulse pattern
        gainNode.gain.setValueAtTime(volume * 0.3, time);
        gainNode.gain.setValueAtTime(0.01, time + 0.12);
        gainNode.gain.setValueAtTime(volume * 0.3, time + 0.18);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        
        osc.start(time);
        osc.stop(time + 0.4);
        break;
      }
      
      case "abort": {
        // Quick descending sweep
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.linearRampToValueAtTime(100, time + 0.25);
        
        osc.connect(gainNode);
        
        gainNode.gain.setValueAtTime(volume * 0.2, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        
        osc.start(time);
        osc.stop(time + 0.3);
        break;
      }

      case "click": {
        // Miniature tactual clicks for buttons
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, time);
        
        osc.connect(gainNode);
        
        gainNode.gain.setValueAtTime(volume * 0.15, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        
        osc.start(time);
        osc.stop(time + 0.06);
        break;
      }
    }
  } catch (error) {
    console.debug("Web Audio synthesis is blocked until first user interaction:", error);
  }
};
