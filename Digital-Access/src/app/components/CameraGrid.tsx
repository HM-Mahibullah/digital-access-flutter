import { Video, Wifi, WifiOff, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface Camera {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  thumbnail: string;
}

interface CameraGridProps {
  onCameraClick: (camera: Camera) => void;
}

export function CameraGrid({ onCameraClick }: CameraGridProps) {
  const [cameras] = useState<Camera[]>([
    {
      id: '1',
      name: 'Front Door',
      location: 'Entrance',
      isOnline: true,
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      name: 'Backyard',
      location: 'Garden',
      isOnline: true,
      thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop'
    },
    {
      id: '3',
      name: 'Living Room',
      location: 'Indoor',
      isOnline: false,
      thumbnail: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=300&fit=crop'
    },
    {
      id: '4',
      name: 'Garage',
      location: 'Parking',
      isOnline: true,
      thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop'
    },
    {
      id: '5',
      name: 'Side Gate',
      location: 'Entrance',
      isOnline: true,
      thumbnail: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop'
    },
    {
      id: '6',
      name: 'Baby Room',
      location: 'Indoor',
      isOnline: true,
      thumbnail: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop'
    }
  ]);

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {cameras.map((camera) => (
        <div
          key={camera.id}
          onClick={() => onCameraClick(camera)}
          className="relative bg-card rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="relative aspect-[4/3] bg-gray-900">
            <img
              src={camera.thumbnail}
              alt={camera.name}
              className="w-full h-full object-cover opacity-90"
            />

            {!camera.isOnline && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center text-white">
                  <WifiOff className="w-8 h-8 mx-auto mb-1" />
                  <span className="text-xs">Offline</span>
                </div>
              </div>
            )}

            <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
              <MoreVertical className="w-4 h-4 text-white" />
            </div>

            {camera.isOnline && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 px-2 py-0.5 rounded">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-xs">LIVE</span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-sm">{camera.name}</h3>
                  <p className="text-gray-300 text-xs">{camera.location}</p>
                </div>
                {camera.isOnline ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="relative bg-card rounded-lg overflow-hidden shadow-sm border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary transition-colors">
        <div className="aspect-[4/3] flex flex-col items-center justify-center text-gray-400">
          <Video className="w-10 h-10 mb-2" />
          <span className="text-sm">Add Camera</span>
        </div>
      </div>
    </div>
  );
}
