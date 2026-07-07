class TicketTypeMock {
  const TicketTypeMock({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.sector,
    required this.badge,
    required this.benefits,
  });

  final String id;
  final String name;
  final String description;
  final double price;
  final String sector;
  final String badge;
  final List<String> benefits;
}

class TicketCartItem {
  const TicketCartItem({required this.ticketType, required this.quantity});

  final TicketTypeMock ticketType;
  final int quantity;

  double get total => ticketType.price * quantity;
}

class TicketPixPaymentMock {
  const TicketPixPaymentMock({
    required this.id,
    required this.copyPasteCode,
    required this.qrCodeValue,
    required this.status,
    required this.total,
    this.qrCodeBase64,
    this.expiresAt,
    this.ticketIds = const [],
    this.isMock = true,
  });

  final String id;
  final String copyPasteCode;
  final String qrCodeValue;
  final String status;
  final double total;
  final String? qrCodeBase64;
  final DateTime? expiresAt;
  final List<String> ticketIds;
  final bool isMock;

  bool get hasQrCodeImage => qrCodeBase64 != null && qrCodeBase64!.isNotEmpty;
}

class UserTicketMock {
  const UserTicketMock({
    required this.id,
    required this.orderId,
    required this.eventName,
    required this.ticketName,
    required this.holderName,
    required this.qrCodeValue,
    required this.createdAt,
    required this.status,
  });

  final String id;
  final String orderId;
  final String eventName;
  final String ticketName;
  final String holderName;
  final String qrCodeValue;
  final DateTime createdAt;
  final String status;
}

class TicketMemoryStore {
  static final List<UserTicketMock> _tickets = [];

  static List<UserTicketMock> get tickets => List.unmodifiable(_tickets);

  static void addTickets(List<UserTicketMock> tickets) {
    _tickets.insertAll(0, tickets);
  }

  static bool get hasTickets => _tickets.isNotEmpty;
}

const int expoingaBackendEventId = 1;

const List<TicketTypeMock> expoingaTicketTypesMock = [
  TicketTypeMock(
    id: 'inteira',
    name: 'Entrada inteira',
    description: 'Acesso individual ao evento durante o dia selecionado.',
    price: 60.0,
    sector: 'Pista',
    badge: 'Mais vendido',
    benefits: [
      'Acesso à área geral',
      'Shows e exposições inclusos',
      'Entrada válida para uma pessoa',
    ],
  ),
  TicketTypeMock(
    id: 'meia',
    name: 'Meia entrada',
    description: 'Ingresso com desconto para estudantes, idosos e elegíveis.',
    price: 30.0,
    sector: 'Pista',
    badge: 'Popular',
    benefits: [
      'Acesso à área geral',
      'Necessário comprovar direito à meia',
      'Entrada válida para uma pessoa',
    ],
  ),
  TicketTypeMock(
    id: 'camarote',
    name: 'Camarote',
    description: 'Experiência premium com visão privilegiada do evento.',
    price: 150.0,
    sector: 'Premium',
    badge: 'Premium',
    benefits: [
      'Área exclusiva',
      'Melhor visão dos shows',
      'Entrada válida para uma pessoa',
    ],
  ),
];

String formatCurrency(double value) {
  return 'R\$ ${value.toStringAsFixed(2).replaceAll('.', ',')}';
}

double calculateSubtotal(List<TicketCartItem> items) {
  return items.fold<double>(0, (total, item) => total + item.total);
}

double calculateServiceFee(double subtotal) {
  return subtotal * 0.10;
}

double calculateOrderTotal(List<TicketCartItem> items) {
  final subtotal = calculateSubtotal(items);
  return subtotal + calculateServiceFee(subtotal);
}

List<UserTicketMock> generateUserTickets({
  required String eventName,
  required List<TicketCartItem> items,
  List<String> ticketIds = const [],
}) {
  final createdAt = DateTime.now();
  final orderId = 'PEDIDO-${createdAt.millisecondsSinceEpoch}';
  final tickets = <UserTicketMock>[];

  var sequence = 1;

  for (final item in items) {
    for (var index = 0; index < item.quantity; index++) {
      final backendTicketId = ticketIds.length >= sequence
          ? ticketIds[sequence - 1]
          : null;

      final ticketId =
          backendTicketId ?? '$orderId-${sequence.toString().padLeft(2, '0')}';

      tickets.add(
        UserTicketMock(
          id: ticketId,
          orderId: orderId,
          eventName: eventName,
          ticketName: item.ticketType.name,
          holderName: 'Usuário Conecta Paraná',
          qrCodeValue: 'TICKET:$ticketId:${item.ticketType.id}',
          createdAt: createdAt,
          status: 'Ativo',
        ),
      );

      sequence++;
    }
  }

  return tickets;
}
