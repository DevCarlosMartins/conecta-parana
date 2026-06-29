class HomeEventMock {
  const HomeEventMock({
    required this.title,
    required this.imagePath,
    required this.location,
  });

  final String title;
  final String imagePath;
  final String location;
}

class HomeNewsMock {
  const HomeNewsMock({
    required this.title,
    required this.imagePath,
    required this.description,
  });

  final String title;
  final String imagePath;
  final String description;
}

const homeEventsMock = [
  HomeEventMock(
    title: 'Festival Nipo-Brasileiro 2026',
    imagePath: 'assets/images/festival_nipo.png',
    location: 'ACEMA - Associação Cultural e Esportiva de Maringá',
  ),
  HomeEventMock(
    title: 'Expoingá',
    imagePath: 'assets/images/expoinga.png',
    location: 'Parque Internacional de Exposições Francisco Feio Ribeiro',
  ),
  HomeEventMock(
    title: 'Maringá Coffee Festival',
    imagePath: 'assets/images/maringa_coffee_festival.png',
    location: 'Cafeterias participantes',
  ),
];

const homeNewsMock = [
  HomeNewsMock(
    title:
        'Cachorro e tucano são adotados e viram mascotes da Guarda Municipal de Maringá',
    imagePath: 'assets/images/mascotes_guarda_municipal.png',
    description:
        'Nick e Tuco foram resgatados feridos e hoje convivem com os servidores.',
  ),
  HomeNewsMock(
    title: 'Paraná Junino abre a o calendário de festas de graça no estado',
    imagePath: 'assets/images/parana_junino.png',
    description:
        'Evento do Sesc e da RPC tem comidas típicas e atrações para a família.',
  ),
  HomeNewsMock(
    title: '"Campeão" de infrações circulava com 267 multas em Maringá',
    imagePath: 'assets/images/campeao_multas.png',
    description:
        'Fiorino acumulou autuações em 13 anos e tinha restrição judicial ativa.',
  ),
];

class HomeComunicadoMock {
  const HomeComunicadoMock({required this.title, required this.description});

  final String title;
  final String description;
}

const homeComunicadosMock = [
  HomeComunicadoMock(
    title: 'COMUNICADO URGENTE!',
    description:
        'Cratera se abre em cruzamento entre Av. Paraná e Av. Horácio Raccanello.',
  ),
];
