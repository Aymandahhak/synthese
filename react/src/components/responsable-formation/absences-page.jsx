import { useState } from "react"
import { toast } from "sonner"
import { ChevronRight } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/responsable-formation/ui/avatar"
import { Badge } from "@/components/responsable-formation/ui/badge"
import { Button } from "@/components/responsable-formation/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/responsable-formation/ui/card"
import { Input } from "@/components/responsable-formation/ui/input"
import { Label } from "@/components/responsable-formation/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/responsable-formation/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/responsable-formation/ui/tabs"
import { Skeleton } from "@/components/responsable-formation/ui/skeleton"
import { useAbsences } from "@/hooks/useAbsences"

function AbsencesPage() {
  const { absences, loading, error } = useAbsences();
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const handleViewAbsence = (person) => {
    toast.info("Détails de l'absence", {
      description: `Affichage des détails de l'absence de ${person.name}.`
    })
  }

  const handleValidateAbsence = (person) => {
    toast.success("Absence validée", {
      description: `L'absence de ${person.name} a été validée avec succès.`
    })
  }

  const handleRejectAbsence = (person) => {
    toast.error("Absence rejetée", {
      description: `L'absence de ${person.name} a été rejetée.`
    })
  }

  const filteredPeople = absences.filter((person) => {
    if (filter !== "all") {
      return person.absenceType.toLowerCase() === filter.toLowerCase()
    }
    return true
  }).filter((person) => {
    if (searchQuery) {
      return (
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.absenceType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return true
  })

  const formatDateRange = (startDate, endDate) => {
    return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Gestion des Absences</h2>
          <p className="text-gray-500">Chargement des données...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-gray-200">
                <div className="p-4 flex items-end pt-32">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="ml-4 space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Skeleton className="h-8 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Gestion des Absences</h2>
          <p className="text-red-500">Erreur lors du chargement des données</p>
        </div>
        <Card className="p-6 text-center">
          <CardContent>
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Gestion des Absences</h2>
        <p className="text-gray-500">Gérez et suivez les absences des formateurs</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="max-w-[200px]">
            <SelectValue placeholder="Type d'absence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="Congé maladie">Congé maladie</SelectItem>
            <SelectItem value="Congé annuel">Congé annuel</SelectItem>
            <SelectItem value="Formation">Formation</SelectItem>
            <SelectItem value="Congé sans solde">Congé sans solde</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredPeople.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-gray-500">Aucune absence ne correspond à vos critères de recherche.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person) => (
            <Card key={person.id} className="overflow-hidden">
              <div className="relative h-48 bg-gradient-to-b from-blue-400 to-blue-600">
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end">
                  <Avatar className="h-20 w-20 border-4 border-white">
                    <AvatarImage src={person.image} alt={person.name} />
                    <AvatarFallback>{person.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 text-white">
                    <h3 className="text-xl font-bold">{person.name}</h3>
                    <p>{person.department}</p>
                  </div>
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Type d'absence:</span>
                    <Badge
                      variant="outline"
                      className={
                        person.absenceType === "Congé maladie"
                          ? "border-red-200 text-red-800 bg-red-50"
                          : person.absenceType === "Formation"
                          ? "border-blue-200 text-blue-800 bg-blue-50"
                          : "border-green-200 text-green-800 bg-green-50"
                      }
                    >
                      {person.absenceType}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Période:</span>
                    <span className="text-sm font-medium">
                      {formatDateRange(person.startDate, person.endDate)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewAbsence(person)}
                >
                  Voir détails
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleValidateAbsence(person)}
                  >
                    Valider
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRejectAbsence(person)}
                  >
                    Rejeter
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export { AbsencesPage }
