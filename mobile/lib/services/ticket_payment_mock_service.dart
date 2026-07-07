import 'package:conectaparana/features/tickets/data/ticket_mock_data.dart';

class TicketPaymentMockService {
  Future<TicketPixPaymentMock> createPixPayment({
    required String eventName,
    required List<TicketCartItem> items,
    required double subtotal,
    required double serviceFee,
    required double total,
  }) async {
    await Future.delayed(const Duration(seconds: 1));

    final paymentId = 'PAY-${DateTime.now().millisecondsSinceEpoch}';
    final cents = (total * 100).round();

    final copyPasteCode = 'PIX-MOCK-CONECTA-PARANA-$paymentId-VALOR-$cents';

    return TicketPixPaymentMock(
      id: paymentId,
      copyPasteCode: copyPasteCode,
      qrCodeValue: copyPasteCode,
      status: 'pending',
      total: total,
    );
  }

  Future<bool> simulatePaymentApproved(String paymentId) async {
    await Future.delayed(const Duration(milliseconds: 600));
    return paymentId.isNotEmpty;
  }
}
