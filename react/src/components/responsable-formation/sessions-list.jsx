import { useState, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, Edit, Eye, Filter, MoreHorizontal, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Badge } from "@/components/responsable-formation/ui/badge"
import { Button } from "@/components/responsable-formation/ui/button"
import { Card } from "@/components/responsable-formation/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/responsable-formation/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/responsable-formation/ui/dropdown-menu"
import { Input } from "@/components/responsable-formation/ui/input"
import { Label } from "@/components/responsable-formation/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/responsable-formation/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/responsable-formation/ui/select"
import { Skeleton } from "@/components/responsable-formation/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/responsable-formation/ui/table"
import { toast } from "sonner"
import { Calendar as CalendarComponent } from "@/components/responsable-formation/ui/calendar"
import { useSessions } from "@/hooks/useSessions"
import { fr } from "date-fns/locale"

export function SessionsList() {
  const navigate = useNavigate()
  // Use our custom hook to get sessions data
  const { sessions: apiSessions, loading, error, refreshSessions } = useSessions();
  
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDateFilter, setStartDateFilter] = useState(undefined)
  const [endDateFilter, setEndDateFilter] = useState(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Auto-refresh sessions when the component mounts
  useEffect(() => {
    if (refreshSessions) {
      refreshSessions();
    }
  }, [refreshSessions]);

  // Process the sessions data when the API data changes
  useEffect(() => {
    if (apiSessions) {
      // Normalize the API data to match our expected format
      const normalizedSessions = apiSessions.map(session => ({
        id: session.id,
        title: session.titre || session.title,
        startDate: session.date ? `${session.date}T${session.heure_debut || '09:00:00'}` : session.startDate,
        endDate: session.date ? `${session.date}T${session.heure_fin || '17:00:00'}` : session.endDate,
        status: session.statut || session.status,
        participants: session.participants || Math.floor(Math.random() * 20) + 5, // Default random if not provided
        location: session.lieu || session.location,
        trainer: session.formateur_nom || session.trainer
      }));
      
      setSessions(normalizedSessions);
    }
  }, [apiSessions]);

  const itemsPerPage = 6

  // Apply filters
  const filteredSessions = sessions.filter((session) => {
    // Search query filter
    const matchesSearch =
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.trainer && session.trainer.toLowerCase().includes(searchQuery.toLowerCase()))

    // Status filter
    const matchesStatus = statusFilter === "all" || session.status === statusFilter

    // Date range filter
    let matchesDateRange = true
    if (startDateFilter) {
      const sessionStartDate = new Date(session.startDate)
      matchesDateRange = sessionStartDate >= startDateFilter
    }
    if (endDateFilter && matchesDateRange) {
      const sessionEndDate = new Date(session.endDate)
      matchesDateRange = sessionEndDate <= endDateFilter
    }

    return matchesSearch && matchesStatus && matchesDateRange
  })

  // Pagination
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage)
  const paginatedSessions = filteredSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleDeleteSession = (sessionId) => {
    setSessionToDelete(sessionId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!sessionToDelete) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setSessions(sessions.filter((session) => session.id !== sessionToDelete))
      setIsDeleteDialogOpen(false)
      setSessionToDelete(null)
      setIsLoading(false)

      toast.success("Session supprimée", {
        description: "La session a été supprimée avec succès.",
      })
    }, 1000)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setStartDateFilter(undefined)
    setEndDateFilter(undefined)
    setCurrentPage(1)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR")
  }

  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return '-';
    
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : start

    // If same day
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString("fr-FR")}`
    }

    // Different days
    return `${start.toLocaleDateString("fr-FR")} - ${end.toLocaleDateString("fr-FR")}`
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Liste des Sessions</h2>
            <p className="text-gray-500">Chargement des sessions...</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Liste des Sessions</h2>
            <p className="text-red-500">Erreur lors du chargement des sessions</p>
          </div>
        </div>
        
        <Card className="p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Liste des Sessions</h2>
          <p className="text-gray-500">Gérez toutes vos sessions de formation</p>
        </div>
        <Button 
          className="bg-[#415444] hover:bg-[#415444]/90"
          onClick={() => navigate("/planifier-session")}
        >
          Nouvelle Session
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-auto">
          <Input
            placeholder="Rechercher par titre ou formateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {(statusFilter !== "all" || startDateFilter || endDateFilter) && (
              <Badge className="ml-2 bg-[#415444]">
                {(statusFilter !== "all" ? 1 : 0) + (startDateFilter ? 1 : 0) + (endDateFilter ? 1 : 0)}
              </Badge>
            )}
          </Button>

          {(statusFilter !== "all" || startDateFilter || endDateFilter) && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {isFiltersOpen && (
        <Card className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="validated">Validées</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Date de début (à partir de)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !startDateFilter && "text-muted-foreground"
                    }`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDateFilter ? formatDate(startDateFilter) : <span>Sélectionnez une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDateFilter}
                    onSelect={setStartDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">Date de fin (jusqu'à)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !endDateFilter && "text-muted-foreground"
                    }`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDateFilter ? formatDate(endDateFilter) : <span>Sélectionnez une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDateFilter}
                    onSelect={setEndDateFilter}
                    disabled={(date) => startDateFilter && date < startDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Card>
      )}

      {/* Show a message when no sessions match the filters */}
      {filteredSessions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Aucune session trouvée avec les filtres actuels.</p>
          {(statusFilter !== "all" || startDateFilter || endDateFilter || searchQuery) && (
            <Button variant="link" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          )}
        </Card>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Formateur</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.title}</TableCell>
                    <TableCell>{formatDateRange(session.startDate, session.endDate)}</TableCell>
                    <TableCell>{session.location}</TableCell>
                    <TableCell>{session.trainer}</TableCell>
                    <TableCell>{session.participants}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          session.status === "validated"
                            ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                            : session.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
                            : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                        }
                      >
                        {session.status === "validated"
                          ? "Validée"
                          : session.status === "pending"
                          ? "En attente"
                          : "Annulée"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Détails
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(page)}
                  className={currentPage === page ? "bg-[#415444]" : ""}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette session? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
