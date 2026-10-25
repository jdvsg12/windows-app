// Lista de compra del proyecto (pestaña Materiales): barras por referencia y color, accesorios con
// la cantidad total y en qué productos va cada uno, y láminas de vidrio por tipo. Pura: sale del
// mismo plan de corte que Optimización y el costeo, así lo que se compra es lo que se cobra.
import { calcularAccesorios } from "./calculo/motor-8025"
import { LONGITUD_BARRA } from "./calculo/comun"
import type { PlanCorte } from "./calculo/plan"
import { codigoPuerta } from "./calculo/plan-puertas"
import { ACCESORIOS_PUERTA, REFERENCIAS_PERFIL_PUERTA } from "./calculo/motor-puerta-alumina"
import { ACCESORIOS_PUERTA_ALUMINA, PERFILES_PUERTA_ALUMINA, PUERTA_ALUMINA } from "./catalogo-alumina"
import { CERRADURAS_8025, OTROS_ACCESORIOS_8025, PERFILES_8025, RODACHINAS_8025, type ItemCatalogo } from "./catalogo-8025"
import { ESTILOS_PERFIL_PUERTA, obtenerEstiloPerfil, type EstiloPieza } from "./design/piezas"
import {
    COLOR_ALUMINIO_POR_DEFECTO,
    COLORES_ALUMINIO,
    getColorAluminioLabel,
    type ColorAluminio,
    type DescuentosPorSistema,
    type Puerta,
    type Ventana,
} from "./types"

export interface PerfilCompra {
    clave: string
    nombre: string
    referencia: string
    imagen?: string
    estilo: EstiloPieza
    barras: number
    // Lo que ocupan las piezas, en metros.
    metrosUsados: number
}

export interface GrupoPerfilesCompra {
    clave: string
    producto: string
    color: string
    // Códigos de los productos del grupo: "V1", "P2"…
    productos: string[]
    perfiles: PerfilCompra[]
}

export interface AccesorioCompra {
    clave: string
    nombre: string
    detalle?: string
    imagen?: string
    cantidad: number
    unidad: "unidades" | "metros"
    en: string[]
}

export interface LaminasCompra {
    grupo: string
    laminas: number
}

export interface ListaCompra {
    grupos: GrupoPerfilesCompra[]
    accesorios: AccesorioCompra[]
    laminas: LaminasCompra[]
    totalBarras: number
}

export interface EntradaListaCompra {
    ventanas: readonly Ventana[]
    puertas: readonly Puerta[]
    descuentos: DescuentosPorSistema
    plan: Pick<PlanCorte, "optimizacion" | "laminasVidrio" | "puertas">
}

// Las claves de la optimización son "8025 - Cabezal", o "Negro · 8025 - Cabezal" con varios colores.
const SEPARADOR_COLOR = " · "

const colorDeEtiqueta = (etiqueta: string): ColorAluminio | undefined =>
    COLORES_ALUMINIO.find((color) => getColorAluminioLabel(color.value) === etiqueta)?.value

function perfilesVentanas(ventanas: readonly Ventana[], optimizacion: PlanCorte["optimizacion"]): GrupoPerfilesCompra[] {
    const colores = new Set(ventanas.map((ventana) => ventana.colorAluminio ?? COLOR_ALUMINIO_POR_DEFECTO))
    const unicoColor = colores.size === 1 ? [...colores][0] : undefined
    const grupos = new Map<ColorAluminio, Map<string, PerfilCompra>>()

    for (const [clave, { barras, metrosUsados }] of Object.entries(optimizacion)) {
        const separador = clave.indexOf(SEPARADOR_COLOR)
        const color = separador === -1 ? unicoColor : colorDeEtiqueta(clave.slice(0, separador))
        if (!color) continue
        const [sistema, tipo] = (separador === -1 ? clave : clave.slice(separador + SEPARADOR_COLOR.length)).split(" - ")
        const catalogo = sistema === "8025" ? PERFILES_8025[tipo] : undefined
        const referencia = catalogo?.referencia ?? `${sistema} ${tipo}`
        const perfiles = grupos.get(color) ?? new Map<string, PerfilCompra>()
        const actual = perfiles.get(referencia)
        perfiles.set(referencia, {
            clave: referencia,
            nombre: catalogo?.nombre ?? `${tipo} ${sistema}`,
            referencia,
            imagen: catalogo?.imagen,
            estilo: actual?.estilo ?? obtenerEstiloPerfil(tipo),
            barras: (actual?.barras ?? 0) + barras.length,
            metrosUsados: (actual?.metrosUsados ?? 0) + metrosUsados,
        })
        grupos.set(color, perfiles)
    }

    return [...grupos.entries()].map(([color, perfiles]) => ({
        clave: `ventana-${color}`,
        producto: "Ventana corrediza 80-25",
        color: getColorAluminioLabel(color),
        productos: ventanas.flatMap((ventana, i) => ((ventana.colorAluminio ?? COLOR_ALUMINIO_POR_DEFECTO) === color ? [`V${i + 1}`] : [])),
        perfiles: [...perfiles.values()],
    }))
}

function perfilesPuertas(puertas: readonly Puerta[], planPuertas: PlanCorte["puertas"]): GrupoPerfilesCompra[] {
    const colores = [...new Set(planPuertas.barras.map((barras) => barras.color))]
    return colores.map((color) => ({
        clave: `puerta-${color}`,
        producto: PUERTA_ALUMINA.nombre,
        color: getColorAluminioLabel(color),
        productos: puertas.flatMap((puerta, i) => (puerta.colorAluminio === color ? [codigoPuerta(i)] : [])),
        perfiles: REFERENCIAS_PERFIL_PUERTA.flatMap((referencia) => {
            const resultado = planPuertas.barras.find((barras) => barras.color === color && barras.referencia === referencia)?.resultado
            if (!resultado || resultado.barras.length === 0) return []
            const catalogo = PERFILES_PUERTA_ALUMINA[referencia]
            return [
                {
                    clave: referencia,
                    nombre: catalogo.nombre,
                    referencia: referencia === "PISAVIDRIO-CUADRADO" ? "Pisavidrio" : referencia,
                    imagen: catalogo.imagen,
                    estilo: ESTILOS_PERFIL_PUERTA[referencia],
                    barras: resultado.barras.length,
                    metrosUsados: resultado.consumoNeto / 1000,
                },
            ]
        }),
    }))
}

// Orden de la lista: por familia (todas las rodachinas juntas…), y los herrajes de puerta al final.
const ORDEN_ACCESORIOS = ["rodachina-", "guia", "cerradura-", "empaque", "tornillo-marco-hojas", "tornillo-instalacion", "puerta-"]
const ordenAccesorio = (clave: string) => ORDEN_ACCESORIOS.findIndex((prefijo) => clave.startsWith(prefijo))

// Junta en una fila cada accesorio igual, sumando cantidades y anotando en qué productos va.
class Acumulador {
    private filas = new Map<string, AccesorioCompra>()

    sumar(clave: string, item: ItemCatalogo, cantidad: number, unidad: AccesorioCompra["unidad"], codigo: string) {
        if (cantidad <= 0) return
        const actual = this.filas.get(clave)
        if (actual) {
            actual.cantidad += cantidad
            if (!actual.en.includes(codigo)) actual.en.push(codigo)
            return
        }
        this.filas.set(clave, { clave, nombre: item.nombre, detalle: item.detalle, imagen: item.imagen, cantidad, unidad, en: [codigo] })
    }

    // sort es estable: dentro de una familia queda el orden en que aparecen los productos.
    lista = () => [...this.filas.values()].sort((a, b) => ordenAccesorio(a.clave) - ordenAccesorio(b.clave))
}

function accesorios(entrada: EntradaListaCompra): AccesorioCompra[] {
    const acumulador = new Acumulador()
    entrada.ventanas.forEach((ventana, i) => {
        const codigo = `V${i + 1}`
        const a = calcularAccesorios([ventana], entrada.descuentos)
        const rodachina = ventana.rodachina ? RODACHINAS_8025[ventana.rodachina] : { nombre: "Rodachina", detalle: "Sin tipo elegido" }
        acumulador.sumar(`rodachina-${ventana.rodachina ?? "general"}`, rodachina, a.rodachinas, "unidades", codigo)
        acumulador.sumar("guia", OTROS_ACCESORIOS_8025.guia, a.guiasSuperior + a.guiasInferior, "unidades", codigo)
        const cerradura = ventana.cerradura ? CERRADURAS_8025[ventana.cerradura] : { nombre: "Cerradura", detalle: "Sin tipo elegido" }
        acumulador.sumar(`cerradura-${ventana.cerradura ?? "general"}`, cerradura, a.cerraduras, "unidades", codigo)
        acumulador.sumar("empaque", OTROS_ACCESORIOS_8025.empaque, a.empaqueTotal, "metros", codigo)
        acumulador.sumar("tornillo-marco-hojas", OTROS_ACCESORIOS_8025.tornilloMarcoHojas, a.tornillosMarco + a.tornillosHojas, "unidades", codigo)
        acumulador.sumar("tornillo-instalacion", OTROS_ACCESORIOS_8025.tornilloInstalacion, a.tornillosInstalacion, "unidades", codigo)
    })

    const indicePorId = new Map(entrada.puertas.map((puerta, i) => [puerta.id, i]))
    for (const { puerta, despiece } of entrada.plan.puertas.puertas) {
        if (!despiece) continue
        const codigo = codigoPuerta(indicePorId.get(puerta.id) ?? 0)
        for (const clave of ACCESORIOS_PUERTA) {
            const item = ACCESORIOS_PUERTA_ALUMINA[clave]
            acumulador.sumar(`puerta-${clave}`, { ...item, detalle: item.especificacion }, despiece.accesorios[clave], "unidades", codigo)
        }
    }
    return acumulador.lista()
}

function laminasPorGrupo(laminasVidrio: PlanCorte["laminasVidrio"]): LaminasCompra[] {
    const conteo = new Map<string, number>()
    for (const lamina of laminasVidrio) conteo.set(lamina.grupo ?? "Vidrio", (conteo.get(lamina.grupo ?? "Vidrio") ?? 0) + 1)
    return [...conteo.entries()].map(([grupo, laminas]) => ({ grupo, laminas }))
}

export function armarListaCompra(entrada: EntradaListaCompra): ListaCompra {
    const grupos = [...perfilesVentanas(entrada.ventanas, entrada.plan.optimizacion), ...perfilesPuertas(entrada.puertas, entrada.plan.puertas)]
    return {
        grupos,
        accesorios: accesorios(entrada),
        laminas: laminasPorGrupo(entrada.plan.laminasVidrio),
        totalBarras: grupos.reduce((total, grupo) => total + grupo.perfiles.reduce((suma, perfil) => suma + perfil.barras, 0), 0),
    }
}

const formatearCantidad = (cantidad: number, unidad: AccesorioCompra["unidad"]) =>
    unidad === "metros" ? `${cantidad.toLocaleString("es-CO", { maximumFractionDigits: 1 })} m` : `${cantidad}`

// Texto plano para mandar al proveedor (WhatsApp, correo).
export function textoListaCompra(lista: ListaCompra, proyecto: string, tamanoLamina: string): string {
    const lineas = [`Lista de compra: ${proyecto}`]
    for (const grupo of lista.grupos) {
        lineas.push("", `${grupo.producto}, aluminio ${grupo.color.toLowerCase()}`)
        for (const perfil of grupo.perfiles) {
            lineas.push(`- ${perfil.nombre} (${perfil.referencia}): ${perfil.barras} ${perfil.barras === 1 ? "barra" : "barras"} de ${LONGITUD_BARRA} m`)
        }
    }
    if (lista.accesorios.length > 0) {
        lineas.push("", "Accesorios")
        for (const accesorio of lista.accesorios) {
            const detalle = accesorio.detalle ? ` (${accesorio.detalle})` : ""
            lineas.push(`- ${accesorio.nombre}${detalle}: ${formatearCantidad(accesorio.cantidad, accesorio.unidad)}`)
        }
    }
    if (lista.laminas.length > 0) {
        lineas.push("", `Vidrio (láminas de ${tamanoLamina} mm)`)
        for (const { grupo, laminas } of lista.laminas) lineas.push(`- ${grupo}: ${laminas} ${laminas === 1 ? "lámina" : "láminas"}`)
    }
    return lineas.join("\n")
}
