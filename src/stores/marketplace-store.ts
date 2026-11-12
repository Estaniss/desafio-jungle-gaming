
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Nft } from '../types/nft';

interface MarketplaceState {
  cart: Nft[];
  cartQuantities: Record<string, number>;
  favorites: string[];

  addToCart: (nft: Nft) => void;
  removeFromCart: (nftId: string) => void;
  updateCartQuantity: (nftId: string, quantity: number) => void;
  toggleFavorite: (nftId: string) => void;
  isFavorite: (nftId: string) => boolean;
  isInCart: (nftId: string) => boolean;
  clearCart: () => void;
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      cart: [],
      cartQuantities: {},
      favorites: [],

      addToCart: (nft) =>
        set((state) => {
          const alreadyAdded = state.cart.some(
            (item) => item.id === nft.id,
          );

          if (alreadyAdded) {
            return state;
          }

          return {
            cart: [...state.cart, nft],
            cartQuantities: {
              ...state.cartQuantities,
              [nft.id]: 1,
            },
          };
        }),

      removeFromCart: (nftId) =>
        set((state) => {
          const { [nftId]: removed, ...remainingQuantities } =
            state.cartQuantities;

          return {
            cart: state.cart.filter((item) => item.id !== nftId),
            cartQuantities: remainingQuantities,
          };
        }),

      updateCartQuantity: (nftId, quantity) =>
        set((state) => {
          if (!state.cart.some((item) => item.id === nftId)) {
            return state;
          }

          return {
            cartQuantities: {
              ...state.cartQuantities,
              [nftId]: Math.max(1, Math.floor(quantity)),
            },
          };
        }),

      toggleFavorite: (nftId) =>
        set((state) => ({
          favorites: state.favorites.includes(nftId)
            ? state.favorites.filter((id) => id !== nftId)
            : [...state.favorites, nftId],
        })),

      isFavorite: (nftId) => get().favorites.includes(nftId),

      isInCart: (nftId) =>
        get().cart.some((item) => item.id === nftId),

      clearCart: () =>
        set({
          cart: [],
          cartQuantities: {},
        }),
    }),
    {
      name: 'jungle-gaming-marketplace',
      partialize: (state) => ({
        cart: state.cart,
        cartQuantities: state.cartQuantities,
        favorites: state.favorites,
      }),
    },
  ),
);
