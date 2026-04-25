import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

export const routes: Routes = [
  // Auth pages (guest only)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
  },

  // Public + auth routes under MainLayout
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/flights/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'results',
        loadComponent: () => import('./pages/flights/results/results.component').then(m => m.ResultsComponent),
      },
      {
        path: 'flights/:id',
        loadComponent: () => import('./pages/flights/flight-detail/flight-detail.component').then(m => m.FlightDetailComponent),
      },
      // Protected customer routes
      {
        path: 'reservations/new/:flightClassId',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/reservations/reservation/reservation.component').then(m => m.ReservationComponent),
      },
      {
        path: 'my-trips',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/reservations/my-trips/my-trips.component').then(m => m.MyTripsComponent),
      },
      {
        path: 'my-trips/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/reservations/reservation-detail/reservation-detail.component').then(m => m.ReservationDetailComponent),
      },
    ],
  },

  // Admin routes under AdminLayout
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'countries',
        loadComponent: () => import('./pages/admin/countries/admin-countries.component').then(m => m.AdminCountriesComponent),
      },
      {
        path: 'cities',
        loadComponent: () => import('./pages/admin/cities/admin-cities.component').then(m => m.AdminCitiesComponent),
      },
      {
        path: 'airports',
        loadComponent: () => import('./pages/admin/airports/admin-airports.component').then(m => m.AdminAirportsComponent),
      },
      {
        path: 'airlines',
        loadComponent: () => import('./pages/admin/airlines/admin-airlines.component').then(m => m.AdminAirlinesComponent),
      },
      {
        path: 'aircraft',
        loadComponent: () => import('./pages/admin/aircraft/admin-aircraft.component').then(m => m.AdminAircraftComponent),
      },
      {
        path: 'flights',
        loadComponent: () => import('./pages/admin/flights/admin-flights.component').then(m => m.AdminFlightsComponent),
      },
      {
        path: 'segments',
        loadComponent: () => import('./pages/admin/segments/admin-segments.component').then(m => m.AdminSegmentsComponent),
      },
      {
        path: 'flight-classes',
        loadComponent: () => import('./pages/admin/flight-classes/admin-flight-classes.component').then(m => m.AdminFlightClassesComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users/admin-users.component').then(m => m.AdminUsersComponent),
      },
      {
        path: 'reservations',
        loadComponent: () => import('./pages/admin/reservations/admin-reservations.component').then(m => m.AdminReservationsComponent),
      },
      {
        path: 'payments',
        loadComponent: () => import('./pages/admin/payments/admin-payments.component').then(m => m.AdminPaymentsComponent),
      },
      {
        path: 'invoices',
        loadComponent: () => import('./pages/admin/invoices/admin-invoices.component').then(m => m.AdminInvoicesComponent),
      },
      {
        path: 'boarding-passes',
        loadComponent: () => import('./pages/admin/boarding-passes/admin-boarding-passes.component').then(m => m.AdminBoardingPassesComponent),
      },
      {
        path: 'promotions',
        loadComponent: () => import('./pages/admin/promotions/admin-promotions.component').then(m => m.AdminPromotionsComponent),
      },
      {
        path: 'services',
        loadComponent: () => import('./pages/admin/services/admin-services.component').then(m => m.AdminServicesComponent),
      },
      {
        path: 'airline-service-configs',
        loadComponent: () => import('./pages/admin/airline-service-configs/admin-airline-service-configs.component').then(m => m.AdminAirlineServiceConfigsComponent),
      },
      {
        path: 'airline-airports',
        loadComponent: () => import('./pages/admin/airline-airports/admin-airline-airports.component').then(m => m.AdminAirlineAirportsComponent),
      },
      {
        path: 'billing-profiles',
        loadComponent: () => import('./pages/admin/billing-profiles/admin-billing-profiles.component').then(m => m.AdminBillingProfilesComponent),
      },
      {
        path: 'invoice-items',
        loadComponent: () => import('./pages/admin/invoice-items/admin-invoice-items.component').then(m => m.AdminInvoiceItemsComponent),
      },
      {
        path: 'passenger-services',
        loadComponent: () => import('./pages/admin/passenger-services/admin-passenger-services.component').then(m => m.AdminPassengerServicesComponent),
      },
      {
        path: 'reservation-passengers',
        loadComponent: () => import('./pages/admin/reservation-passengers/admin-reservation-passengers.component').then(m => m.AdminReservationPassengersComponent),
      },
      {
        path: 'audit',
        loadComponent: () => import('./pages/admin/audit/admin-audit.component').then(m => m.AdminAuditComponent),
      },
    ],
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
