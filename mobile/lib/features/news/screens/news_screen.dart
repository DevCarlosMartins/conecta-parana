import 'package:conectaparana/features/news/data/news_mock_data.dart';
import 'package:conectaparana/services/news_service.dart';
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

              FutureBuilder<List<NewsMock>>(
                future: _loadNews(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return _buildLoadingState(context);
                  }

                  if (snapshot.hasError) {
                    return _buildErrorState(context);
                  }

                  final newsList = snapshot.data ?? [];

                  if (newsList.isEmpty) {
                    return _buildEmptyState(context);
                  }

                  return _buildNewsList(context, newsList);
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
    showDialog<void>(
      context: context,
      builder: (dialogContext) {
        final isDark = Theme.of(dialogContext).brightness == Brightness.dark;

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
              maxHeight: MediaQuery.of(dialogContext).size.height * 0.82,
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
                            news.title,
                            style: GoogleFonts.montserrat(
                              color: _teal,
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        IconButton(
                          onPressed: () => Navigator.pop(dialogContext),
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
                      child: SizedBox(
                        width: double.infinity,
                        height: 180,
                        child: Image.asset(
                          news.imagePath,
                          fit: BoxFit.cover,
                          alignment: const Alignment(0, -0.8),
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
                    ),

                    const SizedBox(height: 18),

                    Text(
                      'Publicação',
                      style: GoogleFonts.montserrat(
                        color: _teal,
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                      ),
                    ),

                    const SizedBox(height: 2),

                    Text(
                      news.publicationInfo,
                      style: GoogleFonts.montserrat(
                        color: textColor,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
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
                      news.description,
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
                        onPressed: () => _openNewsLink(dialogContext, news),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _teal,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: Text(
                          'Abrir notícia completa',
                          style: GoogleFonts.montserrat(
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 10),

                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(dialogContext),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: _teal,
                          side: const BorderSide(color: _teal),
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

  Future<List<NewsMock>> _loadNews() {
    return NewsService().getNews();
  }

  Widget _buildNewsList(BuildContext context, List<NewsMock> newsList) {
    return ListView.separated(
      itemCount: newsList.length,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      separatorBuilder: (_, _) => const SizedBox(height: 20),
      itemBuilder: (context, index) {
        final news = newsList[index];

        return _NewsListCard(
          news: news,
          onTap: () => _showNewsDetails(context, news),
          onMoreInfoTap: () => _showNewsDetails(context, news),
        );
      },
    );
  }

  Widget _buildLoadingState(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : _lightBackground,
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Center(child: CircularProgressIndicator(color: _teal)),
    );
  }

  Widget _buildErrorState(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : _lightBackground,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        'Não foi possível carregar as notícias.',
        textAlign: TextAlign.center,
        style: GoogleFonts.montserrat(
          color: isDark ? Colors.white : _gray,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
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
