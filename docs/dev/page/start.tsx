/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */

import {
  WindowBlind,
  WindowBlindBox1,
  WindowBlindBox2,
} from "../ui/WindowBlind.tsx";
import { signal, useSignal } from "$tsx-preact-signal";

export function PageStart() {
  return (
    <main>
      <WindowBlind way="ROW" divis="30px">
        <WindowBlindBox1>
          A
        </WindowBlindBox1>
        <WindowBlindBox2>
          B
        </WindowBlindBox2>
      </WindowBlind>
    </main>
  );
}
