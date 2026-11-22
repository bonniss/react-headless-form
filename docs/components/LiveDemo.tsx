import { useRef } from "react";

/**
 * A live integration demo, built from docs/integrations into doc_build/demos and
 * served from the docs' own origin (no third-party embed or service). In
 * development the demos come from the Vite server that `pnpm dev` starts.
 */
const REPO = "https://github.com/bonniss/react-headless-form";
const DEV_ORIGIN = "http://localhost:5180";

const linkButton = {
  cursor: "pointer",
  background: "none",
  border: 0,
  padding: 0,
  color: "var(--rp-c-link)",
  font: "inherit",
};

export default function LiveDemo({ lib, height = 620 }: { lib: string; height?: number }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const path = `/react-headless-form/demos/${lib}/`;
  const src = process.env.NODE_ENV === "development" ? `${DEV_ORIGIN}${path}` : path;
  return (
    <div>
      <iframe
        ref={frame}
        src={src}
        title={`react-headless-form × ${lib}`}
        loading="lazy"
        allowFullScreen
        style={{
          width: "100%",
          height,
          border: "1px solid var(--rp-c-divider-light)",
          borderRadius: 8,
          background: "#fff",
        }}
      />
      <p style={{ fontSize: 14, display: "flex", gap: 16 }}>
        <button type="button" style={linkButton} onClick={() => frame.current?.requestFullscreen?.()}>
          Full screen
        </button>
        <a href={src} target="_blank" rel="noreferrer">
          Open in a new tab
        </a>
        <a href={`${REPO}/tree/main/docs/integrations/${lib}`} target="_blank" rel="noreferrer">
          Source
        </a>
      </p>
    </div>
  );
}
