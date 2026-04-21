import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/prisma.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { NotFoundError } from '../utils/Errors.js';

/**
 * Mapeo de relaciones automáticas ADAPTADO A TU SCHEMA PRISMA
 * Basado en el schema.prisma que subiste
 */
const MODEL_INCLUDES: Record<string, any> = {
  // GEOGRAFÍA
  country: {
    cities: true,
    airlines: true,
  },
  city: {
    country: true,
    airports: true,
  },
  airport: {
    city: {
      include: {
        country: true,
      },
    },
    originSegments: true,
    destinationSegments: true,
    airlineAirports: {
      include: {
        airline: true,
      },
    },
  },
 
  // AEROLÍNEAS
  airline: {
    country: true,
    segments: true,
    aircrafts: true,
    serviceConfigs: true,
    airlineAirports: {
      include: {
        airport: true,
      },
    },
  },
  aircraft: {
    airline: true,
    segments: true,
  },
  airlineAirport: {
    airline: true,
    airport: {
      include: {
        city: true,
      },
    },
  },
 
  // VUELOS Y SEGMENTOS
  flight: {
    segments: {
      include: {
        originAirport: {
          include: {
            city: {
              include: {
                country: true,
              },
            },
          },
        },
        destinationAirport: {
          include: {
            city: {
              include: {
                country: true,
              },
            },
          },
        },
        airline: true,
        aircraft: true,
      },
    },
    flightClasses: true,
    reservations: true,
  },
  segment: {
    flight: true,
    originAirport: {
      include: {
        city: {
          include: {
            country: true,
          },
        },
      },
    },
    destinationAirport: {
      include: {
        city: {
          include: {
            country: true,
          },
        },
      },
    },
    airline: true,
    aircraft: true,
    boardingPasses: true,
  },
  flightClass: {
    flight: true,
    reservationPassengers: true,
  },
 
  // SERVICIOS
  serviceCatalog: {
    airlineConfigs: {
      include: {
        airline: true,
      },
    },
  },
  airlineServiceConfig: {
    service: true,
    airline: true,
    passengerServices: true,
  },
 
  // USUARIOS
  user: {
    city: {
      include: {
        country: true,
      },
    },
    reservations: true,
    billingProfiles: true,
  },
  billingProfile: {
    user: {
      select: {
        id: true,
        email: true,
        firstName: true,
        firstLastName: true,
      },
    },
    city: {
      include: {
        country: true,
      },
    },
    invoices: true,
  },
 
  // RESERVACIONES
  reservation: {
    user: {
      select: {
        id: true,
        email: true,
        firstName: true,
        firstLastName: true,
      },
    },
    flight: {
      include: {
        segments: {
          include: {
            originAirport: true,
            destinationAirport: true,
            airline: true,
          },
        },
        flightClasses: true,
      },
    },
    promotion: true,
    payment: true,
    passengers: {
      include: {
        flightClass: true,
        extraServices: {
          include: {
            serviceConfig: {
              include: {
                service: true,
              },
            },
          },
        },
        boardingPasses: {
          include: {
            segment: true,
          },
        },
      },
    },
  },
  reservationPassenger: {
    reservation: {
      include: {
        flight: true,
        user: true,
      },
    },
    flightClass: true,
    extraServices: {
      include: {
        serviceConfig: {
          include: {
            service: true,
          },
        },
      },
    },
    boardingPasses: {
      include: {
        segment: true,
      },
    },
  },
  passengerService: {
    passenger: {
      include: {
        reservation: true,
      },
    },
    serviceConfig: {
      include: {
        service: true,
        airline: true,
      },
    },
  },
 
  // PAGOS Y FACTURAS
  payment: {
    reservation: {
      include: {
        flight: true,
        passengers: true,
      },
    },
    invoice: {
      include: {
        items: true,
        billingProfile: true,
      },
    },
  },
  invoice: {
    payment: {
      include: {
        reservation: true,
      },
    },
    billingProfile: {
      include: {
        user: true,
        city: true,
      },
    },
    items: true,
  },
  invoiceItem: {
    invoice: {
      include: {
        billingProfile: true,
      },
    },
  },
 
  // CHECK-IN Y BOARDING
  boardingPass: {
    passenger: {
      include: {
        reservation: {
          include: {
            flight: true,
          },
        },
      },
    },
    segment: {
      include: {
        originAirport: true,
        destinationAirport: true,
        airline: true,
        aircraft: true,
        flight: true,
      },
    },
  },
 
  // PROMOCIONES
  promotion: {
    reservations: true,
  },
 
  // AUDITORÍA
  auditLog: {
    user: {
      select: {
        id: true,
        email: true,
        firstName: true,
        firstLastName: true,
      },
    },
  },
};
 
/**
 * Modelos que tienen campo createdAt para ordenamiento
 */
const MODELS_WITH_CREATED_AT = [
  'user',
  'reservation',
  'payment',
  'invoice',
  'auditLog',
];
 
interface GenericController {
  list: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  remove: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
 
export function createGenericController(modelName: string): GenericController {
  const model = (prisma as any)[modelName];
 
  if (!model) {
    console.error(`❌ ERROR CRÍTICO: El modelo "${modelName}" no existe en Prisma Client.`);
    throw new Error(`Model ${modelName} not found in Prisma Client`);
  }
 
  return {
    /**
     * LIST - Obtener todos los registros con filtros opcionales
     */
    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const where: Record<string, any> = {};
        const excluded = ['page', 'limit', 'sort', 'order', 'include'];
 
        // 1. Construcción dinámica de filtros
        for (const [key, value] of Object.entries(req.query)) {
          if (!excluded.includes(key) && value !== undefined && value !== '') {
            if (value === 'true') {
              where[key] = true;
            } else if (value === 'false') {
              where[key] = false;
            } else if (typeof value === 'string' && !isNaN(Number(value))) {
              where[key] = Number(value);
            } else {
              where[key] = value;
            }
          }
        }
 
        // 2. Paginación
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 100;
        const skip = (page - 1) * limit;
 
        // 3. Ordenamiento
        let orderBy: any = undefined;
        if (MODELS_WITH_CREATED_AT.includes(modelName)) {
          orderBy = { createdAt: 'desc' };
        }
 
        // Para Flight, ordenar por departureDate
        if (modelName === 'flight') {
          orderBy = { departureDate: 'asc' };
        }
 
        if (req.query.sort) {
          const order = req.query.order === 'asc' ? 'asc' : 'desc';
          orderBy = { [req.query.sort as string]: order };
        }
 
        // 4. Ejecución de consulta con relaciones (Eager Loading)
        const [items, total] = await Promise.all([
          model.findMany({
            where,
            include: MODEL_INCLUDES[modelName] || undefined,
            orderBy,
            skip,
            take: limit,
          }),
          model.count({ where }),
        ]);
 
        return ApiResponse.success(res, {
          data: items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        });
      } catch (err) {
        console.error(`❌ Error en LIST [${modelName}]:`, err);
        next(err);
      }
    },
 
    /**
     * GET BY ID - Obtener un registro por ID
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const item = await model.findUnique({
          where: { id: req.params.id },
          include: MODEL_INCLUDES[modelName] || undefined,
        });
 
        if (!item) {
          throw new NotFoundError(modelName);
        }
 
        return ApiResponse.success(res, item);
      } catch (err) {
        console.error(`❌ Error en GETBYID [${modelName}]:`, err);
        next(err);
      }
    },
 
    /**
     * CREATE - Crear un nuevo registro
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const item = await model.create({
          data: req.body,
          include: MODEL_INCLUDES[modelName] || undefined,
        });
 
        return ApiResponse.created(res, item, `${modelName} created successfully`);
      } catch (err) {
        console.error(`❌ Error en CREATE [${modelName}]:`, err);
        next(err);
      }
    },
 
    /**
     * UPDATE - Actualizar un registro existente
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const item = await model.update({
          where: { id: req.params.id },
          data: req.body,
          include: MODEL_INCLUDES[modelName] || undefined,
        });
 
        return ApiResponse.success(res, item, `${modelName} updated successfully`);
      } catch (err) {
        console.error(`❌ Error en UPDATE [${modelName}]:`, err);
        next(err);
      }
    },
 
    /**
     * REMOVE - Eliminar un registro
     */
    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        await model.delete({
          where: { id: req.params.id },
        });
 
        return ApiResponse.success(res, { deleted: true }, `${modelName} deleted successfully`);
      } catch (err) {
        console.error(`❌ Error en REMOVE [${modelName}]:`, err);
        next(err);
      }
    },
  };
}
 