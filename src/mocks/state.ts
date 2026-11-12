
import type { Nft } from "../types/nft";
import type { Order, User, Wallet } from "../types/api";
import { nfts } from "../data/nfts";
import {
  fixturePasswords,
  fixtureUsers,
  fixtureWallets,
} from "./fixtures/users";

export type MockScenario =
  | "success"
  | "slow"
  | "unstable"
  | "offline"
  | "server-error";

export interface MockCartItem {
  nftId: string;
  quantity: number;
}

const clone = <T,>(value: T): T => structuredClone(value);

const initialNfts = clone(nfts);
const initialUsers = clone(fixtureUsers);
const initialWallets = clone(fixtureWallets);
const initialPasswords = { ...fixturePasswords };

const initialFavorites: Record<string, string[]> = {
  "user-001": [],
  "user-002": [],
};

const initialCarts: Record<string, MockCartItem[]> = {
  "user-001": [],
  "user-002": [],
};

const initialOrders: Order[] = [];

let catalog: Nft[] = clone(initialNfts);
let users: User[] = clone(initialUsers);
let wallets: Wallet[] = clone(initialWallets);
let passwords: Record<string, string> = { ...initialPasswords };
let favorites: Record<string, string[]> = clone(initialFavorites);
let carts: Record<string, MockCartItem[]> = clone(initialCarts);
let orders: Order[] = clone(initialOrders);

let activeTokens: Record<string, string> = {
  "demo-token-user-001": "user-001",
  "demo-token-user-002": "user-002",
};

let idCounter = 1;

export const mockState = {
  // --------------------------------------------------
  // Cenários
  // --------------------------------------------------

  getScenario(): MockScenario {
    const scenario = import.meta.env.VITE_MOCK_SCENARIO;

    if (
      scenario === "slow" ||
      scenario === "unstable" ||
      scenario === "offline" ||
      scenario === "server-error"
    ) {
      return scenario;
    }

    return "success";
  },

  // --------------------------------------------------
  // Catálogo
  // --------------------------------------------------

  getCatalog(): Nft[] {
    return catalog;
  },

  getNft(id: string): Nft | undefined {
    return catalog.find((nft) => nft.id === id);
  },

  updateNft(id: string, changes: Partial<Nft>): Nft | undefined {
    let updatedNft: Nft | undefined;

    catalog = catalog.map((nft) => {
      if (nft.id !== id) return nft;

      updatedNft = {
        ...nft,
        ...changes,
        id: nft.id,
      };

      return updatedNft;
    });

    return updatedNft;
  },

  // --------------------------------------------------
  // Usuários e autenticação
  // --------------------------------------------------

  getUsers(): User[] {
    return users;
  },

  getUserByEmail(email: string): User | undefined {
    return users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  },

  getUserById(id: string): User | undefined {
    return users.find((user) => user.id === id);
  },

  getPassword(email: string): string | undefined {
    return passwords[email.toLowerCase()];
  },

  registerUser(user: User, password: string): void {
    users = [...users, user];

    passwords = {
      ...passwords,
      [user.email.toLowerCase()]: password,
    };

    favorites[user.id] = [];
    carts[user.id] = [];
  },

  updateUser(id: string, changes: Partial<User>): User | undefined {
    let updatedUser: User | undefined;

    users = users.map((user) => {
      if (user.id !== id) return user;

      updatedUser = {
        ...user,
        ...changes,
        id: user.id,
      };

      return updatedUser;
    });

    return updatedUser;
  },

  createToken(userId: string): string {
    const token = `mock-${userId}-${Date.now()}-${idCounter++}`;

    activeTokens[token] = userId;

    return token;
  },

  getUserFromToken(token?: string): User | undefined {
    if (!token) return undefined;

    const userId = activeTokens[token];

    return userId ? this.getUserById(userId) : undefined;
  },

  revokeToken(token?: string): void {
    if (token) {
      delete activeTokens[token];
    }
  },

  // --------------------------------------------------
  // Favoritos
  // --------------------------------------------------

  getFavorites(userId: string): string[] {
    return favorites[userId] ?? [];
  },

  toggleFavorite(userId: string, nftId: string): string[] {
    const current = favorites[userId] ?? [];

    favorites[userId] = current.includes(nftId)
      ? current.filter((id) => id !== nftId)
      : [...current, nftId];

    return favorites[userId];
  },

  // --------------------------------------------------
  // Carrinho
  // --------------------------------------------------

  getCart(userId: string): MockCartItem[] {
    return carts[userId] ?? [];
  },

  addToCart(userId: string, nftId: string): MockCartItem[] {
    const current = [...(carts[userId] ?? [])];

    const existingItem = current.find((item) => item.nftId === nftId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      current.push({
        nftId,
        quantity: 1,
      });
    }

    carts[userId] = current;

    return current;
  },

  updateCartQuantity(
    userId: string,
    nftId: string,
    quantity: number,
  ): MockCartItem[] {
    const current = [...(carts[userId] ?? [])];

    if (quantity <= 0) {
      carts[userId] = current.filter((item) => item.nftId !== nftId);
      return carts[userId];
    }

    carts[userId] = current.map((item) =>
      item.nftId === nftId
        ? { ...item, quantity }
        : item,
    );

    return carts[userId];
  },

  removeFromCart(userId: string, nftId: string): MockCartItem[] {
    carts[userId] = (carts[userId] ?? []).filter(
      (item) => item.nftId !== nftId,
    );

    return carts[userId];
  },

  clearCart(userId: string): void {
    carts[userId] = [];
  },

  // --------------------------------------------------
  // Carteiras
  // --------------------------------------------------

  getWallets(userId: string): Wallet[] {
    return wallets.filter((wallet) => wallet.userId === userId);
  },

  getWalletById(walletId: string): Wallet | undefined {
    return wallets.find((wallet) => wallet.id === walletId);
  },

  addWallet(wallet: Wallet): Wallet {
    wallets = [...wallets, wallet];

    return wallet;
  },

  removeWallet(userId: string, walletId: string): boolean {
    const wallet = wallets.find(
      (item) => item.id === walletId && item.userId === userId,
    );

    if (!wallet) return false;

    wallets = wallets.filter((item) => item.id !== walletId);

    return true;
  },

  // --------------------------------------------------
  // Pedidos
  // --------------------------------------------------

  getOrders(userId: string): Order[] {
    return orders.filter((order) => order.userId === userId);
  },

  getOrderById(orderId: string): Order | undefined {
    return orders.find((order) => order.id === orderId);
  },

  getOrderByIdempotencyKey(key: string): Order | undefined {
    return orders.find((order) => order.idempotencyKey === key);
  },

  createOrder(order: Order): Order {
    const existingOrder = this.getOrderByIdempotencyKey(
      order.idempotencyKey,
    );

    // Evita duplicar pedidos em caso de repetição da requisição.
    if (existingOrder) return existingOrder;

    orders = [...orders, order];

    return order;
  },

  updateOrder(
    orderId: string,
    changes: Partial<Order>,
    expectedVersion?: number,
  ): Order | undefined {
    let updatedOrder: Order | undefined;

    orders = orders.map((order) => {
      if (order.id !== orderId) return order;

      // Ignora atualizações baseadas em uma versão desatualizada.
      if (
        expectedVersion !== undefined &&
        order.version !== expectedVersion
      ) {
        updatedOrder = order;
        return order;
      }

      // Pedidos finalizados não podem voltar para estados anteriores.
      if (
        order.status === "confirmed" ||
        order.status === "rejected" ||
        order.status === "cancelled"
      ) {
        updatedOrder = order;
        return order;
      }

      updatedOrder = {
        ...order,
        ...changes,
        id: order.id,
        userId: order.userId,
        version: order.version + 1,
        updatedAt: new Date().toISOString(),
      };

      return updatedOrder;
    });

    return updatedOrder;
  },

  // --------------------------------------------------
  // Reset dos dados
  // --------------------------------------------------

  reset(): void {
    catalog = clone(initialNfts);
    users = clone(initialUsers);
    wallets = clone(initialWallets);
    passwords = { ...initialPasswords };
    favorites = clone(initialFavorites);
    carts = clone(initialCarts);
    orders = clone(initialOrders);

    activeTokens = {
      "demo-token-user-001": "user-001",
      "demo-token-user-002": "user-002",
    };

    idCounter = 1;
  },
};
