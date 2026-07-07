import 'package:conectaparana/features/tickets/data/ticket_mock_data.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class MyTicketsScreen extends StatelessWidget {
  const MyTicketsScreen({super.key});

  static const Color _teal = Color(0xFF146E77);
  static const Color _blue = Color(0xFF264CA9);
  static const Color _green = Color(0xFF029144);
  static const Color _gray = Color(0xFF5A5A5A);
  static const Color _lightBackground = Color(0xFFEDEEFF);
  static const Color _darkBackground = Color(0xFF121212);
  static const Color _darkCard = Color(0xFF1E1E1E);

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
        'Meus ingressos',
        textAlign: TextAlign.center,
        style: GoogleFonts.montserrat(
          fontSize: 28,
          fontWeight: FontWeight.w900,
          letterSpacing: -0.5,
        ),
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : _lightBackground,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _teal.withValues(alpha: 0.55)),
      ),
      child: Column(
        children: [
          Container(
            width: 74,
            height: 74,
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF103B40) : Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: _teal),
            ),
            child: const Icon(
              Icons.confirmation_number_outlined,
              color: _teal,
              size: 38,
            ),
          ),
          const SizedBox(height: 18),
          Text(
            'Você ainda não possui ingressos',
            textAlign: TextAlign.center,
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white : _gray,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Quando uma compra for efetuada, seus ingressos aparecerão aqui.',
            textAlign: TextAlign.center,
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white70 : _gray,
              fontSize: 13,
              height: 1.4,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTicketCard(UserTicketMock ticket, bool isDark) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 18),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: _teal),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.24 : 0.10),
            blurRadius: 9,
            offset: const Offset(2, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [_blue, _green]),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: const Icon(
                  Icons.confirmation_number,
                  color: Colors.white,
                  size: 26,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ticket.eventName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.montserrat(
                        color: isDark ? Colors.white70 : _gray,
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      ticket.ticketName,
                      style: GoogleFonts.montserrat(
                        color: _teal,
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                decoration: BoxDecoration(
                  color: _teal,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  ticket.status,
                  style: GoogleFonts.montserrat(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Container(
            width: 138,
            height: 138,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: _teal),
            ),
            child: _TicketQrPreview(value: ticket.qrCodeValue),
          ),
          const SizedBox(height: 14),
          Text(
            ticket.id,
            textAlign: TextAlign.center,
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white70 : _gray,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Apresente esse ingresso na entrada do evento.',
            textAlign: TextAlign.center,
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white70 : _gray,
              fontSize: 12,
              height: 1.35,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final tickets = TicketMemoryStore.tickets;

    return Scaffold(
      backgroundColor: isDark ? _darkBackground : Colors.white,
      appBar: AppBar(
        backgroundColor: isDark ? _darkBackground : Colors.white,
        elevation: 0,
        iconTheme: IconThemeData(color: isDark ? Colors.white : _gray),
        title: Text(
          'Ingressos',
          style: GoogleFonts.montserrat(
            color: isDark ? Colors.white : _gray,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(22, 12, 22, 28),
        child: Column(
          children: [
            _buildGradientTitle(),
            const SizedBox(height: 8),
            Text(
              'Acompanhe aqui seus ingressos',
              textAlign: TextAlign.center,
              style: GoogleFonts.montserrat(
                color: isDark ? Colors.white70 : _gray,
                fontSize: 13,
                height: 1.35,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 24),
            if (tickets.isEmpty)
              _buildEmptyState(isDark)
            else ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                margin: const EdgeInsets.only(bottom: 18),
                decoration: BoxDecoration(
                  color: isDark ? _darkCard : _lightBackground,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: _teal.withValues(alpha: 0.45)),
                ),
                child: Text(
                  '${tickets.length} ingressos disponíveis',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.montserrat(
                    color: _teal,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              ...tickets.map((ticket) {
                return _buildTicketCard(ticket, isDark);
              }),
            ],
          ],
        ),
      ),
    );
  }
}

class _TicketQrPreview extends StatelessWidget {
  const _TicketQrPreview({required this.value});

  final String value;

  bool _isFilled(int row, int column) {
    final seed = value.codeUnits.fold(0, (total, code) => total + code);
    final result = (row * 11 + column * 7 + seed) % 4;

    return result == 0 || result == 2;
  }

  bool _isFinderPattern(int row, int column, int startRow, int startColumn) {
    final insideRow = row >= startRow && row < startRow + 5;
    final insideColumn = column >= startColumn && column < startColumn + 5;

    if (!insideRow || !insideColumn) return false;

    final localRow = row - startRow;
    final localColumn = column - startColumn;

    final isBorder =
        localRow == 0 || localRow == 4 || localColumn == 0 || localColumn == 4;
    final isCenter =
        localRow >= 2 && localRow <= 3 && localColumn >= 2 && localColumn <= 3;

    return isBorder || isCenter;
  }

  @override
  Widget build(BuildContext context) {
    const size = 17;

    return GridView.builder(
      padding: EdgeInsets.zero,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: size * size,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: size,
      ),
      itemBuilder: (context, index) {
        final row = index ~/ size;
        final column = index % size;

        final filled =
            _isFinderPattern(row, column, 0, 0) ||
            _isFinderPattern(row, column, 0, 12) ||
            _isFinderPattern(row, column, 12, 0) ||
            _isFilled(row, column);

        return Container(
          margin: const EdgeInsets.all(1),
          decoration: BoxDecoration(
            color: filled ? Colors.black : Colors.white,
            borderRadius: BorderRadius.circular(1),
          ),
        );
      },
    );
  }
}
