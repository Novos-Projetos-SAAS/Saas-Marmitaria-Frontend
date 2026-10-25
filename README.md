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

Testes automatizados (repositórios lado a lado e Chrome instalado). Execute na
raiz do Frontend. O PostgreSQL descartável precisa estar iniciado: encerrar uma
execução anterior não mantém a porta 55439 disponível. Não use o H1 da porta55440.
O cluster abaixo já deve existir; estes comandos não criam banco nem executam seeds.

```powershell
$pg = 'C:\Program Files\PostgreSQL\18\bin'
$cluster = Join-Path (Split-Path (Get-Location).Path) 'infinitepay-test-cluster'
& "$pg\pg_isready.exe" -h 127.0.0.1 -p 55439 -d infinitepay_phase1_test
if ($LASTEXITCODE -ne 0) {
    & "$pg\pg_ctl.exe" -D $cluster -o '-h 127.0.0.1 -p 55439' -l "$cluster\server.log" start
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL descartável não iniciou. Confira server.log; não use produção/H1.' }
}
$env:TEST_DATABASE_URL='postgresql://codex_test@127.0.0.1:55439/infinitepay_phase1_test'
npm ci
Push-Location '../Saas-Marmitaria-Backend'
npm test
Pop-Location
npm test
npm run test:browser
npm run lint
npm run build
```

O `-o` com host/porta é necessário: `pg_ctl start` sem esses argumentos pode
tentar a configuração padrão do PostgreSQL. Após iniciar, `pg_isready` deve
informar `accepting connections`. A suíte recusa nomes/origens de banco não
descartáveis. Para encerrar voluntariamente apenas esse cluster, use
`& "$pg\pg_ctl.exe" -D $cluster -m fast stop`; reinicie antes de repetir testes.

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

Para validar HTTPS em ambos os servidores, use um PowerShell separado e um
certificado sintético fora do Git (OpenSSL já instalado com Git for Windows):

```powershell
$tlsDir = Join-Path $env:TEMP 'marmitaria-checkout-tls'
New-Item -ItemType Directory -Path $tlsDir -Force | Out-Null
& 'C:\Program Files\Git\usr\bin\openssl.exe' req -x509 -newkey rsa:2048 -nodes `
  -keyout "$tlsDir\localhost-key.pem" -out "$tlsDir\localhost.pem" -days 2 `
  -subj '/CN=localhost' -addext 'subjectAltName=DNS:localhost,IP:127.0.0.1' `
  -addext 'extendedKeyUsage=serverAuth'
if ($LASTEXITCODE -ne 0) { throw 'Certificado local não foi gerado.' }
$env:CHECKOUT_TEST_TLS_CERT = "$tlsDir\localhost.pem"
$env:CHECKOUT_TEST_TLS_KEY = "$tlsDir\localhost-key.pem"
$env:NODE_EXTRA_CA_CERTS = $env:CHECKOUT_TEST_TLS_CERT
$env:TEST_DATABASE_URL='postgresql://codex_test@127.0.0.1:55439/infinitepay_phase1_test'
npm run test:browser
```

O Next recebe explicitamente essa CA e o Chrome descartável reconhece somente
o SPKI desse certificado. Não há instalação de CA no Windows, `ignoreHTTPSErrors`
global ou `NODE_TLS_REJECT_UNAUTHORIZED=0`. O Frontend usa
`https://localhost:55443`; o Express usa outra porta local atribuída pelo sistema.
Não são URLs públicas nem homologação de certificado de produção. Feche o
PowerShell separado após o teste para descartar essas variáveis locais.

O navegador também exercita CSRF, cookies host-only, administração/PDV com os
quatro métodos, bloqueio de impressão por resposta desatualizada, falha de Socket
com liberação persistida e eventos repetidos. Um cenário encerra o processo Chrome
e reabre seu perfil temporário, recuperando o cookie sem exportar `storageState`.
Esse perfil contém só dados sintéticos e é removido ao terminar. `window.print` e conexões QZ são
interceptados somente no teste; nenhuma impressora é acionada. A configuração
real do QZ/PEM permanece intacta.

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
