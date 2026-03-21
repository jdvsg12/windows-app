# Skill de Ventanería

Skill para calcular descuentos, paneles, vidrios y accesorios para ventanas corredizas.

## Sistemas Disponibles

- **5020** - Sistema económico
- **744** - Sistema semi-pesado
- **8025** - Sistema estructural/pesado
- **7038** - Sistema Monumental (muy resistente)

## Descuentos por Sistema

### Verticales (alto - corte)
| Perfil | 5020 | 744 | 8025 | 7038 |
|--------|------|-----|------|------|
| JAMBA | 15mm | 12mm | 12mm | 25mm |
| ENGANCHE | 30mm | 24mm | 28mm | 41mm |
| TRASLAPE | 30mm | 24mm | 28mm | 41mm |

### Horizontales (ancho/2 - corte)
| Perfil | 5020 | 744 | 8025 | 7038 |
|--------|------|-----|------|------|
| H INF/SUP | 15mm | 0mm | 0mm | -10mm |

### Ancho Vidrio
- 5020, 744, 8025: ~44-46mm
- 7038: ~39.8mm

## Lógica de Paneles

- **Panel 1**: móvil + 10cm extra (evita golpecos de dedos)
- **Paneles centrales**: móvil (enganche izq + der)
- **Último panel**: fijo (enganche + traslape al marco)
- **Validación**: mínimo 1m por panel

## Lógica de Fija de Parche

| Hojas | Rieles | Fija Parche | Móviles | Rodachinas | Eng/tras Normal | Eng/tras Fija Parche |
|-------|--------|-------------|---------|------------|------------------|----------------------|
| 2 | 1×2v | No | 2 | 4 | -25mm | N/A |
| 3 | 1×2v | Sí (1) | 2 | 4 | -25mm | -5mm |
| 4 | 1×3v | Sí (1) | 3 | 6 | -25mm | -5mm |
| 5 | 2×2v | Sí (1) | 4 | 8 | -25mm | -5mm |
| 6 | 2×3v | Sí (1) | 5 | 10 | -25mm | -5mm |

## Accesorios por Tipo

| Hojas | Rodachinas | Cerraduras |
|-------|------------|------------|
| 2 | 4 | 1 |
| 3 | 4 | 2 |
| 4 | 6 | 1 |
| 5 | 8 | 1 |
| 6 | 10 | 2 |

## Uso

### calcular-paneles
Calcula la distribución de paneles con validación de 1m mínimo y 10cm extra en primera hoja.

```typescript
import { calcularPaneles } from './lib/calculator'

const resultado = calcularPaneles(6000, 6)
// Retorna: { paneles: [...], anchoPanelBase: 1000, esValido: true }
```

### calcular-vidrio
Calcula las dimensiones del vidrio con descuentos aplicados.

```typescript
import { calcularVidrio } from './lib/calculator'

const vidrio = calcularVidrio(1000, 1000, '744')
// Retorna: { anchoVidrio: 955, altoVidrio: 988, area: 0.944 }
```

### Accessories
Lista los accesorios necesarios según el tipo de ventana.

```typescript
import { calcularAccesorios } from './lib/accessories'

const acc = calcularAccesorios(6)
// Retorna: { rodachinas: 10, cerraduras: 2, rieles: "2×3v", ... }
```

### debug
Muestra el breakdown de descuentos para medidas 100×100.

```typescript
import { debugDescuentos } from './lib/calculator'

const debug = debugDescuentos(100, 100)
// Retorna array con todos los descuentos por sistema
```
