import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shield } from "lucide-react";

export default function Roles() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rollar</h1>
          <p className="text-muted-foreground">Sistem rollarının və icazələrinin idarə edilməsi</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Rol
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>SuperAdmin</CardTitle>
            </div>
            <CardDescription>Tam sistem icazələri</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Bütün sistem funksiyalarına tam giriş icazəsi
            </p>
            <Button variant="outline" size="sm">Düzəliş et</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-secondary" />
              <CardTitle>RegionAdmin</CardTitle>
            </div>
            <CardDescription>Regional icazələr</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Müəyyən region üzrə idarəetmə icazələri
            </p>
            <Button variant="outline" size="sm">Düzəliş et</Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-32">
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Yeni rol əlavə et</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}