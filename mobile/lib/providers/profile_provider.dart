import 'package:conectaparana/services/auth_service.dart';
import 'package:flutter/material.dart';

class ProfileData{
  const ProfileData({
    required this.name,
    required this.email,
    required this.cityName
  });

  final String name;
  final String email;
  final String cityName;
}

class ProfileProvider extends ChangeNotifier{
  final AuthService _authService = const AuthService();
  bool _isLoading = false;
  bool _hasLoaded = false;
  String? _errorMessage;

  ProfileData _profile = const ProfileData(
    name: 'Usuário Conecta',
    email: 'usuario@exemplo.com', 
    cityName: 'Maringá - PR'
  );

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  ProfileData get profile => _profile;

  Future<void> loadProfile({bool forceRefresh = false}) async{
    if (_isLoading || (_hasLoaded && !forceRefresh)) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try{
      final user = await _authService.getCurrentUser();

      _profile = ProfileData(
        name: _readString(user, ['name', 'fullName'], _profile.name), 
        email: _readString(user, ['email'], _profile.email), 
        cityName: _readCityName(user) ?? _profile.cityName
      );
    } on AuthException catch (e){
      _errorMessage = e.message;
    } catch (_) {
      _errorMessage = 'Não foi possível carregar os dados do perfil.';
    } finally {
      _isLoading = false;
      _hasLoaded = true;
      notifyListeners();
    }
  }

  void resetToFallback() {
    _hasLoaded = false;
    _errorMessage = null;
    _profile = const ProfileData(
      name: 'Usuário Conecta',
      email: 'usuario@exemplo.com',
      cityName: 'Maringá - PR',
    );
    notifyListeners();
  }

  String _readString(
    Map<String, dynamic> json,
    List<String> keys,
    String fallback,
  ) {
    for (final key in keys){
      final value = json[key];

      if (value != null && value.toString().trim().isNotEmpty){
        return value.toString().trim();
      }
    }

    return fallback;
  }

    String? _readCityName(Map<String, dynamic> json){
    final city = json['city'];

    if (city is Map) {
      final name = city['name']?.toString().trim() ?? '';
      final state = city['state']?.toString().trim() ?? '';

      if (name.isNotEmpty && state.isNotEmpty){
        return '$name - $state';
      }

      if (name.isNotEmpty){
        return name;
      }
    }

    if (city is String && city.trim().isNotEmpty){
      return city.trim();
    }

    final cityName = json['cityName'] ?? json['city_name'];

    if (cityName != null && cityName.toString().trim().isNotEmpty){
      return cityName.toString().trim();
    }

    return null;
  }
}