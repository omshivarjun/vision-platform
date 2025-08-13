'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'running' | 'stopped' | 'checking';
  description: string;
  icon: string;
}

export default function DashboardPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'AI Service',
      url: 'http://localhost:8000/docs',
      status: 'checking',
      description: 'Translation, OCR, Speech processing, and accessibility features',
      icon: '🤖'
    },
    {
      name: 'API Service',
      url: 'http://localhost:3001/',
      status: 'checking',
      description: 'Backend API for the Vision Platform',
      icon: '🔧'
    },
    {
      name: 'Web Frontend',
      url: 'http://localhost:3000/',
      status: 'checking',
      description: 'Next.js web application with modern UI',
      icon: '🌐'
    },
    {
      name: 'Monitoring',
      url: 'http://localhost:3002',
      status: 'checking',
      description: 'Grafana dashboard for system monitoring',
      icon: '📊'
    },
    {
      name: 'Mobile App',
      url: 'http://localhost:19000',
      status: 'checking',
      description: 'React Native mobile application',
      icon: '📱'
    },
    {
      name: 'Prometheus',
      url: 'http://localhost:9090',
      status: 'checking',
      description: 'Metrics collection and monitoring',
      icon: '📈'
    }
  ]);

  useEffect(() => {
    // Check service status
    const checkServices = async () => {
      const updatedServices = await Promise.all(
        services.map(async (service) => {
          try {
            const response = await fetch(service.url, { 
              method: 'HEAD',
              mode: 'no-cors' // Avoid CORS issues
            });
            return { ...service, status: 'running' as const };
          } catch (error) {
            return { ...service, status: 'stopped' as const };
          }
        })
      );
      setServices(updatedServices);
    };

    checkServices();
    const interval = setInterval(checkServices, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'stopped':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'checking':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return 'Running';
      case 'stopped':
        return 'Stopped';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Vision Platform Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Monitor and access all your services in one place
          </p>
        </div>

        {/* Main Platform Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">🌐 Main Platform</h2>
          <p className="text-xl mb-6 opacity-90">
            Access everything through our unified platform
          </p>
          <Link 
            href="http://localhost:80" 
            target="_blank"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Open Main Platform
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200"
              onClick={() => window.open(service.url, '_blank')}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{service.icon}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                    {getStatusText(service.status)}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {service.description}
                </p>
                
                <div className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  Click to open →
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/login"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              🔐 Login
            </Link>
            <Link 
              href="/register"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ✨ Register
            </Link>
            <button 
              onClick={() => window.open('http://localhost:80', '_blank')}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🌐 Main Platform
            </button>
            <button 
              onClick={() => window.open('http://localhost:8000/docs', '_blank')}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              🤖 AI Service
            </button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            💡 <strong>Pro Tip:</strong> Use the Main Platform at localhost:80 to access everything!
          </p>
        </div>
      </div>
    </div>
  );
}
