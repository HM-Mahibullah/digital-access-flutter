import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Raspberry Pi server-এর ঠিকানা (যেমন http://192.168.0.105:5000) সংরক্ষণ করে।
class AppSettings {
  AppSettings._();
  static final AppSettings instance = AppSettings._();

  static const _keyServer = 'server_url';
  static const defaultServer = 'http://192.168.0.110:5000';

  final ValueNotifier<String> serverUrl = ValueNotifier(defaultServer);

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    serverUrl.value = prefs.getString(_keyServer) ?? defaultServer;
  }

  Future<void> setServerUrl(String url) async {
    var u = url.trim();
    if (!u.startsWith('http://') && !u.startsWith('https://')) u = 'http://$u';
    while (u.endsWith('/')) {
      u = u.substring(0, u.length - 1);
    }
    serverUrl.value = u;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyServer, u);
  }

  String get videoUrl => '${serverUrl.value}/video_feed';
  String get statusUrl => '${serverUrl.value}/status';
}
