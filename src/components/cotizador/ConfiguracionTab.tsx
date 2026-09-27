"use client"

import type React from "react"
import type { ConfiguracionEmpresa } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Props {
    config: ConfiguracionEmpresa
    logo: string
    onConfigChange: (field: keyof ConfiguracionEmpresa, value: string) => void
    onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ConfiguracionTab({ config, logo, onConfigChange, onLogoUpload }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Datos de la Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Logo</Label>
                        <div className="flex items-center gap-4">
                            {logo && (
                                <div className="w-20 h-20 border rounded-md overflow-hidden">
                                    <img src={logo || "/placeholder.svg"} alt={`${config.nombre} - logo`} className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div className="flex-1">
                                <Input type="file" accept="image/*" onChange={onLogoUpload} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="config-nombre">Nombre Empresa</Label>
                        <Input id="config-nombre" value={config.nombre} onChange={(e) => onConfigChange("nombre", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="config-nit">NIT</Label>
                        <Input id="config-nit" value={config.nit} onChange={(e) => onConfigChange("nit", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="config-direccion">Dirección</Label>
                        <Input id="config-direccion" value={config.direccion} onChange={(e) => onConfigChange("direccion", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="config-ciudad">Ciudad</Label>
                        <Input id="config-ciudad" value={config.ciudad} onChange={(e) => onConfigChange("ciudad", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="config-telefonos">Teléfonos</Label>
                        <Input id="config-telefonos" value={config.telefonos} onChange={(e) => onConfigChange("telefonos", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="config-email">Email</Label>
                        <Input id="config-email" value={config.email} onChange={(e) => onConfigChange("email", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="config-representante">Representante Legal</Label>
                        <Input
                            id="config-representante"
                            value={config.representante}
                            onChange={(e) => onConfigChange("representante", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="config-cedula">Cédula Representante</Label>
                        <Input id="config-cedula" value={config.cedula} onChange={(e) => onConfigChange("cedula", e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="config-datos-bancarios">Datos Bancarios</Label>
                    <Textarea
                        id="config-datos-bancarios"
                        className="min-h-[100px]"
                        value={config.datosBancarios}
                        onChange={(e) => onConfigChange("datosBancarios", e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
