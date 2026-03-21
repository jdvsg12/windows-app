import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calculator, LayoutDashboard } from "lucide-react"

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between mx-auto">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <span className="text-lg font-bold">A</span>
                        </div>
                        <span className="hidden font-bold text-xl sm:inline-block">ALUVE</span>
                    </Link>
                </div>
                <nav className="flex items-center gap-1">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden sm:inline-block">Dashboard</span>
                        </Button>
                    </Link>
                    <Link href="/calculators">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Calculator className="h-4 w-4" />
                            <span className="hidden sm:inline-block">Calculadora</span>
                        </Button>
                    </Link>
                </nav>
            </div>
        </header>
    )
}
