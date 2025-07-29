import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/Dashboard';
import StandardPageLayout from '../../components/layout/StandardPageLayout';
import { FiUsers, FiPlus, FiEye, FiEdit, FiTrash2, FiDownload } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/Loading';
import assessmentService, { KSQResult } from '../../services/assessmentService';
import KSQResultForm from '../../components/assessment/KSQResultForm';

const KSQResultsPage: React.FC = () => {
  const [results, setResults] = useState<KSQResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResult, setEditingResult] = useState<KSQResult | null>(null);
  const [filters, setFilters] = useState({
    academic_year_id: '',
    status: '',
    grade: '',
    search: ''
  });

  useEffect(() => {
    fetchResults();
  }, [filters]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await assessmentService.getKSQResults({
        ...filters,
        page: 1,
        limit: 50
      });
      setResults(response.data);
    } catch (error) {
      console.error('Failed to fetch KSQ results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (result: KSQResult) => {
    setEditingResult(result);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu KSQ nəticəsini silmək istədiyinizə əminsiniz?')) {
      try {
        // await assessmentService.deleteKSQResult(id);
        await fetchResults();
      } catch (error) {
        console.error('Failed to delete KSQ result:', error);
      }
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="KSQ Nəticələri"
        subtitle="Müəllim Kompetensiya və Səlahiyyət Qiymətləndirmə nəticələri"
        icon={<FiUsers className="w-6 h-6 text-blue-600" />}
        actions={
          <Button onClick={() => {setEditingResult(null); setShowForm(true);}}>
            <FiPlus className="w-4 h-4 mr-2" />
            Yeni KSQ
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Filters */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Akademik İl
                </label>
                <select
                  value={filters.academic_year_id}
                  onChange={(e) => setFilters({...filters, academic_year_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bütün illər</option>
                  <option value="1">2023-2024</option>
                  <option value="2">2024-2025</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bütün statuslar</option>
                  <option value="draft">Qaralama</option>
                  <option value="submitted">Təqdim edilib</option>
                  <option value="approved">Təsdiqlənib</option>
                  <option value="rejected">Rədd edilib</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qiymət
                </label>
                <select
                  value={filters.grade}
                  onChange={(e) => setFilters({...filters, grade: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bütün qiymətlər</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Axtarış
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  placeholder="Müəllim adı..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Results Table */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                KSQ Nəticələri ({results.length})
              </h3>
              <Button variant="outline" size="sm">
                <FiDownload className="w-4 h-4 mr-2" />
                Excel Export
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Müəllim</th>
                    <th className="text-left py-3 px-2">Qiymətləndirmə Tarixi</th>
                    <th className="text-left py-3 px-2">Fənn Biliyi</th>
                    <th className="text-left py-3 px-2">Pedaqoji Bilyi</th>
                    <th className="text-left py-3 px-2">Praktik Bacarıq</th>
                    <th className="text-left py-3 px-2">Ümumi Bal</th>
                    <th className="text-left py-3 px-2">Qiymət</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{result.teacher_name}</p>
                          {result.follow_up_required && (
                            <p className="text-xs text-orange-600">Təkrar izləmə tələb olunur</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">{result.assessment_date}</td>
                      <td className="py-3 px-2">{result.subject_knowledge_score}</td>
                      <td className="py-3 px-2">{result.pedagogical_knowledge_score}</td>
                      <td className="py-3 px-2">{result.practical_skills_score}</td>
                      <td className="py-3 px-2 font-medium">{result.total_score.toFixed(1)}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(result.status)}`}>
                          {result.status === 'approved' ? 'Təsdiqlənib' :
                           result.status === 'submitted' ? 'Təqdim edilib' :
                           result.status === 'draft' ? 'Qaralama' : 'Rədd edilib'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => {}}>
                            <FiEye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(result)}>
                            <FiEdit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => result.id && handleDelete(result.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {results.length === 0 && (
                <div className="text-center py-8">
                  <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Heç bir KSQ nəticəsi tapılmadı</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* KSQ Form Modal */}
        {showForm && (
          <KSQResultForm 
            onClose={() => {setShowForm(false); setEditingResult(null);}}
            onSave={fetchResults}
            editingResult={editingResult}
          />
        )}
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default KSQResultsPage;