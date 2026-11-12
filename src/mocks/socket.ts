
import { ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';

import { mockState } from './state';

type SocketIoClient = ReturnType<typeof toSocketIo>['client'];

const subscribers = new Map<string, Set<SocketIoClient>>();

const socketLink = ws.link('*/socket.io/*');

function sendEvent(
  client: SocketIoClient,
  event: string,
  payload: unknown,
) {
  client.emit(event, payload);
}

function broadcast(
  event: string,
  payload: unknown,
  userId?: string,
) {
  const targets = userId
    ? [subscribers.get(userId)]
    : Array.from(subscribers.values());

  targets.forEach((clients) => {
    clients?.forEach((client) => {
      sendEvent(client, event, payload);
    });
  });
}

const socketHandler = socketLink.addEventListener(
  'connection',
  (connection) => {
    const io = toSocketIo(connection);
    const client = io.client;

    let subscribedUserId: string | undefined;

    client.on('subscribe', (_event, payload) => {
      const data =
        typeof payload === 'object' && payload !== null
          ? (payload as Record<string, unknown>)
          : {};

      const token = String(data.token ?? '');
      const user = mockState.getUserFromToken(token);

      if (!user) {
        sendEvent(client, 'session.expired', {
          message: 'Sessão inválida ou expirada.',
        });

        return;
      }

      if (subscribedUserId) {
        subscribers.get(subscribedUserId)?.delete(client);

        if (subscribers.get(subscribedUserId)?.size === 0) {
          subscribers.delete(subscribedUserId);
        }
      }

      subscribedUserId = user.id;

      const userSubscribers =
        subscribers.get(user.id) ?? new Set<SocketIoClient>();

      userSubscribers.add(client);
      subscribers.set(user.id, userSubscribers);

      sendEvent(client, 'realtime.connected', {
        userId: user.id,
        connectedAt: new Date().toISOString(),
      });
    });

    client.on('unsubscribe', () => {
      if (!subscribedUserId) return;

      const userSubscribers = subscribers.get(subscribedUserId);

      userSubscribers?.delete(client);

      if (userSubscribers?.size === 0) {
        subscribers.delete(subscribedUserId);
      }

      subscribedUserId = undefined;
    });

    connection.client.addEventListener('close', () => {
      if (!subscribedUserId) return;

      const userSubscribers = subscribers.get(subscribedUserId);

      userSubscribers?.delete(client);

      if (userSubscribers?.size === 0) {
        subscribers.delete(subscribedUserId);
      }

      subscribedUserId = undefined;
    });
  },
);

export function publishNftUpdated(payload: {
  nftId: string;
  priceInEth: number;
  available?: number;
  version: number;
}) {
  broadcast('nft.updated', {
    ...payload,
    updatedAt: new Date().toISOString(),
  });
}

export function publishOrderUpdated(
  userId: string,
  payload: {
    orderId: string;
    status: string;
    version: number;
  },
) {
  broadcast(
    'order.updated',
    {
      ...payload,
      updatedAt: new Date().toISOString(),
    },
    userId,
  );
}

export const socketHandlers = [socketHandler];
