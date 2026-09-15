export default function Modal({ titulo, aoFechar, children, largura = 380 }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20, 30, 24, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={aoFechar}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: 12,
          padding: "1.5rem",
          width: largura,
          maxWidth: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.05rem", margin: 0 }}>{titulo}</h3>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.1rem", padding: 0, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
