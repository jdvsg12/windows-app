// Modelo de costeo D8, único en toda la app — reemplaza las dos calcularCostos que
// existían antes de F3 (una sin llamadores, otra local a useCotizador.ts).
//
//   1  Materiales           = despiece × precios
//   2  Mano de obra directa = m² × tarifa
//   3  Transporte           = input por proyecto
//   +  Costos adicionales   = ad-hoc de esta cotización (fijo o % sobre materiales)
//   A  COSTO DIRECTO        = 1 + 2 + 3 + costos adicionales
//   4  Overhead absorbido   = overhead mensual del taller × duración de la obra (meses)
//   B  COSTO DE PRODUCCIÓN  = A + 4
//   5  Imprevistos          = % sobre B
//   C  COSTO TOTAL          = B + 5
//   6  Utilidad             = % sobre C
//   D  PRECIO DE VENTA      = C + 6
//
// Puro: sin storage, sin estado — todo (precios, overhead, descuentos, duración,
// transporte) se inyecta. El overhead siempre asume 1 obra a la vez (ver memoria del
// proyecto): no hay forma de predecir obras simultáneas, y una es el supuesto
// conservador.
import { obtenerMotor } from "./registro"
import { ORDEN_PERFILES } from "./motor-8025"
import type {
    Ventana,
    ConfiguracionPrecios,
    ConfiguracionOverhead,
    DescuentosPorSistema,
    CostosCalculadosCotizador,
} from "@/lib/types"
import { TAMANOS_LAMINA } from "@/lib/types"

export interface EntradaCosteo {
    ventanas: readonly Ventana[]
    descuentos: DescuentosPorSistema
    precios: ConfiguracionPrecios
    overhead: ConfiguracionOverhead
    transporteProyecto: number
    duracionMesesProyecto: number
}

type PrecioNumericKey = {
    [K in keyof ConfiguracionPrecios]: ConfiguracionPrecios[K] extends number ? K : never
}[keyof ConfiguracionPrecios]

const PRECIO_POR_PERFIL: Record<(typeof ORDEN_PERFILES)[number], PrecioNumericKey> = {
    Cabezal: "precioCabezal",
    Sillar: "precioSillar",
    "Jamba Izquierda": "precioJamba",
    "Jamba Derecha": "precioJamba",
    Enganche: "precioEnganche",
    Traslape: "precioTraslape",
    "Horizontal Superior": "precioHorizontalSuperior",
    "Horizontal Inferior": "precioHorizontalInferior",
}

export function calcularCosteo(entrada: EntradaCosteo): CostosCalculadosCotizador {
    const { ventanas, descuentos, precios, overhead, transporteProyecto, duracionMesesProyecto } = entrada

    // Solo 8025 está validado (D1); el registro ya lo garantiza en el formulario, pero
    // una ventana legada con otro sistema no debe tirar la cotización entera.
    const motor = obtenerMotor("8025")
    if (!motor) throw new Error("El motor de referencia 8025 no está registrado")

    // Única fuente del tamaño de lámina (F3.3): precios.tamanoLamina, no un parámetro suelto.
    const { ancho: laminaAncho, alto: laminaAlto } = TAMANOS_LAMINA[precios.tamanoLamina]
    const salida = motor.calcular({
        ventanas,
        descuentos,
        laminaAncho,
        laminaAlto,
        kerf: precios.kerfVidrio,
        minResto: precios.minRestoVidrio,
    })

    // 1. Materiales — perfiles se compran por barra completa de 6 m, no por metro usado.
    // Las claves de optimizacionPerfiles llevan el sistema como prefijo ("8025 - Cabezal"),
    // igual que en lib/design/piezas.ts.
    const costoPerfiles = Object.entries(salida.optimizacionPerfiles).reduce((total, [clave, optimizacion]) => {
        const tipo = clave.split(" - ").at(-1) as (typeof ORDEN_PERFILES)[number] | undefined
        const precioKey = tipo ? PRECIO_POR_PERFIL[tipo] : undefined
        if (!precioKey) return total
        return total + optimizacion.barras.length * precios[precioKey]
    }, 0)

    const costoAccesorios =
        salida.accesorios.rodachinas * precios.precioRodachina +
        salida.accesorios.guiasSuperior * precios.precioGuia +
        salida.accesorios.guiasInferior * precios.precioGuia +
        salida.accesorios.tornillosHojas * precios.precioTornillo8mm +
        salida.accesorios.tornillosMarco * precios.precioTornillo8mm +
        salida.accesorios.tornillosInstalacion * precios.precioTornillo10mm +
        salida.accesorios.cerraduras * precios.precioCerradura

    // El vidrio se compra por lámina entera consumida, no por m² neto (una lámina
    // parcialmente usada igual se compró completa).
    const costoVidrio = salida.laminasVidrio.length * (precios.precioVidrioLamina || 0)

    const metrosEmpaque = salida.vidrios.reduce((total, v) => total + ((v.ancho * 2 + v.alto * 2) / 1000 || 0), 0)
    const costoEmpaque = metrosEmpaque * precios.precioEmpaque

    const costoMateriales = costoPerfiles + costoAccesorios + costoVidrio + costoEmpaque

    // 2. Mano de obra directa
    const costoManoObra = salida.areaTotalM2 * precios.manoDeObra

    // 3. Transporte (input del proyecto, ya no un valor global de precios)
    const costoTransporte = transporteProyecto

    // Costos adicionales ad-hoc de esta cotización: % se calcula sobre materiales.
    let costosAdicionalesTotal = 0
    const costosAdicionalesDetalle = (precios.costosAdicionales || []).map((costo) => {
        const valorCalculado = costo.tipo === "porcentaje" ? costoMateriales * (costo.valor / 100) : costo.valor
        costosAdicionalesTotal += valorCalculado
        return { ...costo, valorCalculado }
    })

    // A. Costo directo
    const costoDirecto = costoMateriales + costoManoObra + costoTransporte + costosAdicionalesTotal

    // 4. Overhead absorbido por tiempo (siempre 1 obra a la vez)
    const overheadMensual =
        overhead.servicioLuz +
        overhead.servicioAgua +
        overhead.servicioInternet +
        overhead.servicioGas +
        overhead.arriendo +
        overhead.herramienta +
        overhead.admin
    const overheadAbsorbido = overheadMensual * duracionMesesProyecto

    // B. Costo de producción
    const costoProduccion = costoDirecto + overheadAbsorbido

    // 5. Imprevistos
    const imprevistosMonto = costoProduccion * (precios.imprevistos / 100)

    // C. Costo total
    const costoTotal = costoProduccion + imprevistosMonto

    // 6. Utilidad
    const utilidadMonto = costoTotal * (precios.utilidad / 100)

    // D. Precio de venta
    const total = costoTotal + utilidadMonto

    const areaTotal = salida.areaTotalM2
    const precioPorM2 = areaTotal > 0 ? total / areaTotal : 0
    const valoresPorVentana = ventanas.map((v) => {
        const area = (v.ancho * v.alto) / 1_000_000
        return { id: v.id, area, valor: area * precioPorM2 }
    })

    return {
        costoPerfiles,
        costoAccesorios,
        costoVidrio,
        costoEmpaque,
        costoMateriales,
        costoManoObra,
        costoTransporte,
        costosAdicionalesDetalle,
        costosAdicionalesTotal,
        costoDirecto,
        overheadAbsorbido,
        costoProduccion,
        imprevistosMonto,
        costoTotal,
        utilidadMonto,
        total,
        areaTotal,
        precioPorM2,
        valoresPorVentana,
    }
}
