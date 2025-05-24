import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../components/responsable-formation/theme-provider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/responsable-formation/ui/card";
import { Button } from "../../components/responsable-formation/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/responsable-formation/ui/tabs";
import { Calendar, Edit, ArrowLeft, Users, FileText, MapPin, Check, Clock, Info } from 'lucide-react';
import { Badge } from "../../components/responsable-formation/ui/badge";
import { Skeleton } from "../../components/responsable-formation/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../../components/responsable-formation/ui/alert";

// Constants
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const PUBLIC_API_URL = `${API_BASE_URL}/public`;

const FormationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        setLoading(true);
        // Set a timeout to ensure the request doesn't hang indefinitely
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        console.log(`Attempting to fetch formation with ID: ${id}`);
        
        // Try the public endpoint for individual formation first - we just added this
        const singleFormationResponse = await fetch(`${PUBLIC_API_URL}/responsable-formation/formations/${id}`, {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }).catch(error => {
          console.warn(`Network error fetching single formation: ${error.message}`);
          return null;
        });
        
        if (singleFormationResponse && singleFormationResponse.ok) {
          const data = await singleFormationResponse.json();
          if (data && data.data) {
            console.log("Formation found directly:", data.data);
            setFormation(data.data);
            return; // Exit early if we found the formation
          }
        }
        
        // If individual formation not found, try to fetch from the list of all formations
        const allFormationsResponse = await fetch(`${PUBLIC_API_URL}/responsable-formation/formations`, {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }).catch(error => {
          console.warn(`Network error fetching formations: ${error.message}`);
          return null;
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        if (allFormationsResponse && allFormationsResponse.ok) {
          const data = await allFormationsResponse.json();
          if (data && data.data) {
            // Find the formation with the matching ID
            const foundFormation = data.data.find(f => f.id === parseInt(id));
            if (foundFormation) {
              console.log("Formation found in list:", foundFormation);
              setFormation(foundFormation);
            } else {
              // Try to fetch from API test-create-formation endpoint as a fallback
              await fetchFromTestEndpoint();
            }
          } else {
            await fetchFromTestEndpoint();
          }
        } else {
          // Fallback: Try the direct API endpoint for formations
          await fetchFromTestEndpoint();
        }
      } catch (err) {
        console.error("Error fetching formation:", err);
        setError("Erreur lors du chargement des détails de la formation");
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to fetch from the test endpoint
    const fetchFromTestEndpoint = async () => {
      try {
        const testResponse = await fetch(`${API_BASE_URL}/test-create-formation`);
        if (testResponse.ok) {
          const testData = await testResponse.json();
          if (testData && testData.formation) {
            if (testData.formation.id === parseInt(id) || !id) {
              console.log("Using test formation data:", testData.formation);
              setFormation(testData.formation);
            } else {
              setError("Formation spécifique non trouvée");
            }
          } else {
            setError("Impossible de récupérer les données de formation");
          }
        } else {
          setError("Erreur lors de l'accès à l'API");
        }
      } catch (error) {
        console.error("Error fetching from test endpoint:", error);
        setError("Erreur de connexion au serveur");
        
        // Last resort: Create a mock formation object
        if (parseInt(id) > 0) {
          setFormation({
            id: parseInt(id),
            titre: `Formation ${id} (Données locales)`,
            description: "Cette formation est affichée à partir de données locales car le serveur est indisponible.",
            date_debut: new Date().toISOString(),
            date_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            lieu: "Local",
            capacite_max: 25,
            statut: "validee",
            image: "/logo-ofppt-1.jpg",
            created_at: new Date().toISOString()
          });
        }
      }
    };

    if (id) {
      fetchFormation();
    }
  }, [id]);

  const handleEdit = () => {
    // This would open a modal or navigate to an edit page
    console.log("Edit formation", id);
    // Example implementation: Open a modal with a form
    // setEditModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'validee': { label: 'Validée', color: 'bg-green-100 text-green-800 border-green-200' },
      'en_attente_validation': { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'rejetee': { label: 'Rejetée', color: 'bg-red-100 text-red-800 border-red-200' },
      'terminee': { label: 'Terminée', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'annulee': { label: 'Annulée', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    };

    const defaultStatus = { label: 'Inconnu', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    const statusInfo = statusMap[status] || defaultStatus;

    return (
      <Badge variant="outline" className={`${statusInfo.color}`}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-[300px] w-full" />
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <Alert>
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>Aucune formation trouvée avec cet identifiant.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleEdit}
            className="flex items-center"
          >
            <Edit className="mr-2 h-4 w-4" /> Modifier
          </Button>
          <Button onClick={() => window.print()}>Imprimer</Button>
        </div>
      </div>

      <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border shadow-md overflow-hidden`}>
        <div className="relative h-[200px] md:h-[300px] overflow-hidden">
          <img 
            src={formation.image_url || formation.image || "/logo-ofppt-1.jpg"} 
            alt={formation.titre} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = "/logo-ofppt-1.jpg"; // Fallback image
            }}
          />
          <div className="absolute top-4 right-4">
            {getStatusBadge(formation.statut)}
          </div>
        </div>

        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">{formation.titre}</CardTitle>
            {getStatusBadge(formation.statut)}
          </div>
          <CardDescription className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Du {formatDate(formation.date_debut)} au {formatDate(formation.date_fin)}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300">{formation.description || "Aucune description disponible."}</p>
                
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{formation.lieu || "Lieu non spécifié"}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Capacité: {formation.capacite_max || "Non spécifiée"} participants</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Informations Complémentaires</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Identifiant:</span>
                      <span>{formation.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Statut:</span>
                      {getStatusBadge(formation.statut)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date de début:</span>
                      <span>{formatDate(formation.date_debut)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date de fin:</span>
                      <span>{formatDate(formation.date_fin)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Région:</span>
                      <span>{formation.region?.nom || "Non spécifiée"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Filière:</span>
                      <span>{formation.filiere?.name || "Non spécifiée"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="participants" className="pt-4">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-6">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">Aucun participant pour le moment</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Les participants apparaîtront ici une fois qu'ils seront ajoutés à la formation.
                  </p>
                  <div className="mt-6">
                    <Button>Ajouter des Participants</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="pt-4">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-6">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">Aucun document disponible</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Les documents liés à cette formation seront affichés ici.
                  </p>
                  <div className="mt-6">
                    <Button>Ajouter un Document</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Créée le {formatDate(formation.created_at)}</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate(-1)}>Retour</Button>
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FormationDetails; 