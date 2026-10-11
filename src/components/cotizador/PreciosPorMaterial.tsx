"use client"

import { SectionTitle } from "@/components/common/SectionTitle"
import { PreciosPorTipo } from "@/components/admin/PreciosPorTipo"
import { PreciosVidrioTabla } from "@/components/admin/PreciosVidrioTabla"
import { RecargosColorAluminio } from "@/components/admin/RecargosColorAluminio"
import { conPrecioOpcional } from "@/lib/precios"
import { CERRADURAS, RODACHINAS, type ConfiguracionPrecios } from "@/lib/types"
import { PrecioField } from "./PrecioField"

interface PreciosPorMaterialProps {
    precios: ConfiguracionPrecios
    onUpdatePrecios: (precios: ConfiguracionPrecios) => void
}

// Prices that depend on what each window picks (aluminum color, glass type, sandblasting,
// lock and roller type). Same blocks as Admin → Precios, so both screens edit the same data.
export function PreciosPorMaterial({ precios, onUpdatePrecios }: PreciosPorMaterialProps) {
    const actualizar = (cambios: Partial<ConfiguracionPrecios>) => onUpdatePrecios({ ...precios, ...cambios })

    return (
        <div className="space-y-6 border-t pt-6 md:col-span-2">
            <SectionTitle>Precios según lo elegido en cada ventana</SectionTitle>

            <RecargosColorAluminio
                recargos={precios.recargosColorAluminio}
                onChange={(color, recargo) =>
                    actualizar({ recargosColorAluminio: { ...precios.recargosColorAluminio, [color]: recargo } })
                }
            />

            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <PrecioField
                        id="precioSandblasting"
                        label="Sandblasting (por m²)"
                        value={precios.precioSandblasting}
                        onChange={(precioSandblasting) => actualizar({ precioSandblasting })}
                    />
                </div>
                <PreciosVidrioTabla
                    precios={precios.preciosVidrio}
                    precioGeneral={precios.precioVidrioLamina}
                    onChange={(clave, valor) =>
                        actualizar({ preciosVidrio: conPrecioOpcional(precios.preciosVidrio, clave, valor) })
                    }
                />
            </div>

            <PreciosPorTipo
                titulo="Cerradura por tipo"
                idPrefijo="cotizador-cerradura"
                opciones={CERRADURAS}
                precios={precios.preciosCerradura}
                precioGeneral={precios.precioCerradura}
                onChange={(tipo, valor) =>
                    actualizar({ preciosCerradura: conPrecioOpcional(precios.preciosCerradura, tipo, valor) })
                }
            />
            <PreciosPorTipo
                titulo="Rodachina por tipo"
                idPrefijo="cotizador-rodachina"
                opciones={RODACHINAS}
                precios={precios.preciosRodachina}
                precioGeneral={precios.precioRodachina}
                onChange={(tipo, valor) =>
                    actualizar({ preciosRodachina: conPrecioOpcional(precios.preciosRodachina, tipo, valor) })
                }
            />
        </div>
    )
}
