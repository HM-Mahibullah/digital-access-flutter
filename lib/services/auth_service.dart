import 'package:shared_preferences/shared_preferences.dart';

/// Demo login: কোনো Google/server যাচাই নেই। সঠিক format-এর যেকোনো email ও password দিলেই login হবে।
class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  static const _keyEmail = 'logged_in_email';
  String? email;

  bool get isLoggedIn => email != null;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    email = prefs.getString(_keyEmail);
  }

  Future<void> login(String mail, String password) async {
    await Future.delayed(const Duration(milliseconds: 600)); // ছোট loading effect
    email = mail.trim();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyEmail, email!);
  }

  Future<void> logout() async {
    email = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyEmail);
  }
}
