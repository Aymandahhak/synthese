import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Check, MapPin, CalendarIcon, ChevronsUpDown, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { publicApi } from "@/services/api"
import { useSessions } from "@/hooks/useSessions"
import { useToast } from "@/components/responsable-formation/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/responsable-formation/ui/card"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/responsable-formation/ui/avatar"
import { Button } from "@/components/responsable-formation/ui/button"
import { Calendar as CalendarComponent } from "@/components/responsable-formation/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/responsable-formation/ui/form"
import { Input } from "@/components/responsable-formation/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/responsable-formation/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/responsable-formation/ui/select"
import { Textarea } from "@/components/responsable-formation/ui/textarea"
import { Label } from "@/components/responsable-formation/ui/label"
import { useFormations } from "@/hooks/useFormations"

// Sample data for trainers
const trainers = [
  {
    id: "1",
    name: "Hannah Laurent",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-6UteJvjmo7I9YCqO5hu0HHO1qGVjpm.png",
    expertise: "Marketing Digital",
  },
  {
    id: "2",
    name: "Thomas Martin",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-6UteJvjmo7I9YCqO5hu0HHO1qGVjpm.png",
    expertise: "Développement Web",
  },
  {
    id: "3",
    name: "Sophie Dubois",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-6UteJvjmo7I9YCqO5hu0HHO1qGVjpm.png",
    expertise: "Ressources Humaines",
  },
  {
    id: "4",
    name: "Jean Petit",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-6UteJvjmo7I9YCqO5hu0HHO1qGVjpm.png",
    expertise: "Finance",
  },
]

// Sample data for locations
const locations = [
  { id: "1", name: "Salle de conférence A", capacity: 30 },
  { id: "2", name: "Salle de formation B", capacity: 20 },
  { id: "3", name: "Amphithéâtre C", capacity: 100 },
  { id: "4", name: "Salle de réunion D", capacity: 15 },
]

// Sample data for themes
const themes = [
  { id: "1", name: "Développement personnel" },
  { id: "2", name: "Marketing digital" },
  { id: "3", name: "Gestion de projet" },
  { id: "4", name: "Ressources humaines" },
  { id: "5", name: "Finance et comptabilité" },
]

export default function PlanifierSessionForm() {
  const { toast: useToastToast } = useToast();
  const { formations, loading: formationsLoading } = useFormations();
  const navigate = useNavigate();
  const { refreshSessions } = useSessions() || { refreshSessions: () => {} };
  
  const [selectedTrainers, setSelectedTrainers] = useState([]);
  const [sessionDate, setSessionDate] = useState(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formateurs, setFormateurs] = useState([
    { id: 1, name: "Mohammed Alaoui" },
    { id: 2, name: "Fatima Zahra Bennis" },
    { id: 3, name: "Ahmed Tazi" },
    { id: 4, name: "Laila Kadiri" },
  ]);

  const [formData, setFormData] = useState({
    formation_id: "",
    titre: "",
    description: "",
    date_debut: "",
    date_fin: "",
    lieu: "",
    capacite_max: 20,
    salle: "",
    equipement: "",
    details_hebergement: "",
    details_restauration: "",
    formateur_animateur_id: "",
  });

  const form = useForm({
    defaultValues: {
      title: "",
      theme: "",
      location: "",
      resources: "",
    },
  });

  // Effect to validate form data
  useEffect(() => {
    const errors = {};
    
    if (!form.getValues().title) {
      errors.title = "Le titre est requis";
    }
    
    if (!form.getValues().theme) {
      errors.theme = "Le thème est requis";
    }
    
    if (!form.getValues().location) {
      errors.location = "Le lieu est requis";
    }
    
    if (selectedTrainers.length === 0) {
      errors.trainers = "Sélectionnez au moins un formateur";
    }
    
    // Time validation
    if (startTime && endTime) {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
        errors.time = "L'heure de fin doit être après l'heure de début";
      }
    }
    
    setValidationErrors(errors);
  }, [form, selectedTrainers, startTime, endTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If formation_id changes, populate the session with formation info
    if (name === 'formation_id' && value) {
      const selectedFormation = formations.find(f => f.id.toString() === value.toString());
      if (selectedFormation) {
        setFormData(prev => ({
          ...prev,
          titre: `Session: ${selectedFormation.titre}`,
          description: selectedFormation.description || "",
          lieu: selectedFormation.lieu || "",
          capacite_max: selectedFormation.capacite_max || 20,
        }));
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Veuillez corriger les erreurs de validation");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get selected trainer info
      const selectedTrainerInfo = trainers.filter(trainer => selectedTrainers.includes(trainer.id));
      try {
        const selectedLocation = locations.find(loc => loc.id === formData.location);
        const selectedTheme = themes.find(theme => theme.id === formData.theme);

        // Format date to ISO string for API
        const formattedDate = format(sessionDate, 'yyyy-MM-dd');

        // Combine all form data
        const sessionData = {
          titre: formData.titre || form.getValues().title,
          theme_id: formData.theme || form.getValues().theme,
          theme_name: selectedTheme?.name || "",
          formateur_id: selectedTrainers[0], // For now, just use the first selected trainer
          formateur_nom: selectedTrainerInfo[0]?.name || "",
          lieu: selectedLocation?.name || form.getValues().location || "",
          ressources: formData.resources || form.getValues().resources || "",
          date: formattedDate,
          heure_debut: startTime,
          heure_fin: endTime,
          statut: "planifiee"
        };

        console.log("Preparing to submit session data:", sessionData);

        try {
          setIsLoading(true);
          
          // Send API request
          const response = await publicApi.createSession(sessionData);
          
          toast.success("Session planifiée", {
            description: `La session "${formData.titre}" a été créée avec succès.`
          });
          
          // Refresh sessions data
          if (refreshSessions) {
            refreshSessions();
          }

          // Reset form
          form.reset();
          setSelectedTrainers([]);
          setSessionDate(new Date());
          setStartTime("09:00");
          setEndTime("17:00");
          
          // Redirect to sessions list after a short delay
          setTimeout(() => {
            navigate('/profile/sessions');
          }, 1500);
        } catch (error) {
          console.error("Error in session form submission:", error);
          toast.error("Erreur lors de la soumission du formulaire de session");
        } finally {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error preparing session data:", error);
        toast.error("Erreur lors de la préparation des données de session");
      }
    } catch (error) {
      console.error("Error getting trainer info:", error);
      toast.error("Erreur lors de la récupération des informations du formateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTrainer = (trainerId) => {
    setSelectedTrainers((prev) =>
      prev.includes(trainerId) ? prev.filter((id) => id !== trainerId) : [...prev, trainerId],
    );
  };

  // Filter only validated formations
  const validatedFormations = formations.filter(f => f.statut === 'validated');

  if (formationsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#e0e5ce] border-t-[#415444] mx-auto"></div>
          <p className="text-gray-600">Chargement des formations...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Planifier une Session de Formation</CardTitle>
        <CardDescription>
          Configurez les détails d'une nouvelle session pour une formation existante
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="formation_id">Formation *</Label>
            <Select 
              value={formData.formation_id} 
              onValueChange={(value) => handleSelectChange('formation_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une formation" />
              </SelectTrigger>
              <SelectContent>
                {validatedFormations.length > 0 ? (
                  validatedFormations.map((formation) => (
                    <SelectItem key={formation.id} value={formation.id.toString()}>
                      {formation.titre}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>
                    Aucune formation validée disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre de la session *</Label>
              <Input
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="ex: Session 1: Développement Web Avancé"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lieu">Lieu *</Label>
              <Input
                id="lieu"
                name="lieu"
                value={formData.lieu}
                onChange={handleChange}
                placeholder="ex: Centre de Formation OFPPT, Casablanca"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date_debut">Date de début *</Label>
              <Input
                id="date_debut"
                name="date_debut"
                type="date"
                value={formData.date_debut}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date_fin">Date de fin *</Label>
              <Input
                id="date_fin"
                name="date_fin"
                type="date"
                value={formData.date_fin}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacite_max">Capacité maximale</Label>
              <Input
                id="capacite_max"
                name="capacite_max"
                type="number"
                min="1"
                value={formData.capacite_max}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salle">Salle</Label>
              <Input
                id="salle"
                name="salle"
                value={formData.salle}
                onChange={handleChange}
                placeholder="ex: Salle 101"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equipement">Équipement</Label>
              <Input
                id="equipement"
                name="equipement"
                value={formData.equipement}
                onChange={handleChange}
                placeholder="ex: Ordinateurs, Vidéoprojecteur"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="formateur_animateur_id">Formateur Animateur</Label>
              <Select 
                value={formData.formateur_animateur_id} 
                onValueChange={(value) => handleSelectChange('formateur_animateur_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un formateur" />
                </SelectTrigger>
                <SelectContent>
                  {formateurs.map((formateur) => (
                    <SelectItem key={formateur.id} value={formateur.id.toString()}>
                      {formateur.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez le contenu et les objectifs de cette session..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="details_hebergement">Détails d'hébergement</Label>
              <Textarea
                id="details_hebergement"
                name="details_hebergement"
                value={formData.details_hebergement}
                onChange={handleChange}
                placeholder="Informations sur l'hébergement des participants..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details_restauration">Détails de restauration</Label>
              <Textarea
                id="details_restauration"
                name="details_restauration"
                value={formData.details_restauration}
                onChange={handleChange}
                placeholder="Informations sur la restauration..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-[#415444] hover:bg-[#415444]/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Création en cours...
                </>
              ) : (
                "Planifier la Session"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
