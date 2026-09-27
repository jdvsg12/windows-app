"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calculator, LayoutDashboard, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"

const NAV_ITEMS = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/calculators", label: "Calculadora", icon: Calculator },
    { href: "/admin", label: "Admin", icon: Settings },
] as const

export default function Header() {
    const pathname = usePathname()

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 rounded-md" aria-label="ALUVE, ir al dashboard">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <span className="text-lg font-bold">A</span>
                    </div>
                    <span className="hidden font-bold text-xl sm:inline-block">ALUVE</span>
                </Link>
                <nav aria-label="Principal" className="flex items-center gap-1">
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                        <Button
                            key={href}
                            asChild
                            variant={isActive(href) ? "secondary" : "ghost"}
                            size="sm"
                            className="gap-2 max-sm:size-10 max-sm:p-0"
                        >
                            <Link href={href} aria-current={isActive(href) ? "page" : undefined} aria-label={label}>
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline-block">{label}</span>
                            </Link>
                        </Button>
                    ))}
                </nav>
            </div>
        </header>
    )
}
