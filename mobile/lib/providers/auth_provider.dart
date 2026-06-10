import 'package:flutter/foundation.dart';
import 'package:conectaparana/services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = const AuthService();

  bool _isLoading = false;
  bool _isAuthenticated = false;
  bool _isGuest = false;

  String? _errorMessage;
  String? _successMessage;

  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  bool get isGuest => _isGuest;
  bool get canAccessApp => _isAuthenticated || _isGuest;

  String? get errorMessage => _errorMessage;
  String? get successMessage => _successMessage;

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void clearMessages() {
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
  }) async {
    if (_isLoading) return false;

    _setLoading(true);
    clearMessages();

    try {
      await _authService.register(name: name, email: email, password: password);

      _successMessage = 'Conta criada com sucesso. Faça login para continuar.';
      return true;
    } on AuthException catch (e) {
      _errorMessage = e.message;
      return false;
    } catch (_) {
      _errorMessage = 'Não foi possível criar a conta.';
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> login({required String email, required String password}) async {
    if (_isLoading) return false;

    _setLoading(true);
    clearMessages();

    try {
      await _authService.login(email: email, password: password);

      _isAuthenticated = true;
      _isGuest = false;
      return true;
    } on AuthException catch (e) {
      _errorMessage = e.message;
      return false;
    } catch (_) {
      _errorMessage = 'E-mail ou senha inválidos.';
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _isAuthenticated = false;
    _isGuest = false;
    clearMessages();
  }

  void enterAsGuest() {
    _isGuest = true;
    _isAuthenticated = false;
    clearMessages();
    notifyListeners();
  }

  Future<void> checkAuthentication() async {
    final hasToken = await _authService.hasToken();

    _isAuthenticated = hasToken;

    if (hasToken) {
      _isGuest = false;
    }

    notifyListeners();
  }
}
