'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FixedService } from '@prisma/client';

const ServicesDashboard = () => {
    const [services, setServices] = useState<FixedService[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/user/services');
                if (!response.ok) {
                    throw new Error('Failed to load services');
                }
                const data = await response.json();
                setServices(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const handleDelete = async (serviceId: string) => {
        if (!confirm('Are you sure you want to permanently delete this service? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/user/services/${serviceId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete service');
            }

            // Sikeres törlés után frissítjük a listát
            setServices(services.filter(service => service.id !== serviceId));
            alert('Service deleted successfully.');

        } catch (err: any) {
            setError(err.message);
            alert(`Error: ${err.message}`);
        }
    };

    if (loading) return <p>Loading services...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">My Services</h1>
                <button
                    onClick={() => router.push('/profile/services/create')}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                    Create Service
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(service => (
                    <div key={service.id} className="border p-4 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold">{service.title}</h2>
                        <p className="text-gray-600">{service.description}</p>
                        <p className="text-lg font-bold mt-2">${service.price}</p>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button 
                                onClick={() => router.push(`/profile/services/edit/${service.id}`)} 
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleDelete(service.id)} 
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServicesDashboard;
