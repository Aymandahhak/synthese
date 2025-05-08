import { useState } from "react";
import { BarChart, BookOpen, ChevronRight, Download, PieChart, Users } from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

const ReportsPage = () => {
  const monthlySessionsData = [
    { month: "Jan", completed: 12, pending: 3 },
    { month: "Feb", completed: 15, pending: 4 },
    { month: "Mar", completed: 18, pending: 2 },
    { month: "Apr", completed: 14, pending: 5 },
    { month: "May", completed: 20, pending: 3 },
    { month: "Jun", completed: 22, pending: 6 },
    { month: "Jul", completed: 19, pending: 4 },
    { month: "Aug", completed: 16, pending: 2 },
    { month: "Sep", completed: 21, pending: 5 },
    { month: "Oct", completed: 24, pending: 3 },
    { month: "Nov", completed: 18, pending: 4 },
    { month: "Dec", completed: 15, pending: 2 },
  ];

  const participationRateData = [
    { month: "Jan", rate: 85 },
    { month: "Feb", rate: 88 },
    { month: "Mar", rate: 92 },
    { month: "Apr", rate: 87 },
    { month: "May", rate: 90 },
    { month: "Jun", rate: 93 },
    { month: "Jul", rate: 89 },
    { month: "Aug", rate: 86 },
    { month: "Sep", rate: 91 },
    { month: "Oct", rate: 94 },
    { month: "Nov", rate: 90 },
    { month: "Dec", rate: 88 },
  ];

  const themesData = [
    { theme: "Marketing Digital", count: 45 },
    { theme: "Développement Web", count: 38 },
    { theme: "Gestion de Projet", count: 32 },
    { theme: "Ressources Humaines", count: 25 },
    { theme: "Finance", count: 20 },
    { theme: "Ventes", count: 18 },
  ];

  const validationStatusData = {
    validated: 156,
    pending: 24,
    rejected: 12,
  };

  const [yearFilter, setYearFilter] = useState("2023");
  const [exportFormat, setExportFormat] = useState("csv");

  const handleExport = () => {
    toast({
      title: "Rapport exporté",
      description: `Le rapport a été exporté au format ${exportFormat.toUpperCase()}.`,
    });
  };

  const totalSessions = monthlySessionsData.reduce((acc, item) => acc + item.completed + item.pending, 0);
  const averageParticipationRate = Math.round(
    participationRateData.reduce((acc, item) => acc + item.rate, 0) / participationRateData.length
  );
  const mostPopularTheme = [...themesData].sort((a, b) => b.count - a.count)[0];
  const validationRate = Math.round(
    (validationStatusData.validated /
      (validationStatusData.validated + validationStatusData.pending + validationStatusData.rejected)) *
      100
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Rapports & Statistiques</h2>
          <p className="text-gray-500">Analysez les performances et tendances des formations</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sessions totales</CardDescription>
            <CardTitle className="text-3xl">{totalSessions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500">
              <span className="text-green-500 font-medium">+12%</span> par rapport à l'année précédente
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taux de participation moyen</CardDescription>
            <CardTitle className="text-3xl">{averageParticipationRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500">
              <span className="text-green-500 font-medium">+5%</span> par rapport à l'année précédente
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Thème le plus populaire</CardDescription>
            <CardTitle className="text-xl truncate">{mostPopularTheme.theme}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500">{mostPopularTheme.count} sessions cette année</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taux de validation</CardDescription>
            <CardTitle className="text-3xl">{validationRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500">
              {validationStatusData.pending} sessions en attente de validation
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions">
        <TabsList className="mb-4">
          <TabsTrigger value="sessions">
            <BarChart className="h-4 w-4 mr-2" />
            Sessions par mois
          </TabsTrigger>
          <TabsTrigger value="participation">
            <BookOpen className="h-4 w-4 mr-2" />
            Taux de participation
          </TabsTrigger>
          <TabsTrigger value="themes">
            <PieChart className="h-4 w-4 mr-2" />
            Thèmes populaires
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Sessions par mois</CardTitle>
              <CardDescription>Nombre de sessions complétées et en attente par mois</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[350px]">
                <div className="flex h-full items-end gap-2">
                  {monthlySessionsData.map((item) => (
                    <div key={item.month} className="flex flex-col items-center gap-2">
                      <div className="flex flex-col gap-1 items-center">
                        <div
                          className="w-12 bg-[#415444] rounded-sm"
                          style={{ height: `${item.completed * 8}px` }}
                        ></div>
                        <div
                          className="w-12 bg-[#e0e5ce] rounded-sm"
                          style={{ height: `${item.pending * 8}px` }}
                        ></div>
                      </div>
                      <div className="text-xs font-medium">{item.month}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-[#415444]"></div>
                  <span className="text-sm">Complétées</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-[#e0e5ce]"></div>
                  <span className="text-sm">En attente</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participation" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Taux de participation</CardTitle>
              <CardDescription>Pourcentage de participation aux sessions par mois</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[350px] relative">
                <div className="absolute inset-0 flex flex-col justify-between py-4">
                  <div className="border-b border-dashed border-gray-200 text-xs text-gray-500">100%</div>
                  <div className="border-b border-dashed border-gray-200 text-xs text-gray-500">75%</div>
                  <div className="border-b border-dashed border-gray-200 text-xs text-gray-500">50%</div>
                  <div className="border-b border-dashed border-gray-200 text-xs text-gray-500">25%</div>
                  <div className="text-xs text-gray-500">0%</div>
                </div>
                <div className="absolute inset-0 flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 1200 350" preserveAspectRatio="none">
                    <polyline
                      points={participationRateData
                        .map((item, index) => `${index * 100 + 50},${350 - item.rate * 3.5}`)
                        .join(" ")}
                      fill="none"
                      stroke="#415444"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                  {participationRateData.map((item) => (
                    <div key={item.month} className="text-xs font-medium">
                      {item.month}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="themes" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Thèmes populaires</CardTitle>
              <CardDescription>Répartition des sessions par thème</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] flex items-center justify-center">
                <div className="w-[300px] h-[300px] relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
