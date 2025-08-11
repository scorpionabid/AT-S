import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Clock, AlertTriangle, Calendar, User, Building } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { taskService, Task } from "@/services/tasks";
import { useState } from "react";

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', statusFilter],
    queryFn: () => taskService.getAll({
      status: statusFilter === 'all' ? undefined : statusFilter,
      per_page: 20
    }),
  });

  const { data: myTasks } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => taskService.getMyTasks({ per_page: 5 }),
  });

  const { data: taskStats } = useQuery({
    queryKey: ['task-stats'],
    queryFn: () => taskService.getStats(),
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, label: string }> = {
      'pending': { variant: 'secondary', label: 'Gözləyir' },
      'in_progress': { variant: 'default', label: 'Davam edir' },
      'completed': { variant: 'success', label: 'Tamamlandı' },
      'cancelled': { variant: 'destructive', label: 'Ləğv edildi' },
      'overdue': { variant: 'destructive', label: 'Gecikmiş' }
    };
    
    const config = variants[status] || { variant: 'secondary', label: status };
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: any, label: string }> = {
      'low': { variant: 'outline', label: 'Aşağı' },
      'normal': { variant: 'secondary', label: 'Normal' },
      'high': { variant: 'default', label: 'Yüksək' },
      'urgent': { variant: 'destructive', label: 'Təcili' }
    };
    
    const config = variants[priority] || { variant: 'secondary', label: priority };
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
            <h1 className="text-3xl font-bold text-foreground">Tapşırıq İdarəetməsi</h1>
            <p className="text-muted-foreground">Sistem genelində bütün tapşırıqların görülməsi və idarəsi</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Tapşırıq
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-24 bg-surface rounded-lg border border-border-light animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

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

      {/* Status Filter */}
      <div className="flex gap-2">
        {['all', 'pending', 'in_progress', 'completed', 'overdue'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status as any)}
          >
            {status === 'all' ? 'Hamısı' : 
             status === 'pending' ? 'Gözləyir' :
             status === 'in_progress' ? 'Davam edir' :
             status === 'completed' ? 'Tamamlandı' :
             status === 'overdue' ? 'Gecikmiş' : status}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktiv tapşırıqlar</p>
                <p className="text-2xl font-bold">{taskStats?.in_progress || 0}</p>
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
                <p className="text-2xl font-bold">{taskStats?.completed || 0}</p>
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
                <p className="text-2xl font-bold">{taskStats?.overdue || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ümumi</p>
                <p className="text-2xl font-bold">{taskStats?.total || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Tapşırıqlar</CardTitle>
          <CardDescription>Bütün tapşırıqların siyahısı</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks?.data?.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Hələlik tapşırıq yoxdur</p>
                <Button className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  İlk tapşırığı yarat
                </Button>
              </div>
            ) : (
              tasks?.data?.map((task: Task) => (
                <div key={task.id} className="p-4 border border-border rounded-lg hover:bg-surface/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-foreground">{task.title}</h3>
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description.length > 150 
                            ? `${task.description.substring(0, 150)}...` 
                            : task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Məsul: {task.assignee.name}</span>
                          </div>
                        )}
                        {task.institution && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            <span>{task.institution.name}</span>
                          </div>
                        )}
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Son tarix: {formatDate(task.due_date)}</span>
                          </div>
                        )}
                        <span>İrəliləyiş: {task.progress}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ətraflı
                      </Button>
                      {task.status === 'pending' && (
                        <Button size="sm">
                          Başla
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {tasks?.data && tasks.data.length > 0 && (
            <div className="mt-4 flex justify-center">
              <div className="text-sm text-muted-foreground">
                {tasks.data.length} / {tasks.total} tapşırıq göstərilir
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}