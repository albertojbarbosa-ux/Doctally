import LogoMark from "../assets/logo-mark.svg";

const ITENS_NAV = [
  { id: "dashboard", label: "Visão Geral", icone: "◎" },
  { id: "pacientes", label: "Pacientes", icone: "▤" },
  { id: "prontuarios", label: "Prontuários", icone: "▥", gatilhoModulo: "prontuarios" },
  { id: "receitas", label: "Receitas", icone: "✎", gatilhoModulo: "receitas" },
  { id: "faturamento", label: "Faturamento", icone: "$", gatilhoModulo: "faturamento" },
  { id: "modulos", label: "Módulos", icone: "▧" },
  { id: "configuracoes", label: "Configurações", icone: "⚙", emBreve: true },
];

const hoje = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date());

// Um item com gatilhoModulo é "contratável": mostra cadeado quando a clínica não tem o
// módulo, mas continua clicável (leva para a página de Módulos em vez de ficar inerte).
function contratado(entitlements, chave) {
  const item = entitlements?.find((m) => m.chave === chave);
  return item?.status === "Contratado" || item?.status === "Cortesia";
}

export default function Layout({ paginaAtiva, aoNavegar, sessao, aoSair, entitlements, children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 232,
          background: "var(--sidebar-bg)",
          padding: "1.25rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0 0.25rem" }}>
          <img src={LogoMark} alt="" width={34} height={34} />
          <span style={{ fontFamily: "var(--font-brand)", fontSize: "1.9rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>
            Doctally
          </span>
        </div>

        <div
          style={{
            background: "var(--surface)",
            borderRadius: 10,
            padding: "0.75rem 0.85rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.15rem",
          }}
        >
          <strong style={{ fontSize: "0.9rem" }}>{sessao.nome}</strong>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{sessao.papel}</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {ITENS_NAV.map((item) => {
            const ativo = paginaAtiva === item.id;
            const bloqueadoPorModulo = item.gatilhoModulo && !contratado(entitlements, item.gatilhoModulo);
            const destino = bloqueadoPorModulo ? "modulos" : item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.emBreve}
                onClick={() => aoNavegar(destino)}
                title={item.emBreve ? "Em breve" : bloqueadoPorModulo ? "Módulo não contratado — clique para assinar" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  padding: "0.6rem 0.75rem",
                  borderRadius: 8,
                  border: "none",
                  background: ativo ? "var(--sidebar-active-bg)" : "transparent",
                  color: ativo ? "var(--primary-dark)" : "var(--sidebar-text)",
                  fontWeight: ativo ? 700 : 500,
                  fontSize: "0.9rem",
                  textAlign: "left",
                  cursor: item.emBreve ? "default" : "pointer",
                  opacity: item.emBreve ? 0.55 : 1,
                  boxShadow: ativo ? "0 1px 3px rgba(75, 120, 99, 0.15)" : "none",
                }}
              >
                <span aria-hidden style={{ width: 18, textAlign: "center" }}>{item.icone}</span>
                {item.label}
                {item.emBreve && (
                  <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: "var(--text-muted)" }}>em breve</span>
                )}
                {bloqueadoPorModulo && (
                  <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--accent)" }}>🔒</span>
                )}
              </button>
            );
          })}
        </nav>

        {sessao.ehSuperAdmin && (
          <button
            type="button"
            onClick={() => aoNavegar("adminCortesia")}
            style={{
              textAlign: "left",
              background: paginaAtiva === "adminCortesia" ? "var(--sidebar-active-bg)" : "transparent",
              color: "var(--sidebar-text)",
              border: "1px dashed var(--border)",
              fontSize: "0.8rem",
            }}
          >
            ⚙ Admin — cortesias
          </button>
        )}

        <button
          type="button"
          onClick={aoSair}
          style={{ marginTop: sessao.ehSuperAdmin ? 0 : "auto", textAlign: "left", color: "var(--danger)", border: "none", background: "transparent", padding: "0.5rem 0.75rem" }}
        >
          Sair
        </button>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.75rem",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Geral
            </div>
            <h1 style={{ fontSize: "1.3rem" }}>
              {ITENS_NAV.find((i) => i.id === paginaAtiva)?.label ?? "Visão Geral"}
            </h1>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{hoje}</div>
        </header>

        <main style={{ flex: 1, padding: "1.75rem", background: "var(--bg)" }}>{children}</main>
      </div>
    </div>
  );
}
