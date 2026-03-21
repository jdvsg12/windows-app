import type { Project } from '@/lib/types'

export const projectsData: Project[] = [
  {
    id: 'PRJ-001',
    projectName: 'Casa Residencial López',
    client: 'Juan López',
    description: 'Ventanas para casa de 2 pisos',
    createAt: '2024-01-15',
    updatedAt: '2024-01-20',
    status: 'active',
    totalMaterialCost: 2850000,
    notes: 'Cliente requiere entrega en 15 días',
    numberOfWindows: 2,
    windows: [
      {
        id: 'WIN-001',
        windowType: 'corrediza',
        width: 1.5,
        height: 1.2,
        materials: [
          {
            id: 'MAT-001',
            name: 'Perfil de Aluminio 2x1',
            type: 'perfil',
            unit: 'metro',
            pricePerUnit: 25000,
            quantity: 5.4,
            totalPrice: 135000
          },
          {
            id: 'MAT-002',
            name: 'Vidrio Templado 6mm',
            type: 'vidrio',
            unit: 'metro2',
            pricePerUnit: 85000,
            quantity: 1.8,
            totalPrice: 153000
          },
          {
            id: 'MAT-003',
            name: 'Herraje Corredizo Premium',
            type: 'herraje',
            unit: 'unidad',
            pricePerUnit: 120000,
            quantity: 1,
            totalPrice: 120000
          },
          {
            id: 'MAT-004',
            name: 'Sellante Estructural',
            type: 'sellante',
            unit: 'unidad',
            pricePerUnit: 42000,
            quantity: 1,
            totalPrice: 42000
          }
        ]
      },
      {
        id: 'WIN-002',
        windowType: 'batiente',
        width: 0.8,
        height: 1.0,
        materials: [
          {
            id: 'MAT-005',
            name: 'Perfil de Aluminio 2x1',
            type: 'perfil',
            unit: 'metro',
            pricePerUnit: 25000,
            quantity: 3.6,
            totalPrice: 90000
          },
          {
            id: 'MAT-006',
            name: 'Vidrio Laminado 4+4mm',
            type: 'vidrio',
            unit: 'metro2',
            pricePerUnit: 95000,
            quantity: 0.8,
            totalPrice: 76000
          },
          {
            id: 'MAT-007',
            name: 'Herraje Batiente Estándar',
            type: 'herraje',
            unit: 'unidad',
            pricePerUnit: 180000,
            quantity: 1,
            totalPrice: 180000
          },
          {
            id: 'MAT-008',
            name: 'Empaque de Goma',
            type: 'accesorio',
            unit: 'metro',
            pricePerUnit: 8500,
            quantity: 4,
            totalPrice: 34000
          }
        ]
      }
    ]
  },
  {
    id: 'PRJ-002',
    projectName: 'Oficina Central Bogotá',
    client: 'Empresa ABC S.A.S',
    description: 'Ventanería para oficinas corporativas',
    createAt: '2024-02-01',
    updatedAt: '2024-02-10',
    status: 'completed',
    totalMaterialCost: 8950000,
    notes: 'Proyecto completado satisfactoriamente',
    numberOfWindows: 2,
    windows: [
      {
        id: 'WIN-003',
        windowType: 'fija',
        width: 3.0,
        height: 2.5,
        materials: [
          {
            id: 'MAT-009',
            name: 'Perfil Estructural 3x2',
            type: 'perfil',
            unit: 'metro',
            pricePerUnit: 45000,
            quantity: 11,
            totalPrice: 495000
          },
          {
            id: 'MAT-010',
            name: 'Vidrio Control Solar 8mm',
            type: 'vidrio',
            unit: 'metro2',
            pricePerUnit: 120000,
            quantity: 7.5,
            totalPrice: 900000
          }
        ]
      },
      {
        id: 'WIN-004',
        windowType: 'oscilobatiente',
        width: 1.2,
        height: 1.8,
        materials: [
          {
            id: 'MAT-011',
            name: 'Perfil Europeo Premium',
            type: 'perfil',
            unit: 'metro',
            pricePerUnit: 65000,
            quantity: 6,
            totalPrice: 390000
          },
          {
            id: 'MAT-012',
            name: 'Vidrio Triple 4+12+4mm',
            type: 'vidrio',
            unit: 'metro2',
            pricePerUnit: 150000,
            quantity: 2.16,
            totalPrice: 324000
          }
        ]
      }
    ]
  },
  {
    id: 'PRJ-003',
    projectName: 'Apartamento Vista Hermosa',
    client: 'María González',
    description: 'Cambio de ventanas apartamento',
    createAt: '2024-03-05',
    updatedAt: '2024-03-05',
    status: 'draft',
    totalMaterialCost: 1850000,
    numberOfWindows: 1,
    windows: [
      {
        id: 'WIN-005',
        windowType: 'corrediza',
        width: 2.0,
        height: 1.4,
        materials: [
          {
            id: 'MAT-013',
            name: 'Perfil de Aluminio Estándar',
            type: 'perfil',
            unit: 'metro',
            pricePerUnit: 22000,
            quantity: 6.8,
            totalPrice: 149600
          },
          {
            id: 'MAT-014',
            name: 'Vidrio Transparente 5mm',
            type: 'vidrio',
            unit: 'metro2',
            pricePerUnit: 65000,
            quantity: 2.8,
            totalPrice: 182000
          },
          {
            id: 'MAT-015',
            name: 'Herraje Básico Corredizo',
            type: 'herraje',
            unit: 'unidad',
            pricePerUnit: 95000,
            quantity: 1,
            totalPrice: 95000
          }
        ]
      }
    ]
  }
]
