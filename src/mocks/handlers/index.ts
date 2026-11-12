
import { delay, http, HttpResponse } from "msw";
import { socketHandlers } from "../socket";
import { mockState } from "../state";
import type { Order, User, Wallet } from "../../types/api";

// ======================================================
// Helpers
// ======================================================

let unstableRequestCount = 0;

function getBearerToken(request: Request): string | undefined {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return undefined;
  }

  return authorization.slice(7);
}

function getAuthenticatedUser(request: Request): User | undefined {
  return mockState.getUserFromToken(getBearerToken(request));
}

async function applyScenario(): Promise<Response | undefined> {
  const scenario = mockState.getScenario();

  switch (scenario) {
    case "offline":
      return HttpResponse.json(
        {
          message: "Serviço temporariamente indisponível.",
          code: "SERVICE_UNAVAILABLE",
        },
        { status: 503 },
      );

    case "server-error":
      return HttpResponse.json(
        {
          message: "Erro interno simulado.",
          code: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 },
      );

    case "slow":
      await delay(2500);
      return undefined;

    case "unstable": {
      unstableRequestCount += 1;

      const isSlowRequest = unstableRequestCount % 2 === 0;

      await delay(isSlowRequest ? 1800 : 150);
      return undefined;
    }

    default:
      await delay(150);
      return undefined;
  }
}

function unauthorizedResponse() {
  return HttpResponse.json(
    {
      message: "Sessão inválida ou expirada.",
      code: "UNAUTHORIZED",
    },
    { status: 401 },
  );
}

function notFoundResponse(message = "Recurso não encontrado.") {
  return HttpResponse.json(
    {
      message,
      code: "NOT_FOUND",
    },
    { status: 404 },
  );
}

function getProfile(user: User) {
  return {
    userId: user.id,
    displayName: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    ensName: "",
  };
}

function getCartDetails(userId: string) {
  const cart = mockState.getCart(userId);

  const items = cart.flatMap((item) => {
    const nft = mockState.getNft(item.nftId);

    if (!nft) return [];

    const unitPrice = nft.priceInEth;
    const lineTotal = unitPrice * item.quantity;

    return [
      {
        ...item,
        nft,
        unitPrice: unitPrice.toFixed(4),
        lineTotal: lineTotal.toFixed(4),
      },
    ];
  });

  const subtotal = items.reduce(
    (total, item) => total + Number(item.lineTotal),
    0,
  );

  return {
    items,
    quantity: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: subtotal.toFixed(4),
  };
}

// ======================================================
// Health
// ======================================================

const healthHandler = http.get("/api/health", async () => {
  const scenarioResponse = await applyScenario();

  if (scenarioResponse) return scenarioResponse;

  return HttpResponse.json({
    data: {
      status: "ok",
      service: "kurio-mock-api",
      timestamp: new Date().toISOString(),
    },
  });
});

// ======================================================
// Catalog
// ======================================================

const catalogHandler = http.get("/api/nfts", async ({ request }) => {
  const scenarioResponse = await applyScenario();

  if (scenarioResponse) return scenarioResponse;

  const url = new URL(request.url);

  const search = url.searchParams.get("search")?.toLowerCase() ?? "";
  const category = url.searchParams.get("category");
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.max(1, Number(url.searchParams.get("limit") ?? 12));

  let results = mockState.getCatalog();

  if (search) {
    results = results.filter(
      (nft) =>
        nft.name.toLowerCase().includes(search) ||
        nft.creator.toLowerCase().includes(search),
    );
  }

  if (category && category !== "Todos") {
    results = results.filter((nft) => nft.category === category);
  }

  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;

  return HttpResponse.json({
    data: {
      items: results.slice(start, start + limit),
      total,
      page,
      limit,
      totalPages,
    },
  });
});

const nftDetailsHandler = http.get(
  "/api/nfts/:id",
  async ({ params }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const nft = mockState.getNft(String(params.id));

    if (!nft) return notFoundResponse("NFT não encontrado.");

    return HttpResponse.json({ data: nft });
  },
);

// ======================================================
// Authentication
// ======================================================

const loginHandler = http.post(
  "/api/auth/login",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return HttpResponse.json(
        {
          message: "Informe e-mail e senha.",
          code: "VALIDATION_ERROR",
        },
        { status: 422 },
      );
    }

    const user = mockState.getUserByEmail(email);
    const expectedPassword = mockState.getPassword(email);

    if (!user || expectedPassword !== password) {
      return HttpResponse.json(
        {
          message: "E-mail ou senha inválidos.",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 },
      );
    }

    const accessToken = mockState.createToken(user.id);

    return HttpResponse.json({
      data: {
        accessToken,
        user,
      },
    });
  },
);

const registerHandler = http.post(
  "/api/auth/register",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const body = (await request.json()) as {
      name?: string;
      username?: string;
      email?: string;
      password?: string;
    };

    const name = body.name?.trim();
    const username = body.username?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!name || !username || !email || !password) {
      return HttpResponse.json(
        {
          message: "Preencha todos os campos obrigatórios.",
          code: "VALIDATION_ERROR",
        },
        { status: 422 },
      );
    }

    if (password.length < 8) {
      return HttpResponse.json(
        {
          message: "A senha precisa ter pelo menos 8 caracteres.",
          code: "INVALID_PASSWORD",
        },
        { status: 422 },
      );
    }

    const emailExists = mockState.getUserByEmail(email);
    const usernameExists = mockState
      .getUsers()
      .some((user) => user.username.toLowerCase() === username.toLowerCase());

    if (emailExists || usernameExists) {
      return HttpResponse.json(
        {
          message: "E-mail ou nome de usuário já cadastrado.",
          code: "USER_ALREADY_EXISTS",
        },
        { status: 409 },
      );
    }

    const user: User = {
      id: `user-${Date.now()}`,
      name,
      username,
      email,
      avatar: "/assets/2986a7cb16d09de8970824d2dd58bf0bb021702c.png",
      bio: "",
      createdAt: new Date().toISOString(),
    };

    mockState.registerUser(user, password);

    const accessToken = mockState.createToken(user.id);

    return HttpResponse.json(
      {
        data: {
          accessToken,
          user,
        },
      },
      { status: 201 },
    );
  },
);

const currentUserHandler = http.get(
  "/api/auth/me",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    return HttpResponse.json({ data: user });
  },
);

const logoutHandler = http.post(
  "/api/auth/logout",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    mockState.revokeToken(getBearerToken(request));

    return HttpResponse.json({
      data: { success: true },
    });
  },
);

// ======================================================
// Profile
// ======================================================

const getProfileHandler = http.get(
  "/api/profile",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    return HttpResponse.json({
      data: getProfile(user),
    });
  },
);

const updateProfileHandler = http.patch(
  "/api/profile",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    const body = (await request.json()) as {
      name?: string;
      username?: string;
      bio?: string;
      avatar?: string;
    };

    if (body.username) {
      const usernameExists = mockState.getUsers().some(
        (item) =>
          item.id !== user.id &&
          item.username.toLowerCase() === body.username!.toLowerCase(),
      );

      if (usernameExists) {
        return HttpResponse.json(
          {
            message: "Este nome de usuário já está em uso.",
            code: "USERNAME_CONFLICT",
          },
          { status: 409 },
        );
      }
    }

    const updatedUser = mockState.updateUser(user.id, {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.username !== undefined && {
        username: body.username.trim(),
      }),
      ...(body.bio !== undefined && { bio: body.bio }),
      ...(body.avatar !== undefined && { avatar: body.avatar }),
    });

    if (!updatedUser) return notFoundResponse("Usuário não encontrado.");

    return HttpResponse.json({
      data: getProfile(updatedUser),
    });
  },
);

// ======================================================
// Favorites
// ======================================================

const getFavoritesHandler = http.get(
  "/api/favorites",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    const favoriteIds = mockState.getFavorites(user.id);

    const items = favoriteIds
      .map((id) => mockState.getNft(id))
      .filter((nft) => nft !== undefined);

    return HttpResponse.json({
      data: {
        items,
        ids: favoriteIds,
        total: items.length,
      },
    });
  },
);

const toggleFavoriteHandler = http.post(
  "/api/favorites/:nftId",
  async ({ request, params }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    const nftId = String(params.nftId);
    const nft = mockState.getNft(nftId);

    if (!nft) return notFoundResponse("NFT não encontrado.");

    const ids = mockState.toggleFavorite(user.id, nftId);

    return HttpResponse.json({
      data: {
        nftId,
        isFavorite: ids.includes(nftId),
        ids,
      },
    });
  },
);

// ======================================================
// Cart
// ======================================================

const getCartHandler = http.get(
  "/api/cart",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    return HttpResponse.json({
      data: getCartDetails(user.id),
    });
  },
);

const addCartItemHandler = http.post(
  "/api/cart/items",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    const body = (await request.json()) as {
      nftId?: string;
      quantity?: number;
    };

    if (!body.nftId) {
      return HttpResponse.json(
        {
          message: "Informe o NFT que deseja adicionar.",
          code: "INVALID_NFT",
        },
        { status: 422 },
      );
    }

    const nft = mockState.getNft(body.nftId);

    if (!nft) return notFoundResponse("NFT não encontrado.");

    const quantity = Math.max(1, Math.floor(body.quantity ?? 1));

    for (let index = 0; index < quantity; index += 1) {
      mockState.addToCart(user.id, body.nftId);
    }

    return HttpResponse.json({
      data: getCartDetails(user.id),
    });
  },
);

const updateCartItemHandler = http.patch(
  "/api/cart/items/:nftId",
  async ({ request, params }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    const nftId = String(params.nftId);
    const body = (await request.json()) as {
      quantity?: number;
    };

    if (typeof body.quantity !== "number" || !Number.isFinite(body.quantity)) {
      return HttpResponse.json(
        {
          message: "Informe uma quantidade válida.",
          code: "INVALID_QUANTITY",
        },
        { status: 422 },
      );
    }

    mockState.updateCartQuantity(
      user.id,
      nftId,
      Math.floor(body.quantity),
    );

    return HttpResponse.json({
      data: getCartDetails(user.id),
    });
  },
);

const removeCartItemHandler = http.delete(
  "/api/cart/items/:nftId",
  async ({ request, params }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    mockState.removeFromCart(user.id, String(params.nftId));

    return HttpResponse.json({
      data: getCartDetails(user.id),
    });
  },
);

const clearCartHandler = http.delete(
  "/api/cart",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    mockState.clearCart(user.id);

    return HttpResponse.json({
      data: getCartDetails(user.id),
    });
  },
);

// ======================================================
// Wallets
// ======================================================

const getWalletsHandler = http.get(
  "/api/wallets",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    return HttpResponse.json({
      data: mockState.getWallets(user.id),
    });
  },
);

const addWalletHandler = http.post(
  "/api/wallets",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    const body = (await request.json()) as {
      name?: string;
      address?: string;
      network?: Wallet["network"];
      provider?: Wallet["provider"];
      displayName?: string;
      profileName?: string;
      secondaryEns?: string;
      referralCode?: string;
      email?: string;
      ensName?: string;
    };

    if (
      !body.name?.trim() ||
      !body.address?.trim() ||
      !body.network ||
      !body.provider ||
      !body.displayName?.trim() ||
      !body.profileName?.trim() ||
      !body.email?.trim()
    ) {
      return HttpResponse.json(
        {
          message: "Preencha os dados obrigatórios da carteira.",
          code: "VALIDATION_ERROR",
        },
        { status: 422 },
      );
    }

    const addressExists = mockState
      .getWallets(user.id)
      .some(
        (wallet) =>
          wallet.address.toLowerCase() === body.address!.trim().toLowerCase(),
      );

    if (addressExists) {
      return HttpResponse.json(
        {
          message: "Esta carteira já está cadastrada.",
          code: "WALLET_ALREADY_EXISTS",
        },
        { status: 409 },
      );
    }

    const wallet: Wallet = {
      id: `wallet-${Date.now()}`,
      userId: user.id,
      name: body.name.trim(),
      address: body.address.trim(),
      network: body.network,
      provider: body.provider,
      isPrimary: mockState.getWallets(user.id).length === 0,
      createdAt: new Date().toISOString(),
      displayName: body.displayName.trim(),
      profileName: body.profileName.trim(),
      secondaryEns: body.secondaryEns?.trim() ?? "",
      referralCode: body.referralCode?.trim() ?? "",
      email: body.email.trim(),
      ensName: body.ensName?.trim() ?? "",
    };

    mockState.addWallet(wallet);

    return HttpResponse.json(
      {
        data: wallet,
      },
      { status: 201 },
    );
  },
);

const removeWalletHandler = http.delete(
  "/api/wallets/:walletId",
  async ({ request, params }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    const removed = mockState.removeWallet(
      user.id,
      String(params.walletId),
    );

    if (!removed) return notFoundResponse("Carteira não encontrada.");

    return HttpResponse.json({
      data: {
        success: true,
        wallets: mockState.getWallets(user.id),
      },
    });
  },
);

// ======================================================
// Coupons
// ======================================================

const couponHandler = http.post(
  "/api/coupons/validate",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    const body = (await request.json()) as {
      code?: string;
      subtotal?: number;
    };

    const code = body.code?.trim().toUpperCase();
    const subtotal = Number(body.subtotal ?? 0);

    if (!code || !Number.isFinite(subtotal) || subtotal <= 0) {
      return HttpResponse.json(
        {
          message: "Informe um cupom e um subtotal válido.",
          code: "INVALID_COUPON_REQUEST",
        },
        { status: 422 },
      );
    }

    const coupons: Record<string, number> = {
      KURIO10: 10,
      PRIMEIRA15: 15,
    };

    const discountPercentage = coupons[code];

    if (!discountPercentage) {
      return HttpResponse.json(
        {
          message: "Cupom inválido ou expirado.",
          code: "COUPON_INVALID",
        },
        { status: 422 },
      );
    }

    const discount = (subtotal * discountPercentage) / 100;

    return HttpResponse.json({
      data: {
        code,
        valid: true,
        discountPercentage,
        discount: discount.toFixed(4),
        finalSubtotal: (subtotal - discount).toFixed(4),
      },
    });
  },
);

// ======================================================
// Orders
// ======================================================

const getOrdersHandler = http.get(
  "/api/orders",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    return HttpResponse.json({
      data: mockState.getOrders(user.id),
    });
  },
);

const getOrderHandler = http.get(
  "/api/orders/:orderId",
  async ({ request, params }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    const order = mockState.getOrderById(String(params.orderId));

    if (!order || order.userId !== user.id) {
      return notFoundResponse("Pedido não encontrado.");
    }

    return HttpResponse.json({
      data: order,
    });
  },
);

const createOrderHandler = http.post(
  "/api/orders",
  async ({ request }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    const body = (await request.json()) as {
      walletAddress?: string;
      network?: string;
      idempotencyKey?: string;
    };

    if (!body.walletAddress || !body.network || !body.idempotencyKey) {
      return HttpResponse.json(
        {
          message: "Informe carteira, rede e chave de idempotência.",
          code: "VALIDATION_ERROR",
        },
        { status: 422 },
      );
    }

    const existingOrder = mockState.getOrderByIdempotencyKey(
      body.idempotencyKey,
    );

    if (existingOrder) {
      if (existingOrder.userId !== user.id) {
        return HttpResponse.json(
          {
            message: "Chave de idempotência já utilizada.",
            code: "IDEMPOTENCY_CONFLICT",
          },
          { status: 409 },
        );
      }

      return HttpResponse.json({
        data: existingOrder,
        duplicated: true,
      });
    }

    const wallet = mockState
      .getWallets(user.id)
      .find(
        (item) =>
          item.address.toLowerCase() === body.walletAddress!.toLowerCase(),
      );

    if (!wallet) {
      return HttpResponse.json(
        {
          message: "A carteira informada não pertence ao usuário.",
          code: "WALLET_NOT_FOUND",
        },
        { status: 422 },
      );
    }

    const cart = getCartDetails(user.id);

    if (cart.items.length === 0) {
      return HttpResponse.json(
        {
          message: "O carrinho está vazio.",
          code: "EMPTY_CART",
        },
        { status: 422 },
      );
    }

    const orderItems = cart.items.map((item) => ({
      nftId: item.nft.id,
      name: item.nft.name,
      image: item.nft.image,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    }));

    const subtotal = Number(cart.subtotal);
    const networkFee = 0.002;
    const total = subtotal + networkFee;
    const now = new Date().toISOString();

    const order: Order = {
      id: `KUR-${Date.now()}`,
      userId: user.id,
      status: "pending",
      items: orderItems,
      subtotal: subtotal.toFixed(4),
      networkFee: networkFee.toFixed(4),
      total: total.toFixed(4),
      network: body.network,
      walletAddress: wallet.address,
      idempotencyKey: body.idempotencyKey,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    const createdOrder = mockState.createOrder(order);

    mockState.clearCart(user.id);

    return HttpResponse.json(
      {
        data: createdOrder,
      },
      { status: 201 },
    );
  },
);

const cancelOrderHandler = http.post(
  "/api/orders/:orderId/cancel",
  async ({ request, params }) => {
    const scenarioResponse = await applyScenario();

    if (scenarioResponse) return scenarioResponse;

    const user = getAuthenticatedUser(request);

    if (!user) return unauthorizedResponse();

    const order = mockState.getOrderById(String(params.orderId));

    if (!order || order.userId !== user.id) {
      return notFoundResponse("Pedido não encontrado.");
    }

    if (order.status !== "pending") {
      return HttpResponse.json(
        {
          message: "Somente pedidos pendentes podem ser cancelados.",
          code: "ORDER_NOT_CANCELLABLE",
        },
        { status: 409 },
      );
    }

    const updatedOrder = mockState.updateOrder(order.id, {
      status: "cancelled",
    });

    return HttpResponse.json({
      data: updatedOrder,
    });
  },
);

// ======================================================
// Export
// ======================================================

export const handlers = [
  healthHandler,
  catalogHandler,
  nftDetailsHandler,

  loginHandler,
  registerHandler,
  currentUserHandler,
  logoutHandler,

  getProfileHandler,
  updateProfileHandler,

  getFavoritesHandler,
  toggleFavoriteHandler,

  getCartHandler,
  addCartItemHandler,
  updateCartItemHandler,
  removeCartItemHandler,
  clearCartHandler,

  getWalletsHandler,
  addWalletHandler,
  removeWalletHandler,

  couponHandler,

  getOrdersHandler,
  getOrderHandler,
  createOrderHandler,
  cancelOrderHandler,

  ...socketHandlers,
];