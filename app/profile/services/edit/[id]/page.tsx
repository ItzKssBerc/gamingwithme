'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Service {
    id: string;
    title: string;
    description: string;
    price?: number | null;
    duration?: number | null;
    capacity?: number | null;
    isActive: boolean;
}

export default function EditServicePage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [service, setService] = useState<Service | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [capacity, setCapacity] = useState('1'); // Default to 1 like in create page
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchService = async () => {
                try {
                    const res = await fetch(`/api/user/services/${id}`);
                    if (!res.ok) {
                        throw new Error('Failed to fetch service details.');
                    }
                    const data: Service = await res.json();
                    setService(data);
                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setPrice(data.price != null ? data.price.toString() : '');
                    setDuration(data.duration != null ? data.duration.toString() : '');
                    // Correctly set capacity from fetched data
                    setCapacity(data.capacity != null ? data.capacity.toString() : '1');
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'An unknown error occurred');
                } finally {
                    setLoading(false);
                }
            };
            fetchService();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title || !description || !price || !duration || !capacity) {
            setError('All fields are required.');
            return;
        }

        try {
            const res = await fetch(`/api/user/services/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    price: parseFloat(price),
                    duration: parseInt(duration, 10),
                    capacity: parseInt(capacity, 10)
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update service.');
            }

            router.push('/profile/services/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };

    if (status === 'loading' || loading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    if (status === 'unauthenticated') {
        router.push('/api/auth/signin');
        return null;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
    }

    if (!service) {
        return <div className="text-center mt-10">Service not found.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Edit Service</h1>
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="price" className="block text-gray-700 font-bold mb-2">Price ($)</label>
                    <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="duration" className="block text-gray-700 font-bold mb-2">Duration (minutes)</label>
                    <input
                        type="number"
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="capacity" className="block text-gray-700 font-bold mb-2">capacity</label>
                    <input
                        type="number"
                        id="capacity"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
