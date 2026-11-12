import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import { AppShell } from "../components/layout/AppShell";
import HomePage from "../pages/HomePage";
import NftDetailsPage from "../pages/NftDetailsPage/NftDetailsPage";
import CartPage from "../pages/CartPage/CartPage";
import PaymentPage from "../pages/PaymentPage/PaymentPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import WalletsPage from "../pages/WalletsPage/WalletsPage";

const rootRoute = createRootRoute({
  component: AppShell,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment",
  component: PaymentPage,
});

const nftDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nft/$nftId",
  component: NftDetailsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallets",
  component: WalletsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  cartRoute,
  paymentRoute,
  nftDetailsRoute,
  profileRoute,
  walletsRoute,
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
