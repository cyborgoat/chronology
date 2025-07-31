# chronology

## Introduction

Chronology is a webapp written in Vite with React and TypeScript, powered by nivo (a React chart visualization library) and Tailwind CSS. It is designed to help users create and manage timelines of AI projects' performances, allowing for a visual representation of historical data such as accuracy, loss, and other metrics over time.

## Features

- **Customizable Projects**: Create, edit, and manage multiple AI projects with a clean, minimal interface.
- **Timeline Visualization**: View project performance metrics over time using nivo line charts.
- **Data Management**: Add, edit, and delete project data by interacting with chart points or using a compact data table.
- **Modern UI**: Built with Tailwind CSS and shadcn/ui for a beautiful, minimal, and consistent design.
- **Minimal Design**: All components use shadcn/ui for a professional, compact, and informative look.

## Tech Stack

- **Vite**: Fast build tool and development server
- **React**: UI library with TypeScript support
- **Nivo**: Data visualization library for charts
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library for minimal, modern UI
- **Lucide React**: Beautiful icons

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Final Steps & Deployment

1. Review your changes and commit:

   ```bash
   git add .
   git commit -m "feat: finalize shadcn/ui integration and minimal design"
   git push
   ```

2. Your project is now ready for deployment or further collaboration!

---

**Chronology** now features a fully minimal, compact, and professional UI powered by shadcn/ui. All project management, data, and visualization features are clean and easy to use.

## Development

The project uses:

- Nivo's ResponsiveLine component for timeline charts
- Tailwind CSS for styling with the official Vite plugin
- TypeScript for type safety
- ESLint for code quality

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

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

export default tseslint.config([
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
