# Vuelos Frontend — React + Vite + TypeScript

SPA del módulo de vuelos. Construida con React 18, Vite, Tailwind CSS y React Query.

---

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

Abre http://localhost:5173

---

## Estructura pensada para 3 retos

```
src/
├── services/   # Única capa que conoce la API — Reto 2: solo cambia la URL
├── hooks/      # React Query — reutilizables en React Native (Reto 3)
├── store/      # Zustand — reutilizable en React Native (Reto 3)
├── types/      # Tipos del dominio — compartidos con el backend
├── router/     # Reto 3: reemplazar por React Navigation
├── pages/      # Reto 3: reemplazar por screens/
└── components/ # Reto 3: adaptar primitivos nativos
```

## Páginas disponibles

| Ruta                          | Descripción              | Acceso     |
|-------------------------------|--------------------------|------------|
| `/`                           | Home con buscador        | Público    |
| `/search`                     | Búsqueda de vuelos       | Público    |
| `/results`                    | Resultados con filtros   | Público    |
| `/flights/:id`                | Detalle del vuelo        | Público    |
| `/reservations/new/:classId`  | Formulario de reserva    | Autenticado|
| `/my-trips`                   | Mis viajes               | Autenticado|
| `/my-trips/:id`               | Detalle de reserva       | Autenticado|
| `/admin`                      | Dashboard admin          | ADMIN      |
| `/admin/flights`              | CRUD vuelos              | ADMIN      |
| `/admin/airports`             | CRUD aeropuertos         | ADMIN      |
| `/admin/airlines`             | CRUD aerolíneas          | ADMIN      |
| `/admin/reservations`         | Ver todas las reservas   | ADMIN      |
| `/admin/users`                | Gestión de usuarios      | ADMIN      |

## Credenciales de prueba

| Rol    | Email                  | Password   |
|--------|------------------------|------------|
| Admin  | admin@vuelosapp.com    | admin123   |
| Cliente| cliente@gmail.com      | cliente123 |
