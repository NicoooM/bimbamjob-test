import { useState, useEffect, useMemo, type KeyboardEvent } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PAGE_SIZE = 50

interface Field {
  name: string
  type: string
  description: string
  ecs: boolean
  category: string
  dimension: boolean
  unit: string | null
  metric_type: string | null
  example: string | null
  object_type: string | null
}

interface Index {
  [pkg: string]: string[]
}

type SortKey = 'name' | 'type' | 'category'
type SortDir = 'asc' | 'desc'

const TYPE_COLORS: Record<string, { text: string; dot: string }> = {
  keyword:   { text: 'text-blue-600',   dot: '#3b82f6' },
  constant_keyword: { text: 'text-blue-600', dot: '#3b82f6' },
  text:      { text: 'text-blue-600',   dot: '#3b82f6' },
  long:      { text: 'text-green-600',  dot: '#16a34a' },
  integer:   { text: 'text-green-600',  dot: '#16a34a' },
  float:     { text: 'text-green-600',  dot: '#16a34a' },
  scaled_float: { text: 'text-green-600', dot: '#16a34a' },
  date:      { text: 'text-amber-600',  dot: '#d97706' },
  boolean:   { text: 'text-purple-600', dot: '#9333ea' },
  ip:        { text: 'text-red-600',    dot: '#dc2626' },
  object:    { text: 'text-indigo-600', dot: '#4f46e5' },
  flattened: { text: 'text-indigo-600', dot: '#4f46e5' },
}

// ── App ──────────────────────────────────────────────────────────────

function App() {
  const [index, setIndex] = useState<Index>({})
  const [selectedPkg, setSelectedPkg] = useState('')
  const [selectedDs, setSelectedDs] = useState('')

  const [ecsFields, setEcsFields] = useState<Field[]>([])
  const [customFields, setCustomFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hasContext = selectedPkg !== '' && selectedDs !== ''

  useEffect(() => {
    fetch('/registry/index.json')
      .then(r => r.json())
      .then(setIndex)
      .catch(() => {})
  }, [])

  // Auto-select first data stream when package changes
  useEffect(() => {
    if (selectedPkg && index[selectedPkg]) {
      const streams = index[selectedPkg]
      if (!streams.includes(selectedDs)) {
        setSelectedDs(streams[0] || '')
      }
    } else if (!selectedPkg) {
      setSelectedDs('')
    }
  }, [selectedPkg, index])

  // Load field data
  useEffect(() => {
    setLoading(true)
    setError(null)

    if (hasContext) {
      Promise.all([
        fetch('/registry/ecs.json').then(r => r.json()),
        fetch(`/registry/${selectedPkg}/${selectedDs}.json`).then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json()
        }),
      ])
        .then(([ecs, all]) => {
          setEcsFields(ecs as Field[])
          setCustomFields((all as Field[]).filter(f => !f.ecs))
          setLoading(false)
        })
        .catch((err: Error) => {
          setError(err.message)
          setLoading(false)
        })
    } else {
      fetch('/registry/ecs.json')
        .then(r => r.json())
        .then((data) => {
          setEcsFields(data as Field[])
          setCustomFields([])
          setLoading(false)
        })
        .catch((err: Error) => {
          setError(err.message)
          setLoading(false)
        })
    }
  }, [selectedPkg, selectedDs])

  const pkgList = Object.keys(index).sort()
  const dsList = selectedPkg ? (index[selectedPkg] || []).sort() : []

  const title = hasContext
    ? `${selectedPkg} / ${selectedDs}`
    : 'ECS Field Catalog'

  return (
    <Sheet defaultOpen>
      <SheetTrigger asChild>
        <Button variant="outline" className="m-4">
          {hasContext ? title : 'ECS Field Catalog'}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="!w-[90vw] !max-w-[1200px] flex flex-col overflow-hidden">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto -mx-4 px-4 space-y-4 pb-8">
          {/* Package / data stream picker */}
          {pkgList.length > 0 && (
            <div className="flex gap-3 items-center flex-wrap">
              <Select value={selectedPkg || '--'} onValueChange={(v) => v && setSelectedPkg(v === '--' ? '' : v)}>
                <SelectTrigger className="w-[200px]" aria-label="Select package">
                  <SelectValue placeholder="No package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="--">No package (ECS only)</SelectItem>
                  {pkgList.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPkg && (
                <Select value={selectedDs || '--'} onValueChange={(v) => v && setSelectedDs(v === '--' ? '' : v)}>
                  <SelectTrigger className="w-[200px]" aria-label="Select data stream">
                    <SelectValue placeholder="Select data stream..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="--">No data stream</SelectItem>
                    {dsList.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {loading && (
            <div role="status" aria-live="polite" className="flex items-center justify-center py-20 text-muted-foreground">
              Loading...
            </div>
          )}
          {error && (
            <div role="alert" className="flex items-center justify-center py-20 text-destructive">
              Failed to load: {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {hasContext ? (
                <>
                  <FieldTable
                    title="Custom Fields"
                    subtitle={`${selectedPkg} / ${selectedDs}`}
                    fields={customFields}
                  />
                  <FieldTable
                    title="ECS Fields"
                    subtitle="generic schema"
                    fields={ecsFields}
                    collapsed
                  />
                </>
              ) : (
                <FieldTable
                  title="ECS Fields"
                  subtitle={`${ecsFields.length} standard fields`}
                  fields={ecsFields}
                />
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ── FieldTable ───────────────────────────────────────────────────────

interface FieldTableProps {
  title: string
  subtitle: string
  fields: Field[]
  collapsed?: boolean
}

function FieldTable({ title, subtitle, fields, collapsed = false }: FieldTableProps) {
  const [open, setOpen] = useState(!collapsed)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(0)

  // Derive types/categories from fields
  const { types, categories } = useMemo(() => {
    const types = new Set<string>()
    const cats = new Set<string>()
    for (const f of fields) { types.add(f.type); cats.add(f.category) }
    return { types: [...types].sort(), categories: [...cats].sort() }
  }, [fields])

  // Filter + sort
  const filtered = useMemo(() => {
    let arr = fields

    if (query) {
      const q = query.toLowerCase()
      arr = arr.filter(f =>
        f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
      )
    }
    if (typeFilter.size > 0) {
      arr = arr.filter(f => typeFilter.has(f.type))
    }
    if (categoryFilter !== 'all') {
      arr = arr.filter(f => f.category === categoryFilter)
    }
    arr = [...arr].sort((a, b) => {
      let va: string | number | boolean = a[sortKey] ?? ''
      let vb: string | number | boolean = b[sortKey] ?? ''
      if (typeof va === 'boolean') { va = va ? 1 : 0; vb = vb ? 1 : 0 }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [fields, query, typeFilter, categoryFilter, sortKey, sortDir])

  // Reset page when filters change
  useEffect(() => { setPage(0) }, [query, typeFilter, categoryFilter])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function toggleType(t: string) {
    const next = new Set(typeFilter)
    if (next.has(t)) next.delete(t)
    else next.add(t)
    setTypeFilter(next)
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageFields = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const start = safePage * PAGE_SIZE + 1
  const end = Math.min(start + PAGE_SIZE - 1, filtered.length)

  const sectionId = title.toLowerCase().replace(/\s+/g, '-')
  const headerId = `${sectionId}-header`
  const panelId = `${sectionId}-panel`

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open) }
  }

  return (
    <div className="space-y-3">
      {/* Collapsible header */}
      <div
        role="button"
        tabIndex={0}
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card cursor-pointer select-none hover:bg-accent/50 transition-colors focus-visible:outline-2 focus-visible:outline-ring"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKey}
      >
        <span className="text-muted-foreground text-xs w-4" aria-hidden="true">{open ? '▾' : '▸'}</span>
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{subtitle} &mdash; {fields.length} fields</span>
      </div>

      {open && (
        <div id={panelId} role="region" aria-labelledby={headerId} className="space-y-3">
          {/* Toolbar */}
          <div className="flex gap-3 items-center flex-wrap">
            <Input
              className="flex-1 min-w-[200px]"
              aria-label="Search fields by name or description"
              placeholder="Search fields by name or description..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {filtered.length} fields
            </span>
            <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
              <SelectTrigger className="w-[160px]" aria-label="Filter by category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type chips */}
          <fieldset className="flex gap-1.5 flex-wrap border-0 p-0">
            <legend className="sr-only">Filter by field type</legend>
            {types.map(t => (
              <button
                key={t}
                aria-pressed={typeFilter.has(t)}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs border transition-colors
                  ${typeFilter.has(t)
                    ? 'bg-accent text-accent-foreground border-border'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                onClick={() => toggleType(t)}
              >
                <span className="w-1.5 h-1.5 rounded-full" aria-hidden="true" style={{ background: TYPE_COLORS[t]?.dot || '#9399b3' }} />
                {t}
              </button>
            ))}
            {typeFilter.size > 0 && (
              <button
                className="text-xs text-muted-foreground hover:text-foreground px-2"
                onClick={() => setTypeFilter(new Set())}
              >
                clear
              </button>
            )}
          </fieldset>

          {/* Table */}
          {totalPages > 1 && (
            <Pagination page={safePage} total={totalPages} start={start} end={end}
              totalItems={filtered.length} onChange={setPage} />
          )}

          <div className="rounded-lg border border-border overflow-hidden">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <SortableHeader label="Name" sortKey="name" activeKey={sortKey} dir={sortDir} onToggleSort={toggleSort} className="w-[45%]" />
                  <SortableHeader label="Type" sortKey="type" activeKey={sortKey} dir={sortDir} onToggleSort={toggleSort} className="w-[14%]" />
                  <SortableHeader label="Cat" sortKey="category" activeKey={sortKey} dir={sortDir} onToggleSort={toggleSort} className="hidden md:table-cell w-[10%]" />
                  <TableHead className="hidden md:table-cell w-[22%]">Description</TableHead>
                  <TableHead className="hidden md:table-cell w-[9%]">Unit / Metric</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageFields.map((f, i) => (
                  <TableRow key={`${f.name}-${i}`} className="group">
                    <TableCell className="truncate">
                      <div className="flex items-center gap-1 min-w-0">
                        <CopyButton text={f.name} />
                        <code className="text-xs font-mono text-foreground truncate">{f.name}</code>
                        {f.ecs && <Badge variant="secondary" className="text-[10px] h-4 px-1 shrink-0">ECS</Badge>}
                        {f.dimension && <Badge variant="outline" className="text-[10px] h-4 px-1 shrink-0 text-purple-600">dim</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium ${TYPE_COLORS[f.type]?.text || 'text-muted-foreground'}`}>
                        {f.type}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{f.category}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground truncate">
                      {f.description || '—'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-1">
                        {f.unit && <Badge variant="outline" className="text-[10px] h-4 px-1 text-green-600">{f.unit}</Badge>}
                        {f.metric_type && <Badge variant="outline" className="text-[10px] h-4 px-1 text-amber-600">{f.metric_type}</Badge>}
                        {!f.unit && !f.metric_type && <span className="text-xs text-muted-foreground">&mdash;</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {pageFields.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No fields match the current filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination page={safePage} total={totalPages} start={start} end={end}
              totalItems={filtered.length} onChange={setPage} />
          )}
        </div>
      )}
    </div>
  )
}

// ── SortableHeader ───────────────────────────────────────────────────

interface SortableHeaderProps {
  label: string
  sortKey: SortKey
  activeKey: SortKey
  dir: SortDir
  onToggleSort: (key: SortKey) => void
  className?: string
}

function SortableHeader({ label, sortKey, activeKey, dir, onToggleSort, className }: SortableHeaderProps) {
  const isActive = activeKey === sortKey
  const arrow = isActive ? (dir === 'asc' ? '↑' : '↓') : ''

  return (
    <TableHead
      role="button"
      tabIndex={0}
      aria-label={`Sort by ${label}${isActive ? `, currently ${dir === 'asc' ? 'ascending' : 'descending'}` : ''}`}
      className={`cursor-pointer hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring ${className || ''}`}
      onClick={() => onToggleSort(sortKey)}
      onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleSort(sortKey) } }}
    >
      {label}
      {arrow && <span aria-hidden="true" className="text-[10px] ml-1">{arrow}</span>}
    </TableHead>
  )
}

// ── CopyButton ───────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    function doCopy(): Promise<void> {
      if (navigator.clipboard?.writeText) {
        return navigator.clipboard.writeText(text)
      }
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      ta.style.top = '-9999px'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      try { document.execCommand('copy') } catch { /* ignore */ }
      document.body.removeChild(ta)
      return Promise.resolve()
    }
    doCopy().then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }

  return (
    <button
      className={`inline-flex items-center gap-1 h-5 rounded px-1.5 transition-all duration-150 shrink-0
        ${copied
          ? 'bg-green-100 text-green-700 scale-105'
          : 'opacity-0 group-hover:opacity-100 hover:bg-accent text-muted-foreground hover:text-foreground'
        }
        focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring`}
      aria-label={copied ? 'Copied' : `Copy ${text} to clipboard`}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-medium">Copied</span>
        </>
      ) : (
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 5V2.5a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5v8a.5.5 0 00.5.5H5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )}
    </button>
  )
}

// ── Pagination ───────────────────────────────────────────────────────

interface PaginationProps {
  page: number
  total: number
  start: number
  end: number
  totalItems: number
  onChange: (page: number) => void
}

function Pagination({ page, total, start, end, totalItems, onChange }: PaginationProps) {
  if (total <= 1) return null

  const pages: number[] = []
  const maxVisible = 7
  let pStart = Math.max(0, page - Math.floor(maxVisible / 2))
  let pEnd = Math.min(total, pStart + maxVisible)
  if (pEnd - pStart < maxVisible) pStart = Math.max(0, pEnd - maxVisible)

  for (let i = pStart; i < pEnd; i++) pages.push(i)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 flex-wrap py-2">
      <span className="text-xs text-muted-foreground">{start}&ndash;{end} of {totalItems}</span>
      <div className="flex gap-1">
        <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => onChange(0)}
          aria-label="First page">&laquo;</Button>
        <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => onChange(page - 1)}
          aria-label="Previous page">&lsaquo;</Button>
        {pages[0] > 0 && <span className="w-7 h-7 flex items-center justify-center text-xs text-muted-foreground">&hellip;</span>}
        {pages.map(i => (
          <Button
            key={i}
            variant={i === page ? 'default' : 'outline'}
            size="icon"
            className="h-7 w-7 text-xs"
            onClick={() => onChange(i)}
            aria-label={`Page ${i + 1}`}
            aria-current={i === page ? 'page' : undefined}
          >
            {i + 1}
          </Button>
        ))}
        {pages[pages.length - 1] < total - 1 && <span className="w-7 h-7 flex items-center justify-center text-xs text-muted-foreground">&hellip;</span>}
        <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= total - 1} onClick={() => onChange(page + 1)}
          aria-label="Next page">&rsaquo;</Button>
        <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= total - 1} onClick={() => onChange(total - 1)}
          aria-label="Last page">&raquo;</Button>
      </div>
    </nav>
  )
}

export default App
