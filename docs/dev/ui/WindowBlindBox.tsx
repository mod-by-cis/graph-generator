/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { ComponentChildren, JSX, VNode } from "$tsx-preact";

type Props = { children: ComponentChildren };

// Te komponenty po prostu renderują swoje dzieci.
// Służą jako identyfikatory dla rodzica `WindowBlind`.
function WindowBlindBox1({ children }: Props): VNode {
  return <>{children}</>;
}
function WindowBlindBox2({ children }: Props): VNode {
  return <>{children}</>;
}

export { WindowBlindBox1, WindowBlindBox2 };
