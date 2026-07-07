import 'dart:convert';

import 'package:conectaparana/core/config/environment.dart';
import 'package:conectaparana/features/tickets/data/ticket_mock_data.dart';
import 'package:conectaparana/services/auth_service.dart';
import 'package:conectaparana/services/ticket_payment_mock_service.dart';
import 'package:http/http.dart' as http;

class TicketPaymentException implements Exception {
  TicketPaymentException(this.message);

  final String message;

  @override
  String toString() => message;
}

class TicketPaymentService {
  TicketPaymentService({this.useBackendCheckout = false});

  final bool useBackendCheckout;

  final AuthService _authService = const AuthService();
  final TicketPaymentMockService _mockService = TicketPaymentMockService();

  Future<TicketPixPaymentMock> createPixPayment({
    required String eventName,
    required List<TicketCartItem> items,
    required double subtotal,
    required double serviceFee,
    required double total,
  }) async {
    if (!useBackendCheckout) {
      return _mockService.createPixPayment(
        eventName: eventName,
        items: items,
        subtotal: subtotal,
        serviceFee: serviceFee,
        total: total,
      );
    }

    return _createBackendCheckout(
      eventName: eventName,
      items: items,
      subtotal: subtotal,
      total: total,
    );
  }

  Future<bool> simulatePaymentApproved(String paymentId) {
    return _mockService.simulatePaymentApproved(paymentId);
  }

  Future<TicketPixPaymentMock> _createBackendCheckout({
    required String eventName,
    required List<TicketCartItem> items,
    required double subtotal,
    required double total,
  }) async {
    final eventId = _resolveBackendEventId(eventName);

    final uri = Uri.parse(
      '${Environment.apiBaseUrl}/payments/tickets/checkout',
    );

    final response = await _postAuthorized(
      uri: uri,
      body: {
        'eventId': eventId,
        'items': _buildCheckoutItems(
          items: items,
          subtotal: subtotal,
          total: total,
        ),
      },
    );

    return _parsePaymentResponse(response.body, total: total);
  }

  int _resolveBackendEventId(String eventName) {
    final normalizedEventName = _normalizeEventName(eventName);

    if (normalizedEventName.contains('expoinga')) {
      return expoingaBackendEventId;
    }

    throw TicketPaymentException(
      'Esse evento ainda não possui venda de ingressos integrada.',
    );
  }

  List<Map<String, dynamic>> _buildCheckoutItems({
    required List<TicketCartItem> items,
    required double subtotal,
    required double total,
  }) {
    final priceMultiplier = subtotal <= 0 ? 1.0 : total / subtotal;

    return items.map((item) {
      return {
        'type': _mapTicketType(item.ticketType),
        'quantity': item.quantity,
        'unitPrice': _roundCurrency(item.ticketType.price * priceMultiplier),
      };
    }).toList();
  }

  String _mapTicketType(TicketTypeMock ticketType) {
    final id = ticketType.id.toLowerCase();
    final sector = ticketType.sector.toLowerCase();

    if (id.contains('camarote') || sector.contains('premium')) {
      return 'CAMAROTE';
    }

    return 'PISTA';
  }

  double _roundCurrency(double value) {
    return double.parse(value.toStringAsFixed(2));
  }

  Future<http.Response> _postAuthorized({
    required Uri uri,
    required Map<String, dynamic> body,
  }) async {
    final accessToken = await _authService.getAccessToken();

    if (accessToken == null || accessToken.isEmpty) {
      throw TicketPaymentException(
        'Usuário não autenticado. Faça login para gerar o pagamento.',
      );
    }

    final response = await http
        .post(
          uri,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $accessToken',
          },
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 20));

    if (response.statusCode == 200 || response.statusCode == 201) {
      return response;
    }

    throw TicketPaymentException(
      _extractMessage(response.body) ??
          'Não foi possível gerar o Pix (${response.statusCode}).',
    );
  }

  TicketPixPaymentMock _parsePaymentResponse(
    String body, {
    required double total,
  }) {
    final decoded = jsonDecode(body);

    if (decoded is! Map<String, dynamic>) {
      throw TicketPaymentException('Resposta de pagamento inválida.');
    }

    final data = decoded['data'];
    final paymentData = data is Map<String, dynamic> ? data : decoded;

    final paymentId = paymentData['paymentId'] ?? paymentData['id'];
    final brCode = paymentData['brCode'];
    final brCodeBase64 = paymentData['brCodeBase64'];
    final expiresAt = paymentData['expiresAt'];
    final status = paymentData['status'];
    final rawTicketIds = paymentData['ticketIds'];

    if (paymentId is! String || brCode is! String) {
      throw TicketPaymentException('Resposta do Pix incompleta.');
    }

    final ticketIds = rawTicketIds is List
        ? rawTicketIds.whereType<String>().toList()
        : <String>[];

    return TicketPixPaymentMock(
      id: paymentId,
      copyPasteCode: brCode,
      qrCodeValue: brCode,
      status: status is String ? status : 'pending',
      total: total,
      qrCodeBase64: brCodeBase64 is String ? brCodeBase64 : null,
      expiresAt: expiresAt is String ? DateTime.tryParse(expiresAt) : null,
      ticketIds: ticketIds,
      isMock: false,
    );
  }

  String _normalizeEventName(String value) {
    return value
        .toLowerCase()
        .replaceAll('á', 'a')
        .replaceAll('à', 'a')
        .replaceAll('ã', 'a')
        .replaceAll('â', 'a')
        .replaceAll('é', 'e')
        .replaceAll('ê', 'e')
        .replaceAll('í', 'i')
        .replaceAll('ó', 'o')
        .replaceAll('ô', 'o')
        .replaceAll('õ', 'o')
        .replaceAll('ú', 'u')
        .replaceAll('ç', 'c')
        .replaceAll('2026', '')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }

  String? _extractMessage(String body) {
    try {
      final decoded = jsonDecode(body);

      if (decoded is Map<String, dynamic> && decoded['message'] != null) {
        final message = decoded['message'];

        if (message is String) return message;

        if (message is List) {
          return message.whereType<String>().join(', ');
        }
      }

      if (decoded is Map<String, dynamic> && decoded['error'] != null) {
        final error = decoded['error'];
        if (error is String) return error;
      }
    } catch (_) {
      return null;
    }

    return null;
  }
}
