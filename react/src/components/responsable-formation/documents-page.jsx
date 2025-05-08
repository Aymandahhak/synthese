import { useState } from "react"
import { Download, Eye, File, FileText, FileIcon as FilePpt, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/responsable-formation/ui/button"
import { Card, CardContent, CardFooter } from "@/components/responsable-formation/ui/card"
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

// Sample data for documents
const documents = [
  {
    id: "1",
    name: "Guide de formation Marketing Digital",
    type: "pdf",
    size: "2.4 MB",
    uploadedBy: "Hannah Laurent",
    uploadDate: "2023-04-10",
    category: "Marketing",
    url: "#",
  },
  {
    id: "2",
    name: "Présentation Développement Web",
    type: "ppt",
    size: "5.7 MB",
    uploadedBy: "Thomas Martin",
    uploadDate: "2023-04-05",
    category: "Développement",
    url: "#",
  },
  {
    id: "3",
    name: "Exercices pratiques - Gestion de projet",
    type: "docx",
    size: "1.2 MB",
    uploadedBy: "Sophie Dubois",
    uploadDate: "2023-04-12",
    category: "Gestion de projet",
    url: "#",
  },
  {
    id: "4",
    name: "Manuel d'utilisation - CRM",
    type: "pdf",
    size: "3.8 MB",
    uploadedBy: "Jean Petit",
    uploadDate: "2023-04-08",
    category: "Ventes",
    url: "#",
  },
  {
    id: "5",
    name: "Techniques de vente avancées",
    type: "ppt",
    size: "4.2 MB",
    uploadedBy: "Marie Leroy",
    uploadDate: "2023-04-15",
    category: "Ventes",
    url: "#",
  },
  {
    id: "6",
    name: "Modèles de documents RH",
    type: "docx",
    size: "0.9 MB",
    uploadedBy: "Pierre Durand",
    uploadDate: "2023-04-03",
    category: "Ressources Humaines",
    url: "#",
  },
]

// Categories for filtering
const categories = [
  { id: "all", name: "Tous les documents" },
  { id: "Marketing", name: "Marketing" },
  { id: "Développement", name: "Développement" },
  { id: "Gestion de projet", name: "Gestion de projet" },
  { id: "Ventes", name: "Ventes" },
  { id: "Ressources Humaines", name: "Ressources Humaines" },
]

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadFile, setUploadFile] = useState(null); // Removed <File | null>
  const [uploadCategory, setUploadCategory] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Filter documents based on category and search query
  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getDocumentIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-10 w-10 text-red-500" />
      case "ppt":
        return <FilePpt className="h-10 w-10 text-orange-500" />
      case "docx":
        return <File className="h-10 w-10 text-blue-500" />
      default:
        return <File className="h-10 w-10 text-gray-500" />
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    setIsUploading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Document téléchargé", {
        description: "Le document a été téléchargé avec succès.",
      })
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors du téléchargement du document.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = (document) => {
    try {
      // Simulate download
      toast.success("Téléchargement démarré", {
        description: `Le document "${document.name}" va être téléchargé.`,
      })
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors du téléchargement.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Documents de Formation</h2>
          <p className="text-gray-500">Gérez et accédez aux ressources de formation</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#415444] hover:bg-[#415444]/90">
              <Upload className="h-4 w-4 mr-2" />
              Télécharger un document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Télécharger un nouveau document</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau document à la bibliothèque de ressources de formation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file">Fichier</Label>
                <Input id="file" type="file" onChange={handleFileChange} />
                {uploadFile && (
                  <p className="text-sm text-gray-500">
                    Fichier sélectionné: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((cat) => cat.id !== "all")
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadFile(null)}>
                Annuler
              </Button>
              <Button className="bg-[#415444] hover:bg-[#415444]/90" onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "Téléchargement..." : "Télécharger"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64">
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-medium mb-3">Catégories</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedCategory === category.id ? "bg-[#e0e5ce] text-[#415444] font-medium" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4">
            <Input
              placeholder="Rechercher des documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          <Tabs defaultValue="grid" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">{filteredDocuments.length} documents trouvés</p>
              <TabsList>
                <TabsTrigger value="grid">Grille</TabsTrigger>
                <TabsTrigger value="list">Liste</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {getDocumentIcon(doc.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-base truncate" title={doc.name}>
                            {doc.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {doc.size} • {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 px-6 py-3 flex justify-between">
                      <span className="text-xs text-gray-500">Par {doc.uploadedBy}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                          onClick={() => toast.success("Voir le document", { description: `Affichage du document "${doc.name}".` })}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Télécharger</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <div className="bg-white rounded-xl border overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b text-sm font-medium">
                  <div className="col-span-5">Nom</div>
                  <div className="col-span-2">Taille</div>
                  <div className="col-span-2">Catégorie</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                <div className="divide-y">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                      <div className="col-span-5 flex items-center gap-3">
                        {getDocumentIcon(doc.type)}
                        <span className="truncate">{doc.name}</span>
                      </div>
                      <div className="col-span-2 text-gray-500">{doc.size}</div>
                      <div className="col-span-2 text-gray-500">{doc.category}</div>
                      <div className="col-span-2 text-gray-500">{new Date(doc.uploadDate).toLocaleDateString()}</div>
                      <div className="col-span-1 flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => toast.success("Voir le document", { description: `Affichage du document "${doc.name}".` })}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Télécharger</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
