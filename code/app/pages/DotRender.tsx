/**
 * @file ./code/app/pages/DotRender.tsx
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-12T21:46:03.495Z+02:00
 * @description Komponentem sekcji tematycznej DotRender z obsługą dotyku.
 */

/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { VNode } from "$tsx-preact";
import { useEffect, useRef, useState, useCallback } from "$tsx-preact/hooks";
import { dotContentSignal } from "../core/state-dot-current.ts";

declare global {
  interface Window {
    Graphviz: any;
  }
}

/**
 * Komponent odpowiedzialny za renderowanie kodu DOT do obrazka SVG
 * przy użyciu nowoczesnego silnika @hpcc-js/wasm (Graphviz).
 */
export function PageDotRender(): VNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgGroupRef = useRef<SVGGElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(
    "Inicjalizacja silnika Graphviz...",
  );

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // --- NOWA LOGIKA: Refy do śledzenia stanu gestów dotykowych ---
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastPanRef = useRef({ x: 0, y: 0 });
  const pinchDistStartRef = useRef(0);
  const lastZoomRef = useRef(1);

  useEffect(() => {
    let isMounted = true;
    const renderGraph = async (dotCode: string) => {
      if (!containerRef.current || !isMounted) return;
      try {
        setStatus("Renderowanie grafu...");
        setError(null);
        // Resetuj zoom i pan przy każdym nowym renderowaniu
        setZoom(1);
        setPan({ x: 0, y: 0 });
        // Resetuj stan gestów przy nowym renderze
        lastZoomRef.current = 1;
        lastPanRef.current = { x: 0, y: 0 };
        
        const graphviz = await window.Graphviz.load();
        const svgString = graphviz.layout(dotCode, "svg", "dot");

        if (containerRef.current && isMounted) {
          containerRef.current.innerHTML = svgString;
          const svgElement = containerRef.current.querySelector("svg");
          if (svgElement) {
            svgElement.removeAttribute("width");
            svgElement.removeAttribute("height");
            svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
            svgGroupRef.current = svgElement.querySelector("g");
          }
        }
        setStatus("");
      } catch (e) {
        console.error("Błąd renderowania Graphviz:", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        if (isMounted) {
            setError(`Błąd renderowania: ${errorMessage}`);
            if (containerRef.current) { containerRef.current.innerHTML = ""; }
            setStatus("");
        }
      }
    };

    const unsubscribe = dotContentSignal.subscribe(renderGraph);
    
    // Używamy interwału, aby upewnić się, że `window.Graphviz` jest dostępne
    const checkInterval = setInterval(() => {
        if(window.Graphviz && isMounted) {
            clearInterval(checkInterval);
            renderGraph(dotContentSignal.peek());
        }
    }, 100);

    // --- NOWA LOGIKA: Dodawanie event listenerów dla dotyku ---
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart as unknown as EventListener);
      container.addEventListener('touchmove', handleTouchMove as unknown as EventListener);
      container.addEventListener('touchend', handleTouchEnd as unknown as EventListener);
    }

    return () => {
      isMounted = false; 
      unsubscribe(); 
      clearInterval(checkInterval);
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart as unknown as EventListener);
        container.removeEventListener('touchmove', handleTouchMove as unknown as EventListener);
        container.removeEventListener('touchend', handleTouchEnd as unknown as EventListener);
      }
    };
  }, []);

  useEffect(() => {
    if (svgGroupRef.current) {
      svgGroupRef.current.setAttribute(
        "transform",
        `translate(${pan.x}, ${pan.y}) scale(${zoom})`,
      );
    }
  }, [zoom, pan]);
  
  // --- NOWA LOGIKA: Handlery zdarzeń dotykowych ---

  const getDistance = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) { // Przesuwanie (pan)
      panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) { // Powiększanie (pinch)
      pinchDistStartRef.current = getDistance(e.touches);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault(); // Zapobiega domyślnemu przewijaniu strony
    if (e.touches.length === 1) { // Przesuwanie
      const dx = e.touches[0].clientX - panStartRef.current.x;
      const dy = e.touches[0].clientY - panStartRef.current.y;
      setPan({ x: lastPanRef.current.x + dx, y: lastPanRef.current.y + dy });
    } else if (e.touches.length === 2) { // Powiększanie
      const newDist = getDistance(e.touches);
      const factor = newDist / pinchDistStartRef.current;
      setZoom(Math.max(0.1, lastZoomRef.current * factor));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    // "Zatwierdź" ostatnią pozycję po zakończeniu gestu
    lastPanRef.current = pan;
    lastZoomRef.current = zoom;
  }, [pan, zoom]);


  // --- Istniejące Handlery dla przycisków (zaktualizowane) ---
  const handleZoom = (factor: number) => {
    const newZoom = Math.max(0.1, zoom * factor);
    setZoom(newZoom);
    lastZoomRef.current = newZoom; // Aktualizuj ref, aby gesty dotykowe były spójne
  };
  
  const handlePan = (dx: number, dy: number) => {
    const PAN_STEP = 50;
    const newPan = {
      x: pan.x + dx * PAN_STEP,
      y: pan.y + dy * PAN_STEP,
    };
    setPan(newPan);
    lastPanRef.current = newPan; // Aktualizuj ref, aby gesty dotykowe były spójne
  };

  return (
    <div class="dot-render-wrapper">
      {status && <div class="render-status">{status}</div>}
      {error && <div class="render-error">{error}</div>}

      <div class="render-controls">
        <button class="render-controls_ZP" type="button" title="Powiększ" onClick={() => handleZoom(1.25)}>+</button>
        <button class="render-controls_ZM" type="button" title="Pomniejsz" onClick={() => handleZoom(1 / 1.25)}>-</button>
        <button class="render-controls_TL" type="button" title="Góra-Lewo" onClick={() => handlePan(-1, -1)}>⇖</button>
        <button class="render-controls_TT" type="button" title="Góra" onClick={() => handlePan(0, -1)}>⇑</button>
        <button class="render-controls_TR" type="button" title="Góra-Prawo" onClick={() => handlePan(1, -1)}>⇗</button>
        <button class="render-controls_LL" type="button" title="Lewo" onClick={() => handlePan(-1, 0)}>⇐</button>
        <button class="render-controls_RR" type="button" title="Prawo" onClick={() => handlePan(1, 0)}>⇒</button>
        <button class="render-controls_BL" type="button" title="Dół-Lewo" onClick={() => handlePan(-1, 1)}>⇙</button>
        <button class="render-controls_BB" type="button" title="Dół" onClick={() => handlePan(0, 1)}>⇓</button>
        <button class="render-controls_BR" type="button" title="Dół-Prawo" onClick={() => handlePan(1, 1)}>⇘</button>
      </div>

      <div
        ref={containerRef}
        class="render-container"
        style={{ display: status || error ? "none" : "block", touchAction: 'none' }}
      />
    </div>
  );
}
