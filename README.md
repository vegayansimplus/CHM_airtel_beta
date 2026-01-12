<<<<<<< HEAD
# CHM_airtel_beta
Scalable version of Airtel CHM Project
=======
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
# +++++++++++++Preferred Folder structure+++++++++++++++++++++++++
```ts
src
├── app/                      # Global application layer (Redux, Providers, Config)
│   ├── store.ts
│   ├── rootReducer.ts
│   ├── hooks.ts              # useAppSelector / useAppDispatch
│   ├── AppProvider.tsx       # ThemeProvider, ReduxProvider, RouterProvider
│   └── config/               # Global app configs
│       ├── constants.ts
│       └── env.ts
│
├── features/                 # Feature (Domain) based architecture
│   ├── auth/
│   │   ├── api/              # RTK Query API layer
│   │   │   └── auth.api.ts
│   │   ├── slices/           # Redux slices for feature
│   │   │   └── auth.slice.ts
│   │   ├── components/       # UI components of this feature
│   │   │   └── LoginForm.tsx
│   │   ├── pages/            # Screen/page components
│   │   │   └── LoginPage.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── types/
│   │       └── auth.types.ts
│   │
│   ├── dashboard/
│   │   ├── api/
│   │   ├── slices/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── types/
│   │
│   └── ... other modules
│
├── components/               # Reusable components (non-feature-specific)
│   ├── ui/                   # Atomic UI (Buttons, Inputs)
│   │   ├── AppButton.tsx
│   │   ├── AppTextField.tsx
│   │   └── AppSelect.tsx
│   ├── layout/               # Layout: Sidebar, Header, AppShell
│   │   ├── MainLayout.tsx
│   │   └── Sidebar.tsx
│   └── common/               # Widgets (Dialogs, Tables, Loaders)
│       ├── Loader.tsx
│       ├── DataTable.tsx
│       └── ConfirmDialog.tsx
│
├── routes/
│   ├── AppRoutes.tsx
│   ├── ProtectedRoute.tsx
│   └── RouteConfig.ts        # Dynamic route config
│
├── services/                 # External services or wrappers
│   ├── axiosClient.ts        # Axios instance (if not using RTKQ everywhere)
│   ├── storage.service.ts    # LocalStorage/Session helpers
│   └── errorHandler.ts
│
├── hooks/                    # Global reusable hooks
│   ├── useDebounce.ts
│   ├── usePagination.ts
│   └── useToggle.ts
│
├── styles/                   # MUI theme system
│   ├── theme.ts              # Main MUI theme config
│   ├── palette.ts
│   ├── typography.ts
│   ├── components.ts         # reuse style overrides
│   └── global.css
│
├── utils/                    # Helper utilities (pure functions)
│   ├── dateUtils.ts
│   ├── numberUtils.ts
│   ├── stringUtils.ts
│   └── validators.ts
│
├── assets/                   # Static assets
│   ├── images/
│   ├── icons/
│   └── svg/
│
├── types/                    # Global TS types
│   ├── api.types.ts
│   ├── common.types.ts
│   └── global.d.ts
│
├── index.tsx
└── App.tsx
```
>>>>>>> 64e9c22 (Initial commit)
