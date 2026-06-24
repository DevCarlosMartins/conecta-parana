import 'package:carousel_slider/carousel_slider.dart';
import 'package:conectaparana/features/home/data/home_mock_data.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:conectaparana/shared/widgets/app_header.dart';
import 'package:conectaparana/features/home/widgets/event_card.dart';
import 'package:conectaparana/features/home/widgets/home_section_title.dart';
import 'package:conectaparana/features/home/widgets/news_card.dart';
import 'package:conectaparana/features/home/widgets/urgent_notice_card.dart';

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
  bool _isLoading = true;
  bool _showUrgentNotice = true;

  int _currentEventIndex = 0;
  int _currentNewsIndex = 0;

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

  Future<void> _refreshHome() async {
    setState(() {
      _isLoading = true;
    });

    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });
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

  Widget _buildEventsCarousel() {
    if (homeEventsMock.isEmpty) {
      return _buildEmptyState('Nenhum evento disponível no momento.');
    }

    return CarouselSlider.builder(
      itemCount: homeEventsMock.length,
      itemBuilder: (context, index, realIndex) {
        final event = homeEventsMock[index];

        return EventCard(title: event.title, imagePath: event.imagePath);
      },
      options: CarouselOptions(
        height: 220,
        viewportFraction: 0.78,
        enlargeCenterPage: true,
        enableInfiniteScroll: homeEventsMock.length > 1,
        onPageChanged: (index, reason) {
          setState(() {
            _currentEventIndex = index % homeEventsMock.length;
          });
        },
      ),
    );
  }

  Widget _buildNewsCarousel() {
    if (homeNewsMock.isEmpty) {
      return _buildEmptyState('Nenhuma notícia disponível no momento.');
    }

    return CarouselSlider.builder(
      itemCount: homeNewsMock.length,
      itemBuilder: (context, index, realIndex) {
        final news = homeNewsMock[index];

        return NewsCard(
          title: news.title,
          description: news.description,
          imagePath: news.imagePath,
        );
      },
      options: CarouselOptions(
        height: 250,
        viewportFraction: 0.78,
        enlargeCenterPage: true,
        enableInfiniteScroll: homeNewsMock.length > 1,
        onPageChanged: (index, reason) {
          setState(() {
            _currentNewsIndex = index % homeNewsMock.length;
          });
        },
      ),
    );
  }

  Widget _buildContent() {
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
            itemCount: homeEventsMock.length,
            currentIndex: _currentEventIndex,
          ),

          const HomeSectionTitle(title: 'Últimas notícias'),

          _buildNewsCarousel(),

          _buildCarouselDots(
            itemCount: homeNewsMock.length,
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

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? _darkBackground : Colors.white,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refreshHome,
          color: _teal,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
            child: _isLoading ? _buildLoadingSkeleton() : _buildContent(),
          ),
        ),
      ),
    );
  }
}
