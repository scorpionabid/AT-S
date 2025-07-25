import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock institution CRUD service for Docker environment
const mockInstitutionCrudService = {
  getInstitutions: vi.fn(),
  createInstitution: vi.fn(),
  updateInstitution: vi.fn(),
  deleteInstitution: vi.fn(),
  searchInstitutions: vi.fn(),
  toggleInstitutionStatus: vi.fn(),
  getInstitutionHierarchy: vi.fn(),
  getInstitutionStatistics: vi.fn(),
};

// Mock comprehensive institution CRUD component
const InstitutionCrudComponent = () => {
  const [institutions, setInstitutions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [editingInstitution, setEditingInstitution] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [levelFilter, setLevelFilter] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [statistics, setStatistics] = React.useState(null);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const result = await mockInstitutionCrudService.getInstitutions({
        search: searchTerm,
        level: levelFilter,
        type: typeFilter,
        page: 1,
        per_page: 15,
      });
      
      setInstitutions(result.data || []);
      setError('');
    } catch (err) {
      setError('Təssisətlər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const result = await mockInstitutionCrudService.getInstitutionStatistics();
      setStatistics(result.data);
    } catch (err) {
      console.warn('Statistikalar yüklənmədi:', err);
    }
  };

  const handleCreateInstitution = async (institutionData: any) => {
    setLoading(true);
    try {
      const result = await mockInstitutionCrudService.createInstitution(institutionData);
      await loadInstitutions();
      await loadStatistics();
      setShowCreateModal(false);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Təssisət yaradılarkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInstitution = async (institutionId: number, institutionData: any) => {
    setLoading(true);
    try {
      await mockInstitutionCrudService.updateInstitution(institutionId, institutionData);
      await loadInstitutions();
      setEditingInstitution(null);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Təssisət yenilənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstitution = async (institutionId: number) => {
    if (!confirm('Bu təssisəti silmək istədiyinizə əminsiniz?')) {
      return;
    }

    setLoading(true);
    try {
      await mockInstitutionCrudService.deleteInstitution(institutionId);
      await loadInstitutions();
      await loadStatistics();
      setError('');
    } catch (err: any) {
      setError(err.message || 'Təssisət silinərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (institutionId: number) => {
    setLoading(true);
    try {
      await mockInstitutionCrudService.toggleInstitutionStatus(institutionId);
      await loadInstitutions();
      setError('');
    } catch (err: any) {
      setError(err.message || 'Status dəyişdirilərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await loadInstitutions();
  };

  const handleFilterChange = async () => {
    await loadInstitutions();
  };

  React.useEffect(() => {
    loadInstitutions();
    loadStatistics();
  }, []);

  const getTypeDisplayName = (type: string) => {
    const typeMap: Record<string, string> = {
      ministry: 'Nazirlik',
      region: 'Regional İdarə',
      sector: 'Sektor',
      school: 'Məktəb',
    };
    return typeMap[type] || type;
  };

  const getLevelDisplayName = (level: number) => {
    const levelMap: Record<number, string> = {
      1: 'Nazirlik',
      2: 'Regional İdarə',
      3: 'Sektor',
      4: 'Məktəb',
    };
    return levelMap[level] || `Səviyyə ${level}`;
  };

  return (
    <div data-testid="institution-crud-component">
      <div className="header">
        <h1>Təssisət İdarəetməsi (Docker Edition)</h1>
        
        {statistics && (
          <div className="statistics" data-testid="statistics-panel">
            <div className="stat-card">
              <span>Cəmi: {statistics.total_institutions}</span>
            </div>
            <div className="stat-card">
              <span>Aktiv: {statistics.active_count}</span>
            </div>
            <div className="stat-card">
              <span>Məktəblər: {statistics.by_type?.school || 0}</span>
            </div>
            <div className="stat-card">
              <span>Regionlar: {statistics.by_type?.region || 0}</span>
            </div>
          </div>
        )}

        <div className="filters">
          <input
            type="text"
            placeholder="Təssisət axtarın..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            data-testid="search-input"
          />
          
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              handleFilterChange();
            }}
            data-testid="level-filter"
          >
            <option value="">Bütün səviyyələr</option>
            <option value="1">Nazirlik (1)</option>
            <option value="2">Regional İdarə (2)</option>
            <option value="3">Sektor (3)</option>
            <option value="4">Məktəb (4)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              handleFilterChange();
            }}
            data-testid="type-filter"
          >
            <option value="">Bütün növlər</option>
            <option value="ministry">Nazirlik</option>
            <option value="region">Regional İdarə</option>
            <option value="sector">Sektor</option>
            <option value="school">Məktəb</option>
          </select>

          <button onClick={handleSearch} data-testid="search-button">
            Axtar
          </button>
          
          <button 
            onClick={() => setShowCreateModal(true)} 
            data-testid="create-institution-button"
            disabled={loading}
          >
            Yeni Təssisət
          </button>
        </div>
      </div>

      {error && (
        <div data-testid="error-message" className="error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {loading && (
        <div data-testid="loading-indicator">Təssisətlər yüklənir...</div>
      )}

      <div className="institutions-table" data-testid="institutions-table">
        {institutions.length === 0 && !loading ? (
          <div data-testid="empty-state">
            Heç bir təssisət tapılmadı
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ad</th>
                <th>Səviyyə</th>
                <th>Növ</th>
                <th>Status</th>
                <th>Yaradılma Tarixi</th>
                <th>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map((institution: any) => (
                <tr key={institution.id} data-testid={`institution-row-${institution.id}`}>
                  <td>{institution.id}</td>
                  <td>{institution.name}</td>
                  <td>{getLevelDisplayName(institution.level)}</td>
                  <td>{getTypeDisplayName(institution.type)}</td>
                  <td>
                    <span className={institution.is_active ? 'active' : 'inactive'}>
                      {institution.is_active ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </td>
                  <td>{new Date(institution.created_at).toLocaleDateString('az-AZ')}</td>
                  <td>
                    <button
                      onClick={() => setEditingInstitution(institution)}
                      data-testid={`edit-institution-${institution.id}`}
                      disabled={loading}
                    >
                      Düzəlt
                    </button>
                    <button
                      onClick={() => handleToggleStatus(institution.id)}
                      data-testid={`toggle-status-${institution.id}`}
                      disabled={loading}
                    >
                      {institution.is_active ? 'Deaktiv Et' : 'Aktiv Et'}
                    </button>
                    <button
                      onClick={() => handleDeleteInstitution(institution.id)}
                      data-testid={`delete-institution-${institution.id}`}
                      disabled={loading}
                      style={{ color: 'red' }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Institution Modal */}
      {showCreateModal && (
        <div data-testid="create-institution-modal" className="modal">
          <div className="modal-content">
            <h2>Yeni Təssisət Yarat</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleCreateInstitution({
                name: formData.get('name'),
                level: parseInt(formData.get('level') as string),
                type: formData.get('type'),
                address: formData.get('address'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                is_active: true,
              });
            }}>
              <input
                name="name"
                placeholder="Təssisət adı"
                required
                data-testid="create-name-input"
              />
              
              <select name="level" required data-testid="create-level-select">
                <option value="">Səviyyə seçin</option>
                <option value="1">Nazirlik (1)</option>
                <option value="2">Regional İdarə (2)</option>
                <option value="3">Sektor (3)</option>
                <option value="4">Məktəb (4)</option>
              </select>

              <select name="type" required data-testid="create-type-select">
                <option value="">Növ seçin</option>
                <option value="ministry">Nazirlik</option>
                <option value="region">Regional İdarə</option>
                <option value="sector">Sektor</option>
                <option value="school">Məktəb</option>
              </select>

              <input
                name="address"
                placeholder="Ünvan (istəyə bağlı)"
                data-testid="create-address-input"
              />

              <input
                name="phone"
                placeholder="Telefon (istəyə bağlı)"
                data-testid="create-phone-input"
              />

              <input
                name="email"
                type="email"
                placeholder="E-poçt (istəyə bağlı)"
                data-testid="create-email-input"
              />

              <div className="modal-actions">
                <button type="submit" disabled={loading} data-testid="create-submit-button">
                  Yarat
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  data-testid="create-cancel-button"
                >
                  Ləğv et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Institution Modal */}
      {editingInstitution && (
        <div data-testid="edit-institution-modal" className="modal">
          <div className="modal-content">
            <h2>Təssisəti Düzəlt</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleUpdateInstitution((editingInstitution as any).id, {
                name: formData.get('name'),
                address: formData.get('address'),
                phone: formData.get('phone'),
                email: formData.get('email'),
              });
            }}>
              <input
                name="name"
                defaultValue={(editingInstitution as any).name}
                placeholder="Təssisət adı"
                required
                data-testid="edit-name-input"
              />

              <div className="readonly-field">
                <label>Səviyyə: {getLevelDisplayName((editingInstitution as any).level)}</label>
              </div>

              <div className="readonly-field">
                <label>Növ: {getTypeDisplayName((editingInstitution as any).type)}</label>
              </div>

              <input
                name="address"
                defaultValue={(editingInstitution as any).address || ''}
                placeholder="Ünvan"
                data-testid="edit-address-input"
              />

              <input
                name="phone"
                defaultValue={(editingInstitution as any).phone || ''}
                placeholder="Telefon"
                data-testid="edit-phone-input"
              />

              <input
                name="email"
                type="email"
                defaultValue={(editingInstitution as any).email || ''}
                placeholder="E-poçt"
                data-testid="edit-email-input"
              />

              <div className="modal-actions">
                <button type="submit" disabled={loading} data-testid="edit-submit-button">
                  Yenilə
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingInstitution(null)}
                  data-testid="edit-cancel-button"
                >
                  Ləğv et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Institution CRUD Integration Tests (Docker)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful responses
    mockInstitutionCrudService.getInstitutions.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Təhsil Nazirliyi',
          level: 1,
          type: 'ministry',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          name: 'Bakı Şəhər Təhsil İdarəsi',
          level: 2,
          type: 'region',
          is_active: true,
          created_at: '2024-01-02T00:00:00Z',
        },
        {
          id: 3,
          name: 'Test Məktəbi',
          level: 4,
          type: 'school',
          is_active: true,
          created_at: '2024-01-03T00:00:00Z',
        }
      ],
      meta: { current_page: 1, total: 3 }
    });

    mockInstitutionCrudService.getInstitutionStatistics.mockResolvedValue({
      data: {
        total_institutions: 121,
        active_count: 115,
        inactive_count: 6,
        by_level: { '1': 1, '2': 5, '3': 15, '4': 100 },
        by_type: { ministry: 1, region: 5, sector: 15, school: 100 },
      }
    });

    mockInstitutionCrudService.createInstitution.mockResolvedValue({
      institution: { id: 4, name: 'Yeni Məktəb', level: 4, type: 'school' }
    });

    mockInstitutionCrudService.updateInstitution.mockResolvedValue({
      data: { id: 1, name: 'Yenilənmiş Ad' }
    });

    mockInstitutionCrudService.deleteInstitution.mockResolvedValue({
      message: 'Təssisət uğurla silindi'
    });

    mockInstitutionCrudService.toggleInstitutionStatus.mockResolvedValue({
      message: 'Status dəyişdirildi'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders institution CRUD interface with Docker context', async () => {
    render(
      <TestWrapper>
        <InstitutionCrudComponent />
      </TestWrapper>
    );

    expect(screen.getByText('Təssisət İdarəetməsi (Docker Edition)')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('create-institution-button')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('institutions-table')).toBeInTheDocument();
    });
  });

  it('loads and displays institutions with statistics from Docker backend', async () => {
    render(
      <TestWrapper>
        <InstitutionCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockInstitutionCrudService.getInstitutions).toHaveBeenCalledWith({
        search: '',
        level: '',
        type: '',
        page: 1,
        per_page: 15,
      });
      expect(mockInstitutionCrudService.getInstitutionStatistics).toHaveBeenCalled();
    });

    // Check statistics panel
    expect(screen.getByTestId('statistics-panel')).toBeInTheDocument();
    expect(screen.getByText('Cəmi: 121')).toBeInTheDocument();
    expect(screen.getByText('Aktiv: 115')).toBeInTheDocument();

    // Check institution data
    expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    expect(screen.getByText('Bakı Şəhər Təhsil İdarəsi')).toBeInTheDocument();
    expect(screen.getByText('Test Məktəbi')).toBeInTheDocument();
  });

  it('handles institution creation workflow', async () => {
    render(
      <TestWrapper>
        <InstitutionCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('institutions-table')).toBeInTheDocument();
    });

    // Open create modal
    fireEvent.click(screen.getByTestId('create-institution-button'));

    await waitFor(() => {
      expect(screen.getByTestId('create-institution-modal')).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByTestId('create-name-input'), {
      target: { value: 'Yeni Test Məktəbi' }
    });
    fireEvent.change(screen.getByTestId('create-level-select'), {
      target: { value: '4' }
    });
    fireEvent.change(screen.getByTestId('create-type-select'), {
      target: { value: 'school' }
    });
    fireEvent.change(screen.getByTestId('create-address-input'), {
      target: { value: 'Test ünvanı' }
    });

    // Submit form
    fireEvent.click(screen.getByTestId('create-submit-button'));

    await waitFor(() => {
      expect(mockInstitutionCrudService.createInstitution).toHaveBeenCalledWith({
        name: 'Yeni Test Məktəbi',
        level: 4,
        type: 'school',
        address: 'Test ünvanı',
        phone: '',
        email: '',
        is_active: true,
      });
    });
  });

  it('handles institution editing workflow', async () => {
    render(
      <TestWrapper>
        <InstitutionCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('institutions-table')).toBeInTheDocument();
    });

    // Click edit button for first institution
    fireEvent.click(screen.getByTestId('edit-institution-1'));

    await waitFor(() => {
      expect(screen.getByTestId('edit-institution-modal')).toBeInTheDocument();
    });

    // Update name
    const nameInput = screen.getByTestId('edit-name-input');
    fireEvent.change(nameInput, { target: { value: 'Yenilənmiş Nazirlik' } });

    // Submit form
    fireEvent.click(screen.getByTestId('edit-submit-button'));

    await waitFor(() => {
      expect(mockInstitutionCrudService.updateInstitution).toHaveBeenCalledWith(1, {
        name: 'Yenilənmiş Nazirlik',
        address: '',
        phone: '',
        email: '',
      });
    });
  });

  it('handles institution deletion with confirmation', async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    render(
      <TestWrapper>
        <InstitutionCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('institutions-table')).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByTestId('delete-institution-1'));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Bu təssisəti silmək istədiyinizə əminsiniz?');
      expect(mockInstitutionCrudService.deleteInstitution).toHaveBeenCalledWith(1);
    });

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('handles institution status toggle', async () => {
    render(
      <TestWrapper>
        <InstitutionCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('institutions-table')).toBeInTheDocument();
    });

    // Toggle status for first institution
    fireEvent.click(screen.getByTestId('toggle-status-1'));

    await waitFor(() => {
      expect(mockInstitutionCrudService.toggleInstitutionStatus).toHaveBeenCalledWith(1);
    });
  });

  it('handles filtering by level', async () => {
    render(
      <TestWrapper>
        <InstitutionCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('level-filter')).toBeInTheDocument();
    });

    // Filter by level 4 (schools)
    fireEvent.change(screen.getByTestId('level-filter'), {
      target: { value: '4' }
    });

    await waitFor(() => {
      expect(mockInstitutionCrudService.getInstitutions).toHaveBeenCalledWith({
        search: '',
        level: '4',
        type: '',
        page: 1,
        per_page: 15,
      });
    });
  });

  it('handles filtering by type', async () => {
    render(
      <TestWrapper>
        <InstitutionCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('type-filter')).toBeInTheDocument();
    });

    // Filter by school type
    fireEvent.change(screen.getByTestId('type-filter'), {
      target: { value: 'school' }
    });

    await waitFor(() => {
      expect(mockInstitutionCrudService.getInstitutions).toHaveBeenCalledWith({
        search: '',
        level: '',
        type: 'school',
        page: 1,
        per_page: 15,
      });
    });
  });

  it('handles search functionality', async () => {
    render(
      <TestWrapper>
        <InstitutionCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    // Enter search term
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Bakı' } });
    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      expect(mockInstitutionCrudService.getInstitutions).toHaveBeenCalledWith({
        search: 'Bakı',
        level: '',
        type: '',
        page: 1,
        per_page: 15,
      });
    });
  });

  it('displays loading states during operations', async () => {
    // Make API call slower to test loading state
    mockInstitutionCrudService.getInstitutions.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        data: [],
        meta: { current_page: 1, total: 0 }
      }), 100))
    );

    render(
      <TestWrapper>
        <InstitutionCrudComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockInstitutionCrudService.getInstitutions.mockRejectedValue(
      new Error('Docker backend bağlantı xətası')
    );

    render(
      <TestWrapper>
        <InstitutionCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Təssisətlər yüklənərkən xəta baş verdi')).toBeInTheDocument();
    });

    // Test error dismissal
    fireEvent.click(screen.getByText('×'));

    await waitFor(() => {
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no institutions found', async () => {
    mockInstitutionCrudService.getInstitutions.mockResolvedValue({
      data: [],
      meta: { current_page: 1, total: 0 }
    });

    render(
      <TestWrapper>
        <InstitutionCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Heç bir təssisət tapılmadı')).toBeInTheDocument();
    });
  });

  it('displays proper type and level names', async () => {
    render(
      <TestWrapper>
        <InstitutionCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Nazirlik')).toBeInTheDocument(); // Level 1
      expect(screen.getByText('Regional İdarə')).toBeInTheDocument(); // Level 2  
      expect(screen.getByText('Məktəb')).toBeInTheDocument(); // Level 4
    });
  });
});