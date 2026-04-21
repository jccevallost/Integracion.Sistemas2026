// shared/swagger-paths.ts
// Documentación OpenAPI de todos los endpoints.
// Parámetros de request body alineados con los DTOs reales del proyecto.

// ════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterRequest' }
 *           example:
 *             email: juan@example.com
 *             password: "Seguro123!"
 *             firstName: Juan
 *             firstLastName: Pérez
 *             mainAddress: "Av. República 123"
 *             cityId: "uuid-de-ciudad"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       400:
 *         description: Datos inválidos (campos requeridos faltantes)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión — retorna JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginRequest' }
 *           example:
 *             email: admin@vuelos.com
 *             password: "Admin123!"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       400:
 *         description: email o password faltantes
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Perfil del usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Token ausente o inválido
 *
 * /auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: Actualizar perfil del usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:     { type: string }
 *               firstLastName: { type: string }
 *               phone:         { type: string }
 *               birthDate:     { type: string, format: date-time }
 *               mainAddress:   { type: string }
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Cambiar contraseña
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword:     { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         description: Campos faltantes
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 */

// ════════════════════════════════════════════════════════
//  COUNTRIES
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /countries:
 *   get:
 *     tags: [Countries]
 *     summary: Listar todos los países
 *     responses:
 *       200:
 *         description: Lista de países
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Country' }
 *   post:
 *     tags: [Countries]
 *     summary: Crear país (Admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, isoCode]
 *             properties:
 *               name:         { type: string, example: Ecuador }
 *               isoCode:      { type: string, example: EC, description: "Código ISO 3166 (2-3 chars)" }
 *               phoneCode:    { type: string, example: "+593" }
 *               currencyCode: { type: string, example: USD }
 *     responses:
 *       201:
 *         description: País creado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Country' }
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *       409:
 *         description: Ya existe un país con ese isoCode
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *
 * /countries/{id}:
 *   get:
 *     tags: [Countries]
 *     summary: Obtener país por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: País encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Country' }
 *       404:
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   put:
 *     tags: [Countries]
 *     summary: Actualizar país (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:         { type: string }
 *               isoCode:      { type: string }
 *               phoneCode:    { type: string }
 *               currencyCode: { type: string }
 *     responses:
 *       200:
 *         description: País actualizado
 *   delete:
 *     tags: [Countries]
 *     summary: Eliminar país (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: País eliminado
 *       404:
 *         description: No encontrado
 */

// ════════════════════════════════════════════════════════
//  CITIES
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /cities:
 *   get:
 *     tags: [Cities]
 *     summary: Listar ciudades
 *     parameters:
 *       - in: query
 *         name: countryId
 *         schema: { type: string, format: uuid }
 *         description: Filtrar por país
 *     responses:
 *       200:
 *         description: Lista de ciudades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/City' }
 *   post:
 *     tags: [Cities]
 *     summary: Crear ciudad (Admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, countryId]
 *             properties:
 *               name:      { type: string, example: Quito }
 *               countryId: { type: string, format: uuid }
 *               iataCode:  { type: string, example: UIO, description: "Código IATA de 3 letras (opcional)" }
 *     responses:
 *       201:
 *         description: Ciudad creada
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *
 * /cities/{id}:
 *   get:
 *     tags: [Cities]
 *     summary: Obtener ciudad por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Ciudad encontrada
 *       404:
 *         description: No encontrada
 *   put:
 *     tags: [Cities]
 *     summary: Actualizar ciudad (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:      { type: string }
 *               countryId: { type: string, format: uuid }
 *               iataCode:  { type: string }
 *     responses:
 *       200:
 *         description: Ciudad actualizada
 *   delete:
 *     tags: [Cities]
 *     summary: Eliminar ciudad (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Ciudad eliminada
 */

// ════════════════════════════════════════════════════════
//  AIRPORTS
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /airports:
 *   get:
 *     tags: [Airports]
 *     summary: Listar aeropuertos
 *     responses:
 *       200:
 *         description: Lista de aeropuertos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Airport' }
 *   post:
 *     tags: [Airports]
 *     summary: Crear aeropuerto (Admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [iataCode, name, cityId, timezone]
 *             properties:
 *               iataCode:  { type: string, example: UIO, description: "Código IATA exactamente 3 caracteres" }
 *               name:      { type: string, example: "Aeropuerto Mariscal Sucre" }
 *               cityId:    { type: string, format: uuid }
 *               timezone:  { type: string, example: "America/Guayaquil", description: "Timezone IANA obligatorio" }
 *     responses:
 *       201:
 *         description: Aeropuerto creado
 *       400:
 *         description: Campos faltantes (incluido timezone)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *       409:
 *         description: Ya existe un aeropuerto con ese iataCode
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *
 * /airports/{id}:
 *   get:
 *     tags: [Airports]
 *     summary: Obtener aeropuerto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Aeropuerto encontrado
 *       404:
 *         description: No encontrado
 *   put:
 *     tags: [Airports]
 *     summary: Actualizar aeropuerto (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               iataCode:  { type: string }
 *               name:      { type: string }
 *               cityId:    { type: string, format: uuid }
 *               timezone:  { type: string }
 *     responses:
 *       200:
 *         description: Aeropuerto actualizado
 *   delete:
 *     tags: [Airports]
 *     summary: Eliminar aeropuerto (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Aeropuerto eliminado
 */

// ════════════════════════════════════════════════════════
//  AIRLINES
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /airlines:
 *   get:
 *     tags: [Airlines]
 *     summary: Listar aerolíneas
 *     responses:
 *       200:
 *         description: Lista de aerolíneas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Airline' }
 *   post:
 *     tags: [Airlines]
 *     summary: Crear aerolínea (Admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [iataCode, name, countryId]
 *             properties:
 *               iataCode:  { type: string, example: LA, description: "Código IATA de 2 caracteres" }
 *               name:      { type: string, example: "LATAM Airlines" }
 *               countryId: { type: string, format: uuid }
 *               logoUrl:   { type: string, format: uri, description: "URL del logo (opcional)" }
 *     responses:
 *       201:
 *         description: Aerolínea creada
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *
 * /airlines/{id}:
 *   get:
 *     tags: [Airlines]
 *     summary: Obtener aerolínea por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Aerolínea encontrada
 *   put:
 *     tags: [Airlines]
 *     summary: Actualizar aerolínea (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               iataCode:  { type: string }
 *               name:      { type: string }
 *               countryId: { type: string, format: uuid }
 *               logoUrl:   { type: string, format: uri }
 *     responses:
 *       200:
 *         description: Aerolínea actualizada
 *   delete:
 *     tags: [Airlines]
 *     summary: Eliminar aerolínea (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Aerolínea eliminada
 */

// ════════════════════════════════════════════════════════
//  AIRCRAFT
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /aircraft:
 *   get:
 *     tags: [Aircrafts]
 *     summary: Listar aeronaves
 *     responses:
 *       200:
 *         description: Lista de aeronaves
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Aircraft' }
 *   post:
 *     tags: [Aircrafts]
 *     summary: Crear aeronave (Admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [airlineId, modelName, registration]
 *             properties:
 *               airlineId:    { type: string, format: uuid }
 *               modelName:    { type: string, example: "Boeing 737-800" }
 *               registration: { type: string, example: "HC-CPP", description: "Matrícula de la aeronave" }
 *               hasWifi:      { type: boolean, default: false }
 *               hasUsb:       { type: boolean, default: false }
 *     responses:
 *       201:
 *         description: Aeronave creada
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *
 * /aircraft/{id}:
 *   get:
 *     tags: [Aircrafts]
 *     summary: Obtener aeronave por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Aeronave encontrada
 *   put:
 *     tags: [Aircrafts]
 *     summary: Actualizar aeronave (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               airlineId:    { type: string, format: uuid }
 *               modelName:    { type: string }
 *               registration: { type: string }
 *               hasWifi:      { type: boolean }
 *               hasUsb:       { type: boolean }
 *     responses:
 *       200:
 *         description: Aeronave actualizada
 *   delete:
 *     tags: [Aircrafts]
 *     summary: Eliminar aeronave (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Aeronave eliminada
 */

// ════════════════════════════════════════════════════════
//  FLIGHTS
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /flights:
 *   get:
 *     tags: [Flights]
 *     summary: Listar todos los vuelos
 *     responses:
 *       200:
 *         description: Lista de vuelos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Flight' }
 *   post:
 *     tags: [Flights]
 *     summary: Crear vuelo (Admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [originAirportIata, destinationAirportIata, departureDate]
 *             properties:
 *               originAirportIata:      { type: string, example: UIO, description: "Código IATA origen (3 chars)" }
 *               destinationAirportIata: { type: string, example: GYE, description: "Código IATA destino (3 chars) — distinto al origen" }
 *               departureDate:          { type: string, example: "2026-05-15T08:00:00.000Z", description: "Fecha/hora de salida (ISO 8601)" }
 *               status:                 { type: string, enum: [SCHEDULED, DELAYED, CANCELLED, COMPLETED], default: SCHEDULED }
 *               segments:
 *                 type: array
 *                 description: Segmentos del vuelo (opcional, se crean anidados)
 *                 items:
 *                   type: object
 *                   required: [segmentNumber, originAirportId, destinationAirportId, departureDateTime, arrivalDateTime, airlineId, estimatedDuration]
 *                   properties:
 *                     segmentNumber:        { type: string, example: "1" }
 *                     originAirportId:      { type: string, format: uuid }
 *                     destinationAirportId: { type: string, format: uuid }
 *                     departureDateTime:    { type: string, format: date-time }
 *                     arrivalDateTime:      { type: string, format: date-time }
 *                     airlineId:            { type: string, format: uuid }
 *                     aircraftId:           { type: string, format: uuid, nullable: true }
 *                     estimatedDuration:    { type: integer, example: 60, description: "Duración en minutos" }
 *               flightClasses:
 *                 type: array
 *                 description: Clases del vuelo (opcional, se crean anidadas)
 *                 items:
 *                   type: object
 *                   required: [cabinClass, availableSeats, basePrice]
 *                   properties:
 *                     cabinClass:     { type: string, enum: [ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST] }
 *                     availableSeats: { type: integer, minimum: 1 }
 *                     basePrice:      { type: number, example: 89.99 }
 *     responses:
 *       201:
 *         description: Vuelo creado
 *       400:
 *         description: Campos requeridos faltantes o inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *
 * /flights/search:
 *   get:
 *     tags: [Flights]
 *     summary: Buscar vuelos disponibles
 *     parameters:
 *       - in: query
 *         name: origin
 *         required: true
 *         schema: { type: string, example: UIO }
 *         description: Código IATA del aeropuerto de origen (3 letras)
 *       - in: query
 *         name: destination
 *         required: true
 *         schema: { type: string, example: GYE }
 *         description: Código IATA del aeropuerto de destino (3 letras)
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date, example: '2026-05-15' }
 *         description: Fecha de salida (YYYY-MM-DD)
 *       - in: query
 *         name: passengers
 *         schema: { type: integer, minimum: 1, maximum: 9, default: 1 }
 *         description: Número de pasajeros
 *       - in: query
 *         name: class
 *         schema: { type: string, enum: [ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST] }
 *         description: Filtrar por clase de cabina
 *     responses:
 *       200:
 *         description: Vuelos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Flight' }
 *       400:
 *         description: origin, destination o date faltantes/inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *
 * /flights/{id}:
 *   get:
 *     tags: [Flights]
 *     summary: Obtener vuelo por ID (incluye segmentos y clases)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Vuelo encontrado con segmentos y clases
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Flight' }
 *       404:
 *         description: Vuelo no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   put:
 *     tags: [Flights]
 *     summary: Actualizar vuelo (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:                 { type: string, enum: [SCHEDULED, DELAYED, CANCELLED, COMPLETED] }
 *               departureDate:          { type: string, format: date-time }
 *               originAirportIata:      { type: string }
 *               destinationAirportIata: { type: string }
 *     responses:
 *       200:
 *         description: Vuelo actualizado
 *   delete:
 *     tags: [Flights]
 *     summary: Eliminar vuelo (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Vuelo eliminado
 */

// ════════════════════════════════════════════════════════
//  FLIGHT CLASSES
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /flight-classes:
 *   get:
 *     tags: [Flight Classes]
 *     summary: Listar clases de vuelo
 *     responses:
 *       200:
 *         description: Lista de clases
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/FlightClass' }
 *   post:
 *     tags: [Flight Classes]
 *     summary: Crear clase de vuelo (Admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [flightId, cabinClass, availableSeats, basePrice]
 *             properties:
 *               flightId:       { type: string, format: uuid }
 *               cabinClass:     { type: string, enum: [ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST] }
 *               availableSeats: { type: integer, minimum: 0 }
 *               basePrice:      { type: number, example: 89.99, description: "Precio base por pasajero" }
 *     responses:
 *       201:
 *         description: Clase creada
 *       400:
 *         description: Campos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *       409:
 *         description: Ya existe esa cabinClass para ese vuelo
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *
 * /flight-classes/by-flight/{flightId}:
 *   get:
 *     tags: [Flight Classes]
 *     summary: Clases disponibles de un vuelo
 *     parameters:
 *       - in: path
 *         name: flightId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Clases del vuelo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/FlightClass' }
 *
 * /flight-classes/{id}:
 *   get:
 *     tags: [Flight Classes]
 *     summary: Obtener clase por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Clase encontrada
 *       404:
 *         description: No encontrada
 *   patch:
 *     tags: [Flight Classes]
 *     summary: Actualizar clase (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cabinClass:     { type: string, enum: [ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST] }
 *               availableSeats: { type: integer, minimum: 0 }
 *               basePrice:      { type: number }
 *     responses:
 *       200:
 *         description: Clase actualizada
 *   delete:
 *     tags: [Flight Classes]
 *     summary: Eliminar clase (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Clase eliminada
 */

// ════════════════════════════════════════════════════════
//  SEGMENTS
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /segments:
 *   get:
 *     tags: [Segments]
 *     summary: Listar segmentos de vuelo
 *     responses:
 *       200:
 *         description: Lista de segmentos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Segment' }
 *   post:
 *     tags: [Segments]
 *     summary: Crear segmento de vuelo (Admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [segmentNumber, originAirportId, destinationAirportId, departureDateTime, arrivalDateTime, airlineId, estimatedDuration]
 *             properties:
 *               segmentNumber:        { type: string, example: "1", description: "Identificador de tramo dentro del vuelo" }
 *               originAirportId:      { type: string, format: uuid }
 *               destinationAirportId: { type: string, format: uuid }
 *               departureDateTime:    { type: string, format: date-time }
 *               arrivalDateTime:      { type: string, format: date-time }
 *               airlineId:            { type: string, format: uuid }
 *               estimatedDuration:    { type: integer, example: 60, description: "Duración en minutos (requerido)" }
 *               aircraftId:           { type: string, format: uuid, nullable: true }
 *               flightId:             { type: string, format: uuid, nullable: true, description: "Asociar a un vuelo existente" }
 *     responses:
 *       201:
 *         description: Segmento creado
 *       400:
 *         description: Campos requeridos faltantes
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *
 * /segments/by-flight/{flightId}:
 *   get:
 *     tags: [Segments]
 *     summary: Segmentos de un vuelo
 *     parameters:
 *       - in: path
 *         name: flightId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Segmentos del vuelo
 *
 * /segments/{id}:
 *   get:
 *     tags: [Segments]
 *     summary: Obtener segmento por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Segmento encontrado
 *   patch:
 *     tags: [Segments]
 *     summary: Actualizar segmento (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departureDateTime:    { type: string, format: date-time }
 *               arrivalDateTime:      { type: string, format: date-time }
 *               estimatedDuration:    { type: integer }
 *               aircraftId:           { type: string, format: uuid, nullable: true }
 *               airlineId:            { type: string, format: uuid }
 *               flightId:             { type: string, format: uuid, nullable: true }
 *     responses:
 *       200:
 *         description: Segmento actualizado
 *   delete:
 *     tags: [Segments]
 *     summary: Eliminar segmento (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Segmento eliminado
 */

// ════════════════════════════════════════════════════════
//  RESERVATIONS
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Listar todas las reservas (Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Reservation' }
 *   post:
 *     tags: [Reservations]
 *     summary: Crear reserva (usuario autenticado)
 *     description: |
 *       Crea la reserva, descuenta asientos disponibles y (opcionalmente) aplica promoción.
 *       La operación es atómica (transacción DB). El estado inicial es CONFIRMED.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReservationRequest'
 *           example:
 *             flightClassId: "uuid-clase-vuelo"
 *             passengers:
 *               - firstName: Juan
 *                 lastName: Pérez
 *                 documentNumber: A1234567
 *             promotionCode: VERANO20
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Reservation' }
 *       400:
 *         description: Campos faltantes — flightClassId, passengers o datos de pasajero incompletos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *       401:
 *         description: Token requerido
 *       422:
 *         description: Sin disponibilidad de asientos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *
 * /reservations/my:
 *   get:
 *     tags: [Reservations]
 *     summary: Mis reservas (usuario autenticado)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Reservas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Reservation' }
 *
 * /reservations/{id}:
 *   get:
 *     tags: [Reservations]
 *     summary: Obtener reserva por ID (propia o Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Reservation' }
 *       403:
 *         description: No tienes permisos para ver esta reserva
 *       404:
 *         description: Reserva no encontrada
 *   delete:
 *     tags: [Reservations]
 *     summary: Cancelar reserva (propia o Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Reserva cancelada
 *       400:
 *         description: La reserva ya está cancelada o completada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Sin permiso para cancelar esta reserva
 */

// ════════════════════════════════════════════════════════
//  RESERVATION PASSENGERS
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /reservation-passengers:
 *   get:
 *     tags: [Reservation Passengers]
 *     summary: Listar todos los pasajeros de reservas (Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de pasajeros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ReservationPassenger' }
 *
 * /reservation-passengers/by-reservation/{reservationId}:
 *   get:
 *     tags: [Reservation Passengers]
 *     summary: Pasajeros de una reserva específica
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Pasajeros de la reserva
 *
 * /reservation-passengers/{id}:
 *   get:
 *     tags: [Reservation Passengers]
 *     summary: Obtener pasajero de reserva por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Pasajero encontrado
 *   patch:
 *     tags: [Reservation Passengers]
 *     summary: Actualizar datos del pasajero (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:      { type: string }
 *               lastName:       { type: string }
 *               documentNumber: { type: string }
 *               seatNumber:     { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Pasajero actualizado
 */

// ════════════════════════════════════════════════════════
//  PAYMENTS
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /payments:
 *   get:
 *     tags: [Payments]
 *     summary: Listar todos los pagos (Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de pagos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Payment' }
 *   post:
 *     tags: [Payments]
 *     summary: Registrar pago de una reserva
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reservationId, amount, provider, transactionId]
 *             properties:
 *               reservationId: { type: string, format: uuid }
 *               amount:        { type: number, example: 150.00, description: "Monto pagado (> 0)" }
 *               provider:      { type: string, example: VISA, description: "VISA | MASTERCARD | AMEX | PAYPAL" }
 *               transactionId: { type: string, example: "TXN-1714608000000-ABC123", description: "ID único de la transacción (requerido)" }
 *               status:        { type: string, enum: [PENDING, COMPLETED, FAILED, REFUNDED], default: COMPLETED }
 *     responses:
 *       201:
 *         description: Pago registrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Payment' }
 *       400:
 *         description: Campos faltantes — transactionId es obligatorio
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *       409:
 *         description: Ya existe un pago con ese transactionId o reservationId
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *
 * /payments/by-reservation/{reservationId}:
 *   get:
 *     tags: [Payments]
 *     summary: Pagos de una reserva específica
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Pagos de la reserva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Payment' }
 *
 * /payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Obtener pago por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Pago encontrado
 *       404:
 *         description: Pago no encontrado
 *   patch:
 *     tags: [Payments]
 *     summary: Actualizar estado del pago (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:      { type: string }
 *               transactionId: { type: string }
 *               status:        { type: string, enum: [PENDING, COMPLETED, FAILED, REFUNDED] }
 *     responses:
 *       200:
 *         description: Pago actualizado
 *   delete:
 *     tags: [Payments]
 *     summary: Eliminar pago (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Pago eliminado
 */

// ════════════════════════════════════════════════════════
//  INVOICES
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /invoices:
 *   get:
 *     tags: [Invoices]
 *     summary: Listar facturas
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Invoice' }
 *   post:
 *     tags: [Invoices]
 *     summary: Crear factura para un pago
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentId, billingProfileId, invoiceNumber, subtotal, taxAmount, total]
 *             properties:
 *               paymentId:        { type: string, format: uuid }
 *               billingProfileId: { type: string, format: uuid }
 *               invoiceNumber:    { type: string, example: "FAC-2026-00001", description: "Número único de factura" }
 *               subtotal:         { type: number, example: 130.43, description: "Subtotal antes de impuestos" }
 *               taxAmount:        { type: number, example: 19.57, description: "IVA 15%" }
 *               total:            { type: number, example: 150.00 }
 *     responses:
 *       201:
 *         description: Factura creada
 *       400:
 *         description: Campos requeridos faltantes
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *       409:
 *         description: Ya existe una factura con ese invoiceNumber
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *
 * /invoices/{id}:
 *   get:
 *     tags: [Invoices]
 *     summary: Obtener factura por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Factura encontrada
 *       404:
 *         description: No encontrada
 */

// ════════════════════════════════════════════════════════
//  INVOICE ITEMS
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /invoice-items:
 *   get:
 *     tags: [Invoice Items]
 *     summary: Listar ítems de factura
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de ítems
 *   post:
 *     tags: [Invoice Items]
 *     summary: Crear ítem de factura
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invoiceId, description, quantity, unitPrice, totalPrice]
 *             properties:
 *               invoiceId:   { type: string, format: uuid }
 *               description: { type: string, example: "Vuelo UIO-GYE Clase Económica" }
 *               quantity:    { type: integer, minimum: 1 }
 *               unitPrice:   { type: number, example: 89.99 }
 *               totalPrice:  { type: number, example: 89.99, description: "= quantity × unitPrice" }
 *     responses:
 *       201:
 *         description: Ítem creado
 *       400:
 *         description: Campos faltantes — totalPrice es requerido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *
 * /invoice-items/{id}:
 *   get:
 *     tags: [Invoice Items]
 *     summary: Obtener ítem por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Ítem encontrado
 *   patch:
 *     tags: [Invoice Items]
 *     summary: Actualizar ítem (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string }
 *               quantity:    { type: integer }
 *               unitPrice:   { type: number }
 *               totalPrice:  { type: number }
 *     responses:
 *       200:
 *         description: Ítem actualizado
 *   delete:
 *     tags: [Invoice Items]
 *     summary: Eliminar ítem (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Ítem eliminado
 */

// ════════════════════════════════════════════════════════
//  BILLING PROFILES
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /billing-profiles:
 *   get:
 *     tags: [Billing Profiles]
 *     summary: Listar perfiles de facturación (Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de perfiles
 *   post:
 *     tags: [Billing Profiles]
 *     summary: Crear perfil de facturación (userId desde token)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [taxId, businessName, address, cityId]
 *             properties:
 *               taxId:        { type: string, example: "1791234567001", description: "RUC o cédula" }
 *               businessName: { type: string, example: "Juan Pérez (persona natural)" }
 *               address:      { type: string, example: "Av. República 123, Quito" }
 *               cityId:       { type: string, format: uuid }
 *               email:        { type: string, format: email, nullable: true }
 *               isDefault:    { type: boolean, default: false }
 *     responses:
 *       201:
 *         description: Perfil creado
 *       400:
 *         description: Campos faltantes
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *
 * /billing-profiles/my:
 *   get:
 *     tags: [Billing Profiles]
 *     summary: Mis perfiles de facturación
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Perfiles del usuario autenticado
 *
 * /billing-profiles/{id}:
 *   get:
 *     tags: [Billing Profiles]
 *     summary: Obtener perfil por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *   patch:
 *     tags: [Billing Profiles]
 *     summary: Actualizar perfil de facturación
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taxId:        { type: string }
 *               businessName: { type: string }
 *               address:      { type: string }
 *               cityId:       { type: string, format: uuid }
 *               email:        { type: string, format: email, nullable: true }
 *               isDefault:    { type: boolean }
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *   delete:
 *     tags: [Billing Profiles]
 *     summary: Eliminar perfil de facturación
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Perfil eliminado
 */

// ════════════════════════════════════════════════════════
//  PROMOTIONS
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /promotions:
 *   get:
 *     tags: [Promotions]
 *     summary: Listar promociones (Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de promociones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Promotion' }
 *   post:
 *     tags: [Promotions]
 *     summary: Crear promoción (Admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, discountType, discountValue]
 *             properties:
 *               code:          { type: string, example: VERANO20, description: "Código único de promoción" }
 *               discountType:  { type: string, enum: [PERCENTAGE, FIXED_AMOUNT] }
 *               discountValue: { type: number, example: 20, description: "Porcentaje (20 = 20%) o monto fijo" }
 *               maxUsages:     { type: integer, nullable: true, example: 100, description: "null = ilimitado" }
 *               isActive:      { type: boolean, default: true }
 *     responses:
 *       201:
 *         description: Promoción creada
 *       400:
 *         description: discountType inválido o campos faltantes
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *       409:
 *         description: Ya existe una promoción con ese código
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *
 * /promotions/validate:
 *   post:
 *     tags: [Promotions]
 *     summary: Validar código de promoción (público — no requiere auth)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, amount]
 *             properties:
 *               code:   { type: string, example: VERANO20 }
 *               amount: { type: number, example: 200, description: "Monto base antes del descuento" }
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:          { type: boolean }
 *                     code:           { type: string }
 *                     discountType:   { type: string, enum: [PERCENTAGE, FIXED_AMOUNT] }
 *                     discountValue:  { type: number }
 *                     discountAmount: { type: number, description: "Monto descontado" }
 *                     finalAmount:    { type: number, description: "Monto final tras descuento" }
 *       400:
 *         description: code o amount faltantes
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *
 * /promotions/{id}:
 *   get:
 *     tags: [Promotions]
 *     summary: Obtener promoción por ID (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Promoción encontrada
 *   patch:
 *     tags: [Promotions]
 *     summary: Actualizar promoción (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               discountValue: { type: number }
 *               isActive:      { type: boolean }
 *               maxUsages:     { type: integer, nullable: true }
 *     responses:
 *       200:
 *         description: Promoción actualizada
 *   delete:
 *     tags: [Promotions]
 *     summary: Eliminar promoción (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Promoción eliminada
 */

// ════════════════════════════════════════════════════════
//  SERVICE CATALOG
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /service-catalog:
 *   get:
 *     tags: [Service Catalog]
 *     summary: Listar catálogo de servicios (público)
 *     responses:
 *       200:
 *         description: Lista de servicios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ServiceCatalog' }
 *   post:
 *     tags: [Service Catalog]
 *     summary: Crear servicio en catálogo (Admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, category]
 *             properties:
 *               name:        { type: string, example: "Equipaje adicional 23kg" }
 *               code:        { type: string, example: BAG_23KG }
 *               category:    { type: string, enum: [BAGGAGE, MEAL, SEAT, ENTERTAINMENT, LOUNGE, INSURANCE, TRANSPORT, OTRO] }
 *               description: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Servicio creado
 *       400:
 *         description: Campos faltantes o category inválida
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *
 * /service-catalog/{id}:
 *   get:
 *     tags: [Service Catalog]
 *     summary: Obtener servicio por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Servicio encontrado
 *   patch:
 *     tags: [Service Catalog]
 *     summary: Actualizar servicio (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:        { type: string }
 *               description: { type: string, nullable: true }
 *               category:    { type: string, enum: [BAGGAGE, MEAL, SEAT, ENTERTAINMENT, LOUNGE, INSURANCE, TRANSPORT, OTRO] }
 *     responses:
 *       200:
 *         description: Servicio actualizado
 *   delete:
 *     tags: [Service Catalog]
 *     summary: Eliminar servicio del catálogo (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Servicio eliminado
 */

// ════════════════════════════════════════════════════════
//  AIRLINE AIRPORTS
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /airline-airports:
 *   get:
 *     tags: [Airline Airports]
 *     summary: Listar relaciones aerolínea-aeropuerto
 *     responses:
 *       200:
 *         description: Lista de relaciones
 *   post:
 *     tags: [Airline Airports]
 *     summary: Crear relación aerolínea-aeropuerto (Admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [airlineId, airportId]
 *             properties:
 *               airlineId: { type: string, format: uuid }
 *               airportId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Relación creada
 *       400:
 *         description: airlineId o airportId faltantes
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *
 * /airline-airports/{id}:
 *   get:
 *     tags: [Airline Airports]
 *     summary: Obtener relación por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Relación encontrada
 *   delete:
 *     tags: [Airline Airports]
 *     summary: Eliminar relación (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Relación eliminada
 */

// ════════════════════════════════════════════════════════
//  AIRLINE SERVICE CONFIG
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /airline-service-config:
 *   get:
 *     tags: [Airline Service Configs]
 *     summary: Listar configuraciones de precio de servicios por aerolínea
 *     responses:
 *       200:
 *         description: Lista de configuraciones
 *   post:
 *     tags: [Airline Service Configs]
 *     summary: Crear precio de servicio para una aerolínea (Admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serviceId, airlineId, price]
 *             properties:
 *               serviceId:       { type: string, format: uuid, description: "ID del servicio en el catálogo (ServiceCatalog.id)" }
 *               airlineId:       { type: string, format: uuid }
 *               price:           { type: number, example: 25.00 }
 *               originAirportId: { type: string, format: uuid, nullable: true, description: "Si aplica solo para cierta ruta" }
 *               destAirportId:   { type: string, format: uuid, nullable: true }
 *               currency:        { type: string, example: USD, default: USD }
 *     responses:
 *       201:
 *         description: Configuración creada
 *       400:
 *         description: serviceId, airlineId o price faltantes
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *
 * /airline-service-config/{id}:
 *   get:
 *     tags: [Airline Service Configs]
 *     summary: Obtener configuración por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Configuración encontrada
 *   patch:
 *     tags: [Airline Service Configs]
 *     summary: Actualizar precio/disponibilidad (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:           { type: number }
 *               currency:        { type: string }
 *               originAirportId: { type: string, format: uuid, nullable: true }
 *               destAirportId:   { type: string, format: uuid, nullable: true }
 *     responses:
 *       200:
 *         description: Configuración actualizada
 *   delete:
 *     tags: [Airline Service Configs]
 *     summary: Eliminar configuración (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Configuración eliminada
 */

// ════════════════════════════════════════════════════════
//  BOARDING PASSES
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /boarding-passes:
 *   get:
 *     tags: [Boarding Passes]
 *     summary: Listar todos los pases de abordar (Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de pases de abordar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/BoardingPass' }
 *   post:
 *     tags: [Boarding Passes]
 *     summary: Crear pase de abordar — hacer check-in
 *     description: |
 *       Crea el boarding pass de un pasajero para un segmento de vuelo.
 *       `passengerId` = `ReservationPassenger.id` (obtenido de GET /reservations/:id)
 *       `segmentId`   = `Segment.id` del vuelo (obtenido de GET /flights/:id o GET /segments/by-flight/:flightId)
 *       `boardingCode` debe ser único — generado cliente: "BC-{random}"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [passengerId, segmentId, boardingCode]
 *             properties:
 *               passengerId:   { type: string, format: uuid, description: "ReservationPassenger.id" }
 *               segmentId:     { type: string, format: uuid, description: "Segment.id del vuelo" }
 *               boardingCode:  { type: string, example: "BC-AB1234", description: "Código único de embarque" }
 *               gate:          { type: string, example: "G14", nullable: true }
 *               boardingGroup: { type: string, example: "B", nullable: true }
 *               checkInAt:     { type: string, format: date-time, nullable: true }
 *               status:        { type: string, enum: [NOT_CHECKED_IN, CHECKED_IN, BOARDED, NO_SHOW], default: CHECKED_IN }
 *     responses:
 *       201:
 *         description: Pase de abordar creado — check-in exitoso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/BoardingPass' }
 *       400:
 *         description: passengerId, segmentId o boardingCode faltantes
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *       409:
 *         description: Ya existe un pase con ese boardingCode
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *
 * /boarding-passes/by-passenger/{passengerId}:
 *   get:
 *     tags: [Boarding Passes]
 *     summary: Pases de abordar de un pasajero
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: passengerId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ReservationPassenger.id
 *     responses:
 *       200:
 *         description: Pases del pasajero
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/BoardingPass' }
 *
 * /boarding-passes/{id}:
 *   get:
 *     tags: [Boarding Passes]
 *     summary: Obtener pase de abordar por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Pase encontrado
 *   patch:
 *     tags: [Boarding Passes]
 *     summary: Actualizar estado del check-in (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gate:          { type: string, nullable: true }
 *               boardingGroup: { type: string, nullable: true }
 *               checkInAt:     { type: string, format: date-time, nullable: true }
 *               status:        { type: string, enum: [NOT_CHECKED_IN, CHECKED_IN, BOARDED, NO_SHOW] }
 *     responses:
 *       200:
 *         description: Pase actualizado
 *   delete:
 *     tags: [Boarding Passes]
 *     summary: Eliminar pase de abordar (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Pase eliminado
 */

// ════════════════════════════════════════════════════════
//  PASSENGER SERVICES
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /passenger-services:
 *   get:
 *     tags: [Passenger Services]
 *     summary: Listar todos los servicios de pasajeros (Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de servicios de pasajeros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PassengerService' }
 *   post:
 *     tags: [Passenger Services]
 *     summary: Agregar servicio adicional a un pasajero
 *     description: |
 *       `passengerId` = `ReservationPassenger.id`
 *       `serviceConfigId` = `AirlineServiceConfig.id` (precio específico de aerolínea para ese servicio)
 *       `unitPriceAtBooking` = precio tomado del AirlineServiceConfig en el momento de la compra
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [passengerId, serviceConfigId, quantity, unitPriceAtBooking]
 *             properties:
 *               passengerId:        { type: string, format: uuid, description: "ReservationPassenger.id" }
 *               serviceConfigId:    { type: string, format: uuid, description: "AirlineServiceConfig.id" }
 *               quantity:           { type: integer, minimum: 1, example: 1 }
 *               unitPriceAtBooking: { type: number, example: 25.00, description: "Precio unitario al momento de la compra" }
 *     responses:
 *       201:
 *         description: Servicio agregado al pasajero
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/PassengerService' }
 *       400:
 *         description: Campos requeridos faltantes — unitPriceAtBooking es obligatorio
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *
 * /passenger-services/by-passenger/{passengerId}:
 *   get:
 *     tags: [Passenger Services]
 *     summary: Servicios adicionales de un pasajero
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: passengerId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ReservationPassenger.id
 *     responses:
 *       200:
 *         description: Servicios del pasajero
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PassengerService' }
 *
 * /passenger-services/{id}:
 *   get:
 *     tags: [Passenger Services]
 *     summary: Obtener servicio de pasajero por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Servicio encontrado
 *   patch:
 *     tags: [Passenger Services]
 *     summary: Actualizar servicio (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:           { type: integer, minimum: 1 }
 *               unitPriceAtBooking: { type: number }
 *     responses:
 *       200:
 *         description: Servicio actualizado
 *   delete:
 *     tags: [Passenger Services]
 *     summary: Eliminar servicio de pasajero
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Servicio eliminado
 */

// ════════════════════════════════════════════════════════
//  ADMIN
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Estadísticas del dashboard administrativo
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Métricas del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:        { type: integer }
 *                     totalFlights:      { type: integer }
 *                     totalReservations: { type: integer }
 *                     totalAirports:     { type: integer }
 *
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Listar usuarios (Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *   post:
 *     tags: [Admin]
 *     summary: Crear usuario desde panel Admin
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterRequest' }
 *     responses:
 *       201:
 *         description: Usuario creado
 *
 * /admin/users/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Actualizar usuario (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:     { type: string }
 *               firstLastName: { type: string }
 *               role:          { type: string, enum: [CUSTOMER, ADMIN] }
 *               isActive:      { type: boolean }
 *               password:      { type: string, description: "Dejar vacío para no cambiar" }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *   delete:
 *     tags: [Admin]
 *     summary: Eliminar usuario (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */

// ════════════════════════════════════════════════════════
//  AUDIT LOGS
// ════════════════════════════════════════════════════════
/**
 * @openapi
 * /audit-logs:
 *   get:
 *     tags: [Audit Logs]
 *     summary: Listar logs de auditoría (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Logs de auditoría con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:        { type: string, format: uuid }
 *                       action:    { type: string }
 *                       entity:    { type: string }
 *                       entityId:  { type: string }
 *                       userId:    { type: string, nullable: true }
 *                       createdAt: { type: string, format: date-time }
 */

export {};
