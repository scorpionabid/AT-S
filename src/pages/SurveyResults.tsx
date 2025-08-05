import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, Eye, TrendingUp } from "lucide-react";

export default function SurveyResults() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sorğu Nəticələri</h1>
          <p className="text-muted-foreground">Toplanmış nəticələrin təhlili və hesabatlar</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Bütün Nəticələri Yüklə
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tamamlanmış sorğular</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ümumi cavablar</p>
                <p className="text-2xl font-bold">12,456</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orta cavab dərəcəsi</p>
                <p className="text-2xl font-bold">76%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Yeni nəticələr</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Nəticələr</CardTitle>
          <CardDescription>
            Ən son tamamlanmış sorğuların nəticələri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-md">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">Müəllim məmnuniyyəti sorğusu</h3>
                  <Badge variant="default">Tamamlandı</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">234</div>
                    <div className="text-xs text-muted-foreground">Cavab</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-500">87%</div>
                    <div className="text-xs text-muted-foreground">Məmnuniyyət</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-500">4.2</div>
                    <div className="text-xs text-muted-foreground">Orta bal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">15</div>
                    <div className="text-xs text-muted-foreground">Müəssisə</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3 mr-1" />
                  Ətraflı
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-3 w-3 mr-1" />
                  Yüklə
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-md">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">Şagird davamiyyəti qiymətləndirməsi</h3>
                  <Badge variant="default">Tamamlandı</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">1,456</div>
                    <div className="text-xs text-muted-foreground">Cavab</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-500">92%</div>
                    <div className="text-xs text-muted-foreground">Davamiyyət</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-500">8%</div>
                    <div className="text-xs text-muted-foreground">Qeyri-həzirlik</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">28</div>
                    <div className="text-xs text-muted-foreground">Məktəb</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3 mr-1" />
                  Ətraflı
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-3 w-3 mr-1" />
                  Yüklə
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}