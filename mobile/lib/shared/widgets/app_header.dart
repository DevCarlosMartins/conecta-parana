import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppHeader extends StatelessWidget {
  const AppHeader({
    super.key,
    this.cityName = 'Maringá',
    this.onCityTap,
    this.onSearchTap,
    this.onNotificationTap,
  });

  final String cityName;
  final VoidCallback? onCityTap;
  final VoidCallback? onSearchTap;
  final VoidCallback? onNotificationTap;

  static const Color _teal = Color(0xFF146E77);
  static const Color _lightBackground = Color(0xFFEDEEFF);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cityBackground = isDark ? const Color(0xFF1E1E1E) : _lightBackground;

    return Row(
      children: [
        Image.asset(
          'assets/images/paranalogo.png',
          width: 42,
          fit: BoxFit.contain,
        ),

        const SizedBox(width: 12),

        InkWell(
          onTap: onCityTap,
          borderRadius: BorderRadius.circular(24),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: cityBackground,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: _teal),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  cityName,
                  style: GoogleFonts.montserrat(
                    color: _teal,
                    fontWeight: FontWeight.w800,
                  ),
                ),

                const SizedBox(width: 6),

                const Icon(Icons.keyboard_arrow_down, color: _teal, size: 20),
              ],
            ),
          ),
        ),

        const Spacer(),

        _HeaderIcon(icon: Icons.search, onTap: onSearchTap),

        const SizedBox(width: 8),

        _HeaderIcon(icon: Icons.notifications_none, onTap: onNotificationTap),
      ],
    );
  }
}

class _HeaderIcon extends StatelessWidget {
  const _HeaderIcon({required this.icon, this.onTap});

  final IconData icon;
  final VoidCallback? onTap;

  static const Color _teal = Color(0xFF146E77);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final background = isDark ? const Color(0xFF1E1E1E) : Colors.white;

    return InkWell(
      onTap: onTap,
      customBorder: const CircleBorder(),
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: background,
          shape: BoxShape.circle,
          border: Border.all(color: _teal),
        ),
        child: Icon(icon, color: _teal, size: 22),
      ),
    );
  }
}
