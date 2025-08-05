import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Calendar, TrendingUp } from "lucide-react";

export default function Surveys() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sorğular</h1>
          <p className="text-muted-foreground">Sorğuların yaradılması və idarə edilməsi</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Sorğu
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktiv Sorğular</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bu ay yaradılan</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Calendar className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cavab dərəcəsi</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ümumi cavablar</p>
                <p className="text-2xl font-bold">2,456</p>
              </div>
              <ClipboardList className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Son Sorğular</CardTitle>
            <CardDescription>Ən son yaradılmış sorğular</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <div>
                  <div className="font-medium">Müəllim məmnuniyyəti sorğusu</div>
                  <div className="text-sm text-muted-foreground">45 cavab • 2 gün əvvəl</div>
                </div>
                <Button variant="outline" size="sm">Bax</Button>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <div>
                  <div className="font-medium">Şagird davamiyyəti qiymətləndirməsi</div>
                  <div className="text-sm text-muted-foreground">123 cavab • 5 gün əvvəl</div>
                </div>
                <Button variant="outline" size="sm">Bax</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sorğu Kateqoriyaları</CardTitle>
            <CardDescription>Sorğu növlərinə görə bölgü</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Müəllim qiymətləndirməsi</span>
                <span className="text-sm text-muted-foreground">35%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Şagird məmnuniyyəti</span>
                <span className="text-sm text-muted-foreground">28%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Valideyn rəyi</span>
                <span className="text-sm text-muted-foreground">22%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>İnfrastruktur qiymətləndirməsi</span>
                <span className="text-sm text-muted-foreground">15%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}