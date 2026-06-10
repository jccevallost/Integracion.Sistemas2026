import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'https://integracion-sistemas2026.onrender.com/api/v1',
);

// ─── Paleta de colores ────────────────────────────────────────────────────────
const _kNavy   = Color(0xFF0D2137);
const _kBlue   = Color(0xFF1D4ED8);
const _kAmber  = Color(0xFFF59E0B);
const _kBg     = Color(0xFFEFF6FF);
const _kGreen  = Color(0xFF16A34A);
const _kOrange = Color(0xFFEA580C);
const _kRed    = Color(0xFFDC2626);

void main() => runApp(const VuelosMobileApp());

// ─── App ──────────────────────────────────────────────────────────────────────
class VuelosMobileApp extends StatelessWidget {
  const VuelosMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Vuelos',
      theme: _buildTheme(),
      home: const ShellScreen(),
    );
  }

  static ThemeData _buildTheme() {
    const outline        = Color(0xFFCBD5E1);
    const outlineVariant = Color(0xFFE2E8F0);

    final cs = ColorScheme.fromSeed(
      seedColor: _kBlue,
      brightness: Brightness.light,
    ).copyWith(
      primary: _kBlue,
      onPrimary: Colors.white,
      primaryContainer: const Color(0xFFDBEAFE),
      onPrimaryContainer: _kNavy,
      secondary: _kAmber,
      onSecondary: Colors.white,
      secondaryContainer: const Color(0xFFFEF3C7),
      onSecondaryContainer: const Color(0xFF92400E),
      surface: Colors.white,
      onSurface: const Color(0xFF1E293B),
      surfaceContainerHighest: const Color(0xFFF1F5F9),
      onSurfaceVariant: const Color(0xFF64748B),
      outline: outline,
      outlineVariant: outlineVariant,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: cs,
      scaffoldBackgroundColor: _kBg,
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: outlineVariant),
        ),
        color: Colors.white,
        margin: EdgeInsets.zero,
        surfaceTintColor: Colors.transparent,
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: outline),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: outline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: _kBlue, width: 2),
        ),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        labelStyle: const TextStyle(color: Color(0xFF64748B)),
        prefixIconColor: const Color(0xFF64748B),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: _kBlue,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, letterSpacing: 0.2),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          side: const BorderSide(color: _kBlue),
          foregroundColor: _kBlue,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        indicatorColor: const Color(0xFFDBEAFE),
        height: 64,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return TextStyle(
            color: selected ? _kBlue : const Color(0xFF94A3B8),
            fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
            fontSize: 11,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(
            color: states.contains(WidgetState.selected)
                ? _kBlue
                : const Color(0xFF94A3B8),
            size: 22,
          ),
        ),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        surfaceTintColor: Colors.transparent,
        elevation: 8,
      ),
      chipTheme: const ChipThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(8)),
        ),
        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 0),
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0xFFE2E8F0),
        thickness: 1,
        space: 1,
      ),
    );
  }
}

// ─── API Client ───────────────────────────────────────────────────────────────
class ApiClient {
  String? token;

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (token != null) 'Authorization': 'Bearer $token',
  };

  Uri _uri(String path, [Map<String, String>? query]) {
    return Uri.parse('$apiBaseUrl$path').replace(queryParameters: query);
  }

  Future<T> _decode<T>(http.Response response) async {
    late final Map<String, dynamic> body;
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is! Map<String, dynamic>) {
        throw const FormatException('Respuesta sin objeto JSON');
      }
      body = decoded;
    } on FormatException {
      throw ApiException(
        'Respuesta no valida del servidor (${response.statusCode}). Revisa la conexion o API_BASE_URL.',
      );
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final error = body['error'];
      final message = error is Map<String, dynamic>
          ? error['message']?.toString()
          : error?.toString();
      throw ApiException(message ?? 'Error HTTP ${response.statusCode}');
    }
    if (body['success'] != true) {
      throw ApiException('Respuesta invalida del servidor');
    }
    return body['data'] as T;
  }

  Future<AuthSession> login(String email, String password) async {
    final response = await http.post(
      _uri('/auth/login'),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = await _decode<Map<String, dynamic>>(response);
    token = data['token']?.toString();
    return AuthSession.fromJson(data);
  }

  Future<AuthSession> register(RegisterInput input) async {
    final response = await http.post(
      _uri('/auth/register'),
      headers: _headers,
      body: jsonEncode(input.toJson()),
    );
    final data = await _decode<Map<String, dynamic>>(response);
    token = data['token']?.toString();
    return AuthSession.fromJson(data);
  }

  Future<List<Flight>> searchFlights(SearchCriteria criteria) async {
    final data = await _decode<List<dynamic>>(
      await http.get(
        _uri('/flights/search', {
          'origin': criteria.origin.trim().toUpperCase(),
          'destination': criteria.destination.trim().toUpperCase(),
          'date': criteria.date,
          'passengers': criteria.passengers.toString(),
          if (criteria.cabinClass != null) 'class': criteria.cabinClass!,
        }),
        headers: _headers,
      ),
    );
    return data
        .map((item) => Flight.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<Flight>> featuredFlights() async {
    final data = await _decode<List<dynamic>>(
      await http.get(_uri('/flights'), headers: _headers),
    );
    return data
        .map((item) => Flight.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<Reservation> createReservation({
    required String flightClassId,
    required PassengerInput passenger,
    String? promotionCode,
  }) async {
    final response = await http.post(
      _uri('/reservations'),
      headers: _headers,
      body: jsonEncode({
        'flightClassId': flightClassId,
        'passengers': [passenger.toJson()],
        if (promotionCode != null && promotionCode.trim().isNotEmpty)
          'promotionCode': promotionCode.trim().toUpperCase(),
      }),
    );
    return Reservation.fromJson(await _decode<Map<String, dynamic>>(response));
  }

  Future<List<Reservation>> myReservations() async {
    final data = await _decode<List<dynamic>>(
      await http.get(_uri('/reservations/my'), headers: _headers),
    );
    return data
        .map((item) => Reservation.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<ReservationDetail> reservationDetail(String id) async {
    final data = await _decode<Map<String, dynamic>>(
      await http.get(_uri('/reservations/$id'), headers: _headers),
    );
    final payments = await paymentsByReservation(id);
    return ReservationDetail.fromJson(data, payments);
  }

  Future<List<Payment>> paymentsByReservation(String reservationId) async {
    final data = await _decode<List<dynamic>>(
      await http.get(
        _uri('/payments/by-reservation/$reservationId'),
        headers: _headers,
      ),
    );
    return data
        .map((item) => Payment.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<Payment> payReservation(Reservation reservation, String provider) async {
    final response = await http.post(
      _uri('/payments'),
      headers: _headers,
      body: jsonEncode({
        'reservationId': reservation.id,
        'amount': reservation.total,
        'provider': provider,
        'transactionId': 'MOB-${DateTime.now().microsecondsSinceEpoch}',
        'status': 'COMPLETED',
      }),
    );
    return Payment.fromJson(await _decode<Map<String, dynamic>>(response));
  }
}

class ApiException implements Exception {
  ApiException(this.message);
  final String message;
  @override
  String toString() => message;
}

// ─── Modelos ──────────────────────────────────────────────────────────────────
class SearchCriteria {
  SearchCriteria({
    required this.origin,
    required this.destination,
    required this.date,
    required this.passengers,
    this.cabinClass,
  });

  final String origin;
  final String destination;
  final String date;
  final int passengers;
  final String? cabinClass;
}

class RecommendedRoute {
  const RecommendedRoute({
    required this.label,
    required this.origin,
    required this.destination,
    required this.description,
    required this.icon,
  });

  final String label;
  final String origin;
  final String destination;
  final String description;
  final IconData icon;
}

const recommendedRoutes = [
  RecommendedRoute(
    label: 'Quito - Bogota',
    origin: 'UIO',
    destination: 'BOG',
    description: 'Ruta base del reto',
    icon: Icons.flight_takeoff,
  ),
  RecommendedRoute(
    label: 'Quito - Panama',
    origin: 'UIO',
    destination: 'PTY',
    description: 'Conexion internacional',
    icon: Icons.travel_explore,
  ),
  RecommendedRoute(
    label: 'Panama - Miami',
    origin: 'PTY',
    destination: 'MIA',
    description: 'Opcion destacada',
    icon: Icons.public,
  ),
];

class RegisterInput {
  RegisterInput({
    required this.email,
    required this.password,
    required this.firstName,
    required this.firstLastName,
    this.phone,
    this.mainAddress,
  });

  final String email;
  final String password;
  final String firstName;
  final String firstLastName;
  final String? phone;
  final String? mainAddress;

  Map<String, dynamic> toJson() => {
    'email': email.trim(),
    'password': password,
    'firstName': firstName.trim(),
    'firstLastName': firstLastName.trim(),
    if (phone != null && phone!.trim().isNotEmpty) 'phone': phone!.trim(),
    if (mainAddress != null && mainAddress!.trim().isNotEmpty)
      'mainAddress': mainAddress!.trim(),
    if (mainAddress == null || mainAddress!.trim().isEmpty)
      'mainAddress': 'Sin direccion',
  };
}

class AuthSession {
  AuthSession({
    required this.token,
    required this.userName,
    required this.role,
  });

  final String token;
  final String userName;
  final String role;

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>? ?? {};
    return AuthSession(
      token: json['token']?.toString() ?? '',
      userName:
          '${user['firstName'] ?? ''} ${user['firstLastName'] ?? ''}'.trim(),
      role: user['role']?.toString() ?? 'CUSTOMER',
    );
  }
}

class Flight {
  Flight({
    required this.id,
    required this.origin,
    required this.destination,
    required this.departureDate,
    this.departureTime,
    this.arrivalTime,
    this.airline,
    this.durationMinutes,
    this.stops,
    this.lowestPrice,
    required this.classes,
  });

  final String id;
  final String origin;
  final String destination;
  final String departureDate;
  final String? departureTime;
  final String? arrivalTime;
  final String? airline;
  final int? durationMinutes;
  final int? stops;
  final double? lowestPrice;
  final List<FlightClass> classes;

  factory Flight.fromJson(Map<String, dynamic> json) {
    final route = json['route'] as Map<String, dynamic>? ?? {};
    final originAirport =
        route['originAirport'] as Map<String, dynamic>? ?? {};
    final destinationAirport =
        route['destinationAirport'] as Map<String, dynamic>? ?? {};
    final classes = (json['flightClasses'] as List<dynamic>? ??
            json['classes'] as List<dynamic>? ??
            [])
        .map((item) => FlightClass.fromJson(item as Map<String, dynamic>))
        .toList();

    return Flight(
      id: json['id']?.toString() ?? '',
      origin: originAirport['iataCode']?.toString() ??
          json['originAirportIata']?.toString() ??
          '',
      destination: destinationAirport['iataCode']?.toString() ??
          json['destinationAirportIata']?.toString() ??
          '',
      departureDate: json['departureDate']?.toString() ?? '',
      departureTime: json['departureDateTime']?.toString(),
      arrivalTime: json['arrivalDateTime']?.toString(),
      airline: (json['airline'] as Map<String, dynamic>?)?['name']?.toString(),
      durationMinutes: _int(json['durationMinutes'] ?? json['duration']),
      stops: _int(json['stops']),
      lowestPrice: _double(json['lowestPrice']),
      classes: classes,
    );
  }
}

class FlightClass {
  FlightClass({
    required this.id,
    required this.cabinClass,
    required this.availableSeats,
    required this.basePrice,
  });

  final String id;
  final String cabinClass;
  final int availableSeats;
  final double basePrice;

  factory FlightClass.fromJson(Map<String, dynamic> json) {
    return FlightClass(
      id: json['id']?.toString() ?? '',
      cabinClass: json['cabinClass']?.toString() ??
          json['classType']?.toString() ??
          'ECONOMY',
      availableSeats: _int(json['availableSeats']) ?? 0,
      basePrice: _double(json['basePrice']) ?? 0,
    );
  }
}

class PassengerInput {
  PassengerInput({
    required this.firstName,
    required this.lastName,
    required this.documentNumber,
  });

  final String firstName;
  final String lastName;
  final String documentNumber;

  Map<String, dynamic> toJson() => {
    'firstName': firstName.trim(),
    'lastName': lastName.trim(),
    'documentNumber': documentNumber.trim(),
  };
}

class Reservation {
  Reservation({
    required this.id,
    required this.code,
    required this.status,
    required this.total,
    required this.createdAt,
  });

  final String id;
  final String code;
  final String status;
  final double total;
  final String createdAt;

  factory Reservation.fromJson(Map<String, dynamic> json) {
    return Reservation(
      id: json['id']?.toString() ?? '',
      code: json['reservationCode']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      total: _double(json['totalAmount']) ?? 0,
      createdAt: json['createdAt']?.toString() ?? '',
    );
  }
}

class ReservationDetail {
  ReservationDetail({
    required this.reservation,
    required this.passengers,
    required this.payments,
  });

  final Reservation reservation;
  final List<ReservationPassenger> passengers;
  final List<Payment> payments;

  bool get isPaid => payments.any((p) => p.status == 'COMPLETED');

  factory ReservationDetail.fromJson(
    Map<String, dynamic> json,
    List<Payment> payments,
  ) {
    final passengers = (json['passengers'] as List<dynamic>? ?? [])
        .map((item) =>
            ReservationPassenger.fromJson(item as Map<String, dynamic>))
        .toList();
    return ReservationDetail(
      reservation: Reservation.fromJson(json),
      passengers: passengers,
      payments: payments,
    );
  }
}

class ReservationPassenger {
  ReservationPassenger({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.documentNumber,
    this.seatNumber,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String documentNumber;
  final String? seatNumber;

  factory ReservationPassenger.fromJson(Map<String, dynamic> json) {
    return ReservationPassenger(
      id: json['id']?.toString() ?? '',
      firstName: json['firstName']?.toString() ?? '',
      lastName: json['lastName']?.toString() ?? '',
      documentNumber: json['documentNumber']?.toString() ?? '',
      seatNumber: json['seatNumber']?.toString(),
    );
  }
}

class Payment {
  Payment({
    required this.id,
    required this.amount,
    required this.provider,
    required this.status,
    required this.createdAt,
  });

  final String id;
  final double amount;
  final String provider;
  final String status;
  final String createdAt;

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id']?.toString() ?? '',
      amount: _double(json['amount']) ?? 0,
      provider: json['provider']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? '',
    );
  }
}

// ─── Utilidades ───────────────────────────────────────────────────────────────
int? _int(Object? value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '');
}

double? _double(Object? value) {
  if (value is double) return value;
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '');
}

String dateOnly(DateTime value) => value.toIso8601String().split('T').first;

String flightDateOnly(Flight flight) {
  final parsed = DateTime.tryParse(flight.departureDate);
  return parsed == null
      ? flight.departureDate.split('T').first
      : dateOnly(parsed);
}

List<Flight> prioritizedFlights(Iterable<Flight> source) {
  final today = DateTime.now();
  final startOfToday = DateTime(today.year, today.month, today.day);
  final flights = source
      .where((f) => f.classes.any((c) => c.availableSeats > 0))
      .toList();

  flights.sort((a, b) {
    final aDate = DateTime.tryParse(a.departureTime ?? a.departureDate);
    final bDate = DateTime.tryParse(b.departureTime ?? b.departureDate);
    if (aDate == null && bDate == null) return 0;
    if (aDate == null) return 1;
    if (bDate == null) return -1;
    final aPast = aDate.isBefore(startOfToday);
    final bPast = bDate.isBefore(startOfToday);
    if (aPast != bPast) return aPast ? 1 : -1;
    return aPast ? bDate.compareTo(aDate) : aDate.compareTo(bDate);
  });

  return flights;
}

String _timeOnly(String? value) {
  if (value == null || value.isEmpty) return '--:--';
  final dt = DateTime.tryParse(value);
  if (dt != null) {
    return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }
  final parts = value.split('T');
  if (parts.length > 1 && parts[1].length >= 5) return parts[1].substring(0, 5);
  return '--:--';
}

String _durationLabel(int? minutes) {
  if (minutes == null || minutes <= 0) return '';
  final h = minutes ~/ 60;
  final m = minutes % 60;
  if (h == 0) return '${m}min';
  if (m == 0) return '${h}h';
  return '${h}h ${m}m';
}

Color _statusColor(String status) => switch (status.toUpperCase()) {
  'CONFIRMED' || 'COMPLETADO' || 'COMPLETED' || 'PAGADO' => _kGreen,
  'PENDING' || 'PENDIENTE' => _kOrange,
  'CANCELLED' || 'CANCELADO' => _kRed,
  _ => _kBlue,
};

Color _cabinColor(String cabin) => switch (cabin.toUpperCase()) {
  'FIRST'           => _kAmber,
  'BUSINESS'        => const Color(0xFF7C3AED),
  'PREMIUM_ECONOMY' => const Color(0xFF0891B2),
  _                 => _kGreen,
};

String _cabinLabel(String cabin) => switch (cabin.toUpperCase()) {
  'ECONOMY'         => 'Economy',
  'PREMIUM_ECONOMY' => 'Premium Eco',
  'BUSINESS'        => 'Business',
  'FIRST'           => 'Primera Clase',
  _                 => cabin.replaceAll('_', ' '),
};

// ─── Shell ────────────────────────────────────────────────────────────────────
class ShellScreen extends StatefulWidget {
  const ShellScreen({super.key});

  @override
  State<ShellScreen> createState() => _ShellScreenState();
}

class _ShellScreenState extends State<ShellScreen> {
  final api = ApiClient();
  AuthSession? session;
  int index = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: index,
        children: [
          SearchScreen(api: api),
          TripsScreen(api: api, isLoggedIn: session != null),
          AccountScreen(
            api: api,
            session: session,
            onSessionChanged: (value) => setState(() => session = value),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
        ),
        child: NavigationBar(
          selectedIndex: index,
          onDestinationSelected: (value) => setState(() => index = value),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.flight_takeoff_outlined),
              selectedIcon: Icon(Icons.flight_takeoff),
              label: 'Buscar',
            ),
            NavigationDestination(
              icon: Icon(Icons.confirmation_num_outlined),
              selectedIcon: Icon(Icons.confirmation_num),
              label: 'Mis Viajes',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person),
              label: 'Cuenta',
            ),
          ],
        ),
      ),
    );
  }
}

// ─── SearchScreen ─────────────────────────────────────────────────────────────
class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key, required this.api});

  final ApiClient api;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final origin      = TextEditingController(text: 'UIO');
  final destination = TextEditingController(text: 'BOG');
  final date        = TextEditingController(
    text: dateOnly(DateTime.now().add(const Duration(days: 1))),
  );
  final passengers = TextEditingController(text: '1');
  String cabinClass = 'ECONOMY';
  bool loading = false;
  bool hasSearched = false;
  bool showingRecommendations = true;
  String? statusText;
  List<Flight> flights = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => loadRecommendations());
  }

  @override
  void dispose() {
    origin.dispose();
    destination.dispose();
    date.dispose();
    passengers.dispose();
    super.dispose();
  }

  Future<List<Flight>> _recommendedInventory() async {
    final result = await widget.api.featuredFlights();
    return prioritizedFlights(result).take(8).toList();
  }

  Future<void> loadRecommendations() async {
    setState(() {
      loading = true;
      hasSearched = false;
      showingRecommendations = true;
      statusText = 'Cargando vuelos recomendados del inventario publicado.';
    });
    try {
      final result = await _recommendedInventory();
      if (!mounted) return;
      setState(() {
        flights = result;
        statusText = result.isEmpty
            ? 'La API respondio, pero aun no tiene vuelos publicados.'
            : 'Mostrando vuelos recomendados del inventario publicado.';
      });
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() { flights = []; statusText = 'No se pudieron cargar recomendados: ${err.message}'; });
      showMessage(context, err.message);
    } catch (err) {
      if (!mounted) return;
      final msg = connectionErrorMessage(err);
      setState(() { flights = []; statusText = msg; });
      showMessage(context, msg);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> selectRecommendedRoute(RecommendedRoute route) async {
    origin.text = route.origin;
    destination.text = route.destination;
    setState(() {
      loading = true;
      hasSearched = true;
      showingRecommendations = true;
      statusText = 'Buscando inventario publicado para ${route.label}.';
    });
    try {
      final routeFlights = (await _recommendedInventory())
          .where((f) =>
              f.origin == route.origin && f.destination == route.destination)
          .toList();
      if (!mounted) return;
      if (routeFlights.isNotEmpty) {
        date.text = flightDateOnly(routeFlights.first);
        setState(() {
          flights = routeFlights;
          statusText =
              'Mostrando vuelos publicados para ${route.origin} → ${route.destination}.';
        });
      } else {
        date.text = dateOnly(DateTime.now().add(const Duration(days: 1)));
        setState(() {
          flights = [];
          statusText =
              'No hay inventario publicado para ${route.origin} → ${route.destination}.';
        });
      }
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() => statusText = 'No se pudo consultar la ruta: ${err.message}');
      showMessage(context, err.message);
    } catch (err) {
      if (!mounted) return;
      final msg = connectionErrorMessage(err);
      setState(() => statusText = msg);
      showMessage(context, msg);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> search() async {
    FocusScope.of(context).unfocus();
    final route =
        '${origin.text.trim().toUpperCase()} → ${destination.text.trim().toUpperCase()}';
    setState(() {
      loading = true;
      hasSearched = true;
      showingRecommendations = false;
      statusText = 'Buscando vuelos para $route el ${date.text}.';
    });
    try {
      final result = await widget.api.searchFlights(
        SearchCriteria(
          origin: origin.text,
          destination: destination.text,
          date: date.text,
          passengers: int.tryParse(passengers.text) ?? 1,
          cabinClass: cabinClass,
        ),
      );
      if (!mounted) return;
      if (result.isNotEmpty) {
        setState(() {
          flights = prioritizedFlights(result);
          statusText = 'Resultados para $route el ${date.text}.';
        });
        return;
      }
      final recommendations = await _recommendedInventory();
      if (!mounted) return;
      setState(() {
        flights = recommendations;
        showingRecommendations = true;
        statusText = recommendations.isEmpty
            ? 'No hay vuelos exactos para $route el ${date.text}, y la API no tiene inventario publicado.'
            : 'Sin resultados exactos para $route. Mostrando recomendados del inventario.';
      });
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() => statusText = 'No se pudo buscar: ${err.message}');
      showMessage(context, err.message);
    } catch (err) {
      if (!mounted) return;
      final msg = connectionErrorMessage(err);
      setState(() => statusText = msg);
      showMessage(context, msg);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: _AviationHeader(
              loading: loading,
              onSearch: search,
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: SearchPanel(
                origin: origin,
                destination: destination,
                date: date,
                passengers: passengers,
                cabinClass: cabinClass,
                onCabinChanged: (v) => setState(() => cabinClass = v),
                onSearch: search,
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: RecommendedRoutesPanel(
                loading: loading,
                onReload: loadRecommendations,
                onRouteSelected: selectRecommendedRoute,
              ),
            ),
          ),
          if (statusText != null)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: InfoBanner(
                  icon: showingRecommendations
                      ? Icons.tips_and_updates_outlined
                      : Icons.check_circle_outline,
                  text: statusText!,
                ),
              ),
            ),
          if (loading && flights.isEmpty)
            const SliverFillRemaining(
              hasScrollBody: false,
              child: Center(child: CircularProgressIndicator()),
            )
          else if (flights.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                icon: Icons.airplane_ticket_outlined,
                title: hasSearched
                    ? 'Sin vuelos para esta busqueda'
                    : 'Sin recomendados cargados',
                text: hasSearched
                    ? 'Prueba otra fecha o toca una ruta recomendada.'
                    : 'Toca actualizar para consultar el inventario publicado.',
              ),
            )
          else ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  children: [
                    const Icon(Icons.list_alt_rounded,
                        size: 18, color: Color(0xFF64748B)),
                    const SizedBox(width: 6),
                    Text(
                      showingRecommendations
                          ? 'Vuelos recomendados'
                          : 'Resultados de busqueda',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            color: const Color(0xFF64748B),
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDBEAFE),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${flights.length} vuelos',
                        style: const TextStyle(
                          color: _kBlue,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverList.separated(
              itemCount: flights.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, i) => Padding(
                padding: EdgeInsets.fromLTRB(
                    16, 0, 16, i == flights.length - 1 ? 24 : 0),
                child: FlightTile(
                  flight: flights[i],
                  onReserve: (fc) =>
                      showReservationSheet(context, widget.api, fc),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ─── Aviation Header ──────────────────────────────────────────────────────────
class _AviationHeader extends StatelessWidget {
  const _AviationHeader({required this.loading, required this.onSearch});

  final bool loading;
  final VoidCallback onSearch;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [_kNavy, Color(0xFF1E40AF), _kBlue],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20,
            top: -20,
            child: Icon(
              Icons.flight,
              size: 140,
              color: Colors.white.withValues(alpha: 0.06),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.travel_explore,
                      color: Colors.white, size: 26),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Sistema de Vuelos',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Busca, reserva y paga tu vuelo',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.75),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
                FilledButton.icon(
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: _kBlue,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    textStyle: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 13),
                  ),
                  onPressed: loading ? null : onSearch,
                  icon: loading
                      ? const SizedBox.square(
                          dimension: 14,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: _kBlue),
                        )
                      : const Icon(Icons.search, size: 16),
                  label: const Text('Buscar'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Search Panel ─────────────────────────────────────────────────────────────
class SearchPanel extends StatefulWidget {
  const SearchPanel({
    super.key,
    required this.origin,
    required this.destination,
    required this.date,
    required this.passengers,
    required this.cabinClass,
    required this.onCabinChanged,
    required this.onSearch,
  });

  final TextEditingController origin;
  final TextEditingController destination;
  final TextEditingController date;
  final TextEditingController passengers;
  final String cabinClass;
  final ValueChanged<String> onCabinChanged;
  final VoidCallback onSearch;

  @override
  State<SearchPanel> createState() => _SearchPanelState();
}

class _SearchPanelState extends State<SearchPanel> {
  late int _pax;

  @override
  void initState() {
    super.initState();
    _pax = int.tryParse(widget.passengers.text) ?? 1;
  }

  void _swap() {
    final temp = widget.origin.text;
    widget.origin.text = widget.destination.text;
    widget.destination.text = temp;
    setState(() {});
  }

  void _incPax() {
    if (_pax < 9) {
      setState(() => _pax++);
      widget.passengers.text = _pax.toString();
    }
  }

  void _decPax() {
    if (_pax > 1) {
      setState(() => _pax--);
      widget.passengers.text = _pax.toString();
    }
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final initial =
        DateTime.tryParse(widget.date.text) ?? now.add(const Duration(days: 1));
    final picked = await showDatePicker(
      context: context,
      initialDate: initial.isBefore(now) ? now : initial,
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: Theme.of(context).colorScheme.copyWith(primary: _kBlue),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      widget.date.text = dateOnly(picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: const Border.fromBorderSide(
            BorderSide(color: Color(0xFFE2E8F0))),
        boxShadow: [
          BoxShadow(
            color: _kBlue.withValues(alpha: 0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: widget.origin,
                  textCapitalization: TextCapitalization.characters,
                  style: const TextStyle(
                      fontWeight: FontWeight.w700, letterSpacing: 1.5),
                  decoration: InputDecoration(
                    labelText: 'Origen',
                    prefixIcon: const Icon(Icons.flight_takeoff, size: 18),
                    hintText: 'UIO',
                    hintStyle: TextStyle(color: Colors.grey.shade400),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: IconButton.filled(
                  onPressed: _swap,
                  icon: const Icon(Icons.swap_horiz, size: 20),
                  style: IconButton.styleFrom(
                    backgroundColor: const Color(0xFFEFF6FF),
                    foregroundColor: _kBlue,
                    minimumSize: const Size(40, 40),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  tooltip: 'Intercambiar',
                ),
              ),
              Expanded(
                child: TextField(
                  controller: widget.destination,
                  textCapitalization: TextCapitalization.characters,
                  style: const TextStyle(
                      fontWeight: FontWeight.w700, letterSpacing: 1.5),
                  decoration: InputDecoration(
                    labelText: 'Destino',
                    prefixIcon: const Icon(Icons.flight_land, size: 18),
                    hintText: 'BOG',
                    hintStyle: TextStyle(color: Colors.grey.shade400),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: _pickDate,
                  child: AbsorbPointer(
                    child: TextField(
                      controller: widget.date,
                      decoration: const InputDecoration(
                        labelText: 'Fecha de salida',
                        prefixIcon:
                            Icon(Icons.calendar_today_outlined, size: 18),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: const Border.fromBorderSide(
                      BorderSide(color: Color(0xFFCBD5E1))),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      onPressed: _decPax,
                      icon: const Icon(Icons.remove, size: 18),
                      color: _pax > 1 ? _kBlue : Colors.grey.shade400,
                      style: IconButton.styleFrom(
                          minimumSize: const Size(36, 36)),
                    ),
                    Column(
                      children: [
                        const Icon(Icons.person_outline,
                            size: 14, color: Color(0xFF64748B)),
                        Text(
                          '$_pax',
                          style: const TextStyle(
                              fontWeight: FontWeight.w800, fontSize: 15),
                        ),
                      ],
                    ),
                    IconButton(
                      onPressed: _pax < 9 ? _incPax : null,
                      icon: const Icon(Icons.add, size: 18),
                      color: _pax < 9 ? _kBlue : Colors.grey.shade400,
                      style: IconButton.styleFrom(
                          minimumSize: const Size(36, 36)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(
                  value: 'ECONOMY',
                  icon: Icon(Icons.airline_seat_recline_normal, size: 16),
                  label: Text('Economy')),
              ButtonSegment(
                  value: 'BUSINESS',
                  icon: Icon(Icons.airline_seat_flat, size: 16),
                  label: Text('Business')),
              ButtonSegment(
                  value: 'FIRST',
                  icon: Icon(Icons.star_outline, size: 16),
                  label: Text('First')),
            ],
            selected: {widget.cabinClass},
            onSelectionChanged: (s) => widget.onCabinChanged(s.first),
            style: ButtonStyle(
              visualDensity: VisualDensity.compact,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Recommended Routes Panel ─────────────────────────────────────────────────
class RecommendedRoutesPanel extends StatelessWidget {
  const RecommendedRoutesPanel({
    super.key,
    required this.loading,
    required this.onReload,
    required this.onRouteSelected,
  });

  final bool loading;
  final VoidCallback onReload;
  final ValueChanged<RecommendedRoute> onRouteSelected;

  static const _gradients = [
    [Color(0xFF1D4ED8), Color(0xFF4F46E5)],
    [Color(0xFF0891B2), Color(0xFF0D9488)],
    [Color(0xFF7C3AED), Color(0xFFBE185D)],
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.bolt_rounded, size: 18, color: _kAmber),
            const SizedBox(width: 6),
            Text(
              'Rutas rapidas',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF1E293B),
                  ),
            ),
            const Spacer(),
            TextButton.icon(
              onPressed: loading ? null : onReload,
              icon: const Icon(Icons.refresh, size: 16),
              label: const Text('Actualizar', style: TextStyle(fontSize: 12)),
              style: TextButton.styleFrom(
                foregroundColor: const Color(0xFF64748B),
                padding: const EdgeInsets.symmetric(horizontal: 8),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 110,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            clipBehavior: Clip.none,
            itemCount: recommendedRoutes.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, i) {
              final route = recommendedRoutes[i];
              final grad = _gradients[i % _gradients.length];
              return SizedBox(
                width: 170,
                child: Material(
                  borderRadius: BorderRadius.circular(14),
                  clipBehavior: Clip.antiAlias,
                  child: InkWell(
                    onTap: loading ? null : () => onRouteSelected(route),
                    child: Ink(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: grad,
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: Stack(
                        children: [
                          Positioned(
                            right: -10,
                            bottom: -10,
                            child: Icon(
                              route.icon,
                              size: 60,
                              color: Colors.white.withValues(alpha: 0.15),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Icon(route.icon,
                                    color: Colors.white.withValues(alpha: 0.9),
                                    size: 20),
                                const Spacer(),
                                Text(
                                  '${route.origin} → ${route.destination}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 16,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  route.description,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.75),
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

// ─── Info Banner ──────────────────────────────────────────────────────────────
class InfoBanner extends StatelessWidget {
  const InfoBanner({super.key, required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: scheme.secondaryContainer,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: scheme.secondary.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: scheme.onSecondaryContainer, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: scheme.onSecondaryContainer,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Flight Tile ──────────────────────────────────────────────────────────────
class FlightTile extends StatelessWidget {
  const FlightTile({
    super.key,
    required this.flight,
    required this.onReserve,
  });

  final Flight flight;
  final ValueChanged<FlightClass> onReserve;

  @override
  Widget build(BuildContext context) {
    final depTime = _timeOnly(flight.departureTime ?? flight.departureDate);
    final arrTime = _timeOnly(flight.arrivalTime);
    final duration = _durationLabel(flight.durationMinutes);
    final stops = flight.stops ?? 0;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Airline + badges row
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(8),
                    border: const Border.fromBorderSide(
                        BorderSide(color: Color(0xFFDBEAFE))),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.flight, size: 13, color: _kBlue),
                      const SizedBox(width: 4),
                      Text(
                        flight.airline ?? 'Aerolinea',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: _kBlue,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                if (duration.isNotEmpty)
                  _InfoChip(
                    icon: Icons.schedule_outlined,
                    label: duration,
                  ),
                const SizedBox(width: 6),
                _InfoChip(
                  icon: stops == 0
                      ? Icons.check_circle_outline
                      : Icons.connecting_airports_outlined,
                  label: stops == 0 ? 'Directo' : '$stops escala${stops > 1 ? 's' : ''}',
                  color: stops == 0 ? _kGreen : _kOrange,
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Route timeline
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Departure
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      depTime,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1E293B),
                        letterSpacing: -0.5,
                      ),
                    ),
                    Text(
                      flight.origin,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: _kBlue,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: _kBlue,
                                shape: BoxShape.circle,
                              ),
                            ),
                            Expanded(
                              child: Container(
                                height: 1.5,
                                color: _kBlue.withValues(alpha: 0.35),
                              ),
                            ),
                            const Icon(Icons.flight,
                                size: 18, color: _kBlue),
                            Expanded(
                              child: Container(
                                height: 1.5,
                                color: _kBlue.withValues(alpha: 0.35),
                              ),
                            ),
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: _kBlue,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ],
                        ),
                        if (duration.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            duration,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF94A3B8),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                // Arrival
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      arrTime,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1E293B),
                        letterSpacing: -0.5,
                      ),
                    ),
                    Text(
                      flight.destination,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: _kBlue,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 4),
            // Departure date
            Text(
              formatDateTime(flight.departureDate),
              style: const TextStyle(
                  fontSize: 11,
                  color: Color(0xFF94A3B8),
                  fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 14),
            const Divider(),
            const SizedBox(height: 6),
            // Classes
            ...flight.classes.map((fc) => _ClassRow(
                  flightClass: fc,
                  onReserve: () => onReserve(fc),
                )),
          ],
        ),
      ),
    );
  }
}

class _ClassRow extends StatelessWidget {
  const _ClassRow({
    required this.flightClass,
    required this.onReserve,
  });

  final FlightClass flightClass;
  final VoidCallback onReserve;

  @override
  Widget build(BuildContext context) {
    final color = _cabinColor(flightClass.cabinClass);
    final hasSeats = flightClass.availableSeats > 0;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: color.withValues(alpha: 0.3)),
            ),
            child: Text(
              _cabinLabel(flightClass.cabinClass),
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: color),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            hasSeats
                ? '${flightClass.availableSeats} asientos'
                : 'Sin disponibilidad',
            style: TextStyle(
              fontSize: 12,
              color: hasSeats
                  ? const Color(0xFF64748B)
                  : const Color(0xFF94A3B8),
            ),
          ),
          const Spacer(),
          Text(
            '\$${flightClass.basePrice.toStringAsFixed(2)}',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: hasSeats ? const Color(0xFF1E293B) : const Color(0xFF94A3B8),
            ),
          ),
          const SizedBox(width: 10),
          SizedBox(
            height: 34,
            child: FilledButton(
              onPressed: hasSeats ? onReserve : null,
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                textStyle: const TextStyle(
                    fontSize: 12, fontWeight: FontWeight.w700),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Reservar'),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({
    required this.icon,
    required this.label,
    this.color = const Color(0xFF64748B),
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
                fontSize: 11, fontWeight: FontWeight.w600, color: color),
          ),
        ],
      ),
    );
  }
}

// ─── Trips Screen ─────────────────────────────────────────────────────────────
class TripsScreen extends StatefulWidget {
  const TripsScreen({super.key, required this.api, required this.isLoggedIn});

  final ApiClient api;
  final bool isLoggedIn;

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  bool loading = false;
  List<Reservation> reservations = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && widget.isLoggedIn) load();
    });
  }

  Future<void> load() async {
    if (!widget.isLoggedIn) return;
    setState(() => loading = true);
    try {
      final result = await widget.api.myReservations();
      if (mounted) setState(() => reservations = result);
    } on ApiException catch (err) {
      if (!mounted) return;
      showMessage(context, err.message);
    } catch (err) {
      if (!mounted) return;
      showMessage(context, connectionErrorMessage(err));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> openDetail(Reservation reservation) async {
    await showReservationDetailSheet(context, widget.api, reservation,
        onChanged: load);
  }

  @override
  void didUpdateWidget(covariant TripsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isLoggedIn && !oldWidget.isLoggedIn) load();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isLoggedIn) {
      return const SafeArea(
        child: EmptyState(
          icon: Icons.lock_outline_rounded,
          title: 'Inicia sesion',
          text:
              'Tus reservas apareceran aqui despues de iniciar sesion en la pestana Cuenta.',
        ),
      );
    }

    return SafeArea(
      child: RefreshIndicator(
        color: _kBlue,
        onRefresh: load,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [_kNavy, Color(0xFF1E3A8A)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.confirmation_num,
                          color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Mis Viajes',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          Text(
                            '${reservations.length} reserva${reservations.length != 1 ? 's' : ''}',
                            style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.7),
                                fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: loading ? null : load,
                      icon: const Icon(Icons.refresh, color: Colors.white),
                      tooltip: 'Actualizar',
                    ),
                  ],
                ),
              ),
            ),
            if (loading)
              const SliverToBoxAdapter(
                child: LinearProgressIndicator(minHeight: 2, color: _kBlue),
              ),
            if (reservations.isEmpty && !loading)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: EmptyState(
                  icon: Icons.confirmation_num_outlined,
                  title: 'Sin reservas',
                  text:
                      'Busca y reserva un vuelo. Desliza hacia abajo para actualizar.',
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                sliver: SliverList.separated(
                  itemCount: reservations.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) =>
                      _ReservationCard(
                    reservation: reservations[i],
                    onTap: () => openDetail(reservations[i]),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ReservationCard extends StatelessWidget {
  const _ReservationCard({
    required this.reservation,
    required this.onTap,
  });

  final Reservation reservation;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.airplane_ticket_outlined,
                        color: _kBlue, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          reservation.code,
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 15,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          formatDateTime(reservation.createdAt),
                          style: const TextStyle(
                              fontSize: 12, color: Color(0xFF94A3B8)),
                        ),
                      ],
                    ),
                  ),
                  _StatusBadge(reservation.status),
                ],
              ),
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 12),
              Row(
                children: [
                  Text(
                    'Total a pagar',
                    style: const TextStyle(
                        fontSize: 12, color: Color(0xFF64748B)),
                  ),
                  const Spacer(),
                  Text(
                    '\$${reservation.total.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: _kBlue,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(Icons.chevron_right_rounded,
                      color: Colors.grey.shade400),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Account Screen ───────────────────────────────────────────────────────────
class AccountScreen extends StatefulWidget {
  const AccountScreen({
    super.key,
    required this.api,
    required this.session,
    required this.onSessionChanged,
  });

  final ApiClient api;
  final AuthSession? session;
  final ValueChanged<AuthSession?> onSessionChanged;

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  final email        = TextEditingController();
  final password     = TextEditingController();
  final firstName    = TextEditingController();
  final firstLastName = TextEditingController();
  final phone        = TextEditingController();
  final mainAddress  = TextEditingController();
  bool loading    = false;
  bool registering = false;
  bool _obscure   = true;

  @override
  void dispose() {
    email.dispose();
    password.dispose();
    firstName.dispose();
    firstLastName.dispose();
    phone.dispose();
    mainAddress.dispose();
    super.dispose();
  }

  Future<void> login() async {
    FocusScope.of(context).unfocus();
    if (email.text.trim().isEmpty || password.text.isEmpty) {
      showMessage(context, 'Ingresa email y password');
      return;
    }
    setState(() => loading = true);
    try {
      final session = await widget.api.login(email.text, password.text);
      if (!mounted) return;
      widget.onSessionChanged(session);
      showMessage(context, 'Sesion iniciada');
    } on ApiException catch (err) {
      if (!mounted) return;
      showMessage(context, err.message);
    } catch (err) {
      if (!mounted) return;
      showMessage(context, connectionErrorMessage(err));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> register() async {
    FocusScope.of(context).unfocus();
    if (email.text.trim().isEmpty || password.text.isEmpty) {
      showMessage(context, 'Ingresa email y password');
      return;
    }
    if (password.text.length < 6) {
      showMessage(context, 'El password debe tener al menos 6 caracteres');
      return;
    }
    if (firstName.text.trim().isEmpty || firstLastName.text.trim().isEmpty) {
      showMessage(context, 'Completa nombre y apellido');
      return;
    }
    setState(() => loading = true);
    try {
      final session = await widget.api.register(
        RegisterInput(
          email: email.text,
          password: password.text,
          firstName: firstName.text,
          firstLastName: firstLastName.text,
          phone: phone.text,
          mainAddress: mainAddress.text,
        ),
      );
      if (!mounted) return;
      widget.onSessionChanged(session);
      showMessage(context, 'Cuenta creada');
    } on ApiException catch (err) {
      if (!mounted) return;
      showMessage(context, err.message);
    } catch (err) {
      if (!mounted) return;
      showMessage(context, connectionErrorMessage(err));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = widget.session;
    return SafeArea(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          // Header
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [_kNavy, Color(0xFF1E3A8A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    session == null
                        ? Icons.person_outline
                        : Icons.verified_user_outlined,
                    color: Colors.white,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Cuenta',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text(
                      session == null
                          ? 'Accede para gestionar tus reservas'
                          : 'Sesion activa',
                      style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.7), fontSize: 13),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                if (session == null) ...[
                  SegmentedButton<bool>(
                    segments: const [
                      ButtonSegment(
                          value: false,
                          icon: Icon(Icons.login, size: 16),
                          label: Text('Ingresar')),
                      ButtonSegment(
                          value: true,
                          icon: Icon(Icons.person_add_outlined, size: 16),
                          label: Text('Crear cuenta')),
                    ],
                    selected: {registering},
                    onSelectionChanged: loading
                        ? null
                        : (v) => setState(() => registering = v.first),
                  ),
                  const SizedBox(height: 16),
                  InfoBanner(
                    icon: Icons.info_outline,
                    text: registering
                        ? 'Crea una cuenta para reservar, consultar viajes y pagar desde el movil.'
                        : 'Usa una cuenta existente. Si no tienes usuario, cambia a Crear cuenta.',
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: email,
                    keyboardType: TextInputType.emailAddress,
                    autocorrect: false,
                    decoration: const InputDecoration(
                      labelText: 'Correo electronico',
                      prefixIcon: Icon(Icons.email_outlined, size: 18),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: password,
                    obscureText: _obscure,
                    decoration: InputDecoration(
                      labelText: 'Contrasena',
                      prefixIcon: const Icon(Icons.lock_outline, size: 18),
                      suffixIcon: IconButton(
                        onPressed: () =>
                            setState(() => _obscure = !_obscure),
                        icon: Icon(
                          _obscure
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                          size: 18,
                        ),
                      ),
                    ),
                  ),
                  if (registering) ...[
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: firstName,
                            decoration: const InputDecoration(
                              labelText: 'Nombre',
                              prefixIcon:
                                  Icon(Icons.badge_outlined, size: 18),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: firstLastName,
                            decoration: const InputDecoration(
                              labelText: 'Apellido',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: phone,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        labelText: 'Telefono (opcional)',
                        prefixIcon: Icon(Icons.phone_outlined, size: 18),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: mainAddress,
                      decoration: const InputDecoration(
                        labelText: 'Direccion (opcional)',
                        prefixIcon:
                            Icon(Icons.home_outlined, size: 18),
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed:
                          loading ? null : (registering ? register : login),
                      icon: loading
                          ? const SizedBox.square(
                              dimension: 16,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : Icon(registering
                              ? Icons.person_add
                              : Icons.login),
                      label: Text(
                          registering ? 'Crear cuenta' : 'Iniciar sesion'),
                    ),
                  ),
                ] else ...[
                  // Profile card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: const Border.fromBorderSide(
                          BorderSide(color: Color(0xFFE2E8F0))),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundColor: const Color(0xFFDBEAFE),
                          child: Text(
                            session.userName.isNotEmpty
                                ? session.userName[0].toUpperCase()
                                : '?',
                            style: const TextStyle(
                              color: _kBlue,
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                session.userName.isEmpty
                                    ? 'Usuario autenticado'
                                    : session.userName,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 16,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFDBEAFE),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  session.role,
                                  style: const TextStyle(
                                    color: _kBlue,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.verified,
                            color: _kGreen, size: 20),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        widget.api.token = null;
                        widget.onSessionChanged(null);
                      },
                      icon: const Icon(Icons.logout, size: 18),
                      label: const Text('Cerrar sesion'),
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: const Border.fromBorderSide(
                        BorderSide(color: Color(0xFFE2E8F0))),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.dns_outlined,
                          size: 14, color: Color(0xFF94A3B8)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          apiBaseUrl,
                          style: const TextStyle(
                              fontSize: 10, color: Color(0xFF94A3B8)),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Shared Widgets ───────────────────────────────────────────────────────────
class HeaderBand extends StatelessWidget {
  const HeaderBand({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    this.action,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [_kNavy, _kBlue],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20,
            top: -20,
            child: Icon(icon,
                size: 120, color: Colors.white.withValues(alpha: 0.06)),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
            child: Row(
              children: [
                Icon(icon, color: Colors.white, size: 30),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.75),
                            fontSize: 13),
                      ),
                    ],
                  ),
                ),
                if (action != null) ...[
                  const SizedBox(width: 10),
                  action!,
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class HeaderLine extends StatelessWidget {
  const HeaderLine({super.key, required this.title, this.trailing});

  final String title;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final trailingWidget = trailing;
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: Theme.of(context)
                .textTheme
                .headlineSmall
                ?.copyWith(fontWeight: FontWeight.w800),
          ),
        ),
        ?trailingWidget,
      ],
    );
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.text,
  });

  final IconData icon;
  final String title;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFDBEAFE), width: 2),
              ),
              child: Icon(icon, size: 40, color: _kBlue),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF1E293B),
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              text,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge(this.status);

  final String status;

  @override
  Widget build(BuildContext context) {
    final color = _statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.3,
        ),
      ),
    );
  }
}

class _SheetHandle extends StatelessWidget {
  const _SheetHandle();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 40,
        height: 4,
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.grey.shade300,
          borderRadius: BorderRadius.circular(2),
        ),
      ),
    );
  }
}

// ─── Reservation Sheet ────────────────────────────────────────────────────────
Future<void> showReservationSheet(
  BuildContext context,
  ApiClient api,
  FlightClass flightClass,
) async {
  final firstName = TextEditingController();
  final lastName  = TextEditingController();
  final document  = TextEditingController();
  final promotion = TextEditingController();
  bool loading = false;

  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (sheetContext) {
      return StatefulBuilder(
        builder: (context, setState) {
          Future<void> submit() async {
            if (firstName.text.trim().isEmpty ||
                lastName.text.trim().isEmpty ||
                document.text.trim().isEmpty) {
              showMessage(context, 'Completa los datos del pasajero');
              return;
            }
            setState(() => loading = true);
            try {
              final reservation = await api.createReservation(
                flightClassId: flightClass.id,
                passenger: PassengerInput(
                  firstName: firstName.text,
                  lastName: lastName.text,
                  documentNumber: document.text,
                ),
                promotionCode: promotion.text,
              );
              if (!context.mounted || !sheetContext.mounted) return;
              Navigator.pop(sheetContext);
              showMessage(context, 'Reserva ${reservation.code} creada');
            } on ApiException catch (err) {
              if (!context.mounted) return;
              showMessage(context, err.message);
            } catch (err) {
              if (!context.mounted) return;
              showMessage(context, connectionErrorMessage(err));
            } finally {
              if (context.mounted) setState(() => loading = false);
            }
          }

          return Padding(
            padding: EdgeInsets.fromLTRB(
              20, 12, 20,
              MediaQuery.of(context).viewInsets.bottom + 20,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const _SheetHandle(),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.airplane_ticket_outlined,
                          color: _kBlue, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Nueva Reserva',
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 18,
                            ),
                          ),
                          Text(
                            '${_cabinLabel(flightClass.cabinClass)} · \$${flightClass.basePrice.toStringAsFixed(2)}',
                            style: const TextStyle(
                                color: Color(0xFF64748B), fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(sheetContext),
                      icon: const Icon(Icons.close),
                      style: IconButton.styleFrom(
                        backgroundColor: const Color(0xFFF1F5F9),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                const Text(
                  'Datos del pasajero',
                  style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                      color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: firstName,
                        decoration: const InputDecoration(
                          labelText: 'Nombre',
                          prefixIcon: Icon(Icons.person_outline, size: 18),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: lastName,
                        decoration: const InputDecoration(
                          labelText: 'Apellido',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: document,
                  decoration: const InputDecoration(
                    labelText: 'Numero de documento',
                    prefixIcon: Icon(Icons.badge_outlined, size: 18),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: promotion,
                  textCapitalization: TextCapitalization.characters,
                  decoration: const InputDecoration(
                    labelText: 'Codigo promocional (opcional)',
                    prefixIcon: Icon(Icons.local_offer_outlined, size: 18),
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total a pagar',
                          style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF64748B))),
                      Text(
                        '\$${flightClass.basePrice.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: _kBlue,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: loading ? null : submit,
                  icon: loading
                      ? const SizedBox.square(
                          dimension: 16,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.check_circle_outline),
                  label: Text(loading
                      ? 'Procesando...'
                      : 'Confirmar reserva'),
                ),
              ],
            ),
          );
        },
      );
    },
  );
}

// ─── Reservation Detail Sheet ─────────────────────────────────────────────────
Future<void> showReservationDetailSheet(
  BuildContext context,
  ApiClient api,
  Reservation reservation, {
  required Future<void> Function() onChanged,
}) async {
  String provider = 'VISA';
  bool paying = false;
  late Future<ReservationDetail> detailFuture =
      api.reservationDetail(reservation.id);

  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (sheetContext) {
      return StatefulBuilder(
        builder: (context, setState) {
          Future<void> pay() async {
            setState(() => paying = true);
            try {
              await api.payReservation(reservation, provider);
              await onChanged();
              if (!context.mounted) return;
              setState(() {
                detailFuture = api.reservationDetail(reservation.id);
              });
              showMessage(context, 'Pago confirmado');
            } on ApiException catch (err) {
              if (!context.mounted) return;
              showMessage(context, err.message);
            } catch (err) {
              if (!context.mounted) return;
              showMessage(context, connectionErrorMessage(err));
            } finally {
              if (context.mounted) setState(() => paying = false);
            }
          }

          return SizedBox(
            height: MediaQuery.of(context).size.height * 0.88,
            child: FutureBuilder<ReservationDetail>(
              future: detailFuture,
              builder: (context, snapshot) {
                final detail = snapshot.data;
                return Column(
                  children: [
                    // Fixed header
                    Padding(
                      padding:
                          const EdgeInsets.fromLTRB(20, 12, 20, 0),
                      child: Column(
                        children: [
                          const _SheetHandle(),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      reservation.code,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w800,
                                        fontSize: 20,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                    Row(
                                      children: [
                                        _StatusBadge(reservation.status),
                                        const SizedBox(width: 8),
                                        if (detail != null)
                                          _StatusBadge(detail.isPaid
                                              ? 'PAGADO'
                                              : 'PENDIENTE PAGO'),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                onPressed: () =>
                                    Navigator.pop(sheetContext),
                                icon: const Icon(Icons.close),
                                style: IconButton.styleFrom(
                                  backgroundColor:
                                      const Color(0xFFF1F5F9),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [_kNavy, Color(0xFF1E3A8A)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      formatDateTime(reservation.createdAt),
                                      style: TextStyle(
                                          color: Colors.white
                                              .withValues(alpha: 0.65),
                                          fontSize: 11),
                                    ),
                                    const SizedBox(height: 2),
                                    const Text(
                                      'Fecha de reserva',
                                      style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w600,
                                          fontSize: 13),
                                    ),
                                  ],
                                ),
                                Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.end,
                                  children: [
                                    const Text(
                                      'Total',
                                      style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 11),
                                    ),
                                    Text(
                                      '\$${reservation.total.toStringAsFixed(2)}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 22,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 4),
                        ],
                      ),
                    ),
                    // Scrollable content
                    Expanded(
                      child: ListView(
                        padding: EdgeInsets.fromLTRB(
                          20, 8, 20,
                          MediaQuery.of(context).viewInsets.bottom + 20,
                        ),
                        children: [
                          if (snapshot.connectionState ==
                              ConnectionState.waiting)
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 24),
                              child: Center(
                                  child: CircularProgressIndicator(
                                      color: _kBlue)),
                            ),
                          if (snapshot.hasError)
                            EmptyState(
                              icon: Icons.cloud_off,
                              title: 'No se pudo cargar el detalle',
                              text: snapshot.error.toString(),
                            ),
                          if (detail != null) ...[
                            const SizedBox(height: 8),
                            _SectionTitle(
                              icon: Icons.people_outline,
                              title: 'Pasajeros',
                            ),
                            const SizedBox(height: 8),
                            if (detail.passengers.isEmpty)
                              const Text(
                                'No hay pasajeros registrados.',
                                style: TextStyle(color: Color(0xFF94A3B8)),
                              )
                            else
                              ...detail.passengers.map(
                                (p) => Container(
                                  margin:
                                      const EdgeInsets.only(bottom: 8),
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color:
                                        const Color(0xFFF8FAFC),
                                    borderRadius:
                                        BorderRadius.circular(12),
                                    border: const Border.fromBorderSide(
                                        BorderSide(
                                            color: Color(0xFFE2E8F0))),
                                  ),
                                  child: Row(
                                    children: [
                                      CircleAvatar(
                                        radius: 18,
                                        backgroundColor:
                                            const Color(0xFFDBEAFE),
                                        child: Text(
                                          p.firstName.isNotEmpty
                                              ? p.firstName[0]
                                                  .toUpperCase()
                                              : '?',
                                          style: const TextStyle(
                                              color: _kBlue,
                                              fontWeight: FontWeight.w800,
                                              fontSize: 14),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              '${p.firstName} ${p.lastName}',
                                              style: const TextStyle(
                                                  fontWeight:
                                                      FontWeight.w700),
                                            ),
                                            Text(
                                              p.documentNumber,
                                              style: const TextStyle(
                                                  fontSize: 12,
                                                  color:
                                                      Color(0xFF64748B)),
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (p.seatNumber != null)
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color:
                                                const Color(0xFFDBEAFE),
                                            borderRadius:
                                                BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            'Asiento\n${p.seatNumber}',
                                            textAlign: TextAlign.center,
                                            style: const TextStyle(
                                              color: _kBlue,
                                              fontSize: 10,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                            const SizedBox(height: 16),
                            _SectionTitle(
                              icon: Icons.receipt_long_outlined,
                              title: 'Historial de pagos',
                            ),
                            const SizedBox(height: 8),
                            if (detail.payments.isEmpty)
                              const Text(
                                'Aun no hay pagos para esta reserva.',
                                style: TextStyle(color: Color(0xFF94A3B8)),
                              )
                            else
                              ...detail.payments.map(
                                (pay) => Container(
                                  margin:
                                      const EdgeInsets.only(bottom: 8),
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius:
                                        BorderRadius.circular(12),
                                    border: const Border.fromBorderSide(
                                        BorderSide(
                                            color: Color(0xFFE2E8F0))),
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: _statusColor(pay.status)
                                              .withValues(alpha: 0.1),
                                          borderRadius:
                                              BorderRadius.circular(8),
                                        ),
                                        child: Icon(
                                          Icons.payments_outlined,
                                          size: 16,
                                          color: _statusColor(pay.status),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              pay.provider,
                                              style: const TextStyle(
                                                  fontWeight:
                                                      FontWeight.w700,
                                                  fontSize: 13),
                                            ),
                                            Text(
                                              formatDateTime(
                                                  pay.createdAt),
                                              style: const TextStyle(
                                                  fontSize: 11,
                                                  color:
                                                      Color(0xFF94A3B8)),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.end,
                                        children: [
                                          Text(
                                            '\$${pay.amount.toStringAsFixed(2)}',
                                            style: const TextStyle(
                                                fontWeight: FontWeight.w700,
                                                fontSize: 14),
                                          ),
                                          _StatusBadge(pay.status),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            const SizedBox(height: 16),
                            if (!detail.isPaid) ...[
                              _SectionTitle(
                                icon: Icons.credit_card_outlined,
                                title: 'Metodo de pago',
                              ),
                              const SizedBox(height: 8),
                              DropdownButtonFormField<String>(
                                initialValue: provider,
                                decoration: const InputDecoration(
                                  labelText: 'Seleccionar metodo',
                                  prefixIcon: Icon(
                                      Icons.account_balance_wallet_outlined,
                                      size: 18),
                                ),
                                items: const [
                                  DropdownMenuItem(
                                      value: 'VISA',
                                      child: Text('Visa')),
                                  DropdownMenuItem(
                                      value: 'MASTERCARD',
                                      child: Text('Mastercard')),
                                  DropdownMenuItem(
                                      value: 'PAYPAL',
                                      child: Text('PayPal')),
                                  DropdownMenuItem(
                                      value: 'TRANSFER',
                                      child: Text('Transferencia')),
                                ],
                                onChanged: paying
                                    ? null
                                    : (v) => setState(
                                        () => provider = v!),
                              ),
                              const SizedBox(height: 12),
                              FilledButton.icon(
                                onPressed: paying ? null : pay,
                                icon: paying
                                    ? const SizedBox.square(
                                        dimension: 16,
                                        child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: Colors.white),
                                      )
                                    : const Icon(Icons.lock_outline),
                                label: Text(paying
                                    ? 'Procesando...'
                                    : 'Pagar \$${reservation.total.toStringAsFixed(2)}'),
                              ),
                            ] else
                              Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: _kGreen.withValues(alpha: 0.08),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                      color: _kGreen.withValues(alpha: 0.3)),
                                ),
                                child: const Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.verified,
                                        color: _kGreen, size: 20),
                                    SizedBox(width: 8),
                                    Text(
                                      'Reserva pagada correctamente',
                                      style: TextStyle(
                                        color: _kGreen,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          );
        },
      );
    },
  );
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.icon, required this.title});

  final IconData icon;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: const Color(0xFF64748B)),
        const SizedBox(width: 6),
        Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 14,
            color: Color(0xFF374151),
          ),
        ),
      ],
    );
  }
}

// ─── Utilidades globales ──────────────────────────────────────────────────────
void showMessage(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(message),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      margin: const EdgeInsets.all(12),
    ),
  );
}

String connectionErrorMessage(Object error) {
  if (error is ApiException) return error.message;
  return 'No se pudo conectar con la API. Revisa Internet o espera a que Render termine de iniciar.';
}

String formatDateTime(String value) {
  if (value.isEmpty) return '--';
  final parsed = DateTime.tryParse(value);
  if (parsed == null) return value;
  final y   = parsed.year.toString().padLeft(4, '0');
  final mo  = parsed.month.toString().padLeft(2, '0');
  final d   = parsed.day.toString().padLeft(2, '0');
  final h   = parsed.hour.toString().padLeft(2, '0');
  final min = parsed.minute.toString().padLeft(2, '0');
  return '$y-$mo-$d $h:$min';
}
