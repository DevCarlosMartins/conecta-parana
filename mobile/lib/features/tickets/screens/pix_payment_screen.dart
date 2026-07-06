import 'package:conectaparana/features/tickets/data/ticket_mock_data.dart';
import 'package:conectaparana/features/tickets/screens/ticket_success_screen.dart';
import 'package:conectaparana/services/ticket_payment_mock_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

class PixPaymentScreen extends StatefulWidget {
  const PixPaymentScreen({
    super.key,
    required this.eventName,
    required this.items,
    required this.subtotal,
    required this.serviceFee,
    required this.total,
  });

  final String eventName;
  final List<TicketCartItem> items;
  final double subtotal;
  final double serviceFee;
  final double total;

  @override
  State<PixPaymentScreen> createState() => _PixPaymentScreenState();
}

class _PixPaymentScreenState extends State<PixPaymentScreen> {
  final TicketPaymentMockService _paymentService = TicketPaymentMockService();

  TicketPixPaymentMock? _payment;
  bool _isLoading = true;

  static const Color _teal = Color(0xFF146E77);
  static const Color _blue = Color(0xFF264CA9);
  static const Color _green = Color(0xFF029144);
  static const Color _gray = Color(0xFF5A5A5A);
  static const Color _lightBackground = Color(0xFFEDEEFF);
  static const Color _darkBackground = Color(0xFF121212);
  static const Color _darkCard = Color(0xFF1E1E1E);

  @override
  void initState() {
    super.initState();
    _createPixPayment();
  }

  Future<void> _createPixPayment() async {
    final payment = await _paymentService.createPixPayment(
      eventName: widget.eventName,
      items: widget.items,
      subtotal: widget.subtotal,
      serviceFee: widget.serviceFee,
      total: widget.total,
    );

    if (!mounted) return;

    setState(() {
      _payment = payment;
      _isLoading = false;
    });
  }

  Future<void> _copyPixCode() async {
    final payment = _payment;

    if (payment == null) return;

    await Clipboard.setData(ClipboardData(text: payment.copyPasteCode));

    if (!mounted) return;

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Código Pix copiado.')));
  }

  Future<void> _simulatePaymentApproved() async {
    final payment = _payment;

    if (payment == null) return;

    final approved = await _paymentService.simulatePaymentApproved(payment.id);

    if (!mounted || !approved) return;

    final tickets = generateUserTickets(
      eventName: widget.eventName,
      items: widget.items,
    );

    TicketMemoryStore.addTickets(tickets);

    Navigator.pushReplacement(
      context,
      MaterialPageRoute<void>(
        builder: (context) =>
            TicketSuccessScreen(eventName: widget.eventName, tickets: tickets),
      ),
    );
  }

  Widget _buildLoadingState(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(26),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: _teal),
      ),
      child: Column(
        children: [
          const CircularProgressIndicator(color: _teal),
          const SizedBox(height: 18),
          Text(
            'Gerando Pix...',
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white : _gray,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Preparando o pagamento demonstrativo da compra.',
            textAlign: TextAlign.center,
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white70 : _gray,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPixContent(bool isDark) {
    final payment = _payment;

    if (payment == null) {
      return _buildLoadingState(isDark);
    }

    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: isDark ? _darkCard : Colors.white,
            borderRadius: BorderRadius.circular(24),
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
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [_blue, _green]),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.pix, color: Colors.white, size: 34),
                    const SizedBox(height: 8),
                    Text(
                      'Pagamento Pix',
                      style: GoogleFonts.montserrat(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      formatCurrency(payment.total),
                      style: GoogleFonts.montserrat(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              _FakeQrCode(value: payment.qrCodeValue),
              const SizedBox(height: 16),
              Text(
                'Pix copia e cola',
                style: GoogleFonts.montserrat(
                  color: _teal,
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF2A2A2A) : _lightBackground,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  payment.copyPasteCode,
                  maxLines: 4,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.montserrat(
                    color: isDark ? Colors.white70 : _gray,
                    fontSize: 11,
                    height: 1.35,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Fluxo mockado para demonstração.',
                textAlign: TextAlign.center,
                style: GoogleFonts.montserrat(
                  color: isDark ? Colors.white70 : _gray,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        _buildButton(
          label: 'Copiar código Pix',
          icon: Icons.copy,
          onTap: _copyPixCode,
          outlined: true,
        ),
        const SizedBox(height: 12),
        _buildButton(
          label: 'Simular pagamento aprovado',
          icon: Icons.check_circle_outline,
          onTap: _simulatePaymentApproved,
          outlined: false,
        ),
      ],
    );
  }

  Widget _buildButton({
    required String label,
    required IconData icon,
    required VoidCallback onTap,
    required bool outlined,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        width: double.infinity,
        height: 50,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: outlined
              ? null
              : const LinearGradient(colors: [_blue, _green]),
          borderRadius: BorderRadius.circular(999),
          border: outlined ? Border.all(color: _teal) : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: outlined ? _teal : Colors.white, size: 20),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.montserrat(
                color: outlined ? _teal : Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
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
          'Pagamento',
          style: GoogleFonts.montserrat(
            color: isDark ? Colors.white : _gray,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        child: _isLoading
            ? _buildLoadingState(isDark)
            : _buildPixContent(isDark),
      ),
    );
  }
}

class _FakeQrCode extends StatelessWidget {
  const _FakeQrCode({required this.value});

  final String value;

  static const Color _teal = Color(0xFF146E77);

  bool _isFilled(int row, int column) {
    final seed = value.codeUnits.fold<int>(0, (total, code) => total + code);
    final result = (row * 31 + column * 17 + seed) % 5;

    return result == 0 || result == 2;
  }

  bool _isFinderPattern(int row, int column, int startRow, int startColumn) {
    final insideRow = row >= startRow && row < startRow + 7;
    final insideColumn = column >= startColumn && column < startColumn + 7;

    if (!insideRow || !insideColumn) return false;

    final localRow = row - startRow;
    final localColumn = column - startColumn;

    final isBorder =
        localRow == 0 || localRow == 6 || localColumn == 0 || localColumn == 6;
    final isCenter =
        localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4;

    return isBorder || isCenter;
  }

  @override
  Widget build(BuildContext context) {
    const size = 21;

    return Container(
      width: 210,
      height: 210,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: _teal, width: 1.4),
      ),
      child: GridView.builder(
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
              _isFinderPattern(row, column, 0, 14) ||
              _isFinderPattern(row, column, 14, 0) ||
              _isFilled(row, column);

          return Container(
            margin: const EdgeInsets.all(1),
            decoration: BoxDecoration(
              color: filled ? Colors.black : Colors.white,
              borderRadius: BorderRadius.circular(1),
            ),
          );
        },
      ),
    );
  }
}
