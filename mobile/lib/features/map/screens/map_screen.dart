import 'package:conectaparana/features/map/data/map_mock_data.dart';
import 'package:conectaparana/shared/widgets/app_header.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:latlong2/latlong.dart';

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

  MapPointMock? _selectedPoint;

  static const Color _blue = Color(0xFF264CA9);
  static const Color _green = Color(0xFF029144);
  static const Color _teal = Color(0xFF146E77);
  static const Color _gray = Color(0xFF444444);
  static const Color _lightBackground = Color(0xFFEDEEFF);
  static const Color _darkBackground = Color(0xFF121212);
  static const Color _darkCard = Color(0xFF1E1E1E);
  static const LatLng _maringaCenter = LatLng(-23.420999, -51.933056);

  @override
  void initState() {
    super.initState();

    if (mapPointsMock.isNotEmpty) {
      _selectedPoint = mapPointsMock.first;
    }

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

  Widget _buildInteractiveMap() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final mapHeight = (MediaQuery.sizeOf(context).height * 0.54)
        .clamp(430.0, 560.0)
        .toDouble();

    return Column(
      children: [
        Container(
          width: double.infinity,
          height: mapHeight,
          decoration: BoxDecoration(
            color: isDark ? _darkCard : _lightBackground,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: _teal, width: 1.4),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.28 : 0.12),
                blurRadius: 10,
                offset: const Offset(2, 5),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: Stack(
            children: [
              FlutterMap(
                options: const MapOptions(
                  initialCenter: _maringaCenter,
                  initialZoom: 13.2,
                  minZoom: 11,
                  maxZoom: 18,
                  interactionOptions: InteractionOptions(
                    flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
                  ),
                ),
                children: [
                  TileLayer(
                    urlTemplate:
                        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'br.com.conectaparana.mobile',
                  ),
                  MarkerLayer(
                    markers: mapPointsMock.map((point) {
                      final isSelected = _selectedPoint?.title == point.title;
                      return Marker(
                        point: point.position,
                        width: 58,
                        height: 58,
                        child: _buildMapMarker(
                          point: point,
                          isSelected: isSelected,
                        ),
                      );
                    }).toList(),
                  ),
                  const RichAttributionWidget(
                    attributions: [
                      TextSourceAttribution('OpenStreetMap contributors'),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        _buildSelectedPointCard(),
      ],
    );
  }

  Widget _buildMapMarker({
    required MapPointMock point,
    required bool isSelected,
  }) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedPoint = point;
        });
      },
      child: AnimatedScale(
        scale: isSelected ? 1.16 : 1,
        duration: const Duration(milliseconds: 180),
        child: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: point.markerColor,
            shape: BoxShape.circle,
            border: Border.all(
              color: isSelected
                  ? Colors.white
                  : point.markerColor.withValues(alpha: 0.35),
              width: isSelected ? 4 : 2,
            ),
            boxShadow: [
              BoxShadow(
                color: point.markerColor.withValues(alpha: 0.45),
                blurRadius: 12,
                offset: const Offset(1, 4),
              ),
            ],
          ),
          child: Icon(point.icon, color: Colors.white, size: 23),
        ),
      ),
    );
  }

  Widget _buildSelectedPointCard() {
    final point = _selectedPoint;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (point == null) {
      return const SizedBox.shrink();
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: _teal),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.28 : 0.10),
            blurRadius: 8,
            offset: const Offset(2, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: Image.asset(
              point.imagePath,
              width: 82,
              height: 82,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  width: 82,
                  height: 82,
                  color: isDark ? const Color(0xFF2A2A2A) : _lightBackground,
                  child: const Icon(
                    Icons.image_not_supported_outlined,
                    color: _teal,
                  ),
                );
              },
            ),
          ),
          const SizedBox(width: 12),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildCategoryPill(point.category, point.markerColor),

                const SizedBox(height: 8),

                Text(
                  point.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.montserrat(
                    color: isDark ? Colors.white : _gray,
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),

                const SizedBox(height: 6),

                Text(
                  point.address,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.montserrat(
                    color: isDark ? Colors.white70 : _gray,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),

                const SizedBox(height: 6),

                Row(
                  children: [
                    const Icon(Icons.near_me_outlined, color: _teal, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      point.distanceLabel,
                      style: GoogleFonts.montserrat(
                        color: _teal,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryPill(String category, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color),
      ),
      child: Text(
        category,
        style: GoogleFonts.montserrat(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w900,
        ),
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
          _buildInteractiveMap(),
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
