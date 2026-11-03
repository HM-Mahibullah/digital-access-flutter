import 'package:flutter/material.dart';

import '../services/app_settings.dart';
import '../services/detection_service.dart';
import '../widgets/mjpeg_view.dart';

class CameraScreen extends StatelessWidget {
  const CameraScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: AppSettings.instance.serverUrl,
      builder: (context, _, _) => Column(
        children: [
          AspectRatio(
            aspectRatio: 4 / 3,
            child: Container(
              color: Colors.black,
              child: MjpegView(url: AppSettings.instance.videoUrl),
            ),
          ),
          const Expanded(child: _StatusPanel()),
        ],
      ),
    );
  }
}

class _StatusPanel extends StatelessWidget {
  const _StatusPanel();

  @override
  Widget build(BuildContext context) {
    final svc = DetectionService.instance;
    return ListenableBuilder(
      listenable: svc,
      builder: (context, _) {
        if (!svc.connected) {
          return const Center(
            child: Text('SERVER NOT CONNECTED',
                textAlign: TextAlign.center),
          );
        }

        final Color color;
        final IconData icon;
        final String title;
        final String subtitle;
        if (svc.hasUnauthorized) {
          color = Colors.red;
          icon = Icons.gpp_bad;
          title = 'UNAUTHORIZED';
          subtitle = '${svc.unauthorizedCount} জন অচেনা ব্যক্তি শনাক্ত হয়েছে!';
        } else if (svc.hasAuthorized) {
          color = Colors.green;
          icon = Icons.verified_user;
          title = 'AUTHORIZED';
          subtitle = svc.authorizedNames.join(', ');
        } else {
          color = Colors.grey;
          icon = Icons.person_search;
          title = 'কেউ নেই';
          subtitle = 'ক্যামেরায় কোনো ব্যক্তি শনাক্ত হয়নি';
        }

        return ListView(
          padding: const EdgeInsets.all(12),
          children: [
            Card(
              color: color.withValues(alpha: 0.12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: color, width: 2),
              ),
              child: ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                leading: Icon(icon, color: color, size: 44),
                title: Text(title,
                    style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 22)),
                subtitle: Text(subtitle, style: const TextStyle(fontSize: 15)),
                trailing: Text('FPS ${svc.fps.toStringAsFixed(1)}',
                    style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ),
            ),
            ...svc.detections.map((d) {
              final c = d.authorized ? Colors.green : Colors.red;
              return ListTile(
                dense: true,
                leading: CircleAvatar(
                  backgroundColor: c.withValues(alpha: 0.15),
                  child: Icon(d.authorized ? Icons.person : Icons.person_off, color: c),
                ),
                title: Text(d.label, style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(d.authorized ? 'Authorized' : 'Unauthorized',
                    style: TextStyle(color: c)),
                trailing: Text('${(d.conf * 100).toStringAsFixed(0)}%',
                    style: TextStyle(color: c, fontWeight: FontWeight.bold)),
              );
            }),
          ],
        );
      },
    );
  }
}
