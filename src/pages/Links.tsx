import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, ExternalLink, Globe, Bookmark } from "lucide-react";

export default function Links() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Linklər</h1>
          <p className="text-muted-foreground">Faydalı linklərin təşkili və idarə edilməsi</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Link
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Link axtarın..."
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Kateqoriya
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Təhsil Nazirliyi</CardTitle>
            </div>
            <CardDescription>edu.gov.az</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Azərbaycan Respublikası Təhsil Nazirliyinin rəsmi saytı
            </p>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Aç
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-secondary" />
              <CardTitle className="text-base">ASAN Xidmət</CardTitle>
            </div>
            <CardDescription>asan.gov.az</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Asan Xidmət mərkəzlərinin elektron xidmətləri
            </p>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Aç
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              <CardTitle className="text-base">e-Gov Portalı</CardTitle>
            </div>
            <CardDescription>egov.az</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Azərbaycan Dövlət Elektron Hökumət Portalı
            </p>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Aç
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-32">
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Yeni link əlavə et</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Populyar Linklər</CardTitle>
            <CardDescription>Ən çox istifadə olunan linklər</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Qəbul.edu.az</div>
                    <div className="text-sm text-muted-foreground">Ali təhsil qəbulu</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="flex items-center gap-3">
                  <Bookmark className="h-4 w-4 text-secondary" />
                  <div>
                    <div className="font-medium">DIMTƏK</div>
                    <div className="text-sm text-muted-foreground">Dövlət imtahan mərkəzi</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kateqoriyalar</CardTitle>
            <CardDescription>Linklərin kateqoriyalara görə bölgüsü</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Rəsmi Saytlar</span>
                <span className="text-sm text-muted-foreground">12 link</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Elektron Xidmətlər</span>
                <span className="text-sm text-muted-foreground">8 link</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Təhsil Portalları</span>
                <span className="text-sm text-muted-foreground">15 link</span>
              </div>
              <div className="flex items-center justify-between">
                <span>İmtahan Mərkəzləri</span>
                <span className="text-sm text-muted-foreground">5 link</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}