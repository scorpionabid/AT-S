import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Globe, Award } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface BSQResultFormProps {
  onClose: () => void;
  onSuccess: () => void;
  resultId?: string;
}

interface FormData {
  institution_id: string;
  academic_year_id: string;
  assessment_date: string;
  international_standard: string;
  assessment_body: string;
  total_score: string;
  max_possible_score: string;
  international_ranking: string;
  national_ranking: string;
  regional_ranking: string;
  competency_areas: Record<string, string>;
  detailed_scores: string[];
  international_comparison: string[];
  certification_level: string;
  certification_valid_until: string;
  improvement_plan: string[];
  action_items: string[];
  external_report_url: string;
  compliance_score: string;
  accreditation_status: string;
}

const BSQResultForm: React.FC<BSQResultFormProps> = ({ onClose, onSuccess, resultId }) => {
  const [formData, setFormData] = useState<FormData>({
    institution_id: '',
    academic_year_id: '',
    assessment_date: '',
    international_standard: '',
    assessment_body: '',
    total_score: '',
    max_possible_score: '100',
    international_ranking: '',
    national_ranking: '',
    regional_ranking: '',
    competency_areas: {},
    detailed_scores: [''],
    international_comparison: [''],
    certification_level: '',
    certification_valid_until: '',
    improvement_plan: [''],
    action_items: [''],
    external_report_url: '',
    compliance_score: '',
    accreditation_status: 'not_applicable'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  // International Standards
  const internationalStandards = [
    'ISO 21001:2018',
    'Cambridge Assessment',
    'International Baccalaureate (IB)',
    'Pearson Edexcel',
    'NEASC Accreditation',
    'CIS (Council of International Schools)',
    'WASC (Western Association of Schools)',
    'UNESCO Associated Schools',
    'Other'
  ];

  // BSQ Competency Areas
  const competencyAreas = [
    { key: 'curriculum_standards', label: 'Kurikulum Standartları', maxScore: 20 },
    { key: 'teaching_methodology', label: 'Tədris Metodikası', maxScore: 20 },
    { key: 'assessment_practices', label: 'Qiymətləndirmə Təcrübələri', maxScore: 15 },
    { key: 'international_cooperation', label: 'Beynəlxalq Əməkdaşlıq', maxScore: 15 },
    { key: 'language_proficiency', label: 'Dil Bacarıqları', maxScore: 15 },
    { key: 'technology_integration', label: 'Texnologiya İnteqrasiyası', maxScore: 15 }
  ];

  // Accreditation Status Options
  const accreditationStatuses = [
    { value: 'full_accreditation', label: 'Tam Akkreditasiya' },
    { value: 'conditional_accreditation', label: 'Şərtli Akkreditasiya' },
    { value: 'provisional_accreditation', label: 'Müvəqqəti Akkreditasiya' },
    { value: 'denied', label: 'Rədd edildi' },
    { value: 'not_applicable', label: 'Tətbiq olunmur' }
  ];

  useEffect(() => {
    fetchFormData();
    if (resultId) {
      fetchExistingResult();
    }
  }, [resultId]);

  const fetchFormData = async () => {
    try {
      const [institutionsRes, academicYearsRes] = await Promise.all([
        fetch('/api/institutions', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        }),
        fetch('/api/academic-years', {
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
    } catch (err) {
      console.error('Error fetching form data:', err);
    }
  };

  const fetchExistingResult = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/assessments/bsq/${resultId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.data;
        
        setFormData({
          institution_id: result.institution_id?.toString() || '',
          academic_year_id: result.academic_year_id?.toString() || '',
          assessment_date: result.assessment_date || '',
          international_standard: result.international_standard || '',
          assessment_body: result.assessment_body || '',
          total_score: result.total_score?.toString() || '',
          max_possible_score: result.max_possible_score?.toString() || '100',
          international_ranking: result.international_ranking?.toString() || '',
          national_ranking: result.national_ranking?.toString() || '',
          regional_ranking: result.regional_ranking?.toString() || '',
          competency_areas: result.competency_areas || {},
          detailed_scores: result.detailed_scores || [''],
          international_comparison: result.international_comparison || [''],
          certification_level: result.certification_level || '',
          certification_valid_until: result.certification_valid_until || '',
          improvement_plan: result.improvement_plan || [''],
          action_items: result.action_items || [''],
          external_report_url: result.external_report_url || '',
          compliance_score: result.compliance_score?.toString() || '',
          accreditation_status: result.accreditation_status || 'not_applicable'
        });
      }
    } catch (err) {
      setError('Mövcud nəticə yüklənə bilmədi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompetencyScoreChange = (competency: string, score: string) => {
    setFormData(prev => ({
      ...prev,
      competency_areas: { ...prev.competency_areas, [competency]: score }
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
    if (!formData.international_standard) errors.push('Beynəlxalq standart seçimi tələb olunur');
    if (!formData.assessment_body) errors.push('Qiymətləndirmə orqanı tələb olunur');
    if (!formData.total_score) errors.push('Ümumi bal tələb olunur');
    if (!formData.max_possible_score) errors.push('Maksimal bal tələb olunur');

    const totalScore = parseFloat(formData.total_score);
    const maxScore = parseFloat(formData.max_possible_score);
    
    if (totalScore > maxScore) {
      errors.push('Ümumi bal maksimal baldan çox ola bilməz');
    }

    if (formData.compliance_score) {
      const complianceScore = parseFloat(formData.compliance_score);
      if (complianceScore < 0 || complianceScore > 100) {
        errors.push('Uyğunluq balı 0-100 aralığında olmalıdır');
      }
    }

    if (formData.external_report_url && !isValidUrl(formData.external_report_url)) {
      errors.push('Xarici hesabat URL-i düzgün formatda olmalıdır');
    }

    return errors;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
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
      const url = resultId ? `/api/assessments/bsq/${resultId}` : '/api/assessments/bsq';
      const method = resultId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          ...formData,
          detailed_scores: formData.detailed_scores.filter(item => item.trim()),
          international_comparison: formData.international_comparison.filter(item => item.trim()),
          improvement_plan: formData.improvement_plan.filter(item => item.trim()),
          action_items: formData.action_items.filter(item => item.trim())
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'BSQ nəticəsi saxlanıla bilmədi');
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
          <p className="mt-4">BSQ nəticəsi yüklənir...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <Globe className="w-5 h-5 mr-2 text-blue-500" />
            {resultId ? 'BSQ Nəticəsini Redaktə Et' : 'Yeni BSQ Nəticəsi'}
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
                Beynəlxalq Standart *
              </label>
              <select
                value={formData.international_standard}
                onChange={(e) => handleInputChange('international_standard', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Standart seçin</option>
                {internationalStandards.map(standard => (
                  <option key={standard} value={standard}>
                    {standard}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qiymətləndirmə Orqanı *
              </label>
              <input
                type="text"
                value={formData.assessment_body}
                onChange={(e) => handleInputChange('assessment_body', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Qiymətləndirməni həyata keçirən təşkilat"
                required
              />
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uyğunluq Balı (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.compliance_score}
                onChange={(e) => handleInputChange('compliance_score', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0-100"
              />
            </div>
          </div>

          {/* Rankings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Reytinq Məlumatları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beynəlxalq Reytinq
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.international_ranking}
                  onChange={(e) => handleInputChange('international_ranking', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reytinq mövqeyi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Milli Reytinq
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.national_ranking}
                  onChange={(e) => handleInputChange('national_ranking', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reytinq mövqeyi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Regional Reytinq
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.regional_ranking}
                  onChange={(e) => handleInputChange('regional_ranking', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reytinq mövqeyi"
                />
              </div>
            </div>
          </div>

          {/* Competency Areas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kompetensiya Sahələri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competencyAreas.map(competency => (
                <div key={competency.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {competency.label} (Maks: {competency.maxScore})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={competency.maxScore}
                    value={formData.competency_areas[competency.key] || ''}
                    onChange={(e) => handleCompetencyScoreChange(competency.key, e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Certification Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sertifikat Məlumatları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sertifikat Səviyyəsi
                </label>
                <input
                  type="text"
                  value={formData.certification_level}
                  onChange={(e) => handleInputChange('certification_level', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Məsələn: Gold Level, Advanced, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sertifikat Etibarlılıq Tarixi
                </label>
                <input
                  type="date"
                  value={formData.certification_valid_until}
                  onChange={(e) => handleInputChange('certification_valid_until', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Akkreditasiya Statusu
                </label>
                <select
                  value={formData.accreditation_status}
                  onChange={(e) => handleInputChange('accreditation_status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {accreditationStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xarici Hesabat URL-i
                </label>
                <input
                  type="url"
                  value={formData.external_report_url}
                  onChange={(e) => handleInputChange('external_report_url', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Array Fields */}
          {[
            { field: 'improvement_plan' as keyof FormData, label: 'Təkmilləşdirmə Planı' },
            { field: 'action_items' as keyof FormData, label: 'Fəaliyyət Planı' },
            { field: 'international_comparison' as keyof FormData, label: 'Beynəlxalq Müqayisə' }
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

export default BSQResultForm;