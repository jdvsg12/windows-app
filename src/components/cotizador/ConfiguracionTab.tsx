"use client"

import type React from "react"
import type { ConfiguracionEmpresa } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
                                    <img src={logo || "/placeholder.svg"} alt="Logo" className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div className="flex-1">
                                <Input type="file" accept="image/*" onChange={onLogoUpload} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Nombre Empresa</Label>
                        <Input value={config.nombre} onChange={(e) => onConfigChange("nombre", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>NIT</Label>
                        <Input value={config.nit} onChange={(e) => onConfigChange("nit", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Dirección</Label>
                        <Input value={config.direccion} onChange={(e) => onConfigChange("direccion", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Ciudad</Label>
                        <Input value={config.ciudad} onChange={(e) => onConfigChange("ciudad", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Teléfonos</Label>
                        <Input value={config.telefonos} onChange={(e) => onConfigChange("telefonos", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={config.email} onChange={(e) => onConfigChange("email", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Representante Legal</Label>
                        <Input
                            value={config.representante}
                            onChange={(e) => onConfigChange("representante", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Cédula Representante</Label>
                        <Input value={config.cedula} onChange={(e) => onConfigChange("cedula", e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Datos Bancarios</Label>
                    <textarea
                        className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
                        value={config.datosBancarios}
                        onChange={(e) => onConfigChange("datosBancarios", e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
