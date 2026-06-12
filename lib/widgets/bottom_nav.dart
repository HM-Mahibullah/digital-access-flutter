import 'package:flutter/material.dart';

class BottomNav extends StatelessWidget {
  final String activeTab;
  final ValueChanged<String> onTabChange;

  const BottomNav({Key? key, required this.activeTab, required this.onTabChange}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final tabs = [
      {'id': 'cameras', 'icon': Icons.videocam, 'label': 'Cameras'},
      {'id': 'events', 'icon': Icons.notifications, 'label': 'Events'},
      {'id': 'devices', 'icon': Icons.storage, 'label': 'Devices'},
      {'id': 'settings', 'icon': Icons.settings, 'label': 'Settings'},
    ];

    return BottomAppBar(
      elevation: 8,
      child: Row(
        children: tabs.map((tab) {
          final id = tab['id'] as String;
          final isActive = activeTab == id;
          final icon = tab['icon'] as IconData;

          return Expanded(
            child: InkWell(
              onTap: () => onTabChange(id),
              child: Container(
                height: 64,
                alignment: Alignment.center,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(icon, color: isActive ? Theme.of(context).colorScheme.primary : Colors.grey, size: 22),
                    const SizedBox(height: 4),
                    Text(
                      tab['label'] as String,
                      style: TextStyle(
                        fontSize: 11,
                        color: isActive ? Theme.of(context).colorScheme.primary : Colors.grey,
                      ),
                    ),
                    if (isActive)
                      Container(
                        margin: const EdgeInsets.only(top: 6),
                        height: 4,
                        width: 40,
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primary,
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
