import 'package:carousel_slider/carousel_slider.dart';
import 'package:conectaparana/features/home/data/home_mock_data.dart';
import 'package:conectaparana/providers/home_content_provider.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:conectaparana/shared/widgets/app_header.dart';
import 'package:provider/provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({
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
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _showUrgentNotice = true;

  int _currentEventIndex = 0;
  int _currentNewsIndex = 0;

  static const Color _teal = Color(0xFF146E77);
  static const Color _blue = Color(0xFF264CA9);
  static const Color _green = Color(0xFF029144);
  static const Color _gray = Color(0xFF444444);
  static const Color _lightBackground = Color(0xFFEDEEFF);
  static const Color _darkBackground = Color(0xFF121212);
  static const Color _darkCard = Color(0xFF1E1E1E);

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<HomeContentProvider>().loadHomeContent();
    });
  }

  Future<void> _refreshHome() {
    return context.read<HomeContentProvider>().loadHomeContent(
      forceRefresh: true,
    );
  }

  Widget _buildUrgentNotice(HomeComunicadoMock comunicado) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? _darkCard : Colors.white;
    final textColor = isDark ? Colors.white : _gray;

    return Container(
      margin: const EdgeInsets.only(top: 20),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 58,
            decoration: BoxDecoration(
              color: Colors.red,
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              '${comunicado.title}\n${comunicado.description}',
              style: GoogleFonts.montserrat(
                color: textColor,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          IconButton(
            onPressed: () {
              setState(() {
                _showUrgentNotice = false;
              });
            },
            icon: Icon(
              Icons.close,
              size: 18,
              color: isDark ? Colors.white70 : _gray,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(top: 24, bottom: 12),
        child: ShaderMask(
          blendMode: BlendMode.srcIn,
          shaderCallback: (bounds) {
            return const LinearGradient(
              begin: Alignment.bottomLeft,
              end: Alignment.topRight,
              colors: [_blue, _green],
            ).createShader(Rect.fromLTWH(0, 0, bounds.width, bounds.height));
          },
          child: Text(
            title,
            style: GoogleFonts.montserrat(
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : _lightBackground,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        message,
        textAlign: TextAlign.center,
        style: GoogleFonts.montserrat(
          color: isDark ? Colors.white : _gray,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _buildCarouselDots({
    required int itemCount,
    required int currentIndex,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(itemCount, (index) {
        final isActive = index == currentIndex;

        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.symmetric(horizontal: 3, vertical: 10),
          width: isActive ? 9 : 6,
          height: 6,
          decoration: BoxDecoration(
            color: isActive ? const Color(0xAAAAAAAA) : const Color(0xFFC9C8C8),
            borderRadius: BorderRadius.circular(999),
          ),
        );
      }),
    );
  }

  Widget _buildEventsCarousel(List<HomeEventMock> events) {
    if (events.isEmpty) {
      return _buildEmptyState('Nenhum evento disponível no momento.');
    }

    return CarouselSlider.builder(
      itemCount: events.length,
      itemBuilder: (context, index, realIndex) {
        final event = events[index];

        return _buildEventCard(event);
      },
      options: CarouselOptions(
        height: 220,
        viewportFraction: 0.78,
        enlargeCenterPage: true,
        enableInfiniteScroll: events.length > 1,
        onPageChanged: (index, reason) {
          setState(() {
            _currentEventIndex = index % events.length;
          });
        },
      ),
    );
  }

  Widget _buildEventCard(HomeEventMock event) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? _darkCard : Colors.white;
    final textColor = isDark ? Colors.white : _gray;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 6),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _blue, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Column(
          children: [
            Expanded(
              child: Image.asset(
                event.imagePath,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Text(
                event.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: GoogleFonts.montserrat(
                  color: textColor,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNewsCarousel(List<HomeNewsMock> news) {
    if (news.isEmpty) {
      return _buildEmptyState('Nenhuma notícia disponível no momento.');
    }

    return CarouselSlider.builder(
      itemCount: news.length,
      itemBuilder: (context, index, realIndex) {
        final item = news[index];

        return _buildNewsCard(item);
      },
      options: CarouselOptions(
        height: 230,
        viewportFraction: 0.78,
        enlargeCenterPage: true,
        enableInfiniteScroll: news.length > 1,
        onPageChanged: (index, reason) {
          setState(() {
            _currentNewsIndex = index % news.length;
          });
        },
      ),
    );
  }

  Widget _buildNewsCard(HomeNewsMock news) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? _darkCard : Colors.white;
    final textColor = isDark ? Colors.white : _gray;
    final descriptionColor = isDark ? Colors.white70 : _gray;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 6),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _teal, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Image.asset(
                news.imagePath,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Text(
                news.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.montserrat(
                  color: textColor,
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 0, 10, 10),
              child: Text(
                news.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.montserrat(
                  color: descriptionColor,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(HomeContentProvider homeContentProvider) {
    final events = homeContentProvider.events.isNotEmpty
        ? homeContentProvider.events
        : homeEventsMock;

    final news = homeContentProvider.news.isNotEmpty
        ? homeContentProvider.news
        : homeNewsMock;

    final comunicados = homeContentProvider.comunicados.isNotEmpty
        ? homeContentProvider.comunicados
        : homeComunicadosMock;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        AppHeader(
          cityName: widget.cityName,
          onCityTap: widget.onCityTap,
          onSearchTap: widget.onSearchTap,
          onNotificationTap: widget.onNotificationTap,
        ),

        if (!widget.cityAvailable) ...[
          const SizedBox(height: 120),
          _buildEmptyState(
            'No momento, o Conecta Paraná está disponível apenas para Maringá.',
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
        ] else ...[
          if (homeContentProvider.errorMessage != null)
            _buildBackendWarning(homeContentProvider.errorMessage!),

          if (_showUrgentNotice && comunicados.isNotEmpty)
            _buildUrgentNotice(comunicados.first),

          _buildSectionTitle('Principais eventos'),

          _buildEventsCarousel(events),

          _buildCarouselDots(
            itemCount: events.length,
            currentIndex: _currentEventIndex,
          ),

          _buildSectionTitle('Últimas notícias'),

          _buildNewsCarousel(news),

          _buildCarouselDots(
            itemCount: news.length,
            currentIndex: _currentNewsIndex,
          ),

          const SizedBox(height: 24),
        ],
      ],
    );
  }

  Widget _buildLoadingSkeleton() {
    return Column(
      children: [
        _buildSkeletonBox(height: 42),
        const SizedBox(height: 24),
        _buildSkeletonBox(height: 70),
        const SizedBox(height: 24),
        _buildSkeletonBox(height: 180),
        const SizedBox(height: 24),
        _buildSkeletonBox(height: 220),
      ],
    );
  }

  Widget _buildSkeletonBox({required double height}) {
    return Container(
      width: double.infinity,
      height: height,
      decoration: BoxDecoration(
        color: const Color(0xFFEDEEFF),
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }

  Widget _buildBackendWarning(String message) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 16),
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

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? _darkBackground : Colors.white,
      body: SafeArea(
        child: Consumer<HomeContentProvider>(
          builder: (context, homeContentProvider, _) {
            return RefreshIndicator(
              onRefresh: _refreshHome,
              color: _teal,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                child: homeContentProvider.isLoading
                    ? _buildLoadingSkeleton()
                    : _buildContent(homeContentProvider),
              ),
            );
          },
        ),
      ),
    );
  }
}
