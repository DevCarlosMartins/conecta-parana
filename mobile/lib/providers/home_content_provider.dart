import 'package:conectaparana/features/home/data/home_mock_data.dart';
import 'package:conectaparana/services/home_content_service.dart';
import 'package:flutter/foundation.dart';

class HomeContentProvider extends ChangeNotifier {
  final HomeContentService _homeContentService = const HomeContentService();

  bool _isLoading = true;
  bool _hasLoaded = false;
  String? _errorMessage;

  List<HomeEventMock> _events = const [];
  List<HomeNewsMock> _news = const [];
  List<HomeComunicadoMock> _comunicados = const [];

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  List<HomeEventMock> get events => _events;
  List<HomeNewsMock> get news => _news;
  List<HomeComunicadoMock> get comunicados => _comunicados;

  Future<void> loadHomeContent({bool forceRefresh = false}) async {
    if (_isLoading && _hasLoaded && !forceRefresh) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final content = await _homeContentService.getHomeContent();

      _events = content.events;
      _news = content.news;
      _comunicados = content.comunicados;
    } on HomeContentException catch (e) {
      _errorMessage = e.message;
    } catch (_) {
      _errorMessage = 'Não foi possível carregar os dados da Home.';
    } finally {
      _isLoading = false;
      _hasLoaded = true;
      notifyListeners();
    }
  }
}
