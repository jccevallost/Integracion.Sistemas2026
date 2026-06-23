// ─────────────────────────────────────────────────────────────────────────────
// Panel de administración (CRUD genérico) para la app móvil.
//
// Replica el panel admin de la web Angular: una tabla + formulario genéricos
// configurados por una definición de entidad (columnas + campos), consumiendo
// los mismos endpoints /admin/* del API Gateway v2.
//
// Solo se muestra cuando el usuario autenticado tiene rol ADMIN.
// ─────────────────────────────────────────────────────────────────────────────
import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;

// El panel admin consume el MISMO backend que el resto de la app (main.dart).
// Las rutas /admin/* existen en https://integracion-sistemas2026.onrender.com/api
// (responden 401 sin token, 200 con token de ADMIN). El gateway v2 anterior
// (vuelos-api-gateway-v2.onrender.com) está caído y devolvía 404 en todo.
// Comparte la misma variable API_BASE_URL para mantenerse sincronizado.
const _adminApiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'https://integracion-sistemas2026.onrender.com/api',
);

const _kNavy = Color(0xFF0D2137);
const _kBlue = Color(0xFF1D4ED8);
const _kBg = Color(0xFFEFF6FF);
const _kRed = Color(0xFFDC2626);

// ─── Cliente HTTP admin ───────────────────────────────────────────────────────
class AdminApi {
  AdminApi(this.token);
  final String? token;

  static const _timeout = Duration(seconds: 25);

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  Uri _uri(String path) => Uri.parse('$_adminApiBaseUrl$path');

  List<Map<String, dynamic>> _extractList(dynamic body) {
    final data = body is Map ? body['data'] : body;
    if (data is List) return data.cast<Map<String, dynamic>>();
    if (data is Map && data['data'] is List) {
      return (data['data'] as List).cast<Map<String, dynamic>>();
    }
    return <Map<String, dynamic>>[];
  }

  String _error(dynamic body, int code) {
    final err = body is Map ? body['error'] : null;
    final msg = err is Map ? err['message'] : err?.toString();
    return (msg ?? 'Error HTTP $code').toString();
  }

  dynamic _safeDecode(String raw) {
    try {
      return jsonDecode(raw);
    } catch (_) {
      return null;
    }
  }

  Future<List<Map<String, dynamic>>> list(String path) async {
    final r = await http.get(_uri(path), headers: _headers).timeout(_timeout);
    final body = _safeDecode(r.body);
    if (r.statusCode < 200 || r.statusCode >= 300) {
      throw Exception(_error(body, r.statusCode));
    }
    return _extractList(body);
  }

  Future<void> create(String path, Map<String, dynamic> b) async {
    final r = await http
        .post(_uri(path), headers: _headers, body: jsonEncode(b))
        .timeout(_timeout);
    if (r.statusCode < 200 || r.statusCode >= 300) {
      throw Exception(_error(_safeDecode(r.body), r.statusCode));
    }
  }

  Future<void> update(
    String path, {
    required bool patch,
    required Map<String, dynamic> b,
  }) async {
    final r = await (patch
            ? http.patch(_uri(path), headers: _headers, body: jsonEncode(b))
            : http.put(_uri(path), headers: _headers, body: jsonEncode(b)))
        .timeout(_timeout);
    if (r.statusCode < 200 || r.statusCode >= 300) {
      throw Exception(_error(_safeDecode(r.body), r.statusCode));
    }
  }

  Future<void> remove(String path) async {
    final r =
        await http.delete(_uri(path), headers: _headers).timeout(_timeout);
    if (r.statusCode < 200 || r.statusCode >= 300) {
      throw Exception(_error(_safeDecode(r.body), r.statusCode));
    }
  }
}

// ─── Modelo de configuración ──────────────────────────────────────────────────
enum AdminFieldType { text, number, select, fk, checkbox, date, datetime }

class AdminOption {
  const AdminOption(this.value, this.label);
  final String value;
  final String label;
}

class AdminField {
  const AdminField(
    this.key,
    this.label,
    this.type, {
    this.required = false,
    this.placeholder,
    this.options,
    this.fkEntity,
    this.fkLabel,
    this.uppercase = false,
    this.maxLength,
    this.autoGen,
    this.initial,
  });

  final String key;
  final String label;
  final AdminFieldType type;
  final bool required;
  final String? placeholder;
  final List<AdminOption>? options; // select estático
  final String? fkEntity; // clave de entidad relacionada (fk)
  final String Function(Map<String, dynamic> row)? fkLabel;
  final bool uppercase;
  final int? maxLength;
  final String Function()? autoGen; // valor autogenerado al crear
  final Object? initial;
}

class AdminColumn {
  const AdminColumn(this.label, this.value);
  final String label;
  final String Function(Map<String, dynamic> row) value;
}

class AdminEntity {
  const AdminEntity({
    required this.key,
    required this.title,
    required this.group,
    required this.icon,
    required this.path,
    required this.columns,
    this.fields = const [],
    this.patch = true,
    this.readOnly = false,
    this.noEdit = false,
    this.compositeKey = false,
    this.compositeKeys = const ['airlineId', 'airportId'],
  });

  final String key;
  final String title;
  final String group;
  final IconData icon;
  final String path;
  final List<AdminColumn> columns;
  final List<AdminField> fields;
  final bool patch; // true => PATCH, false => PUT (vuelos)
  final bool readOnly; // solo lectura (auditoría)
  final bool noEdit; // crear + borrar, sin editar (claves compuestas)
  final bool compositeKey; // id sintético airlineId___airportId
  final List<String> compositeKeys;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
final _rnd = math.Random();
String _rndCode(int n) {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return List.generate(n, (_) => c[_rnd.nextInt(c.length)]).join();
}

String _genBoarding() => 'BP-${_rndCode(4)}-${_rndCode(4)}';
String _genTx() => 'TXN-${DateTime.now().millisecondsSinceEpoch}-${_rndCode(6)}';
String _genInv() {
  final n = DateTime.now();
  String two(int x) => x.toString().padLeft(2, '0');
  return 'INV-${n.year}${two(n.month)}${two(n.day)}-${_rndCode(6)}';
}

String _g(Map<String, dynamic> r, String k) => (r[k] ?? '').toString();
Map<String, dynamic>? _nest(Map<String, dynamic> r, String k) =>
    r[k] is Map ? (r[k] as Map).cast<String, dynamic>() : null;
String _nestStr(Map<String, dynamic> r, String k, String f) =>
    _nest(r, k)?[f]?.toString() ?? '—';

String _money(dynamic v) {
  final d = double.tryParse((v ?? '').toString());
  return d == null ? '—' : '\$${d.toStringAsFixed(2)}';
}

String _fmtDate(dynamic v) {
  final s = (v ?? '').toString();
  return s.length >= 10 ? s.substring(0, 10) : (s.isEmpty ? '—' : s);
}

String _fmtDateTime(dynamic v) {
  final s = (v ?? '').toString();
  if (s.isEmpty) return '—';
  return s.length >= 16 ? s.substring(0, 16).replaceFirst('T', ' ') : s;
}

const _flightStatus = {
  'SCHEDULED': 'Programado',
  'DELAYED': 'Retrasado',
  'CANCELLED': 'Cancelado',
  'COMPLETED': 'Completado',
};
const _bpStatus = {
  'NOT_CHECKED_IN': 'Sin check-in',
  'CHECKED_IN': 'Check-in OK',
  'BOARDED': 'Embarcado',
  'NO_SHOW': 'No se presentó',
};

const _timezones = [
  'America/Guayaquil', 'America/Bogota', 'America/Lima', 'America/Santiago',
  'America/New_York', 'America/Los_Angeles', 'America/Mexico_City',
  'Europe/Madrid', 'America/Buenos_Aires', 'America/Caracas', 'America/La_Paz',
];

List<AdminOption> _tzOptions() =>
    _timezones.map((t) => AdminOption(t, t)).toList();

// ─── Definición de las entidades (replica el panel web) ───────────────────────
const _grpVuelos = 'Vuelos';
const _grpGeo = 'Geografía & Flota';
const _grpOps = 'Operaciones';
const _grpFin = 'Finanzas';
const _grpSys = 'Sistema';

final List<AdminEntity> adminEntities = [
  // ── Vuelos ────────────────────────────────────────────────────────────────
  AdminEntity(
    key: 'flights',
    title: 'Vuelos',
    group: _grpVuelos,
    icon: Icons.flight,
    path: '/flights',
    patch: false, // PUT
    columns: [
      AdminColumn('Ruta',
          (r) => '${_g(r, 'originAirportIata')} → ${_g(r, 'destinationAirportIata')}'),
      AdminColumn(
          'Aerolínea',
          (r) => _nest(r, 'airline') != null
              ? '${_nestStr(r, 'airline', 'name')} (${_nestStr(r, 'airline', 'iataCode')})'
              : '—'),
      AdminColumn('N° Vuelo', (r) => r['flightNumber']?.toString() ?? '—'),
      AdminColumn('Fecha', (r) => _fmtDate(r['departureDate'])),
      AdminColumn('Estado',
          (r) => _flightStatus[_g(r, 'status')] ?? _g(r, 'status')),
    ],
    fields: [
      AdminField('originAirportIata', 'Origen IATA', AdminFieldType.text,
          required: true, maxLength: 3, uppercase: true, placeholder: 'UIO'),
      AdminField('destinationAirportIata', 'Destino IATA', AdminFieldType.text,
          required: true, maxLength: 3, uppercase: true, placeholder: 'BOG'),
      AdminField('departureDate', 'Fecha de salida', AdminFieldType.date,
          required: true),
      AdminField('status', 'Estado', AdminFieldType.select,
          initial: 'SCHEDULED',
          options: const [
            AdminOption('SCHEDULED', 'Programado'),
            AdminOption('DELAYED', 'Retrasado'),
            AdminOption('CANCELLED', 'Cancelado'),
            AdminOption('COMPLETED', 'Completado'),
          ]),
    ],
  ),
  AdminEntity(
    key: 'segments',
    title: 'Segmentos',
    group: _grpVuelos,
    icon: Icons.timeline,
    path: '/admin/segments',
    columns: [
      AdminColumn('Segmento', (r) => _g(r, 'segmentNumber')),
      AdminColumn(
          'Ruta',
          (r) =>
              '${_nestStr(r, 'originAirport', 'iataCode')} → ${_nestStr(r, 'destinationAirport', 'iataCode')}'),
      AdminColumn('Salida', (r) => _fmtDateTime(r['departureDateTime'])),
      AdminColumn('Llegada', (r) => _fmtDateTime(r['arrivalDateTime'])),
      AdminColumn('Duración',
          (r) => r['estimatedDuration'] != null ? '${r['estimatedDuration']} min' : '—'),
    ],
    fields: [
      AdminField('segmentNumber', 'N° de segmento', AdminFieldType.text,
          required: true, uppercase: true, placeholder: 'AV101'),
      AdminField('flightId', 'Vuelo', AdminFieldType.fk,
          fkEntity: 'flights',
          fkLabel: (r) =>
              '${_g(r, 'originAirportIata')} → ${_g(r, 'destinationAirportIata')}'),
      AdminField('airlineId', 'Aerolínea', AdminFieldType.fk,
          required: true,
          fkEntity: 'airlines',
          fkLabel: (r) => '${_g(r, 'name')} (${_g(r, 'iataCode')})'),
      AdminField('originAirportId', 'Aeropuerto origen', AdminFieldType.fk,
          required: true,
          fkEntity: 'airports',
          fkLabel: (r) =>
              '${_g(r, 'iataCode')} — ${_nest(r, 'city')?['name'] ?? _g(r, 'name')}'),
      AdminField('destinationAirportId', 'Aeropuerto destino', AdminFieldType.fk,
          required: true,
          fkEntity: 'airports',
          fkLabel: (r) =>
              '${_g(r, 'iataCode')} — ${_nest(r, 'city')?['name'] ?? _g(r, 'name')}'),
      AdminField('aircraftId', 'Aeronave', AdminFieldType.fk,
          fkEntity: 'aircraft',
          fkLabel: (r) => '${_g(r, 'modelName')} · ${_g(r, 'registration')}'),
      AdminField('departureDateTime', 'Salida', AdminFieldType.datetime,
          required: true),
      AdminField('arrivalDateTime', 'Llegada', AdminFieldType.datetime,
          required: true),
      AdminField('estimatedDuration', 'Duración (minutos)', AdminFieldType.number,
          required: true, initial: '60'),
    ],
  ),
  AdminEntity(
    key: 'flight-classes',
    title: 'Clases de Vuelo',
    group: _grpVuelos,
    icon: Icons.airline_seat_recline_normal,
    path: '/admin/flightclasses',
    columns: [
      AdminColumn(
          'Vuelo',
          (r) => _nest(r, 'flight') != null
              ? '${_nest(r, 'flight')?['originAirportIata'] ?? '?'} → ${_nest(r, 'flight')?['destinationAirportIata'] ?? '?'}'
              : '—'),
      AdminColumn('Clase', (r) => _g(r, 'cabinClass')),
      AdminColumn('Precio', (r) => '\$${_g(r, 'basePrice')}'),
      AdminColumn('Disponibles', (r) => '${r['availableSeats'] ?? 0}'),
    ],
    fields: [
      AdminField('flightId', 'Vuelo', AdminFieldType.fk,
          required: true,
          fkEntity: 'flights',
          fkLabel: (r) =>
              '${_g(r, 'originAirportIata')} → ${_g(r, 'destinationAirportIata')}'),
      AdminField('cabinClass', 'Clase', AdminFieldType.select,
          initial: 'ECONOMY',
          options: const [
            AdminOption('ECONOMY', 'Económica'),
            AdminOption('PREMIUM_ECONOMY', 'Premium Económica'),
            AdminOption('BUSINESS', 'Business'),
            AdminOption('FIRST', 'Primera clase'),
          ]),
      AdminField('basePrice', 'Precio base (\$)', AdminFieldType.number,
          required: true, initial: '0'),
      AdminField('availableSeats', 'Asientos disponibles', AdminFieldType.number,
          required: true, initial: '0'),
    ],
  ),

  // ── Geografía & Flota ───────────────────────────────────────────────────────
  AdminEntity(
    key: 'airports',
    title: 'Aeropuertos',
    group: _grpGeo,
    icon: Icons.local_airport,
    path: '/admin/airports',
    columns: [
      AdminColumn('IATA', (r) => _g(r, 'iataCode')),
      AdminColumn('Nombre', (r) => _g(r, 'name')),
      AdminColumn('Ciudad', (r) => _nestStr(r, 'city', 'name')),
      AdminColumn('Timezone', (r) => _g(r, 'timezone')),
    ],
    fields: [
      AdminField('iataCode', 'Código IATA', AdminFieldType.text,
          required: true, maxLength: 3, uppercase: true, placeholder: 'UIO'),
      AdminField('name', 'Nombre', AdminFieldType.text, required: true),
      AdminField('cityId', 'Ciudad', AdminFieldType.fk,
          required: true,
          fkEntity: 'cities',
          fkLabel: (r) =>
              '${_g(r, 'name')}${_nest(r, 'country') != null ? ' · ${_nestStr(r, 'country', 'name')}' : ''}'),
      AdminField('timezone', 'Zona horaria', AdminFieldType.select,
          required: true, initial: 'America/Guayaquil', options: _tzOptions()),
    ],
  ),
  AdminEntity(
    key: 'airlines',
    title: 'Aerolíneas',
    group: _grpGeo,
    icon: Icons.business,
    path: '/admin/airlines',
    columns: [
      AdminColumn('IATA', (r) => _g(r, 'iataCode')),
      AdminColumn('Nombre', (r) => _g(r, 'name')),
      AdminColumn('País', (r) => _nestStr(r, 'country', 'name')),
    ],
    fields: [
      AdminField('iataCode', 'Código IATA', AdminFieldType.text,
          required: true, maxLength: 2, uppercase: true, placeholder: 'LA'),
      AdminField('name', 'Nombre', AdminFieldType.text,
          required: true, placeholder: 'LATAM Airlines'),
      AdminField('countryId', 'País', AdminFieldType.fk,
          required: true,
          fkEntity: 'countries',
          fkLabel: (r) => '${_g(r, 'name')} (${_g(r, 'isoCode')})'),
      AdminField('logoUrl', 'Logo URL', AdminFieldType.text,
          placeholder: 'https://...'),
    ],
  ),
  AdminEntity(
    key: 'aircraft',
    title: 'Aeronaves',
    group: _grpGeo,
    icon: Icons.airplanemode_active,
    path: '/admin/aircraft',
    columns: [
      AdminColumn('Modelo', (r) => _g(r, 'modelName')),
      AdminColumn('Matrícula', (r) => _g(r, 'registration')),
      AdminColumn('Aerolínea', (r) => _nestStr(r, 'airline', 'name')),
    ],
    fields: [
      AdminField('modelName', 'Modelo', AdminFieldType.text,
          required: true, placeholder: 'Boeing 737-800'),
      AdminField('registration', 'Matrícula', AdminFieldType.text,
          required: true, uppercase: true, placeholder: 'HC-CNA'),
      AdminField('airlineId', 'Aerolínea', AdminFieldType.fk,
          required: true,
          fkEntity: 'airlines',
          fkLabel: (r) => '${_g(r, 'name')} (${_g(r, 'iataCode')})'),
      AdminField('hasWifi', 'WiFi a bordo', AdminFieldType.checkbox),
      AdminField('hasUsb', 'Puertos USB', AdminFieldType.checkbox),
    ],
  ),
  AdminEntity(
    key: 'countries',
    title: 'Países',
    group: _grpGeo,
    icon: Icons.public,
    path: '/admin/countries',
    columns: [
      AdminColumn('ISO', (r) => _g(r, 'isoCode')),
      AdminColumn('Nombre', (r) => _g(r, 'name')),
      AdminColumn('Cód. Tel.', (r) => r['phoneCode']?.toString() ?? '—'),
      AdminColumn('Moneda', (r) => r['currencyCode']?.toString() ?? '—'),
    ],
    fields: [
      AdminField('name', 'Nombre', AdminFieldType.text, required: true),
      AdminField('isoCode', 'Código ISO', AdminFieldType.text,
          required: true, maxLength: 2, placeholder: 'CO'),
      AdminField('phoneCode', 'Cód. telefónico', AdminFieldType.text,
          placeholder: '+57'),
      AdminField('currencyCode', 'Moneda', AdminFieldType.text,
          maxLength: 3, placeholder: 'COP'),
    ],
  ),
  AdminEntity(
    key: 'cities',
    title: 'Ciudades',
    group: _grpGeo,
    icon: Icons.location_city,
    path: '/admin/cities',
    columns: [
      AdminColumn('Ciudad', (r) => _g(r, 'name')),
      AdminColumn('País', (r) => _nestStr(r, 'country', 'name')),
      AdminColumn('IATA', (r) => r['iataCode']?.toString() ?? '—'),
    ],
    fields: [
      AdminField('name', 'Nombre', AdminFieldType.text, required: true),
      AdminField('countryId', 'País', AdminFieldType.fk,
          required: true,
          fkEntity: 'countries',
          fkLabel: (r) => '${_g(r, 'name')} (${_g(r, 'isoCode')})'),
      AdminField('iataCode', 'Código IATA', AdminFieldType.text,
          maxLength: 3, placeholder: 'UIO'),
    ],
  ),

  // ── Operaciones ─────────────────────────────────────────────────────────────
  AdminEntity(
    key: 'reservations',
    title: 'Reservas',
    group: _grpOps,
    icon: Icons.event_seat,
    path: '/admin/reservations',
    columns: [
      AdminColumn('Código', (r) => _g(r, 'reservationCode')),
      AdminColumn(
          'Pasajero',
          (r) => _nest(r, 'user') != null
              ? '${_nestStr(r, 'user', 'firstName')} ${_nestStr(r, 'user', 'firstLastName')}'
              : '—'),
      AdminColumn('Estado', (r) => _g(r, 'status')),
      AdminColumn('Total', (r) => _money(r['totalAmount'])),
    ],
    fields: [
      AdminField('status', 'Estado', AdminFieldType.select,
          initial: 'PENDING',
          options: const [
            AdminOption('PENDING', 'PENDING'),
            AdminOption('CONFIRMED', 'CONFIRMED'),
            AdminOption('CANCELLED', 'CANCELLED'),
          ]),
      AdminField('totalAmount', 'Total (\$)', AdminFieldType.number,
          required: true, initial: '0'),
    ],
  ),
  AdminEntity(
    key: 'reservation-passengers',
    title: 'Pasajeros/Reserva',
    group: _grpOps,
    icon: Icons.people,
    path: '/admin/reservation-passengers',
    columns: [
      AdminColumn('Reserva', (r) => _nestStr(r, 'reservation', 'reservationCode')),
      AdminColumn('Nombre', (r) => '${_g(r, 'firstName')} ${_g(r, 'lastName')}'),
      AdminColumn('Documento', (r) => _g(r, 'documentNumber')),
      AdminColumn('Clase', (r) => _nestStr(r, 'flightClass', 'cabinClass')),
      AdminColumn('Asiento', (r) => r['seatNumber']?.toString() ?? '—'),
    ],
    fields: [
      AdminField('reservationId', 'Reserva', AdminFieldType.fk,
          required: true,
          fkEntity: 'reservations',
          fkLabel: (r) =>
              '${_g(r, 'reservationCode')} — ${_money(r['totalAmount'])}'),
      AdminField('flightClassId', 'Clase de vuelo', AdminFieldType.fk,
          required: true,
          fkEntity: 'flight-classes',
          fkLabel: (r) =>
              '${_g(r, 'cabinClass')}${_nest(r, 'flight') != null ? ' · ${_nest(r, 'flight')?['originAirportIata']}→${_nest(r, 'flight')?['destinationAirportIata']}' : ''}'),
      AdminField('firstName', 'Nombre', AdminFieldType.text,
          required: true, placeholder: 'Juan'),
      AdminField('lastName', 'Apellido', AdminFieldType.text,
          required: true, placeholder: 'Pérez'),
      AdminField('documentNumber', 'N° documento', AdminFieldType.text,
          required: true, placeholder: '1234567890'),
      AdminField('seatNumber', 'Asiento', AdminFieldType.text,
          placeholder: '14A'),
    ],
  ),
  AdminEntity(
    key: 'boarding-passes',
    title: 'Pases de Abordar',
    group: _grpOps,
    icon: Icons.confirmation_number,
    path: '/admin/boarding-passes',
    columns: [
      AdminColumn('Código', (r) => _g(r, 'boardingCode')),
      AdminColumn(
          'Pasajero',
          (r) => _nest(r, 'passenger') != null
              ? '${_nestStr(r, 'passenger', 'firstName')} ${_nestStr(r, 'passenger', 'lastName')}'
              : '—'),
      AdminColumn('Segmento', (r) => _nestStr(r, 'segment', 'segmentNumber')),
      AdminColumn('Puerta', (r) => r['gate']?.toString() ?? '—'),
      AdminColumn('Estado',
          (r) => _bpStatus[_g(r, 'status')] ?? (r['status']?.toString() ?? '—')),
    ],
    fields: [
      AdminField('passengerId', 'Pasajero', AdminFieldType.fk,
          required: true,
          fkEntity: 'reservation-passengers',
          fkLabel: (r) =>
              '${_g(r, 'firstName')} ${_g(r, 'lastName')} · ${_g(r, 'documentNumber')}'),
      AdminField('segmentId', 'Segmento de vuelo', AdminFieldType.fk,
          required: true,
          fkEntity: 'segments',
          fkLabel: (r) =>
              '${_g(r, 'segmentNumber')} · ${_nestStr(r, 'originAirport', 'iataCode')} → ${_nestStr(r, 'destinationAirport', 'iataCode')}'),
      AdminField('boardingCode', 'Código de embarque', AdminFieldType.text,
          required: true, autoGen: _genBoarding),
      AdminField('gate', 'Puerta', AdminFieldType.text, placeholder: 'A12'),
      AdminField('boardingGroup', 'Grupo de embarque', AdminFieldType.text,
          placeholder: 'A'),
      AdminField('status', 'Estado', AdminFieldType.select,
          initial: 'NOT_CHECKED_IN',
          options: const [
            AdminOption('NOT_CHECKED_IN', 'Sin check-in'),
            AdminOption('CHECKED_IN', 'Check-in realizado'),
            AdminOption('BOARDED', 'Embarcado'),
            AdminOption('NO_SHOW', 'No se presentó'),
          ]),
    ],
  ),
  AdminEntity(
    key: 'promotions',
    title: 'Promociones',
    group: _grpOps,
    icon: Icons.local_offer,
    path: '/admin/promotions',
    columns: [
      AdminColumn('Código', (r) => _g(r, 'code')),
      AdminColumn('Tipo', (r) => _g(r, 'discountType')),
      AdminColumn(
          'Valor',
          (r) => _g(r, 'discountType') == 'PERCENTAGE'
              ? '${_g(r, 'discountValue')}%'
              : '\$${_g(r, 'discountValue')}'),
      AdminColumn('Activa', (r) => r['isActive'] == true ? 'Sí' : 'No'),
    ],
    fields: [
      AdminField('code', 'Código', AdminFieldType.text,
          required: true, uppercase: true, placeholder: 'VERANO20'),
      AdminField('discountType', 'Tipo de descuento', AdminFieldType.select,
          initial: 'PERCENTAGE',
          options: const [
            AdminOption('PERCENTAGE', 'PERCENTAGE'),
            AdminOption('FIXED_AMOUNT', 'FIXED_AMOUNT'),
          ]),
      AdminField('discountValue', 'Valor', AdminFieldType.number,
          required: true, initial: '0'),
      AdminField('maxUsages', 'Máx. usos', AdminFieldType.number,
          placeholder: 'Sin límite'),
      AdminField('isActive', 'Activa', AdminFieldType.checkbox, initial: true),
    ],
  ),

  // ── Finanzas ────────────────────────────────────────────────────────────────
  AdminEntity(
    key: 'payments',
    title: 'Pagos',
    group: _grpFin,
    icon: Icons.credit_card,
    path: '/admin/payments',
    columns: [
      AdminColumn('Reserva', (r) => _nestStr(r, 'reservation', 'reservationCode')),
      AdminColumn('Monto', (r) => _money(r['amount'])),
      AdminColumn('Proveedor', (r) => _g(r, 'provider')),
      AdminColumn('Estado', (r) => _g(r, 'status')),
    ],
    fields: [
      AdminField('reservationId', 'Reserva', AdminFieldType.fk,
          required: true,
          fkEntity: 'reservations',
          fkLabel: (r) =>
              '${_g(r, 'reservationCode')} — ${_money(r['totalAmount'])}'),
      AdminField('amount', 'Monto (\$)', AdminFieldType.number,
          required: true, initial: '0'),
      AdminField('provider', 'Método de pago', AdminFieldType.select,
          initial: 'VISA',
          options: const [
            AdminOption('VISA', 'VISA'),
            AdminOption('MASTERCARD', 'MASTERCARD'),
            AdminOption('AMEX', 'AMEX'),
            AdminOption('PAYPAL', 'PAYPAL'),
          ]),
      AdminField('transactionId', 'ID de transacción', AdminFieldType.text,
          required: true, autoGen: _genTx),
      AdminField('status', 'Estado', AdminFieldType.select,
          initial: 'PENDING',
          options: const [
            AdminOption('PENDING', 'PENDING'),
            AdminOption('COMPLETED', 'COMPLETED'),
            AdminOption('FAILED', 'FAILED'),
            AdminOption('REFUNDED', 'REFUNDED'),
          ]),
    ],
  ),
  AdminEntity(
    key: 'invoices',
    title: 'Facturas',
    group: _grpFin,
    icon: Icons.receipt_long,
    path: '/admin/invoices',
    columns: [
      AdminColumn('Número', (r) => _g(r, 'invoiceNumber')),
      AdminColumn('Razón Social', (r) => _nestStr(r, 'billingProfile', 'businessName')),
      AdminColumn('Subtotal', (r) => _money(r['subtotal'])),
      AdminColumn('IVA', (r) => _money(r['taxAmount'])),
      AdminColumn('Total', (r) => _money(r['total'])),
    ],
    fields: [
      AdminField('invoiceNumber', 'N° de factura', AdminFieldType.text,
          required: true, autoGen: _genInv),
      AdminField('paymentId', 'Pago', AdminFieldType.fk,
          required: true,
          fkEntity: 'payments',
          fkLabel: (r) =>
              '${_nest(r, 'reservation')?['reservationCode'] ?? _g(r, 'id')} — ${_money(r['amount'])}'),
      AdminField('billingProfileId', 'Perfil de facturación', AdminFieldType.fk,
          required: true,
          fkEntity: 'billing-profiles',
          fkLabel: (r) => '${_g(r, 'businessName')} · ${_g(r, 'taxId')}'),
      AdminField('subtotal', 'Subtotal', AdminFieldType.number,
          required: true, initial: '0'),
      AdminField('taxAmount', 'IVA (15%)', AdminFieldType.number,
          required: true, initial: '0'),
      AdminField('total', 'Total', AdminFieldType.number,
          required: true, initial: '0'),
    ],
  ),
  AdminEntity(
    key: 'invoice-items',
    title: 'Ítems de Factura',
    group: _grpFin,
    icon: Icons.list_alt,
    path: '/admin/invoice-items',
    columns: [
      AdminColumn('Factura', (r) => _nestStr(r, 'invoice', 'invoiceNumber')),
      AdminColumn('Descripción', (r) => _g(r, 'description')),
      AdminColumn('Qty', (r) => '${r['quantity'] ?? ''}'),
      AdminColumn('P. Unit.', (r) => _money(r['unitPrice'])),
      AdminColumn('Total', (r) => _money(r['totalPrice'])),
    ],
    fields: [
      AdminField('invoiceId', 'Factura', AdminFieldType.fk,
          required: true,
          fkEntity: 'invoices',
          fkLabel: (r) => '${_g(r, 'invoiceNumber')} — ${_money(r['total'])}'),
      AdminField('description', 'Descripción', AdminFieldType.text,
          required: true, placeholder: 'Boleto UIO-MAD'),
      AdminField('quantity', 'Cantidad', AdminFieldType.number,
          required: true, initial: '1'),
      AdminField('unitPrice', 'P. unitario', AdminFieldType.number,
          required: true, initial: '0'),
      AdminField('totalPrice', 'Total', AdminFieldType.number,
          required: true, initial: '0'),
    ],
  ),
  AdminEntity(
    key: 'billing-profiles',
    title: 'Perfiles de Facturación',
    group: _grpFin,
    icon: Icons.badge,
    path: '/admin/billing-profiles',
    columns: [
      AdminColumn('Razón Social', (r) => _g(r, 'businessName')),
      AdminColumn('RUC/Cédula', (r) => _g(r, 'taxId')),
      AdminColumn('Ciudad', (r) => _nestStr(r, 'city', 'name')),
      AdminColumn('Predeterminado', (r) => r['isDefault'] == true ? '✓' : ''),
    ],
    fields: [
      AdminField('userId', 'Usuario', AdminFieldType.fk,
          required: true,
          fkEntity: 'users',
          fkLabel: (r) =>
              '${_g(r, 'firstName')} ${_g(r, 'firstLastName')} — ${_g(r, 'email')}'),
      AdminField('taxId', 'RUC / Cédula', AdminFieldType.text,
          required: true, placeholder: '0910000000001'),
      AdminField('businessName', 'Nombre / Razón Social', AdminFieldType.text,
          required: true, placeholder: 'Juan Pérez'),
      AdminField('email', 'Email de facturación', AdminFieldType.text,
          placeholder: 'facturacion@ejemplo.com'),
      AdminField('address', 'Dirección', AdminFieldType.text,
          required: true, placeholder: 'Av. Principal 123'),
      AdminField('cityId', 'Ciudad', AdminFieldType.fk,
          required: true,
          fkEntity: 'cities',
          fkLabel: (r) =>
              '${_g(r, 'name')}${_nest(r, 'country') != null ? ' · ${_nestStr(r, 'country', 'name')}' : ''}'),
      AdminField('isDefault', 'Perfil predeterminado', AdminFieldType.checkbox),
    ],
  ),

  // ── Sistema ─────────────────────────────────────────────────────────────────
  AdminEntity(
    key: 'services',
    title: 'Catálogo Servicios',
    group: _grpSys,
    icon: Icons.room_service,
    path: '/admin/servicecatalog',
    columns: [
      AdminColumn('Servicio', (r) => _g(r, 'name')),
      AdminColumn('Código', (r) => _g(r, 'code')),
      AdminColumn('Categoría', (r) => _g(r, 'category')),
    ],
    fields: [
      AdminField('name', 'Nombre', AdminFieldType.text, required: true),
      AdminField('code', 'Código', AdminFieldType.text,
          required: true, uppercase: true, placeholder: 'BAG_23KG'),
      AdminField('category', 'Categoría', AdminFieldType.select,
          initial: 'BAGGAGE',
          options: const [
            AdminOption('BAGGAGE', 'BAGGAGE'),
            AdminOption('MEAL', 'MEAL'),
            AdminOption('SEAT', 'SEAT'),
            AdminOption('LOUNGE', 'LOUNGE'),
            AdminOption('INSURANCE', 'INSURANCE'),
            AdminOption('OTHER', 'OTHER'),
          ]),
      AdminField('description', 'Descripción', AdminFieldType.text),
    ],
  ),
  AdminEntity(
    key: 'airline-service-configs',
    title: 'Precios/Aerolínea',
    group: _grpSys,
    icon: Icons.attach_money,
    path: '/admin/airline-service-config',
    columns: [
      AdminColumn('Servicio', (r) => _nestStr(r, 'service', 'name')),
      AdminColumn(
          'Aerolínea',
          (r) => _nest(r, 'airline') != null
              ? '${_nestStr(r, 'airline', 'name')} (${_nestStr(r, 'airline', 'iataCode')})'
              : '—'),
      AdminColumn('Precio', (r) => '${_money(r['price'])} ${_g(r, 'currency')}'),
    ],
    fields: [
      AdminField('serviceId', 'Servicio', AdminFieldType.fk,
          required: true,
          fkEntity: 'services',
          fkLabel: (r) => '${_g(r, 'name')} (${_g(r, 'code')})'),
      AdminField('airlineId', 'Aerolínea', AdminFieldType.fk,
          required: true,
          fkEntity: 'airlines',
          fkLabel: (r) => '${_g(r, 'name')} (${_g(r, 'iataCode')})'),
      AdminField('originAirportId', 'Aeropuerto origen (opcional)', AdminFieldType.fk,
          fkEntity: 'airports',
          fkLabel: (r) => '${_g(r, 'iataCode')} — ${_g(r, 'name')}'),
      AdminField('destAirportId', 'Aeropuerto destino (opcional)', AdminFieldType.fk,
          fkEntity: 'airports',
          fkLabel: (r) => '${_g(r, 'iataCode')} — ${_g(r, 'name')}'),
      AdminField('price', 'Precio', AdminFieldType.number,
          required: true, initial: '0'),
      AdminField('currency', 'Moneda', AdminFieldType.select,
          initial: 'USD',
          options: const [
            AdminOption('USD', 'USD'),
            AdminOption('EUR', 'EUR'),
            AdminOption('COP', 'COP'),
          ]),
    ],
  ),
  AdminEntity(
    key: 'airline-airports',
    title: 'Aeropuertos/Aerolínea',
    group: _grpSys,
    icon: Icons.connecting_airports,
    path: '/admin/airline-airports',
    noEdit: true,
    compositeKey: true,
    columns: [
      AdminColumn(
          'Aerolínea',
          (r) => _nest(r, 'airline') != null
              ? '${_nestStr(r, 'airline', 'name')} (${_nestStr(r, 'airline', 'iataCode')})'
              : '—'),
      AdminColumn(
          'Aeropuerto',
          (r) => _nest(r, 'airport') != null
              ? '${_nestStr(r, 'airport', 'iataCode')} — ${_nestStr(r, 'airport', 'name')}'
              : '—'),
    ],
    fields: [
      AdminField('airlineId', 'Aerolínea', AdminFieldType.fk,
          required: true,
          fkEntity: 'airlines',
          fkLabel: (r) => '${_g(r, 'name')} (${_g(r, 'iataCode')})'),
      AdminField('airportId', 'Aeropuerto', AdminFieldType.fk,
          required: true,
          fkEntity: 'airports',
          fkLabel: (r) => '${_g(r, 'iataCode')} — ${_g(r, 'name')}'),
    ],
  ),
  AdminEntity(
    key: 'passenger-services',
    title: 'Servicios/Pasajero',
    group: _grpSys,
    icon: Icons.luggage,
    path: '/admin/passenger-services',
    columns: [
      AdminColumn(
          'Pasajero',
          (r) => _nest(r, 'passenger') != null
              ? '${_nestStr(r, 'passenger', 'firstName')} ${_nestStr(r, 'passenger', 'lastName')}'
              : '—'),
      AdminColumn(
          'Servicio',
          (r) => _nest(r, 'serviceConfig') != null
              ? (_nest(_nest(r, 'serviceConfig')!, 'service')?['name']?.toString() ?? '—')
              : '—'),
      AdminColumn('Qty', (r) => '${r['quantity'] ?? ''}'),
      AdminColumn('P. Unit.', (r) => _money(r['unitPriceAtBooking'])),
    ],
    fields: [
      AdminField('passengerId', 'Pasajero', AdminFieldType.fk,
          required: true,
          fkEntity: 'reservation-passengers',
          fkLabel: (r) =>
              '${_g(r, 'firstName')} ${_g(r, 'lastName')} — ${_g(r, 'documentNumber')}'),
      AdminField('serviceConfigId', 'Servicio (configuración)', AdminFieldType.fk,
          required: true,
          fkEntity: 'airline-service-configs',
          fkLabel: (r) =>
              '${_nest(r, 'service')?['name'] ?? _g(r, 'id')} · ${_nest(r, 'airline')?['name'] ?? ''} · ${_money(r['price'])}'),
      AdminField('quantity', 'Cantidad', AdminFieldType.number,
          required: true, initial: '1'),
      AdminField('unitPriceAtBooking', 'Precio al reservar', AdminFieldType.number,
          required: true, initial: '0'),
    ],
  ),
  AdminEntity(
    key: 'users',
    title: 'Usuarios',
    group: _grpSys,
    icon: Icons.manage_accounts,
    path: '/admin/users',
    columns: [
      AdminColumn('Nombre', (r) => '${_g(r, 'firstName')} ${_g(r, 'firstLastName')}'),
      AdminColumn('Email', (r) => _g(r, 'email')),
      AdminColumn('Rol', (r) => _g(r, 'role')),
      AdminColumn('Activo', (r) => r['isActive'] == true ? 'Sí' : 'No'),
    ],
    fields: [
      AdminField('firstName', 'Nombre', AdminFieldType.text, required: true),
      AdminField('firstLastName', 'Apellido', AdminFieldType.text, required: true),
      AdminField('email', 'Email', AdminFieldType.text, required: true),
      AdminField('mainAddress', 'Dirección', AdminFieldType.text, required: true),
      AdminField('phone', 'Teléfono', AdminFieldType.text),
      AdminField('role', 'Rol', AdminFieldType.select,
          initial: 'CUSTOMER',
          options: const [
            AdminOption('CUSTOMER', 'CUSTOMER'),
            AdminOption('ADMIN', 'ADMIN'),
          ]),
      AdminField('isActive', 'Activo', AdminFieldType.checkbox, initial: true),
    ],
  ),
  AdminEntity(
    key: 'audit',
    title: 'Auditoría',
    group: _grpSys,
    icon: Icons.fact_check,
    path: '/admin/auditlogs',
    readOnly: true,
    columns: [
      AdminColumn('Fecha', (r) => _fmtDateTime(r['createdAt'])),
      AdminColumn(
          'Usuario',
          (r) => _nest(r, 'user') != null
              ? '${_nestStr(r, 'user', 'firstName')} ${_nestStr(r, 'user', 'lastName')}'
              : '—'),
      AdminColumn('Acción', (r) => _g(r, 'action')),
      AdminColumn('Entidad', (r) => _g(r, 'entityType')),
    ],
  ),
];

final Map<String, AdminEntity> adminEntityByKey = {
  for (final e in adminEntities) e.key: e,
};

const _groupOrder = [_grpVuelos, _grpGeo, _grpOps, _grpFin, _grpSys];

// ─── Pantalla menú del panel ──────────────────────────────────────────────────
class AdminPanelScreen extends StatelessWidget {
  const AdminPanelScreen({super.key, required this.token, this.userName});
  final String? token;
  final String? userName;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kBg,
      appBar: AppBar(
        backgroundColor: _kNavy,
        foregroundColor: Colors.white,
        title: const Text('Panel de Administración',
            style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (userName != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text('Hola, $userName',
                  style: const TextStyle(color: Colors.black54)),
            ),
          for (final group in _groupOrder) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(4, 16, 4, 8),
              child: Text(group.toUpperCase(),
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: Colors.black45)),
            ),
            ...adminEntities.where((e) => e.group == group).map(
                  (e) => Card(
                    elevation: 0,
                    margin: const EdgeInsets.only(bottom: 8),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: Color(0xFFE2E8F0))),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: _kBlue.withValues(alpha: 0.1),
                        child: Icon(e.icon, color: _kBlue, size: 20),
                      ),
                      title: Text(e.title,
                          style: const TextStyle(fontWeight: FontWeight.w600)),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) =>
                              AdminListScreen(entity: e, token: token),
                        ),
                      ),
                    ),
                  ),
                ),
          ],
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ─── Pantalla lista de una entidad ────────────────────────────────────────────
class AdminListScreen extends StatefulWidget {
  const AdminListScreen({super.key, required this.entity, required this.token});
  final AdminEntity entity;
  final String? token;

  @override
  State<AdminListScreen> createState() => _AdminListScreenState();
}

class _AdminListScreenState extends State<AdminListScreen> {
  late final AdminApi api = AdminApi(widget.token);
  List<Map<String, dynamic>> rows = [];
  bool loading = true;
  String? error;
  String search = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final data = await api.list(widget.entity.path);
      if (!mounted) return;
      setState(() {
        rows = data;
        loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        error = e.toString().replaceFirst('Exception: ', '');
        loading = false;
      });
    }
  }

  List<Map<String, dynamic>> get _filtered {
    if (search.trim().isEmpty) return rows;
    final q = search.toLowerCase();
    return rows.where((r) {
      return widget.entity.columns
          .any((c) => c.value(r).toLowerCase().contains(q));
    }).toList();
  }

  String _rowId(Map<String, dynamic> r) {
    if (widget.entity.compositeKey) {
      return widget.entity.compositeKeys.map((k) => _g(r, k)).join('___');
    }
    return _g(r, 'id');
  }

  Future<void> _openForm([Map<String, dynamic>? row]) async {
    final saved = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => AdminFormScreen(
          entity: widget.entity,
          token: widget.token,
          initial: row,
        ),
      ),
    );
    if (saved == true) _load();
  }

  Future<void> _delete(Map<String, dynamic> row) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Eliminar'),
        content: Text('¿Seguro que deseas eliminar este registro de '
            '${widget.entity.title}?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancelar')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: _kRed),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
    if (ok != true) return;
    try {
      final e = widget.entity;
      if (e.compositeKey) {
        final parts = _rowId(row).split('___');
        await api.remove('${e.path}/${parts.join('/')}');
      } else {
        await api.remove('${e.path}/${_rowId(row)}');
      }
      _load();
    } catch (err) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(err.toString().replaceFirst('Exception: ', ''))));
    }
  }

  @override
  Widget build(BuildContext context) {
    final e = widget.entity;
    return Scaffold(
      backgroundColor: _kBg,
      appBar: AppBar(
        backgroundColor: _kNavy,
        foregroundColor: Colors.white,
        title: Text(e.title, style: const TextStyle(fontWeight: FontWeight.bold)),
      ),
      floatingActionButton: e.readOnly
          ? null
          : FloatingActionButton.extended(
              backgroundColor: _kBlue,
              foregroundColor: Colors.white,
              onPressed: () => _openForm(),
              icon: const Icon(Icons.add),
              label: const Text('Nuevo'),
            ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Buscar...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none),
              ),
              onChanged: (v) => setState(() => search = v),
            ),
          ),
          Expanded(child: _buildBody()),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (error != null) {
      return _ErrorView(message: error!, onRetry: _load);
    }
    final items = _filtered;
    if (items.isEmpty) {
      return RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          children: const [
            SizedBox(height: 120),
            Center(child: Text('Sin registros')),
          ],
        ),
      );
    }
    final e = widget.entity;
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(12, 0, 12, 96),
        itemCount: items.length,
        itemBuilder: (_, i) {
          final r = items[i];
          return Card(
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 8),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: Color(0xFFE2E8F0))),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 6, 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(e.columns.first.value(r),
                            style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: _kNavy)),
                        const SizedBox(height: 2),
                        ...e.columns.skip(1).map((c) => Padding(
                              padding: const EdgeInsets.only(top: 2),
                              child: Text('${c.label}: ${c.value(r)}',
                                  style: const TextStyle(
                                      fontSize: 13, color: Colors.black54)),
                            )),
                      ],
                    ),
                  ),
                  if (!e.readOnly)
                    Column(
                      children: [
                        if (!e.noEdit)
                          IconButton(
                            visualDensity: VisualDensity.compact,
                            icon: const Icon(Icons.edit, size: 20, color: _kBlue),
                            onPressed: () => _openForm(r),
                          ),
                        IconButton(
                          visualDensity: VisualDensity.compact,
                          icon: const Icon(Icons.delete_outline,
                              size: 20, color: _kRed),
                          onPressed: () => _delete(r),
                        ),
                      ],
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ─── Pantalla formulario (crear / editar) ─────────────────────────────────────
class AdminFormScreen extends StatefulWidget {
  const AdminFormScreen({
    super.key,
    required this.entity,
    required this.token,
    this.initial,
  });
  final AdminEntity entity;
  final String? token;
  final Map<String, dynamic>? initial;

  @override
  State<AdminFormScreen> createState() => _AdminFormScreenState();
}

class _AdminFormScreenState extends State<AdminFormScreen> {
  late final AdminApi api = AdminApi(widget.token);
  final Map<String, dynamic> _val = {};
  final Map<String, TextEditingController> _controllers = {};
  final Map<String, List<Map<String, dynamic>>> _fkOptions = {};

  bool _loadingDeps = true;
  bool _saving = false;
  String? _error;

  bool get _isEdit => widget.initial != null;

  @override
  void initState() {
    super.initState();
    _initValues();
    _loadDeps();
  }

  @override
  void dispose() {
    for (final c in _controllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  void _initValues() {
    final row = widget.initial;
    for (final f in widget.entity.fields) {
      dynamic v;
      if (row != null) {
        v = row[f.key];
        if (f.type == AdminFieldType.datetime) {
          final s = (v ?? '').toString();
          v = s.length >= 16 ? s.substring(0, 16) : s;
        } else if (f.type == AdminFieldType.date) {
          final s = (v ?? '').toString();
          v = s.length >= 10 ? s.substring(0, 10) : s;
        } else if (f.type == AdminFieldType.checkbox) {
          v = v == true;
        }
      } else {
        if (f.autoGen != null) {
          v = f.autoGen!();
        } else if (f.initial != null) {
          v = f.initial;
        } else if (f.type == AdminFieldType.checkbox) {
          v = false;
        } else if (f.type == AdminFieldType.select && f.options != null) {
          v = f.options!.first.value;
        }
      }
      switch (f.type) {
        case AdminFieldType.text:
        case AdminFieldType.number:
          _controllers[f.key] =
              TextEditingController(text: v == null ? '' : v.toString());
          break;
        default:
          _val[f.key] = v;
      }
    }
  }

  Future<void> _loadDeps() async {
    final fkEntities = widget.entity.fields
        .where((f) => f.type == AdminFieldType.fk && f.fkEntity != null)
        .map((f) => f.fkEntity!)
        .toSet();
    try {
      for (final ek in fkEntities) {
        final dep = adminEntityByKey[ek];
        if (dep == null) continue;
        _fkOptions[ek] = await api.list(dep.path);
      }
      if (!mounted) return;
      setState(() => _loadingDeps = false);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _loadingDeps = false;
      });
    }
  }

  Map<String, dynamic> _buildBody() {
    final b = <String, dynamic>{};
    for (final f in widget.entity.fields) {
      switch (f.type) {
        case AdminFieldType.checkbox:
          b[f.key] = _val[f.key] == true;
          break;
        case AdminFieldType.number:
          final raw = _controllers[f.key]?.text.trim() ?? '';
          if (raw.isEmpty) {
            if (f.required) b[f.key] = 0;
          } else {
            b[f.key] = num.tryParse(raw) ?? 0;
          }
          break;
        case AdminFieldType.datetime:
          final raw = (_val[f.key] ?? '').toString();
          if (raw.isNotEmpty) {
            final d = DateTime.tryParse(raw);
            b[f.key] = d != null ? d.toUtc().toIso8601String() : raw;
          }
          break;
        case AdminFieldType.date:
          final raw = (_val[f.key] ?? '').toString();
          if (raw.isNotEmpty) b[f.key] = raw;
          break;
        case AdminFieldType.select:
        case AdminFieldType.fk:
          final raw = (_val[f.key] ?? '').toString().trim();
          if (raw.isNotEmpty) {
            b[f.key] = raw;
          } else if (f.required) {
            b[f.key] = raw;
          }
          break;
        case AdminFieldType.text:
          var raw = (_controllers[f.key]?.text ?? '').trim();
          if (f.uppercase) raw = raw.toUpperCase();
          if (raw.isNotEmpty) {
            b[f.key] = raw;
          } else if (f.required) {
            b[f.key] = raw;
          }
          break;
      }
    }
    return b;
  }

  String? _validate() {
    for (final f in widget.entity.fields) {
      if (!f.required) continue;
      String v;
      if (f.type == AdminFieldType.text || f.type == AdminFieldType.number) {
        v = _controllers[f.key]?.text.trim() ?? '';
      } else if (f.type == AdminFieldType.checkbox) {
        continue;
      } else {
        v = (_val[f.key] ?? '').toString().trim();
      }
      if (v.isEmpty) return 'El campo "${f.label}" es obligatorio.';
    }
    return null;
  }

  Future<void> _save() async {
    final err = _validate();
    if (err != null) {
      setState(() => _error = err);
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final e = widget.entity;
      final body = _buildBody();
      if (_isEdit) {
        final id = _g(widget.initial!, 'id');
        await api.update('${e.path}/$id', patch: e.patch, b: body);
      } else {
        await api.create(e.path, body);
      }
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _saving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final e = widget.entity;
    return Scaffold(
      backgroundColor: _kBg,
      appBar: AppBar(
        backgroundColor: _kNavy,
        foregroundColor: Colors.white,
        title: Text(_isEdit ? 'Editar ${e.title}' : 'Nuevo · ${e.title}',
            style: const TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: _loadingDeps
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (_error != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _kRed.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: _kRed.withValues(alpha: 0.3)),
                    ),
                    child: Text(_error!,
                        style: const TextStyle(color: _kRed, fontSize: 13)),
                  ),
                ...e.fields.map(_buildField),
                const SizedBox(height: 16),
                FilledButton(
                  style: FilledButton.styleFrom(
                      backgroundColor: _kBlue,
                      minimumSize: const Size.fromHeight(48)),
                  onPressed: _saving ? null : _save,
                  child: _saving
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : const Text('Guardar'),
                ),
                const SizedBox(height: 24),
              ],
            ),
    );
  }

  Widget _buildField(AdminField f) {
    final label = f.required ? '${f.label} *' : f.label;
    Widget child;
    switch (f.type) {
      case AdminFieldType.text:
      case AdminFieldType.number:
        child = TextField(
          controller: _controllers[f.key],
          keyboardType: f.type == AdminFieldType.number
              ? const TextInputType.numberWithOptions(decimal: true)
              : TextInputType.text,
          inputFormatters: [
            if (f.maxLength != null)
              LengthLimitingTextInputFormatter(f.maxLength),
            if (f.uppercase) _UpperCaseFormatter(),
          ],
          decoration: _dec(label, hint: f.placeholder),
        );
        break;
      case AdminFieldType.checkbox:
        child = SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(f.label),
          value: _val[f.key] == true,
          activeThumbColor: _kBlue,
          onChanged: (v) => setState(() => _val[f.key] = v),
        );
        break;
      case AdminFieldType.select:
        child = DropdownButtonFormField<String>(
          initialValue: (_val[f.key] as String?),
          isExpanded: true,
          decoration: _dec(label),
          items: f.options!
              .map((o) =>
                  DropdownMenuItem(value: o.value, child: Text(o.label)))
              .toList(),
          onChanged: (v) => setState(() => _val[f.key] = v),
        );
        break;
      case AdminFieldType.fk:
        final opts = _fkOptions[f.fkEntity] ?? [];
        final current = (_val[f.key] ?? '').toString();
        final hasCurrent = opts.any((o) => _g(o, 'id') == current);
        child = DropdownButtonFormField<String>(
          initialValue: hasCurrent ? current : null,
          isExpanded: true,
          decoration: _dec(label),
          hint: Text(f.required ? 'Selecciona...' : '— Opcional —'),
          items: [
            if (!f.required)
              const DropdownMenuItem(value: '', child: Text('— Ninguno —')),
            ...opts.map((o) => DropdownMenuItem(
                  value: _g(o, 'id'),
                  child: Text(
                    f.fkLabel != null ? f.fkLabel!(o) : _g(o, 'id'),
                    overflow: TextOverflow.ellipsis,
                  ),
                )),
          ],
          onChanged: (v) => setState(() => _val[f.key] = v),
        );
        break;
      case AdminFieldType.date:
        child = _DateTile(
          label: label,
          value: (_val[f.key] ?? '').toString(),
          withTime: false,
          onPick: (s) => setState(() => _val[f.key] = s),
        );
        break;
      case AdminFieldType.datetime:
        child = _DateTile(
          label: label,
          value: (_val[f.key] ?? '').toString(),
          withTime: true,
          onPick: (s) => setState(() => _val[f.key] = s),
        );
        break;
    }
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: child,
    );
  }

  InputDecoration _dec(String label, {String? hint}) => InputDecoration(
        labelText: label,
        hintText: hint,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
      );
}

// ─── Selector de fecha / fecha-hora ───────────────────────────────────────────
class _DateTile extends StatelessWidget {
  const _DateTile({
    required this.label,
    required this.value,
    required this.withTime,
    required this.onPick,
  });
  final String label;
  final String value;
  final bool withTime;
  final ValueChanged<String> onPick;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        final now = DateTime.now();
        final base = DateTime.tryParse(value) ?? now;
        final date = await showDatePicker(
          context: context,
          initialDate: base,
          firstDate: DateTime(now.year - 2),
          lastDate: DateTime(now.year + 5),
        );
        if (date == null) return;
        var result = date;
        if (withTime && context.mounted) {
          final t = await showTimePicker(
            context: context,
            initialTime: TimeOfDay.fromDateTime(base),
          );
          if (t != null) {
            result = DateTime(
                date.year, date.month, date.day, t.hour, t.minute);
          }
        }
        String two(int x) => x.toString().padLeft(2, '0');
        final s = withTime
            ? '${result.year}-${two(result.month)}-${two(result.day)}T${two(result.hour)}:${two(result.minute)}'
            : '${result.year}-${two(result.month)}-${two(result.day)}';
        onPick(s);
      },
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label,
          filled: true,
          fillColor: Colors.white,
          suffixIcon: Icon(withTime ? Icons.schedule : Icons.calendar_today,
              size: 18),
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
          enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
        ),
        child: Text(
          value.isEmpty ? 'Seleccionar...' : value.replaceFirst('T', '  '),
          style: TextStyle(
              color: value.isEmpty ? Colors.black38 : Colors.black87),
        ),
      ),
    );
  }
}

class _UpperCaseFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue, TextEditingValue newValue) {
    return newValue.copyWith(text: newValue.text.toUpperCase());
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: _kRed),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: _kBlue),
              onPressed: onRetry,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }
}
