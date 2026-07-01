import 'dart:convert';
import 'dart:io';

import 'package:conectaparana/core/config/environment.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

class AuthException implements Exception {
  AuthException(this.message);

  final String message;

  @override
  String toString() => message;
}

class AuthService {
  const AuthService();

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';

  Future<void> register({
    required String name,
    required String email,
    required String password,
    required int cityId,
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
              'cityId': cityId,
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
      return;
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

  Future<void> login({required String email, required String password}) async {
    final uri = Uri.parse('${Environment.apiBaseUrl}/auth/login');

    final http.Response response;

    try {
      response = await http
          .post(
            uri,
            headers: const {'Content-Type': 'application/json'},
            body: jsonEncode({'email': email, 'password': password}),
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

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = _decodeBody(response.body);

      final accessToken = data['access_token'];
      final refreshToken = data['refresh_token'];

      if (accessToken is! String || refreshToken is! String) {
        throw AuthException('Resposta de login inválida.');
      }

      await _storage.write(key: _accessTokenKey, value: accessToken);
      await _storage.write(key: _refreshTokenKey, value: refreshToken);

      return;
    }

    if (response.statusCode == 401) {
      throw AuthException('E-mail ou senha inválidos.');
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

  Future<void> logout() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
  }

  Future<void> refresh() async {
    final refreshToken = await _storage.read(key: _refreshTokenKey);

    if (refreshToken == null || refreshToken.isEmpty) {
      throw AuthException('Sessão expirada. Faça login novamente.');
    }

    final uri = Uri.parse('${Environment.apiBaseUrl}/auth/refresh');

    final response = await http
        .post(
          uri,
          headers: const {'Content-Type': 'application/json'},
          body: jsonEncode({'refresh_token': refreshToken}),
        )
        .timeout(const Duration(seconds: 15));

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = _decodeBody(response.body);

      final accessToken = data['access_token'];
      final refreshToken = data['refresh_token'];

      if (accessToken is! String || refreshToken is! String) {
        throw AuthException('Resposta de refresh inválida.');
      }

      await _storage.write(key: _accessTokenKey, value: accessToken);
      await _storage.write(key: _refreshTokenKey, value: refreshToken);

      return;
    }

    throw AuthException('Sessão expirada. Faça login novamente.');
  }

  Future<Map<String, dynamic>> getCurrentUser() async {
    final accessToken = await getAccessToken();

    if (accessToken == null || accessToken.isEmpty) {
      throw AuthException('Usuário não autenticado.');
    }

    final uri = Uri.parse('${Environment.apiBaseUrl}/auth/me');

    final response = await http
        .get(
          uri,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $accessToken',
          },
        )
        .timeout(const Duration(seconds: 15));

    if (response.statusCode == 200) {
      return _decodeBody(response.body);
    }

    if (response.statusCode == 401) {
      throw AuthException('Sessão expirada. Faça login novamente.');
    }

    throw AuthException('Não foi possível buscar os dados do usuário.');
  }

  Future<String?> getAccessToken() async {
    return _storage.read(key: _accessTokenKey);
  }

  Future<bool> hasToken() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  Map<String, dynamic> _decodeBody(String body) {
    if (body.isEmpty) return <String, dynamic>{};

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
