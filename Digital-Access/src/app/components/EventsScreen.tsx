import { AlertTriangle, User as UserIcon, Package, Bell } from 'lucide-react';

export function EventsScreen() {
  const events = [
    {
      id: '1',
      type: 'motion',
      camera: 'Front Door',
      time: '2 minutes ago',
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      severity: 'high'
    },
    {
      id: '2',
      type: 'person',
      camera: 'Backyard',
      time: '15 minutes ago',
      thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
      severity: 'medium'
    },
    {
      id: '3',
      type: 'package',
      camera: 'Front Door',
      time: '1 hour ago',
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      severity: 'low'
    },
    {
      id: '4',
      type: 'motion',
      camera: 'Garage',
      time: '2 hours ago',
      thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
      severity: 'low'
    },
    {
      id: '5',
      type: 'person',
      camera: 'Side Gate',
      time: '3 hours ago',
      thumbnail: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop',
      severity: 'high'
    },
    {
      id: '6',
      type: 'motion',
      camera: 'Baby Room',
      time: 'Yesterday',
      thumbnail: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
      severity: 'medium'
    }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'motion':
        return <AlertTriangle className="w-5 h-5" />;
      case 'person':
        return <UserIcon className="w-5 h-5" />;
      case 'package':
        return <Package className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-600';
      case 'medium':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="h-full bg-background overflow-y-auto pb-20">
      <div className="bg-primary text-primary-foreground px-4 py-6">
        <h1 className="text-xl">Events & Alerts</h1>
        <p className="text-sm opacity-90 mt-1">{events.length} recent events</p>
      </div>

      <div className="p-4 space-y-3">
        {events.map((event) => (
          <div key={event.id} className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex gap-3 p-3">
              <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden">
                <img
                  src={event.thumbnail}
                  alt={event.camera}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-1 left-1 p-1 rounded ${getSeverityColor(event.severity)}`}>
                  {getEventIcon(event.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium capitalize">{event.type} Detected</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {event.time}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{event.camera}</p>

                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90">
                    View
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200">
                    Share
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
