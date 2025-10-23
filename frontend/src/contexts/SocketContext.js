import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    } else {
      // Disconnect socket if not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated]);

  const joinParkingLot = (lotId) => {
    if (socket && connected) {
      socket.emit('join-parking-lot', lotId);
    }
  };

  const leaveParkingLot = (lotId) => {
    if (socket && connected) {
      socket.emit('leave-parking-lot', lotId);
    }
  };

  const subscribeToSlotUpdates = (callback) => {
    if (socket) {
      socket.on('slot-update', callback);
      return () => socket.off('slot-update', callback);
    }
  };

  const subscribeToOccupancyUpdates = (callback) => {
    if (socket) {
      socket.on('occupancy-update', callback);
      return () => socket.off('occupancy-update', callback);
    }
  };

  const value = {
    socket,
    connected,
    joinParkingLot,
    leaveParkingLot,
    subscribeToSlotUpdates,
    subscribeToOccupancyUpdates
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};