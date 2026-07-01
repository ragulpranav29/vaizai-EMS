import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppService } from './app.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Track online users: socketId -> username
  private activeUsers = new Map<string, string>();

  constructor(private readonly appService: AppService) {}

  handleConnection(client: Socket) {
    console.log(`Socket Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket Disconnected: ${client.id}`);
    this.activeUsers.delete(client.id);
    this.broadcastActiveUsers();
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() payload: { username: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`User joined: ${payload.username} (${client.id})`);
    this.activeUsers.set(client.id, payload.username);
    this.broadcastActiveUsers();

    // Send a system message to chat
    this.server.emit('message_received', {
      id: `sys-${Date.now()}`,
      channel: 'general',
      text: `${payload.username} joined the workspace.`,
      sender: 'System',
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() payload: { channel: string; text: string; sender: string },
  ) {
    // Save to DB
    const saved = await this.appService.saveMessage({
      channel: payload.channel,
      text: payload.text,
      sender: payload.sender,
    });

    // Broadcast message
    this.server.emit('message_received', {
      id: saved.id,
      channel: saved.channel,
      text: saved.text,
      sender: saved.sender,
      timestamp: saved.timestamp.toISOString(),
    });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody()
    payload: { username: string; isTyping: boolean; channel: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.emit('typing_status_updated', {
      username: payload.username,
      isTyping: payload.isTyping,
      channel: payload.channel,
    });
  }

  @SubscribeMessage('task_changed')
  handleTaskChanged(@MessageBody() payload: any) {
    this.server.emit('task_updated', payload);
  }

  @SubscribeMessage('sprint_changed')
  handleSprintChanged(@MessageBody() payload: any) {
    this.server.emit('sprint_updated', payload);
  }

  // Helper to send real-time notification from automation triggers or task updates
  broadcastNotification(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' = 'info',
  ) {
    this.server.emit('notification_received', {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
    });
  }

  private broadcastActiveUsers() {
    const list = Array.from(new Set(this.activeUsers.values()));
    this.server.emit('online_users_updated', list);
  }
}
