import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class NewsCard extends StatelessWidget {
  const NewsCard({
    super.key,
    required this.title,
    required this.description,
    required this.imagePath,
    this.onTap,
  });

  final String title;
  final String description;
  final String imagePath;
  final VoidCallback? onTap;

  static const Color _teal = Color(0xFF146E77);
  static const Color _gray = Color(0xFF444444);
  static const Color _darkCard = Color(0xFF1E1E1E);
  static const Color _lightBackground = Color(0xFFEDEEFF);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          decoration: BoxDecoration(
            color: isDark ? _darkCard : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: _teal),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.12),
                blurRadius: 8,
                offset: const Offset(2, 4),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Image.asset(
                  imagePath,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: double.infinity,
                      color: isDark ? Colors.black26 : _lightBackground,
                      child: const Icon(
                        Icons.image_not_supported_outlined,
                        color: _teal,
                        size: 36,
                      ),
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 2),
                child: Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.montserrat(
                    color: isDark ? Colors.white : _gray,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 2, 10, 8),
                child: Text(
                  description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.montserrat(
                    color: isDark ? Colors.white70 : _gray,
                    fontSize: 11,
                    height: 1.25,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
