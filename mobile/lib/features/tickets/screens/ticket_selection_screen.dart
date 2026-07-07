import 'package:conectaparana/features/tickets/data/ticket_mock_data.dart';
import 'package:conectaparana/features/tickets/screens/ticket_checkout_screen.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class TicketSelectionScreen extends StatefulWidget {
  const TicketSelectionScreen({
    super.key,
    required this.eventName,
    required this.imagePath,
    required this.location,
    required this.date,
  });

  final String eventName;
  final String imagePath;
  final String location;
  final String date;

  @override
  State<TicketSelectionScreen> createState() => _TicketSelectionScreenState();
}

class _TicketSelectionScreenState extends State<TicketSelectionScreen> {
  final Map<String, int> _quantities = {
    for (final ticket in expoingaTicketTypesMock) ticket.id: 0,
  };

  static const Color _teal = Color(0xFF146E77);
  static const Color _blue = Color(0xFF264CA9);
  static const Color _green = Color(0xFF029144);
  static const Color _gray = Color(0xFF5A5A5A);
  static const Color _lightBackground = Color(0xFFEDEEFF);
  static const Color _darkBackground = Color(0xFF121212);
  static const Color _darkCard = Color(0xFF1E1E1E);

  List<TicketCartItem> get _selectedItems {
    return expoingaTicketTypesMock
        .map((ticket) {
          return TicketCartItem(
            ticketType: ticket,
            quantity: _quantities[ticket.id] ?? 0,
          );
        })
        .where((item) => item.quantity > 0)
        .toList();
  }

  int get _totalQuantity {
    return _quantities.values.fold<int>(0, (total, quantity) {
      return total + quantity;
    });
  }

  double get _subtotal => calculateSubtotal(_selectedItems);

  void _increaseQuantity(TicketTypeMock ticket) {
    setState(() {
      _quantities[ticket.id] = (_quantities[ticket.id] ?? 0) + 1;
    });
  }

  void _decreaseQuantity(TicketTypeMock ticket) {
    final currentQuantity = _quantities[ticket.id] ?? 0;

    if (currentQuantity == 0) return;

    setState(() {
      _quantities[ticket.id] = currentQuantity - 1;
    });
  }

  void _goToCheckout() {
    if (_selectedItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Selecione pelo menos um ingresso para continuar.'),
        ),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (context) => TicketCheckoutScreen(
          eventName: widget.eventName,
          imagePath: widget.imagePath,
          location: widget.location,
          date: widget.date,
          items: _selectedItems,
        ),
      ),
    );
  }

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
        'Ingressos',
        style: GoogleFonts.montserrat(
          fontSize: 30,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }

  Widget _buildEventSummaryCard(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? _darkCard : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: _teal),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.12),
            blurRadius: 10,
            offset: const Offset(2, 5),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              Image.asset(
                widget.imagePath,
                width: double.infinity,
                height: 165,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: double.infinity,
                    height: 165,
                    color: isDark ? const Color(0xFF2A2A2A) : _lightBackground,
                    child: const Icon(
                      Icons.image_not_supported_outlined,
                      color: _teal,
                      size: 42,
                    ),
                  );
                },
              ),
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.65),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                left: 16,
                right: 16,
                bottom: 14,
                child: Text(
                  widget.eventName,
                  style: GoogleFonts.montserrat(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
            child: Column(
              children: [
                _buildInfoRow(
                  icon: Icons.location_on_outlined,
                  text: widget.location,
                  isDark: isDark,
                ),
                const SizedBox(height: 8),
                _buildInfoRow(
                  icon: Icons.calendar_today_outlined,
                  text: widget.date,
                  isDark: isDark,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String text,
    required bool isDark,
  }) {
    return Row(
      children: [
        Icon(icon, color: _teal, size: 18),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white70 : _gray,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTicketCard(TicketTypeMock ticket, bool isDark) {
    final quantity = _quantities[ticket.id] ?? 0;

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: quantity > 0 ? _teal : _teal.withValues(alpha: 0.35),
          width: quantity > 0 ? 1.6 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.22 : 0.08),
            blurRadius: 8,
            offset: const Offset(2, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [_blue, _green]),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  ticket.badge,
                  style: GoogleFonts.montserrat(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                ticket.sector,
                style: GoogleFonts.montserrat(
                  color: _teal,
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            ticket.name,
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white : _gray,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            ticket.description,
            style: GoogleFonts.montserrat(
              color: isDark ? Colors.white70 : _gray,
              fontSize: 13,
              height: 1.35,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 12),
          ...ticket.benefits.map((benefit) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 5),
              child: Row(
                children: [
                  const Icon(
                    Icons.check_circle_outline,
                    color: _teal,
                    size: 16,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      benefit,
                      style: GoogleFonts.montserrat(
                        color: isDark ? Colors.white70 : _gray,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 14),
          Row(
            children: [
              Text(
                formatCurrency(ticket.price),
                style: GoogleFonts.montserrat(
                  color: _teal,
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const Spacer(),
              _buildQuantityButton(
                icon: Icons.remove,
                onTap: () => _decreaseQuantity(ticket),
                enabled: quantity > 0,
              ),
              SizedBox(
                width: 42,
                child: Text(
                  '$quantity',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.montserrat(
                    color: isDark ? Colors.white : _gray,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              _buildQuantityButton(
                icon: Icons.add,
                onTap: () => _increaseQuantity(ticket),
                enabled: true,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuantityButton({
    required IconData icon,
    required VoidCallback onTap,
    required bool enabled,
  }) {
    return InkWell(
      onTap: enabled ? onTap : null,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        width: 34,
        height: 34,
        decoration: BoxDecoration(
          color: enabled ? _teal : Colors.grey.withValues(alpha: 0.25),
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          color: enabled ? Colors.white : Colors.grey,
          size: 18,
        ),
      ),
    );
  }

  Widget _buildBottomBar(bool isDark) {
    final hasItems = _selectedItems.isNotEmpty;

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 14, 20, 18),
      decoration: BoxDecoration(
        color: isDark ? _darkCard : Colors.white,
        border: const Border(top: BorderSide(color: _teal)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 10,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '$_totalQuantity ingresso(s)',
                    style: GoogleFonts.montserrat(
                      color: isDark ? Colors.white70 : _gray,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    formatCurrency(_subtotal),
                    style: GoogleFonts.montserrat(
                      color: _teal,
                      fontSize: 19,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
            InkWell(
              onTap: hasItems ? _goToCheckout : null,
              borderRadius: BorderRadius.circular(999),
              child: Container(
                height: 48,
                padding: const EdgeInsets.symmetric(horizontal: 22),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  gradient: hasItems
                      ? const LinearGradient(colors: [_blue, _green])
                      : null,
                  color: hasItems ? null : Colors.grey.withValues(alpha: 0.35),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  'Prosseguir',
                  style: GoogleFonts.montserrat(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
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
          'Comprar ingresso',
          style: GoogleFonts.montserrat(
            color: isDark ? Colors.white : _gray,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomBar(isDark),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: _buildGradientTitle()),
            const SizedBox(height: 18),
            _buildEventSummaryCard(isDark),
            const SizedBox(height: 24),
            Text(
              'Escolha seus ingressos',
              style: GoogleFonts.montserrat(
                color: isDark ? Colors.white : _gray,
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Selecione a quantidade desejada para continuar para o resumo.',
              style: GoogleFonts.montserrat(
                color: isDark ? Colors.white70 : _gray,
                fontSize: 13,
                height: 1.35,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 16),
            ...expoingaTicketTypesMock.map((ticket) {
              return _buildTicketCard(ticket, isDark);
            }),
          ],
        ),
      ),
    );
  }
}
