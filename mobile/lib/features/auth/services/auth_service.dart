import 'dart:convert';
import 'dart:io';

import 'package:conectaparana/core/config/environment.dart';
import 'package:http/http.dart' as http;

class AuthException implements Exception {
  AuthException(this.message);

  final String message;

  @override
  String toString() => message;
}

class AuthService {
  const AuthService();

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final uri = Uri.parse('${Environment.apiBaseUrl}/auth/register');

    final http.Response response;
    try {
      response = await http
          .post(
            uri,
            headers: const {'Content-Type': 'application/json'},
            body: jsonEncode({
              'name': name,
              'email': email,
              'password': password,
            }),
          )
          .timeout(const Duration(seconds: 15));
    } on SocketException {
      throw AuthException(
        'Sem conexão com o servidor. Verifique se o backend está rodando '
        'e se a URL da API está correta.',
      );
    } on HttpException {
      throw AuthException('Falha na comunicação com o servidor.');
    } on FormatException {
      throw AuthException('Resposta do servidor em formato inesperado.');
    }

    if (response.statusCode == 201) {
      return _decodeBody(response.body);
    }

    if (response.statusCode == 409) {
      throw AuthException('Este e-mail já está cadastrado.');
    }

    if (response.statusCode >= 400 && response.statusCode < 500) {
      throw AuthException(
        _extractMessage(response.body) ??
            'Dados inválidos. Verifique os campos e tente novamente.',
      );
    }

    throw AuthException(
      'Erro no servidor (${response.statusCode}). Tente novamente em instantes.',
    );
  }

  Map<String, dynamic> _decodeBody(String body) {
    final decoded = jsonDecode(body);
    return decoded is Map<String, dynamic> ? decoded : <String, dynamic>{};
  }

  String? _extractMessage(String body) {
    try {
      final decoded = jsonDecode(body);
      if (decoded is Map && decoded['message'] != null) {
        final message = decoded['message'];
        if (message is String) return message;
        if (message is List) {
          return message.whereType<String>().join(', ');
        }
      }
    } catch (_) {
      return null;
    }
    return null;
  }
}
