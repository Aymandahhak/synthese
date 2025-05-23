import { useState, useEffect, useCallback } from "react"
import { BarChart, Bell, Calendar, CheckSquare, FileText, Home, ListChecks, LogOut, Search, UserX } from "lucide-react"
import { Badge } from "@/components/responsable-formation/ui/badge"
import { Button } from "@/components/responsable-formation/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/responsable-formation/ui/card"
import { useNavigate, Link } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/responsable-formation/ui/dialog"
import CreateFormationForm from "@/components/responsable-formation/CreateFormationForm"
import { useProfile } from "@/hooks/useProfile"
import { useFormations } from "@/hooks/useFormations"
import { publicApi } from "@/services/api"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/responsable-formation/ui/alert"
import { useTheme } from "@/contexts/ThemeContext"
import { format, addDays } from "date-fns"
import { CheckCircle } from "lucide-react"

// Component to render individual dashboard cards
const DashboardCard = ({ title, description, icon, link, image }) => {
  // Check if the image is a video file
  const isVideo = image && image.endsWith('.mp4');

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {/* Conditionally render video or image based on file type */}
        {image && isVideo ? (
          <video
            src={image}
            className="w-full h-32 object-cover mb-4 rounded-md"
            autoPlay
            muted
            loop
          />
        ) : (
          image && <img src={image} alt={title} className="w-full h-32 object-cover mb-4 rounded-md" />
        )}
        <CardDescription className="text-xs text-gray-500">{description}</CardDescription>
        <Button asChild variant="link" className="p-0 h-auto text-[#415444] hover:underline">
          <Link to={link}>Accéder</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [formationsData, setFormationsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState({
    isSubmitting: false,
    success: false,
    error: null
  });

  // Fetch profile and formations data
  const { profile, loading: profileLoading, error: profileError, refreshProfile } = useProfile();
  const { formations, loading: formationsLoading, error: formationsError, refreshFormations: refreshFormationsHook } = useFormations();

  // Function to refresh formations data
  const refreshFormations = useCallback(() => {
    setIsLoading(true);
    fetchFormations();
    refreshFormationsHook();
  }, [refreshFormationsHook]);

  // Handle form submission
  const handleFormSubmit = useCallback(async (formData) => {
    setSubmissionStatus({
      isSubmitting: true,
      success: false,
      error: null
    });

    try {
      console.log("Submitting formation:", formData);
      
      // Call API to create formation with the enhanced API service
      const response = await publicApi.createFormation(formData);

      console.log("Formation creation response:", response);

      // If successful, update state and display success message
      if (response && (response.id || response.data?.id)) {
        const formationData = response.data || response;
        
        setSubmissionStatus({
          isSubmitting: false,
          success: true,
          error: null
        });

        // Show success message with details
        toast.success(`Formation "${formationData.titre || formData.titre}" créée avec succès`, {
          description: `La formation a été ajoutée avec le statut: ${formationData.statut || 'validée'}`,
          position: 'top-center',
          duration: 5000,
          action: {
            label: 'Voir Détails',
            onClick: () => navigate(`/profile/formations/${formationData.id}`)
          }
        });

        // Close dialog and refresh formations
        setTimeout(() => {
          setIsCreateFormOpen(false);
          refreshFormations();
          refreshProfile();
        }, 1500);

        return response;
      } else {
        // Show error for unexpected response format
        throw new Error("Format de réponse inattendu");
      }
    } catch (error) {
      console.error("Error creating formation:", error);

      // Error handling with detailed message
      let errorMessage = error?.response?.data?.message ||
        error.message ||
        "Une erreur est survenue lors de la création de la formation.";

      setSubmissionStatus({
        isSubmitting: false,
        success: false,
        error: errorMessage
      });

      // Show error with details
      toast.error("Échec de création", {
        description: errorMessage,
        position: 'top-center',
        duration: 7000
      });

      // If there are field-specific errors, show them too
      if (error?.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach(message => {
              toast.error(`Erreur dans le champ ${field}`, {
                description: message,
                duration: 5000
              });
            });
          }
        });
      }

      return null;
    }
  }, [refreshFormations, refreshProfile, navigate]);

  // Function to fetch formations directly from API
  const fetchFormations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await publicApi.getFormations();
      if (result && result.data) {
        setFormationsData(Array.isArray(result.data) ? result.data : []);
      } else {
        // Fallback to empty array if no data
        setFormationsData([]);
      }
    } catch (error) {
      console.error("Error fetching formations:", error);
      setError("Erreur lors du chargement des formations. Veuillez réessayer plus tard.");
      toast.error("Erreur de chargement", {
        description: "Impossible de charger les formations. Veuillez rafraîchir la page."
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch of formations
  useEffect(() => {
    fetchFormations();
  }, [fetchFormations]);

  // Add createSampleFormation function to seed data
  const createSampleFormation = async () => {
    try {
      setIsLoading(true);
      
      // Sample formation data
      const sampleFormations = [
        {
          titre: "Développement Web Moderne",
          description: "Formation complète sur les technologies web modernes incluant HTML5, CSS3, JavaScript, React et Node.js.",
          date_debut: format(new Date(), 'yyyy-MM-dd'),
          date_fin: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
          lieu: "Centre de Formation OFPPT - Casablanca",
          capacite_max: 25,
          image: "/images/hero.png" // Using existing image in public folder
        },
        {
          titre: "Formation des Formateurs Pédagogiques",
          description: "Techniques avancées de pédagogie et d'enseignement pour les formateurs de l'OFPPT.",
          date_debut: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
          date_fin: format(addDays(new Date(), 21), 'yyyy-MM-dd'),
          lieu: "Centre Développement Compétences - Rabat",
          capacite_max: 20,
          image: "/images/dark.png" // Using existing image in public folder
        }
      ];

      // Create each sample formation
      for (const formationData of sampleFormations) {
        // Use FormData to handle file upload simulation
        const formData = new FormData();
        Object.entries(formationData).forEach(([key, value]) => {
          formData.append(key, value);
        });

        // If we have a real image file path, we could add it here
        // For now, using existing images in the public folder
        
        // Create formation using the API
        await publicApi.createFormation(formData);
      }

      // Refresh formations list after creating samples
      toast.success("Formations d'exemple créées avec succès!");
      refreshFormations();
      refreshProfile();
    } catch (error) {
      console.error("Error creating sample formations:", error);
      toast.error("Erreur lors de la création des formations d'exemple", {
        description: error.message || "Veuillez réessayer plus tard."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle loading state
  if ((profileLoading || isLoading) && !error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#e0e5ce] border-t-[#415444] mx-auto"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || profileError) {
    return (
      <Alert variant="destructive" className="mb-8">
        <AlertTitle>Erreur de chargement</AlertTitle>
        <AlertDescription>
          {error || profileError || "Une erreur est survenue lors du chargement des données."}
          <div className="mt-4">
            <Button onClick={() => {
              refreshFormations();
              refreshProfile();
            }}>
              Réessayer
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Combine and format all formations data
  const allFormations = formationsData.length > 0 ? formationsData :
    (Array.isArray(formations) ? formations : []);

  // Add fallback formations for display when API fails
  const fallbackFormations = [
    {
      id: 1,
      name: "Développement Web",
      description: "Formation aux technologies web modernes",
      status: "validee", 
      image: "/images/hero.png",
      date_debut: "2023-12-01",
      date_fin: "2023-12-31",
    },
    {
      id: 2,
      name: "Intelligence Artificielle",
      description: "Initiation à l'IA et au machine learning",
      status: "en_attente_validation",
      image: "/logo-ofppt-1.jpg",
      date_debut: "2024-01-15",
      date_fin: "2024-02-15", 
    }
  ];

  // Modify the formattedFormations line to include fallback
  const formattedFormations = allFormations.length > 0 ? allFormations.map(formation => ({
    id: formation.id,
    name: formation.titre || formation.name,
    status: formation.statut || formation.status,
    image: formation.image || "/logo-ofppt-1.jpg", // Default image fallback
    description: formation.description || "",
    date_debut: formation.date_debut || "",
    date_fin: formation.date_fin || ""
  })) : fallbackFormations;

  return (
    <>
      {/* Added Logo Image with rotation */}
      <div className="flex justify-center mb-4">
        <img
          src="/logo-ofppt-1.jpg"
          alt="OFPPT Logo"
          className="h-16 logo-rotate"
        />
      </div>

      {/* Statistics Section */}
      {profile?.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className={theme === 'dark' ? "bg-gray-800" : "bg-[#e0e5ce]/30"}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Formations actives</p>
                <h3 className="mt-2 text-3xl font-bold">{profile.statistics.active_formations}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? "bg-gray-800" : "bg-[#e0e5ce]/30"}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Validations en attente</p>
                <h3 className="mt-2 text-3xl font-bold">{profile.statistics.pending_validations}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? "bg-gray-800" : "bg-[#e0e5ce]/30"}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Formations terminées</p>
                <h3 className="mt-2 text-3xl font-bold">{profile.statistics.completed_formations}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className={theme === 'dark' ? "bg-gray-800" : "bg-[#e0e5ce]/30"}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Formateurs en formation</p>
                <h3 className="mt-2 text-3xl font-bold">{profile.statistics.formateurs_en_formation}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video Section with Créer Formation button */}
        <div className="relative overflow-hidden rounded-[24px] h-[250px] border border-[#415444]/10 group">
          <video
            className="absolute inset-0 w-full h-full object-cover z-0"
            src="/formation.mp4"
            autoPlay
            muted
            loop
          ></video>
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white text-center p-6">
            <h3 className="text-4xl font-extrabold text-white !text-white mb-4 leading-tight tracking-tight">
              Créez vos Formations
            </h3>



            <p className="mb-6 max-w-md text-sm">
              Créez de nouvelles formations personnalisées pour répondre aux besoins spécifiques de votre équipe.
            </p>
            <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black/50 hover:bg-black/70 border-2 border-white rounded-md px-6 py-2">
                  Créer Formation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Créer une Nouvelle Formation</DialogTitle>
                  <DialogDescription>
                    Remplissez les détails ci-dessous pour créer une nouvelle formation.
                  </DialogDescription>
                </DialogHeader>

                {submissionStatus.error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{submissionStatus.error}</AlertDescription>
                  </Alert>
                )}

                {submissionStatus.success && (
                  <Alert variant="success" className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <AlertTitle>Succès!</AlertTitle>
                    <AlertDescription>La formation a été créée avec succès!</AlertDescription>
                  </Alert>
                )}

                <CreateFormationForm
                  onSubmit={handleFormSubmit}
                  isSubmitting={submissionStatus.isSubmitting}
                  onClose={() => setIsCreateFormOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Video Section with Planifier Session button */}
        <div className="relative overflow-hidden rounded-[24px] h-[250px] border border-[#415444]/10 group">
          <video
            className="absolute inset-0 w-full h-full object-cover z-0"
            src="/ses.mp4"
            autoPlay
            muted
            loop
          ></video>
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white text-center p-6">
            <h3 className="text-3xl font-bold text-white !text-white mb-2">Planifiez vos sessions</h3>
            <p className="mb-6 max-w-md text-sm">
              Organisez et gérez efficacement vos sessions de formation.
            </p>
            <Button
              className="bg-black/50 hover:bg-black/70 border-2 border-white rounded-md px-6 py-2"
              onClick={() => navigate("/profile/sessions")}
            >
              Voir les Sessions
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      {profile?.recentActivity && profile.recentActivity.length > 0 && (
        <>
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Activités Récentes</h3>
          </div>

          <div className="mb-8">
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {profile.recentActivity.map((activity, index) => (
                    <li key={index} className="flex items-center p-4">
                      <div className="h-10 w-10 rounded-full bg-[#e0e5ce] flex items-center justify-center mr-4">
                        <Calendar className="h-5 w-5 text-[#415444]" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.description} - {activity.date}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-2xl font-semibold">Liste des Formations</h3>
        <Button variant="outline" onClick={refreshFormations} className="mr-2">
          Rafraîchir
        </Button>
      </div>

      {formattedFormations.length === 0 ? (
        <Card className="p-8 text-center mb-8">
          <CardTitle className="mb-2">Aucune formation disponible</CardTitle>
          <CardDescription className="mb-4">
            Vous n'avez pas encore créé de formations. Commencez par en créer une nouvelle ou utilisez nos exemples.
          </CardDescription>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => setIsCreateFormOpen(true)}
              className="bg-[#415444] hover:bg-[#415444]/90"
            >
              Créer une Formation
            </Button>
            <Button
              onClick={createSampleFormation}
              variant="outline"
              className="border-[#415444] text-[#415444] hover:bg-[#415444] hover:text-white"
            >
              Créer des Exemples
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formattedFormations.map((formation) => (
            <Card
              key={formation.id}
              className={`group border-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-[#e0e5ce]'} rounded-[24px] overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              <CardHeader className="p-0 relative">
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 z-10" />
                <Button
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 transform scale-95 transition-all group-hover:opacity-100 group-hover:scale-100 bg-white text-black hover:bg-white/90"
                  onClick={() => navigate(`/profile/formations/${formation.id}`)}
                >
                  Voir Détails
                </Button>
                <img
                  src={formation.image || "/placeholder.svg"}
                  alt={formation.name}
                  className="h-[280px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h4 className="text-lg font-semibold mb-1 line-clamp-1">{formation.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{formation.description}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formation.date_debut} - {formation.date_fin}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge
                      variant="outline"
                      className={
                        formation.status === "validated" || formation.status === "validee"
                          ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200 dark:bg-green-900 dark:text-green-100"
                          : formation.status === "pending" || formation.status === "en_attente_validation"
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200 dark:bg-red-900 dark:text-red-100"
                      }
                    >
                      {formation.status === "validated" || formation.status === "validee"
                        ? "Validée"
                        : formation.status === "pending" || formation.status === "en_attente_validation"
                          ? "En attente"
                          : "Annulée"}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-[#415444] hover:text-white'} transition-colors`}
                    onClick={() => navigate(`/profile/formations/${formation.id}`)}
                  >
                    Voir Détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

export default Dashboard