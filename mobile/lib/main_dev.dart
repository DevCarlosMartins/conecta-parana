import 'package:conectaparana/app.dart';
import 'package:conectaparana/core/config/environment.dart';
import 'package:conectaparana/providers/app_theme_provider.dart';
import 'package:conectaparana/providers/auth_provider.dart';
import 'package:conectaparana/providers/cities_provider.dart';
import 'package:conectaparana/providers/home_content_provider.dart';
import 'package:conectaparana/providers/profile_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

void main() {
  Environment.initialize(Flavor.dev);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CitiesProvider()),
        ChangeNotifierProvider(create: (_) => HomeContentProvider()),
        ChangeNotifierProvider(create: (_) => ProfileProvider()),
      ],
      child: const App(),
    ),
  );
}
