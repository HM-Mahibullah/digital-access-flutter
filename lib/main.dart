import 'package:flutter/material.dart';
import 'widgets/bottom_nav.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Digital Access',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'Digital Access'),
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
  Widget build(BuildContext context) {
    Widget body;
    switch (_activeTab) {
      case 'events':
        body = const Center(child: Text('Events'));
        break;
      case 'devices':
        body = const Center(child: Text('Devices'));
        break;
      case 'settings':
        body = const Center(child: Text('Settings'));
        break;
      default:
        body = const Center(child: Text('Cameras'));
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
