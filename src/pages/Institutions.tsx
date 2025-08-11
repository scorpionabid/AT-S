import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus, School, MapPin, Users, Loader2, Building, Edit, Trash2, Settings } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { institutionService, Institution, CreateInstitutionData, InstitutionType } from "@/services/institutions";
import { InstitutionModal } from "@/components/modals/InstitutionModal";
import { DeleteInstitutionModal } from "@/components/modals/DeleteInstitutionModal";
import { useState } from "react";
import React from "react";
import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/hooks/useAuth"; // Uncomment when auth context is available

export default function Institutions() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [institutionToDelete, setInstitutionToDelete] = useState<Institution | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load institution types for filtering
  const { data: institutionTypesResponse } = useQuery({
    queryKey: ['institution-types'],
    queryFn: () => institutionService.getInstitutionTypes(),
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const availableTypes = React.useMemo(() => {
    if (!institutionTypesResponse?.institution_types) return [];
    return institutionTypesResponse.institution_types.map((type: InstitutionType) => ({
      key: type.key,
      label: type.label_az || type.label,
      level: type.default_level,
      color: type.color,
      icon: type.icon
    }));
  }, [institutionTypesResponse]);
  
  const { data: institutions, isLoading, error } = useQuery({
    queryKey: ['institutions', selectedType, currentPage, perPage],
    queryFn: async () => {
      console.log(`🏢 Loading institutions for type: ${selectedType}, page: ${currentPage}`);
      console.log(`⏰ Query time: ${new Date().toISOString()}`);
      
      try {
        const params = { page: currentPage, per_page: perPage };
        const result = selectedType === 'all' 
          ? await institutionService.getAll(params) 
          : await institutionService.getByType(selectedType, params);
        
        console.log(`📦 Institutions loaded for ${selectedType}:`, result);
        console.log(`📊 Data structure:`, {
          hasData: !!result?.data,
          hasInstitutions: !!result?.institutions,
          dataLength: result?.data?.length || 'undefined',
          institutionsLength: result?.institutions?.length || 'undefined',
          hasMeta: !!result?.meta,
          keys: Object.keys(result || {}),
          fullResult: result
        });
        
        return result;
      } catch (err) {
        console.error(`❌ Failed to load institutions for ${selectedType}:`, err);
        throw err;
      }
    },
    staleTime: 0, // Always refetch
    cacheTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const handleOpenModal = (institution?: Institution) => {
    console.log('🎯 handleOpenModal called with:', institution);
    setSelectedInstitution(institution || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInstitution(null);
  };

  const handleSave = async (data: CreateInstitutionData) => {
    console.log('🏢 Institutions page handleSave called', { data, selectedInstitution });
    
    try {
      if (selectedInstitution) {
        console.log('📝 Updating institution:', selectedInstitution.id, data);
        await institutionService.update(selectedInstitution.id, data);
        toast({
          title: "Müəssisə yeniləndi",
          description: "Müəssisə məlumatları uğurla yeniləndi.",
        });
      } else {
        console.log('➕ Creating new institution:', data);
        const result = await institutionService.create(data);
        console.log('✅ Institution created successfully:', result);
        toast({
          title: "Müəssisə əlavə edildi",
          description: "Yeni müəssisə uğurla yaradıldı.",
        });
      }
      
      // Refresh the institutions list
      console.log('🔄 Refreshing institutions list');
      console.log('🗂️ Before invalidation - current cache:', queryClient.getQueryCache().getAll());
      await queryClient.invalidateQueries({ queryKey: ['institutions'] });
      console.log('🗂️ After invalidation - cache invalidated');
      await queryClient.refetchQueries({ queryKey: ['institutions'] });
      console.log('🗂️ After refetch - queries refetched');
      handleCloseModal();
    } catch (error) {
      console.error('❌ Institution save failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack',
        data
      });
      
      toast({
        title: "Xəta baş verdi",
        description: error instanceof Error ? error.message : "Əməliyyat zamanı problem yarandı.",
        variant: "destructive",
      });
      
      // Re-throw the error so modal knows save failed
      throw error;
    }
  };

  const handleOpenDeleteModal = (institution: Institution) => {
    console.log('🗑️ Opening delete modal for institution:', institution);
    setInstitutionToDelete(institution);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    console.log('❌ Closing delete modal');
    setIsDeleteModalOpen(false);
    setInstitutionToDelete(null);
  };

  const handleDelete = async (deleteType: 'soft' | 'hard') => {
    if (!institutionToDelete) {
      console.log('❌ No institution to delete');
      return;
    }

    console.log(`🚀 Starting ${deleteType} delete for institution:`, {
      id: institutionToDelete.id,
      name: institutionToDelete.name,
      type: institutionToDelete.type,
      deleteType: deleteType
    });

    try {
      console.log('📤 Calling institutionService.delete with:', { id: institutionToDelete.id, deleteType });
      await institutionService.delete(institutionToDelete.id, deleteType);
      console.log('✅ Delete operation successful');
      
      const isHardDelete = deleteType === 'hard';
      toast({
        title: isHardDelete ? "Müəssisə tam silindi" : "Müəssisə deaktiv edildi",
        description: isHardDelete 
          ? "Müəssisə tam olaraq silindi və bərpa edilə bilməz." 
          : "Müəssisə deaktiv edildi və sonradan bərpa edilə bilər.",
      });
      
      console.log('🔄 Invalidating institutions cache');
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      console.log('🏁 Delete process completed successfully');
      handleCloseDeleteModal();
    } catch (error) {
      console.error('❌ Delete operation failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack',
        institutionId: institutionToDelete.id,
        deleteType: deleteType
      });
      
      toast({
        title: "Silinə bilmədi",
        description: error instanceof Error ? error.message : "Müəssisə silinərkən xəta baş verdi.",
        variant: "destructive",
      });
    }
  };

  const getInstitutionIcon = (type: string) => {
    const foundType = availableTypes.find(t => t.key === type);
    if (foundType && foundType.icon) {
      // Map icon names to actual components - you can extend this
      switch (foundType.icon) {
        case 'Building': return Building;
        case 'MapPin': return MapPin;
        case 'Users': return Users;
        case 'School': return School;
        default: return School;
      }
    }

    // Fallback for legacy types
    switch (type) {
      case 'ministry': return Building;
      case 'region':
      case 'regional_education_department': return MapPin;
      case 'sektor':
      case 'sector_education_office': return Users;
      case 'school': 
      case 'secondary_school':
      case 'lyceum':
      case 'gymnasium':
      case 'kindergarten':
      case 'preschool_center':
      case 'nursery':
      case 'vocational_school':
      case 'special_education_school':
      case 'primary_school':
      case 'vocational':
      case 'university':
        return School;
      default: return School;
    }
  };

  const getTypeLabel = (type: string) => {
    const foundType = availableTypes.find(t => t.key === type);
    if (foundType) {
      return foundType.label;
    }

    // Fallback for legacy types
    switch (type) {
      case 'ministry': return 'Nazirlik';
      case 'region': return 'Regional İdarə';
      case 'regional_education_department': return 'Regional Təhsil İdarəsi';
      case 'sektor': return 'Sektor';
      case 'sector_education_office': return 'Sektor Təhsil Şöbəsi';
      case 'school': return 'Məktəb';
      case 'secondary_school': return 'Tam orta məktəb';
      case 'lyceum': return 'Lisey';
      case 'gymnasium': return 'Gimnaziya';
      case 'kindergarten': return 'Uşaq Bağçası';
      case 'preschool_center': return 'Məktəbəqədər Təhsil Mərkəzi';
      case 'nursery': return 'Uşaq Evi';
      case 'vocational_school': return 'Peşə Məktəbi';
      case 'special_education_school': return 'Xüsusi Təhsil Məktəbi';
      case 'primary_school': return 'İbtidai məktəb';
      case 'vocational': return 'Peşə məktəbi';
      case 'university': return 'Universitet';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Təhsil Müəssisələri</h1>
            <p className="text-muted-foreground">Bütün təhsil müəssisələrinin idarə edilməsi</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="h-48 bg-surface rounded-lg border border-border-light animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-2">Xəta baş verdi</h1>
        <p className="text-muted-foreground">Müəssisələr yüklənərkən problem yarandı.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Təhsil Müəssisələri</h1>
          <p className="text-muted-foreground">Bütün təhsil müəssisələrinin idarə edilməsi və yeni növlər əlavə etmək</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="flex items-center gap-2" onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4" />
            Yeni Müəssisə Əlavə Et
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={() => window.open('/institution-types-management', '_blank')}
            title="Yalnız SuperAdmin istifadəçilər üçün mövcuddur"
          >
            <Settings className="h-4 w-4" />
            Müəssisə Növlərini İdarə Et
          </Button>
        </div>
      </div>

      {/* Dynamic Type Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSelectedType('all');
            setCurrentPage(1); // Reset to first page when changing type
          }}
        >
          Hamısı
        </Button>
        {availableTypes.map((type) => (
          <Button
            key={type.key}
            variant={selectedType === type.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedType(type.key);
              setCurrentPage(1); // Reset to first page when changing type
            }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: type.color }}
              />
              <span>{type.label}</span>
            </div>
          </Button>
        ))}
      </div>

      {/* List View */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Ümumi: {institutions?.institutions?.length || 0} müəssisə
          </p>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Müəssisə Adı</TableHead>
                <TableHead>Növ</TableHead>
                <TableHead>Seviye</TableHead>
                <TableHead>Üst Müəssisə</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Əməliyyatlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutions?.institutions?.map((institution: Institution, index: number) => {
                const IconComponent = getInstitutionIcon(institution.type);
                
                return (
                  <TableRow key={institution.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium">{institution.name}</div>
                          {institution.code && (
                            <div className="text-xs text-muted-foreground">Kod: {institution.code}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                        {getTypeLabel(institution.type)}
                      </span>
                    </TableCell>
                    <TableCell>{institution.level}</TableCell>
                    <TableCell>
                      {institution.parent ? (
                        <div className="text-sm">
                          <div>{institution.parent.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {getTypeLabel(institution.parent.type)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Üst müəssisə yoxdur</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${
                        institution.is_active 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {institution.is_active ? 'Aktiv' : 'Deaktiv'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          Ətraflı
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenModal(institution)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenDeleteModal(institution)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {institutions?.meta && institutions.meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {institutions.meta.from}-{institutions.meta.to} arası, ümumi {institutions.meta.total} müəssisə
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, institutions.meta.last_page) }, (_, i) => {
                let pageNum;
                const lastPage = institutions.meta.last_page;
                
                if (lastPage <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= lastPage - 2) {
                  pageNum = lastPage - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < institutions.meta.last_page) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={currentPage >= institutions.meta.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          {/* Per Page Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Səhifədə:</span>
            <select 
              value={perPage} 
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}

      <InstitutionModal
        key={selectedInstitution?.id || 'new'}
        open={isModalOpen}
        onClose={handleCloseModal}
        institution={selectedInstitution}
        onSave={handleSave}
      />

      <DeleteInstitutionModal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        institution={institutionToDelete}
        onDelete={handleDelete}
      />
    </div>
  );
}