import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;

class ApiService {
  static String _customBaseUrl = '';

  static void setBaseUrl(String url) {
    _customBaseUrl = url.trim();
  }

  static String get baseUrl {
    if (_customBaseUrl.isNotEmpty) {
      return _customBaseUrl;
    }
    // Android emulator connects to host machine via 10.0.2.2
    if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:3000/api/jobs';
    }
    return 'http://localhost:3000/api/jobs';
  }

  static Future login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'user': data['user']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Login failed'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Connection error: $e'};
    }
  }

  static Future getStaffJobs(String staffId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/staff/$staffId'));
      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'data': data['data'] ?? []};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to load jobs'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Connection error: $e'};
    }
  }

  static Future getQuestions([String? customerId]) async {
    try {
      final uri = customerId != null && customerId.isNotEmpty
          ? Uri.parse('$baseUrl/questions?customerId=$customerId')
          : Uri.parse('$baseUrl/questions');

      final response = await http.get(uri);
      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'data': data['data'] ?? []};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to load questions'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Connection error: $e'};
    }
  }

  static Future submitJob(String jobId, dynamic answers) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/submit'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'jobId': jobId,
          'answers': answers,
        }),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        return {
          'success': true, 
          'message': data['message'] ?? 'Job completed successfully!',
          'emailSent': data['emailSent'] ?? false
        };
      } else {
        return {'success': false, 'error': data['error'] ?? 'Submission failed'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Connection error: $e'};
    }
  }
}