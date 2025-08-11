import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, FileText, Download, Eye, Upload, Share } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { documentService, Document } from "@/services/documents";
import { useState } from "react";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', searchTerm, categoryFilter],
    queryFn: () => documentService.getAll({
      search: searchTerm || undefined,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      per_page: 20
    }),
  });

  const { data: stats } = useQuery({
    queryKey: ['document-stats'],
    queryFn: () => documentService.getStats(),
  });

  const handleDownload = async (document: Document) => {
    try {
      const blob = await documentService.downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.original_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sənədlər</h1>
            <p className="text-muted-foreground">Sistem sənədlərinin idarə edilməsi və saxlanması</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Sənəd
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="h-40 bg-surface rounded-lg border border-border-light animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sənədlər</h1>
          <p className="text-muted-foreground">Sistem sənədlərinin idarə edilməsi və saxlanması</p>
        </div>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Sənəd Yüklə
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Sənəd axtarın..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Ümumi sənədlər</div>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">İctimai sənədlər</div>
            <div className="text-2xl font-bold">{stats?.public_documents || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Bu ay yüklənmiş</div>
            <div className="text-2xl font-bold">{stats?.recent_uploads || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Ümumi ölçü</div>
            <div className="text-2xl font-bold">
              {stats?.total_size ? documentService.formatFileSize(stats.total_size) : '0 MB'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents?.data?.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Hələlik sənəd yoxdur</p>
            <Button className="mt-4" variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              İlk sənədi yüklə
            </Button>
          </div>
        ) : (
          <>
            {documents?.data?.map((document: Document) => (
              <Card key={document.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{documentService.getFileIcon(document.mime_type)}</span>
                    <CardTitle className="text-base">{document.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {document.mime_type.split('/')[1].toUpperCase()} • 
                    {documentService.formatFileSize(document.file_size)} • 
                    {formatDate(document.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {document.description && (
                      <p className="text-sm text-muted-foreground">
                        {document.description.length > 100 
                          ? `${document.description.substring(0, 100)}...` 
                          : document.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {document.uploader && <span>Yükləyən: {document.uploader.name}</span>}
                      {document.download_count > 0 && <span>• {document.download_count} yükləmə</span>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Bax
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="h-3 w-3" />
                        Yüklə
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Share className="h-3 w-3" />
                        Paylaş
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-32">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Yeni sənəd yüklə</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {documents?.data && documents.data.length > 0 && (
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            {documents.data.length} / {documents.total} sənəd göstərilir
          </div>
        </div>
      )}
    </div>
  );
}