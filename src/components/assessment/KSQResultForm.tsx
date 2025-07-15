import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/Loading';

interface KSQResultFormProps {
  onClose: () => void;
  onSuccess: () => void;
  resultId?: string;
}

interface FormData {
  institution_id: string;
  academic_year_id: string;
  assessment_date: string;
  assessment_type: string;
  total_score: string;
  max_possible_score: string;
  grade_level: string;
  subject_id: string;
  criteria_scores: Record<string, string>;
  detailed_results: string[];
  strengths: string[];
  improvement_areas: string[];
  recommendations: string[];
  notes: string;
  follow_up_required: boolean;
  follow_up_date: string;
  previous_assessment_id: string;
}

const KSQResultForm: React.FC<KSQResultFormProps> = ({ onClose, onSuccess, resultId }) => {
  const [formData, setFormData] = useState<FormData>({
    institution_id: '',
    academic_year_id: '',
    assessment_date: '',
    assessment_type: 'annual',
    total_score: '',
    max_possible_score: '100',
    grade_level: '',
    subject_id: '',
    criteria_scores: {},
    detailed_results: [''],
    strengths: [''],
    improvement_areas: [''],
    recommendations: [''],
    notes: '',
    follow_up_required: false,
    follow_up_date: '',
    previous_assessment_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [previousAssessments, setPreviousAssessments] = useState<any[]>([]);

  // KSQ Criteria Categories
  const ksqCriteria = [
    { key: 'teaching_quality', label: 'Tədris Keyfiyyəti', maxScore: 25 },
    { key: 'curriculum_compliance', label: 'Kurikulum Uyğunluğu', maxScore: 20 },
    { key: 'student_assessment', label: 'Şagird Qiymətləndirməsi', maxScore: 15 },
    { key: 'learning_environment', label: 'Təhsil Mühiti', maxScore: 15 },
    { key: 'teacher_development', label: 'Müəllim İnkişafı', maxScore: 15 },
    { key: 'administrative_management', label: 'İnzibati İdarəetmə', maxScore: 10 }
  ];

  useEffect(() => {
    fetchFormData();
    if (resultId) {
      fetchExistingResult();
    }
  }, [resultId]);

  const fetchFormData = async () => {
    try {
      const [institutionsRes, academicYearsRes, subjectsRes] = await Promise.all([
        fetch('/api/institutions', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        }),
        fetch('/api/academic-years', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        }),
        fetch('/api/subjects', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        })
      ]);

      if (institutionsRes.ok) {
        const institutionsData = await institutionsRes.json();
        setInstitutions(institutionsData.data || []);
      }

      if (academicYearsRes.ok) {
        const academicYearsData = await academicYearsRes.json();
        setAcademicYears(academicYearsData.data || []);
      }

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData.data || []);
      }
    } catch (err) {
      console.error('Error fetching form data:', err);
    }
  };

  const fetchExistingResult = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/assessments/ksq/${resultId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.data;
        
        setFormData({
          institution_id: result.institution_id?.toString() || '',
          academic_year_id: result.academic_year_id?.toString() || '',
          assessment_date: result.assessment_date || '',
          assessment_type: result.assessment_type || 'annual',
          total_score: result.total_score?.toString() || '',
          max_possible_score: result.max_possible_score?.toString() || '100',
          grade_level: result.grade_level || '',
          subject_id: result.subject_id?.toString() || '',
          criteria_scores: result.criteria_scores || {},
          detailed_results: result.detailed_results || [''],
          strengths: result.strengths || [''],
          improvement_areas: result.improvement_areas || [''],
          recommendations: result.recommendations || [''],
          notes: result.notes || '',
          follow_up_required: result.follow_up_required || false,
          follow_up_date: result.follow_up_date || '',
          previous_assessment_id: result.previous_assessment_id?.toString() || ''
        });
      }
    } catch (err) {
      setError('Mövcud nəticə yüklənə bilmədi');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousAssessments = async (institutionId: string) => {
    try {
      const response = await fetch(`/api/assessments/ksq/previous/${institutionId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPreviousAssessments(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching previous assessments:', err);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'institution_id' && value) {
      fetchPreviousAssessments(value);
    }
  };

  const handleCriteriaScoreChange = (criteria: string, score: string) => {
    setFormData(prev => ({
      ...prev,
      criteria_scores: { ...prev.criteria_scores, [criteria]: score }
    }));
  };

  const handleArrayFieldChange = (field: keyof FormData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: keyof FormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayItem = (field: keyof FormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.institution_id) errors.push('Müəssisə seçimi tələb olunur');
    if (!formData.academic_year_id) errors.push('Tədris ili seçimi tələb olunur');
    if (!formData.assessment_date) errors.push('Qiymətləndirmə tarixi tələb olunur');
    if (!formData.total_score) errors.push('Ümumi bal tələb olunur');
    if (!formData.max_possible_score) errors.push('Maksimal bal tələb olunur');

    const totalScore = parseFloat(formData.total_score);
    const maxScore = parseFloat(formData.max_possible_score);
    
    if (totalScore > maxScore) {
      errors.push('Ümumi bal maksimal baldan çox ola bilməz');
    }

    if (formData.follow_up_required && !formData.follow_up_date) {
      errors.push('Təqib tələb olunduqda təqib tarixi vacibdir');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = resultId ? `/api/assessments/ksq/${resultId}` : '/api/assessments/ksq';
      const method = resultId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          ...formData,
          detailed_results: formData.detailed_results.filter(item => item.trim()),
          strengths: formData.strengths.filter(item => item.trim()),
          improvement_areas: formData.improvement_areas.filter(item => item.trim()),
          recommendations: formData.recommendations.filter(item => item.trim())
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Qiymətləndirmə nəticəsi saxlanıla bilmədi');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  if (loading && resultId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md p-6 text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4">Nəticə yüklənir...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {resultId ? 'KSQ Nəticəsini Redaktə Et' : 'Yeni KSQ Nəticəsi'}
          </h2>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Müəssisə *
              </label>
              <select
                value={formData.institution_id}
                onChange={(e) => handleInputChange('institution_id', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Müəssisə seçin</option>
                {institutions.map(institution => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tədris İli *
              </label>
              <select
                value={formData.academic_year_id}
                onChange={(e) => handleInputChange('academic_year_id', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Tədris ili seçin</option>
                {academicYears.map(year => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qiymətləndirmə Tarixi *
              </label>
              <input
                type="date"
                value={formData.assessment_date}
                onChange={(e) => handleInputChange('assessment_date', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qiymətləndirmə Növü *
              </label>
              <select
                value={formData.assessment_type}
                onChange={(e) => handleInputChange('assessment_type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="annual">İllik Qiymətləndirmə</option>
                <option value="mid_term">Yarımillik Qiymətləndirmə</option>
                <option value="special">Xüsusi Qiymətləndirmə</option>
              </select>
            </div>
          </div>

          {/* Scoring Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ümumi Bal *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.total_score}
                onChange={(e) => handleInputChange('total_score', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maksimal Bal *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={formData.max_possible_score}
                onChange={(e) => handleInputChange('max_possible_score', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Criteria Scores */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Meyar Balları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ksqCriteria.map(criteria => (
                <div key={criteria.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {criteria.label} (Maks: {criteria.maxScore})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={criteria.maxScore}
                    value={formData.criteria_scores[criteria.key] || ''}
                    onChange={(e) => handleCriteriaScoreChange(criteria.key, e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Array Fields */}
          {[
            { field: 'strengths' as keyof FormData, label: 'Güçlü Tərəflər' },
            { field: 'improvement_areas' as keyof FormData, label: 'Təkmilləşdirmə Sahələri' },
            { field: 'recommendations' as keyof FormData, label: 'Tövsiyələr' }
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              {(formData[field] as string[]).map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayFieldChange(field, index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`${label} ${index + 1}`}
                  />
                  {(formData[field] as string[]).length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeArrayItem(field, index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={() => addArrayItem(field)}
                variant="outline"
                size="sm"
              >
                + Əlavə et
              </Button>
            </div>
          ))}

          {/* Follow-up Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="follow_up_required"
                checked={formData.follow_up_required}
                onChange={(e) => handleInputChange('follow_up_required', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="follow_up_required" className="text-sm font-medium text-gray-700">
                Təqib tələb olunur
              </label>
            </div>

            {formData.follow_up_required && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Təqib Tarixi *
                </label>
                <input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qeydlər
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Əlavə qeydlər və müşahidələr..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" onClick={onClose} variant="outline">
              Ləğv et
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {resultId ? 'Yenilə' : 'Saxla'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default KSQResultForm;