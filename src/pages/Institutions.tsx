import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, School, MapPin, Users } from "lucide-react";

export default function Institutions() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Təhsil Müəssisələri</h1>
          <p className="text-muted-foreground">Bütün təhsil müəssisələrinin idarə edilməsi</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Müəssisə
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              <CardTitle>1 saylı tam orta məktəb</CardTitle>
            </div>
            <CardDescription>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Bakı şəhəri
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Şagirdlər:</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span>Müəllimlər:</span>
                <span className="font-medium">87</span>
              </div>
              <div className="flex justify-between">
                <span>Siniflər:</span>
                <span className="font-medium">42</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              Ətraflı
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              <CardTitle>15 saylı gimnaziya</CardTitle>
            </div>
            <CardDescription>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Gəncə şəhəri
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Şagirdlər:</span>
                <span className="font-medium">892</span>
              </div>
              <div className="flex justify-between">
                <span>Müəllimlər:</span>
                <span className="font-medium">64</span>
              </div>
              <div className="flex justify-between">
                <span>Siniflər:</span>
                <span className="font-medium">32</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              Ətraflı
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-32">
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Yeni müəssisə əlavə et</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}