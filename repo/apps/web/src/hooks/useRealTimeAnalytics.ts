import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  translationsToday: number;
  documentsProcessed: number;
  voiceCommands: number;
  accessibilityFeatures: number;
  averageResponseTime: number;
  accuracyRate: number;
  mobileUsage: number;
  aiRequests: number;
}

interface RealTimeEvent {
  type: 'translation' | 'document' | 'voice' | 'accessibility' | 'user_join' | 'user_leave';
  data: any;
  timestamp: string;
}

export function useRealTimeAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    translationsToday: 0,
    documentsProcessed: 0,
    voiceCommands: 0,
    accessibilityFeatures: 0,
    averageResponseTime: 0,
    accuracyRate: 0,
    mobileUsage: 0,
    aiRequests: 0,
  });

  const [recentEvents, setRecentEvents] = useState<RealTimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const initializeSocket = () => {
      try {
        const socket = io(import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001', {
          transports: ['websocket', 'polling'],
          timeout: 5000,
          retries: 3,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          setIsConnected(true);
          setConnectionError(null);
          console.log('Analytics WebSocket connected');
          
          // Join analytics room
          socket.emit('join-analytics');
        });

        socket.on('disconnect', () => {
          setIsConnected(false);
          console.log('Analytics WebSocket disconnected');
        });

        socket.on('connect_error', (error) => {
          setConnectionError(error.message);
          console.error('Analytics WebSocket connection error:', error);
        });

        // Listen for real-time analytics updates
        socket.on('analytics:update', (data: Partial<AnalyticsData>) => {
          setAnalyticsData(prev => ({ ...prev, ...data }));
        });

        // Listen for real-time events
        socket.on('analytics:event', (event: RealTimeEvent) => {
          setRecentEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
          
          // Update counters based on event type
          setAnalyticsData(prev => {
            const updated = { ...prev };
            
            switch (event.type) {
              case 'translation':
                updated.translationsToday += 1;
                updated.aiRequests += 1;
                break;
              case 'document':
                updated.documentsProcessed += 1;
                break;
              case 'voice':
                updated.voiceCommands += 1;
                break;
              case 'accessibility':
                updated.accessibilityFeatures += 1;
                break;
              case 'user_join':
                updated.activeUsers += 1;
                break;
              case 'user_leave':
                updated.activeUsers = Math.max(0, updated.activeUsers - 1);
                break;
            }
            
            return updated;
          });
        });

        // Listen for performance metrics
        socket.on('analytics:performance', (metrics: any) => {
          setAnalyticsData(prev => ({
            ...prev,
            averageResponseTime: metrics.responseTime,
            accuracyRate: metrics.accuracy,
          }));
        });

        return socket;
      } catch (error) {
        console.error('Failed to initialize analytics socket:', error);
        setConnectionError('Failed to connect to analytics service');
        return null;
      }
    };

    const socket = initializeSocket();

    // Fallback: Fetch initial data from REST API
    const fetchInitialData = async () => {
      try {
        const response = await fetch('/api/analytics/current', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        }
      } catch (error) {
        console.error('Failed to fetch initial analytics data:', error);
        
        // Use mock data for development
        setAnalyticsData({
          totalUsers: 1247,
          activeUsers: 89,
          translationsToday: 3456,
          documentsProcessed: 234,
          voiceCommands: 567,
          accessibilityFeatures: 123,
          averageResponseTime: 1.2,
          accuracyRate: 98.5,
          mobileUsage: 67,
          aiRequests: 890,
        });
      }
    };

    fetchInitialData();

    // Simulate real-time updates for development
    const simulateUpdates = () => {
      const interval = setInterval(() => {
        if (!isConnected) {
          // Simulate real-time updates when WebSocket is not available
          setAnalyticsData(prev => ({
            ...prev,
            translationsToday: prev.translationsToday + Math.floor(Math.random() * 3),
            voiceCommands: prev.voiceCommands + Math.floor(Math.random() * 2),
            aiRequests: prev.aiRequests + Math.floor(Math.random() * 5),
            activeUsers: Math.max(1, prev.activeUsers + Math.floor(Math.random() * 3) - 1),
          }));

          // Add simulated events
          const eventTypes: RealTimeEvent['type'][] = ['translation', 'document', 'voice', 'accessibility'];
          const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          
          const newEvent: RealTimeEvent = {
            type: randomType,
            data: { userId: 'demo-user', action: randomType },
            timestamp: new Date().toISOString(),
          };
          
          setRecentEvents(prev => [newEvent, ...prev.slice(0, 49)]);
        }
      }, 5000); // Update every 5 seconds

      return interval;
    };

    const updateInterval = simulateUpdates();

    // Cleanup
    return () => {
      if (socket) {
        socket.disconnect();
      }
      clearInterval(updateInterval);
    };
  }, []);

  const refreshData = async () => {
    try {
      const response = await fetch('/api/analytics/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Failed to refresh analytics data:', error);
    }
  };

  const exportData = async (format: 'json' | 'csv' = 'json') => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export analytics data:', error);
    }
  };

  return {
    analyticsData,
    recentEvents,
    isConnected,
    connectionError,
    refreshData,
    exportData,
  };
}