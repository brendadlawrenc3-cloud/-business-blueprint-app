# Blueprint — Business OS

A CEO operating system with two modules:

- **CEO Command Center** — weekly scoreboard, meeting cadence, and decision flow.
- **AI Business Integration (ALIGN Framework™)** — a strategic decision method that helps CEOs decide *why, where, when, how,* and *what* AI should do for the business. Strategy determines where AI creates value, not the other way round.

Full methodology and gap analysis: [`docs/ALIGN_FRAMEWORK.md`](docs/ALIGN_FRAMEWORK.md).

```bash
npm install
npm run dev      # open /#align for the ALIGN workspace
npm run build
```

### ALIGN in the app
| Tab | Decision | What it does |
|---|---|---|
| Assess | WHY | Strategic Alignment Map, the "Is this an AI problem?" diagnostic, current AI use inventory + acceptable-use policy, AI exposure check, company profile and change capacity |
| Locate | WHERE | Value Opportunity Map, Business Value Test, risk-adjusted economics |
| Identify | WHEN | Six-dimension readiness with critical-deficiency rules |
| Govern | HOW | Integration business case, oversight model, mandatory risk gates, workforce impact, build/buy/partner |
| Navigate | WHAT | Performance scorecard, value-realization chain, sustain plan, scale/iterate/stop |
| Decision Matrix | — | Weighted scoring + gates → Invest Now / Build Readiness / Pilot & Validate / Do Not Pursue; leadership overrides; capacity check; send to Decision Flow |
| Operating Model | — | Decision rights, portfolio review rhythm (adds to Command Center meetings), workforce commitment and communication plan, portfolio balance |
| Advisor | — | CEO validation log, calibration suggestions, editable decision thresholds, IP readiness, advisory offers |

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
