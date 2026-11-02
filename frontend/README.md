# Sistema de Pagamentos — Interface

Apresentação interativa (slides) e simulador do projeto Java em `../src/main/java`.

- **Apresentação** — 9 slides explicando Strategy, Factory, Chain of Responsibility e Adapter.
  Os trechos de código são importados direto dos arquivos `.java` (`?raw`), então ficam sempre em sincronia.
- **Simulador** — executa o código Java de verdade pela API Spring Boot e anima cada etapa.
  Se a API estiver desligada, usa o porte em TypeScript (`src/domain/pagamentos.ts`) automaticamente.

## Rodando

1. **API (opcional)** — na raiz do projeto:

   ```bash
   mvn spring-boot:run
   ```

   Ou rode `PagamentosApiApplication` pelo IntelliJ. Sobe em http://localhost:8080
   (`POST /api/pagamentos`, `GET /api/pagamentos/status`).

2. **Interface** — nesta pasta:

   ```bash
   npm install
   npm run dev
   ```

   Abra http://localhost:5173. Para usar outra URL de API: `VITE_API_URL=http://... npm run dev`.

O `Main.java` continua funcionando como antes, imprimindo no console.

## Atalhos na apresentação

| Tecla | Ação |
|-------|------|
| `→` / `Espaço` / `PageDown` | próximo slide |
| `←` / `PageUp` | slide anterior |
| `Home` / `End` | primeiro / último |
| `F` | tela cheia |

Cada slide tem link próprio (`#/slides/3`); o simulador fica em `#/simulador`.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Motion · Lucide
