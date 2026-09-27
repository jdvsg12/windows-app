export function Loading() {
    return (
        <div className="flex items-center justify-center py-24" role="status">
            <div className="text-center">
                <div className="animate-spin motion-reduce:animate-none rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando cotizador...</p>
            </div>
        </div>
    )
}
