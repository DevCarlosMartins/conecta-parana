import 'package:conectaparana/features/tickets/screens/my_tickets_screen.dart';
import 'package:conectaparana/providers/app_theme_provider.dart';
import 'package:conectaparana/providers/auth_provider.dart';
import 'package:conectaparana/providers/profile_provider.dart';
import 'package:conectaparana/shared/widgets/app_header.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({
    super.key,
    this.cityName = 'Maringá - PR',
    this.onCityTap,
    this.onSearchTap,
    this.onNotificationTap,
  });

  final String cityName;
  final VoidCallback? onCityTap;
  final VoidCallback? onSearchTap;
  final VoidCallback? onNotificationTap;

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  static const Color _teal = Color(0xFF146E77);
  static const Color _green = Color(0xFF029144);
  static const Color _blue = Color(0xFF264CA9);
  static const Color _gray = Color(0xFF5A5A5A);
  static const Color _lightInput = Color(0xFFEDEEFF);
  static const Color _lightPurple = Color(0xFFD8D6F2);
  static const Color _darkBackground = Color(0xFF101010);
  static const Color _darkCard = Color(0xFF1E1E1E);
  static const Color _red = Color(0xFFFF4B4E);
  static const Color _darkRed = Color(0xFF8B1D1E);
  String? _editedName;
  String? _editedEmail;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProfileProvider>().loadProfile();
    });
  }

  void _showSettingsSheet() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet<void>(
      context: context,
      backgroundColor: isDark ? _darkCard : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
      ),
      builder: (bottomSheetContext) {
        return Consumer<AppThemeProvider>(
          builder: (context, appThemeProvider, _) {
            return Padding(
              padding: const EdgeInsets.fromLTRB(24, 18, 24, 28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 42,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white24 : Colors.black26,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                  const SizedBox(height: 22),
                  Row(
                    children: [
                      const Icon(
                        Icons.settings_outlined,
                        color: _teal,
                        size: 24,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'Configurações',
                        style: GoogleFonts.montserrat(
                          color: isDark ? Colors.white : _gray,
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 22),
                  _buildThemeOption(
                    icon: Icons.light_mode_outlined,
                    title: 'Modo claro',
                    subtitle: 'Usar o aplicativo com tema claro.',
                    isDark: isDark,
                    isSelected: appThemeProvider.themeMode == ThemeMode.light,
                    onTap: () {
                      appThemeProvider.setThemeMode(ThemeMode.light);
                      Navigator.pop(bottomSheetContext);
                    },
                  ),
                  const SizedBox(height: 12),
                  _buildThemeOption(
                    icon: Icons.dark_mode_outlined,
                    title: 'Modo escuro',
                    subtitle: 'Usar o aplicativo com tema escuro.',
                    isDark: isDark,
                    isSelected: appThemeProvider.themeMode == ThemeMode.dark,
                    onTap: () {
                      appThemeProvider.setThemeMode(ThemeMode.dark);
                      Navigator.pop(bottomSheetContext);
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _showEditProfileDialog() async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final profile = context.read<ProfileProvider>().profile;

    final formKey = GlobalKey<FormState>();

    final nameController = TextEditingController(
      text: _editedName ?? profile.name,
    );

    final emailController = TextEditingController(
      text: _editedEmail ?? profile.email,
    );

    final editedProfile = await showDialog<ProfileData>(
      context: context,
      barrierDismissible: true,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: isDark ? _darkCard : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(22),
          ),
          titlePadding: const EdgeInsets.fromLTRB(24, 22, 24, 0),
          contentPadding: const EdgeInsets.fromLTRB(24, 18, 24, 8),
          actionsPadding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
          title: Row(
            children: [
              const Icon(Icons.edit_outlined, color: _teal, size: 24),
              const SizedBox(width: 10),
              Text(
                'Editar perfil',
                style: GoogleFonts.montserrat(
                  color: isDark ? Colors.white : _gray,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: SizedBox(
                width: 360,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildEditableField(
                      controller: nameController,
                      label: 'Nome',
                      icon: Icons.person_outline,
                      isDark: isDark,
                      textInputAction: TextInputAction.next,
                      validator: (value) {
                        final name = value?.trim() ?? '';

                        if (name.isEmpty) {
                          return 'Informe seu nome.';
                        }

                        if (name.length < 3) {
                          return 'O nome deve ter pelo menos 3 caracteres.';
                        }

                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    _buildEditableField(
                      controller: emailController,
                      label: 'E-mail',
                      icon: Icons.email_outlined,
                      isDark: isDark,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.done,
                      validator: (value) {
                        final email = value?.trim() ?? '';

                        if (email.isEmpty) {
                          return 'Informe seu e-mail.';
                        }

                        if (!email.contains('@') || !email.contains('.')) {
                          return 'Informe um e-mail válido.';
                        }

                        return null;
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () {
                if (!formKey.currentState!.validate()) return;

                final newName = nameController.text.trim();
                final newEmail = emailController.text.trim();

                Navigator.pop(
                  dialogContext,
                  ProfileData(
                    name: newName,
                    email: newEmail,
                    cityName: profile.cityName,
                  ),
                );
              },
              child: const Text('Confirmar'),
            ),
          ],
        );
      },
    );

    if (!mounted || editedProfile == null) return;

    setState(() {
      _editedName = editedProfile.name;
      _editedEmail = editedProfile.email;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Perfil atualizado com sucesso.')),
    );
  }

  Widget _buildEditableField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required bool isDark,
    required String? Function(String?) validator,
    TextInputType keyboardType = TextInputType.text,
    TextInputAction textInputAction = TextInputAction.done,
  }) {
    return TextFormField(
      controller: controller,
      validator: validator,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      style: GoogleFonts.montserrat(
        color: isDark ? Colors.white : _gray,
        fontSize: 14,
        fontWeight: FontWeight.w800,
      ),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: _teal, size: 20),
        filled: true,
        fillColor: isDark ? const Color(0xFF2A2A2A) : _lightInput,
        labelStyle: GoogleFonts.montserrat(
          color: isDark ? Colors.white70 : _gray,
          fontWeight: FontWeight.w700,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: _teal, width: 1.4),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: _green, width: 1.8),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: _red, width: 1.4),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: _red, width: 1.8),
        ),
      ),
    );
  }

  void _showFavoritesPlaceholder() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Favoritos serão integrados em uma próxima etapa.'),
      ),
    );
  }

  void _openMyTickets() {
    Navigator.push(
      context,
      MaterialPageRoute<void>(builder: (context) => const MyTicketsScreen()),
    );
  }

  Future<void> _handleLogout() async {
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;

        return AlertDialog(
          backgroundColor: isDark ? _darkCard : Colors.white,
          title: Text(
            'Sair da conta?',
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white : _gray,
              fontWeight: FontWeight.w900,
            ),
          ),
          content: Text(
            'Você será redirecionado para a tela de login.',
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white70 : _gray,
              fontWeight: FontWeight.w600,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancelar'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Sair', style: TextStyle(color: _red)),
            ),
          ],
        );
      },
    );

    if (!mounted || shouldLogout != true) return;

    final authProvider = context.read<AuthProvider>();
    final navigator = Navigator.of(context);

    await authProvider.logout();

    if (!mounted) return;
    navigator.pushNamedAndRemoveUntil('/login', (route) => false);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark ? _darkBackground : Colors.white;

    return ColoredBox(
      color: backgroundColor,
      child: SafeArea(
        child: Consumer<ProfileProvider>(
          builder: (context, profileProvider, _) {
            final profile = profileProvider.profile;
            final displayProfile = ProfileData(
              name: _editedName ?? profile.name,
              email: _editedEmail ?? profile.email,
              cityName: profile.cityName,
            );

            final displayCityName = widget.cityName.trim().isNotEmpty
                ? widget.cityName
                : displayProfile.cityName;
            return LayoutBuilder(
              builder: (context, constraints) {
                return RefreshIndicator(
                  onRefresh: () {
                    return profileProvider.loadProfile(forceRefresh: true);
                  },
                  color: _teal,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        minHeight: constraints.maxHeight,
                      ),
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(24, 16, 24, 28),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            AppHeader(
                              cityName: widget.cityName,
                              onCityTap: widget.onCityTap,
                              onSearchTap: widget.onSearchTap,
                              onNotificationTap: widget.onNotificationTap,
                            ),
                            const SizedBox(height: 20),
                            if (profileProvider.isLoading)
                              const LinearProgressIndicator(
                                color: _teal,
                                minHeight: 3,
                              ),
                            if (profileProvider.errorMessage != null)
                              _buildProfileWarning(
                                profileProvider.errorMessage!,
                                isDark,
                              ),
                            const SizedBox(height: 24),
                            _buildAvatar(isDark),
                            const SizedBox(height: 22),
                            _buildInfoFields(
                              displayProfile,
                              displayCityName,
                              isDark,
                            ),
                            const SizedBox(height: 26),
                            _buildOptions(isDark),
                            const SizedBox(height: 28),
                            _buildEditButton(),
                            const SizedBox(height: 14),
                            _buildLogoutButton(),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildProfileWarning(String message, bool isDark) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 14),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : const Color(0xFFFFF7E6),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE0A100)),
      ),
      child: Text(
        '$message Mostrando dados de exemplo.',
        style: GoogleFonts.montserrat(
          color: isDark ? Colors.white70 : _gray,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _buildAvatar(bool isDark) {
    return Column(
      children: [
        Container(
          width: 108,
          height: 108,
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(colors: [_blue, _green]),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.32 : 0.18),
                blurRadius: 10,
                offset: const Offset(2, 5),
              ),
            ],
          ),
          child: Container(
            decoration: BoxDecoration(
              color: isDark ? _darkCard : _lightInput,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.person, color: _teal, size: 54),
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'Perfil do usuário',
          style: GoogleFonts.montserrat(
            color: isDark ? Colors.white : _gray,
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }

  Widget _buildInfoFields(
    ProfileData profile,
    String displayCityName,
    bool isDark,
  ) {
    return Column(
      children: [
        _buildReadOnlyField(
          label: 'Nome:',
          value: profile.name,
          icon: Icons.person_outline,
          isDark: isDark,
        ),
        const SizedBox(height: 16),
        _buildReadOnlyField(
          label: 'E-mail:',
          value: profile.email,
          icon: Icons.email_outlined,
          isDark: isDark,
        ),
        const SizedBox(height: 16),
        _buildReadOnlyField(
          label: 'Cidade atual:',
          value: displayCityName,
          icon: Icons.location_city_outlined,
          isDark: isDark,
        ),
      ],
    );
  }

  Widget _buildReadOnlyField({
    required String label,
    required String value,
    required IconData icon,
    required bool isDark,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Align(
          alignment: Alignment.centerLeft,
          child: Text(
            label,
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white : _gray,
              fontSize: 14,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        const SizedBox(height: 6),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          decoration: BoxDecoration(
            color: isDark ? _darkCard : _lightInput,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _teal, width: 1.4),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.18 : 0.08),
                blurRadius: 6,
                offset: const Offset(2, 3),
              ),
            ],
          ),
          child: Row(
            children: [
              Icon(icon, color: _teal, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.montserrat(
                    color: isDark ? Colors.white : _gray,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildOptions(bool isDark) {
    return Column(
      children: [
        _buildOptionCard(
          isDark: isDark,
          icon: Icons.favorite_border_outlined,
          title: 'Favoritos',
          subtitle: 'Eventos e locais salvos',
          onTap: _showFavoritesPlaceholder,
        ),
        const SizedBox(height: 12),
        _buildOptionCard(
          isDark: isDark,
          icon: Icons.confirmation_number_outlined,
          title: 'Meus ingressos',
          subtitle: 'Ingressos digitais comprados',
          onTap: _openMyTickets,
        ),
        const SizedBox(height: 12),
        _buildOptionCard(
          isDark: isDark,
          icon: Icons.settings_outlined,
          title: 'Configurações',
          subtitle: 'Tema, aparência e preferências',
          onTap: _showSettingsSheet,
        ),
      ],
    );
  }

  Widget _buildOptionCard({
    required bool isDark,
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(
          color: isDark ? _darkCard : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _teal.withValues(alpha: 0.45)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.20 : 0.08),
              blurRadius: 7,
              offset: const Offset(2, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF2A2A2A) : _lightPurple,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: _teal, size: 21),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.montserrat(
                      color: isDark ? Colors.white : _gray,
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: GoogleFonts.montserrat(
                      color: isDark ? Colors.white70 : _gray,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: _teal, size: 22),
          ],
        ),
      ),
    );
  }

  Widget _buildEditButton() {
    return InkWell(
      onTap: _showEditProfileDialog,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        width: 190,
        height: 48,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [_blue, _green]),
          borderRadius: BorderRadius.circular(999),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.20),
              blurRadius: 7,
              offset: const Offset(2, 4),
            ),
          ],
        ),
        child: Text(
          'Editar perfil',
          style: GoogleFonts.montserrat(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }

  Widget _buildLogoutButton() {
    return InkWell(
      onTap: _handleLogout,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        width: 190,
        height: 48,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [_red, _darkRed]),
          borderRadius: BorderRadius.circular(999),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.20),
              blurRadius: 7,
              offset: const Offset(2, 4),
            ),
          ],
        ),
        child: Text(
          'Sair',
          style: GoogleFonts.montserrat(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }

  Widget _buildThemeOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isDark,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF2A2A2A) : _lightInput,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? _green : _teal.withValues(alpha: 0.55),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: _teal, size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.montserrat(
                      color: isDark ? Colors.white : _gray,
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: GoogleFonts.montserrat(
                      color: isDark ? Colors.white70 : _gray,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle, color: _green, size: 22),
          ],
        ),
      ),
    );
  }
}
