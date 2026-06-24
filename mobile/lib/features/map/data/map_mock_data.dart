import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';

class MapPointMock {
  const MapPointMock({
    required this.title,
    required this.category,
    required this.description,
    required this.address,
    required this.date,
    required this.imagePath,
    required this.distanceLabel,
    required this.latitude,
    required this.longitude,
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

  final double latitude;
  final double longitude;

  final Color markerColor;
  final IconData icon;

  LatLng get position => LatLng(latitude, longitude);
}

const mapPointsMock = [
  MapPointMock(
    title: 'Expoingá',
    category: 'Evento',
    description:
        'Feira agropecuária com shows, exposições, gastronomia e atrações para toda a família.',
    address: 'Sociedade Rural de Maringá, Maringá - PR',
    date: '7 a 17 de Maio',
    imagePath: 'assets/images/expoinga_line.png',
    distanceLabel: '2,5 km de você',
    latitude: -23.42134,
    longitude: -51.90277,
    markerColor: Color(0xFF264CA9),
    icon: Icons.celebration_outlined,
  ),
  MapPointMock(
    title: 'Festival Nipo-Brasileiro de Maringá',
    category: 'Cultura',
    description:
        'Evento cultural com gastronomia, apresentações artísticas e atividades para toda a família, celebrando a cultura japonesa em Maringá.',
    address: 'ACEMA - Associação Cultural e Esportiva Maringá, Maringá - PR',
    date: '8 a 16 de Agosto',
    imagePath: 'assets/images/festival_nipo_show.png',
    distanceLabel: '3,2 km de você',
    latitude: -23.395327,
    longitude: -51.926239,
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
    imagePath: 'assets/images/parana_junino_promote.png',
    distanceLabel: '4,0 km de você',
    latitude: -23.411818,
    longitude: -51.939889,
    markerColor: Color(0xFFFF8A00),
    icon: Icons.local_activity_outlined,
  ),
];
