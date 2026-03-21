"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface HeaderProjectType {
  key: string
  label: string
}

interface DataTableProps<T> {
  headers: HeaderProjectType[]
  data: T[]
}

function getCellValue<T>(row: T, key: string): string {
  const value = (row as Record<string, unknown>)[key]
  return value !== undefined && value !== null ? String(value) : "-"
}

export default function DataTable<T>({ headers, data }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No hay proyectos disponibles
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header) => (
            <TableHead key={header.key} className="font-semibold">
              {header.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, idx) => (
          <TableRow key={idx}>
            {headers.map((header) => (
              <TableCell key={header.key}>
                {getCellValue(row, header.key)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
