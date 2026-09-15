# Doctally

Sistema multi-tenant para clínicas médicas: cadastro de pacientes, prontuário,
receituário (simples e controlado), faturamento e preenchimento de anamnese
assistido por IA a partir do áudio da consulta.

## Banco de dados

**Neon** (PostgreSQL free tier), separado do banco do Aviation Operations Platform.
Escolhido por não pausar por inatividade (bom pra fase de desenvolvimento ativo) e
por ser Postgres puro — dá pra migrar pra qualquer outro provedor depois sem
reescrever nada. Crie um projeto em neon.tech e cole a connection string em
`ConnectionStrings__Default` (local: `appsettings.json` — não commitar a senha real;
no Render: variável de ambiente do serviço `doctally-api`).

## Status atual (MVP em andamento)

Implementado até agora — **cadastro de pacientes + base do prontuário + autenticação**:

- Backend (`backend/Doctally.Api`, .NET 8 + EF Core + PostgreSQL/Neon)
  - Modelos: `Clinica`, `Usuario`, `Paciente`, `Atendimento` (prontuário/anamnese), `LogAuditoria`
  - Isolamento multi-tenant via query filter global no `DoctallyDbContext` (todo dado é filtrado por `ClinicaId`)
  - **Autenticação por JWT**: `POST /api/auth/registrar-clinica` (cria a clínica + usuário admin) e `POST /api/auth/login`; o token carrega a claim `clinica_id`, que o `TenantResolutionMiddleware` usa para isolar os dados automaticamente
  - Senhas com hash via BCrypt
  - `PacientesController` protegido com `[Authorize]` e log de auditoria em toda leitura/escrita (exigência LGPD)
  - Modelo de `Atendimento` já com os campos de anamnese estruturados, prontos para receber preenchimento automático (`Origem = IaTranscricao`) com campo obrigatório de revisão médica antes de finalizar
- Frontend (`frontend`, React + Vite)
  - Telas de login e cadastro de clínica (onboarding do produto)
  - Tela de listagem de pacientes com busca
  - Tela de cadastro com checkbox obrigatório de consentimento LGPD
- `render.yaml` + `Dockerfile` para deploy (API + site estático no Render; banco no Neon), seguindo o mesmo padrão do Aviation Operations Platform

⚠️ **Importante**: não consegui compilar o backend .NET neste ambiente (sem SDK
instalado no sandbox), então o código C# não foi validado por build/testes
automáticos — revise antes de rodar em produção. O frontend foi buildado e
validado normalmente.

## Não implementado ainda (próximas fases)

1. **Receituário simples e controlado** — a controlada exige assinatura digital ICP-Brasil (padrão escolhido) e trilha própria com CRM/UF do médico, já modelados em `Usuario`
2. **Faturamento**
3. **IA de anamnese**: captura de áudio → transcrição (Whisper/STT) → preenchimento estruturado dos campos de `Atendimento` → revisão obrigatória do médico antes de finalizar. O modelo de dados já reserva o campo `Origem` e `RevisadoPeloMedico` para isso.
4. Migrations do EF Core (não geradas — dependem do SDK instalado)
5. Criptografia em repouso de campos sensíveis (CPF, dados clínicos)
6. Recuperação de senha, convite de novos usuários (médico/recepção) dentro de uma clínica já existente

## Rodando localmente

```bash
# Backend (requer .NET 8 SDK e Postgres rodando)
cd backend/Doctally.Api
dotnet restore
dotnet ef database update   # após instalar dotnet-ef e gerar a migration inicial
dotnet run

# Frontend
cd frontend
npm install
npm run dev
```
