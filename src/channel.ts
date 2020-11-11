import { StratoSocket, MessageData } from "./socket";

/**
 * High-level namespace-based Channel abstraction
 */
export class StratoChannel {
    constructor(
        private readonly socket: StratoSocket,
        public readonly namespace: string,
        private readonly options: {
            destination?: string,
        } = {},
    ) { }

    public async request(message: Record<string, unknown>) {
        const toSend = {
            requestId: this.socket.nextId(),
            ...message,
        };

        // TODO timeout
        await this.send(toSend);
        for await (const m of this.socket.receive()) {
            if (
                !Buffer.isBuffer(m.data)
                && typeof m.data !== "string"
                && m.data.requestId === message.requestId
            ) {
                return m.data;
            }
        }
    }

    public async send(message: MessageData) {
        this.socket.write({
            namespace: this.namespace,
            destination: this.options.destination,
            data: message,
        });
    }
}
