import React, { useState, useEffect, useMemo } from 'react';
import { 
  Folder, 
  File, 
  FileText, 
  FileImage, 
  FileVideo, 
  Download, 
  Upload, 
  Search, 
  ChevronRight,
  ChevronDown,
  FolderPlus,
  Trash2,
  Edit3,
  Eye,
  Share2,
  Archive,
  RefreshCw,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/Loading';
import { ToastContainer, toast } from 'react-toastify';

interface DocumentItem {
  id: number;
  name: string;
  type: 'folder' | 'file';
  parent_id: number | null;
  file_type?: string;
  file_size?: number;
  file_path?: string;
  mime_type?: string;
  institution_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  visibility: 'public' | 'institution' | 'department' | 'private';
  access_level: 'view' | 'edit' | 'admin';
  is_archived: boolean;
  metadata?: {
    description?: string;
    tags?: string[];
    version?: string;
    category?: string;
    permissions?: {
      can_view: string[];
      can_edit: string[];
      can_download: boolean;
    };
  };
  creator: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
  };
  institution: {
    id: number;
    name: string;
    type: string;
  };
  children?: DocumentItem[];
  download_count?: number;
  last_accessed?: string;
}

interface BreadcrumbItem {
  id: number | null;
  name: string;
  type: 'folder' | 'root';
}

interface DocumentStats {
  total_documents: number;
  total_folders: number;
  total_size_mb: number;
  recent_uploads: number;
  shared_documents: number;
  archived_documents: number;
}

const DocumentLibrary: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: 'Əsas Qovluq', type: 'root' }]);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modals and forms
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Upload form
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadVisibility, setUploadVisibility] = useState<string>('institution');
  
  // Folder form
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');

  useEffect(() => {
    fetchDocuments();
    fetchDocumentStats();
  }, [currentFolderId]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFolderId) params.append('folder_id', currentFolderId.toString());
      
      const response = await fetch(`/api/documents?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.data || []);
      }
    } catch (error) {
      toast.error('Sənədlər yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocumentStats = async () => {
    try {
      const response = await fetch('/api/document-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Document stats yüklənə bilmədi:', error);
    }
  };

  const handleFolderClick = (folder: DocumentItem) => {
    if (folder.type !== 'folder') return;
    
    setCurrentFolderId(folder.id);
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name, type: 'folder' }]);
    setSelectedItems(new Set());
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    const targetFolder = newBreadcrumbs[index];
    
    setCurrentFolderId(targetFolder.id);
    setBreadcrumbs(newBreadcrumbs);
    setSelectedItems(new Set());
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFiles || uploadFiles.length === 0) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      
      for (let i = 0; i < uploadFiles.length; i++) {
        formData.append('files[]', uploadFiles[i]);
      }
      
      formData.append('parent_id', currentFolderId?.toString() || '');
      formData.append('description', uploadDescription);
      formData.append('tags', uploadTags);
      formData.append('visibility', uploadVisibility);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Fayllar uğurla yükləndi');
        setShowUploadModal(false);
        resetUploadForm();
        fetchDocuments();
        fetchDocumentStats();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Fayl yükləmə uğursuz oldu');
      }
    } catch (error) {
      toast.error('Fayl yükləmə xətası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/documents/folder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          description: folderDescription,
          parent_id: currentFolderId,
          visibility: 'institution'
        })
      });

      if (response.ok) {
        toast.success('Qovluq yaradıldı');
        setShowFolderModal(false);
        resetFolderForm();
        fetchDocuments();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Qovluq yaradılma uğursuz oldu');
      }
    } catch (error) {
      toast.error('Qovluq yaradılma xətası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (document: DocumentItem) => {
    if (document.type !== 'file') return;
    
    try {
      const response = await fetch(`/api/documents/${document.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = document.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Fayl endirildi');
      } else {
        toast.error('Fayl endirmə uğursuz oldu');
      }
    } catch (error) {
      toast.error('Fayl endirmə xətası');
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm('Bu elementi silmək istədiyinizə əminsiniz?')) return;
    
    try {
      const response = await fetch(`/api/documents/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Element silindi');
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        fetchDocuments();
        fetchDocumentStats();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Silmə uğursuz oldu');
      }
    } catch (error) {
      toast.error('Silmə xətası');
    }
  };

  const resetUploadForm = () => {
    setUploadFiles(null);
    setUploadDescription('');
    setUploadTags('');
    setUploadVisibility('institution');
  };

  const resetFolderForm = () => {
    setFolderName('');
    setFolderDescription('');
  };

  const getFileIcon = (fileType?: string, mimeType?: string) => {
    if (!fileType && !mimeType) return FileText;
    
    const type = fileType || mimeType || '';
    
    if (type.includes('image')) return FileImage;
    if (type.includes('video')) return FileVideo;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    
    return File;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVisibilityBadge = (visibility: string) => {
    const badges = {
      public: { color: 'green', text: 'Açıq' },
      institution: { color: 'blue', text: 'Təşkilat' },
      department: { color: 'orange', text: 'Şöbə' },
      private: { color: 'red', text: 'Şəxsi' }
    };
    
    const badge = badges[visibility as keyof typeof badges] || badges.institution;
    
    return (
      <span className={`visibility-badge visibility-${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      if (searchTerm && !doc.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filterType !== 'all') {
        if (filterType === 'folder' && doc.type !== 'folder') return false;
        if (filterType === 'file' && doc.type !== 'file') return false;
        if (filterType !== 'folder' && filterType !== 'file' && doc.file_type !== filterType) return false;
      }
      if (filterVisibility !== 'all' && doc.visibility !== filterVisibility) return false;
      
      return true;
    });

    // Sort documents
    filtered.sort((a, b) => {
      // Folders first
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case 'size':
          aValue = a.file_size || 0;
          bValue = b.file_size || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [documents, searchTerm, filterType, filterVisibility, sortBy, sortOrder]);

  return (
    <div className="document-library">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="library-header">
        <h1>Sənəd Kitabxanası</h1>
        <p>Institutional sənəd və faylların idarə edilməsi</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="stats-overview">
          <Card className="stat-card documents">
            <div className="stat-content">
              <FileText className="stat-icon" />
              <div>
                <span className="stat-number">{stats.total_documents}</span>
                <span className="stat-label">Sənədlər</span>
              </div>
            </div>
          </Card>

          <Card className="stat-card folders">
            <div className="stat-content">
              <Folder className="stat-icon" />
              <div>
                <span className="stat-number">{stats.total_folders}</span>
                <span className="stat-label">Qovluqlar</span>
              </div>
            </div>
          </Card>

          <Card className="stat-card size">
            <div className="stat-content">
              <Archive className="stat-icon" />
              <div>
                <span className="stat-number">{stats.total_size_mb.toFixed(1)} MB</span>
                <span className="stat-label">Ümumi Həcm</span>
              </div>
            </div>
          </Card>

          <Card className="stat-card shared">
            <div className="stat-content">
              <Share2 className="stat-icon" />
              <div>
                <span className="stat-number">{stats.shared_documents}</span>
                <span className="stat-label">Paylaşılmış</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Navigation and Controls */}
      <Card className="controls-card">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id || 'root'}>
              <button
                className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                onClick={() => handleBreadcrumbClick(index)}
                disabled={index === breadcrumbs.length - 1}
              >
                {crumb.type === 'root' ? <Folder size={16} /> : null}
                {crumb.name}
              </button>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight size={16} className="breadcrumb-separator" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="search-filters">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Sənəd axtarışı..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">Bütün növlər</option>
            <option value="folder">Qovluqlar</option>
            <option value="file">Fayllar</option>
            <option value="pdf">PDF</option>
            <option value="image">Şəkillər</option>
            <option value="document">Sənədlər</option>
          </select>

          <select
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value)}
            className="filter-select"
          >
            <option value="all">Bütün görünüşlər</option>
            <option value="public">Açıq</option>
            <option value="institution">Təşkilat</option>
            <option value="department">Şöbə</option>
            <option value="private">Şəxsi</option>
          </select>

          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('_');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="filter-select"
          >
            <option value="name_asc">Ad (A-Z)</option>
            <option value="name_desc">Ad (Z-A)</option>
            <option value="date_desc">Tarix (yeni)</option>
            <option value="date_asc">Tarix (köhnə)</option>
            <option value="size_desc">Həcm (böyük)</option>
            <option value="size_asc">Həcm (kiçik)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <div className="view-toggle">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </Button>
          </div>

          <Button
            onClick={() => setShowFolderModal(true)}
            variant="outline"
            size="sm"
          >
            <FolderPlus size={16} />
            Qovluq
          </Button>

          <Button
            onClick={() => setShowUploadModal(true)}
            variant="primary"
            size="sm"
          >
            <Upload size={16} />
            Yüklə
          </Button>

          <Button
            onClick={fetchDocuments}
            variant="outline"
            size="sm"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </Card>

      {/* Document Grid/List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Card className="documents-card">
          {filteredDocuments.length === 0 ? (
            <div className="empty-state">
              <Folder size={48} />
              <p>Bu qovluqda sənəd tapılmadı</p>
            </div>
          ) : (
            <div className={`documents-container ${viewMode}`}>
              {filteredDocuments.map(document => {
                const FileIcon = document.type === 'folder' ? Folder : getFileIcon(document.file_type, document.mime_type);
                const isSelected = selectedItems.has(document.id);
                
                return (
                  <div
                    key={document.id}
                    className={`document-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (document.type === 'folder') {
                        handleFolderClick(document);
                      } else {
                        setSelectedDocument(document);
                      }
                    }}
                  >
                    <div className="document-icon">
                      <FileIcon size={viewMode === 'grid' ? 32 : 20} />
                    </div>
                    
                    <div className="document-info">
                      <div className="document-name">{document.name}</div>
                      <div className="document-meta">
                        {document.type === 'file' && (
                          <span className="file-size">{formatFileSize(document.file_size)}</span>
                        )}
                        <span className="modified-date">{formatDate(document.updated_at)}</span>
                        {getVisibilityBadge(document.visibility)}
                      </div>
                      {document.metadata?.description && (
                        <div className="document-description">{document.metadata.description}</div>
                      )}
                    </div>

                    <div className="document-actions">
                      {document.type === 'file' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(document);
                          }}
                        >
                          <Download size={16} />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocument(document);
                          setShowShareModal(true);
                        }}
                      >
                        <Share2 size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(document.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content upload-modal">
            <div className="modal-header">
              <h3>Fayl Yükləmə</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
              >
                ×
              </Button>
            </div>

            <form onSubmit={handleFileUpload} className="upload-form">
              <div className="form-group">
                <label>Fayllar</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setUploadFiles(e.target.files)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Təsvir</label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={3}
                  placeholder="Fayl təsviri..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Etiketlər</label>
                  <input
                    type="text"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="etiket1, etiket2, etiket3"
                  />
                </div>

                <div className="form-group">
                  <label>Görünüş</label>
                  <select
                    value={uploadVisibility}
                    onChange={(e) => setUploadVisibility(e.target.value)}
                  >
                    <option value="institution">Təşkilat</option>
                    <option value="department">Şöbə</option>
                    <option value="private">Şəxsi</option>
                    <option value="public">Açıq</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <Button type="submit" disabled={isLoading}>
                  <Upload size={16} />
                  {isLoading ? 'Yüklənir...' : 'Yüklə'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                >
                  Ləğv et
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Folder Creation Modal */}
      {showFolderModal && (
        <div className="modal-overlay">
          <div className="modal-content folder-modal">
            <div className="modal-header">
              <h3>Yeni Qovluq</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setShowFolderModal(false);
                  resetFolderForm();
                }}
              >
                ×
              </Button>
            </div>

            <form onSubmit={handleFolderCreate} className="folder-form">
              <div className="form-group">
                <label>Qovluq Adı</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  required
                  placeholder="Qovluq adı"
                />
              </div>

              <div className="form-group">
                <label>Təsvir</label>
                <textarea
                  value={folderDescription}
                  onChange={(e) => setFolderDescription(e.target.value)}
                  rows={3}
                  placeholder="Qovluq təsviri..."
                />
              </div>

              <div className="form-actions">
                <Button type="submit" disabled={isLoading}>
                  <FolderPlus size={16} />
                  {isLoading ? 'Yaradılır...' : 'Yarat'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowFolderModal(false);
                    resetFolderForm();
                  }}
                >
                  Ləğv et
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentLibrary;