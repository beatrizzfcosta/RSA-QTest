# Frontend — React (Vite)

Interface do **RSA-QTest**: vista de desenvolvimento (parâmetros e resultados); no cabeçalho, botão circular **!** abre um modal com a explicação. Validação `tamanho < N` (`N = p×q`), métricas, gráfico (Chart.js) e descriptografia em placeholder até existir API.

### Checklist de implementação

- [ ] Substituir mocks por chamadas `fetch` à API (`VITE_API_URL` em `.env.local`).
- [ ] Alinhar tipos em `types.ts` com o contrato JSON do backend.
- [ ] Tratamento de erros de rede e estados de carregamento nas vistas principais.
- [ ] (Opcional) Testes de componente ou E2E conforme `../tests/README.md`.

### Estrutura (`src/`)

| Ficheiro / pasta | Função |
|------------------|--------|
| `App.tsx` | Estado global, validação, mock de métricas; compõe Header, Modal, Page |
| `types.ts`, `constants.ts` | Tipos e pares p,q |
| `chart/register.ts` | Registo único do Chart.js |
| `components/Header.tsx` | Cabeçalho e botão de ajuda |
| `components/Modal.tsx` | Overlay genérico (conteúdo via `children`) |
| `components/Page.tsx` | Formulário e resultados (métricas, gráfico, descriptografia) |
| `components/Metrics.tsx` | Três cartões de métricas |
| `components/Charts.tsx` | Dois gráficos de barras (`FactorCharts`: tempo e custo computacional) |

## Comandos

```bash
cd frontend
npm install
npm run dev
```

Abrir o URL indicado no terminal (por defeito `http://localhost:5173`).

Build de produção:

```bash
cd frontend
npm run build
npm run preview
```

Variável opcional (quando o backend existir): criar `.env.local` com `VITE_API_URL=http://127.0.0.1:8000` e usar nos pedidos `fetch`.
