import 'package:conectaparana/features/cities/data/city_model.dart';
import 'package:conectaparana/providers/auth_provider.dart';
import 'package:conectaparana/providers/cities_provider.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _confirmPasswordFieldKey = GlobalKey<FormFieldState<String>>();

  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  CityModel? _selectedCity;

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _hasTriedSubmit = false;

  static const Color _blue = Color(0xFF264CA9);
  static const Color _green = Color(0xFF029144);
  static const Color _teal = Color(0xFF146E77);
  static const Color _gray = Color(0xFF595959);
  static const Color _darkBackground = Color(0xFF121212);
  static const Color _darkCard = Color(0xFF1E1E1E);

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final citiesProvider = context.read<CitiesProvider>();

      await citiesProvider.loadCities();

      if (!mounted) return;

      setState(() {
        _selectedCity = citiesProvider.defaultCity;
      });
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  String? _validateName(String? value) {
    final name = value?.trim() ?? '';

    if (name.isEmpty) {
      return 'Digite seu nome completo.';
    }

    if (name.length < 3) {
      return 'Digite um nome válido.';
    }

    return null;
  }

  String? _validateEmail(String? value) {
    final email = value?.trim() ?? '';

    if (email.isEmpty) {
      return 'Digite seu e-mail.';
    }

    if (!email.contains('@')) {
      return 'Digite um e-mail válido.';
    }

    return null;
  }

  String? _validatePassword(String? value) {
    final password = value ?? '';

    if (password.isEmpty) {
      return 'Digite sua senha.';
    }

    if (password.length < 8) {
      return 'A senha deve ter pelo menos 8 caracteres.';
    }

    return null;
  }

  String? _validateConfirmPassword(String? value) {
    final confirmPassword = value ?? '';

    if (confirmPassword.isEmpty) {
      return 'Confirme sua senha.';
    }

    if (confirmPassword != _passwordController.text) {
      return 'As senhas não coincidem.';
    }

    return null;
  }

  Future<void> _submitRegister() async {
    setState(() {
      _hasTriedSubmit = true;
    });

    if (!_formKey.currentState!.validate()) {
      return;
    }

    final citiesProvider = context.read<CitiesProvider>();
    final selectedCity = _selectedCity ?? citiesProvider.defaultCity;

    if (selectedCity == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Não foi possível carregar a cidade padrão. Verifique se o backend está rodando.',
          ),
        ),
      );
      return;
    }

    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    final authProvider = context.read<AuthProvider>();

    final success = await authProvider.register(
      name: name,
      email: email,
      password: password,
      cityId: selectedCity.id,
    );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Conta criada com sucesso. Faça login para continuar.'),
        ),
      );

      Navigator.pushReplacementNamed(context, '/login');
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          authProvider.errorMessage ?? 'Não foi possível criar a conta.',
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        text,
        style: GoogleFonts.montserrat(
          color: isDark ? Colors.white : _gray,
          fontSize: 14,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _buildTextField({
    Key? fieldKey,
    required TextEditingController controller,
    required String hintText,
    required String? Function(String?) validator,
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
    VoidCallback? onToggleVisibility,
    ValueChanged<String>? onChanged,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final fillColor = isDark ? _darkCard : Colors.white;
    final textColor = isDark ? Colors.white : _gray;
    final hintColor = isDark ? Colors.white54 : Colors.grey;
    final iconColor = isDark ? Colors.white70 : Colors.black87;

    return TextFormField(
      key: fieldKey,
      controller: controller,
      validator: validator,
      onChanged: onChanged,
      autovalidateMode: _hasTriedSubmit
          ? AutovalidateMode.onUserInteraction
          : AutovalidateMode.disabled,
      obscureText: obscureText,
      keyboardType: keyboardType,
      style: GoogleFonts.montserrat(
        color: textColor,
        fontSize: 15,
        fontWeight: FontWeight.w600,
      ),
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: GoogleFonts.montserrat(
          color: hintColor,
          fontWeight: FontWeight.w700,
        ),
        filled: true,
        fillColor: fillColor,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 12,
        ),
        suffixIcon: onToggleVisibility != null
            ? IconButton(
                icon: Icon(
                  obscureText
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                  color: iconColor,
                ),
                onPressed: onToggleVisibility,
              )
            : null,
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: _teal, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: _teal, width: 2),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red, width: 1.5),
        ),
      ),
    );
  }

  Widget _buildDefaultCityField() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final citiesProvider = context.watch<CitiesProvider>();

    final fillColor = isDark ? _darkCard : Colors.white;
    final textColor = isDark ? Colors.white : _gray;

    if (citiesProvider.isLoading) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: fillColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _teal, width: 1.5),
        ),
        child: Row(
          children: [
            const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: _teal,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Carregando cidade...',
              style: GoogleFonts.montserrat(
                color: textColor,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      );
    }

    final city = _selectedCity ?? citiesProvider.defaultCity;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: fillColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _teal, width: 1.5),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.location_city_outlined,
            color: _teal,
            size: 20,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              city?.displayName ?? 'Maringá - PR',
              style: GoogleFonts.montserrat(
                color: textColor,
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Text(
            'Cidade inicial',
            style: GoogleFonts.montserrat(
              color: _teal,
              fontSize: 12,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGradientTitle() {
    return ShaderMask(
      blendMode: BlendMode.srcIn,
      shaderCallback: (bounds) {
        return const LinearGradient(
          begin: Alignment.bottomLeft,
          end: Alignment.topRight,
          colors: [_blue, _green],
        ).createShader(Rect.fromLTWH(0, 0, bounds.width, bounds.height));
      },
      child: Text(
        'Conecta Paraná',
        textAlign: TextAlign.center,
        style: GoogleFonts.montserratAlternates(
          fontSize: 32,
          fontWeight: FontWeight.w900,
          letterSpacing: -0.5,
        ),
      ),
    );
  }

  Widget _buildRegisterButton(bool isLoading) {
    return InkWell(
      onTap: isLoading ? null : _submitRegister,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        width: 190,
        height: 50,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          gradient: const LinearGradient(
            begin: Alignment.bottomLeft,
            end: Alignment.topRight,
            colors: [_blue, _green],
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.25),
              blurRadius: 6,
              offset: const Offset(2, 4),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: isLoading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.white,
                ),
              )
            : Text(
                'Criar conta',
                style: GoogleFonts.montserrat(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                ),
              ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? _darkBackground : Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 36),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 42),

                Image.asset(
                  'assets/images/paranalogo.png',
                  width: 130,
                  fit: BoxFit.contain,
                ),

                const SizedBox(height: 16),

                _buildGradientTitle(),

                const SizedBox(height: 18),

                _buildLabel('Digite seu nome completo:'),

                const SizedBox(height: 6),

                _buildTextField(
                  controller: _nameController,
                  hintText: 'Nome completo',
                  validator: _validateName,
                ),

                const SizedBox(height: 18),

                _buildLabel('Digite seu e-mail:'),

                const SizedBox(height: 6),

                _buildTextField(
                  controller: _emailController,
                  hintText: 'E-mail',
                  validator: _validateEmail,
                  keyboardType: TextInputType.emailAddress,
                ),

                const SizedBox(height: 18),

                _buildLabel('Cidade inicial:'),

                const SizedBox(height: 6),

                _buildDefaultCityField(),

                const SizedBox(height: 18),

                _buildLabel('Digite sua senha:'),

                const SizedBox(height: 6),

                _buildTextField(
                  controller: _passwordController,
                  hintText: 'Senha',
                  validator: _validatePassword,
                  obscureText: _obscurePassword,
                  onChanged: (_) {
                    if (_hasTriedSubmit &&
                        _confirmPasswordController.text.isNotEmpty) {
                      _confirmPasswordFieldKey.currentState?.validate();
                    }
                  },
                  onToggleVisibility: () {
                    setState(() {
                      _obscurePassword = !_obscurePassword;
                    });
                  },
                ),

                const SizedBox(height: 18),

                _buildLabel('Confirme sua senha:'),

                const SizedBox(height: 6),

                _buildTextField(
                  fieldKey: _confirmPasswordFieldKey,
                  controller: _confirmPasswordController,
                  hintText: 'Senha',
                  validator: _validateConfirmPassword,
                  obscureText: _obscureConfirmPassword,
                  onToggleVisibility: () {
                    setState(() {
                      _obscureConfirmPassword = !_obscureConfirmPassword;
                    });
                  },
                ),

                const SizedBox(height: 34),

                _buildRegisterButton(authProvider.isLoading),

                const SizedBox(height: 24),

                Text(
                  'Já possui uma conta?',
                  style: GoogleFonts.montserrat(
                    color: isDark ? Colors.white : _gray,
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),

                TextButton(
                  onPressed: () {
                    Navigator.pushReplacementNamed(context, '/login');
                  },
                  child: Text(
                    'Entrar',
                    style: GoogleFonts.montserrat(
                      color: _teal,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}