
import type { User, Wallet } from "../../types/api";

// ======================================================
// Users
// ======================================================

export const fixtureUsers: User[] = [
  {
    id: "user-001",
    name: "Alex Morgan",
    username: "alexmorgan",
    email: "alex@kurio.demo",
    avatar: "/assets/2986a7cb16d09de8970824d2dd58bf0bb021702c.png",
    bio: "Digital art collector and Web3 enthusiast.",
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "user-002",
    name: "Jordan Lee",
    username: "jordanlee",
    email: "jordan@kurio.demo",
    avatar: "/assets/8459204731e6eba9d474cbc8ebc37071360d3ba5.png",
    bio: "Exploring the intersection of art and technology.",
    createdAt: "2026-02-20T14:30:00.000Z",
  },
];

// ======================================================
// Passwords
// ======================================================

export const fixturePasswords: Record<string, string> = {
  "alex@kurio.demo": "Kurio123!",
  "jordan@kurio.demo": "Kurio123!",
};

// ======================================================
// Wallets
// ======================================================

export const fixtureWallets: Wallet[] = [
  {
    id: "wallet-001",
    userId: "user-001",
    name: "Minha MetaMask",
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    network: "Ethereum",
    provider: "MetaMask",
    isPrimary: true,
    createdAt: "2026-03-01T10:00:00.000Z",
    displayName: "Alex Morgan",
    profileName: "alexmorgan",
    secondaryEns: "",
    referralCode: "",
    email: "alex@kurio.demo",
    ensName: "",
  },
  {
    id: "wallet-002",
    userId: "user-002",
    name: "Coinbase Wallet",
    address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    network: "Polygon",
    provider: "Coinbase Wallet",
    isPrimary: true,
    createdAt: "2026-03-05T12:00:00.000Z",
    displayName: "Jordan Lee",
    profileName: "jordanlee",
    secondaryEns: "",
    referralCode: "",
    email: "jordan@kurio.demo",
    ensName: "",
  },
];
