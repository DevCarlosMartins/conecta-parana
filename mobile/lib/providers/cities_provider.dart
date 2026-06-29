import 'package:conectaparana/features/cities/data/city_model.dart';
import 'package:conectaparana/services/cities_service.dart';
import 'package:flutter/foundation.dart';

class CitiesProvider extends ChangeNotifier {
  final CitiesService _citiesService = const CitiesService();

  bool _isLoading = false;
  List<CityModel> _cities = const [];
  String? _errorMessage;

  bool get isLoading => _isLoading;
  List<CityModel> get cities => _cities;
  String? get errorMessage => _errorMessage;

  CityModel? get defaultCity {
    if (_cities.isEmpty) return null;

    final maringaIndex = _cities.indexWhere(
      (city) => city.name.toLowerCase() == 'maringá',
    );

    if (maringaIndex >= 0) {
      return _cities[maringaIndex];
    }

    return _cities.first;
  }

  Future<void> loadCities() async {
    if (_isLoading || _cities.isNotEmpty) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _cities = await _citiesService.getCities();
    } on CitiesException catch (e) {
      _errorMessage = e.message;
    } catch (_) {
      _errorMessage = 'Não foi possível carregar as cidades.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
