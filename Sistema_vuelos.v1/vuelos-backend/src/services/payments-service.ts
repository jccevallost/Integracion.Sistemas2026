import 'dotenv/config';
import { createServiceApp } from '../shared/app-factory.js';
import { errorHandler } from '../shared/middlewares/error.middleware.js';
import { registerAuditSubscriber } from '../shared/events/audit-subscriber.js';
import { paymentsEventPublisher } from '../shared/events/event-publisher.middleware.js';
import { validateJwtConfig } from '../shared/security/jwt.config.js';
import prisma from '../shared/database/prisma.payments.client.js';

import { PaymentRepository }         from '../modules/api_payments/repositories/PaymentRepository.js';
import { InvoiceRepository }         from '../modules/api_invoices/repositories/InvoiceRepository.js';
import { InvoiceItemRepository }     from '../modules/api_invoice_items/repositories/InvoiceItemRepository.js';
import { PassengerServiceRepository } from '../modules/api_passenger_services/repositories/PassengerServiceRepository.js';
// Dependencia de dominio cruzado — mismo DB compartido
import { BillingProfileRepository }  from '../modules/api_billing_profiles/repositories/BillingProfileRepository.js';

import {
  PaymentQueryRepository,
  InvoiceQueryRepository,
  InvoiceItemQueryRepository,
  PassengerServiceQueryRepository,
} from '../shared/queries/index.js';

import { PaymentService }         from '../modules/api_payments/services/PaymentService.js';
import { InvoiceService }         from '../modules/api_invoices/services/InvoiceService.js';
import { InvoiceItemService }     from '../modules/api_invoice_items/services/InvoiceItemService.js';
import { PassengerServiceService } from '../modules/api_passenger_services/services/PassengerServiceService.js';

import { PaymentController }         from '../modules/api_payments/controllers/PaymentController.js';
import { InvoiceController }         from '../modules/api_invoices/controllers/InvoiceController.js';
import { InvoiceItemController }     from '../modules/api_invoice_items/controllers/InvoiceItemController.js';
import { PassengerServiceController } from '../modules/api_passenger_services/controllers/PassengerServiceController.js';

import { createPaymentRouter }         from '../modules/api_payments/routes/payments.routes.js';
import { createInvoiceRouter }         from '../modules/api_invoices/routes/invoices.routes.js';
import { createInvoiceItemRouter }     from '../modules/api_invoice_items/routes/invoice-items.routes.js';
import { createPassengerServiceRouter } from '../modules/api_passenger_services/routes/passenger-services.routes.js';

const PORT = Number(process.env.PAYMENTS_SERVICE_PORT) || 3005;

validateJwtConfig();

// Repositories
const paymentRepo         = new PaymentRepository(prisma);
const invoiceRepo         = new InvoiceRepository(prisma);
const invoiceItemRepo     = new InvoiceItemRepository(prisma);
const passengerServiceRepo = new PassengerServiceRepository(prisma);
const billingProfileRepo  = new BillingProfileRepository(prisma);

// Query repos
const paymentQuery         = new PaymentQueryRepository(prisma);
const invoiceQuery         = new InvoiceQueryRepository(prisma);
const invoiceItemQuery     = new InvoiceItemQueryRepository(prisma);
const passengerServiceQuery = new PassengerServiceQueryRepository(prisma);

// Services
const paymentService         = new PaymentService(paymentRepo, billingProfileRepo, invoiceRepo, prisma);
const invoiceService         = new InvoiceService(invoiceRepo);
const invoiceItemService     = new InvoiceItemService(invoiceItemRepo);
const passengerServiceService = new PassengerServiceService(passengerServiceRepo);

// Controllers
const paymentController         = new PaymentController(paymentService);
const invoiceController         = new InvoiceController(invoiceService);
const invoiceItemController     = new InvoiceItemController(invoiceItemService);
const passengerServiceController = new PassengerServiceController(passengerServiceService);

const app = createServiceApp('payments-service');

registerAuditSubscriber('payments-service');
app.use(paymentsEventPublisher);

app.get(['/health', '/'], (_req, res) => {
  res.json({
    service: 'payments-service',
    status: 'online',
    port: PORT,
    version: '2.0.0',
    resources: ['payments', 'invoices', 'invoice-items', 'passenger-services'],
  });
});

app.use('/api/v1/payments',          createPaymentRouter(paymentController, prisma));
app.use('/api/v1/invoices',          createInvoiceRouter(invoiceController, prisma));
app.use('/api/v1/invoice-items',     createInvoiceItemRouter(invoiceItemController, prisma));
app.use('/api/v1/passenger-services', createPassengerServiceRouter(passengerServiceController, prisma));

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Ruta ${req.originalUrl} no encontrada` } });
});
app.use(errorHandler);

async function start() {
  await prisma.$connect();
  app.listen(PORT, () => console.log(`🚀 [payments-service] → http://localhost:${PORT}`));
}

process.on('SIGINT',  async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('uncaughtException',  (err) => { console.error('[payments-service] Excepción:', err); process.exit(1); });
process.on('unhandledRejection', (r)   => { console.error('[payments-service] Promesa rechazada:', r); process.exit(1); });

start().catch((err) => { console.error('[payments-service] Error al iniciar:', err); process.exit(1); });
