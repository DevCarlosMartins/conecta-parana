import 'dart:async';

import 'package:carousel_slider/carousel_slider.dart';
import 'package:conectaparana/features/home/data/home_mock_data.dart';
import 'package:conectaparana/features/home/widgets/event_card.dart';
import 'package:conectaparana/features/home/widgets/home_section_title.dart';
import 'package:conectaparana/features/home/widgets/news_card.dart';
import 'package:conectaparana/features/home/widgets/urgent_notice_card.dart';
import 'package:conectaparana/shared/widgets/app_header.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

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

  final CarouselSliderController _eventsCarouselController =
      CarouselSliderController();
  final CarouselSliderController _newsCarouselController =
      CarouselSliderController();

  Timer? _carouselAutoPlayTimer;

  static const Color _teal = Color(0xFF146E77);
  static const Color _gray = Color(0xFF444444);
  static const Color _lightBackground = Color(0xFFEDEEFF);
  static const Color _darkBackground = Color(0xFF121212);
  static const Color _darkCard = Color(0xFF1E1E1E);

  @override
  void initState() {
    super.initState();
    _simulateLoading();
    _startSyncedCarouselAutoPlay();
  }

  @override
  void dispose() {
    _carouselAutoPlayTimer?.cancel();
    super.dispose();
  }

  void _startSyncedCarouselAutoPlay() {
    _carouselAutoPlayTimer?.cancel();

    _carouselAutoPlayTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!mounted || _isLoading || !widget.cityAvailable) return;

      if (homeEventsMock.length > 1) {
        _eventsCarouselController.nextPage(
          duration: const Duration(milliseconds: 700),
          curve: Curves.easeInOut,
        );
      }

      if (homeNewsMock.length > 1) {
        _newsCarouselController.nextPage(
          duration: const Duration(milliseconds: 700),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  Future<void> _simulateLoading() async {
    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<HomeContentProvider>().loadHomeContent();
    });
  }

  Future<void> _refreshHome() {
    return context.read<HomeContentProvider>().loadHomeContent(
      forceRefresh: true,
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

    return ClipRect(
      child: CarouselSlider.builder(
        carouselController: _eventsCarouselController,
        itemCount: homeEventsMock.length,
        itemBuilder: (context, index, realIndex) {
          final event = homeEventsMock[index];

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: EventCard(title: event.title, imagePath: event.imagePath),
          );
        },
        options: CarouselOptions(
          height: 220,
          viewportFraction: 0.78,
          enlargeCenterPage: true,
          enlargeStrategy: CenterPageEnlargeStrategy.height,
          enableInfiniteScroll: homeEventsMock.length > 1,
          autoPlay: false,
          onPageChanged: (index, reason) {
            setState(() {
              _currentEventIndex = index % homeEventsMock.length;
            });
          },
        ),
      ),
    );
  }

  Widget _buildNewsCarousel(List<HomeNewsMock> news) {
    if (news.isEmpty) {
      return _buildEmptyState('Nenhuma notícia disponível no momento.');
    }

    return ClipRect(
      child: CarouselSlider.builder(
        carouselController: _newsCarouselController,
        itemCount: homeNewsMock.length,
        itemBuilder: (context, index, realIndex) {
          final news = homeNewsMock[index];

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: NewsCard(
              title: news.title,
              description: news.description,
              imagePath: news.imagePath,
            ),
          );
        },
        options: CarouselOptions(
          height: 250,
          viewportFraction: 0.78,
          enlargeCenterPage: true,
          enlargeStrategy: CenterPageEnlargeStrategy.height,
          enableInfiniteScroll: homeNewsMock.length > 1,
          autoPlay: false,
          onPageChanged: (index, reason) {
            setState(() {
              _currentNewsIndex = index % homeNewsMock.length;
            });
          },
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

        if (widget.cityAvailable) SizedBox(height: _showUrgentNotice ? 12 : 48),

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
          if (_showUrgentNotice)
            UrgentNoticeCard(
              onClose: () {
                setState(() {
                  _showUrgentNotice = false;
                });
              },
            ),
          const HomeSectionTitle(title: 'Principais eventos'),
          _buildEventsCarousel(),
          _buildCarouselDots(
            itemCount: events.length,
            currentIndex: _currentEventIndex,
          ),
          const HomeSectionTitle(title: 'Últimas notícias'),
          _buildNewsCarousel(),
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
