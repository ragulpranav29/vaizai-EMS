import { io, Socket } from 'socket.io-client';

type ConnectionCallback = (status: boolean) => void;
type EventCallback = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  private statusListeners: ConnectionCallback[] = [];

  public connect(username?: string) {
    if (this.socket) {
      if (username) {
        this.emit('join', { username });
      }
      return;
    }

    this.socket = io(this.url, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('SocketService: Connected successfully.');
      this.notifyStatus(true);
      if (username) {
        this.emit('join', { username });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`SocketService: Disconnected. Reason: ${reason}`);
      this.notifyStatus(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('SocketService: Connection error:', error);
      this.notifyStatus(false);
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`SocketService: Reconnecting (attempt ${attempt})...`);
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`SocketService: Reconnected on attempt ${attempt}`);
      this.notifyStatus(true);
      if (username) {
        this.emit('join', { username });
      }
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.notifyStatus(false);
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn(`SocketService: Attempted to emit "${event}" but socket is not connected.`);
    }
  }

  public on(event: string, callback: EventCallback) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      // Re-queue or log
      console.warn(`SocketService: Registering listener for "${event}" on unitialized socket.`);
    }
  }

  public off(event: string, callback?: EventCallback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Connection State Hooks
  public onStatusChange(callback: ConnectionCallback) {
    this.statusListeners.push(callback);
    if (this.socket) {
      callback(this.socket.connected);
    } else {
      callback(false);
    }
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }

  private notifyStatus(status: boolean) {
    this.statusListeners.forEach(cb => cb(status));
  }
}

export const socketService = new SocketService();
export default socketService;
