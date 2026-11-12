# Desafio Frontend — Marketplace de NFTs — Arquitetura da Aplicação

## 1. Visão geral

O KURIO é um marketplace de NFTs desenvolvido com React e TypeScript. A aplicação utiliza uma arquitetura frontend baseada em componentes, gerenciamento de estado global, comunicação REST simulada e eventos em tempo real.

A aplicação foi estruturada para funcionar de forma independente de serviços privados, utilizando MSW para simular as respostas da API e os fluxos de comunicação necessários à demonstração.

### Principais tecnologias

- React e TypeScript
- Vite
- TanStack Router
- TanStack Query
- Zustand
- Axios
- MSW
- Socket.IO Client
- Decimal.js
- Zod

## 2. Contratos REST

As operações HTTP são centralizadas por meio do cliente Axios, configurado com a URL base definida pela variável `VITE_API_URL`.

As requisições são interceptadas para incluir informações de autenticação quando existe um token armazenado no navegador.

O MSW intercepta as requisições e fornece respostas simuladas, permitindo executar os fluxos da aplicação sem um backend externo.

### Responsabilidades da API

- Autenticação e gerenciamento de sessão.
- Consulta de NFTs e informações do catálogo.
- Consulta e operações relacionadas ao carrinho.
- Operações relacionadas ao perfil do usuário.
- Operações relacionadas às carteiras.
- Processamento dos fluxos de compra simulados.

Os contratos são representados por tipos TypeScript, incluindo estruturas genéricas de resposta e erro.

### Estrutura das respostas

Resposta genérica:

```ts
interface ApiResponse<T> {
  data: T;
  message?: string;
}
```

Resposta de erro:

```ts
interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string>;
}
```

Os dados de usuário e NFT também possuem interfaces tipadas, reduzindo inconsistências entre os componentes e as operações da API.

## 3. Eventos e comunicação em tempo real

A aplicação utiliza Socket.IO Client e integração com MSW por meio de `@mswjs/socket.io-binding`.

A comunicação em tempo real permite simular atualizações assíncronas sem depender de um servidor Socket.IO privado.

### Responsabilidades

- Estabelecimento da conexão com o serviço de eventos simulado.
- Recebimento de atualizações em tempo real.
- Atualização da interface conforme os eventos recebidos.
- Tratamento dos estados de conexão e indisponibilidade.

Os eventos são utilizados em conjunto com as operações REST, permitindo representar uma experiência de marketplace com atualizações assíncronas.

## 4. Política de sessão e autenticação

O estado de autenticação é gerenciado pelo Zustand.

O estado principal contém:

- `user`: usuário autenticado ou `null`.
- `isAuthenticated`: indica se existe uma sessão autenticada.
- `isLoading`: indica se a restauração da sessão está em andamento.

### Comportamento

**Login**

Após uma autenticação bem-sucedida, os dados do usuário são armazenados no estado global e a aplicação passa a reconhecer a sessão como autenticada.

**Restauração**

Ao iniciar a aplicação, o `AppShell` executa a rotina de restauração da sessão por meio de `authService.restoreSession()`.

**Requisições autenticadas**

O interceptor do Axios verifica a existência de um token no `localStorage` e adiciona o cabeçalho `Authorization` quando necessário.

**Logout**

A ação de logout limpa o estado de autenticação por meio de `clearSession()`.

**Sessão expirada**

Respostas HTTP 401 são tratadas pelo interceptor, que remove o token armazenado no navegador.

A autenticação utiliza dados fictícios no ambiente de demonstração e não representa um mecanismo de autenticação de produção.

## 5. Estado do carrinho

O estado global da experiência de marketplace é gerenciado pelo Zustand.

O carrinho mantém os itens selecionados pelo usuário e permite que diferentes páginas compartilhem o mesmo estado.

### Responsabilidades

- Adicionar NFTs ao carrinho.
- Remover itens.
- Atualizar quantidades, quando aplicável.
- Consultar os itens selecionados.
- Calcular os valores apresentados na interface.
- Compartilhar o estado entre catálogo, detalhes do NFT e carrinho.

A biblioteca Decimal.js é utilizada para operações que exigem maior precisão numérica, evitando problemas comuns de arredondamento com valores monetários em ponto flutuante.

O carrinho é utilizado durante o fluxo de compra simulado.

## 6. Estratégia de cache e dados

A aplicação utiliza TanStack Query para gerenciamento de dados assíncronos.

A biblioteca permite centralizar o ciclo de vida das consultas e controlar estados de carregamento, sucesso e erro.

### Responsabilidades

- Gerenciamento de consultas assíncronas.
- Reutilização de dados consultados.
- Controle de carregamento e erros.
- Atualização e invalidação de consultas após operações que alteram dados.
- Redução de requisições desnecessárias durante a navegação.

O Zustand é utilizado para estados globais da interface e do usuário, enquanto o TanStack Query é responsável pelo gerenciamento dos dados obtidos por consultas assíncronas.

Essa separação evita concentrar todo o estado da aplicação em uma única ferramenta.

## 7. Reconciliação entre REST e Socket.IO

REST e Socket.IO possuem responsabilidades complementares.

**REST**

É utilizado para operações de consulta e alteração de dados que exigem uma resposta explícita da API.

**Socket.IO**

É utilizado para representar atualizações assíncronas e eventos em tempo real.

A integração entre os dois mecanismos permite que a aplicação apresente dados obtidos por requisições HTTP e atualizações recebidas por eventos.

O estado visual é atualizado conforme as respostas e eventos processados pela aplicação.

Como o ambiente utiliza mocks, a sincronização representa um fluxo de demonstração, não uma garantia de consistência distribuída entre múltiplas instâncias ou usuários reais.

## 8. Decisões de UX

Foram adotadas algumas decisões para manter a navegação simples e consistente:

- Interface com identidade visual própria da KURIO.
- Tema escuro com tons terrosos e detalhes em laranja.
- Organização do catálogo para facilitar a descoberta de NFTs.
- Acesso ao carrinho durante a navegação.
- Fluxo de autenticação por login e cadastro.
- Páginas específicas para perfil e carteiras.
- Estados de carregamento e tratamento de erros.
- Simulação de operações para permitir avaliação sem serviços externos.
- Layouts adaptados para desktop e dispositivos móveis.

A aplicação prioriza a continuidade da navegação e a apresentação de feedback visual durante as operações.

## 9. Limitações conhecidas

- Os dados são simulados pelo MSW e não representam informações persistentes de um backend real.
- As credenciais de autenticação são fictícias.
- As operações de compra não representam transações financeiras reais.
- As carteiras são utilizadas em um fluxo demonstrativo, sem integração obrigatória com uma blockchain.
- Os eventos Socket.IO são simulados e não representam uma infraestrutura de mensageria em produção.
- Não há garantia de consistência entre diferentes usuários ou sessões independentes.
- O comportamento de rede e os erros dependem do cenário selecionado nos mocks.
- A aplicação não deve ser utilizada para operações financeiras ou negociação real de ativos digitais.

## 10. Figma e implementação

O Figma foi utilizado como referência para a identidade visual, estrutura das páginas, componentes e fluxos de navegação.

Durante a implementação, foram realizadas adaptações necessárias para integrar os componentes à arquitetura React e garantir o funcionamento das interações.

A implementação prioriza a preservação da identidade visual, hierarquia de informações, cores, tipografia e organização dos elementos.

Eventuais diferenças de espaçamento, responsividade, comportamento de componentes ou adaptações técnicas devem ser avaliadas diretamente pela comparação entre a interface implementada e os respectivos frames do Figma.

## 11. Considerações finais

A arquitetura foi organizada para separar responsabilidades entre apresentação, estado global, comunicação HTTP, dados assíncronos e eventos em tempo real.

A utilização de MSW permite executar e avaliar os principais fluxos da aplicação sem depender de serviços privados ou do backend de produção.

A estrutura também facilita a evolução futura para integração com serviços reais, mantendo a separação entre interface, contratos de dados e mecanismos de comunicação.
