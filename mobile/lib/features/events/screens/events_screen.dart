import 'package:conectaparana/features/events/data/events_mock_data.dart';
import 'package:conectaparana/shared/widgets/app_header.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({
    super.key,
    required this.cityName,
    required this.cityAvailable,
    required this.onCityTap,
    required this.onSearchTap,
    required this.onNotificationTap,
    this.eventTitleToOpen,
    this.eventOpenRequestId = 0,
  });

  final String cityName;
  final bool cityAvailable;
  final VoidCallback onCityTap;
  final VoidCallback onSearchTap;
  final VoidCallback onNotificationTap;
  final String? eventTitleToOpen;
  final int eventOpenRequestId;

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  bool _isLoading = true;
  int _lastHandledEventOpenRequestId = 0;

  static const Color _blue = Color(0xFF264CA9);
  static const Color _green = Color(0xFF029144);
  static const Color _teal = Color(0xFF146E77);
  static const Color _gray = Color(0xFF5A5A5A);
  static const Color _lightBackground = Color(0xFFEDEEFF);
  static const Color _darkBackground = Color(0xFF121212);
  static const Color _darkCard = Color(0xFF1E1E1E);

  @override
  void initState() {
    super.initState();
    _simulateLoading();
  }

  @override
  void didUpdateWidget(covariant EventsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.eventOpenRequestId != oldWidget.eventOpenRequestId) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _openRequestedEventDetails();
      });
    }
  }

  Future<void> _simulateLoading() async {
    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _openRequestedEventDetails();
    });
  }

  Future<void> _refreshEvents() async {
    setState(() {
      _isLoading = true;
    });

    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });
  }

  void _openRequestedEventDetails() {
    if (!mounted) return;
    if (_isLoading) return;
    if (!widget.cityAvailable) return;
    if (widget.eventTitleToOpen == null) return;
    if (_lastHandledEventOpenRequestId == widget.eventOpenRequestId) return;

    final event = _findEventByTitle(widget.eventTitleToOpen!);

    if (event == null) return;

    _lastHandledEventOpenRequestId = widget.eventOpenRequestId;
    _showEventDetails(event);
  }

  EventMock? _findEventByTitle(String title) {
    final normalizedTitle = _normalizeEventTitle(title);

    for (final event in eventsMock) {
      final normalizedEventTitle = _normalizeEventTitle(event.title);

      if (normalizedEventTitle == normalizedTitle ||
          normalizedTitle.contains(normalizedEventTitle) ||
          normalizedEventTitle.contains(normalizedTitle)) {
        return event;
      }
    }

    return null;
  }

  String _normalizeEventTitle(String value) {
    return value
        .toLowerCase()
        .replaceAll('2026', '')
        .replaceAll('de maringá', '')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
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
        'Eventos',
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
      padding: const EdgeInsets.only(top: 120),
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
              'No momento, o Conecta Paraná está disponível apenas para Maringá.',
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

  Widget _buildEventsList() {
    if (eventsMock.isEmpty) {
      return _buildEmptyState();
    }

    return Column(children: eventsMock.map(_buildEventCard).toList());
  }

  Widget _buildEventCard(EventMock event) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final cardColor = isDark ? _darkCard : _lightBackground;
    final textColor = isDark ? Colors.white : _gray;
    final descriptionColor = isDark ? Colors.white70 : _gray;
    final shadowColor = isDark
        ? Colors.black.withValues(alpha: 0.35)
        : Colors.black.withValues(alpha: 0.18);

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 22),
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: _teal, width: 1.4),
        boxShadow: [
          BoxShadow(
            color: shadowColor,
            blurRadius: 8,
            offset: const Offset(2, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            event.title,
            textAlign: TextAlign.center,
            style: GoogleFonts.montserrat(
              color: textColor,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),

          const SizedBox(height: 12),

          ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: Image.asset(
              event.imagePath,
              height: 130,
              width: 220,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  height: 130,
                  width: 220,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF2A2A2A) : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: _teal),
                  ),
                  child: const Icon(
                    Icons.image_not_supported_outlined,
                    color: _teal,
                    size: 36,
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 14),

          _buildEventInfoRow(
            icon: Icons.location_on_outlined,
            text: event.location,
            color: descriptionColor,
          ),

          const SizedBox(height: 6),

          _buildEventInfoRow(
            icon: Icons.calendar_today_outlined,
            text: event.date,
            color: descriptionColor,
          ),

          const SizedBox(height: 12),

          InkWell(
            onTap: () => _showEventDetails(event),
            borderRadius: BorderRadius.circular(20),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: Text(
                'Mais informações',
                style: GoogleFonts.montserrat(
                  color: _teal,
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEventInfoRow({
    required IconData icon,
    required String text,
    required Color color,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, color: _teal, size: 16),
        const SizedBox(width: 6),
        Flexible(
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.montserrat(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }

  void _showEventDetails(EventMock event) {
    showDialog<void>(
      context: context,
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;

        final dialogColor = isDark ? _darkCard : Colors.white;
        final textColor = isDark ? Colors.white : _gray;
        final descriptionColor = isDark ? Colors.white70 : _gray;

        return Dialog(
          backgroundColor: dialogColor,
          insetPadding: const EdgeInsets.symmetric(
            horizontal: 24,
            vertical: 24,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.82,
              maxWidth: 420,
            ),
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            event.title,
                            style: GoogleFonts.montserrat(
                              color: _teal,
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        IconButton(
                          onPressed: () => Navigator.pop(context),
                          icon: Icon(
                            Icons.close,
                            color: isDark ? Colors.white70 : _gray,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),

                    ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.asset(
                        event.imagePath,
                        width: double.infinity,
                        height: 180,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: double.infinity,
                            height: 180,
                            decoration: BoxDecoration(
                              color: isDark
                                  ? const Color(0xFF2A2A2A)
                                  : _lightBackground,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: _teal),
                            ),
                            child: const Icon(
                              Icons.image_not_supported_outlined,
                              color: _teal,
                              size: 42,
                            ),
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 18),

                    _buildEventDetailRow(
                      icon: Icons.location_on_outlined,
                      title: 'Local',
                      value: event.location,
                      textColor: textColor,
                    ),

                    const SizedBox(height: 12),

                    _buildEventDetailRow(
                      icon: Icons.calendar_today_outlined,
                      title: 'Data',
                      value: event.date,
                      textColor: textColor,
                    ),

                    const SizedBox(height: 18),

                    Text(
                      'Descrição',
                      style: GoogleFonts.montserrat(
                        color: _teal,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),

                    const SizedBox(height: 8),

                    Text(
                      event.description,
                      style: GoogleFonts.montserrat(
                        color: descriptionColor,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        height: 1.45,
                      ),
                    ),

                    const SizedBox(height: 22),

                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _teal,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: Text(
                          'Fechar',
                          style: GoogleFonts.montserrat(
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildEventDetailRow({
    required IconData icon,
    required String title,
    required String value,
    required Color textColor,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF103B40) : _lightBackground,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _teal),
          ),
          child: Icon(icon, color: _teal, size: 20),
        ),

        const SizedBox(width: 12),

        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.montserrat(
                  color: _teal,
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: GoogleFonts.montserrat(
                  color: textColor,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : _lightBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _teal),
      ),
      child: Column(
        children: [
          const Icon(Icons.event_busy_outlined, color: _teal, size: 42),
          const SizedBox(height: 12),
          Text(
            'Nenhum evento disponível no momento.',
            textAlign: TextAlign.center,
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white : _gray,
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingSkeleton() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: List.generate(3, (index) {
        return Container(
          width: double.infinity,
          height: 245,
          margin: const EdgeInsets.only(bottom: 22),
          decoration: BoxDecoration(
            color: isDark ? _darkCard : _lightBackground,
            borderRadius: BorderRadius.circular(18),
          ),
        );
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      color: isDark ? _darkBackground : Colors.white,
      child: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refreshEvents,
          color: _teal,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
            child: Column(
              children: [
                AppHeader(
                  cityName: widget.cityName,
                  onCityTap: widget.onCityTap,
                  onSearchTap: widget.onSearchTap,
                  onNotificationTap: widget.onNotificationTap,
                ),

                const SizedBox(height: 22),

                _buildGradientTitle(),

                const SizedBox(height: 18),

                if (!widget.cityAvailable)
                  _buildUnavailableCityState()
                else if (_isLoading)
                  _buildLoadingSkeleton()
                else
                  _buildEventsList(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
