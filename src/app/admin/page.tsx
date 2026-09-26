"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Settings, Lock } from "lucide-react"
import { isAdminAuthenticated, setAdminAuthenticated } from "@/lib/storage"
import { AdminLoginSchema, type AdminLoginInput } from "@/lib/schemas"

const ADMIN_PASSWORD = "admin123"

export default function AdminLogin() {
    const router = useRouter()
    const form = useForm<AdminLoginInput>({
        resolver: zodResolver(AdminLoginSchema),
        defaultValues: { password: "" },
    })

    useEffect(() => {
        if (isAdminAuthenticated()) {
            router.push("/admin/panel")
        }
    }, [router])

    const handleSubmit = ({ password }: AdminLoginInput) => {
        if (password !== ADMIN_PASSWORD) {
            form.setError("password", { message: "Contraseña incorrecta" })
            return
        }
        setAdminAuthenticated(true)
        router.push("/admin/panel")
    }

    return (
        <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Panel de Administración</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        Ingrese la contraseña para acceder
                    </p>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Contraseña"
                                                    className="pl-10"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage className="text-center" />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">
                                Ingresar
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
