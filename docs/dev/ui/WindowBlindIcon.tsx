/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { JSX } from "$tsx-preact";

const IconLocked = ({ locked }: { locked: boolean }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    {locked
      ? (
        <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" />
      )
      : (
        <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" />
      )}
  </svg>
);
const IconArrowL = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
  </svg>
);
const IconArrowR = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
  </svg>
);
const IconToggle = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M3 17h18v-2H3v2zm0-7h18v-2H3v2zm0-5h18V3H3v2z" />
  </svg>
);

export { IconArrowL, IconArrowR, IconLocked, IconToggle };
