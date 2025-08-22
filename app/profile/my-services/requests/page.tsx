"use client"

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Request {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  message?: string;
}

export default function ServiceRequestsPage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('id');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<{ title: string; description: string; } | null>(null);

  useEffect(() => {
    if (!serviceId) return;

    // Fetch service details
    fetch(`/api/user/services/${serviceId}`)
      .then(res => res.json())
      .then(data => {
        setService(data.service);
      })
      .catch(console.error);

    // Fetch requests for this service
    fetch(`/api/user/services/${serviceId}/requests`)
      .then(res => res.json())
      .then(data => {
        setRequests(data.requests || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [serviceId]);

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`/api/user/services/${serviceId}/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error('Failed to update request');

      // Update the local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: action === 'accept' ? 'accepted' : 'rejected' } : req
      ));
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  };

  if (!serviceId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 p-8">
        <div className="max-w-2xl mx-auto text-center text-red-400">
          No service ID provided
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-400 to-teal-500 mb-4">
              Service Requests
            </h1>
            {service && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-8">
                <h2 className="text-xl font-semibold text-green-300 mb-2">{service.title}</h2>
                <p className="text-gray-400">{service.description}</p>
              </div>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center bg-gray-800/50 rounded-lg p-8">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-green-300 mb-2">No Requests Yet</h3>
              <p className="text-gray-400">When players request your service, they'll appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div 
                  key={request.id}
                  className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-green-500/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {request.userAvatar ? (
                        <img 
                          src={request.userAvatar} 
                          alt={request.userName}
                          className="w-12 h-12 rounded-full border-2 border-green-500/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-green-900/50 flex items-center justify-center border-2 border-green-500/30">
                          <span className="text-xl">👤</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-green-300">{request.userName}</h3>
                        <p className="text-sm text-gray-400">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {request.status === 'pending' ? (
                        <>
                          <Button
                            onClick={() => handleRequestAction(request.id, 'accept')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleRequestAction(request.id, 'reject')}
                            variant="destructive"
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          request.status === 'accepted' 
                            ? 'bg-green-900/50 text-green-300' 
                            : 'bg-red-900/50 text-red-300'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  {request.message && (
                    <p className="text-gray-300 bg-black/20 rounded p-3 mt-2">
                      {request.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
