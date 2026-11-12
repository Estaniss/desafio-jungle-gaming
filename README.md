# Desafio Frontend — Marketplace de NFTs

Marketplace de NFTs desenvolvido com React, TypeScript e Vite, com API simulada por MSW e comunicação em tempo real utilizando Socket.IO.

## 1. Pré-requisitos

- Node.js 24 ou superior
- npm 11 ou superior
- Git

## 2. Instalação

Clone o repositório:

```bash
git clone https://github.com/Estaniss/desafio-jungle-gaming.git
cd desafio-jungle-gaming
```

Instale as dependências:

```bash
npm install
```

## 3. Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_ENABLE_MOCKS=true
VITE_MOCK_SCENARIO=success
VITE_API_URL=/api
```

| Variável             | Descrição                                      |
| -------------------- | ---------------------------------------------- |
| `VITE_ENABLE_MOCKS`  | Habilita ou desabilita a utilização dos mocks. |
| `VITE_MOCK_SCENARIO` | Define o cenário de execução dos mocks.        |
| `VITE_API_URL`       | Define a URL base da API.                      |

Para executar o projeto sem depender de um backend externo, mantenha os mocks habilitados.

## 4. Credenciais fictícias

Utilize as seguintes credenciais para testar a autenticação:

| Usuário           | Senha     |
| ----------------- | --------- |
| alex@kurio.demo   | Kurio123! |
| jordan@kurio.demo | Kurio123! |

Essas credenciais são destinadas exclusivamente ao ambiente de demonstração.

## 5. Cenários de execução

A aplicação utiliza cenários simulados para reproduzir diferentes condições de funcionamento.

O cenário é selecionado pela variável `VITE_MOCK_SCENARIO`.

| Cenário        | Comportamento                         |
| -------------- | ------------------------------------- |
| `success`      | Fluxo normal de sucesso.              |
| `slow`         | Simula respostas com latência.        |
| `unstable`     | Simula instabilidade nas requisições. |
| `offline`      | Simula indisponibilidade de conexão.  |
| `server-error` | Simula erros internos do servidor.    |

Para selecionar outro cenário, altere a variável no arquivo `.env`:

```env
VITE_MOCK_SCENARIO=slow
```

Reinicie o servidor de desenvolvimento para aplicar a alteração.

## 6. Reset dos cenários

Para voltar ao comportamento padrão:

```env
VITE_MOCK_SCENARIO=success
```

Reinicie o servidor de desenvolvimento.

Para limpar o estado mantido pelo navegador, utilize as ferramentas do próprio navegador:

1. Abra as ferramentas de desenvolvedor.
2. Acesse a aba Application.
3. Entre em Local Storage.
4. Selecione o endereço da aplicação.
5. Limpe os dados armazenados.
6. Recarregue a página.

Isso permite reiniciar a sessão e o estado persistido no navegador.

## 7. Executando o projeto

### Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em:

`http://localhost:5173`

### Build de produção

```bash
npm run build
```

Os arquivos otimizados serão gerados no diretório `dist`.

### Preview da versão de produção

```bash
npm run preview
```

### Verificação de código

```bash
npm run lint
```

### Testes E2E

```bash
npm run test:e2e
```

Outras opções:

```bash
npm run test:e2e:ui
npm run test:e2e:headed
npm run test:e2e:report
```

Os testes utilizam Playwright com Chromium em configurações desktop e mobile. O servidor de testes é iniciado automaticamente na porta `4173`, utilizando os mocks e o cenário `success`.

### Auditoria Lighthouse

```bash
npm run lighthouse:audit
```

Os relatórios HTML e JSON são gerados no diretório `lighthouse/reports`.

## 8. Reprodução dos fluxos de falha

Para validar os estados de erro da aplicação, altere `VITE_MOCK_SCENARIO` no arquivo `.env` e reinicie o servidor.

### Latência

```env
VITE_MOCK_SCENARIO=slow
```

Permite observar os estados de carregamento e a experiência durante respostas demoradas.

### Instabilidade

```env
VITE_MOCK_SCENARIO=unstable
```

Permite verificar o comportamento da interface diante de falhas intermitentes.

### Indisponibilidade de conexão

```env
VITE_MOCK_SCENARIO=offline
```

Permite verificar o tratamento de indisponibilidade de rede.

### Erro interno do servidor

```env
VITE_MOCK_SCENARIO=server-error
```

Permite verificar a apresentação e o tratamento de erros nas operações da API.

Após cada alteração, reinicie o servidor e repita a operação correspondente na interface.

## 9. Tecnologias utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- TanStack Router
- TanStack Query
- Axios
- MSW
- Socket.IO Client
- Playwright
- Lighthouse
- Decimal.js
- Zod
