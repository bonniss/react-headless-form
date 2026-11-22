/**
 * A live integration demo, built from docs/integrations into doc_build/demos and
 * served from the docs' own origin (no third-party embed or service). In `pnpm dev`, run
 * `pnpm dev:demos` alongside to serve them from Vite.
 */
const REPO = "https://github.com/bonniss/react-headless-form";
const DEV_ORIGIN = "http://localhost:5180";

export default function LiveDemo({ lib, height = 760 }: { lib: string; height?: number }) {
  const path = `/react-headless-form/demos/${lib}/`;
  const src = process.env.NODE_ENV === "development" ? `${DEV_ORIGIN}${path}` : path;
  return (
    <div>
      <iframe
        src={src}
        title={`react-headless-form × ${lib}`}
        loading="lazy"
        style={{ width: "100%", height, border: "1px solid var(--rp-c-divider-light)", borderRadius: 8 }}
      />
      <p style={{ fontSize: 14 }}>
        <a href={src} target="_blank" rel="noreferrer">
          Open in a new tab
        </a>
        {" · "}
        <a href={`${REPO}/tree/main/docs/integrations/${lib}`} target="_blank" rel="noreferrer">
          Source
        </a>
      </p>
    </div>
  );
}
