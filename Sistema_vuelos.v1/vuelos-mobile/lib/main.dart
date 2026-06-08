import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'https://integracion-sistemas2026.onrender.com/api/v1',
);

void main() {
  runApp(const VuelosMobileApp());
}

class VuelosMobileApp extends StatelessWidget {
  const VuelosMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    const seed = Color(0xff0f766e);
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Vuelos',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: seed,
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xfff6f8fb),
        inputDecorationTheme: const InputDecorationTheme(
          border: OutlineInputBorder(),
          filled: true,
          fillColor: Colors.white,
        ),
      ),
      home: const ShellScreen(),
    );
  }
}

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

  Future<Payment> payReservation(
    Reservation reservation,
    String provider,
  ) async {
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
      userName: '${user['firstName'] ?? ''} ${user['firstLastName'] ?? ''}'
          .trim(),
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
    final originAirport = route['originAirport'] as Map<String, dynamic>? ?? {};
    final destinationAirport =
        route['destinationAirport'] as Map<String, dynamic>? ?? {};
    final classes =
        (json['flightClasses'] as List<dynamic>? ??
                json['classes'] as List<dynamic>? ??
                [])
            .map((item) => FlightClass.fromJson(item as Map<String, dynamic>))
            .toList();

    return Flight(
      id: json['id']?.toString() ?? '',
      origin:
          originAirport['iataCode']?.toString() ??
          json['originAirportIata']?.toString() ??
          '',
      destination:
          destinationAirport['iataCode']?.toString() ??
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
      cabinClass:
          json['cabinClass']?.toString() ??
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

  bool get isPaid => payments.any((payment) => payment.status == 'COMPLETED');

  factory ReservationDetail.fromJson(
    Map<String, dynamic> json,
    List<Payment> payments,
  ) {
    final passengers = (json['passengers'] as List<dynamic>? ?? [])
        .map(
          (item) => ReservationPassenger.fromJson(item as Map<String, dynamic>),
        )
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
      .where((flight) => flight.classes.any((item) => item.availableSeats > 0))
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
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.flight_takeoff),
            label: 'Buscar',
          ),
          NavigationDestination(icon: Icon(Icons.luggage), label: 'Viajes'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Cuenta'),
        ],
      ),
    );
  }
}

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key, required this.api});

  final ApiClient api;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final origin = TextEditingController(text: 'UIO');
  final destination = TextEditingController(text: 'BOG');
  final date = TextEditingController(
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

  Future<List<Flight>> recommendedInventory() async {
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
      final result = await recommendedInventory();
      if (!mounted) return;
      setState(() {
        flights = result;
        statusText = result.isEmpty
            ? 'La API respondio, pero aun no tiene vuelos publicados.'
            : 'Mostrando vuelos recomendados del inventario publicado.';
      });
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() {
        flights = [];
        statusText = 'No se pudieron cargar recomendados: ${err.message}';
      });
      showMessage(context, err.message);
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
      final routeFlights = (await recommendedInventory())
          .where(
            (flight) =>
                flight.origin == route.origin &&
                flight.destination == route.destination,
          )
          .toList();
      if (!mounted) return;
      if (routeFlights.isNotEmpty) {
        date.text = flightDateOnly(routeFlights.first);
        setState(() {
          flights = routeFlights;
          statusText =
              'Mostrando vuelos publicados para ${route.origin} -> ${route.destination}.';
        });
      } else {
        date.text = dateOnly(DateTime.now().add(const Duration(days: 1)));
        setState(() {
          flights = [];
          statusText =
              'No hay inventario publicado para ${route.origin} -> ${route.destination}.';
        });
      }
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(
        () => statusText = 'No se pudo consultar la ruta: ${err.message}',
      );
      showMessage(context, err.message);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> search() async {
    FocusScope.of(context).unfocus();
    final route =
        '${origin.text.trim().toUpperCase()} -> ${destination.text.trim().toUpperCase()}';
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

      final recommendations = await recommendedInventory();
      if (!mounted) return;
      setState(() {
        flights = recommendations;
        showingRecommendations = true;
        statusText = recommendations.isEmpty
            ? 'No hay vuelos exactos para $route el ${date.text}, y la API no tiene inventario publicado.'
            : 'No hay vuelos exactos para $route el ${date.text}. Te muestro recomendados del inventario publicado.';
      });
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() => statusText = 'No se pudo buscar: ${err.message}');
      showMessage(context, err.message);
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
            child: HeaderBand(
              title: 'Vuelos',
              subtitle:
                  'Busca, reserva y revisa tu itinerario desde el marketplace movil.',
              icon: Icons.travel_explore,
              action: FilledButton.icon(
                onPressed: loading ? null : search,
                icon: loading
                    ? const SizedBox.square(
                        dimension: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.search),
                label: const Text('Buscar'),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              child: SearchPanel(
                origin: origin,
                destination: destination,
                date: date,
                passengers: passengers,
                cabinClass: cabinClass,
                onCabinChanged: (value) => setState(() => cabinClass = value),
                onSearch: search,
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
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
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
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
          else
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 2, 16, 8),
                child: HeaderLine(
                  title: showingRecommendations
                      ? 'Vuelos recomendados'
                      : 'Resultados',
                ),
              ),
            ),
          if (flights.isNotEmpty)
            SliverList.separated(
              itemCount: flights.length,
              separatorBuilder: (context, index) => const SizedBox(height: 10),
              itemBuilder: (context, i) => Padding(
                padding: EdgeInsets.fromLTRB(
                  16,
                  0,
                  16,
                  i == flights.length - 1 ? 20 : 0,
                ),
                child: FlightTile(
                  flight: flights[i],
                  onReserve: (flightClass) =>
                      showReservationSheet(context, widget.api, flightClass),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class SearchPanel extends StatelessWidget {
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
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: origin,
                decoration: const InputDecoration(labelText: 'Origen'),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: destination,
                decoration: const InputDecoration(labelText: 'Destino'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: date,
                decoration: const InputDecoration(labelText: 'Fecha'),
              ),
            ),
            const SizedBox(width: 10),
            SizedBox(
              width: 112,
              child: TextField(
                controller: passengers,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Pasajeros'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        SegmentedButton<String>(
          segments: const [
            ButtonSegment(value: 'ECONOMY', label: Text('Eco')),
            ButtonSegment(value: 'BUSINESS', label: Text('Business')),
            ButtonSegment(value: 'FIRST', label: Text('First')),
          ],
          selected: {cabinClass},
          onSelectionChanged: (set) => onCabinChanged(set.first),
        ),
      ],
    );
  }
}

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

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'Rutas rapidas',
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
              ),
            ),
            IconButton(
              tooltip: 'Actualizar recomendados',
              onPressed: loading ? null : onReload,
              icon: const Icon(Icons.refresh),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 126,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: recommendedRoutes.length,
            separatorBuilder: (context, index) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final route = recommendedRoutes[index];
              return SizedBox(
                width: 184,
                child: Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide(color: scheme.outlineVariant),
                  ),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(8),
                    onTap: loading ? null : () => onRouteSelected(route),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(route.icon, color: scheme.primary),
                          const Spacer(),
                          Text(
                            route.label,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.titleSmall
                                ?.copyWith(fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${route.origin} -> ${route.destination}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          Text(
                            route.description,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.bodySmall
                                ?.copyWith(color: scheme.onSurfaceVariant),
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
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(icon, color: scheme.onSecondaryContainer),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: scheme.onSecondaryContainer,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class FlightTile extends StatelessWidget {
  const FlightTile({super.key, required this.flight, required this.onReserve});

  final Flight flight;
  final ValueChanged<FlightClass> onReserve;

  @override
  Widget build(BuildContext context) {
    final primaryClass = flight.classes.isNotEmpty
        ? flight.classes.first
        : null;
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: Theme.of(
                    context,
                  ).colorScheme.primaryContainer,
                  child: const Icon(Icons.flight),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${flight.origin} -> ${flight.destination}',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      Text(flight.airline ?? 'Aerolínea disponible'),
                    ],
                  ),
                ),
                Text(
                  primaryClass == null
                      ? '--'
                      : '\$${primaryClass.basePrice.toStringAsFixed(2)}',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(
                  label: Text(
                    'Salida ${formatDateTime(flight.departureTime ?? flight.departureDate)}',
                  ),
                ),
                if (flight.durationMinutes != null)
                  Chip(label: Text('${flight.durationMinutes} min')),
                Chip(label: Text('${flight.stops ?? 0} escalas')),
              ],
            ),
            const SizedBox(height: 12),
            for (final item in flight.classes)
              ListTile(
                dense: true,
                contentPadding: EdgeInsets.zero,
                title: Text(item.cabinClass.replaceAll('_', ' ')),
                subtitle: Text('${item.availableSeats} asientos disponibles'),
                trailing: FilledButton(
                  onPressed: item.availableSeats > 0
                      ? () => onReserve(item)
                      : null,
                  child: const Text('Reservar'),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

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
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> openDetail(Reservation reservation) async {
    await showReservationDetailSheet(
      context,
      widget.api,
      reservation,
      onChanged: load,
    );
  }

  @override
  void didUpdateWidget(covariant TripsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isLoggedIn && !oldWidget.isLoggedIn) {
      load();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isLoggedIn) {
      return const SafeArea(
        child: EmptyState(
          icon: Icons.lock_outline,
          title: 'Inicia sesion',
          text: 'Tus reservas apareceran despues de iniciar sesion.',
        ),
      );
    }
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: load,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          children: [
            HeaderLine(
              title: 'Mis viajes',
              trailing: IconButton(
                onPressed: loading ? null : load,
                icon: const Icon(Icons.refresh),
              ),
            ),
            const SizedBox(height: 12),
            if (loading) const LinearProgressIndicator(),
            if (reservations.isEmpty && !loading)
              const EmptyState(
                icon: Icons.confirmation_num_outlined,
                title: 'Sin reservas cargadas',
                text:
                    'Reserva un vuelo o desliza hacia abajo para actualizar. Toca una reserva para ver detalle y pago.',
              )
            else
              for (final reservation in reservations)
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: ListTile(
                    onTap: () => openDetail(reservation),
                    leading: const Icon(Icons.airplane_ticket),
                    title: Text(reservation.code),
                    subtitle: Text(
                      '${reservation.status} - ${formatDateTime(reservation.createdAt)}',
                    ),
                    trailing: FilledButton.tonal(
                      onPressed: () => openDetail(reservation),
                      child: Text('\$${reservation.total.toStringAsFixed(2)}'),
                    ),
                  ),
                ),
          ],
        ),
      ),
    );
  }
}

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
  final email = TextEditingController();
  final password = TextEditingController();
  final firstName = TextEditingController();
  final firstLastName = TextEditingController();
  final phone = TextEditingController();
  final mainAddress = TextEditingController();
  bool loading = false;
  bool registering = false;

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
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = widget.session;
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          HeaderBand(
            title: 'Cuenta',
            subtitle: session == null
                ? 'Accede para asociar reservas a tu usuario.'
                : 'Sesion activa como ${session.userName}.',
            icon: Icons.verified_user_outlined,
          ),
          const SizedBox(height: 16),
          if (session == null) ...[
            SegmentedButton<bool>(
              segments: const [
                ButtonSegment(value: false, label: Text('Ingresar')),
                ButtonSegment(value: true, label: Text('Crear cuenta')),
              ],
              selected: {registering},
              onSelectionChanged: loading
                  ? null
                  : (value) => setState(() => registering = value.first),
            ),
            const SizedBox(height: 12),
            InfoBanner(
              icon: Icons.info_outline,
              text: registering
                  ? 'Crea una cuenta para reservar, consultar viajes y pagar desde el movil.'
                  : 'Usa una cuenta existente. Si aun no tienes usuario, cambia a Crear cuenta.',
            ),
            const SizedBox(height: 12),
            TextField(
              controller: email,
              keyboardType: TextInputType.emailAddress,
              autocorrect: false,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: password,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Password'),
            ),
            if (registering) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: firstName,
                      decoration: const InputDecoration(labelText: 'Nombre'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: firstLastName,
                      decoration: const InputDecoration(labelText: 'Apellido'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phone,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Telefono'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: mainAddress,
                decoration: const InputDecoration(labelText: 'Direccion'),
              ),
            ],
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: loading ? null : (registering ? register : login),
              icon: loading
                  ? const SizedBox.square(
                      dimension: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Icon(registering ? Icons.person_add : Icons.login),
              label: Text(registering ? 'Crear cuenta' : 'Iniciar sesion'),
            ),
          ] else ...[
            ListTile(
              leading: const Icon(Icons.person),
              title: Text(
                session.userName.isEmpty
                    ? 'Usuario autenticado'
                    : session.userName,
              ),
              subtitle: Text(session.role),
            ),
            OutlinedButton.icon(
              onPressed: () {
                widget.api.token = null;
                widget.onSessionChanged(null);
              },
              icon: const Icon(Icons.logout),
              label: const Text('Cerrar sesion'),
            ),
          ],
          const SizedBox(height: 18),
          Text(
            'API: $apiBaseUrl',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

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
    final scheme = Theme.of(context).colorScheme;
    final actionWidgets = action == null
        ? null
        : <Widget>[const SizedBox(width: 10), action!];
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
      decoration: BoxDecoration(color: scheme.primary),
      child: Row(
        children: [
          Icon(icon, color: scheme.onPrimary, size: 34),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: scheme.onPrimary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: Theme.of(
                    context,
                  ).textTheme.bodyMedium?.copyWith(color: scheme.onPrimary),
                ),
              ],
            ),
          ),
          ...?actionWidgets,
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
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
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
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 54, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 12),
            Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            Text(text, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

Future<void> showReservationSheet(
  BuildContext context,
  ApiClient api,
  FlightClass flightClass,
) async {
  final firstName = TextEditingController();
  final lastName = TextEditingController();
  final document = TextEditingController();
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
            } finally {
              if (context.mounted) setState(() => loading = false);
            }
          }

          return Padding(
            padding: EdgeInsets.fromLTRB(
              16,
              18,
              16,
              MediaQuery.of(context).viewInsets.bottom + 18,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Crear reserva',
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: firstName,
                  decoration: const InputDecoration(labelText: 'Nombre'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: lastName,
                  decoration: const InputDecoration(labelText: 'Apellido'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: document,
                  decoration: const InputDecoration(labelText: 'Documento'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: promotion,
                  decoration: const InputDecoration(
                    labelText: 'Codigo promocional',
                  ),
                ),
                const SizedBox(height: 14),
                FilledButton.icon(
                  onPressed: loading ? null : submit,
                  icon: loading
                      ? const SizedBox.square(
                          dimension: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.check),
                  label: Text(
                    'Confirmar \$${flightClass.basePrice.toStringAsFixed(2)}',
                  ),
                ),
              ],
            ),
          );
        },
      );
    },
  );
}

Future<void> showReservationDetailSheet(
  BuildContext context,
  ApiClient api,
  Reservation reservation, {
  required Future<void> Function() onChanged,
}) async {
  String provider = 'VISA';
  bool paying = false;
  late Future<ReservationDetail> detailFuture = api.reservationDetail(
    reservation.id,
  );

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
            } finally {
              if (context.mounted) setState(() => paying = false);
            }
          }

          return SizedBox(
            height: MediaQuery.of(context).size.height * 0.86,
            child: FutureBuilder<ReservationDetail>(
              future: detailFuture,
              builder: (context, snapshot) {
                final detail = snapshot.data;
                return ListView(
                  padding: EdgeInsets.fromLTRB(
                    16,
                    18,
                    16,
                    MediaQuery.of(context).viewInsets.bottom + 18,
                  ),
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            reservation.code,
                            style: Theme.of(context).textTheme.titleLarge
                                ?.copyWith(fontWeight: FontWeight.w800),
                          ),
                        ),
                        IconButton(
                          onPressed: () => Navigator.pop(sheetContext),
                          icon: const Icon(Icons.close),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: Icon(
                        detail?.isPaid == true
                            ? Icons.verified
                            : Icons.pending_actions,
                      ),
                      title: Text(
                        detail?.isPaid == true
                            ? 'Reserva pagada'
                            : 'Pago pendiente',
                      ),
                      subtitle: Text(
                        '${reservation.status} - ${formatDateTime(reservation.createdAt)}',
                      ),
                      trailing: Text(
                        '\$${reservation.total.toStringAsFixed(2)}',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ),
                    if (snapshot.connectionState == ConnectionState.waiting)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 18),
                        child: LinearProgressIndicator(),
                      ),
                    if (snapshot.hasError)
                      EmptyState(
                        icon: Icons.cloud_off,
                        title: 'No se pudo cargar el detalle',
                        text: snapshot.error.toString(),
                      ),
                    if (detail != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        'Pasajeros',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 6),
                      if (detail.passengers.isEmpty)
                        const Text('No hay pasajeros registrados.')
                      else
                        for (final passenger in detail.passengers)
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: const Icon(Icons.badge_outlined),
                            title: Text(
                              '${passenger.firstName} ${passenger.lastName}',
                            ),
                            subtitle: Text(passenger.documentNumber),
                            trailing: Text(
                              passenger.seatNumber ?? 'Sin asiento',
                            ),
                          ),
                      const Divider(height: 26),
                      Text(
                        'Pagos',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 6),
                      if (detail.payments.isEmpty)
                        const Text('Aun no hay pagos para esta reserva.')
                      else
                        for (final payment in detail.payments)
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: const Icon(Icons.payments_outlined),
                            title: Text(payment.status),
                            subtitle: Text(
                              '${payment.provider} - ${formatDateTime(payment.createdAt)}',
                            ),
                            trailing: Text(
                              '\$${payment.amount.toStringAsFixed(2)}',
                            ),
                          ),
                      const Divider(height: 26),
                      DropdownButtonFormField<String>(
                        initialValue: provider,
                        decoration: const InputDecoration(
                          labelText: 'Metodo de pago',
                        ),
                        items: const [
                          DropdownMenuItem(value: 'VISA', child: Text('Visa')),
                          DropdownMenuItem(
                            value: 'MASTERCARD',
                            child: Text('Mastercard'),
                          ),
                          DropdownMenuItem(
                            value: 'PAYPAL',
                            child: Text('PayPal'),
                          ),
                          DropdownMenuItem(
                            value: 'TRANSFER',
                            child: Text('Transferencia'),
                          ),
                        ],
                        onChanged: detail.isPaid || paying
                            ? null
                            : (value) => setState(() => provider = value!),
                      ),
                      const SizedBox(height: 12),
                      FilledButton.icon(
                        onPressed: detail.isPaid || paying ? null : pay,
                        icon: paying
                            ? const SizedBox.square(
                                dimension: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.lock),
                        label: Text(
                          detail.isPaid
                              ? 'Pago registrado'
                              : 'Pagar \$${reservation.total.toStringAsFixed(2)}',
                        ),
                      ),
                    ],
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

void showMessage(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
}

String formatDateTime(String value) {
  if (value.isEmpty) return '--';
  final parsed = DateTime.tryParse(value);
  if (parsed == null) return value;
  final y = parsed.year.toString().padLeft(4, '0');
  final m = parsed.month.toString().padLeft(2, '0');
  final d = parsed.day.toString().padLeft(2, '0');
  final h = parsed.hour.toString().padLeft(2, '0');
  final min = parsed.minute.toString().padLeft(2, '0');
  return '$y-$m-$d $h:$min';
}
