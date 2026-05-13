import 'package:conectaparana/features/auth/services/auth_service.dart';
import 'package:flutter/material.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _confirmEmailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String? _selectedCity;
  String? _cityErrorText;

  bool _isSubmitting = false;
  final _authService = const AuthService();

  final List<String> _cities = const [
    'Maringá',
    'Sarandi',
    'Paiçandu',
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _confirmEmailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  String? _validateName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Informe seu nome completo';
    }

    final parts = value.trim().split(RegExp(r'\s+'));
    if (parts.length < 2) {
      return 'Digite nome e sobrenome';
    }

    return null;
  }

  String? _validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Informe seu e-mail';
    }

    final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
    if (!emailRegex.hasMatch(value.trim())) {
      return 'Informe um e-mail válido';
    }

    return null;
  }

  String? _validateConfirmEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Confirme seu e-mail';
    }

    if (value.trim() != _emailController.text.trim()) {
      return 'Os e-mails não coincidem';
    }

    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Informe sua senha';
    }

    if (value.length < 6) {
      return 'A senha deve ter ao menos 6 caracteres';
    }

    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Confirme sua senha';
    }

    if (value != _passwordController.text) {
      return 'As senhas não coincidem';
    }

    return null;
  }

  void _showCityPicker() {
    String? tempSelectedCity = _selectedCity;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.48,
              decoration: const BoxDecoration(
                color: Color.fromARGB(255, 245, 245, 245),
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 10),
                  Container(
                    width: 44,
                    height: 5,
                    decoration: BoxDecoration(
                      color: const Color.fromARGB(66, 0, 0, 0),
                      borderRadius: BorderRadius.circular(99),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Escolha sua cidade',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Color.fromARGB(255, 31, 31, 31),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Divider(height: 1),
                  Expanded(
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      itemCount: _cities.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (context, index) {
                        final city = _cities[index];
                        final isSelected = city == tempSelectedCity;

                        return InkWell(
                          onTap: () {
                            setModalState(() {
                              tempSelectedCity = city;
                            });

                            setState(() {
                              _selectedCity = city;
                              _cityErrorText = null;
                            });

                            Navigator.of(context).pop();
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 18,
                              vertical: 14,
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 22,
                                  height: 22,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: isSelected
                                          ? const Color.fromARGB(255, 99, 200, 247)
                                          : const Color.fromARGB(255, 224, 224, 224),
                                      width: 2,
                                    ),
                                  ),
                                  child: Center(
                                    child: Container(
                                      width: 10,
                                      height: 10,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: isSelected
                                            ? const Color.fromARGB(255, 99, 213, 247)
                                            : const Color.fromARGB(0, 0, 0, 0),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    city,
                                    style: const TextStyle(
                                      fontSize: 18,
                                      color: Color.fromARGB(255, 31, 31, 31),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _submit() async {
    final formIsValid = _formKey.currentState?.validate() ?? false;

    setState(() {
      _cityErrorText =
          _selectedCity == null ? 'Selecione uma cidade' : null;
    });

    if (!formIsValid || _selectedCity == null || _isSubmitting) {
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await _authService.register(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );

      if (!mounted) return;

      await showDialog<void>(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: const Text('Conta criada'),
            content: Text(
              'Cadastro realizado com sucesso!\n\n'
              'Nome: ${_nameController.text.trim()}\n'
              'Cidade: $_selectedCity\n'
              'E-mail: ${_emailController.text.trim()}',
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  _clearForm();
                },
                child: const Text('OK'),
              ),
            ],
          );
        },
      );
    } on AuthException catch (e) {
      if (!mounted) return;
      _showErrorSnack(e.message);
    } catch (_) {
      if (!mounted) return;
      _showErrorSnack(
        'Não foi possível conectar ao servidor. Verifique sua internet e se o backend está rodando.',
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  void _showErrorSnack(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: const Color.fromARGB(255, 200, 50, 50),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 4),
      ),
    );
  }

  void _clearForm() {
    _nameController.clear();
    _emailController.clear();
    _confirmEmailController.clear();
    _passwordController.clear();
    _confirmPasswordController.clear();

    setState(() {
      _selectedCity = null;
      _cityErrorText = null;
    });
  }

  InputDecoration _inputDecoration(String hintText) {
    return InputDecoration(
      hintText: hintText,
      hintStyle: const TextStyle(
        color: Color.fromARGB(255, 109, 109, 109),
        fontSize: 16,
      ),
      isDense: true,
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 14,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: Color.fromARGB(255, 174, 174, 174),
          width: 1.2,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: Color.fromARGB(255, 13, 46, 74),
          width: 1.4,
        ),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: Color.fromARGB(255, 244, 67, 54),
          width: 1.2,
        ),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: Color.fromARGB(255, 244, 67, 54),
          width: 1.4,
        ),
      ),
    );
  }

  Widget _buildLogo() {
    return Image.asset(
      'assets/images/parana_logo.png',
      height: 86,
      fit: BoxFit.contain,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          width: 92,
          height: 92,
          decoration: const BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.map_outlined,
            color: Color.fromARGB(255, 13, 46, 74),
            size: 46,
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 75, 75, 75),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 340),
              child: Container(
                padding: const EdgeInsets.fromLTRB(18, 18, 18, 22),
                decoration: BoxDecoration(
                  color: const Color.fromARGB(255, 241, 241, 241),
                  borderRadius: BorderRadius.circular(22),
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Center(child: _buildLogo()),
                      const SizedBox(height: 18),

                      const _FieldLabel('Digite seu nome completo:'),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _nameController,
                        decoration: _inputDecoration('Nome completo'),
                        textCapitalization: TextCapitalization.words,
                        validator: _validateName,
                      ),

                      const SizedBox(height: 12),

                      const _FieldLabel('Escolha sua cidade:'),
                      const SizedBox(height: 6),
                      InkWell(
                        borderRadius: BorderRadius.circular(14),
                        onTap: _showCityPicker,
                        child: Ink(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 14,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: _cityErrorText != null
                                  ? const Color.fromARGB(255, 244, 67, 54)
                                  : const Color.fromARGB(255, 174, 174, 174),
                              width: 1.2,
                            ),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  _selectedCity ?? 'Cidade',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: _selectedCity == null
                                        ? const Color.fromARGB(255, 109, 109, 109)
                                        : const Color.fromARGB(255, 31, 31, 31),
                                  ),
                                ),
                              ),
                              const Icon(
                                Icons.arrow_drop_down_rounded,
                                size: 28,
                                color: Color.fromARGB(255, 111, 111, 111),
                              ),
                            ],
                          ),
                        ),
                      ),
                      if (_cityErrorText != null) ...[
                        const SizedBox(height: 6),
                        Text(
                          _cityErrorText!,
                          style: const TextStyle(
                            color: Color.fromARGB(255, 244, 67, 54),
                            fontSize: 12,
                          ),
                        ),
                      ],

                      const SizedBox(height: 12),

                      const _FieldLabel('Digite seu e-mail:'),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _emailController,
                        decoration: _inputDecoration('E-mail'),
                        keyboardType: TextInputType.emailAddress,
                        validator: _validateEmail,
                      ),

                      const SizedBox(height: 12),

                      const _FieldLabel('Confirme seu e-mail:'),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _confirmEmailController,
                        decoration: _inputDecoration('E-mail'),
                        keyboardType: TextInputType.emailAddress,
                        validator: _validateConfirmEmail,
                      ),

                      const SizedBox(height: 12),

                      const _FieldLabel('Digite sua senha:'),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _passwordController,
                        decoration: _inputDecoration('Senha'),
                        obscureText: true,
                        validator: _validatePassword,
                      ),

                      const SizedBox(height: 12),

                      const _FieldLabel('Confirme sua senha:'),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _confirmPasswordController,
                        decoration: _inputDecoration('Senha'),
                        obscureText: true,
                        validator: _validateConfirmPassword,
                      ),

                      const SizedBox(height: 26),

                      Center(
                        child: SizedBox(
                          width: 160,
                          height: 44,
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(999),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color.fromARGB(80, 0, 0, 0),
                                  blurRadius: 8,
                                  offset: Offset(2, 4),
                                ),
                              ],
                            ),
                            child: FilledButton(
                              onPressed: _isSubmitting ? null : _submit,
                              style: FilledButton.styleFrom(
                                backgroundColor: const Color.fromARGB(255, 13, 46, 74),
                                foregroundColor: Colors.white,
                                disabledBackgroundColor:
                                    const Color.fromARGB(150, 13, 46, 74),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(999),
                                ),
                              ),
                              child: _isSubmitting
                                  ? const SizedBox(
                                      width: 22,
                                      height: 22,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2.4,
                                        valueColor: AlwaysStoppedAnimation(
                                          Colors.white,
                                        ),
                                      ),
                                    )
                                  : const Text(
                                      'Criar conta',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: Color.fromARGB(255, 31, 31, 31),
      ),
    );
  }
}
