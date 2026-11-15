# ProfitMR

[Português](README.md) · **English**

Microsoft Rewards gift card calculator and official home of the ProfitMR Firefox extension.

[Visit the website](https://profitmr.vercel.app) · [Install for Firefox](https://addons.mozilla.org/en-US/firefox/addon/profitmr/) · [Source code](https://github.com/pdrots/profitmr-ws)

## About

ProfitMR helps compare Microsoft Rewards gift card redemption options. Enter the point costs shown in your account to evaluate combinations and estimates.

The website does not access your Microsoft account or browse the Rewards catalog. Always check the exact cost on the official Rewards page before redeeming.

## Features

- Gift cards for Brazil (BRL), the United States (USD), and Spain (EUR).
- Redemption comparisons based on costs entered by the user.
- Custom denomination estimates based on reference and maximum costs, when both are provided.
- Portuguese, English, and Spanish interface, with light and dark themes.
- Preferences and calculator values stored locally in the browser.

## Firefox extension

The ProfitMR extension looks up Microsoft Rewards gift card costs for Brazil, the United States, and Spain in background tabs. You must be signed in to Microsoft Rewards; review the results before redeeming.

- [Install from Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/profitmr/)
- Firefox 142 or later.
- Extension data is not synchronized with the website.
- The extension does not read or store passwords or cookies.

The extension is not distributed through the Chrome Web Store. For Chrome, see the [manual installation guide](https://github.com/pdrots/profitmr-extension#chrome-manual-install).

## Technologies

- Angular
- TypeScript
- CSS
- Vercel

## Run locally

Requires Node.js 26 and npm.

```bash
npm install
npm start
```

The website will be available at `http://localhost:4200`.

In Windows PowerShell, if the execution policy blocks `npm`, use `npm.cmd`:

```powershell
npm.cmd install
npm.cmd start
npm.cmd run build
```

## Build and deployment

To create a production build:

```bash
npm run build
```

Build output is written to `dist/portfolio/browser`. The `vercel.json` configuration defines the build command and output directory. The repository is connected to Vercel to automatically deploy updates pushed to the `main` branch.

## Main project structure

- `src/app/pages/rewards-calculator`: calculator, extension showcase, copy, and calculation logic.
- `src/app/pages/fluxo`: flow page.
- `src/app/app.routes.ts`: application routes.
- `public`: static assets such as icons.
