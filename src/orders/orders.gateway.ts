import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Replaces the local `activeOrderId` polling loop from the old frontend demo.
 * Each connected client joins a room for its own role — this is what lets
 * "assign rider" on the wholesaler's screen show up instantly on the rider's phone.
 *
 * Client connects with: io(url, { query: { role: 'buyer', id: buyerId } })
 * and additionally joins `order:<id>` once it has an active order, so all three
 * roles watching the same order get the same events.
 */
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'orders' })
export class OrdersGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    const { role, id } = client.handshake.query as { role?: string; id?: string };
    if (role && id) {
      client.join(`${role}:${id}`); // e.g. "wholesaler:<uuid>", "buyer:<uuid>", "rider:<uuid>"
    }
  }

  @SubscribeMessage('order:join')
  handleJoinOrder(@ConnectedSocket() client: Socket, @MessageBody() orderId: string) {
    client.join(`order:${orderId}`);
  }

  emitToBuyer(buyerId: string, event: string, payload: unknown) {
    this.server.to(`buyer:${buyerId}`).emit(event, payload);
  }
  emitToWholesaler(wholesalerId: string, event: string, payload: unknown) {
    this.server.to(`wholesaler:${wholesalerId}`).emit(event, payload);
  }
  emitToRider(riderId: string, event: string, payload: unknown) {
    this.server.to(`rider:${riderId}`).emit(event, payload);
  }
  emitToRoom(room: string, event: string, payload: unknown) {
    this.server.to(room).emit(event, payload);
  }
}
