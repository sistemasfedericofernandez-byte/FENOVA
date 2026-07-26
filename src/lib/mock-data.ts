import type {
  OperationType,
  PriceCurrency,
  PropertyType,
} from "@/types/database.types";

export type MockProperty = {
  id: string;
  slug: string;
  title: string;
  description: string;
  operationType: OperationType;
  propertyType: PropertyType;
  neighborhoodName: string;
  priceAmount: number;
  priceCurrency: PriceCurrency;
  surfaceTotalM2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  isVerifiedOwner: boolean;
  agencyName: string;
  agencyWhatsapp: string;
  images: string[];
};

/**
 * Datos de ejemplo en memoria mientras no hay un proyecto Supabase
 * conectado. Misma forma que las columnas reales de `properties` para que
 * reemplazar esto por una query real sea un cambio acotado.
 */
export const MOCK_PROPERTIES: MockProperty[] = [
  {
    id: "1",
    slug: "casa-3-dormitorios-cambau-cue-a1b2c3",
    title: "Casa 3 dormitorios con pileta en Cambá Cué",
    description:
      "Casa amplia de dos plantas, living comedor, cocina integrada, patio con pileta y parrilla. Apta crédito.",
    operationType: "venta",
    propertyType: "casa",
    neighborhoodName: "Cambá Cué",
    priceAmount: 145000,
    priceCurrency: "USD",
    surfaceTotalM2: 220,
    bedrooms: 3,
    bathrooms: 2,
    isVerifiedOwner: true,
    agencyName: "Inmobiliaria Litoral",
    agencyWhatsapp: "5493794000001",
    images: [],
  },
  {
    id: "2",
    slug: "monoambiente-centro-alquiler-d4e5f6",
    title: "Monoambiente a estrenar en pleno Centro",
    description:
      "Ideal estudiante o profesional. Cocina equipada, balcón, a 3 cuadras de la peatonal.",
    operationType: "alquiler",
    propertyType: "departamento",
    neighborhoodName: "Centro",
    priceAmount: 180000,
    priceCurrency: "ARS",
    surfaceTotalM2: 32,
    bedrooms: 1,
    bathrooms: 1,
    isVerifiedOwner: false,
    agencyName: "Corrientes Propiedades",
    agencyWhatsapp: "5493794000002",
    images: [],
  },
  {
    id: "3",
    slug: "departamento-2-dormitorios-yapeyu-g7h8i9",
    title: "Departamento 2 dormitorios con cochera en Yapeyú",
    description:
      "Edificio con seguridad, amenities, cochera cubierta. Excelente estado.",
    operationType: "venta",
    propertyType: "departamento",
    neighborhoodName: "Yapeyú",
    priceAmount: 98000,
    priceCurrency: "USD",
    surfaceTotalM2: 68,
    bedrooms: 2,
    bathrooms: 1,
    isVerifiedOwner: true,
    agencyName: "Grupo Inmobiliario NEA",
    agencyWhatsapp: "5493794000003",
    images: [],
  },
  {
    id: "4",
    slug: "casa-temporal-laguna-seca-j1k2l3",
    title: "Casa quinta para alquiler temporal en Laguna Seca",
    description:
      "Ideal fines de semana, pileta, parque grande, capacidad 8 personas.",
    operationType: "alquiler_temporal",
    propertyType: "quinta",
    neighborhoodName: "Laguna Seca",
    priceAmount: 45000,
    priceCurrency: "ARS",
    surfaceTotalM2: 500,
    bedrooms: 4,
    bathrooms: 2,
    isVerifiedOwner: false,
    agencyName: "Dueño directo — Marcelo R.",
    agencyWhatsapp: "5493794000004",
    images: [],
  },
  {
    id: "5",
    slug: "local-comercial-centro-m4n5o6",
    title: "Local comercial sobre calle Junín",
    description:
      "120 m² en planta baja, vidriera amplia, baño y depósito. Excelente ubicación.",
    operationType: "alquiler",
    propertyType: "local",
    neighborhoodName: "Centro",
    priceAmount: 320000,
    priceCurrency: "ARS",
    surfaceTotalM2: 120,
    bedrooms: null,
    bathrooms: 1,
    isVerifiedOwner: true,
    agencyName: "Inmobiliaria Litoral",
    agencyWhatsapp: "5493794000001",
    images: [],
  },
  {
    id: "6",
    slug: "terreno-san-benito-p7q8r9",
    title: "Terreno 15x30 en San Benito",
    description: "Todos los servicios, calle asfaltada, zona en crecimiento.",
    operationType: "venta",
    propertyType: "terreno",
    neighborhoodName: "San Benito",
    priceAmount: 35000,
    priceCurrency: "USD",
    surfaceTotalM2: 450,
    bedrooms: null,
    bathrooms: null,
    isVerifiedOwner: false,
    agencyName: "Corrientes Propiedades",
    agencyWhatsapp: "5493794000002",
    images: [],
  },
  {
    id: "7",
    slug: "departamento-1-dormitorio-molina-punta-s1t2u3",
    title: "Departamento 1 dormitorio frente al río en Molina Punta",
    description: "Vista al río Paraná, balcón terraza, edificio nuevo.",
    operationType: "alquiler",
    propertyType: "departamento",
    neighborhoodName: "Molina Punta",
    priceAmount: 220000,
    priceCurrency: "ARS",
    surfaceTotalM2: 45,
    bedrooms: 1,
    bathrooms: 1,
    isVerifiedOwner: true,
    agencyName: "Grupo Inmobiliario NEA",
    agencyWhatsapp: "5493794000003",
    images: [],
  },
  {
    id: "8",
    slug: "casa-punta-tacuara-v4w5x6",
    title: "Casa 4 dormitorios en Punta Tacuara",
    description: "Gran patio, quincho, cochera doble. Zona residencial tranquila.",
    operationType: "venta",
    propertyType: "casa",
    neighborhoodName: "Punta Tacuara",
    priceAmount: 165000,
    priceCurrency: "USD",
    surfaceTotalM2: 280,
    bedrooms: 4,
    bathrooms: 3,
    isVerifiedOwner: false,
    agencyName: "Dueño directo — Laura G.",
    agencyWhatsapp: "5493794000005",
    images: [],
  },
];

export const MOCK_NEIGHBORHOODS = Array.from(
  new Set(MOCK_PROPERTIES.map((p) => p.neighborhoodName)),
).sort();

export function findMockPropertyBySlug(slug: string) {
  return MOCK_PROPERTIES.find((p) => p.slug === slug);
}
