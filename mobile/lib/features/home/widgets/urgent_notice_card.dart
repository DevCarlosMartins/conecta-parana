import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class UrgentNoticeCard extends StatelessWidget {
  const UrgentNoticeCard({super.key, required this.onClose});

  final VoidCallback onClose;

  static const Color _red = Color(0xFFFF4A45);
  static const Color _gray = Color(0xFF444444);
  static const Color _darkCard = Color(0xFF1E1E1E);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 22, bottom: 22),
      padding: const EdgeInsets.fromLTRB(12, 14, 8, 14),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _red, width: 1.4),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.10),
            blurRadius: 8,
            offset: const Offset(2, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 58,
            decoration: BoxDecoration(
              color: _red,
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'COMUNICADO URGENTE!\nCratera se abre em cruzamento entre Av. Paraná e Av. Horácio Raccanello.',
              style: GoogleFonts.montserrat(
                color: isDark ? Colors.white : _gray,
                fontSize: 12,
                fontWeight: FontWeight.w800,
                height: 1.35,
              ),
            ),
          ),
          IconButton(
            onPressed: onClose,
            icon: Icon(
              Icons.close,
              color: isDark ? Colors.white70 : Colors.grey,
              size: 18,
            ),
          ),
        ],
      ),
    );
  }
}
