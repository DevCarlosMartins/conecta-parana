import 'package:conectaparana/app.dart';
import 'package:conectaparana/core/config/environment.dart';
import 'package:conectaparana/providers/auth_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

void main() {
  Environment.initialize(Flavor.dev);

  runApp(
    ChangeNotifierProvider(create: (_) => AuthProvider(), child: const App()),
  );
}
