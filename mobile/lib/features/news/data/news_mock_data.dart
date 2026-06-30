import 'package:conectaparana/features/home/data/home_mock_data.dart';

class NewsMock {
  const NewsMock({
    required this.title,
    required this.description,
    required this.imagePath,
    required this.publicationInfo,
    required this.sourceUrl,
  });

  final String title;
  final String description;
  final String imagePath;
  final String publicationInfo;
  final String sourceUrl;

  factory NewsMock.fromJson(Map<String, dynamic> json) {
    return NewsMock(
      title: _readString(json, ['title']),
      description: _readString(json, ['description', 'summary']),
      imagePath: _readString(json, ['imagePath', 'imageUrl', 'image']),
      publicationInfo: _readString(json, [
        'publicationInfo',
        'publishedAt',
        'date',
      ]),
      sourceUrl: _readString(json, ['sourceUrl', 'url', 'link']),
    );
  }

  static String _readString(Map<String, dynamic> json, List<String> keys) {
    for (final key in keys) {
      final value = json[key];

      if (value is String && value.trim().isNotEmpty) {
        return value;
      }
    }

    return '';
  }
}

final newsMock = [
  NewsMock(
    title: homeNewsMock[0].title,
    description: homeNewsMock[0].description,
    imagePath: homeNewsMock[0].imagePath,
    publicationInfo: 'G1 Paraná • Maringá',
    sourceUrl:
        'https://g1.globo.com/pr/norte-noroeste/videos-meio-dia-parana-maringa/video/cachorro-e-tucano-sao-adotados-e-viram-mascotes-da-guarda-municipal-de-maringa-14673112.ghtml',
  ),
  NewsMock(
    title: homeNewsMock[1].title,
    description: homeNewsMock[1].description,
    imagePath: homeNewsMock[1].imagePath,
    publicationInfo: 'G1 Paraná • Maringá',
    sourceUrl:
        'https://g1.globo.com/pr/norte-noroeste/videos-meio-dia-parana-maringa/video/parana-junino-abre-a-o-calendario-de-festas-de-graca-no-estado-14678684.ghtml',
  ),
  NewsMock(
    title: homeNewsMock[2].title,
    description: homeNewsMock[2].description,
    imagePath: homeNewsMock[2].imagePath,
    publicationInfo: 'G1 Paraná • Maringá',
    sourceUrl:
        'https://g1.globo.com/pr/norte-noroeste/videos-meio-dia-parana-maringa/video/campeao-de-infracoes-circulava-com-267-multas-em-maringa-14653161.ghtml',
  ),
];
