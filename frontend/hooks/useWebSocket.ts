// In hooks/useWebSocket.ts

import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/ws` 
    : 'http://localhost:8080/ws';

export const useWebSocket = (topic: string, onMessageReceived: (message: any) => void, token: string | null) => {
    // Use a ref to hold the client instance so it persists across re-renders
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        // Don't do anything if we don't have a token.
        if (!token) {
            return;
        }

        // Initialize the client only if it doesn't exist.
        // This is the key to making it Strict Mode proof.
        if (!clientRef.current) {
            clientRef.current = new Client({
                webSocketFactory: () => new SockJS(SOCKET_URL),
                reconnectDelay: 5000,
                onConnect: () => {
                    console.log('WebSocket Connected!');
                    // Subscribe to the topic once connected
                    clientRef.current?.subscribe(topic, (message) => {
                        if (message.body) {
                            onMessageReceived(JSON.parse(message.body));
                        }
                    });
                },
                onStompError: (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    console.error('Additional details: ' + frame.body);
                },
            });
        }
        
        // Pass the token in the connection headers
        clientRef.current.connectHeaders = {
            Authorization: `Bearer ${token}`,
        };
        
        // Activate the client
        clientRef.current.activate();

        // The cleanup function will run when the component unmounts
        return () => {
            if (clientRef.current?.active) {
                console.log('Deactivating WebSocket client...');
                // Use the deactivate method which returns a promise
                clientRef.current.deactivate().catch(err => console.error("Error deactivating client", err));
            }
        };
        // The dependency array is simplified as the client is now managed by the ref
    }, [topic, onMessageReceived, token]);
};