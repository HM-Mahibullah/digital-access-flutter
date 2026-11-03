import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../data/authorized_persons.dart';
import 'app_settings.dart';

class Detection {
  /// চেনা ব্যক্তির নাম; অচেনা হলে null
  final String? name;
  final bool authorized;
  final double conf;
  Detection(this.name, this.authorized, this.conf);

  /// Server JSON: {"name": "Tanmoy", "status": "authorized", "conf": 0.91}
  factory Detection.fromJson(Map<String, dynamic> j) {
    final name = j['name'] as String?;
    final authorized = j['status'] == 'authorized' && name != null && authorizedPersons.contains(name);
    return Detection(name, authorized, (j['conf'] as num?)?.toDouble() ?? 0);
  }

  String get label => authorized ? name! : 'Unknown';
}

class DetectionEvent {
  final Detection detection;
  final DateTime time;
  DetectionEvent(this.detection, this.time);
}

/// প্রতি ১ সেকেন্ডে Pi-এর /status API পড়ে এবং কে কখন এসেছে তা event list-এ রাখে।
class DetectionService extends ChangeNotifier {
  DetectionService._();
  static final DetectionService instance = DetectionService._();

  List<Detection> detections = [];
  double fps = 0;
  bool connected = false;

  /// mock_server.py চললে true: ডেটা simulated, আসল AI ফলাফল নয়
  bool simulated = false;
  final List<DetectionEvent> events = [];

  Timer? _timer;
  final Map<String, DateTime> _lastLogged = {};
  static const _cooldown = Duration(seconds: 15);
  static const _maxEvents = 300;

  bool get hasUnauthorized => detections.any((d) => !d.authorized);
  bool get hasAuthorized => detections.any((d) => d.authorized);
  List<String> get authorizedNames =>
      detections.where((d) => d.authorized).map((d) => d.name!).toSet().toList();
  int get unauthorizedCount => detections.where((d) => !d.authorized).length;

  void start() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _poll());
    _poll();
  }

  void stop() => _timer?.cancel();

  Future<void> _poll() async {
    try {
      final res = await http
          .get(Uri.parse(AppSettings.instance.statusUrl))
          .timeout(const Duration(seconds: 3));
      if (res.statusCode != 200) throw Exception('HTTP ${res.statusCode}');
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      detections = (data['detections'] as List? ?? [])
          .map((e) => Detection.fromJson(e as Map<String, dynamic>))
          .toList();
      fps = (data['fps'] as num?)?.toDouble() ?? 0;
      simulated = data['simulated'] == true;
      connected = true;
      _logEvents();
    } catch (_) {
      connected = false;
      detections = [];
    }
    notifyListeners();
  }

  void _logEvents() {
    final now = DateTime.now();
    for (final d in detections) {
      final key = d.authorized ? d.name! : '__unknown__';
      final last = _lastLogged[key];
      if (last != null && now.difference(last) < _cooldown) continue;
      _lastLogged[key] = now;
      events.insert(0, DetectionEvent(d, now));
    }
    if (events.length > _maxEvents) events.removeRange(_maxEvents, events.length);
  }

  void clearEvents() {
    events.clear();
    _lastLogged.clear();
    notifyListeners();
  }
}
