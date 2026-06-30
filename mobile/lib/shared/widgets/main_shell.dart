import 'package:conectaparana/features/map/screens/map_screen.dart';
import 'package:conectaparana/features/profile/screens/profile_screen.dart';
import 'package:conectaparana/features/news/screens/news_screen.dart';
import 'package:conectaparana/providers/auth_provider.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:conectaparana/features/home/screens/home_screen.dart';
import 'package:conectaparana/features/events/screens/events_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;
  String _selectedCity = 'Maringá';

  static const Color _teal = Color(0xFF146E77);
  static const Color _gray = Color(0xFF5A5A5A);
  static const Color _lightBackground = Color(0xFFEDEEFF);

  static const List<String> _availableCities = [
    'Maringá',
    'Paiçandu',
    'Sarandi',
  ];

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _ensureCanAccessApp();
    });
  }

  Future<void> _ensureCanAccessApp() async {
    final authProvider = context.read<AuthProvider>();

    await authProvider.checkAuthentication();

    if (!mounted) return;

    if (!authProvider.canAccessApp) {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  void _openCitySelector() {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;

        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Escolha uma cidade',
                style: GoogleFonts.montserrat(
                  color: isDark ? Colors.white : _gray,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),

              const SizedBox(height: 4),

              Text(
                'No momento, apenas Maringá está disponível.',
                textAlign: TextAlign.center,
                style: GoogleFonts.montserrat(
                  color: isDark ? Colors.white70 : _gray,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),

              const SizedBox(height: 12),

              ..._availableCities.map((city) {
                final isSelected = city == _selectedCity;
                final isAvailable = city == 'Maringá';

                return ListTile(
                  leading: Icon(
                    isSelected
                        ? Icons.radio_button_checked
                        : Icons.radio_button_off,
                    color: _teal,
                  ),
                  title: Text(
                    city,
                    style: GoogleFonts.montserrat(fontWeight: FontWeight.w700),
                  ),
                  subtitle: Text(
                    isAvailable ? 'Disponível' : 'Em breve',
                    style: GoogleFonts.montserrat(
                      color: isAvailable ? _teal : Colors.orange,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  onTap: () {
                    setState(() {
                      _selectedCity = city;
                    });

                    Navigator.pop(context);

                    if (!isAvailable) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('$city estará disponível em breve.'),
                        ),
                      );
                    }
                  },
                );
              }),
            ],
          ),
        );
      },
    );
  }

  void _openSearch() {
    showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(
            'Pesquisar',
            style: GoogleFonts.montserrat(fontWeight: FontWeight.w800),
          ),
          content: TextField(
            autofocus: true,
            decoration: InputDecoration(
              hintText: 'Digite o que deseja buscar...',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Fechar'),
            ),
          ],
        );
      },
    );
  }

  void _openNotifications() {
    Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (context) => const _NotificationsPlaceholderPage(),
      ),
    );
  }

  List<Widget> _buildPages() {
    final cityAvailable = _selectedCity == 'Maringá';

    return [
      HomeScreen(
        cityName: _selectedCity,
        cityAvailable: cityAvailable,
        onCityTap: _openCitySelector,
        onSearchTap: _openSearch,
        onNotificationTap: _openNotifications,
      ),
      NewsScreen(
        cityName: _selectedCity,
        onCityTap: _openCitySelector,
        onSearchTap: _openSearch,
        onNotificationTap: _openNotifications,
      ),
      MapScreen(
        cityName: _selectedCity,
        cityAvailable: cityAvailable,
        onCityTap: _openCitySelector,
        onSearchTap: _openSearch,
        onNotificationTap: _openNotifications,
      ),
      EventsScreen(
        cityName: _selectedCity,
        cityAvailable: cityAvailable,
        onCityTap: _openCitySelector,
        onSearchTap: _openSearch,
        onNotificationTap: _openNotifications,
      ),
      ProfileScreen(
        cityName: _selectedCity,
        onCityTap: _openCitySelector,
        onSearchTap: _openSearch,
        onNotificationTap: _openNotifications,
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final pages = _buildPages();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final navBackground = isDark ? const Color(0xFF1E1E1E) : _lightBackground;
    final inactiveColor = isDark ? Colors.white70 : _gray;

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: pages),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: navBackground,
          border: const Border(top: BorderSide(color: _teal, width: 1.5)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: navBackground,
          selectedItemColor: _teal,
          unselectedItemColor: inactiveColor,
          showSelectedLabels: false,
          showUnselectedLabels: false,
          selectedLabelStyle: GoogleFonts.montserrat(
            fontWeight: FontWeight.w700,
          ),
          unselectedLabelStyle: GoogleFonts.montserrat(),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.chat_bubble_outline),
              activeIcon: Icon(Icons.chat_bubble),
              label: 'Notícias',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.map_outlined),
              activeIcon: Icon(Icons.map),
              label: 'Mapa',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.calendar_today_outlined),
              activeIcon: Icon(Icons.calendar_today),
              label: 'Eventos',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Perfil',
            ),
          ],
        ),
      ),
    );
  }
}



class _NotificationsPlaceholderPage extends StatelessWidget {
  const _NotificationsPlaceholderPage();

  static const Color _teal = Color(0xFF146E77);
  static const Color _gray = Color(0xFF5A5A5A);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Notificações',
          style: GoogleFonts.montserrat(fontWeight: FontWeight.w800),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.notifications_none, color: _teal, size: 56),
              const SizedBox(height: 16),
              Text(
                'Nenhuma notificação por enquanto',
                textAlign: TextAlign.center,
                style: GoogleFonts.montserrat(
                  color: isDark ? Colors.white : _gray,
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Quando houver avisos importantes da prefeitura, eles aparecerão aqui.',
                textAlign: TextAlign.center,
                style: GoogleFonts.montserrat(
                  color: isDark ? Colors.white70 : _gray,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
