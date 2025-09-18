"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X } from "lucide-react"

interface LogFiltersProps {
  onFilterChange: (filters: LogFilters) => void
  bots: Array<{ id: string; name: string; domain: string }>
}

export interface LogFilters {
  search: string
  botId: string
  domain: string
  sentiment: string
}

export function LogFilters({ onFilterChange, bots }: LogFiltersProps) {
  const [filters, setFilters] = useState<LogFilters>({
    search: "",
    botId: "all",
    domain: "all",
    sentiment: "all",
  })

  const updateFilter = (key: keyof LogFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      botId: "all",
      domain: "all",
      sentiment: "all",
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "all")

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transcripts..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="bg-background"
            />
          </div>

          <Select value={filters.botId} onValueChange={(value) => updateFilter("botId", value)}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="All bots" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All bots</SelectItem>
              {bots.map((bot) => (
                <SelectItem key={bot.id} value={bot.id}>
                  {bot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.domain} onValueChange={(value) => updateFilter("domain", value)}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All domains</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="receptionist">Receptionist</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sentiment} onValueChange={(value) => updateFilter("sentiment", value)}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sentiment</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2 bg-transparent"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
