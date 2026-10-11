"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SistemaVentana } from "@/lib/types"
import { Save, RotateCcw } from "lucide-react"
import { DescuentosSistemaCard } from "./DescuentosSistemaCard"
import { SISTEMAS, useDescuentosForm } from "./useDescuentosForm"
import { FormSkeleton } from "@/components/common/FormSkeleton"

export function DescuentosPanel() {
    const {
        descuentos,
        activeTab,
        setActiveTab,
        loading,
        saved,
        handleChange,
        handleSave,
        handleReset,
        handleResetAll,
    } = useDescuentosForm()

    if (loading) return <FormSkeleton fields={6} />

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Descuentos por Sistema (mm)</h3>
                    <p className="text-sm text-muted-foreground">
                        Estos valores se aplican en el cálculo de cortes y vidrios
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleResetAll} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Restablecer Todo
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SistemaVentana)}>
                <TabsList className="grid grid-cols-4 w-full max-w-md">
                    {SISTEMAS.map((sistema) => (
                        <TabsTrigger key={sistema} value={sistema}>
                            Sistema {sistema}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {SISTEMAS.map((sistema) => (
                    <TabsContent key={sistema} value={sistema}>
                        <DescuentosSistemaCard
                            sistema={sistema}
                            values={descuentos[sistema]}
                            onChange={handleChange}
                        />
                    </TabsContent>
                ))}
            </Tabs>

            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Restablecer Sistema
                </Button>
                <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saved ? "Guardado!" : "Guardar Cambios"}
                </Button>
            </div>
        </div>
    )
}
