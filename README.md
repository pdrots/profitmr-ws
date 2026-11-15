# ProfitMR

Site da ProfitMR, com calculadora de cartões do Microsoft Rewards e apresentação da extensão para navegador.

## Rodar localmente

Requer Node.js 26 LTS e npm.

```bash
npm install
npm start
```

Abra `http://localhost:4200`.

## Build e Vercel

```bash
npm run build
```

A saída de produção fica em `dist/portfolio/browser`. O `vercel.json` já configura o comando de build e essa pasta como diretório de publicação. Novas páginas podem ser ligadas em `src/app/app.routes.ts`.

## Calculadora ProfitMR

A página inicial e a rota `/rewards` apresentam a calculadora ProfitMR para combinações de cartões do Brasil (BRL), Estados Unidos (USD) e Espanha (EUR), com denominações específicas por região, links para as páginas dos cartões e custos em pontos informados pelo usuário. A interface oferece português, inglês e espanhol, além de temas claro e escuro. Preferências e valores são salvos apenas no armazenamento local do navegador. Para cartões personalizados, o custo consultado é usado para aquele valor; outros valores são estimados proporcionalmente. Consulte no Microsoft Rewards o preço em pontos exato antes de resgatar.

O código da calculadora fica em `src/app/pages/rewards-calculator`: `rewards-calculator.component` coordena a página; `calculator-header` e `extension-showcase` isolam as seções visuais; `rewards-calculator.data.ts` reúne regiões, textos e constantes; `rewards-calculator.models.ts` define os tipos; `rewards-calculator.calculation.ts` contém o algoritmo de combinação; e `rewards-calculator.validation.ts` contém parsing e validação dos dados salvos.
