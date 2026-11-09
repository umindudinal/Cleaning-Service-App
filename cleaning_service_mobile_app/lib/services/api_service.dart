import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static String _customBaseUrl = '';

  static Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedUrl = prefs.getString('custom_server_base_url');
      if (savedUrl != null && savedUrl.trim().isNotEmpty) {
        _customBaseUrl = savedUrl.trim();
      }
    } catch (_) {}
  }

  static Future<void> setBaseUrl(String url) async {
    _customBaseUrl = url.trim();
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_customBaseUrl.isEmpty) {
        await prefs.remove('custom_server_base_url');
      } else {
        await prefs.setString('custom_server_base_url', _customBaseUrl);
      }
    } catch (_) {}
  }

  static String get defaultBaseUrl {
    // Android emulator connects to host machine via 10.0.2.2
    if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:3000/api/jobs';
    }
    return 'http://localhost:3000/api/jobs';
  }

  static String get baseUrl {
    if (_customBaseUrl.isNotEmpty) {
      return _customBaseUrl;
    }
    return defaultBaseUrl;
  }

  // Connection probe with friendly error message
  static Future<Map<String, dynamic>> testConnection([String? testUrl]) async {
    final target = (testUrl != null && testUrl.trim().isNotEmpty) ? testUrl.trim() : baseUrl;
    try {
      final uri = Uri.parse(target);
      final response = await http.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode >= 200 && response.statusCode < 500) {
        return {
          'success': true,
          'message': 'Connected successfully! (Server status: ${response.statusCode})',
        };
      }
      return {
        'success': false,
        'message': 'Server returned unexpected status: ${response.statusCode}',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Unable to connect to server. Ensure backend is running and IP is correct.',
      };
    }
  }

  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      ).timeout(const Duration(seconds: 8));

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'user': data['user']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Login failed. Please verify credentials.'};
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Connection failed. Please check your network and server URL settings.',
      };
    }
  }

  static Future<Map<String, dynamic>> getStaffJobs(String staffId) async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/staff/$staffId'))
          .timeout(const Duration(seconds: 8));
      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'data': data['data'] ?? []};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to load assigned jobs'};
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Connection error. Pull to refresh when network is restored.',
      };
    }
  }

  static Future<Map<String, dynamic>> getQuestions([String? customerId]) async {
    try {
      final uri = customerId != null && customerId.isNotEmpty
          ? Uri.parse('$baseUrl/questions?customerId=$customerId')
          : Uri.parse('$baseUrl/questions');

      final response = await http.get(uri).timeout(const Duration(seconds: 8));
      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'data': data['data'] ?? []};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to load checklist items'};
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Connection error. Unable to load checklist.',
      };
    }
  }

  static Future<Map<String, dynamic>> submitJob(String jobId, dynamic answers) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/submit'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'jobId': jobId,
          'answers': answers,
        }),
      ).timeout(const Duration(seconds: 30)); // 30s for photo upload and PDF generation

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        return {
          'success': true,
          'message': data['message'] ?? 'Job completed successfully!',
          'emailSent': data['emailSent'] ?? false,
          'pdfUrl': data['pdfUrl'],
        };
      } else {
        return {'success': false, 'error': data['error'] ?? 'Submission failed. Please try again.'};
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Connection timed out while uploading inspection proofs. Please retry.',
      };
    }
  }
}
