import { useState, useEffect, useCallback } from "react"
import { BarChart, Bell, Calendar, CheckSquare, FileText, Home, ListChecks, LogOut, Search, UserX, CheckCircle, Wifi, WifiOff, AlertTriangle, XCircle } from "lucide-react"
import { Badge } from "@/components/responsable-formation/ui/badge"
import { Button } from "@/components/responsable-formation/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/responsable-formation/ui/card"
import { useNavigate, Link } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/responsable-formation/ui/dialog"
import CreateFormationForm from "@/components/responsable-formation/CreateFormationForm"
import { useProfile } from "@/hooks/useProfile"
import { useFormations } from "@/hooks/useFormations"
import { publicApi, createFormation, testApiConnection } from "@/services/api"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/responsable-formation/ui/alert"
import { useTheme } from "@/contexts/ThemeContext"
import { format, addDays } from "date-fns"

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
  const [apiStatus, setApiStatus] = useState({
    connected: false,
    checking: true,
    message: "Vérification de la connexion à l'API..."
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
    details: ""
  });

  // Fetch profile and formations data
  const { profile, loading: profileLoading, error: profileError, refreshProfile } = useProfile();
  const { formations, loading: formationsLoading, error: formationsError, refreshFormations: refreshFormationsHook } = useFormations();

  // Function to fetch formations directly from API
  const fetchFormations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching formations from API...");
      const result = await publicApi.getFormations();
      console.log("Formations API response:", result);
      
      if (result && result.data) {
        // Format and store the formations
        const formattedData = Array.isArray(result.data) ? result.data.map(formation => ({
          id: formation.id,
          name: formation.titre || formation.name,
          status: formation.statut || formation.status,
          image: formation.image || "/logo-ofppt-1.jpg",
          description: formation.description || "",
          date_debut: formation.date_debut || "",
          date_fin: formation.date_fin || "",
        })) : [];
        
        console.log("Formatted formations:", formattedData);
        setFormationsData(formattedData);
      } else {
        // Fallback to empty array if no data
        console.warn("No formation data returned, using empty array");
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

  // Enhanced refresh function that ensures formations are updated
  const refreshFormations = useCallback(() => {
    console.log("Refreshing formations...");
    setIsLoading(true);
    
    // Clear any previous formations to avoid stale data
    setFormationsData([]);
    
    // Wait a short time before fetching (gives API time to update)
    setTimeout(() => {
      fetchFormations();
      // Also refresh formations hook if available
      if (refreshFormationsHook) {
        refreshFormationsHook();
      }
    }, 500);
  }, [fetchFormations, refreshFormationsHook]);

  // Check API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        setApiStatus({
          connected: false,
          checking: true,
          message: "Vérification de la connexion à l'API..."
        });
        
        // Simple fetch to check if the API is reachable
        const response = await fetch("http://localhost:8000/api/test", { 
          method: "GET",
          headers: { "Accept": "application/json" },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        }).catch(() => null);
        
        if (response && response.ok) {
          setApiStatus({
            connected: true,
            checking: false,
            message: "Connecté à l'API Laravel"
          });
        } else {
          setApiStatus({
            connected: false,
            checking: false,
            message: "Non connecté à l'API Laravel - Mode démo activé"
          });
          console.warn("API Laravel non disponible. Mode démo activé.");
        }
      } catch (error) {
        setApiStatus({
          connected: false,
          checking: false,
          message: "Erreur de connexion à l'API Laravel - Mode démo activé"
        });
        console.error("Erreur lors de la vérification de l'API:", error);
      }
    };
    
    checkApiConnection();
  }, []);

  // Add a direct formation creation function with better error handling
  const directCreateFormation = async (formData) => {
    // Show toast that we're trying to create the formation
    toast({
      title: "Création directe en cours...",
      description: "Tentative de création avec méthode alternative"
    });
    
    try {
      // Convert FormData to simple object
      const formValues = {};
      
      if (formData instanceof FormData) {
        for (const [key, value] of formData.entries()) {
          formValues[key] = value;
        }
      } else {
        Object.assign(formValues, formData);
      }
      
      // Add required fields if missing
      if (!formValues.responsable_id) {
        formValues.responsable_id = 1;
      }
      if (!formValues.statut) {
        formValues.statut = 'en_attente_validation';
      }
      
      // Make a direct API call
      const response = await fetch('http://localhost:8000/diagnostic-create-formation?' + 
        new URLSearchParams({
          titre: formValues.titre || 'Formation sans titre',
          description: formValues.description || 'Formation sans description',
          date_debut: formValues.date_debut || '2025-06-01',
          date_fin: formValues.date_fin || '2025-06-30',
          lieu: formValues.lieu || 'Non spécifié',
          capacite_max: formValues.capacite_max || 20
        }).toString()
      );
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Formation créée avec succès",
          description: "Méthode de diagnostic alternative réussie",
          variant: "success"
        });
        
        // Refresh formations
        refreshFormations();
        return data.formation;
      } else {
        console.error("Diagnostic error:", data);
        toast({
          title: "Erreur de diagnostic",
          description: data.message + (data.error ? ': ' + data.error : ''),
          variant: "destructive"
        });
        throw new Error(data.message || "Diagnostic error");
      }
    } catch (error) {
      console.error("Direct creation error:", error);
      toast({
        title: "Erreur de création directe",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Handle form submission
  const handleFormSubmit = useCallback(async (formData) => {
    setSubmissionStatus({
      isSubmitting: true,
      success: false,
      error: null
    });

    try {
      console.log("Submitting formation:", formData);
      
      // Show toast that we're trying to create the formation
      toast({
        title: "Création en cours...",
        description: "Tentative de création de la formation"
      });
      
      // Try to create formation
      let response = null;
      let creationError = null;
      try {
        // Call API to create formation with the imported function
        response = await createFormation(formData);
        console.log("Formation creation response:", response);
      } catch (error) {
        console.error("Error creating formation:", error);
        creationError = error;
        
        // Try direct method as fallback
        try {
          console.log("Trying direct creation method as fallback...");
          toast({
            title: "Tentative alternative",
            description: "Essai d'une méthode alternative de création"
          });
          
          response = await directCreateFormation(formData);
          console.log("Direct creation response:", response);
          
          // If we got here, the direct method worked!
          creationError = null;
        } catch (directError) {
          console.error("Direct creation failed too:", directError);
          
          // Keep original error if we have one
          if (!creationError) {
            creationError = directError;
          }
        }
      }
      
      // If we still have an error after trying both methods
      if (creationError) {
        setError(`Erreur lors de la création: ${creationError.message}`);
        
        // Show toast for creation error
        toast({
          title: "Échec de création",
          description: creationError.message || "Le serveur a rencontré une erreur interne",
          variant: "destructive"
        });
        
        // Set error notification banner
        setNotification({
          show: true,
          type: "error",
          message: "Échec de la création de formation",
          details: creationError.message || "Le serveur a rencontré une erreur interne (500). Réessayez plus tard."
        });
        
        // Auto hide after 10 seconds
        setTimeout(() => {
          setNotification(prev => ({...prev, show: false}));
        }, 10000);
        
        // Close dialog on error after a short delay
        setTimeout(() => {
          setIsCreateFormOpen(false);
        }, 2000);
        
        return;
      }

      // Always refresh formations regardless of response
      try {
        console.log("Refreshing formations after creation attempt...");
        await fetchFormations();
      } catch (refreshError) {
        console.error("Error refreshing formations:", refreshError);
      }

      // Set success/error status
      if (response && (response.id || response.data?.id)) {
        setSubmissionStatus({
          isSubmitting: false,
          success: true,
          error: null
        });
        
        // Show success toast
        toast({
          title: "Formation créée avec succès",
          description: `La formation "${formData.get ? formData.get('titre') : formData.titre}" a été ajoutée à la liste`,
          variant: "success"
        });
        
        // Display success notification banner
        setNotification({
          show: true,
          type: "success",
          message: "Formation créée avec succès",
          details: `La formation "${formData.get ? formData.get('titre') : formData.titre}" a été ajoutée`
        });
        
        // Auto hide after 7 seconds
        setTimeout(() => {
          setNotification(prev => ({...prev, show: false}));
        }, 7000);
        
        // Close the form and show success message
        setIsCreateFormOpen(false);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSubmissionStatus({
            isSubmitting: false,
            success: false,
            error: null
          });
        }, 5000);
      } else {
        // Still close the form if we refreshed formations successfully
        if (!error) {
          setIsCreateFormOpen(false);
          
          // Show warning notification
          setNotification({
            show: true,
            type: "warning",
            message: "État de la création incertain",
            details: "La formation a peut-être été créée, mais nous n'avons pas reçu de confirmation. Vérifiez la liste des formations."
          });
          
          // Auto hide after 8 seconds
          setTimeout(() => {
            setNotification(prev => ({...prev, show: false}));
          }, 8000);
          
          setTimeout(() => {
            setSubmissionStatus({
              isSubmitting: false,
              success: false,
              error: null
            });
          }, 5000);
        } else {
          setSubmissionStatus({
            isSubmitting: false,
            success: false,
            error: "Création de formation échouée"
          });
          
          // Show error notification
          setNotification({
            show: true,
            type: "error",
            message: "Création de formation échouée",
            details: error || "Une erreur serveur s'est produite. Veuillez réessayer plus tard."
          });
          
          // Auto hide after 10 seconds
          setTimeout(() => {
            setNotification(prev => ({...prev, show: false}));
          }, 10000);
        }
      }
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
      setSubmissionStatus({
        isSubmitting: false,
        success: false,
        error: error.message || "Erreur lors de la création de la formation"
      });
      
      // Show error notification
      setNotification({
        show: true,
        type: "error",
        message: "Erreur de création de formation",
        details: error.message || "Une erreur inattendue s'est produite"
      });
      
      // Auto hide after 10 seconds
      setTimeout(() => {
        setNotification(prev => ({...prev, show: false}));
      }, 10000);
    }
  }, [fetchFormations, error, directCreateFormation]);

  // Initial fetch of formations
  useEffect(() => {
    fetchFormations();
  }, [fetchFormations]);

  // Add createSampleFormation function to seed data
  const createSampleFormation = async () => {
    try {
      setIsLoading(true);
      
      // Call the seed endpoint
      toast("Initialisation des formations...", {
        description: "Suppression des formations existantes et création de nouvelles formations d'exemple",
        duration: 3000
      });
      
      const response = await fetch("http://localhost:8000/seed-formations");
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Formations réinitialisées",
          description: `${data.count} formations d'exemple ont été créées avec succès`,
          duration: 5000
        });
        // Refresh formations list after creating samples
        refreshFormations();
        refreshProfile();
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue lors de la réinitialisation des formations",
          duration: 5000,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating sample formations:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de communiquer avec le serveur pour réinitialiser les formations",
        duration: 5000,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add database fix function
  const fixDatabaseIssues = async () => {
    try {
      setIsLoading(true);
      
      toast("Vérification de la base de données...", {
        description: "Tentative de réparation des problèmes courants"
      });
      
      // First run database-fix endpoint
      const dbFixResponse = await fetch("http://localhost:8000/database-fix");
      const dbFixData = await dbFixResponse.json();
      
      console.log("Database fix response:", dbFixData);
      
      // Then fix Sanctum specifically
      toast("Réparation de Sanctum...", {
        description: "Création de la table d'authentification"
      });
      
      try {
        const sanctumResponse = await fetch("http://localhost:8000/fix-sanctum");
        const sanctumData = await sanctumResponse.json();
        console.log("Sanctum fix response:", sanctumData);
        
        if (sanctumData.status === 'success') {
          toast({
            title: "Sanctum réparé",
            description: "Authentification réparée avec succès",
            duration: 3000
          });
        }
      } catch (sanctumError) {
        console.error("Sanctum fix error:", sanctumError);
      }
      
      // Then run general migrations
      toast("Exécution des migrations...", {
        description: "Mise à jour de la structure de la base de données"
      });
      
      try {
        const migrateResponse = await fetch("http://localhost:8000/run-migrations");
        const migrateData = await migrateResponse.json();
        console.log("Migrations response:", migrateData);
      } catch (migrateError) {
        console.error("Migration error:", migrateError);
        toast({
          title: "Erreur de migration",
          description: "Impossible d'exécuter les migrations, mais certaines réparations ont pu réussir",
          variant: "destructive",
          duration: 5000
        });
      }
      
      if (dbFixData.status === 'success') {
        // Check if any fixes were applied
        if (dbFixData.fixes && dbFixData.fixes.length > 0) {
          toast({
            title: "Base de données réparée",
            description: `${dbFixData.fixes.length} problème(s) résolus. Veuillez réessayer de créer une formation.`,
            duration: 5000
          });
        } else {
          toast({
            title: "Base de données vérifiée",
            description: "Aucun problème détecté nécessitant une réparation.",
            duration: 5000
          });
        }
      } else {
        toast({
          title: "Problèmes non résolus",
          description: "Certains problèmes n'ont pas pu être résolus automatiquement.",
          variant: "destructive",
          duration: 5000
        });
      }
      
      // Always refresh formations after database fix attempt
      refreshFormations();
      refreshProfile();
    } catch (error) {
      console.error("Error fixing database:", error);
      toast({
        title: "Erreur",
        description: "Impossible de communiquer avec le serveur pour réparer la base de données",
        variant: "destructive",
        duration: 5000
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
  const formattedFormations = allFormations.length > 0 ? allFormations : fallbackFormations;

  return (
    <>
      {/* Notification Banner */}
      {notification.show && (
        <div className={`fixed top-0 left-0 right-0 z-50 p-4 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 
          notification.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-amber-100 text-amber-800'
        } shadow-md transition-all duration-300 ease-in-out flex items-start justify-between`}>
          <div className="flex items-start">
            {notification.type === 'success' && <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />}
            {notification.type === 'error' && <XCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />}
            {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />}
            <div>
              <div className="font-semibold">{notification.message}</div>
              <div className="text-sm">{notification.details}</div>
            </div>
          </div>
          <button 
            onClick={() => setNotification(prev => ({...prev, show: false}))}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* API Status Indicator */}
      <div className={`fixed bottom-4 right-4 z-50 px-3 py-2 rounded-full flex items-center gap-2 text-sm ${
        apiStatus.connected ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
      }`}>
        {apiStatus.checking ? (
          <div className="h-3 w-3 rounded-full bg-gray-400 animate-pulse"></div>
        ) : apiStatus.connected ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span>{apiStatus.message}</span>
      </div>

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
        <div className="flex flex-row space-x-2">
          <Button onClick={fixDatabaseIssues} variant="outline" className="mr-2 text-amber-600 border-amber-300 hover:bg-amber-50">
            Réparer Base de Données
          </Button>
          <Button onClick={createSampleFormation} variant="outline" className="mr-2">
            Réinitialiser Formations
          </Button>
          <Button variant="outline" onClick={refreshFormations}>
          Rafraîchir
        </Button>
        </div>
      </div>

      {formattedFormations.length === 0 ? (
        <Card className="p-8 text-center mb-8">
          <CardTitle className="mb-2">Aucune formation disponible</CardTitle>
          <CardDescription className="mb-4">
            Vous n'avez pas encore créé de formations. Commencez par en créer une nouvelle ou réinitialisez la base de données avec des exemples.
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
              Réinitialiser avec Exemples
            </Button>
            <Button
              onClick={fixDatabaseIssues}
              variant="outline"
              className="border-amber-400 text-amber-600 hover:bg-amber-50"
            >
              Réparer la Base de Données
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
                  src={formation.image || "/logo-ofppt-1.jpg"}
                  alt={formation.name}
                  className="h-[280px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = "/logo-ofppt-1.jpg"; // Fallback image
                  }}
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