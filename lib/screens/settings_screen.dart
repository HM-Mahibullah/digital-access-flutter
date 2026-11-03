import 'package:flutter/material.dart';

import '../services/app_settings.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late final TextEditingController _ctrl =
      TextEditingController(text: AppSettings.instance.serverUrl.value);

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    await AppSettings.instance.setServerUrl(_ctrl.text);
    _ctrl.text = AppSettings.instance.serverUrl.value;
    if (!mounted) return;
    FocusScope.of(context).unfocus();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('সংরক্ষণ হয়েছে')),
    );
  }

  Future<void> _logout() async {
    await AuthService.instance.logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Raspberry Pi Server', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text('Pi-তে `hostname -I` চালিয়ে IP বের করুন। মোবাইল ও Pi একই WiFi-তে থাকতে হবে।'),
        const SizedBox(height: 16),
        TextField(
          controller: _ctrl,
          keyboardType: TextInputType.url,
          decoration: const InputDecoration(
            labelText: 'Server URL',
            hintText: 'http://192.168.0.110:5000',
            border: OutlineInputBorder(),
          ),
          onSubmitted: (_) => _save(),
        ),
        const SizedBox(height: 12),
        FilledButton.icon(onPressed: _save, icon: const Icon(Icons.save), label: const Text('Save')),
        const SizedBox(height: 32),
        const Divider(),
        ListTile(
          leading: const Icon(Icons.account_circle),
          title: Text(AuthService.instance.email ?? ''),
          subtitle: const Text('Logged in'),
        ),
        OutlinedButton.icon(
          onPressed: _logout,
          icon: const Icon(Icons.logout, color: Colors.red),
          label: const Text('Logout', style: TextStyle(color: Colors.red)),
        ),
      ],
    );
  }
}
