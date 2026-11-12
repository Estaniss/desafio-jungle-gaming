import { api } from "./api";

import type {
  ApiResponse,
  CreateWalletPayload,
  Wallet,
} from "../types/api";

export type { CreateWalletPayload } from "../types/api";

export const walletService = {
  async getWallets(): Promise<Wallet[]> {
    const response = await api.get<ApiResponse<Wallet[]>>("/wallets");

    return response.data.data;
  },

  async addWallet(payload: CreateWalletPayload): Promise<Wallet> {
    const response = await api.post<ApiResponse<Wallet>>(
      "/wallets",
      payload,
    );

    return response.data.data;
  },

  async removeWallet(walletId: string): Promise<void> {
    await api.delete(`/wallets/${walletId}`);
  },
};