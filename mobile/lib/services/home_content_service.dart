import 'dart:convert';

import 'package:conectaparana/core/config/environment.dart';
import 'package:conectaparana/features/home/data/home_mock_data.dart';
import 'package:http/http.dart' as http;

class HomeContentException implements Exception {
  HomeContentException(this.message);

  final String message;

  @override
  String toString() => message;
}

class HomeContentData {
  const HomeContentData({
    required this.events,
    required this.news,
    required this.comunicados,
  });

  final List<HomeEventMock> events;
  final List<HomeNewsMock> news;
  final List<HomeComunicadoMock> comunicados;
}

class HomeContentService {
  const HomeContentService();

  Future<HomeContentData> getHomeContent() async {
    try {
      final results = await Future.wait([
        _getList('/events?status=ativo'),
        _getList('/news?isActive=true'),
        _getList('/comunicados?isActive=true'),
      ]);

      return HomeContentData(
        events: _parseEvents(results[0]),
        news: _parseNews(results[1]),
        comunicados: _parseComunicados(results[2]),
      );
    } catch (_) {
      throw HomeContentException(
        'Não foi possível carregar os dados atualizados da Home.',
      );
    }
  }

  Future<List<dynamic>> _getList(String path) async {
    final uri = Uri.parse('${Environment.apiBaseUrl}$path');

    final response = await http.get(uri).timeout(const Duration(seconds: 15));

    if (response.statusCode != 200) {
      throw HomeContentException(
        'Erro ao buscar dados da Home (${response.statusCode}).',
      );
    }

    final decoded = jsonDecode(response.body);

    if (decoded is List) {
      return decoded;
    }

    if (decoded is Map<String, dynamic>) {
      final data = decoded['data'] ?? decoded['items'];

      if (data is List) {
        return data;
      }
    }

    return const [];
  }

  List<HomeEventMock> _parseEvents(List<dynamic> rawEvents) {
    const images = [
      'assets/images/festival_nipo.png',
      'assets/images/expoinga.png',
      'assets/images/maringa_coffee_festival.png',
    ];

    final events = <HomeEventMock>[];

    for (var index = 0; index < rawEvents.length; index++) {
      final item = rawEvents[index];

      if (item is! Map) continue;

      final json = Map<String, dynamic>.from(item);
      final local = json['local'];

      String location = 'Local a definir';

      if (local is Map && local['name'] != null) {
        location = local['name'].toString();
      } else if (json['description'] != null) {
        location = json['description'].toString();
      }

      events.add(
        HomeEventMock(
          title: _readString(json, ['title', 'name'], 'Evento sem título'),
          imagePath: images[index % images.length],
          location: location,
        ),
      );
    }

    return events;
  }

  List<HomeNewsMock> _parseNews(List<dynamic> rawNews) {
    const images = [
      'assets/images/mascotes_guarda_municipal.png',
      'assets/images/parana_junino.png',
      'assets/images/campeao_multas.png',
    ];

    final news = <HomeNewsMock>[];

    for (var index = 0; index < rawNews.length; index++) {
      final item = rawNews[index];

      if (item is! Map) continue;

      final json = Map<String, dynamic>.from(item);

      news.add(
        HomeNewsMock(
          title: _readString(json, ['title', 'name'], 'Notícia sem título'),
          imagePath: images[index % images.length],
          description: _readString(json, [
            'description',
            'content',
            'summary',
          ], 'Descrição indisponível.'),
        ),
      );
    }

    return news;
  }

  List<HomeComunicadoMock> _parseComunicados(List<dynamic> rawComunicados) {
    final comunicados = <HomeComunicadoMock>[];

    for (final item in rawComunicados) {
      if (item is! Map) continue;

      final json = Map<String, dynamic>.from(item);

      comunicados.add(
        HomeComunicadoMock(
          title: _readString(json, ['title', 'name'], 'Comunicado importante'),
          description: _readString(json, [
            'description',
            'content',
            'summary',
          ], 'Descrição indisponível.'),
        ),
      );
    }

    return comunicados;
  }

  String _readString(
    Map<String, dynamic> json,
    List<String> keys,
    String fallback,
  ) {
    for (final key in keys) {
      final value = json[key];

      if (value != null && value.toString().trim().isNotEmpty) {
        return value.toString().trim();
      }
    }

    return fallback;
  }
}
