
import type { Nft } from "./nft";

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface CollectorProfile {
  userId: string;
  displayName: string;
  username: string;
  email: string;
  walletNickname: string;
  ensName: string;
  avatar: string;
}

export interface UpdateProfilePayload {
  displayName: string;
  username: string;
  walletNickname: string;
  ensName: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  address: string;
  network: "Ethereum" | "Polygon" | "Base";
  provider: "MetaMask" | "WalletConnect" | "Coinbase Wallet";
  isPrimary: boolean;
  createdAt: string;

  displayName: string;
  profileName: string;
  secondaryEns: string;
  referralCode: string;
  email: string;
  ensName: string;
}

export type CreateWalletPayload = Pick<
  Wallet,
  | "name"
  | "address"
  | "network"
  | "provider"
  | "displayName"
  | "profileName"
  | "secondaryEns"
  | "referralCode"
  | "email"
  | "ensName"
>;

export interface CartItem {
  nftId: string;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled";

export interface OrderItem {
  nftId: string;
  name: string;
  image: string;
  unitPrice: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: string;
  networkFee: string;
  total: string;
  network: string;
  walletAddress: string;
  idempotencyKey: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogResponse {
  items: Nft[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
