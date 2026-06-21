import 'package:flutter/material.dart';

class MapPointMock {
  const MapPointMock({
    required this.title,
    required this.category,
    required this.description,
    required this.address,
    required this.date,
    required this.imagePath,
    required this.distanceLabel,
    required this.markerTop,
    required this.markerLeft,
    required this.markerColor,
    required this.icon,
  });

  final String title;
  final String category;
  final String description;
  final String address;
  final String date;
  final String imagePath;
  final String distanceLabel;

  final double markerTop;
  final double markerLeft;

  final Color markerColor;
  final IconData icon;
}

const mapPointsMock = [
  MapPointMock(
    title: 'Expoingá',
    category: 'Evento',
    description:
        'Feira agropecuária com shows, exposições, gastronomia e atrações para toda a família.',
    address:
        'Parque Internacional de Exposições Francisco Feio Ribeiro, Maringá - PR',
    date: '7 a 17 de Maio',
    imagePath: 'assets/images/expoinga.jpg',
    distanceLabel: '2,5 km de você',
    markerTop: 0.28,
    markerLeft: 0.30,
    markerColor: Color(0xFF264CA9),
    icon: Icons.celebration_outlined,
  ),
  MapPointMock(
    title: 'Festival Nipo-Brasileiro de Maringá',
    category: 'Cultura',
    description:
        'Evento cultural com gastronimia, apresentações artísticas e atividades para toda a família, celebrando a cultura japonesa em Maringá.',
    address: 'ACEMA - Associação Cultural e Esportiva Maringá, Maringá - PR',
    date: '8 a 16 de Agosto',
    imagePath: 'assets/images/festival_nipo.jpg',
    distanceLabel: '3,2 km de você',
    markerTop: 0.48,
    markerLeft: 0.68,
    markerColor: Color(0xFF029144),
    icon: Icons.flag_outlined,
  ),
  MapPointMock(
    title: 'Paraná Junino',
    category: 'Evento público',
    description:
        'Programação junina com comidas típicas, música, dança e atividades para toda a família.',
    address: 'SESC - Maringá - PR',
    date: '6 de Junho',
    imagePath: 'assets/images/parana_junino.jpg',
    distanceLabel: '4,0 km de você',
    markerTop: 0.72,
    markerLeft: 0.74,
    markerColor: Color(0xFFFF8A00),
    icon: Icons.local_activity_outlined,
  ),
];
