import { useState } from "react"
import { Calendar, Car, Check, Home, MapPin } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/responsable-formation/ui/avatar"
import { Badge } from "@/components/responsable-formation/ui/badge"
import { Button } from "@/components/responsable-formation/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/responsable-formation/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/responsable-formation/ui/dialog"
import { Input } from "@/components/responsable-formation/ui/input"
import { Label } from "@/components/responsable-formation/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/responsable-formation/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/responsable-formation/ui/tabs"

// Sample data for trainers and their logistics needs
const trainers = [
  {
    id: "1",
    name: "Hannah Laurent",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-6UteJvjmo7I9YCqO5hu0HHO1qGVjpm.png",
    session: {
      id: "1",
      title: "Introduction au Marketing Digital",
      startDate: "2023-05-15T09:00:00",
      endDate: "2023-05-15T17:00:00",
      location: "Paris",
    },
    housingRequired: true,
    transportationRequired: true,
    hotel: "Hôtel Mercure Paris Centre",
    transportation: "Taxi",
    notes: "Préfère une chambre calme",
  },
  {
    id: "2",
    name: "Thomas Martin",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-6UteJvjmo7I9YCqO5hu0HHO1qGVjpm.png",
    session: {
      id: "2",
      title: "Développement Web Avancé",
      startDate: "2023-05-20T10:00:00",
      endDate: "2023-05-22T16:00:00",
      location: "Lyon",
    },
    housingRequired: true,
    transportationRequired: false,
    hotel: "",
    transportation: "",
    notes: "Allergique aux acariens",
  },
  {
    id: "3",
    name: "Sophie Dubois",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-6UteJvjmo7I9YCqO5hu0HHO1qGVjpm.png",
    session: {
      id: "3",
      title: "Gestion de Projet Agile",
      startDate: "2023-05-25T09:30:00",
      endDate: "2023-05-26T17:30:00",
      location: "Marseille",
    },
    housingRequired: false,
    transportationRequired: true,
    hotel: "",
    transportation: "",
    notes: "Préfère le train",
  },
  {
    id: "4",
    name: "Jean Petit",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-6UteJvjmo7I9YCqO5hu0HHO1qGVjpm.png",
    session: {
      id: "4",
      title: "Finance pour non-financiers",
      startDate: "2023-06-05T09:00:00",
      endDate: "2023-06-06T17:00:00",
      location: "Bordeaux",
    },
    housingRequired: true,
    transportationRequired: true,
    hotel: "",
    transportation: "",
    notes: "",
  },
]

// Sample data for hotels
const hotels = [
  { id: "1", name: "Hôtel Mercure Paris Centre", location: "Paris", rating: 4 },
  { id: "2", name: "Novotel Lyon Confluence", location: "Lyon", rating: 4 },
  { id: "3", name: "Radisson Blu Marseille", location: "Marseille", rating: 5 },
  { id: "4", name: "Ibis Styles Bordeaux", location: "Bordeaux", rating: 3 },
  { id: "5", name: "Holiday Inn Express", location: "Paris", rating: 3 },
]

// Sample data for transportation options
const transportationOptions = [
  { id: "1", name: "Taxi" },
  { id: "2", name: "Train" },
  { id: "3", name: "Avion" },
  { id: "4", name: "Voiture de location" },
  { id: "5", name: "Transport en commun" },
]

function LogisticsPage() {
  const [trainersList, setTrainersList] = useState(trainers)
  const [selectedTrainer, setSelectedTrainer] = useState(null)
  const [selectedHotel, setSelectedHotel] = useState("")
  const [selectedTransportation, setSelectedTransportation] = useState("")
  const [logisticsNotes, setLogisticsNotes] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false); // Add state for dialog

  const filteredTrainers = trainersList.filter((trainer) => {
    if (activeTab === "housing") return trainer.housingRequired
    if (activeTab === "transportation") return trainer.transportationRequired
    if (activeTab === "pending")
      return (trainer.housingRequired && !trainer.hotel) || (trainer.transportationRequired && !trainer.transportation)
    return true
  })

  const handleAssignLogistics = () => {
    if (!selectedTrainer) return

    const updatedTrainers = trainersList.map((trainer) => {
      if (trainer.id === selectedTrainer.id) {
        return {
          ...trainer,
          hotel: selectedHotel || trainer.hotel,
          transportation: selectedTransportation || trainer.transportation,
          notes: logisticsNotes || trainer.notes,
        }
      }
      return trainer
    })

    setTrainersList(updatedTrainers)
    toast.success("Logistique mise à jour", {
      description: `Les informations logistiques pour ${selectedTrainer.name} ont été mises à jour.`,
    })

    // Reset form
    setSelectedTrainer(null)
    setSelectedHotel("")
    setSelectedTransportation("")
    setLogisticsNotes("")
  }

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    // If same day
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString()}`
    }

    // Different days
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Hébergements & Logistique</h2>
          <p className="text-gray-500">Gérez les besoins d'hébergement et de transport des formateurs</p>
        </div>
        {/* Main Dialog controlled by state */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          {/* Trigger button - now just opens the dialog */}
          <Button className="bg-[#415444] hover:bg-[#415444]/90" onClick={() => setIsAssignDialogOpen(true)}>
            Assigner logistique
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assigner hébergement et transport</DialogTitle>
              <DialogDescription>Attribuez un hôtel et/ou un moyen de transport à un formateur.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="trainer">Formateur</Label>
                <Select
                  value={selectedTrainer?.id || ""}
                  onValueChange={(value) => {
                    const trainer = trainersList.find((t) => t.id === value)
                    setSelectedTrainer(trainer || null)
                    if (trainer) {
                      setSelectedHotel(trainer.hotel)
                      setSelectedTransportation(trainer.transportation)
                      setLogisticsNotes(trainer.notes)
                    }
                  }}
                >
                  <SelectTrigger id="trainer">
                    <SelectValue placeholder="Sélectionnez un formateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainersList.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name} - {trainer.session.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTrainer?.housingRequired && (
                <div className="grid gap-2">
                  <Label htmlFor="hotel">Hôtel</Label>
                  <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                    <SelectTrigger id="hotel">
                      <SelectValue placeholder="Sélectionnez un hôtel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hotels
                        .filter((hotel) => hotel.location === selectedTrainer.session.location)
                        .map((hotel) => (
                          <SelectItem key={hotel.id} value={hotel.name}>
                            {hotel.name} ({hotel.rating} ★)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedTrainer?.transportationRequired && (
                <div className="grid gap-2">
                  <Label htmlFor="transportation">Transport</Label>
                  <Select value={selectedTransportation} onValueChange={setSelectedTransportation}>
                    <SelectTrigger id="transportation">
                      <SelectValue placeholder="Sélectionnez un moyen de transport" />
                    </SelectTrigger>
                    <SelectContent>
                      {transportationOptions.map((option) => (
                        <SelectItem key={option.id} value={option.name}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={logisticsNotes}
                  onChange={(e) => setLogisticsNotes(e.target.value)}
                  placeholder="Notes spécifiques (allergies, préférences, etc.)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTrainer(null)}>
                Annuler
              </Button>
              <Button className="bg-[#415444] hover:bg-[#415444]/90" onClick={handleAssignLogistics}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="housing">Hébergement</TabsTrigger>
          <TabsTrigger value="transportation">Transport</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTrainers.map((trainer) => (
              <Card key={trainer.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={trainer.image || "/placeholder.svg"} alt={trainer.name} />
                      <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{trainer.name}</h3>
                      <p className="text-sm text-gray-500">{trainer.session.title}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {formatDateRange(trainer.session.startDate, trainer.session.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{trainer.session.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {trainer.housingRequired && (
                        <Badge
                          variant={trainer.hotel ? "default" : "outline"}
                        className={
                          trainer.hotel
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "border-yellow-300 text-yellow-800"
                        }
                        >
                          <Home className="h-3 w-3 mr-1" />
                          {trainer.hotel ? trainer.hotel : "Hébergement requis"}
                        </Badge>
                      )}

                      {trainer.transportationRequired && (
                        <Badge
                          variant={trainer.transportation ? "default" : "outline"}
                        className={
                          trainer.transportation
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : "border-yellow-300 text-yellow-800"
                        }
                        >
                          <Car className="h-3 w-3 mr-1" />
                          {trainer.transportation ? trainer.transportation : "Transport requis"}
                        </Badge>
                      )}
                    </div>
                    {trainer.notes && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                        <p className="font-medium text-xs text-gray-500 mb-1">Notes:</p>
                        {trainer.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-end">
                  {/* Modifier Button - remove Dialog/Trigger, add open state setter */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[#415444] border-[#415444]/20 hover:bg-[#e0e5ce] hover:text-[#415444] hover:border-[#415444]/30"
                    onClick={() => {
                      setSelectedTrainer(trainer)
                      setSelectedHotel(trainer.hotel)
                      setSelectedTransportation(trainer.transportation)
                      setLogisticsNotes(trainer.notes)
                      setIsAssignDialogOpen(true); // Open dialog
                    }}
                  >
                    Modifier
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="housing" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTrainers.map((trainer) => (
              <Card key={trainer.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={trainer.image || "/placeholder.svg"} alt={trainer.name} />
                      <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{trainer.name}</h3>
                      <p className="text-sm text-gray-500">{trainer.session.title}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {formatDateRange(trainer.session.startDate, trainer.session.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{trainer.session.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge
                        variant={trainer.hotel ? "default" : "outline"}
                        className={
                          trainer.hotel
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "border-yellow-300 text-yellow-800"
                        }
                        >
                        <Home className="h-3 w-3 mr-1" />
                        {trainer.hotel ? trainer.hotel : "Hébergement requis"}
                      </Badge>
                    </div>
                    {trainer.notes && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                        <p className="font-medium text-xs text-gray-500 mb-1">Notes:</p>
                        {trainer.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-end">
                  {/* Modifier Button - remove Dialog/Trigger, add open state setter */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[#415444] border-[#415444]/20 hover:bg-[#e0e5ce] hover:text-[#415444] hover:border-[#415444]/30"
                    onClick={() => {
                      setSelectedTrainer(trainer)
                      setSelectedHotel(trainer.hotel)
                      setSelectedTransportation(trainer.transportation)
                      setLogisticsNotes(trainer.notes)
                      setIsAssignDialogOpen(true); // Open dialog
                    }}
                  >
                    Modifier
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transportation" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTrainers.map((trainer) => (
              <Card key={trainer.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={trainer.image || "/placeholder.svg"} alt={trainer.name} />
                      <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{trainer.name}</h3>
                      <p className="text-sm text-gray-500">{trainer.session.title}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {formatDateRange(trainer.session.startDate, trainer.session.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{trainer.session.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge
                        variant={trainer.transportation ? "default" : "outline"}
                        className={
                          trainer.transportation
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : "border-yellow-300 text-yellow-800"
                        }
                        >
                        <Car className="h-3 w-3 mr-1" />
                        {trainer.transportation ? trainer.transportation : "Transport requis"}
                      </Badge>
                    </div>
                    {trainer.notes && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                        <p className="font-medium text-xs text-gray-500 mb-1">Notes:</p>
                        {trainer.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-end">
                  {/* Modifier Button - remove Dialog/Trigger, add open state setter */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[#415444] border-[#415444]/20 hover:bg-[#e0e5ce] hover:text-[#415444] hover:border-[#415444]/30"
                    onClick={() => {
                      setSelectedTrainer(trainer)
                      setSelectedHotel(trainer.hotel)
                      setSelectedTransportation(trainer.transportation)
                      setLogisticsNotes(trainer.notes)
                      setIsAssignDialogOpen(true); // Open dialog
                    }}
                  >
                    Modifier
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          {filteredTrainers.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <Check className="mx-auto h-12 w-12 text-green-400" />
              <p className="mt-2">Toutes les demandes logistiques sont traitées.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTrainers.map((trainer) => (
                <Card key={trainer.id} className="border-yellow-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={trainer.image || "/placeholder.svg"} alt={trainer.name} />
                        <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{trainer.name}</h3>
                        <p className="text-sm text-gray-500">{trainer.session.title}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {formatDateRange(trainer.session.startDate, trainer.session.endDate)}
                      </span>
                    </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{trainer.session.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {trainer.housingRequired && !trainer.hotel && (
                          <Badge variant="outline" className="border-yellow-300 text-yellow-800">
                            <Home className="h-3 w-3 mr-1" />
                            Hébergement requis
                          </Badge>
                        )}

                        {trainer.transportationRequired && !trainer.transportation && (
                          <Badge variant="outline" className="border-yellow-300 text-yellow-800">
                            <Car className="h-3 w-3 mr-1" />
                            Transport requis
                          </Badge>
                        )}

                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t"> {/* Added class for styling */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setSelectedTrainer(trainer)
                              setSelectedHotel(trainer.hotel)
                              setSelectedTransportation(trainer.transportation)
                              setLogisticsNotes(trainer.notes)
                            }}
                        >
                          Assigner
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LogisticsPage;
