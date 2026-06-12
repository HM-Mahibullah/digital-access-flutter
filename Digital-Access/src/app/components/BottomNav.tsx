import { Video, Bell, HardDrive, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'cameras', icon: Video, label: 'Cameras' },
    { id: 'events', icon: Bell, label: 'Events' },
    { id: 'devices', icon: HardDrive, label: 'Devices' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-primary/10' : ''}`} />
              <span className="text-xs mt-1">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 h-1 w-12 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
