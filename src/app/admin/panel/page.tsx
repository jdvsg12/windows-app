"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LogOut } from "lucide-react"
import Link from "next/link"
import { PreciosPanel } from "@/components/admin/PreciosPanel"
import { DescuentosPanel } from "@/components/admin/DescuentosPanel"
import { OverheadPanel } from "@/components/admin/OverheadPanel"
import { FotosProductosPanel } from "@/components/admin/FotosProductosPanel"
import { isAdminAuthenticated, setAdminAuthenticated } from "@/lib/storage"

export default function AdminPanelPage() {
    const router = useRouter()
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        if (!isAdminAuthenticated()) {
            router.push("/admin")
        } else {
            setIsAuthorized(true)
        }
    }, [router])

    const handleLogout = () => {
        setAdminAuthenticated(false)
        router.push("/admin")
    }

    if (!isAuthorized) return null

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/" aria-label="Volver al dashboard">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-title font-bold tracking-tight">Panel de Administración</h1>
                        <p className="text-sm text-muted-foreground">
                            Configuración de precios, descuentos y fotos de producto
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                </Button>
            </div>

            <Tabs defaultValue="precios" className="w-full">
                <TabsList className="grid h-auto w-full max-w-2xl grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="precios">Precios Materiales</TabsTrigger>
                    <TabsTrigger value="descuentos">Descuentos por Sistema</TabsTrigger>
                    <TabsTrigger value="overhead">Overhead</TabsTrigger>
                    <TabsTrigger value="fotos">Fotos de producto</TabsTrigger>
                </TabsList>
                <TabsContent value="precios" className="mt-6">
                    <PreciosPanel />
                </TabsContent>
                <TabsContent value="descuentos" className="mt-6">
                    <DescuentosPanel />
                </TabsContent>
                <TabsContent value="overhead" className="mt-6">
                    <OverheadPanel />
                </TabsContent>
                <TabsContent value="fotos" className="mt-6">
                    <FotosProductosPanel />
                </TabsContent>
            </Tabs>
        </div>
    )
}