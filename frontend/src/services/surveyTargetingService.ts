import { api } from './api';

export interface Institution {
  id: number;
  name: string;
  code: string;
  type: string;
  level: number;
  parent_id: number | null;
  children?: Institution[];
}

export interface Department {
  id: number;
  name: string;
  code: string;
  type: string;
  institution_id: number;
}

export interface UserType {
  key: string;
  name: string;
}

export interface TargetingPreset {
  name: string;
  description: string;
  user_types: string[];
  institutions: string | number[];
  departments: number[];
  institution_levels?: number[];
}

export interface TargetingOptions {
  institutions: Institution[];
  departments: Department[];
  user_types: Record<string, string>;
  targeting_presets: Record<string, TargetingPreset>;
}

export interface EstimationCriteria {
  target_institutions?: number[];
  target_departments?: number[];
  target_user_types?: string[];
  institution_levels?: number[];
}

export interface RecipientEstimation {
  total_users: number;
  breakdown: {
    by_institution: Array<{
      institution_id: number;
      institution_name: string;
      institution_level: number;
      institution_type: string;
      estimated_users: number;
    }>;
    by_role: Array<{
      role_key: string;
      role_name: string;
      estimated_users: number;
    }>;
    summary: {
      institutions: number;
      departments: number;
      user_types: number;
    };
  };
  criteria: {
    institutions: number;
    departments: number;
    user_types: number;
    institution_levels: number[];
  };
}

export interface TargetingValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  estimation: RecipientEstimation;
}

export interface BulkSelectionOption {
  level?: number;
  type?: string;
  region_id?: number;
  region_name?: string;
  count: number;
  institutions: number[];
}

export const surveyTargetingService = {
  // Get all targeting options for survey creation
  getTargetingOptions: async (): Promise<TargetingOptions> => {
    const response = await api.get<{ targeting_options: TargetingOptions }>('/survey-targeting/options');
    return response.data.targeting_options;
  },

  // Get institution hierarchy for tree selection
  getInstitutionHierarchy: async (): Promise<Institution[]> => {
    const response = await api.get<{ hierarchy: Institution[] }>('/survey-targeting/institutions/hierarchy');
    return response.data.hierarchy;
  },

  // Get accessible institutions for current user
  getAccessibleInstitutions: async (): Promise<Institution[]> => {
    const response = await api.get<{ institutions: Institution[] }>('/survey-targeting/institutions/accessible');
    return response.data.institutions;
  },

  // Get accessible departments
  getAccessibleDepartments: async (institutionIds?: number[]): Promise<Department[]> => {
    const params = institutionIds ? { institution_ids: institutionIds } : {};
    const response = await api.get<{ departments: Department[] }>('/survey-targeting/departments/accessible', { params });
    return response.data.departments;
  },

  // Estimate recipients for given criteria
  estimateRecipients: async (criteria: EstimationCriteria): Promise<RecipientEstimation> => {
    const response = await api.post<{ estimation: RecipientEstimation }>('/survey-targeting/estimate', criteria);
    return response.data.estimation;
  },

  // Validate targeting criteria
  validateTargeting: async (criteria: EstimationCriteria): Promise<TargetingValidation> => {
    const response = await api.post<{ validation: TargetingValidation }>('/survey-targeting/validate', criteria);
    return response.data.validation;
  },

  // Apply targeting preset
  applyPreset: async (presetKey: string): Promise<EstimationCriteria> => {
    const response = await api.post<{ targeting: EstimationCriteria }>('/survey-targeting/apply-preset', {
      preset_key: presetKey
    });
    return response.data.targeting;
  },

  // Get bulk selection options
  getBulkSelectionOptions: async (selectionType: 'by_level' | 'by_type' | 'by_region'): Promise<BulkSelectionOption[]> => {
    const response = await api.get<{ options: BulkSelectionOption[] }>('/survey-targeting/bulk-options', {
      params: { selection_type: selectionType }
    });
    return response.data.options;
  }
};

export default surveyTargetingService;