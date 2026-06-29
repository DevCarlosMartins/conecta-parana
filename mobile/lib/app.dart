import 'package:conectaparana/core/theme/app_theme.dart';
import 'package:conectaparana/features/auth/screens/login_screen.dart';
import 'package:conectaparana/features/auth/screens/register_screen.dart';
import 'package:conectaparana/providers/app_theme_provider.dart';
import 'package:conectaparana/shared/widgets/main_shell.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppThemeProvider>(
      builder: (context, appThemeProvider, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'Conecta Paraná',
          theme: AppTheme.light,
          darkTheme: AppTheme.dark,
          themeMode: appThemeProvider.themeMode,
          initialRoute: '/login',
          routes: {
            '/login': (context) => const LoginScreen(),
            '/register': (context) => const RegisterScreen(),
            '/home': (context) => const MainShell(),
          },
        );
      },
    );
  }
}
