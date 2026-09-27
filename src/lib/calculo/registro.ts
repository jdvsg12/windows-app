// Common contract every reference engine implements, plus the registry that gates
// which references the app actually offers (D1: only validated engines are enabled).
import type {
    Ventana,
    Accesorios,
    VidrioCorte,
    LaminaVidrio,
    OptimizacionPerfil,
    DescuentosPorSistema,
    SistemaVentana,
} from "@/lib/types"
import * as motor8025 from "./motor-8025"
import { calcularAreaTotalM2 } from "./comun"

export interface EntradaCalculo {
    ventanas: readonly Ventana[]
    descuentos: DescuentosPorSistema
    laminaAncho?: number
    laminaAlto?: number
}

export interface SalidaCalculo {
    optimizacionPerfiles: Record<string, OptimizacionPerfil>
    accesorios: Accesorios
    vidrios: VidrioCorte[]
    laminasVidrio: LaminaVidrio[]
    areaTotalM2: number
}

export interface MotorReferencia {
    calcular(entrada: EntradaCalculo): SalidaCalculo
}

function calcular8025(entrada: EntradaCalculo): SalidaCalculo {
    const { ventanas, descuentos, laminaAncho, laminaAlto } = entrada
    return {
        optimizacionPerfiles: motor8025.optimizarCortes(ventanas, descuentos),
        accesorios: motor8025.calcularAccesorios(ventanas, descuentos),
        vidrios: motor8025.calcularVidrios(ventanas, descuentos),
        laminasVidrio: motor8025.optimizarLaminasVidrio(ventanas, descuentos, laminaAncho, laminaAlto),
        areaTotalM2: calcularAreaTotalM2(ventanas),
    }
}

// Only validated references are registered (D1). Adding 50-20/70-44/70-38 later means
// adding an entry here, not touching the rest of the app — the form, the type
// restrictions and the calculation call sites all read from this registry.
const REGISTRO_MOTORES: Partial<Record<SistemaVentana, MotorReferencia>> = {
    "8025": { calcular: calcular8025 },
}

export const SISTEMAS_HABILITADOS: readonly SistemaVentana[] = Object.keys(
    REGISTRO_MOTORES
) as SistemaVentana[]

export function obtenerMotor(sistema: SistemaVentana): MotorReferencia | undefined {
    return REGISTRO_MOTORES[sistema]
}

export interface OpcionSistema {
    value: SistemaVentana
    label: string
    disabled: boolean
}

// A window saved with a system that is not enabled keeps it as a disabled option, so editing
// never silently switches its system (and therefore its cuts) to another one.
export function opcionesSistema(actual?: SistemaVentana): OpcionSistema[] {
    const opciones: OpcionSistema[] = SISTEMAS_HABILITADOS.map((value) => ({ value, label: value, disabled: false }))
    if (actual && !SISTEMAS_HABILITADOS.includes(actual)) {
        opciones.push({ value: actual, label: `${actual} (no validado)`, disabled: true })
    }
    return opciones
}

// The form remembers the last system so several windows of one system can be entered in a row,
// but it must never carry over a system that is not enabled (e.g. after editing a legacy window).
export const sistemaParaVentanaNueva = (recordado?: SistemaVentana): SistemaVentana =>
    recordado && SISTEMAS_HABILITADOS.includes(recordado) ? recordado : SISTEMAS_HABILITADOS[0]
