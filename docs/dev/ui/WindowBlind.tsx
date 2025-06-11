/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { ComponentChildren, JSX, VNode } from "$tsx-preact";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "$tsx-preact/hooks";
// import { signal, useSignal } from "$tsx-preact-signal";

import { WindowBlindBox1, WindowBlindBox2 } from "./WindowBlindBox.tsx";
import {
  IconArrowL,
  IconArrowR,
  IconLocked,
  IconToggle,
} from "./WindowBlindIcon.tsx";

import type { CustomCSSProperties } from "../style/types.ts";

type WindowBlindProps = {
  way?: "ROW" | "COL"; // Kierunek podziału
  divis: string; // Rozmiar dividera, np. "10px"
  children: ComponentChildren; // Zamiast box1 i box2
};

function WindowBlind({
  way = "ROW", // Domyślna wartość to podział pionowy
  divis, // = "8px",
  children,
}: WindowBlindProps): VNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState(50); // Pozycja dividera w %
  const [isDragging, setIsDragging] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [toggleStep, setToggleStep] = useState(1);
  const [maxPosition, setMaxPosition] = useState(100);

  // Używamy `useLayoutEffect`, bo działa synchronicznie po mutacjach DOM, co zapobiega "mignięciu".
  useLayoutEffect(() => {
    const calculateMax = () => {
      if (containerRef.current && dividerRef.current) {
        if (way === "ROW") {
          const containerWidth = containerRef.current.offsetWidth;
          const dividerWidth = dividerRef.current.offsetWidth;
          if (containerWidth > 0) {
            setMaxPosition(100 - (dividerWidth / containerWidth) * 100);
          }
        } else { // 'COL'
          const containerHeight = containerRef.current.offsetHeight;
          const dividerHeight = dividerRef.current.offsetHeight;
          if (containerHeight > 0) {
            setMaxPosition(100 - (dividerHeight / containerHeight) * 100);
          }
        }
      }
    };

    calculateMax(); // Oblicz raz na początku

    // Oblicz ponownie przy zmianie rozmiaru okna
    globalThis.addEventListener("resize", calculateMax);
    return () => globalThis.removeEventListener("resize", calculateMax);
  }, [way]); // Uruchom ponownie, jeśli zmieni się kierunek (`way`)

  // Funkcja do obsługi przesuwania myszą i dotykiem
  const handleMove = useCallback((clientX: number, clientY: number) => {
    // Sprawdzamy, czy wszystkie potrzebne elementy istnieją
    if (
      !isDragging || isLocked || !containerRef.current || !dividerRef.current
    ) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let newPositionPercent = 0;

    if (way === "ROW") {
      const mousePosPx = clientX - containerRect.left;
      newPositionPercent = (mousePosPx / containerRect.width) * 100;
    } else {
      const mousePosPx = clientY - containerRect.top;
      newPositionPercent = (mousePosPx / containerRect.height) * 100;
    }
    // Ograniczamy pozycję używając `maxPosition` ze stanu
    setPosition(Math.max(0, Math.min(newPositionPercent, maxPosition)));
  }, [isDragging, isLocked, way, maxPosition]);

  // Obsługa zdarzeń globalnych (gdy kursor wyjedzie poza komponent)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) =>
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      globalThis.addEventListener("mousemove", handleMouseMove);
      globalThis.addEventListener("touchmove", handleTouchMove);
      globalThis.addEventListener("mouseup", handleMouseUp);
      globalThis.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      globalThis.removeEventListener("mousemove", handleMouseMove);
      globalThis.removeEventListener("touchmove", handleTouchMove);
      globalThis.removeEventListener("mouseup", handleMouseUp);
      globalThis.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMove]);

  // Handler dla strzałek - również używa `maxPosition`
  const handleNudge = (amount: number) => {
    if (isLocked) return;
    setPosition((prev) => Math.max(0, Math.min(prev + amount, maxPosition)));
  };

  const handleToggle = () => {
    if (isLocked) return;
    setToggleStep((prevStep) => (prevStep + 1) % 4);
  };

  useEffect(() => {
    // Mapa stanów teraz dynamicznie używa `maxPosition` zamiast sztywnego 100
    const togglePositions = [0, 50, maxPosition, 50];
    setPosition(togglePositions[toggleStep]);
  }, [toggleStep, maxPosition]); // Uruchom, gdy zmieni się krok lub obliczona maksymalna pozycja

  let panel1Content: ComponentChildren = null;
  let panel2Content: ComponentChildren = null;

  const childrenArray = Array.isArray(children) ? children : [children];
  for (const child of childrenArray) {
    if (child && typeof child === "object" && "type" in child) {
      if (child.type === WindowBlindBox1) {
        panel1Content = child;
      } else if (child.type === WindowBlindBox2) {
        panel2Content = child;
      }
    }
  }

  const style: CustomCSSProperties = {
    "--whb-divider-size": divis,
    "--whb-position": `${position}%`,
  };

  return (
    <div
      ref={containerRef}
      className={`whb-container ${way === "ROW" ? "whb-row" : "whb-col"} ${
        isLocked ? "whb-locked" : ""
      }`}
      style={style}
    >
      <div className="whb-panel whb-box1">{panel1Content}</div>

      <div
        ref={dividerRef}
        className="whb-divider"
        onMouseDown={() => !isLocked && setIsDragging(true)}
        onTouchStart={() => !isLocked && setIsDragging(true)}
      >
        <div className="whb-controls">
          <button
            type="button"
            onClick={() => setIsLocked((prev) => !prev)}
            title="Zablokuj przesuwanie"
          >
            <IconLocked locked={isLocked} />
          </button>
          <button
            type="button"
            onClick={() => handleNudge(-5)}
            title="Przesuń w lewo/górę o 5%"
          >
            <IconArrowL />
          </button>
          <button type="button" onClick={handleToggle} title="Przełącz widok">
            <IconToggle />
          </button>
          <button
            type="button"
            onClick={() => handleNudge(5)}
            title="Przesuń w prawo/dół o 5%"
          >
            <IconArrowR />
          </button>
        </div>
      </div>

      <div className="whb-panel whb-box2">{panel2Content}</div>
    </div>
  );
}

export { WindowBlind, WindowBlindBox1, WindowBlindBox2 };
