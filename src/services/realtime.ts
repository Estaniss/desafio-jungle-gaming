
import { io, type Socket } from 'socket.io-client';

export interface NftUpdatedEvent {
  nftId: string;
  priceInEth: number;
  available?: number;
  version: number;
  updatedAt?: string;
}

export interface OrderUpdatedEvent {
  orderId: string;
  status: string;
  version: number;
  updatedAt?: string;
}

export type RealtimeStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'expired';

type RealtimeStatusListener = (status: RealtimeStatus) => void;

type NftUpdatedListener = (event: NftUpdatedEvent) => void;

type OrderUpdatedListener = (event: OrderUpdatedEvent) => void;

let socket: Socket | null = null;
let activeToken: string | null = null;
let currentStatus: RealtimeStatus = 'disconnected';

const nftVersions = new Map<string, number>();
const orderVersions = new Map<string, number>();

const statusListeners = new Set<RealtimeStatusListener>();
const nftListeners = new Set<NftUpdatedListener>();
const orderListeners = new Set<OrderUpdatedListener>();

function notifyStatus(status: RealtimeStatus) {
  currentStatus = status;

  statusListeners.forEach((listener) => {
    listener(status);
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNftUpdatedEvent(
  value: unknown,
): value is NftUpdatedEvent {
  return (
    isObject(value) &&
    typeof value.nftId === 'string' &&
    typeof value.priceInEth === 'number' &&
    typeof value.version === 'number'
  );
}

function isOrderUpdatedEvent(
  value: unknown,
): value is OrderUpdatedEvent {
  return (
    isObject(value) &&
    typeof value.orderId === 'string' &&
    typeof value.status === 'string' &&
    typeof value.version === 'number'
  );
}

function handleNftUpdated(payload: unknown) {
  if (!isNftUpdatedEvent(payload)) return;

  const previousVersion = nftVersions.get(payload.nftId) ?? 0;

  if (payload.version <= previousVersion) return;

  nftVersions.set(payload.nftId, payload.version);

  nftListeners.forEach((listener) => {
    listener(payload);
  });
}

function handleOrderUpdated(payload: unknown) {
  if (!isOrderUpdatedEvent(payload)) return;

  const previousVersion = orderVersions.get(payload.orderId) ?? 0;

  if (payload.version <= previousVersion) return;

  orderVersions.set(payload.orderId, payload.version);

  orderListeners.forEach((listener) => {
    listener(payload);
  });
}

export function connectRealtime(token: string) {
  const normalizedToken = token.trim();

  if (!normalizedToken) return;

  if (socket && activeToken === normalizedToken) {
    return;
  }

  if (socket) {
    disconnectRealtime();
  }

  activeToken = normalizedToken;
  notifyStatus('connecting');

  const connection = io(window.location.origin, {
    path: '/socket.io/',
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket = connection;

  connection.on('connect', () => {
    connection.emit('subscribe', {
      token: normalizedToken,
    });
  });

  connection.on('realtime.connected', () => {
    notifyStatus('connected');
  });

  connection.on('nft.updated', handleNftUpdated);

  connection.on('order.updated', handleOrderUpdated);

  connection.on('session.expired', () => {
    localStorage.removeItem('kurio-access-token');

    disconnectRealtime();
    notifyStatus('expired');
  });

  connection.on('disconnect', () => {
    if (socket === connection) {
      notifyStatus('disconnected');
    }
  });

  connection.on('connect_error', () => {
    if (socket === connection) {
      notifyStatus('error');
    }
  });
}

export function disconnectRealtime() {
  if (socket) {
    socket.emit('unsubscribe');
    socket.disconnect();
    socket = null;
  }

  activeToken = null;

  nftVersions.clear();
  orderVersions.clear();

  notifyStatus('disconnected');
}

export function onRealtimeStatus(
  listener: RealtimeStatusListener,
) {
  statusListeners.add(listener);
  listener(currentStatus);

  return () => {
    statusListeners.delete(listener);
  };
}

export function onNftUpdated(listener: NftUpdatedListener) {
  nftListeners.add(listener);

  return () => {
    nftListeners.delete(listener);
  };
}

export function onOrderUpdated(listener: OrderUpdatedListener) {
  orderListeners.add(listener);

  return () => {
    orderListeners.delete(listener);
  };
}
