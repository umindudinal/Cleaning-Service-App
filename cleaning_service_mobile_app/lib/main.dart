import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'services/api_service.dart';
import 'theme/app_theme.dart';

const String supabaseUrl = 'https://iactnhptqkctvqrerhpk.supabase.co';
const String supabaseAnonKey = 'sb_publishable_MA0-SjihXQN3X8dKascTFA_B6lPO_vi';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize saved settings & server endpoint
  await ApiService.init();

  try {
    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    );
  } catch (e) {
    debugPrint('Supabase optional init notice: $e');
  }

  runApp(const CleaningStaffApp());
}

class CleaningStaffApp extends StatelessWidget {
  const CleaningStaffApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'JaniFlow',
      theme: ThemeData(
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          surface: Colors.white,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: AppColors.textPrimary,
          elevation: 0,
          surfaceTintColor: Colors.transparent,
        ),
        useMaterial3: true,
      ),
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  bool _isChecking = true;
  String? _savedUserId;

  @override
  void initState() {
    super.initState();
    _checkSavedSession();
  }

  Future<void> _checkSavedSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('staff_user_id');
      if (mounted) {
        setState(() {
          _savedUserId = userId;
          _isChecking = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isChecking = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isChecking) {
      return Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: AppStyles.subtleShadow,
                ),
                child: const Icon(
                  Icons.cleaning_services_rounded,
                  size: 26,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 20),
              const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  color: AppColors.primary,
                  strokeWidth: 2,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Auto-login if session exists
    if (_savedUserId != null && _savedUserId!.isNotEmpty) {
      return HomeScreen(userId: _savedUserId!);
    }

    return const LoginScreen();
  }
}
