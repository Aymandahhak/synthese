import { Button } from "@/components/responsable-formation/ui/button";
import { Input } from "@/components/responsable-formation/ui/input";
import { Label } from "@/components/responsable-formation/ui/label";
import { Textarea } from "@/components/responsable-formation/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/responsable-formation/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { format, isAfter, addDays, parseISO } from "date-fns";
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { createFormation, testApiConnection } from "@/services/api";
import { useFormations } from "@/hooks/useFormations";
import { useToast } from "@/components/responsable-formation/ui/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { Alert, AlertTitle, AlertDescription } from "@/components/responsable-formation/ui/alert";

// Sample data for trainers - will be replaced by API data in future implementation
const trainers = [
  { id: "1", name: "Hannah Laurent" },
  { id: "2", name: "Thomas Martin" },
  { id: "3", name: "Sophie Dubois" },
  { id: "4", name: "Jean Petit" },
  { id: "5", name: "Marie Leroy" },
  { id: "6", name: "Pierre Durand" },
];

// Sample data for themes - will be replaced by API data in future implementation
const themes = [
  { id: "marketing", name: "Marketing Digital" },
  { id: "dev", name: "Développement Web" },
  { id: "gestion", name: "Gestion de Projet" },
  { id: "rh", name: "Ressources Humaines" },
  { id: "finance", name: "Finance" },
  { id: "ventes", name: "Ventes" },
];

export default function CreateFormationForm({ onClose, onSubmit }) {
  const { formations, setFormations, refreshFormations } = useFormations() || { formations: [], setFormations: () => {}, refreshFormations: () => {} };
  const { toast: useToastToast } = useToast();
  const { profile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [formationImage, setFormationImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    date_debut: format(new Date(), 'yyyy-MM-dd'), // Initialize with today in YYYY-MM-DD format
    date_fin: format(addDays(new Date(), 7), 'yyyy-MM-dd'), // Initialize with today + 7 days in YYYY-MM-DD format
    lieu: "",
    capacite_max: 20,
    region_id: "",
    filiere_id: "",
    responsable_id: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showDebug, setShowDebug] = useState(false); // Add state for debug mode
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Vérifier l'état des formations au montage et après les mises à jour
  useEffect(() => {
    console.log("CreateFormationForm: état des formations mis à jour", formations);
    // Vérifier si les formations sont chargées correctement
    if (formations && formations.length > 0) {
      console.log(`${formations.length} formations disponibles`);
    } else if (formations && formations.length === 0) {
      console.log("Aucune formation disponible pour le moment");
    } else {
      console.warn("Le hook useFormations n'a pas retourné de données valides");
    }
    
    // Rafraîchir les formations au montage du composant
    if (refreshFormations) {
      refreshFormations();
    }
  }, [formations, refreshFormations]);
  
  // Vérifier si le profil est chargé correctement
  useEffect(() => {
    if (profile) {
      console.log("Profil responsable chargé:", profile.id);
    } else {
      console.warn("Aucun profil responsable disponible");
    }
  }, [profile]);

  // Effect to validate form data
  useEffect(() => {
    const errors = {};
    
    // Validate title
    if (formData.titre.trim() === "") {
      errors.titre = "Le titre est requis";
    } else if (formData.titre.length < 5) {
      errors.titre = "Le titre doit contenir au moins 5 caractères";
    } else if (formData.titre.length > 100) {
      errors.titre = "Le titre ne doit pas dépasser 100 caractères";
    }
    
    // Validate dates
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Réinitialiser l'heure pour comparer uniquement les dates
      
      const startDate = new Date(formData.date_debut);
      const endDate = new Date(formData.date_fin);
      
      // Vérifier si la date de début est dans le futur
      if (startDate < today) {
        errors.date_debut = "La date de début doit être aujourd'hui ou dans le futur";
      }
      
      // Vérifier si la date de fin est après la date de début
      if (isAfter(startDate, endDate)) {
        errors.date_fin = "La date de fin doit être après la date de début";
      }
      
      // Vérifier si la durée n'est pas excessive (plus de 6 mois)
      const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000;
      if (endDate - startDate > sixMonthsInMs) {
        errors.date_fin = "La durée de la formation ne doit pas dépasser 6 mois";
      }
    } catch (e) {
      errors.date_debut = "Format de date invalide";
    }
    
    // Validate capacity
    if (formData.capacite_max <= 0) {
      errors.capacite_max = "La capacité doit être supérieure à 0";
    } else if (formData.capacite_max > 100) {
      errors.capacite_max = "La capacité ne doit pas dépasser 100 personnes";
    }
    
    // Validate lieu
    if (formData.lieu && formData.lieu.trim().length < 3) {
      errors.lieu = "Le lieu doit contenir au moins 3 caractères";
    }
    
    setValidationErrors(errors);
  }, [formData]);

  // Fetch regions and filieres when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Essayer de récupérer les régions et filières depuis l'API
        // Pour l'instant, utiliser des données statiques
        const regionsData = [
          { id: "1", nom: "Casablanca-Settat" },
          { id: "2", nom: "Rabat-Salé-Kénitra" },
          { id: "3", nom: "Marrakech-Safi" },
          { id: "4", nom: "Fès-Meknès" }
        ];
        
        const filieresData = [
          { id: "1", nom: "Développement Digital" },
          { id: "2", nom: "Gestion et Commerce" },
          { id: "3", nom: "Industrie" },
          { id: "4", nom: "Tourisme et Hôtellerie" }
        ];
        
        setRegions(regionsData);
        setFilieres(filieresData);
        
        console.log("Données de référence chargées:", { regions: regionsData, filieres: filieresData });
      } catch (error) {
        console.error("Error fetching data:", error);
        useToastToast({
          title: "Erreur",
          description: "Impossible de charger les données de référence",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [useToastToast]);

  // Set responsable_id from profile when available
  useEffect(() => {
    if (profile?.id) {
      console.log("Définition de l'ID du responsable depuis le profil:", profile.id);
      setFormData(prev => ({ ...prev, responsable_id: String(profile.id) }));
    }
  }, [profile]);

  // Check API connection on mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/test", { 
          method: "GET",
          headers: { "Accept": "application/json" },
          signal: AbortSignal.timeout(3000) // 3 second timeout
        }).catch(() => null);
        
        setApiConnected(!!response?.ok);
        console.log("API connection status:", !!response?.ok);
      } catch (error) {
        setApiConnected(false);
        console.warn("API connection check failed:", error);
      }
    };
    
    checkApiConnection();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Auto-adjust end date if start date changes and becomes later than end date
    if (name === 'date_debut') {
      try {
        const startDate = new Date(value);
        const endDate = new Date(formData.date_fin);
        
        if (isAfter(startDate, endDate)) {
          const newEndDate = format(addDays(startDate, 7), 'yyyy-MM-dd');
          setFormData(prev => ({
            ...prev,
            date_fin: newEndDate
          }));
          
          toast.info("La date de fin a été automatiquement ajustée", {
            description: "La date de fin a été ajustée pour être après la date de début."
          });
        }
      } catch (e) {
        console.error("Date parsing error:", e);
      }
    }
  };

  const handleSelectChange = (name, value) => {
    console.log(`Sélection changée: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type et la taille du fichier
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!validImageTypes.includes(file.type)) {
        toast.error("Type de fichier non supporté", {
          description: "Veuillez sélectionner une image au format JPG, PNG, GIF ou WEBP."
        });
        return;
      }
      
      // Limite de taille à 5MB
      const maxSize = 5 * 1024 * 1024; // 5MB en octets
      if (file.size > maxSize) {
        toast.error("Fichier trop volumineux", {
          description: "La taille de l'image ne doit pas dépasser 5MB."
        });
        return;
      }
      
      setFormationImage(file);
      console.log("Image sélectionnée:", file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started");
    
    if (Object.keys(validationErrors).length > 0) {
      setError("Veuillez corriger les erreurs de validation.");
      Object.keys(validationErrors).forEach(field => {
        toast.error(`Erreur de validation: ${validationErrors[field]}`);
      });
      return;
    }
    
    const requiredFields = ['titre', 'date_debut', 'date_fin', 'lieu'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      const fieldNames = { titre: 'Titre', date_debut: 'Date de début', date_fin: 'Date de fin', lieu: 'Lieu' };
      setError(`Veuillez remplir tous les champs obligatoires: ${missingFields.map(f => fieldNames[f]).join(', ')}.`);
      // Display toast for missing fields
      missingFields.forEach(field => {
        toast.error(`Champ obligatoire manquant: ${fieldNames[field]}`);
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(false);
      
    try {
      console.log("Form data valid, preparing to submit:", formData);
      console.log("onSubmit function type:", typeof onSubmit);
      
      // Create FormData object for multipart/form-data request (needed for file upload)
      const submitData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          submitData.append(key, value);
          console.log(`Adding field ${key}:`, value);
        }
      });
      
      // Add the image file if selected
      if (formationImage) {
        submitData.append('image', formationImage);
        console.log("Adding image:", formationImage.name);
      }
      
      // Ensure responsable_id is set
      let respId = formData.responsable_id || profile?.id;
      if (!respId) {
        console.warn('Aucun ID de responsable. Utilisation ID 1 par défaut pour test.');
        respId = '1'; 
      }
      submitData.append('responsable_id', String(respId));
      
      console.log('FormData prêt à être envoyé:', Object.fromEntries(submitData.entries()));
      
      // DECISION POINT: Try parent's onSubmit handler if available, otherwise use direct API call
      let response;
      
      if (typeof onSubmit === 'function') {
        console.log("Using parent component's onSubmit handler");
        try {
          response = await onSubmit(submitData);
          console.log("Response from parent onSubmit:", response);
        } catch (parentError) {
          console.error("Error in parent's onSubmit handler:", parentError);
          throw new Error(`Erreur dans onSubmit parent: ${parentError.message || 'Erreur inconnue'}`);
        }
      } else {
        // Fallback: Use direct API call
        console.log("Parent onSubmit not available, using direct API call");
        try {
          response = await createFormation(submitData);
          console.log("Direct API response:", response);
        } catch (apiError) {
          console.error("Direct API call failed:", apiError);
          throw new Error(`Appel API direct échoué: ${apiError.message || 'Erreur inconnue'}`);
        }
      }
      
      // Handle the response
      if (response && (response.id || response.data?.id)) {
        console.log("Formation created successfully:", response);
        
        // Show success message
        toast.success("Formation créée avec succès!", {
          description: `La formation "${response.titre || formData.titre}" a été ajoutée.`,
          duration: 5000
        });
        
        setSuccess(true);
        
        // Refresh formations list if available
        if (refreshFormations) {
          console.log("Refreshing formations list");
          refreshFormations();
        }
        
        // Close the dialog after a delay
        setTimeout(() => {
          if (typeof onClose === 'function') onClose();
        }, 1500);
      } else {
        console.error("Invalid API response:", response);
        throw new Error("La réponse du serveur n'est pas dans le format attendu");
      }
    } catch (err) {
      console.error("Erreur lors de la création de la formation:", err);
      
      // Set local error state
      setError(err.message || "Une erreur est survenue lors de la création");
      
      // Show error toast
      toast.error("Erreur de création", {
        description: err.message || "Une erreur inattendue s'est produite",
        duration: 7000
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-900">Formation créée avec succès!</h3>
        <p className="mt-2 text-sm text-gray-500">Votre formation a été ajoutée à la liste des formations.</p>
        <p className="mt-1 text-sm text-gray-500">Vous pouvez maintenant planifier des sessions pour cette formation.</p>
      </div>
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto p-2">
      <form onSubmit={handleSubmit} className="space-y-6 p-1">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* API Connection Status */}
        <div className="flex items-center gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800 text-sm">
          {apiConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">API Laravel connectée</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-amber-600" />
              <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
                <AlertTitle className="text-sm">Mode démo activé</AlertTitle>
                <AlertDescription className="text-xs">
                  L'API Laravel n'est pas accessible. Les données créées seront simulées et ne seront pas enregistrées dans la base de données.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Titre de la Formation*
          </label>
          <Input
            name="titre"
            value={formData.titre}
            onChange={handleInputChange}
            placeholder="Titre de la formation"
            required
            className={validationErrors.titre ? "border-red-500" : ""}
          />
          {validationErrors.titre && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.titre}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Description
          </label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Décrivez le contenu de la formation"
            className="min-h-[100px]"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Date début */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Date de début*
            </label>
            <Input
              type="date"
              name="date_debut"
              value={formData.date_debut}
              onChange={handleInputChange}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
              className={validationErrors.date_debut ? "border-red-500" : ""}
            />
            {validationErrors.date_debut && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.date_debut}</p>
            )}
          </div>

          {/* Date fin */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Date de fin*
            </label>
            <Input
              type="date"
              name="date_fin"
              value={formData.date_fin}
              onChange={handleInputChange}
              min={formData.date_debut}
              required
              className={validationErrors.date_fin ? "border-red-500" : ""}
            />
            {validationErrors.date_fin && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.date_fin}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Lieu
            </label>
            <Input
              name="lieu"
              value={formData.lieu}
              onChange={handleInputChange}
              placeholder="Lieu de la formation"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Capacité Maximum
            </label>
            <Input
              type="number"
              name="capacite_max"
              value={formData.capacite_max}
              onChange={handleInputChange}
              min="1"
              className={validationErrors.capacite_max ? "border-red-500" : ""}
            />
            {validationErrors.capacite_max && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.capacite_max}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Région
          </label>
          <Select 
            value={formData.region_id} 
            onValueChange={(value) => handleSelectChange('region_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une région" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Filière
          </label>
          <Select 
            value={formData.filiere_id} 
            onValueChange={(value) => handleSelectChange('filiere_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une filière" />
            </SelectTrigger>
            <SelectContent>
              {filieres.map((filiere) => (
                <SelectItem key={filiere.id} value={filiere.id}>
                  {filiere.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Image de couverture
          </label>
          <Input
            type="file"
            name="image"
            accept="image/*" // Restrict to images only
            onChange={handleImageChange}
          />
          <p className="text-xs text-gray-500 mt-1">Formats acceptés: JPG, PNG, GIF, WEBP. Taille max: 5MB</p>
        </div>

        {imagePreview && (
          <div className="mt-2">
            <p className="text-sm mb-1">Aperçu:</p>
            <img 
              src={imagePreview} 
              alt="Aperçu de l'image" 
              className="h-32 w-auto object-cover rounded-md border" 
            />
            {formationImage && (
              <p className="text-xs text-gray-500 mt-1">
                {formationImage.name} ({(formationImage.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-[#415444] hover:bg-[#415444]/90"
            disabled={isLoading || Object.keys(validationErrors).length > 0}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Création...
              </>
            ) : (
              "Créer Formation"
            )}
          </Button>
        </div>

        {/* Debug section */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
            onClick={() => setShowDebug(!showDebug)}
          >
            <span className="mr-1">{showDebug ? '↑' : '↓'}</span>
            {showDebug ? 'Masquer le mode debug' : 'Afficher le mode debug'}
          </button>
          
          {showDebug && (
            <div className="mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-xs overflow-auto max-h-48">
              <h4 className="font-bold mb-2">État du formulaire:</h4>
              <div>
                <p><strong>Validation errors:</strong> {Object.keys(validationErrors).length > 0 ? 'Oui' : 'Non'}</p>
                {Object.keys(validationErrors).length > 0 && (
                  <ul className="list-disc ml-4 mt-1 text-red-500">
                    {Object.entries(validationErrors).map(([field, error]) => (
                      <li key={field}>{field}: {error}</li>
                    ))}
                  </ul>
                )}
                <p className="mt-2"><strong>Données du formulaire:</strong></p>
                <pre className="mt-1 overflow-x-auto">
                  {JSON.stringify(formData, null, 2)}
                </pre>
                <p className="mt-2"><strong>État de soumission:</strong> {isLoading ? 'En cours...' : (success ? 'Succès' : 'Prêt')}</p>
                <p><strong>Fonction onSubmit disponible:</strong> {typeof onSubmit === 'function' ? 'Oui' : 'Non'}</p>
                <p><strong>Profile ID:</strong> {profile?.id || 'Non disponible'}</p>
                <p><strong>API Laravel connectée:</strong> {apiConnected ? 'Oui' : 'Non'}</p>
                <p><strong>Type de soumission:</strong> {typeof onSubmit === 'function' ? 'Via parent' : 'Direct API'}</p>
              </div>
            </div>
          )}
        </div>

        {isDebugMode && (
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md mt-4 text-xs overflow-auto">
            <h4 className="font-semibold mb-1">État du formulaire:</h4>
            <p className="mb-2">Validation errors: {Object.keys(validationErrors).length > 0 ? 'Oui' : 'Non'}</p>
            
            <h4 className="font-semibold mb-1">Données du formulaire:</h4>
            <pre className="whitespace-pre-wrap">{JSON.stringify(formData, null, 2)}</pre>
            
            <h4 className="font-semibold mt-3 mb-1">État de soumission:</h4>
            <p>{isLoading ? 'En cours...' : 'Prêt'}</p>
            
            <h4 className="font-semibold mt-3 mb-1">Fonction onSubmit disponible:</h4>
            <p>{typeof onSubmit === 'function' ? 'Oui' : 'Non'}</p>
            
            <h4 className="font-semibold mt-3 mb-1">Profile ID:</h4>
            <p>{profile?.id || 'Non disponible'}</p>
            
            <h4 className="font-semibold mt-3 mb-1">API Laravel connectée:</h4>
            <p>{apiConnected ? 'Oui' : 'Non'}</p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setIsDebugMode(!isDebugMode)}
          >
            {isDebugMode ? 'Masquer Débogage' : 'Mode Débogage'}
          </Button>
        </div>
      </form>
    </div>
  );
}