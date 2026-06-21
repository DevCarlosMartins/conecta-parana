import 'package:conectaparana/features/map/data/map_mock_data.dart';
import 'package:conectaparana/shared/widgets/app_header.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({
    super.key,
    required this.cityName,
    required this.cityAvailable,
    required this.onCityTap,
    required this.onSearchTap,
    required this.onNotificationTap,
  });

  final String cityName;
  final bool cityAvailable;
  final VoidCallback onCityTap;
  final VoidCallback onSearchTap;
  final VoidCallback onNotificationTap;

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  bool _isLoading = true;

  static const Color _blue = Color(0xFF264CA9);
  static const Color _green = Color(0xFF029144);
  static const Color _teal = Color(0xFF146E77);
  static const Color _gray = Color(0xFF444444);
  static const Color _lightBackground = Color(0xFFEDEEFF);
  static const Color _darkBackground = Color(0xFF121212);
  static const Color _darkCard = Color(0xFF1E1E1E);

  @override
  void initState() {
    super.initState();
    _simulateLoading();
  }

  Future<void> _simulateLoading() async {
    await Future.delayed(const Duration(seconds: 1));
    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });
  }

  Future<void> _refreshMap() async {
    setState(() {
      _isLoading = true;
    });

    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });
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
        'Mapa',
        textAlign: TextAlign.center,
        style: GoogleFonts.montserrat(
          fontSize: 30,
          fontWeight: FontWeight.w900,
          letterSpacing: -0.5,
        ),
      ),
    );
  }

  Widget _buildUnavailableCityState() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(top: 110),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isDark ? _darkCard : _lightBackground,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              'No momento, o mapa está disponível apenas para Maringá.',
              textAlign: TextAlign.center,
              style: GoogleFonts.montserrat(
                color: isDark ? Colors.white : _gray,
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            '${widget.cityName} estará disponível em breve.',
            textAlign: TextAlign.center,
            style: GoogleFonts.montserrat(
              color: _teal,
              fontSize: 16,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingSkeleton() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: [
        Container(
          width: double.infinity,
          height: 360,
          decoration: BoxDecoration(
            color: isDark ? _darkCard : _lightBackground,
            borderRadius: BorderRadius.circular(22),
          ),
        ),
        const SizedBox(height: 20),
        Container(
          width: double.infinity,
          height: 96,
          decoration: BoxDecoration(
            color: isDark ? _darkCard : _lightBackground,
            borderRadius: BorderRadius.circular(18),
          ),
        ),
      ],
    );
  }

  Widget _buildMapPlaceholder() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      height: 360,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : _lightBackground,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: _teal, width: 1.4),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.map_outlined, color: _teal, size: 56),
          const SizedBox(height: 16),
          Text(
            'Mapa de eventos',
            textAlign: TextAlign.center,
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white : _gray,
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Aqui serão exibidos os eventos próximos a você em Maringá.',
            textAlign: TextAlign.center,
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white70 : _gray,
              fontSize: 14,
              fontWeight: FontWeight.w500,
              height: 1.35,
            ),
          ),
          const SizedBox(height: 18),
          Text(
            '${mapPointsMock.length} pontos mockados preparados',
            textAlign: TextAlign.center,
            style: GoogleFonts.montserrat(
              color: _teal,
              fontSize: 13,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPostGisInfoCard() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 18),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: _teal),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.my_location_outlined, color: _teal, size: 26),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Estrutura preparada para futura integração com geolocalização e PostGIS, permitindo buscar eventos próximos ao cidadão.',
              style: GoogleFonts.montserrat(
                color: isDark ? Colors.white70 : _gray,
                fontSize: 13,
                fontWeight: FontWeight.w600,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return Column(
      children: [
        AppHeader(
          cityName: widget.cityName,
          onCityTap: widget.onCityTap,
          onSearchTap: widget.onSearchTap,
          onNotificationTap: widget.onNotificationTap,
        ),
        const SizedBox(height: 22),
        _buildGradientTitle(),
        const SizedBox(height: 8),
        Text(
          'Visualize eventos próximos e pontos importantes da cidade.',
          textAlign: TextAlign.center,
          style: GoogleFonts.montserrat(
            color: Theme.of(context).brightness == Brightness.dark
                ? Colors.white70
                : _gray,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 22),
        if (!widget.cityAvailable)
          _buildUnavailableCityState()
        else if (_isLoading)
          _buildLoadingSkeleton()
        else ...[
          _buildMapPlaceholder(),
          _buildPostGisInfoCard(),
        ],
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      color: isDark ? _darkBackground : Colors.white,
      child: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refreshMap,
          color: _teal,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
            child: _buildContent(),
          ),
        ),
      ),
    );
  }
}
