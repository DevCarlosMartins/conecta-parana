import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:conectaparana/providers/auth_provider.dart';
import 'package:provider/provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;

  static const Color _blue = Color(0xFF264CA9);
  static const Color _green = Color(0xFF029144);
  static const Color _teal = Color(0xFF146E77);
  static const Color _gray = Color(0xFF595959);

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submitLogin() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final email = _emailController.text.trim();
    final password = _passwordController.text;

    final authProvider = context.read<AuthProvider>();

    final success = await authProvider.login(email: email, password: password);

    if (!mounted) return;

    if (success) {
      Navigator.pushReplacementNamed(context, '/home');
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          authProvider.errorMessage ?? 'Não foi possível realizar o login.',
        ),
      ),
    );
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

  Widget _buildLabel(String text) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        text,
        style: GoogleFonts.montserrat(
          color: _gray,
          fontSize: 16,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hintText,
    required String? Function(String?) validator,
    bool isPassword = false,
  }) {
    return TextFormField(
      controller: controller,
      validator: validator,
      obscureText: isPassword ? _obscurePassword : false,
      keyboardType: isPassword
          ? TextInputType.text
          : TextInputType.emailAddress,
      style: GoogleFonts.montserrat(
        color: _gray,
        fontSize: 16,
        fontWeight: FontWeight.w600,
      ),
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: GoogleFonts.montserrat(
          color: Colors.grey,
          fontWeight: FontWeight.w700,
        ),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        suffixIcon: isPassword
            ? IconButton(
                icon: Icon(
                  _obscurePassword
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                  color: Colors.black87,
                ),
                onPressed: () {
                  setState(() {
                    _obscurePassword = !_obscurePassword;
                  });
                },
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
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red, width: 2),
        ),
      ),
    );
  }

  Widget _buildLoginButton(bool isLoading) {
    return InkWell(
      onTap: isLoading ? null : _submitLogin,
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
                'Entrar',
                style: GoogleFonts.montserrat(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                ),
              ),
      ),
    );
  }

  Widget _buildOutlinedWelcomeText() {
    return Stack(
      alignment: Alignment.center,
      children: [
        Text(
          'Bem-vindo ao',
          style: GoogleFonts.montserrat(
            fontSize: 22,
            fontWeight: FontWeight.w900,
            foreground: Paint()
              ..style = PaintingStyle.stroke
              ..strokeWidth = 2.5
              ..color = _teal,
          ),
        ),

        Text(
          'Bem-vindo ao',
          style: GoogleFonts.montserrat(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
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

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 48),

                Image.asset(
                  'assets/images/paranalogo.png',
                  width: 130,
                  fit: BoxFit.contain,
                ),

                const SizedBox(height: 32),

                _buildOutlinedWelcomeText(),

                _buildGradientTitle(),

                const SizedBox(height: 40),

                _buildLabel('Digite seu e-mail:'),

                const SizedBox(height: 6),

                _buildTextField(
                  controller: _emailController,
                  hintText: 'E-mail',
                  validator: _validateEmail,
                ),

                const SizedBox(height: 24),

                _buildLabel('Digite sua senha:'),

                const SizedBox(height: 6),

                _buildTextField(
                  controller: _passwordController,
                  hintText: 'Senha',
                  validator: _validatePassword,
                  isPassword: true,
                ),

                const SizedBox(height: 8),

                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            'Recuperação de senha ainda não implementada.',
                          ),
                        ),
                      );
                    },
                    child: Text(
                      'Esqueceu a senha?',
                      style: GoogleFonts.montserrat(
                        color: _teal,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                _buildLoginButton(authProvider.isLoading),

                const SizedBox(height: 48),

                Text(
                  'Não possui uma conta?',
                  style: GoogleFonts.montserrat(
                    color: _gray,
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                  ),
                ),

                TextButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/register');
                  },
                  child: Text(
                    'Criar conta',
                    style: GoogleFonts.montserrat(
                      color: _teal,
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),

                TextButton(
                  onPressed: () {
                    Navigator.pushReplacementNamed(context, '/home');
                  },
                  child: Text(
                    'Entrar sem conta',
                    style: GoogleFonts.montserrat(
                      color: _teal,
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
