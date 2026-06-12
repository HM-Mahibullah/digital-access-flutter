import { Video, Wifi, WifiOff, Battery, BatteryCharging, Trash2, Settings } from 'lucide-react';

export function DevicesScreen() {
  const devices = [
    {
      id: '1',
      name: 'Front Door Camera',
      model: 'DA-2000 HD',
      status: 'online',
      battery: 85,
      signal: 'strong',
      firmware: 'v2.4.1'
    },
    {
      id: '2',
      name: 'Backyard Camera',
      model: 'DA-2000 HD',
      status: 'online',
      battery: 45,
      signal: 'medium',
      firmware: 'v2.4.1'
    },
    {
      id: '3',
      name: 'Living Room Camera',
      model: 'DA-3000 Pro',
      status: 'offline',
      battery: 0,
      signal: 'weak',
      firmware: 'v2.3.8'
    },
    {
      id: '4',
      name: 'Garage Camera',
      model: 'DA-2000 HD',
      status: 'online',
      battery: 100,
      signal: 'strong',
      firmware: 'v2.4.1'
    }
  ];

  return (
    <div className="h-full bg-background overflow-y-auto pb-20">
      <div className="bg-primary text-primary-foreground px-4 py-6">
        <h1 className="text-xl">My Devices</h1>
        <p className="text-sm opacity-90 mt-1">{devices.length} cameras connected</p>
      </div>

      <div className="p-4 space-y-3">
        {devices.map((device) => (
          <div key={device.id} className="bg-card rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-lg ${device.status === 'online' ? 'bg-primary/10' : 'bg-gray-100'}`}>
                  <Video className={`w-6 h-6 ${device.status === 'online' ? 'text-primary' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-medium">{device.name}</h3>
                  <p className="text-xs text-muted-foreground">{device.model}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {device.status === 'online' ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">Online</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-red-600">Offline</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-3 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {device.battery > 20 ? (
                    <BatteryCharging className={`w-5 h-5 ${device.battery < 50 ? 'text-yellow-500' : 'text-green-500'}`} />
                  ) : (
                    <Battery className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Battery</p>
                <p className="text-sm font-medium">{device.battery}%</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {device.status === 'online' ? (
                    <Wifi className={`w-5 h-5 ${
                      device.signal === 'strong' ? 'text-green-500' :
                      device.signal === 'medium' ? 'text-yellow-500' :
                      'text-red-500'
                    }`} />
                  ) : (
                    <WifiOff className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Signal</p>
                <p className="text-sm font-medium capitalize">{device.signal}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-sm">📦</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Firmware</p>
                <p className="text-sm font-medium">{device.firmware}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90 transition-colors text-sm">
                Configure
              </button>
              <button className="px-4 bg-red-50 text-red-600 py-2 rounded hover:bg-red-100 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        <button className="w-full bg-card border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary hover:bg-primary/5 transition-colors">
          <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Add New Camera</p>
        </button>
      </div>
    </div>
  );
}
