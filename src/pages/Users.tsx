import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";

export default function Users() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">İstifadəçilər</h1>
          <p className="text-muted-foreground">Sistem istifadəçilərinin idarə edilməsi</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni İstifadəçi
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="İstifadəçi axtarın..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>İstifadəçi Siyahısı</CardTitle>
            <CardDescription>
              Sistemdə qeydiyyatdan keçmiş bütün istifadəçilər
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">SA</span>
                  </div>
                  <div>
                    <div className="font-medium">Sistem Administrator</div>
                    <div className="text-sm text-muted-foreground">admin@edu.gov.az</div>
                    <div className="text-xs text-primary">SuperAdmin</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Düzəliş et</Button>
                  <Button variant="destructive" size="sm">Deaktiv et</Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-secondary">BRA</span>
                  </div>
                  <div>
                    <div className="font-medium">Bakı Regional Admin</div>
                    <div className="text-sm text-muted-foreground">baki@edu.gov.az</div>
                    <div className="text-xs text-secondary">RegionAdmin - Bakı</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Düzəliş et</Button>
                  <Button variant="destructive" size="sm">Deaktiv et</Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">ŞRA</span>
                  </div>
                  <div>
                    <div className="font-medium">Şəki Regional Admin</div>
                    <div className="text-sm text-muted-foreground">seki@edu.gov.az</div>
                    <div className="text-xs text-green-600">RegionAdmin - Şəki-Zaqatala</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Düzəliş et</Button>
                  <Button variant="destructive" size="sm">Deaktiv et</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}