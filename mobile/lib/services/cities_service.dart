import 'dart:convert';
import 'dart:io';

import 'package:conectaparana/core/config/environment.dart';
import 'package:conectaparana/features/cities/data/city_model.dart';
import 'package:http/http.dart' as http;

class CitiesException implements Exception {
  CitiesException(this.message);

  final String message;

  @override
  String toString() => message;
}

class CitiesService {
  const CitiesService();

  Future<List<CityModel>> getCities() async {
    final uri = Uri.parse('${Environment.apiBaseUrl}/cities');

    final http.Response response;

    try {
      response = await http.get(uri).timeout(const Duration(seconds: 15));
    } on SocketException {
      throw CitiesException(
        'Sem conexão com o servidor. Verifique se o backend está rodando.',
      );
    } on HttpException {
      throw CitiesException('Falha na comunicação com o servidor.');
    } on FormatException {
      throw CitiesException('Resposta do servidor em formato inesperado.');
    }

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);

      if (decoded is List) {
        return decoded
            .whereType<Map<String, dynamic>>()
            .map(CityModel.fromJson)
            .toList();
      }

      throw CitiesException('Resposta de cidades em formato inválido.');
    }

    throw CitiesException(
      'Não foi possível buscar as cidades (${response.statusCode}).',
    );
  }
}
