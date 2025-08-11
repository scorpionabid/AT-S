import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Calendar, TrendingUp, Eye, Edit, Trash2, Play, Pause } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { surveyService, Survey } from "@/services/surveys";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Surveys() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'completed' | 'archived'>('all');
  
  const { data: surveys, isLoading, error } = useQuery({
    queryKey: ['surveys', statusFilter],
    queryFn: () => surveyService.getAll({
      status: statusFilter === 'all' ? undefined : statusFilter,
      per_page: 20
    }),
  });

  const { data: surveyStats } = useQuery({
    queryKey: ['survey-stats'],
    queryFn: () => surveyService.getAll({ per_page: 1 }).then(data => ({
      total: data.total || 0,
      active: surveys?.data?.filter((s: Survey) => s.status === 'active').length || 0,
      thisMonth: surveys?.data?.filter((s: Survey) => 
        new Date(s.created_at).getMonth() === new Date().getMonth()
      ).length || 0,
      totalResponses: surveys?.data?.reduce((sum: number, s: Survey) => sum + (s.responses_count || 0), 0) || 0,
    })),
    enabled: !!surveys?.data
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, label: string }> = {
      'draft': { variant: 'secondary', label: 'Layihə' },
      'active': { variant: 'default', label: 'Aktiv' },
      'paused': { variant: 'outline', label: 'Dayandırıldı' },
      'completed': { variant: 'success', label: 'Tamamlandı' },
      'archived': { variant: 'destructive', label: 'Arxivləndi' }
    };
    
    const config = variants[status] || { variant: 'secondary', label: status };
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
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
            <h1 className="text-3xl font-bold text-foreground">Sorğular</h1>
            <p className="text-muted-foreground">Sorğuların yaradılması və idarə edilməsi</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Sorğu
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-24 bg-surface rounded-lg border border-border-light animate-pulse" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-surface rounded-lg border border-border-light animate-pulse" />
          <div className="h-64 bg-surface rounded-lg border border-border-light animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-2">Xəta baş verdi</h1>
        <p className="text-muted-foreground">Sorğular yüklənərkən problem yarandı.</p>
      </div>
    );
  }

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

      {/* Status Filter */}
      <div className="flex gap-2">
        {['all', 'draft', 'active', 'completed', 'archived'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status as any)}
          >
            {status === 'all' ? 'Hamısı' : 
             status === 'draft' ? 'Layihə' :
             status === 'active' ? 'Aktiv' :
             status === 'completed' ? 'Tamamlandı' :
             status === 'archived' ? 'Arxivləndi' : status}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktiv Sorğular</p>
                <p className="text-2xl font-bold">{surveyStats?.active || 0}</p>
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
                <p className="text-2xl font-bold">{surveyStats?.thisMonth || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ümumi sorğular</p>
                <p className="text-2xl font-bold">{surveys?.total || 0}</p>
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
                <p className="text-2xl font-bold">{surveyStats?.totalResponses || 0}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Survey List */}
      <Card>
        <CardHeader>
          <CardTitle>Sorğular</CardTitle>
          <CardDescription>Bütün sorğuların siyahısı</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {surveys?.data?.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Hələlik sorğu yoxdur</p>
                <Button className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  İlk sorğunu yarat
                </Button>
              </div>
            ) : (
              surveys?.data?.map((survey: Survey) => (
                <div key={survey.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-foreground">{survey.title}</h3>
                      {getStatusBadge(survey.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {survey.description && survey.description.length > 100 
                        ? `${survey.description.substring(0, 100)}...` 
                        : survey.description || 'Təsvir yoxdur'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{survey.responses_count || 0} cavab</span>
                      <span>{survey.questions?.length || 0} sual</span>
                      <span>Yaradıldı: {formatDate(survey.created_at)}</span>
                      {survey.creator && <span>Yaradan: {survey.creator.name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {survey.status === 'draft' && (
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {survey.status === 'active' && (
                      <Button variant="ghost" size="sm">
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {surveys?.data && surveys.data.length > 0 && (
            <div className="mt-4 flex justify-center">
              <div className="text-sm text-muted-foreground">
                {surveys.data.length} / {surveys.total} sorğu göstərilir
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}