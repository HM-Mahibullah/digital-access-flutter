import {
  User,
  Bell,
  Shield,
  Smartphone,
  HardDrive,
  Wifi,
  Moon,
  Globe,
  HelpCircle,
  MessageSquare,
  LogOut,
  ChevronRight
} from 'lucide-react';

export function SettingsScreen() {
  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', value: 'John Doe', color: 'text-primary' },
        { icon: Bell, label: 'Notifications', value: 'On', color: 'text-primary' },
        { icon: Shield, label: 'Privacy & Security', value: '', color: 'text-primary' }
      ]
    },
    {
      title: 'Device Settings',
      items: [
        { icon: Smartphone, label: 'Camera Settings', value: '', color: 'text-primary' },
        { icon: HardDrive, label: 'Storage', value: '12.4 GB / 32 GB', color: 'text-primary' },
        { icon: Wifi, label: 'Network', value: 'Connected', color: 'text-green-600' }
      ]
    },
    {
      title: 'App Settings',
      items: [
        { icon: Moon, label: 'Dark Mode', value: 'Off', color: 'text-primary' },
        { icon: Globe, label: 'Language', value: 'English', color: 'text-primary' }
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', value: '', color: 'text-primary' },
        { icon: MessageSquare, label: 'Contact Support', value: '', color: 'text-primary' }
      ]
    }
  ];

  return (
    <div className="h-full bg-background overflow-y-auto pb-20">
      <div className="bg-primary text-primary-foreground px-4 py-6">
        <h1 className="text-xl">Settings</h1>
        <p className="text-sm opacity-90 mt-1">Manage your preferences</p>
      </div>

      <div className="p-4">
        {/* User Profile Card */}
        <div className="bg-card rounded-lg p-4 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">John Doe</h3>
              <p className="text-sm text-muted-foreground">john.doe@email.com</p>
              <p className="text-xs text-primary mt-1">Premium Account</p>
            </div>
            <button className="text-primary text-sm hover:underline">
              Edit
            </button>
          </div>
        </div>

        {/* Settings Menu */}
        {menuSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-xs uppercase text-muted-foreground mb-3 px-2">{section.title}</h3>
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              {section.items.map((item, itemIdx) => (
                <button
                  key={itemIdx}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && (
                      <span className="text-sm text-muted-foreground">{item.value}</span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div className="bg-card rounded-lg p-4 shadow-sm mb-4">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Digital Access</p>
            <p className="text-xs mt-1">Version 2.4.1</p>
            <p className="text-xs mt-2">© 2026 Digital Access Inc.</p>
          </div>
        </div>

        {/* Logout Button */}
        <button className="w-full bg-red-50 text-red-600 py-3 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
