import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;

import 'admin/admin_panel.dart';

const apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'https://integracion-sistemas2026.onrender.com/api/v1',
);

// ─── Paleta de colores ────────────────────────────────────────────────────────
const _kNavy = Color(0xFF0D2137);
const _kBlue = Color(0xFF1D4ED8);
const _kAmber = Color(0xFFF59E0B);
const _kBg = Color(0xFFEFF6FF);
const _kGreen = Color(0xFF16A34A);
const _kOrange = Color(0xFFEA580C);
const _kRed = Color(0xFFDC2626);

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
    const outline = Color(0xFFCBD5E1);
    const outlineVariant = Color(0xFFE2E8F0);

    final cs =
        ColorScheme.fromSeed(
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
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 13,
        ),
        labelStyle: const TextStyle(color: Color(0xFF64748B)),
        prefixIconColor: const Color(0xFF64748B),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: _kBlue,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: const TextStyle(
            fontWeight: FontWeight.w700,
            letterSpacing: 0.2,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
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

  static const _kTimeout = Duration(seconds: 25);

  Uri _uri(String path, [Map<String, String>? query]) {
    return Uri.parse('$apiBaseUrl$path').replace(queryParameters: query);
  }

  Future<http.Response> _get(Uri uri) =>
      http.get(uri, headers: _headers).timeout(_kTimeout);

  Future<http.Response> _post(Uri uri, Object body) =>
      http.post(uri, headers: _headers, body: body).timeout(_kTimeout);

  Future<http.Response> _put(Uri uri, Object body) =>
      http.put(uri, headers: _headers, body: body).timeout(_kTimeout);

  Future<http.Response> _delete(Uri uri) =>
      http.delete(uri, headers: _headers).timeout(_kTimeout);

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
      throw ApiException(
        message ?? 'Error HTTP ${response.statusCode}',
        statusCode: response.statusCode,
      );
    }
    if (body['success'] != true) {
      throw ApiException('Respuesta invalida del servidor');
    }
    return body['data'] as T;
  }

  Future<AuthSession> login(String email, String password) async {
    final response = await _post(
      _uri('/auth/login'),
      jsonEncode({'email': email, 'password': password}),
    );
    final data = await _decode<Map<String, dynamic>>(response);
    token = data['token']?.toString();
    return AuthSession.fromJson(data);
  }

  Future<AuthSession> register(RegisterInput input) async {
    final response = await _post(
      _uri('/auth/register'),
      jsonEncode(input.toJson()),
    );
    final data = await _decode<Map<String, dynamic>>(response);
    token = data['token']?.toString();
    return AuthSession.fromJson(data);
  }

  Future<List<Flight>> searchFlights(SearchCriteria criteria) async {
    final data = await _decode<List<dynamic>>(
      await _get(
        _uri('/flights/search', {
          'origin': criteria.origin.trim().toUpperCase(),
          'destination': criteria.destination.trim().toUpperCase(),
          'date': criteria.date,
          'passengers': criteria.passengers.toString(),
          if (criteria.cabinClass != null) 'class': criteria.cabinClass!,
        }),
      ),
    );
    return data
        .map((item) => Flight.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<Flight>> featuredFlights() async {
    final data = await _decode<List<dynamic>>(await _get(_uri('/flights')));
    return data
        .map((item) => Flight.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<Reservation> createReservation({
    required String flightClassId,
    required PassengerInput passenger,
    String? promotionCode,
  }) async {
    final response = await _post(
      _uri('/reservations'),
      jsonEncode({
        'flightClassId': flightClassId,
        'passengers': [passenger.toJson()],
        if (promotionCode != null && promotionCode.trim().isNotEmpty)
          'promotionCode': promotionCode.trim().toUpperCase(),
      }),
    );
    return Reservation.fromJson(await _decode<Map<String, dynamic>>(response));
  }

  Future<Set<String>> occupiedSeats(String flightClassId) async {
    final data = await _decode<List<dynamic>>(
      await _get(
        _uri('/reservations/flight-classes/$flightClassId/occupied-seats'),
      ),
    );
    return data
        .map((item) => item.toString().trim().toUpperCase())
        .where((seat) => seat.isNotEmpty)
        .toSet();
  }

  Future<List<Reservation>> myReservations() async {
    final data = await _decode<List<dynamic>>(
      await _get(_uri('/reservations/my')),
    );
    return data
        .map((item) => Reservation.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<ReservationDetail> reservationDetail(String id) async {
    final data = await _decode<Map<String, dynamic>>(
      await _get(_uri('/reservations/$id')),
    );
    var payments = <Payment>[];
    String? paymentLookupError;
    try {
      payments = await paymentsByReservation(id);
    } catch (err) {
      paymentLookupError = paymentLookupErrorMessage(err);
    }
    return ReservationDetail.fromJson(data, payments, paymentLookupError);
  }

  Future<List<Payment>> paymentsByReservation(String reservationId) async {
    final data = await _decode<List<dynamic>>(
      await _get(_uri('/payments/by-reservation/$reservationId')),
    );
    return data
        .map((item) => Payment.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> updateProfile({
    String? firstName,
    String? firstLastName,
    String? phone,
    String? mainAddress,
  }) async {
    final body = <String, dynamic>{};
    if (firstName != null) body['firstName'] = firstName.trim();
    if (firstLastName != null) body['firstLastName'] = firstLastName.trim();
    if (phone != null) body['phone'] = phone.trim();
    if (mainAddress != null) {
      body['mainAddress'] = mainAddress.trim().isEmpty
          ? 'Sin direccion'
          : mainAddress.trim();
    }
    await _decode<dynamic>(await _put(_uri('/auth/profile'), jsonEncode(body)));
  }

  Future<Payment> payReservation(
    Reservation reservation,
    String provider,
  ) async {
    final response = await _post(
      _uri('/payments'),
      jsonEncode({
        'reservationId': reservation.id,
        'amount': reservation.total,
        'provider': provider,
        'transactionId': 'MOB-${DateTime.now().microsecondsSinceEpoch}',
        'status': 'COMPLETED',
      }),
    );
    return Payment.fromJson(await _decode<Map<String, dynamic>>(response));
  }

  // Cancela la reserva. Usa el token de sesion ya guardado (se envia
  // automaticamente en _headers), por lo que no pide credenciales extra.
  Future<void> cancelReservation(String id) async {
    await _decode<dynamic>(await _delete(_uri('/reservations/$id')));
  }
}

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});
  final String message;
  final int? statusCode;
  @override
  String toString() => message;
}

bool isSeatAlreadyReservedError(Object error) {
  if (error is! ApiException) return false;
  final text = error.message.toLowerCase();
  return error.statusCode == 409 &&
      (text.contains('asiento') ||
          text.contains('seat') ||
          text.contains('ocupado') ||
          text.contains('reservado'));
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
    this.id,
    this.email,
    this.firstName,
    this.firstLastName,
    this.phone,
    this.mainAddress,
  });

  final String token;
  final String userName;
  final String role;
  final String? id;
  final String? email;
  final String? firstName;
  final String? firstLastName;
  final String? phone;
  final String? mainAddress;

  AuthSession copyWith({
    String? firstName,
    String? firstLastName,
    String? phone,
    String? mainAddress,
  }) {
    final fn = firstName ?? this.firstName ?? '';
    final fl = firstLastName ?? this.firstLastName ?? '';
    return AuthSession(
      token: token,
      role: role,
      id: id,
      email: email,
      userName: '${fn.trim()} ${fl.trim()}'.trim(),
      firstName: firstName ?? this.firstName,
      firstLastName: firstLastName ?? this.firstLastName,
      phone: phone ?? this.phone,
      mainAddress: mainAddress ?? this.mainAddress,
    );
  }

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>? ?? json;
    final tok = json['token']?.toString() ?? '';
    return AuthSession(
      token: tok,
      userName: '${user['firstName'] ?? ''} ${user['firstLastName'] ?? ''}'
          .trim(),
      role: user['role']?.toString() ?? 'CUSTOMER',
      id: user['id']?.toString(),
      email: user['email']?.toString(),
      firstName: user['firstName']?.toString(),
      firstLastName: user['firstLastName']?.toString(),
      phone: user['phone']?.toString(),
      mainAddress: user['mainAddress']?.toString(),
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
    this.seatNumber,
  });

  final String firstName;
  final String lastName;
  final String documentNumber;
  final String? seatNumber;

  Map<String, dynamic> toJson() => {
    'firstName': firstName.trim(),
    'lastName': lastName.trim(),
    'documentNumber': documentNumber.trim(),
    if (seatNumber != null) 'seatNumber': seatNumber,
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
    required this.flight,
    required this.passengers,
    required this.payments,
    this.paymentLookupError,
  });

  final Reservation reservation;
  final ReservationFlightSummary? flight;
  final List<ReservationPassenger> passengers;
  final List<Payment> payments;
  final String? paymentLookupError;

  bool get isPaid => payments.any((p) => p.status == 'COMPLETED');

  factory ReservationDetail.fromJson(
    Map<String, dynamic> json,
    List<Payment> payments,
    String? paymentLookupError,
  ) {
    final passengers = (json['passengers'] as List<dynamic>? ?? [])
        .map(
          (item) => ReservationPassenger.fromJson(item as Map<String, dynamic>),
        )
        .toList();
    final flightJson = json['flight'];
    return ReservationDetail(
      reservation: Reservation.fromJson(json),
      flight: flightJson is Map<String, dynamic>
          ? ReservationFlightSummary.fromJson(flightJson)
          : null,
      passengers: passengers,
      payments: payments,
      paymentLookupError: paymentLookupError,
    );
  }
}

class ReservationPassenger {
  ReservationPassenger({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.documentNumber,
    this.flightClassId,
    this.cabinClass,
    this.seatNumber,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String documentNumber;
  final String? flightClassId;
  final String? cabinClass;
  final String? seatNumber;

  factory ReservationPassenger.fromJson(Map<String, dynamic> json) {
    final flightClass = asStringMap(json['flightClass']);
    return ReservationPassenger(
      id: json['id']?.toString() ?? '',
      firstName: json['firstName']?.toString() ?? '',
      lastName: json['lastName']?.toString() ?? '',
      documentNumber: json['documentNumber']?.toString() ?? '',
      flightClassId: json['flightClassId']?.toString(),
      cabinClass: flightClass?['cabinClass']?.toString(),
      seatNumber: json['seatNumber']?.toString(),
    );
  }
}

class ReservationFlightSummary {
  ReservationFlightSummary({
    required this.id,
    required this.origin,
    required this.destination,
    required this.departureAt,
    required this.arrivalAt,
    required this.status,
    required this.classes,
    required this.segments,
    this.airline,
    this.durationMinutes,
  });

  final String id;
  final String origin;
  final String destination;
  final String departureAt;
  final String arrivalAt;
  final String status;
  final String? airline;
  final int? durationMinutes;
  final List<FlightClass> classes;
  final List<ReservationFlightSegment> segments;

  bool get hasData =>
      origin.isNotEmpty ||
      destination.isNotEmpty ||
      departureAt.isNotEmpty ||
      arrivalAt.isNotEmpty ||
      segments.isNotEmpty;

  String get routeLabel {
    final from = origin.isEmpty ? '--' : origin;
    final to = destination.isEmpty ? '--' : destination;
    return '$from -> $to';
  }

  String? cabinClassForPassenger(ReservationPassenger passenger) {
    if (passenger.cabinClass != null && passenger.cabinClass!.isNotEmpty) {
      return passenger.cabinClass;
    }
    final id = passenger.flightClassId;
    if (id == null || id.isEmpty) return null;
    for (final item in classes) {
      if (item.id == id) return item.cabinClass;
    }
    return null;
  }

  String? selectedCabinClass(List<ReservationPassenger> passengers) {
    for (final passenger in passengers) {
      final cabin = cabinClassForPassenger(passenger);
      if (cabin != null && cabin.isNotEmpty) return cabin;
    }
    return classes.length == 1 ? classes.first.cabinClass : null;
  }

  factory ReservationFlightSummary.fromJson(Map<String, dynamic> json) {
    final segments = (json['segments'] as List<dynamic>? ?? [])
        .map(
          (item) =>
              ReservationFlightSegment.fromJson(item as Map<String, dynamic>),
        )
        .toList();
    final classes =
        (json['flightClasses'] as List<dynamic>? ??
                json['classes'] as List<dynamic>? ??
                [])
            .map((item) => FlightClass.fromJson(item as Map<String, dynamic>))
            .toList();
    final firstSegment = segments.isEmpty ? null : segments.first;
    final lastSegment = segments.isEmpty ? null : segments.last;
    final airline =
        firstSegment?.airline ??
        asStringMap(json['airline'])?['name']?.toString();

    return ReservationFlightSummary(
      id: json['id']?.toString() ?? '',
      origin:
          firstSegment?.origin ?? json['originAirportIata']?.toString() ?? '',
      destination:
          lastSegment?.destination ??
          json['destinationAirportIata']?.toString() ??
          '',
      departureAt:
          firstSegment?.departureAt ??
          json['departureDateTime']?.toString() ??
          json['departureDate']?.toString() ??
          '',
      arrivalAt:
          lastSegment?.arrivalAt ?? json['arrivalDateTime']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      airline: airline,
      durationMinutes:
          _int(json['durationMinutes'] ?? json['duration']) ??
          (segments.isEmpty
              ? null
              : segments.fold<int>(
                  0,
                  (sum, item) => sum + (item.durationMinutes ?? 0),
                )),
      classes: classes,
      segments: segments,
    );
  }
}

class ReservationFlightSegment {
  ReservationFlightSegment({
    required this.segmentNumber,
    required this.origin,
    required this.destination,
    required this.departureAt,
    required this.arrivalAt,
    this.airline,
    this.durationMinutes,
  });

  final String segmentNumber;
  final String origin;
  final String destination;
  final String departureAt;
  final String arrivalAt;
  final String? airline;
  final int? durationMinutes;

  String get routeLabel {
    final from = origin.isEmpty ? '--' : origin;
    final to = destination.isEmpty ? '--' : destination;
    return '$from -> $to';
  }

  factory ReservationFlightSegment.fromJson(Map<String, dynamic> json) {
    final originAirport = asStringMap(json['originAirport']);
    final destinationAirport = asStringMap(json['destinationAirport']);
    final airline = asStringMap(json['airline']);

    return ReservationFlightSegment(
      segmentNumber: json['segmentNumber']?.toString() ?? '',
      origin:
          airportCode(originAirport) ??
          json['originAirportIata']?.toString() ??
          '',
      destination:
          airportCode(destinationAirport) ??
          json['destinationAirportIata']?.toString() ??
          '',
      departureAt: json['departureDateTime']?.toString() ?? '',
      arrivalAt: json['arrivalDateTime']?.toString() ?? '',
      airline: airline?['name']?.toString() ?? airline?['iataCode']?.toString(),
      durationMinutes: _int(
        json['estimatedDuration'] ?? json['durationMinutes'],
      ),
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
Map<String, dynamic>? asStringMap(Object? value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) return Map<String, dynamic>.from(value);
  return null;
}

String? airportCode(Map<String, dynamic>? airport) {
  final code = airport?['iataCode']?.toString();
  if (code != null && code.isNotEmpty) return code;
  return airport?['name']?.toString();
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
  'PAGO NO DISP.' => _kAmber,
  'CANCELLED' || 'CANCELADO' => _kRed,
  _ => _kBlue,
};

Color _cabinColor(String cabin) => switch (cabin.toUpperCase()) {
  'FIRST' => _kAmber,
  'BUSINESS' => const Color(0xFF7C3AED),
  'PREMIUM_ECONOMY' => const Color(0xFF0891B2),
  _ => _kGreen,
};

String _cabinLabel(String cabin) => switch (cabin.toUpperCase()) {
  'ECONOMY' => 'Economy',
  'PREMIUM_ECONOMY' => 'Premium Eco',
  'BUSINESS' => 'Business',
  'FIRST' => 'Primera Clase',
  _ => cabin.replaceAll('_', ' '),
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
  int _refreshTrigger = 0;

  void _onReservationCreated() {
    setState(() {
      _refreshTrigger++;
      index = 1;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isAdmin = session?.role == 'ADMIN';

    final screens = <Widget>[
      SearchScreen(api: api, onReservationCreated: _onReservationCreated),
      TripsScreen(
        api: api,
        isLoggedIn: session != null,
        refreshTrigger: _refreshTrigger,
      ),
      AccountScreen(
        api: api,
        session: session,
        onSessionChanged: (value) => setState(() => session = value),
      ),
      if (isAdmin)
        AdminPanelScreen(token: api.token, userName: session?.userName),
    ];

    final destinations = <NavigationDestination>[
      const NavigationDestination(
        icon: Icon(Icons.flight_takeoff_outlined),
        selectedIcon: Icon(Icons.flight_takeoff),
        label: 'Buscar',
      ),
      const NavigationDestination(
        icon: Icon(Icons.confirmation_num_outlined),
        selectedIcon: Icon(Icons.confirmation_num),
        label: 'Mis Viajes',
      ),
      const NavigationDestination(
        icon: Icon(Icons.person_outline),
        selectedIcon: Icon(Icons.person),
        label: 'Cuenta',
      ),
      if (isAdmin)
        const NavigationDestination(
          icon: Icon(Icons.admin_panel_settings_outlined),
          selectedIcon: Icon(Icons.admin_panel_settings),
          label: 'Admin',
        ),
    ];

    // Evita un índice fuera de rango si el usuario admin cierra sesión
    // mientras estaba en la pestaña Admin.
    final safeIndex = index >= screens.length ? 0 : index;

    return Scaffold(
      body: IndexedStack(index: safeIndex, children: screens),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
        ),
        child: NavigationBar(
          selectedIndex: safeIndex,
          onDestinationSelected: (value) => setState(() => index = value),
          destinations: destinations,
        ),
      ),
    );
  }
}

// ─── SearchScreen ─────────────────────────────────────────────────────────────
class SearchScreen extends StatefulWidget {
  const SearchScreen({
    super.key,
    required this.api,
    required this.onReservationCreated,
  });

  final ApiClient api;
  final VoidCallback onReservationCreated;

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
      setState(() {
        flights = [];
        statusText = 'No se pudieron cargar recomendados: ${err.message}';
      });
      showMessage(context, err.message);
    } catch (err) {
      if (!mounted) return;
      final msg = connectionErrorMessage(err);
      setState(() {
        flights = [];
        statusText = msg;
      });
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
          .where(
            (f) =>
                f.origin == route.origin && f.destination == route.destination,
          )
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
      setState(
        () => statusText = 'No se pudo consultar la ruta: ${err.message}',
      );
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
            child: _AviationHeader(loading: loading, onSearch: search),
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
                    const Icon(
                      Icons.list_alt_rounded,
                      size: 18,
                      color: Color(0xFF64748B),
                    ),
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
                        horizontal: 10,
                        vertical: 3,
                      ),
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
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, i) => Padding(
                padding: EdgeInsets.fromLTRB(
                  16,
                  0,
                  16,
                  i == flights.length - 1 ? 24 : 0,
                ),
                child: FlightTile(
                  flight: flights[i],
                  onReserve: (fc) => showReservationSheet(
                    context,
                    widget.api,
                    fc,
                    onCreated: widget.onReservationCreated,
                  ),
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
                  child: const Icon(
                    Icons.travel_explore,
                    color: Colors.white,
                    size: 26,
                  ),
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
                      horizontal: 16,
                      vertical: 10,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    textStyle: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                  onPressed: loading ? null : onSearch,
                  icon: loading
                      ? const SizedBox.square(
                          dimension: 14,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: _kBlue,
                          ),
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
          BorderSide(color: Color(0xFFE2E8F0)),
        ),
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
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.5,
                  ),
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
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  tooltip: 'Intercambiar',
                ),
              ),
              Expanded(
                child: TextField(
                  controller: widget.destination,
                  textCapitalization: TextCapitalization.characters,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.5,
                  ),
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
                        prefixIcon: Icon(
                          Icons.calendar_today_outlined,
                          size: 18,
                        ),
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
                    BorderSide(color: Color(0xFFCBD5E1)),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      onPressed: _decPax,
                      icon: const Icon(Icons.remove, size: 18),
                      color: _pax > 1 ? _kBlue : Colors.grey.shade400,
                      style: IconButton.styleFrom(
                        minimumSize: const Size(36, 36),
                      ),
                    ),
                    Column(
                      children: [
                        const Icon(
                          Icons.person_outline,
                          size: 14,
                          color: Color(0xFF64748B),
                        ),
                        Text(
                          '$_pax',
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 15,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      onPressed: _pax < 9 ? _incPax : null,
                      icon: const Icon(Icons.add, size: 18),
                      color: _pax < 9 ? _kBlue : Colors.grey.shade400,
                      style: IconButton.styleFrom(
                        minimumSize: const Size(36, 36),
                      ),
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
                label: Text('Economy'),
              ),
              ButtonSegment(
                value: 'BUSINESS',
                icon: Icon(Icons.airline_seat_flat, size: 16),
                label: Text('Business'),
              ),
              ButtonSegment(
                value: 'FIRST',
                icon: Icon(Icons.star_outline, size: 16),
                label: Text('First'),
              ),
            ],
            selected: {widget.cabinClass},
            onSelectionChanged: (s) => widget.onCabinChanged(s.first),
            style: ButtonStyle(visualDensity: VisualDensity.compact),
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
          height: 116,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            clipBehavior: Clip.none,
            itemCount: recommendedRoutes.length,
            separatorBuilder: (_, _) => const SizedBox(width: 12),
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
                                Icon(
                                  route.icon,
                                  color: Colors.white.withValues(alpha: 0.9),
                                  size: 20,
                                ),
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
  const FlightTile({super.key, required this.flight, required this.onReserve});

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
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(8),
                    border: const Border.fromBorderSide(
                      BorderSide(color: Color(0xFFDBEAFE)),
                    ),
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
                  _InfoChip(icon: Icons.schedule_outlined, label: duration),
                const SizedBox(width: 6),
                _InfoChip(
                  icon: stops == 0
                      ? Icons.check_circle_outline
                      : Icons.connecting_airports_outlined,
                  label: stops == 0
                      ? 'Directo'
                      : '$stops escala${stops > 1 ? 's' : ''}',
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
                            const Icon(Icons.flight, size: 18, color: _kBlue),
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
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 14),
            const Divider(),
            const SizedBox(height: 6),
            // Classes
            ...flight.classes.map(
              (fc) =>
                  _ClassRow(flightClass: fc, onReserve: () => onReserve(fc)),
            ),
          ],
        ),
      ),
    );
  }
}

class _ClassRow extends StatelessWidget {
  const _ClassRow({required this.flightClass, required this.onReserve});

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
                color: color,
              ),
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
              color: hasSeats
                  ? const Color(0xFF1E293B)
                  : const Color(0xFF94A3B8),
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
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
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
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Trips Screen ─────────────────────────────────────────────────────────────
class TripsScreen extends StatefulWidget {
  const TripsScreen({
    super.key,
    required this.api,
    required this.isLoggedIn,
    required this.refreshTrigger,
  });

  final ApiClient api;
  final bool isLoggedIn;
  final int refreshTrigger;

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
    if (widget.isLoggedIn && !oldWidget.isLoggedIn) load();
    if (widget.refreshTrigger != oldWidget.refreshTrigger &&
        widget.isLoggedIn) {
      load();
    }
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
                      child: const Icon(
                        Icons.confirmation_num,
                        color: Colors.white,
                        size: 22,
                      ),
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
                              fontSize: 13,
                            ),
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
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (context, i) => _ReservationCard(
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
  const _ReservationCard({required this.reservation, required this.onTap});

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
                    child: const Icon(
                      Icons.airplane_ticket_outlined,
                      color: _kBlue,
                      size: 20,
                    ),
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
                            fontSize: 12,
                            color: Color(0xFF94A3B8),
                          ),
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
                      fontSize: 12,
                      color: Color(0xFF64748B),
                    ),
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
                  Icon(
                    Icons.chevron_right_rounded,
                    color: Colors.grey.shade400,
                  ),
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
  // ── Login / Register controllers ──────────────────────────────────────────
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _firstName = TextEditingController();
  final _firstLastName = TextEditingController();
  final _phone = TextEditingController();
  final _mainAddress = TextEditingController();
  bool _loading = false;
  bool _registering = false;
  bool _obscure = true;
  bool _saving = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _firstName.dispose();
    _firstLastName.dispose();
    _phone.dispose();
    _mainAddress.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    FocusScope.of(context).unfocus();
    if (_email.text.trim().isEmpty || _password.text.isEmpty) {
      showMessage(context, 'Ingresa email y password');
      return;
    }
    setState(() => _loading = true);
    try {
      final s = await widget.api.login(_email.text, _password.text);
      if (!mounted) return;
      widget.onSessionChanged(s);
      showMessage(context, 'Sesion iniciada');
    } on ApiException catch (err) {
      if (!mounted) return;
      showMessage(context, err.message);
    } catch (err) {
      if (!mounted) return;
      showMessage(context, connectionErrorMessage(err));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _register() async {
    FocusScope.of(context).unfocus();
    if (_email.text.trim().isEmpty || _password.text.isEmpty) {
      showMessage(context, 'Ingresa email y password');
      return;
    }
    if (_password.text.length < 6) {
      showMessage(context, 'El password debe tener al menos 6 caracteres');
      return;
    }
    if (_firstName.text.trim().isEmpty || _firstLastName.text.trim().isEmpty) {
      showMessage(context, 'Completa nombre y apellido');
      return;
    }
    setState(() => _loading = true);
    try {
      final s = await widget.api.register(
        RegisterInput(
          email: _email.text,
          password: _password.text,
          firstName: _firstName.text,
          firstLastName: _firstLastName.text,
          phone: _phone.text,
          mainAddress: _mainAddress.text,
        ),
      );
      if (!mounted) return;
      widget.onSessionChanged(s);
      showMessage(context, 'Cuenta creada');
    } on ApiException catch (err) {
      if (!mounted) return;
      showMessage(context, err.message);
    } catch (err) {
      if (!mounted) return;
      showMessage(context, connectionErrorMessage(err));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  // ── Profile editing ────────────────────────────────────────────────────────
  Future<void> _editField({
    required String label,
    required String current,
    required String fieldKey,
    TextInputType keyboard = TextInputType.text,
    TextCapitalization cap = TextCapitalization.words,
    int? maxLength,
  }) async {
    final ctrl = TextEditingController(text: current);
    final result = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Editar $label',
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
        ),
        content: TextField(
          controller: ctrl,
          keyboardType: keyboard,
          textCapitalization: cap,
          maxLength: maxLength,
          autofocus: true,
          decoration: InputDecoration(labelText: label),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, ctrl.text.trim()),
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
    ctrl.dispose();
    if (result == null || result == current || !mounted) return;

    setState(() => _saving = true);
    try {
      await widget.api.updateProfile(
        firstName: fieldKey == 'firstName' ? result : null,
        firstLastName: fieldKey == 'firstLastName' ? result : null,
        phone: fieldKey == 'phone' ? result : null,
        mainAddress: fieldKey == 'mainAddress' ? result : null,
      );
      if (!mounted) return;
      widget.onSessionChanged(
        widget.session!.copyWith(
          firstName: fieldKey == 'firstName' ? result : null,
          firstLastName: fieldKey == 'firstLastName' ? result : null,
          phone: fieldKey == 'phone' ? result : null,
          mainAddress: fieldKey == 'mainAddress' ? result : null,
        ),
      );
      showMessage(context, '$label actualizado');
    } on ApiException catch (err) {
      if (!mounted) return;
      // Si el endpoint no existe todavía, actualizamos solo localmente
      if (err.message.contains('404') ||
          err.message.toLowerCase().contains('not found')) {
        widget.onSessionChanged(
          widget.session!.copyWith(
            firstName: fieldKey == 'firstName' ? result : null,
            firstLastName: fieldKey == 'firstLastName' ? result : null,
            phone: fieldKey == 'phone' ? result : null,
            mainAddress: fieldKey == 'mainAddress' ? result : null,
          ),
        );
        showMessage(context, '$label actualizado (local)');
      } else {
        showMessage(context, err.message);
      }
    } catch (_) {
      if (!mounted) return;
      // Actualizar localmente aunque falle la red
      widget.onSessionChanged(
        widget.session!.copyWith(
          firstName: fieldKey == 'firstName' ? result : null,
          firstLastName: fieldKey == 'firstLastName' ? result : null,
          phone: fieldKey == 'phone' ? result : null,
          mainAddress: fieldKey == 'mainAddress' ? result : null,
        ),
      );
      showMessage(context, '$label actualizado (local)');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = widget.session;

    if (session == null) return _buildLoginView();
    return _buildProfileView(session);
  }

  // ── Vista Login / Registro ─────────────────────────────────────────────────
  Widget _buildLoginView() {
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
                  child: const Icon(
                    Icons.person_outline,
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
                      'Accede para gestionar tus reservas',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 13,
                      ),
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
                SegmentedButton<bool>(
                  segments: const [
                    ButtonSegment(
                      value: false,
                      icon: Icon(Icons.login, size: 16),
                      label: Text('Ingresar'),
                    ),
                    ButtonSegment(
                      value: true,
                      icon: Icon(Icons.person_add_outlined, size: 16),
                      label: Text('Crear cuenta'),
                    ),
                  ],
                  selected: {_registering},
                  onSelectionChanged: _loading
                      ? null
                      : (v) => setState(() => _registering = v.first),
                ),
                const SizedBox(height: 16),
                InfoBanner(
                  icon: Icons.info_outline,
                  text: _registering
                      ? 'Crea una cuenta para reservar, consultar viajes y pagar desde el movil.'
                      : 'Usa una cuenta existente. Si no tienes usuario, cambia a Crear cuenta.',
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  autocorrect: false,
                  decoration: const InputDecoration(
                    labelText: 'Correo electronico',
                    prefixIcon: Icon(Icons.email_outlined, size: 18),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _password,
                  obscureText: _obscure,
                  decoration: InputDecoration(
                    labelText: 'Contrasena',
                    prefixIcon: const Icon(Icons.lock_outline, size: 18),
                    suffixIcon: IconButton(
                      onPressed: () => setState(() => _obscure = !_obscure),
                      icon: Icon(
                        _obscure
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        size: 18,
                      ),
                    ),
                  ),
                ),
                if (_registering) ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _firstName,
                          decoration: const InputDecoration(
                            labelText: 'Nombre',
                            prefixIcon: Icon(Icons.badge_outlined, size: 18),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _firstLastName,
                          decoration: const InputDecoration(
                            labelText: 'Apellido',
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _phone,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      labelText: 'Telefono (opcional)',
                      prefixIcon: Icon(Icons.phone_outlined, size: 18),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _mainAddress,
                    decoration: const InputDecoration(
                      labelText: 'Direccion (opcional)',
                      prefixIcon: Icon(Icons.home_outlined, size: 18),
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _loading
                        ? null
                        : (_registering ? _register : _login),
                    icon: _loading
                        ? const SizedBox.square(
                            dimension: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Icon(_registering ? Icons.person_add : Icons.login),
                    label: Text(
                      _registering ? 'Crear cuenta' : 'Iniciar sesion',
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Vista Perfil ───────────────────────────────────────────────────────────
  Widget _buildProfileView(AuthSession session) {
    final initials = _initials(session);

    return SafeArea(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          // ── Hero del perfil ──────────────────────────────────────────────
          Container(
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [_kNavy, Color(0xFF1E3A8A), _kBlue],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Stack(
              children: [
                Positioned.fill(
                  child: Align(
                    alignment: Alignment.bottomRight,
                    child: Icon(
                      Icons.person,
                      size: 180,
                      color: Colors.white.withValues(alpha: 0.04),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(0, 32, 0, 28),
                  child: Column(
                    children: [
                      // Avatar grande
                      CircleAvatar(
                        radius: 46,
                        backgroundColor: Colors.white.withValues(alpha: 0.18),
                        child: CircleAvatar(
                          radius: 42,
                          backgroundColor: Colors.white.withValues(alpha: 0.25),
                          child: Text(
                            initials,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 30,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        session.userName.isEmpty ? 'Usuario' : session.userName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      if (session.email != null &&
                          session.email!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          session.email!,
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.7),
                            fontSize: 13,
                          ),
                        ),
                      ],
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.25),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.verified,
                              color: Colors.white,
                              size: 14,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              session.role,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
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
          ),

          // ── Información personal ─────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_saving)
                  const Padding(
                    padding: EdgeInsets.only(bottom: 10),
                    child: LinearProgressIndicator(minHeight: 2, color: _kBlue),
                  ),
                _SectionHeader(label: 'Informacion personal'),
                const SizedBox(height: 8),
                _ProfileCard(
                  children: [
                    _ProfileField(
                      icon: Icons.badge_outlined,
                      label: 'Nombre',
                      value: session.firstName?.isNotEmpty == true
                          ? session.firstName!
                          : 'Sin nombre',
                      onEdit: () => _editField(
                        label: 'Nombre',
                        current: session.firstName ?? '',
                        fieldKey: 'firstName',
                      ),
                    ),
                    _FieldDivider(),
                    _ProfileField(
                      icon: Icons.badge_outlined,
                      label: 'Apellido',
                      value: session.firstLastName?.isNotEmpty == true
                          ? session.firstLastName!
                          : 'Sin apellido',
                      onEdit: () => _editField(
                        label: 'Apellido',
                        current: session.firstLastName ?? '',
                        fieldKey: 'firstLastName',
                      ),
                    ),
                    _FieldDivider(),
                    _ProfileField(
                      icon: Icons.email_outlined,
                      label: 'Correo electronico',
                      value: session.email?.isNotEmpty == true
                          ? session.email!
                          : 'Sin correo',
                      readOnly: true,
                    ),
                    _FieldDivider(),
                    _ProfileField(
                      icon: Icons.phone_outlined,
                      label: 'Telefono',
                      value: session.phone?.isNotEmpty == true
                          ? session.phone!
                          : 'Sin telefono',
                      onEdit: () => _editField(
                        label: 'Telefono',
                        current: session.phone ?? '',
                        fieldKey: 'phone',
                        keyboard: TextInputType.phone,
                        cap: TextCapitalization.none,
                      ),
                    ),
                    _FieldDivider(),
                    _ProfileField(
                      icon: Icons.home_outlined,
                      label: 'Direccion principal',
                      value:
                          (session.mainAddress?.isNotEmpty == true &&
                              session.mainAddress != 'Sin direccion')
                          ? session.mainAddress!
                          : 'Sin direccion',
                      onEdit: () => _editField(
                        label: 'Direccion',
                        current: session.mainAddress == 'Sin direccion'
                            ? ''
                            : (session.mainAddress ?? ''),
                        fieldKey: 'mainAddress',
                        cap: TextCapitalization.sentences,
                        maxLength: 120,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),
                _SectionHeader(label: 'Sesion'),
                const SizedBox(height: 8),
                // Cerrar sesion
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: const Border.fromBorderSide(
                      BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                  ),
                  child: InkWell(
                    onTap: () {
                      widget.api.token = null;
                      widget.onSessionChanged(null);
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: _kRed.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.logout,
                              color: _kRed,
                              size: 18,
                            ),
                          ),
                          const SizedBox(width: 14),
                          const Expanded(
                            child: Text(
                              'Cerrar sesion',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 15,
                                color: Color(0xFF1E293B),
                              ),
                            ),
                          ),
                          Icon(
                            Icons.chevron_right,
                            color: Colors.grey.shade400,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static String _initials(AuthSession s) {
    final parts = s.userName.split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
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
            child: Icon(
              icon,
              size: 120,
              color: Colors.white.withValues(alpha: 0.06),
            ),
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
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
                if (action != null) ...[const SizedBox(width: 10), action!],
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
  FlightClass flightClass, {
  VoidCallback? onCreated,
}) async {
  final firstName = TextEditingController();
  final lastName = TextEditingController();
  final document = TextEditingController();
  final promotion = TextEditingController();
  final cardNumber = TextEditingController();
  final cardExpiry = TextEditingController();
  final cardCvv = TextEditingController();
  final cardHolder = TextEditingController();
  bool loading = false;
  String provider = 'VISA';
  String? selectedSeat;

  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (sheetContext) {
      return StatefulBuilder(
        builder: (context, setState) {
          Future<void> pickSeat() async {
            final seat = await showSeatMap(context, api, flightClass);
            if (seat != null) setState(() => selectedSeat = seat);
          }

          String? validatePayment() {
            final raw = cardNumber.text.replaceAll(RegExp(r'\D'), '');
            if (raw.length != 16) {
              return 'Numero de tarjeta invalido (16 digitos)';
            }
            if (!_isValidExpiry(cardExpiry.text)) {
              return 'Fecha de vencimiento invalida (MM/AA)';
            }
            final cvv = cardCvv.text.replaceAll(RegExp(r'\D'), '');
            if (cvv.length < 3 || cvv.length > 4) {
              return 'CVV invalido';
            }
            if (cardHolder.text.trim().isEmpty) {
              return 'Ingresa el nombre del titular';
            }
            return null;
          }

          Future<void> submit() async {
            if (api.token == null) {
              showMessage(context, 'Inicia sesion para reservar y pagar');
              return;
            }
            if (firstName.text.trim().isEmpty ||
                lastName.text.trim().isEmpty ||
                document.text.trim().isEmpty) {
              showMessage(context, 'Completa los datos del pasajero');
              return;
            }
            if (selectedSeat == null) {
              showMessage(context, 'Selecciona un asiento antes de confirmar');
              return;
            }
            final paymentError = validatePayment();
            if (paymentError != null) {
              showMessage(context, paymentError);
              return;
            }
            setState(() => loading = true);
            Reservation? createdReservation;
            try {
              final occupied = await api.occupiedSeats(flightClass.id);
              final seat = selectedSeat!.trim().toUpperCase();
              if (occupied.contains(seat)) {
                if (!context.mounted) return;
                setState(() => selectedSeat = null);
                showMessage(context, 'Asiento ya reservado: $seat');
                return;
              }
              await Future<void>.delayed(const Duration(milliseconds: 700));
              final reservation = await api.createReservation(
                flightClassId: flightClass.id,
                passenger: PassengerInput(
                  firstName: firstName.text,
                  lastName: lastName.text,
                  documentNumber: document.text,
                  seatNumber: seat,
                ),
                promotionCode: promotion.text,
              );
              createdReservation = reservation;
              await api.payReservation(reservation, provider);
              if (!context.mounted || !sheetContext.mounted) return;
              Navigator.pop(sheetContext);
              showMessage(
                context,
                'Reserva ${reservation.code} pagada - Asiento $seat',
              );
              onCreated?.call();
            } on ApiException catch (err) {
              if (!context.mounted) return;
              if (createdReservation != null) {
                try {
                  await api.cancelReservation(createdReservation.id);
                } catch (_) {}
                showMessage(
                  context,
                  'No se pudo registrar el pago; se libero el asiento. ${err.message}',
                );
              } else {
                showMessage(
                  context,
                  isSeatAlreadyReservedError(err)
                      ? 'Asiento ya reservado. Elige otro.'
                      : err.message,
                );
              }
            } catch (err) {
              if (!context.mounted) return;
              if (createdReservation != null) {
                try {
                  await api.cancelReservation(createdReservation.id);
                } catch (_) {}
                showMessage(
                  context,
                  'No se pudo completar el pago; se libero el asiento.',
                );
              } else {
                showMessage(context, connectionErrorMessage(err));
              }
            } finally {
              if (context.mounted) setState(() => loading = false);
            }
          }

          return Padding(
            padding: EdgeInsets.fromLTRB(
              20,
              12,
              20,
              MediaQuery.of(context).viewInsets.bottom + 20,
            ),
            child: SingleChildScrollView(
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
                        child: const Icon(
                          Icons.airplane_ticket_outlined,
                          color: _kBlue,
                          size: 20,
                        ),
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
                                color: Color(0xFF64748B),
                                fontSize: 13,
                              ),
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
                      color: Color(0xFF64748B),
                    ),
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
                  const SizedBox(height: 14),
                  // ── Selector de asiento ──────────────────────────────────────
                  GestureDetector(
                    onTap: loading ? null : pickSeat,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: selectedSeat != null
                            ? _kGreen.withValues(alpha: 0.08)
                            : const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: selectedSeat != null
                              ? _kGreen.withValues(alpha: 0.5)
                              : const Color(0xFFCBD5E1),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            selectedSeat != null
                                ? Icons.event_seat
                                : Icons.event_seat_outlined,
                            color: selectedSeat != null
                                ? _kGreen
                                : const Color(0xFF64748B),
                            size: 20,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              selectedSeat != null
                                  ? 'Asiento seleccionado: $selectedSeat'
                                  : 'Seleccionar asiento (obligatorio)',
                              style: TextStyle(
                                color: selectedSeat != null
                                    ? _kGreen
                                    : const Color(0xFF64748B),
                                fontWeight: selectedSeat != null
                                    ? FontWeight.w700
                                    : FontWeight.normal,
                              ),
                            ),
                          ),
                          Icon(
                            Icons.chevron_right,
                            color: selectedSeat != null
                                ? _kGreen
                                : Colors.grey.shade400,
                            size: 18,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Pasarela de pago',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: provider,
                    decoration: const InputDecoration(
                      labelText: 'Metodo de pago',
                      prefixIcon: Icon(
                        Icons.account_balance_wallet_outlined,
                        size: 18,
                      ),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'VISA', child: Text('Visa')),
                      DropdownMenuItem(
                        value: 'MASTERCARD',
                        child: Text('Mastercard'),
                      ),
                    ],
                    onChanged: loading
                        ? null
                        : (value) => setState(() => provider = value ?? 'VISA'),
                  ),
                  const SizedBox(height: 12),
                  _CardForm(
                    brand: provider,
                    cardNumber: cardNumber,
                    expiry: cardExpiry,
                    cvv: cardCvv,
                    holder: cardHolder,
                    enabled: !loading,
                  ),
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total a pagar',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF64748B),
                          ),
                        ),
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
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.check_circle_outline),
                    label: Text(
                      loading ? 'Procesando...' : 'Confirmar y pagar',
                    ),
                  ),
                ],
              ),
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
  bool cancelling = false;
  late Future<ReservationDetail> detailFuture = api.reservationDetail(
    reservation.id,
  );

  // Campos de tarjeta de crédito
  final cardNumber = TextEditingController();
  final cardExpiry = TextEditingController();
  final cardCvv = TextEditingController();
  final cardHolder = TextEditingController();
  final paypalEmail = TextEditingController();
  final transferRef = TextEditingController();

  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (sheetContext) {
      return StatefulBuilder(
        builder: (context, setState) {
          Future<void> pay() async {
            // Validar campos según método
            if (provider == 'VISA' || provider == 'MASTERCARD') {
              final raw = cardNumber.text.replaceAll(' ', '');
              if (raw.length < 16) {
                showMessage(context, 'Numero de tarjeta invalido (16 digitos)');
                return;
              }
              if (!_isValidExpiry(cardExpiry.text)) {
                showMessage(context, 'Fecha de vencimiento invalida (MM/AA)');
                return;
              }
              if (cardCvv.text.length < 3) {
                showMessage(context, 'CVV invalido');
                return;
              }
              if (cardHolder.text.trim().isEmpty) {
                showMessage(context, 'Ingresa el nombre del titular');
                return;
              }
            } else if (provider == 'PAYPAL') {
              if (!paypalEmail.text.contains('@')) {
                showMessage(context, 'Ingresa un email de PayPal valido');
                return;
              }
            }
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

          Future<void> cancel() async {
            final confirm = await showDialog<bool>(
              context: context,
              builder: (ctx) => AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                title: const Text(
                  'Cancelar reserva',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
                ),
                content: Text(
                  'Se cancelara la reserva ${reservation.code}. Esta accion no se puede deshacer.',
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(ctx, false),
                    child: const Text('Volver'),
                  ),
                  FilledButton(
                    style: FilledButton.styleFrom(backgroundColor: _kRed),
                    onPressed: () => Navigator.pop(ctx, true),
                    child: const Text('Cancelar reserva'),
                  ),
                ],
              ),
            );
            if (confirm != true) return;
            setState(() => cancelling = true);
            try {
              await api.cancelReservation(reservation.id);
              await onChanged();
              if (!context.mounted) return;
              Navigator.pop(sheetContext);
              showMessage(context, 'Reserva cancelada');
            } on ApiException catch (err) {
              if (!context.mounted) return;
              showMessage(context, err.message);
            } catch (err) {
              if (!context.mounted) return;
              showMessage(context, connectionErrorMessage(err));
            } finally {
              if (context.mounted) setState(() => cancelling = false);
            }
          }

          return SizedBox(
            height: MediaQuery.of(context).size.height * 0.88,
            child: FutureBuilder<ReservationDetail>(
              future: detailFuture,
              builder: (context, snapshot) {
                final detail = snapshot.data;
                final displayReservation = detail?.reservation ?? reservation;
                return Column(
                  children: [
                    // Fixed header
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                      child: Column(
                        children: [
                          const _SheetHandle(),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      displayReservation.code,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w800,
                                        fontSize: 20,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                    Row(
                                      children: [
                                        _StatusBadge(displayReservation.status),
                                        const SizedBox(width: 8),
                                        if (detail != null)
                                          _StatusBadge(
                                            detail.paymentLookupError != null
                                                ? 'PAGO NO DISP.'
                                                : (detail.isPaid
                                                      ? 'PAGADO'
                                                      : 'PENDIENTE PAGO'),
                                          ),
                                      ],
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
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      formatDateTime(
                                        displayReservation.createdAt,
                                      ),
                                      style: TextStyle(
                                        color: Colors.white.withValues(
                                          alpha: 0.65,
                                        ),
                                        fontSize: 11,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    const Text(
                                      'Fecha de reserva',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    const Text(
                                      'Total',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 11,
                                      ),
                                    ),
                                    Text(
                                      '\$${displayReservation.total.toStringAsFixed(2)}',
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
                          20,
                          8,
                          20,
                          MediaQuery.of(context).viewInsets.bottom + 20,
                        ),
                        children: [
                          if (snapshot.connectionState ==
                              ConnectionState.waiting)
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 24),
                              child: Center(
                                child: CircularProgressIndicator(color: _kBlue),
                              ),
                            ),
                          if (snapshot.hasError)
                            EmptyState(
                              icon: Icons.cloud_off,
                              title: 'No se pudo cargar el detalle',
                              text: snapshot.error.toString(),
                            ),
                          if (detail != null) ...[
                            const SizedBox(height: 8),
                            if (detail.flight != null &&
                                detail.flight!.hasData) ...[
                              _SectionTitle(
                                icon: Icons.flight_takeoff,
                                title: 'Vuelo',
                              ),
                              const SizedBox(height: 8),
                              _FlightSummaryCard(
                                flight: detail.flight!,
                                cabinClass: detail.flight!.selectedCabinClass(
                                  detail.passengers,
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],
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
                                  margin: const EdgeInsets.only(bottom: 8),
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(12),
                                    border: const Border.fromBorderSide(
                                      BorderSide(color: Color(0xFFE2E8F0)),
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      CircleAvatar(
                                        radius: 18,
                                        backgroundColor: const Color(
                                          0xFFDBEAFE,
                                        ),
                                        child: Text(
                                          p.firstName.isNotEmpty
                                              ? p.firstName[0].toUpperCase()
                                              : '?',
                                          style: const TextStyle(
                                            color: _kBlue,
                                            fontWeight: FontWeight.w800,
                                            fontSize: 14,
                                          ),
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
                                                fontWeight: FontWeight.w700,
                                              ),
                                            ),
                                            Text(
                                              p.documentNumber,
                                              style: const TextStyle(
                                                fontSize: 12,
                                                color: Color(0xFF64748B),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (p.seatNumber != null)
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 4,
                                          ),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFDBEAFE),
                                            borderRadius: BorderRadius.circular(
                                              6,
                                            ),
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
                            if (detail.paymentLookupError != null)
                              _InlineWarning(
                                title: 'Pagos no disponibles',
                                text: detail.paymentLookupError!,
                              )
                            else if (detail.payments.isEmpty)
                              const Text(
                                'Aun no hay pagos para esta reserva.',
                                style: TextStyle(color: Color(0xFF94A3B8)),
                              )
                            else
                              ...detail.payments.map(
                                (pay) => Container(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(12),
                                    border: const Border.fromBorderSide(
                                      BorderSide(color: Color(0xFFE2E8F0)),
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: _statusColor(
                                            pay.status,
                                          ).withValues(alpha: 0.1),
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
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
                                                fontWeight: FontWeight.w700,
                                                fontSize: 13,
                                              ),
                                            ),
                                            Text(
                                              formatDateTime(pay.createdAt),
                                              style: const TextStyle(
                                                fontSize: 11,
                                                color: Color(0xFF94A3B8),
                                              ),
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
                                              fontSize: 14,
                                            ),
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
                                    size: 18,
                                  ),
                                ),
                                items: const [
                                  DropdownMenuItem(
                                    value: 'VISA',
                                    child: Text('💳  Visa'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'MASTERCARD',
                                    child: Text('💳  Mastercard'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'PAYPAL',
                                    child: Text('🅿️  PayPal'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'TRANSFER',
                                    child: Text('🏦  Transferencia'),
                                  ),
                                ],
                                onChanged: paying
                                    ? null
                                    : (v) => setState(() => provider = v!),
                              ),
                              const SizedBox(height: 14),
                              // ── Formulario según método ──────────────────
                              if (provider == 'VISA' ||
                                  provider == 'MASTERCARD')
                                _CardForm(
                                  brand: provider,
                                  cardNumber: cardNumber,
                                  expiry: cardExpiry,
                                  cvv: cardCvv,
                                  holder: cardHolder,
                                  enabled: !paying,
                                )
                              else if (provider == 'PAYPAL') ...[
                                TextField(
                                  controller: paypalEmail,
                                  enabled: !paying,
                                  keyboardType: TextInputType.emailAddress,
                                  decoration: const InputDecoration(
                                    labelText: 'Email de PayPal',
                                    prefixIcon: Icon(
                                      Icons.email_outlined,
                                      size: 18,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                              ] else ...[
                                TextField(
                                  controller: transferRef,
                                  enabled: !paying,
                                  decoration: const InputDecoration(
                                    labelText: 'Referencia de transferencia',
                                    prefixIcon: Icon(
                                      Icons.tag_outlined,
                                      size: 18,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                              ],
                              const SizedBox(height: 4),
                              FilledButton.icon(
                                onPressed: paying ? null : pay,
                                icon: paying
                                    ? const SizedBox.square(
                                        dimension: 16,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      )
                                    : const Icon(Icons.lock_outline),
                                label: Text(
                                  paying
                                      ? 'Procesando...'
                                      : 'Pagar \$${displayReservation.total.toStringAsFixed(2)}',
                                ),
                              ),
                            ] else
                              Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: _kGreen.withValues(alpha: 0.08),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: _kGreen.withValues(alpha: 0.3),
                                  ),
                                ),
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.verified,
                                      color: _kGreen,
                                      size: 20,
                                    ),
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
                            if (displayReservation.status.toUpperCase() !=
                                    'CANCELLED' &&
                                displayReservation.status.toUpperCase() !=
                                    'CANCELADO') ...[
                              const SizedBox(height: 12),
                              OutlinedButton.icon(
                                onPressed: cancelling ? null : cancel,
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: _kRed,
                                  side: const BorderSide(color: _kRed),
                                  minimumSize: const Size.fromHeight(48),
                                ),
                                icon: cancelling
                                    ? const SizedBox.square(
                                        dimension: 16,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: _kRed,
                                        ),
                                      )
                                    : const Icon(Icons.cancel_outlined),
                                label: Text(
                                  cancelling
                                      ? 'Cancelando...'
                                      : 'Cancelar reserva',
                                ),
                              ),
                            ],
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

class _FlightSummaryCard extends StatelessWidget {
  const _FlightSummaryCard({required this.flight, required this.cabinClass});

  final ReservationFlightSummary flight;
  final String? cabinClass;

  @override
  Widget build(BuildContext context) {
    final duration = _durationLabel(flight.durationMinutes);
    final airline = flight.airline;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: const Border.fromBorderSide(
          BorderSide(color: Color(0xFFE2E8F0)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _kBlue.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.flight, size: 18, color: _kBlue),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  flight.routeLabel,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: _kNavy,
                  ),
                ),
              ),
              if (flight.status.isNotEmpty) _StatusBadge(flight.status),
            ],
          ),
          const SizedBox(height: 12),
          _TicketInfoRow(
            icon: Icons.schedule_outlined,
            label: 'Salida',
            value: formatDateTime(flight.departureAt),
          ),
          const SizedBox(height: 8),
          _TicketInfoRow(
            icon: Icons.flag_outlined,
            label: 'Llegada',
            value: formatDateTime(flight.arrivalAt),
          ),
          if (airline != null && airline.isNotEmpty) ...[
            const SizedBox(height: 8),
            _TicketInfoRow(
              icon: Icons.airlines_outlined,
              label: 'Aerolinea',
              value: airline,
            ),
          ],
          if (cabinClass != null && cabinClass!.isNotEmpty) ...[
            const SizedBox(height: 8),
            _TicketInfoRow(
              icon: Icons.airline_seat_recline_normal_outlined,
              label: 'Clase',
              value: _cabinLabel(cabinClass!),
            ),
          ],
          if (duration.isNotEmpty) ...[
            const SizedBox(height: 8),
            _TicketInfoRow(
              icon: Icons.timer_outlined,
              label: 'Duracion',
              value: duration,
            ),
          ],
          if (flight.segments.length > 1) ...[
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 10),
            const Text(
              'Tramos',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: Color(0xFF475569),
              ),
            ),
            const SizedBox(height: 6),
            ...flight.segments.map(
              (segment) => Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        segment.routeLabel,
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                    Text(
                      formatDateTime(segment.departureAt),
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _TicketInfoRow extends StatelessWidget {
  const _TicketInfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: const Color(0xFF64748B)),
        const SizedBox(width: 8),
        SizedBox(
          width: 78,
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF64748B),
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1E293B),
            ),
          ),
        ),
      ],
    );
  }
}

class _InlineWarning extends StatelessWidget {
  const _InlineWarning({required this.title, required this.text});

  final String title;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _kAmber.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kAmber.withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline, color: _kAmber, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Color(0xFF92400E),
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  text,
                  style: const TextStyle(
                    color: Color(0xFF92400E),
                    fontSize: 12,
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
  if (error is TimeoutException) {
    return 'La solicitud tardó demasiado (>25 s). Render puede estar iniciando — espera unos segundos y reintenta.';
  }
  return 'No se pudo conectar con la API. Revisa Internet o espera a que Render termine de iniciar.';
}

String paymentLookupErrorMessage(Object error) {
  if (error is ApiException) {
    return 'No se pudo consultar pagos: ${error.message}';
  }
  if (error is TimeoutException) {
    return 'No se pudo consultar pagos: la solicitud tardo demasiado.';
  }
  return 'No se pudo consultar pagos.';
}

String formatDateTime(String value) {
  if (value.isEmpty) return '--';
  final parsed = DateTime.tryParse(value);
  if (parsed == null) return value;
  final y = parsed.year.toString().padLeft(4, '0');
  final mo = parsed.month.toString().padLeft(2, '0');
  final d = parsed.day.toString().padLeft(2, '0');
  final h = parsed.hour.toString().padLeft(2, '0');
  final min = parsed.minute.toString().padLeft(2, '0');
  return '$y-$mo-$d $h:$min';
}

// ─── Credit Card Form ─────────────────────────────────────────────────────────
bool _isValidExpiry(String value) {
  final match = RegExp(r'^(\d{2})/(\d{2})$').firstMatch(value.trim());
  if (match == null) return false;
  final month = int.tryParse(match.group(1)!);
  final year = int.tryParse(match.group(2)!);
  if (month == null || year == null || month < 1 || month > 12) return false;
  final now = DateTime.now();
  final fullYear = 2000 + year;
  final lastDayOfMonth = DateTime(fullYear, month + 1, 0);
  return !lastDayOfMonth.isBefore(DateTime(now.year, now.month, 1));
}

class _CardForm extends StatefulWidget {
  const _CardForm({
    required this.brand,
    required this.cardNumber,
    required this.expiry,
    required this.cvv,
    required this.holder,
    required this.enabled,
  });

  final String brand;
  final TextEditingController cardNumber;
  final TextEditingController expiry;
  final TextEditingController cvv;
  final TextEditingController holder;
  final bool enabled;

  @override
  State<_CardForm> createState() => _CardFormState();
}

class _CardFormState extends State<_CardForm> {
  bool _obscureCvv = true;

  @override
  Widget build(BuildContext context) {
    final isVisa = widget.brand == 'VISA';
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isVisa
              ? [const Color(0xFF1A3A6B), const Color(0xFF1D4ED8)]
              : [const Color(0xFF4A1942), const Color(0xFFEB5757)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: (isVisa ? _kBlue : const Color(0xFFEB5757)).withValues(
              alpha: 0.3,
            ),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Text(
                isVisa ? 'VISA' : 'MASTERCARD',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.9),
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  fontStyle: FontStyle.italic,
                  letterSpacing: 2,
                ),
              ),
              const Spacer(),
              Icon(
                Icons.contactless,
                color: Colors.white.withValues(alpha: 0.7),
                size: 22,
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Chip simulado
          Container(
            width: 36,
            height: 26,
            decoration: BoxDecoration(
              color: const Color(0xFFD4AC0D),
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: const Color(0xFFB7950B)),
            ),
          ),
          const SizedBox(height: 14),
          // Número de tarjeta
          TextField(
            controller: widget.cardNumber,
            enabled: widget.enabled,
            keyboardType: TextInputType.number,
            maxLength: 19,
            inputFormatters: [_CardNumberFormatter()],
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w700,
              letterSpacing: 3,
            ),
            decoration: InputDecoration(
              counterText: '',
              labelText: 'Numero de tarjeta',
              labelStyle: TextStyle(
                color: Colors.white.withValues(alpha: 0.7),
                fontSize: 12,
              ),
              hintText: '0000 0000 0000 0000',
              hintStyle: TextStyle(
                color: Colors.white.withValues(alpha: 0.35),
                letterSpacing: 3,
              ),
              enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(
                  color: Colors.white.withValues(alpha: 0.3),
                ),
              ),
              focusedBorder: const UnderlineInputBorder(
                borderSide: BorderSide(color: Colors.white, width: 2),
              ),
              filled: false,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              // Vencimiento
              Expanded(
                child: TextField(
                  controller: widget.expiry,
                  enabled: widget.enabled,
                  keyboardType: TextInputType.number,
                  maxLength: 5,
                  inputFormatters: [_ExpiryFormatter()],
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                  decoration: InputDecoration(
                    counterText: '',
                    labelText: 'Vencimiento',
                    labelStyle: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 12,
                    ),
                    hintText: 'MM/AA',
                    hintStyle: TextStyle(
                      color: Colors.white.withValues(alpha: 0.35),
                    ),
                    enabledBorder: UnderlineInputBorder(
                      borderSide: BorderSide(
                        color: Colors.white.withValues(alpha: 0.3),
                      ),
                    ),
                    focusedBorder: const UnderlineInputBorder(
                      borderSide: BorderSide(color: Colors.white, width: 2),
                    ),
                    filled: false,
                  ),
                ),
              ),
              const SizedBox(width: 24),
              // CVV
              SizedBox(
                width: 90,
                child: TextField(
                  controller: widget.cvv,
                  enabled: widget.enabled,
                  keyboardType: TextInputType.number,
                  maxLength: 4,
                  obscureText: _obscureCvv,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                  decoration: InputDecoration(
                    counterText: '',
                    labelText: 'CVV',
                    labelStyle: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 12,
                    ),
                    hintText: '•••',
                    hintStyle: TextStyle(
                      color: Colors.white.withValues(alpha: 0.35),
                    ),
                    suffixIcon: GestureDetector(
                      onTap: () => setState(() => _obscureCvv = !_obscureCvv),
                      child: Icon(
                        _obscureCvv
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                        color: Colors.white.withValues(alpha: 0.6),
                        size: 16,
                      ),
                    ),
                    enabledBorder: UnderlineInputBorder(
                      borderSide: BorderSide(
                        color: Colors.white.withValues(alpha: 0.3),
                      ),
                    ),
                    focusedBorder: const UnderlineInputBorder(
                      borderSide: BorderSide(color: Colors.white, width: 2),
                    ),
                    filled: false,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Titular
          TextField(
            controller: widget.holder,
            enabled: widget.enabled,
            textCapitalization: TextCapitalization.characters,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              letterSpacing: 1,
            ),
            decoration: InputDecoration(
              labelText: 'Nombre del titular',
              labelStyle: TextStyle(
                color: Colors.white.withValues(alpha: 0.7),
                fontSize: 12,
              ),
              hintText: 'TAL COMO APARECE EN LA TARJETA',
              hintStyle: TextStyle(
                color: Colors.white.withValues(alpha: 0.25),
                fontSize: 11,
              ),
              enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(
                  color: Colors.white.withValues(alpha: 0.3),
                ),
              ),
              focusedBorder: const UnderlineInputBorder(
                borderSide: BorderSide(color: Colors.white, width: 2),
              ),
              filled: false,
            ),
          ),
          const SizedBox(height: 6),
        ],
      ),
    );
  }
}

// Formateador número de tarjeta: XXXX XXXX XXXX XXXX
class _CardNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue old,
    TextEditingValue next,
  ) {
    final digits = next.text.replaceAll(RegExp(r'\D'), '');
    final buffer = StringBuffer();
    for (int i = 0; i < digits.length && i < 16; i++) {
      if (i > 0 && i % 4 == 0) buffer.write(' ');
      buffer.write(digits[i]);
    }
    final str = buffer.toString();
    return TextEditingValue(
      text: str,
      selection: TextSelection.collapsed(offset: str.length),
    );
  }
}

// Formateador vencimiento: MM/AA
class _ExpiryFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue old,
    TextEditingValue next,
  ) {
    final digits = next.text.replaceAll(RegExp(r'\D'), '');
    if (digits.length <= 2) return next.copyWith(text: digits);
    final str =
        '${digits.substring(0, 2)}/${digits.substring(2, digits.length.clamp(0, 4))}';
    return TextEditingValue(
      text: str,
      selection: TextSelection.collapsed(offset: str.length),
    );
  }
}

// ─── Seat Map ─────────────────────────────────────────────────────────────────
Future<String?> showSeatMap(
  BuildContext context,
  ApiClient api,
  FlightClass flightClass,
) {
  return showModalBottomSheet<String>(
    context: context,
    isScrollControlled: true,
    builder: (_) => _SeatMapSheet(api: api, flightClass: flightClass),
  );
}

class _SeatMapSheet extends StatefulWidget {
  const _SeatMapSheet({required this.api, required this.flightClass});
  final ApiClient api;
  final FlightClass flightClass;

  @override
  State<_SeatMapSheet> createState() => _SeatMapSheetState();
}

class _SeatMapSheetState extends State<_SeatMapSheet> {
  String? _selected;
  Set<String> _taken = {};
  bool _loadingTaken = true;
  bool _refreshingTaken = false;
  String? _takenError;
  Timer? _refreshTimer;
  late final List<String> _cols;
  late final int _rows;

  @override
  void initState() {
    super.initState();
    final cabin = widget.flightClass.cabinClass.toUpperCase();
    if (cabin == 'FIRST') {
      _rows = 4;
      _cols = ['A', 'B'];
    } else if (cabin == 'BUSINESS') {
      _rows = 8;
      _cols = ['A', 'B', 'C', 'D'];
    } else {
      _rows = 30;
      _cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    }
    _taken = _allSeatLabels().toSet();
    _loadTakenSeats();
    _refreshTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (mounted && !_loadingTaken) {
        _loadTakenSeats(silent: true);
      }
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  List<String> _allSeatLabels() {
    return [
      for (int r = 1; r <= _rows; r++)
        for (final c in _cols) '$r$c',
    ];
  }

  Future<void> _loadTakenSeats({bool silent = false}) async {
    if (_refreshingTaken) return;
    _refreshingTaken = true;
    if (!silent) {
      setState(() {
        _loadingTaken = true;
        _takenError = null;
        _selected = null;
        _taken = _allSeatLabels().toSet();
      });
    }
    try {
      final seats = await widget.api.occupiedSeats(widget.flightClass.id);
      if (!mounted) return;
      final selectedSeat = _selected;
      final selectedWasTaken =
          selectedSeat != null && seats.contains(selectedSeat);
      setState(() {
        _taken = seats;
        _loadingTaken = false;
        _takenError = null;
        if (selectedWasTaken) _selected = null;
      });
      if (selectedWasTaken) {
        showMessage(context, 'Asiento ya reservado: $selectedSeat');
      }
    } catch (err) {
      if (!mounted) return;
      if (silent) return;
      setState(() {
        _loadingTaken = false;
        _takenError = connectionErrorMessage(err);
        _taken = _allSeatLabels().toSet();
      });
    } finally {
      _refreshingTaken = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final cabin = widget.flightClass.cabinClass.toUpperCase();
    final isWide = cabin == 'FIRST' || cabin == 'BUSINESS';
    // Determinar índice del pasillo (entre col B-C en economy, A-B en business/first)
    final aisleAfter = isWide
        ? 1
        : 2; // índice (0-based) después del cual va el pasillo

    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.88,
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
            child: Column(
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
                      child: const Icon(
                        Icons.event_seat,
                        color: _kBlue,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Plano de cabina',
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 18,
                            ),
                          ),
                          Text(
                            _loadingTaken
                                ? '${_cabinLabel(widget.flightClass.cabinClass)} - consultando ocupacion'
                                : _takenError != null
                                ? '${_cabinLabel(widget.flightClass.cabinClass)} - ocupacion no disponible'
                                : '${_cabinLabel(widget.flightClass.cabinClass)} - ${_taken.length} ocupados reales',
                            style: const TextStyle(
                              color: Color(0xFF64748B),
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                      style: IconButton.styleFrom(
                        backgroundColor: const Color(0xFFF1F5F9),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Leyenda
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _SeatLegend(
                      color: const Color(0xFFE2E8F0),
                      label: 'Disponible',
                    ),
                    const SizedBox(width: 16),
                    _SeatLegend(
                      color: _kRed.withValues(alpha: 0.8),
                      label: 'Ocupado',
                    ),
                    const SizedBox(width: 16),
                    _SeatLegend(color: _kBlue, label: 'Seleccionado'),
                  ],
                ),
                const SizedBox(height: 8),
                if (_takenError != null) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: _kRed.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: _kRed.withValues(alpha: 0.25)),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.warning_amber_outlined,
                          color: _kRed,
                          size: 18,
                        ),
                        const SizedBox(width: 8),
                        const Expanded(
                          child: Text(
                            'No se pudo consultar la ocupacion real.',
                            style: TextStyle(
                              color: _kRed,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        TextButton(
                          onPressed: _loadTakenSeats,
                          child: const Text('Reintentar'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
              ],
            ),
          ),
          // Cabecera columnas
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: _SeatRowHeader(cols: _cols, aisleAfter: aisleAfter),
          ),
          // Grid de asientos
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
              itemCount: _rows,
              itemBuilder: (context, i) {
                final row = i + 1;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 3),
                  child: Row(
                    children: [
                      // Número de fila
                      SizedBox(
                        width: 28,
                        child: Text(
                          '$row',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFF94A3B8),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(width: 4),
                      // Asientos
                      Expanded(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            for (int ci = 0; ci < _cols.length; ci++) ...[
                              if (ci == aisleAfter + 1)
                                const SizedBox(width: 20),
                              _SeatButton(
                                label: '$row${_cols[ci]}',
                                isTaken: _taken.contains('$row${_cols[ci]}'),
                                isSelected: _selected == '$row${_cols[ci]}',
                                onTap: () => setState(
                                  () => _selected = '$row${_cols[ci]}',
                                ),
                              ),
                              if (ci < _cols.length - 1 && ci != aisleAfter)
                                const SizedBox(width: 6),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          // Botón confirmar
          Padding(
            padding: EdgeInsets.fromLTRB(
              20,
              8,
              20,
              MediaQuery.of(context).padding.bottom + 16,
            ),
            child: Column(
              children: [
                if (_selected != null)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: _kBlue.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: _kBlue.withValues(alpha: 0.3)),
                    ),
                    child: Text(
                      'Asiento seleccionado: $_selected',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: _kBlue,
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                      ),
                    ),
                  ),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed:
                        _selected == null ||
                            _loadingTaken ||
                            _takenError != null
                        ? null
                        : () => Navigator.pop(context, _selected),
                    icon: const Icon(Icons.check_circle_outline),
                    label: Text(
                      _loadingTaken
                          ? 'Consultando asientos...'
                          : _takenError != null
                          ? 'Ocupacion no disponible'
                          : _selected == null
                          ? 'Selecciona un asiento'
                          : 'Confirmar asiento $_selected',
                    ),
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

class _SeatButton extends StatelessWidget {
  const _SeatButton({
    required this.label,
    required this.isTaken,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isTaken;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final Color bg;
    final Color fg;
    if (isTaken) {
      bg = _kRed.withValues(alpha: 0.15);
      fg = _kRed;
    } else if (isSelected) {
      bg = _kBlue;
      fg = Colors.white;
    } else {
      bg = const Color(0xFFE2E8F0);
      fg = const Color(0xFF475569);
    }

    return GestureDetector(
      onTap: isTaken
          ? () => showMessage(context, 'Asiento ya reservado: $label')
          : onTap,
      child: Container(
        width: 34,
        height: 30,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: isTaken
                ? _kRed.withValues(alpha: 0.4)
                : isSelected
                ? _kBlue
                : const Color(0xFFCBD5E1),
          ),
        ),
        child: Center(
          child: isTaken
              ? Icon(Icons.close, size: 12, color: fg)
              : Text(
                  label.replaceAll(RegExp(r'[0-9]'), ''),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: fg,
                  ),
                ),
        ),
      ),
    );
  }
}

class _SeatRowHeader extends StatelessWidget {
  const _SeatRowHeader({required this.cols, required this.aisleAfter});
  final List<String> cols;
  final int aisleAfter;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const SizedBox(width: 32),
        Expanded(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              for (int ci = 0; ci < cols.length; ci++) ...[
                if (ci == aisleAfter + 1) const SizedBox(width: 20),
                SizedBox(
                  width: 34,
                  child: Text(
                    cols[ci],
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ),
                if (ci < cols.length - 1 && ci != aisleAfter)
                  const SizedBox(width: 6),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _SeatLegend extends StatelessWidget {
  const _SeatLegend({required this.color, required this.label});
  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 16,
          height: 14,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        const SizedBox(width: 5),
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
        ),
      ],
    );
  }
}

// ─── Profile helper widgets ────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 2),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: Color(0xFF64748B),
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  const _ProfileCard({required this.children});
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: const Border.fromBorderSide(
          BorderSide(color: Color(0xFFE2E8F0)),
        ),
      ),
      child: Column(children: children),
    );
  }
}

class _FieldDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const Divider(height: 1, indent: 52, color: Color(0xFFF1F5F9));
  }
}

class _ProfileField extends StatelessWidget {
  const _ProfileField({
    required this.icon,
    required this.label,
    required this.value,
    this.onEdit,
    this.readOnly = false,
  });

  final IconData icon;
  final String label;
  final String value;
  final VoidCallback? onEdit;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: readOnly ? null : onEdit,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(9),
              ),
              child: Icon(icon, size: 17, color: _kBlue),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF94A3B8),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 15,
                      color: Color(0xFF1E293B),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            if (readOnly)
              const Icon(Icons.lock_outline, size: 16, color: Color(0xFFCBD5E1))
            else
              const Icon(
                Icons.edit_outlined,
                size: 17,
                color: Color(0xFF94A3B8),
              ),
          ],
        ),
      ),
    );
  }
}
