import 'dart:convert';

import 'package:conectaparana/features/news/data/news_mock_data.dart';
import 'package:http/http.dart' as http;

class NewsService {
  NewsService({http.Client? client, String? baseUrl, bool useMockData = true})
    : _client = client ?? http.Client(),
      _baseUrl =
          baseUrl ??
          const String.fromEnvironment(
            'API_BASE_URL',
            defaultValue: 'http://localhost:3000',
          ),
      _useMockData = useMockData;

  static const String newsPath = '/news';
  static const String cityIdQueryParameter = 'cityId';

  final http.Client _client;
  final String _baseUrl;
  final bool _useMockData;

  Future<List<NewsMock>> getNews() {
    return _getNews();
  }

  Future<List<NewsMock>> getNewsByCityId(String cityId) {
    return _getNews(cityId: cityId.trim());
  }

  Future<List<NewsMock>> _getNews({String? cityId}) async {
    if (_useMockData) {
      return newsMock;
    }

    final response = await _client.get(_buildNewsUri(cityId: cityId));

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Erro ao carregar notícias.');
    }

    final decodedBody = jsonDecode(response.body);

    return _parseNewsList(decodedBody);
  }

  Uri _buildNewsUri({String? cityId}) {
    final baseUri = Uri.parse(_baseUrl);
    final basePath = baseUri.path.endsWith('/')
        ? baseUri.path.substring(0, baseUri.path.length - 1)
        : baseUri.path;
    final endpointPath = newsPath.startsWith('/')
        ? newsPath.substring(1)
        : newsPath;

    final queryParameters = <String, String>{};

    if (cityId != null && cityId.isNotEmpty) {
      queryParameters[cityIdQueryParameter] = cityId;
    }

    return baseUri.replace(
      path: '$basePath/$endpointPath',
      queryParameters: queryParameters.isEmpty ? null : queryParameters,
    );
  }

  List<NewsMock> _parseNewsList(dynamic decodedBody) {
    if (decodedBody is List) {
      return decodedBody
          .whereType<Map<String, dynamic>>()
          .map(NewsMock.fromJson)
          .toList();
    }

    if (decodedBody is Map<String, dynamic>) {
      final data = decodedBody['data'];

      if (data is List) {
        return data
            .whereType<Map<String, dynamic>>()
            .map(NewsMock.fromJson)
            .toList();
      }

      final items = decodedBody['items'];

      if (items is List) {
        return items
            .whereType<Map<String, dynamic>>()
            .map(NewsMock.fromJson)
            .toList();
      }
    }

    return [];
  }
}
