class EventMock {
  const EventMock({
    required this.title,
    required this.imagePath,
    required this.location,
    required this.date,
    required this.description,
  });

  final String title;
  final String imagePath;
  final String location;
  final String date;
  final String description;
}

const eventsMock = [
  EventMock(
    title: 'Expoingá',
    imagePath: 'assets/images/expoinga.png',
    location: 'Parque Internacional de Exposições',
    date: '7 a 17 de maio',
    description:
        'Uma das maiores feiras agropecuárias, industriais e comerciais da região, com shows, exposições e atrações para toda a família.',
  ),
  EventMock(
    title: 'Festival Nipo-Brasileiro',
    imagePath: 'assets/images/festival_nipo.png',
    location: 'ACEMA',
    date: 'Agosto de 2026',
    description:
        'Evento cultural com gastronomia, apresentações artísticas e celebração da cultura nipo-brasileira em Maringá.',
  ),
  EventMock(
    title: 'Maringá Coffee Festival',
    imagePath: 'assets/images/maringa_coffee_festival.png',
    location: 'Cafeterias participantes',
    date: 'Em breve',
    description:
        'Festival gastronômico com menus especiais em cafeterias participantes da cidade.',
  ),
  EventMock(
    title: 'Paraná Junino',
    imagePath: 'assets/images/parana_junino.png',
    location: 'Diversos locais em Maringá',
    date: 'Junho de 2026',
    description:
        'Programação junina com comidas típicas, música, dança e atrações culturais.',
  ),
];
