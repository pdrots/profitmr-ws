# ProfitMR

**Português** · [English](README.en.md)

Calculadora de cartões-presente do Microsoft Rewards e página oficial da extensão ProfitMR para Firefox.

[Acessar o site](https://profitmr.vercel.app) · [Instalar no Firefox](https://addons.mozilla.org/pt-BR/firefox/addon/profitmr/) · [Código-fonte](https://github.com/pdrots/profitmr-ws)

## Sobre o projeto

A ProfitMR ajuda a comparar opções de resgate de cartões do Microsoft Rewards. Informe os custos em pontos exibidos na sua conta para avaliar combinações e estimativas.

O site não acessa sua conta Microsoft nem consulta o catálogo do Rewards. Confira sempre o custo exato na página oficial antes de resgatar.

## Recursos

- Cartões do Brasil (BRL), Estados Unidos (USD) e Espanha (EUR).
- Comparação de resgates com custos informados pelo usuário.
- Estimativa proporcional para valores personalizados, arredondada para cima.
- Interface em português, inglês e espanhol, com temas claro e escuro.
- Preferências e valores da calculadora salvos localmente no navegador.

## Extensão para Firefox

A extensão ProfitMR consulta custos de cartões do Rewards do Brasil, dos Estados Unidos e da Espanha em abas em segundo plano. É necessário estar conectado ao Microsoft Rewards; confira os valores encontrados antes de resgatar.

- [Instalar pela Mozilla Add-ons](https://addons.mozilla.org/pt-BR/firefox/addon/profitmr/)
- Compatível com Firefox 142 ou superior.
- Os dados da extensão não são sincronizados com o site.
- A extensão não lê nem armazena senhas ou cookies.

A extensão não é distribuída pela Chrome Web Store. Para Chrome, consulte o [guia de instalação manual](https://github.com/pdrots/profitmr-extension#chrome-manual-install).

## Tecnologias

- Angular
- TypeScript
- CSS
- Vercel

## Executar localmente

Requer Node.js 26 e npm.

```bash
npm install
npm start
```

O site ficará disponível em `http://localhost:4200`.

No PowerShell do Windows, se a política de execução bloquear `npm`, use `npm.cmd` nos comandos do projeto:

```powershell
npm.cmd install
npm.cmd start
npm.cmd run build
```

## Build e publicação

Para gerar o build de produção:

```bash
npm run build
```

Os arquivos gerados ficam em `dist/portfolio/browser`. A configuração em `vercel.json` define o comando de build e essa pasta como diretório de publicação. O repositório está conectado ao Vercel para publicar automaticamente atualizações da branch `main`.

## Estrutura principal

- `src/app/pages/rewards-calculator`: calculadora, apresentação da extensão, textos e lógica de cálculo.
- `src/app/pages/fluxo`: página de fluxo.
- `src/app/app.routes.ts`: rotas da aplicação.
- `public`: arquivos estáticos, como ícones.
