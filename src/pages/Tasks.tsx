import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";

export default function Tasks() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tapşırıq İdarəetməsi</h1>
          <p className="text-muted-foreground">Sistem genelində bütün tapşırıqların görülməsi və idarəsi</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Tapşırıq
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktiv tapşırıqlar</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tamamlanmış</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gecikmiş</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bu həftə</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prioritet Tapşırıqları</CardTitle>
            <CardDescription>Yüksək prioritetli və gecikmiş tapşırıqlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Yaz semestr hesabatlarının hazırlanması</h3>
                  <Badge variant="destructive">Gecikmiş</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Məsul: Regional departamentlər • Son tarix: 5 gün əvvəl
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Ətraflı</Button>
                  <Button size="sm">Xatırlatma göndər</Button>
                </div>
              </div>

              <div className="p-4 border border-orange-200 bg-orange-50 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Müəllim kadr ehtiyacının analizi</h3>
                  <Badge variant="secondary">Yüksək</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Məsul: HR departament • Son tarix: 2 gün sonra
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Ətraflı</Button>
                  <Button size="sm">İrəliləyiş</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Tapşırıqlar</CardTitle>
            <CardDescription>Ən son əlavə edilmiş tapşırıqlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <div>
                  <div className="font-medium">Məktəb təhlükəsizlik auditinin aparılması</div>
                  <div className="text-sm text-muted-foreground">Məsul: Təhlükəsizlik qrupu • Bugün</div>
                </div>
                <Badge variant="outline">Yeni</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <div>
                  <div className="font-medium">Rəqəmsal təhsil platforma testləri</div>
                  <div className="text-sm text-muted-foreground">Məsul: IT komandası • Dünən</div>
                </div>
                <Badge variant="secondary">Davam edir</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <div>
                  <div className="font-medium">Şagird davamiyyət hesabatı</div>
                  <div className="text-sm text-muted-foreground">Məsul: Statistika şöbəsi • 2 gün əvvəl</div>
                </div>
                <Badge variant="default">Tamamlandı</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tapşırıq Kateqoriyaları</CardTitle>
          <CardDescription>Tapşırıqların növlərə görə bölgüsü</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-border rounded-md">
              <div className="text-2xl font-bold text-primary">45</div>
              <div className="text-sm text-muted-foreground">Hesabat tapşırıqları</div>
            </div>
            <div className="text-center p-4 border border-border rounded-md">
              <div className="text-2xl font-bold text-green-500">32</div>
              <div className="text-sm text-muted-foreground">Audit tapşırıqları</div>
            </div>
            <div className="text-center p-4 border border-border rounded-md">
              <div className="text-2xl font-bold text-blue-500">28</div>
              <div className="text-sm text-muted-foreground">Sorğu tapşırıqları</div>
            </div>
            <div className="text-center p-4 border border-border rounded-md">
              <div className="text-2xl font-bold text-orange-500">19</div>
              <div className="text-sm text-muted-foreground">Digər tapşırıqlar</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}