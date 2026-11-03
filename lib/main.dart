import 'package:flutter/material.dart';

import 'screens/camera_screen.dart';
import 'screens/events_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/splash_screen.dart';
import 'services/detection_service.dart';
import 'widgets/bottom_nav.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Digital Access',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const SplashScreen(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key, required this.title}) : super(key: key);
  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  String _activeTab = 'cameras';

  @override
  void initState() {
    super.initState();
    DetectionService.instance.start();
  }

  @override
  void dispose() {
    DetectionService.instance.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Widget body;
    switch (_activeTab) {
      case 'events':
        body = const EventsScreen();
        break;
      case 'devices':
        body = const Center(child: Text('Devices'));
        break;
      case 'settings':
        body = const SettingsScreen();
        break;
      default:
        body = const CameraScreen();
    }

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: body,
      bottomNavigationBar: BottomNav(
        activeTab: _activeTab,
        onTabChange: (tab) => setState(() => _activeTab = tab),
      ),
    );
  }
}
