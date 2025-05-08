import React, { useState, useEffect } from "react";
import { Calendar, Check, Clock, MapPin, User, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/responsable-formation/ui/avatar";
import { Badge } from "@/components/responsable-formation/ui/badge";
import { Button } from "@/components/responsable-formation/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/responsable-formation/ui/card";
import { Skeleton } from "@/components/responsable-formation/ui/skeleton";
import { toast } from "sonner";
import { useSessions } from "@/hooks/useSessions";

// Static examples for validation - keep just 2 for example
const staticPendingSessions = [
  {
    id: "static1",
    title: "Introduction au Marketing Digital",
    theme: "Marketing digital",
    startDate: "2023-05-15T09:00:00",
    endDate: "2023-05-15T17:00:00",
    location: "Salle de conférence A",
    trainers: [
      {
        id: "1",
        name: "Hannah Laurent",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-6UteJvjmo7I9YCqO5hu0HHO1qGVjpm.png",
      },
    ],
    status: "pending",
    requestedBy: {
      id: "3",
      name: "Sophie Dubois",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-6UteJvjmo7I9YCqO5hu0HHO1qGVjpm.png",
    },
    requestDate: "2023-05-01T14:30:00",
  },
  {
    id: "static2",
    title: "Développement Web Avancé",
    theme: "Développement",
    startDate: "2023-05-20T10:00:00",
    endDate: "2023-05-22T16:00:00",
    location: "Salle de formation B",
    trainers: [
      {
        id: "2",
        name: "Thomas Martin",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-6UteJvjmo7I9YCqO5hu0HHO1qGVjpm.png",
      },
      {
        id: "4",
        name: "Jean Petit",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-6UteJvjmo7I9YCqO5hu0HHO1qGVjpm.png",
      },
    ],
    status: "pending",
    requestedBy: {
      id: "1",
      name: "Hannah Laurent",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-6UteJvjmo7I9YCqO5hu0HHO1qGVjpm.png",
    },
    requestDate: "2023-05-05T09:15:00",
  },
];

export function ValidationSessions() {
  // Use our custom hook to get sessions data
  const { sessions: apiSessions, loading: apiLoading, error: apiError } = useSessions();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState({});

  // Process the API sessions to get only pending ones and combine with static examples
  useEffect(() => {
    if (apiSessions) {
      // Filter API sessions to only include pending ones
      const pendingApiSessions = apiSessions
        .filter(session => session.status === "pending" || session.statut === "en_attente_validation")
        .map(session => {
          // Normalize the API data to match our expected format
          return {
            id: session.id || `api-${Math.random().toString(36).substring(2, 9)}`,
            title: session.titre || session.title,
            theme: session.theme || "Non spécifié",
            startDate: session.date_debut || session.startDate || new Date().toISOString(),
            endDate: session.date_fin || session.endDate || new Date().toISOString(),
            location: session.lieu || session.location || "Non spécifié",
            trainers: session.formateurs || session.trainers || [
              { id: "default", name: "Formateur non assigné", image: "/placeholder.svg" }
            ],
            status: "pending",
            requestedBy: session.requested_by || {
              id: "system",
              name: "Système",
              image: "/placeholder.svg",
            },
            requestDate: session.request_date || new Date().toISOString(),
          };
        });

      // Combine with static examples (keeping just 2)
      setSessions([...staticPendingSessions, ...pendingApiSessions]);
    } else {
      // If no API data, just use the static examples
      setSessions(staticPendingSessions);
    }
  }, [apiSessions]);

  const handleValidate = async (sessionId, approved) => {
    // Set loading state for this specific session
    setLoading((prev) => ({ ...prev, [sessionId]: true }));

    try {
      // Simulate API call for now - this would be replaced with real API call later
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state to remove the validated/rejected session
      setSessions((prevSessions) => prevSessions.filter((session) => session.id !== sessionId));

      // Show success toast
      toast.success(approved ? "Session validée" : "Session rejetée", {
        description: `La session a été ${approved ? "approuvée" : "rejetée"} avec succès.`,
      });
    } catch (error) {
      console.error("Error validating session:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la validation de la session.",
      });
    } finally {
      // Clear loading state
      setLoading((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return "Date non spécifiée";
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    // If same day
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString()} (${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`;
    }

    // Different days
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  // Handle API loading state
  if (apiLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Validation des Sessions</h2>
            <p className="text-gray-500">Chargement des sessions...</p>
          </div>
        </div>
        <div className="space-y-4">
          {Array(2).fill(0).map((_, i) => (
            <Card key={i} className="p-4">
              <CardHeader className="px-0">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Handle API error state
  if (apiError && !sessions.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Validation des Sessions</h2>
            <p className="text-red-500">Erreur lors du chargement des sessions</p>
          </div>
        </div>
        <Card className="p-6 text-center">
          <p className="text-red-500 mb-4">{apiError}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Validation des Sessions</h2>
          <p className="text-gray-500">Approuvez ou rejetez les sessions en attente de validation</p>
        </div>
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200 flex gap-1.5 items-center px-3 py-1.5"
        >
          <Clock className="h-3.5 w-3.5" />
          <span>{sessions.length} sessions en attente</span>
        </Badge>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border text-center">
          <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">Aucune session en attente</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Toutes les sessions ont été validées. Les nouvelles sessions à valider apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className="overflow-hidden border">
              <CardHeader className="bg-[#f8f9fa] pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{session.title}</h3>
                    <p className="text-gray-500">{session.theme}</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">En attente</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span>{formatDateRange(session.startDate, session.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span>{session.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-500" />
                      <span>Demandé par:</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={session.requestedBy.image || "/placeholder.svg"}
                            alt={session.requestedBy.name}
                          />
                          <AvatarFallback>{session.requestedBy.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{session.requestedBy.name}</span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        ({new Date(session.requestDate).toLocaleDateString()})
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Formateurs</h4>
                    <div className="flex flex-wrap gap-3">
                      {session.trainers.map((trainer, idx) => (
                        <div key={trainer.id || `trainer-${idx}`} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={trainer.image || "/placeholder.svg"} alt={trainer.name} />
                            <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{trainer.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-gray-50 flex justify-end gap-3 py-4">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleValidate(session.id, false)}
                  disabled={loading[session.id]}
                >
                  {loading[session.id] ? 
                    <div className="h-5 w-5 rounded-full border-2 border-red-600 border-t-transparent animate-spin mr-2" /> : 
                    <X className="h-5 w-5 mr-2" />
                  }
                  Rejeter
                </Button>
                <Button
                  className="bg-[#415444] hover:bg-[#415444]/90"
                  onClick={() => handleValidate(session.id, true)}
                  disabled={loading[session.id]}
                >
                  {loading[session.id] ? 
                    <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" /> : 
                    <Check className="h-5 w-5 mr-2" />
                  }
                  Approuver
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
