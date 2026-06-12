import { useState } from 'react';
import { CameraGrid } from './components/CameraGrid';
import { CameraDetail } from './components/CameraDetail';
import { DevicesScreen } from './components/DevicesScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { EventsScreen } from './components/EventsScreen';
import { BottomNav } from './components/BottomNav';

interface Camera {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  thumbnail: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('cameras');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  const handleCameraClick = (camera: Camera) => {
    setSelectedCamera(camera);
  };

  const handleBackToGrid = () => {
    setSelectedCamera(null);
  };

  return (
    <div className="size-full flex flex-col bg-background">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {selectedCamera ? (
          <CameraDetail camera={selectedCamera} onBack={handleBackToGrid} />
        ) : (
          <>
            {activeTab === 'cameras' && (
              <div className="h-full overflow-y-auto pb-20">
                <div className="bg-primary text-primary-foreground px-4 py-6">
                  <h1 className="text-xl">Digital Access</h1>
                  <p className="text-sm opacity-90 mt-1">Your connected cameras</p>
                </div>
                <CameraGrid onCameraClick={handleCameraClick} />
              </div>
            )}

            {activeTab === 'events' && <EventsScreen />}

            {activeTab === 'devices' && <DevicesScreen />}

            {activeTab === 'settings' && <SettingsScreen />}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      {!selectedCamera && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}