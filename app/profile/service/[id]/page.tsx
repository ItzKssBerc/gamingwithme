"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

interface Member {
  id: string
  username: string
  avatar: string
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  slots: number
  members: Member[]
}

export default function ServicePage() {
  const params = useParams()
  const id = params.id as string
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetch(`/api/user/services/${id}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text()
            try {
              const errorData = JSON.parse(errorText)
              throw new Error(errorData.error || errorText)
            } catch {
              throw new Error(errorText)
            }
          }
          return res.json()
        })
        .then((data) => {
          setService(data.service)
          setLoading(false)
        })
        .catch((err) => {
          setError(err.message)
          setLoading(false)
        })
    }
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!service) {
    return <div>Service not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{service.name}</h1>
      <p className="text-gray-400 mb-4">{service.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Price</h2>
          <p className="text-gray-400">${service.price}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Duration</h2>
          <p className="text-gray-400">{service.duration} minutes</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Available Slots</h2>
          <p className="text-gray-400">{service.slots - service.members.length} / {service.slots}</p>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Members</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {service.members.map((member) => (
            <div key={member.id} className="bg-gray-800 p-4 rounded-lg flex items-center">
              <img src={member.avatar} alt={member.username} className="w-12 h-12 rounded-full mr-4" />
              <div>
                <h3 className="text-lg font-bold">{member.username}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
