import 'package:conectaparana/features/news/data/news_mock_data.dart';
import 'package:conectaparana/shared/widgets/app_header.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

class NewsScreen extends StatelessWidget {
  const NewsScreen({
    super.key,
    required this.cityName,
    required this.onCityTap,
    required this.onSearchTap,
    required this.onNotificationTap,
  });

  final String cityName;
  final VoidCallback onCityTap;
  final VoidCallback onSearchTap;
  final VoidCallback onNotificationTap;

  static const Color _teal = Color(0xFF146E77);
  static const Color _blue = Color(0xFF264CA9);
  static const Color _green = Color(0xFF029144);
  static const Color _gray = Color(0xFF444444);
  static const Color _lightBackground = Color(0xFFEDEEFF);
  static const Color _darkBackground = Color(0xFF121212);
  static const Color _darkCard = Color(0xFF1E1E1E);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: isDark ? _darkBackground : Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 96),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              AppHeader(
                cityName: cityName,
                onCityTap: onCityTap,
                onSearchTap: onSearchTap,
                onNotificationTap: onNotificationTap,
              ),

              const SizedBox(height: 28),

              ShaderMask(
                shaderCallback: (bounds) => const LinearGradient(
                  colors: [_blue, _green],
                ).createShader(bounds),
                child: Text(
                  'Notícias',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.montserrat(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),

              const SizedBox(height: 24),

              if (newsMock.isEmpty)
                _buildEmptyState(context)
              else
                ListView.separated(
                  itemCount: newsMock.length,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  separatorBuilder: (_, _) => const SizedBox(height: 20),
                  itemBuilder: (context, index) {
                    final news = newsMock[index];

                    return _NewsListCard(
                      news: news,
                      onTap: () => _showNewsDetails(context, news),
                      onMoreInfoTap: () => _openNewsLink(context, news),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : _lightBackground,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        'Nenhuma notícia disponível no momento.',
        textAlign: TextAlign.center,
        style: GoogleFonts.montserrat(
          color: isDark ? Colors.white : _gray,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  void _showNewsDetails(BuildContext context, NewsMock news) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (bottomSheetContext) {
        return DraggableScrollableSheet(
          initialChildSize: 0.72,
          minChildSize: 0.45,
          maxChildSize: 0.90,
          builder: (context, scrollController) {
            return Container(
              decoration: BoxDecoration(
                color: isDark ? _darkCard : Colors.white,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(28),
                ),
              ),
              child: SingleChildScrollView(
                controller: scrollController,
                padding: const EdgeInsets.fromLTRB(20, 14, 20, 28),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 44,
                        height: 4,
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white24 : Colors.black26,
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                    ),

                    const SizedBox(height: 18),

                    ClipRRect(
                      borderRadius: BorderRadius.circular(18),
                      child: Image.asset(
                        news.imagePath,
                        width: double.infinity,
                        height: 190,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: double.infinity,
                            height: 190,
                            color: isDark ? Colors.black26 : _lightBackground,
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

                    Text(
                      news.title,
                      style: GoogleFonts.montserrat(
                        color: isDark ? Colors.white : _gray,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                      ),
                    ),

                    const SizedBox(height: 10),

                    Text(
                      news.publicationInfo,
                      style: GoogleFonts.montserrat(
                        color: _teal,
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                      ),
                    ),

                    const SizedBox(height: 14),

                    Text(
                      news.description,
                      style: GoogleFonts.montserrat(
                        color: isDark ? Colors.white70 : _gray,
                        fontSize: 14,
                        height: 1.45,
                        fontWeight: FontWeight.w500,
                      ),
                    ),

                    const SizedBox(height: 22),

                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () =>
                            _openNewsLink(bottomSheetContext, news),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _teal,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                        child: Text(
                          'Abrir notícia completa',
                          style: GoogleFonts.montserrat(
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 10),

                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(bottomSheetContext),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: _teal,
                          side: const BorderSide(color: _teal),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                        child: Text(
                          'Fechar',
                          style: GoogleFonts.montserrat(
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _openNewsLink(BuildContext context, NewsMock news) async {
    final uri = Uri.parse(news.sourceUrl);

    final canOpen = await canLaunchUrl(uri);

    if (!context.mounted) return;

    if (!canOpen) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Não foi possível abrir o link da notícia.'),
        ),
      );
      return;
    }

    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

class _NewsListCard extends StatelessWidget {
  const _NewsListCard({
    required this.news,
    required this.onTap,
    required this.onMoreInfoTap,
  });

  final NewsMock news;
  final VoidCallback onTap;
  final VoidCallback onMoreInfoTap;

  static const Color _teal = Color(0xFF146E77);
  static const Color _gray = Color(0xFF444444);
  static const Color _lightBackground = Color(0xFFEDEEFF);
  static const Color _darkCard = Color(0xFF1E1E1E);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          decoration: BoxDecoration(
            color: isDark ? _darkCard : Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: _teal),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.10),
                blurRadius: 8,
                offset: const Offset(2, 4),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Image.asset(
                news.imagePath,
                width: double.infinity,
                height: 170,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: double.infinity,
                    height: 170,
                    color: isDark ? Colors.black26 : _lightBackground,
                    child: const Icon(
                      Icons.image_not_supported_outlined,
                      color: _teal,
                      size: 36,
                    ),
                  );
                },
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 4),
                child: Text(
                  news.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.montserrat(
                    color: isDark ? Colors.white : _gray,
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 4, 14, 4),
                child: Text(
                  news.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.montserrat(
                    color: isDark ? Colors.white70 : _gray,
                    fontSize: 13,
                    height: 1.35,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 8, 14, 14),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        news.publicationInfo,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.montserrat(
                          color: _teal,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    InkWell(
                      onTap: onMoreInfoTap,
                      borderRadius: BorderRadius.circular(999),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 4,
                          vertical: 4,
                        ),
                        child: Text(
                          'Mais informações',
                          style: GoogleFonts.montserrat(
                            color: _teal,
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
