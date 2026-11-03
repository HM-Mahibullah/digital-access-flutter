import 'package:flutter/material.dart';

import '../main.dart';
import '../services/app_settings.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';

/// প্রথম loading screen: "Digital Access"
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _anim =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..forward();

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await Future.wait([
      AppSettings.instance.load(),
      AuthService.instance.load(),
      Future.delayed(const Duration(milliseconds: 2500)),
    ]);
    if (!mounted) return;
    Navigator.of(context).pushReplacement(MaterialPageRoute(
      builder: (_) => AuthService.instance.isLoggedIn
          ? const MyHomePage(title: 'Digital Access')
          : const LoginScreen(),
    ));
  }

  @override
  void dispose() {
    _anim.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [scheme.primary, scheme.tertiary],
          ),
        ),
        child: FadeTransition(
          opacity: _anim,
          child: ScaleTransition(
            scale: Tween(begin: 0.85, end: 1.0)
                .animate(CurvedAnimation(parent: _anim, curve: Curves.easeOutBack)),
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.shield_outlined, size: 96, color: Colors.white),
                SizedBox(height: 20),
                Text('Digital Access',
                    style: TextStyle(
                        fontSize: 34, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.2)),
                SizedBox(height: 8),
                Text('AI Surveillance System', style: TextStyle(fontSize: 15, color: Colors.white70)),
                SizedBox(height: 48),
                SizedBox(
                  width: 28,
                  height: 28,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
