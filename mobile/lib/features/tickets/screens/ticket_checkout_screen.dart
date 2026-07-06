import 'package:conectaparana/features/tickets/data/ticket_mock_data.dart';
import 'package:conectaparana/features/tickets/screens/pix_payment_screen.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class TicketCheckoutScreen extends StatelessWidget {
  const TicketCheckoutScreen({
    super.key,
    required this.eventName,
    required this.imagePath,
    required this.location,
    required this.date,
    required this.items,
  });

  final String eventName;
  final String imagePath;
  final String location;
  final String date;
  final List<TicketCartItem> items;

  static const Color _teal = Color(0xFF146E77);
  static const Color _blue = Color(0xFF264CA9);
  static const Color _green = Color(0xFF029144);
  static const Color _gray = Color(0xFF5A5A5A);
  static const Color _lightBackground = Color(0xFFEDEEFF);
  static const Color _darkBackground = Color(0xFF121212);
  static const Color _darkCard = Color(0xFF1E1E1E);

  double get _subtotal => calculateSubtotal(items);
  double get _serviceFee => calculateServiceFee(_subtotal);
  double get _total => _subtotal + _serviceFee;

  void _goToPix(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (context) => PixPaymentScreen(
          eventName: eventName,
          items: items,
          subtotal: _subtotal,
          serviceFee: _serviceFee,
          total: _total,
        ),
      ),
    );
  }

  Widget _buildPriceRow(String label, double value, bool isDark) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white70 : _gray,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        Text(
          formatCurrency(value),
          style: GoogleFonts.montserrat(
            color: isDark ? Colors.white : _gray,
            fontSize: 13,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryCard(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            eventName,
            style: GoogleFonts.montserrat(
              color: _teal,
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Ingressos selecionados',
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white : _gray,
              fontSize: 15,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 12),
          ...items.map((item) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      '${item.quantity}x ${item.ticketType.name}',
                      style: GoogleFonts.montserrat(
                        color: isDark ? Colors.white70 : _gray,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  Text(
                    formatCurrency(item.total),
                    style: GoogleFonts.montserrat(
                      color: isDark ? Colors.white : _gray,
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 10),
          const Divider(color: _teal),
          const SizedBox(height: 10),
          _buildPriceRow('Subtotal', _subtotal, isDark),
          const SizedBox(height: 8),
          _buildPriceRow('Taxa Conecta Paraná (10%)', _serviceFee, isDark),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [_blue, _green]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Text(
                  'Total',
                  style: GoogleFonts.montserrat(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const Spacer(),
                Text(
                  formatCurrency(_total),
                  style: GoogleFonts.montserrat(
                    color: Colors.white,
                    fontSize: 19,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPixCard(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : _lightBackground,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: _teal.withValues(alpha: 0.55)),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF103B40) : Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: _teal),
            ),
            child: const Icon(Icons.pix, color: _teal, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Forma de pagamento: Pix',
              style: GoogleFonts.montserrat(
                color: isDark ? Colors.white : _gray,
                fontSize: 14,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMainButton(BuildContext context) {
    return InkWell(
      onTap: () => _goToPix(context),
      borderRadius: BorderRadius.circular(999),
      child: Container(
        width: double.infinity,
        height: 52,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [_blue, _green]),
          borderRadius: BorderRadius.circular(999),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.18),
              blurRadius: 8,
              offset: const Offset(2, 4),
            ),
          ],
        ),
        child: Text(
          'Gerar Pix',
          style: GoogleFonts.montserrat(
            color: Colors.white,
            fontSize: 15,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? _darkBackground : Colors.white,
      appBar: AppBar(
        backgroundColor: isDark ? _darkBackground : Colors.white,
        elevation: 0,
        iconTheme: IconThemeData(color: isDark ? Colors.white : _gray),
        title: Text(
          'Resumo da compra',
          style: GoogleFonts.montserrat(
            color: isDark ? Colors.white : _gray,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
        child: Column(
          children: [
            _buildSummaryCard(isDark),
            const SizedBox(height: 18),
            _buildPixCard(isDark),
            const SizedBox(height: 22),
            _buildMainButton(context),
          ],
        ),
      ),
    );
  }
}
