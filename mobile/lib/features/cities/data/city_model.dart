class CityModel {
  const CityModel({required this.id, required this.name, required this.state});

  final int id;
  final String name;
  final String state;

  factory CityModel.fromJson(Map<String, dynamic> json) {
    return CityModel(
      id: json['id'] is int ? json['id'] as int : int.parse('${json['id']}'),
      name: json['name']?.toString() ?? '',
      state: json['state']?.toString() ?? '',
    );
  }

  String get displayName {
    if (state.isEmpty) return name;
    return '$name - $state';
  }
}
