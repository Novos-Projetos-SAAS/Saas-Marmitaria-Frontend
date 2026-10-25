This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Checkout InfinitePay: desenvolvimento e testes

O carrinho público usa `/api/checkout/*` (BFF do Next.js), com sessão opaca
estabelecida antes do pedido. O segredo fica em cookie `__Host-`, HttpOnly,
Secure, SameSite=Lax e com validade máxima de 30 dias. No PostgreSQL ficam
somente o hash da sessão, a intenção UUID e o vínculo imutável com payload/pedido.
A referência STATUS só autoriza leitura; comprovantes exigem posse ou permissão
administrativa. Não use telefone/UUID como autenticação e não grave tokens no localStorage.

Configuração exclusivamente no servidor Next, em `.env.local` não versionado:

- `CHECKOUT_SITE_ORIGIN`: origem exata do Frontend, incluindo porta quando houver.
- `CHECKOUT_BACKEND_URL`: origem exata do Backend compatível, sem caminho/query.
- `NEXT_PUBLIC_API_URL`: origem pública da API já utilizada pelo sistema, sem segredos.

Em produção as duas origens do BFF devem usar HTTPS. Em `next dev` são aceitas
origens HTTP apenas em loopback; os cookies continuam Secure. O navegador precisa
suportar Web Locks em contexto seguro. O carrinho não faz fallback para uma
criação sem sessão quando essa proteção falha. Não colocar API Key no Frontend.

O Backend precisa da migration aditiva `20261024000100_checkout_sessoes.js`.
Ela cria apenas tabelas de sessões/vínculos e impede rollback destrutivo.
Não executar migrations em produção ou no banco H1 automaticamente.
Manter `INFINITEPAY_CHECKOUT_ENABLED=false` e a configuração financeira desativada.
Esta fase não instala transporte financeiro real nem inicia worker de cozinha.

Testes automatizados (repositórios lado a lado e Chrome instalado):

```powershell
npm ci
npm test
$env:TEST_DATABASE_URL='postgresql://codex_test@127.0.0.1:55439/infinitepay_phase1_test'
npm run test:browser
npm run lint
npm run build
```

Use exclusivamente PostgreSQL descartável loopback com nome `infinitepay_*test`.
O teste de navegador cria schemas sintéticos, inicia o Next local na porta55443,
usa os serviços do Backend com provedores injetados e encerra seus processos.
`CHECKOUT_BACKEND_REPOSITORY` permite indicar outro caminho para o repositório Backend.
O NODE_ENV=test pertence apenas ao harness automatizado; não é um modo para
ativar um ambiente operacional. Nenhuma API Key real ou configuração H1 é lida.
A única dependência nova é `@playwright/test`, de desenvolvimento e fora do bundle.

Os cenários exercitam o carrinho pelas telas existentes, Pix/Crédito simulados,
Dinheiro/Débito, duas abas, resposta perdida, timeout, reload, restauração de
cookies, confirmação sem retorno e comprovante restrito ao titular. Para observar
os cenários em uma janela, defina `CHECKOUT_BROWSER_HEADED=1` antes do comando.

O acompanhamento consulta somente o banco: no máximo20 consultas automáticas,
com intervalo crescente até30segundos e pausa em aba oculta. Atualizar/recarregar
não cria cobrança. Abrir pagamento existente é ação explícita e autenticada.
Uma nova compra exige ação explícita; tentativa ainda potencialmente pagável a bloqueia.

O retorno novo usa `#ref=` para evitar referência STATUS em logs HTTP. O Frontend
aceita também retornos antigos com `?ref=` e grava um cookie de leitura no BFF.
Após consultar, o titular mantém a intenção na URL (UUID sem poder de autenticação);
o acesso somente STATUS mantém o fragmento da aba para evitar troca entre pedidos.
O harness H1 anterior conserva seu
retorno HTML por query, sem mudar evidências existentes.

A aba financeira administrativa usa `pagamentos.visualizar`; a lista operacional
continua excluindo online não pagos. Impressão manual e automática revalidam
`GET /pedidos/:id/operacao` imediatamente antes de renderizar a comanda. QZ/PEM
não são modificados. Testes visuais com checkout real, outros navegadores e
ativação em ambiente HTTPS precisam de autorização própria. Relatórios e produção
permanecem fora desta fase.
