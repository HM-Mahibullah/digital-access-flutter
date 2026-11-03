import 'package:flutter/material.dart';

import '../services/detection_service.dart';

/// কে কখন ক্যামেরার সামনে এসেছে তার তালিকা (Authorized + Unauthorized)।
class EventsScreen extends StatelessWidget {
  const EventsScreen({super.key});

  String _fmt(DateTime t) =>
      '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}:${t.second.toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    final svc = DetectionService.instance;
    return ListenableBuilder(
      listenable: svc,
      builder: (context, _) {
        if (svc.events.isEmpty) {
          return const Center(child: Text('এখনো কেউ শনাক্ত হয়নি'));
        }
        return Column(
          children: [
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: svc.clearEvents,
                icon: const Icon(Icons.delete_outline),
                label: const Text('সব মুছুন'),
              ),
            ),
            Expanded(
              child: ListView.separated(
                itemCount: svc.events.length,
                separatorBuilder: (_, _) => const Divider(height: 1),
                itemBuilder: (_, i) {
                  final e = svc.events[i];
                  final d = e.detection;
                  final c = d.authorized ? Colors.green : Colors.red;
                  return ListTile(
                    leading: Icon(d.authorized ? Icons.verified_user : Icons.gpp_bad, color: c),
                    title: Text(d.label),
                    subtitle: Text(
                      '${d.authorized ? 'Authorized' : 'Unauthorized'} • ${(d.conf * 100).toStringAsFixed(0)}%',
                      style: TextStyle(color: c),
                    ),
                    trailing: Text(_fmt(e.time)),
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}
