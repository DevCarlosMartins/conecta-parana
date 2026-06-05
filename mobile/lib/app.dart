import 'package:conectaparana/core/theme/app_theme.dart';
import 'package:conectaparana/features/auth/screens/login_screen.dart';
import 'package:conectaparana/features/auth/screens/register_screen.dart';
import 'package:conectaparana/shared/widgets/placeholder_screen.dart';
import 'package:flutter/material.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Conecta Paraná',
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,
      initialRoute: '/login',
      routes: {
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/home': (context) => const PlaceholderScreen(),
      },
    );
  }
}
