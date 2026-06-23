# Informe tecnico - Web Angular no reflejaba datos (API mal apuntada)

- **Fecha:** 2026-06-23
- **Componente afectado:** `vuelos-angular` (frontend web / panel admin)
- **Severidad:** Alta (la web no mostraba ningun dato)
- **Estado:** Resuelto (cambios en working tree, pendiente de commit)

---

## 1. Resumen ejecutivo

La aplicacion web Angular no reflejaba ninguna informacion (vuelos, login,
reservas, panel admin). La causa fue que el frontend web apuntaba a un backend
**caido**: el API Gateway v2 (`vuelos-api-gateway-v2.onrender.com`) respondia
**404 en todas las rutas**.

La app movil (Flutter) ya habia sido migrada en commits previos al backend real
(`integracion-sistemas2026.onrender.com/api`), pero la web se quedo apuntando al
gateway v2 muerto. La solucion fue repuntar las **12 referencias** de URL de la
web al backend que si responde.

---

## 2. Sintoma reportado

> "Por que en la version web no se refleja nada?"

La web cargaba la interfaz pero ninguna llamada a la API devolvia datos: listados
vacios, login sin respuesta y panel admin sin contenido.

---

## 3. Diagnostico

### 3.1 Backends en juego

| App | URL configurada | Estado |
|-----|-----------------|--------|
| Web (Angular) | `https://vuelos-api-gateway-v2.onrender.com/api/v2` | **404 - caido** |
| Movil (Flutter) | `https://integracion-sistemas2026.onrender.com/api` | **200 - operativo** |

### 3.2 Evidencia de conectividad

Pruebas con `curl` (codigo HTTP):

```
# Gateway v2 (al que apuntaba la web)
GET https://vuelos-api-gateway-v2.onrender.com/api/v2/flights   -> 404

# Backend real (al que apunta el movil)
GET https://integracion-sistemas2026.onrender.com/api/v1/flights -> 200
GET https://integracion-sistemas2026.onrender.com/api/flights    -> 200
POST https://integracion-sistemas2026.onrender.com/api/auth/login -> 500 (body vacio; la ruta existe)
```

### 3.3 Confirmacion en el codigo

El propio codigo del movil documentaba que el gateway v2 estaba caido, en
`vuelos-mobile/lib/admin/admin_panel.dart` (lineas 17-21):

```dart
// El panel admin consume el MISMO backend que el resto de la app (main.dart).
// Las rutas /admin/* existen en https://integracion-sistemas2026.onrender.com/api
// (responden 401 sin token, 200 con token de ADMIN). El gateway v2 anterior
// (vuelos-api-gateway-v2.onrender.com) esta caido y devolvia 404 en todo.
```

La URL del backend estaba **hardcodeada** en cada servicio Angular en lugar de
leerse de un unico punto de configuracion, lo que provoco la desincronizacion
respecto al movil.

---

## 4. Causa raiz

1. El API Gateway v2 (`vuelos-api-gateway-v2.onrender.com`) dejo de estar
   disponible y devuelve 404 en todas sus rutas.
2. La app movil fue migrada al backend monolitico real
   (`integracion-sistemas2026.onrender.com/api`) en commits previos
   (`ea42926`, `f6b41a7`, `156e37e`).
3. La web Angular **no** fue migrada y siguio apuntando al gateway v2 caido.
4. Cada servicio Angular tenia la URL hardcodeada, sin una fuente unica de
   configuracion, facilitando la desincronizacion.

---

## 5. Solucion aplicada

Se repuntaron todas las referencias de la web del gateway v2 caido al backend
operativo:

- **Antes:** `https://vuelos-api-gateway-v2.onrender.com/api/v2`
- **Despues:** `https://integracion-sistemas2026.onrender.com/api`

### 5.1 Archivos modificados (12)

| Archivo | Constante |
|---------|-----------|
| `vuelos-angular/src/environments/environment.ts` | `apiUrl` |
| `vuelos-angular/src/app/core/services/auth.service.ts` | `BASE` |
| `vuelos-angular/src/app/core/services/flights.service.ts` | `BASE` |
| `vuelos-angular/src/app/core/services/reservations.service.ts` | `BASE` |
| `vuelos-angular/src/app/core/services/payments.service.ts` | `BASE` |
| `vuelos-angular/src/app/core/services/invoices.service.ts` | `BASE` |
| `vuelos-angular/src/app/core/services/promotions.service.ts` | `BASE` |
| `vuelos-angular/src/app/core/services/passenger-services.service.ts` | `BASE` |
| `vuelos-angular/src/app/core/services/boarding-passes.service.ts` | `BASE` |
| `vuelos-angular/src/app/core/services/airline-service-configs.service.ts` | `BASE` |
| `vuelos-angular/src/app/core/services/admin.service.ts` | `API_URL` |
| `vuelos-angular/src/app/core/services/airports.service.ts` | fallback de `environment.apiUrl` |

---

## 6. Verificacion

Tras el cambio se confirmo que las rutas que arma la web existen en el backend
real (los codigos != 2xx corresponden a falta de token o de parametros, no a
ruta inexistente):

```
GET  /api/flights         -> 200  (listado de vuelos)
GET  /api/flights/search  -> 400  (requiere parametros; ruta existe)
POST /api/auth/login      -> 500  (body vacio; ruta existe)
GET  /api/auth/me         -> 401  (requiere token; ruta existe)
```

Verificacion de que no quedan referencias al gateway v2:

```
grep -rn "vuelos-api-gateway-v2" vuelos-angular/src   -> sin resultados
```

---

## 7. Riesgo pendiente

La web fue desarrollada contra los **contratos v2**, mientras que el movil tuvo
que "alinear contratos con backend" (commit `ea42926`). La URL ya es correcta,
pero **algun shape de respuesta podria diferir** (nombres de campos, estructura
de paginacion, etc.). Esto solo se detecta ejecutando la web contra datos reales
(login + listado de vuelos + panel admin).

---

## 8. Recomendaciones

1. **Centralizar la URL del backend** en `environment.ts` y que todos los
   servicios la lean de ahi, eliminando las constantes `BASE` / `API_URL`
   hardcodeadas, para evitar futuras desincronizaciones entre web y movil.
2. **Health check** del backend en CI/despliegue que falle si la URL objetivo
   devuelve 404.
3. Decidir el futuro del **API Gateway v2**: restaurarlo o retirarlo
   oficialmente de la documentacion y los contratos.
4. Ejecutar una prueba end-to-end de la web contra el backend real para validar
   los contratos antes de hacer commit.
