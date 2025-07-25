import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/Loading';
import { RoleGuard } from '../../common/access/RoleGuard';
import { useRoleBasedData } from '../../../hooks/useRoleBasedData';
import { getRoleLevel, getStandardizedRole, ROLE_DISPLAY_NAMES } from '../../../constants/roles';
import { FiUser, FiEye, FiSettings, FiRefreshCw, FiPlay, FiStop, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface User {
  id: number;
  username: string;
  email: string;
  role: {
    id: number;
    name: string;
    display_name: string;
    level: number;
  };
  institution_id?: number;
  department_ids?: number[];
  institution?: {
    id: number;
    name: string;
    type: string;
  };
}

interface SimulationResult {
  endpoint: string;
  method: string;
  expectedResult: string;
  actualResult: 'success' | 'forbidden' | 'error';
  data?: any;
  error?: string;
  responseTime?: number;
}

/**
 * SuperAdmin üçün Role Testing və Simulation Tool
 * Müxtəlif rolların səlahiyyətlərini test etmək üçün
 */
const RoleSimulator: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch all users for simulation
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError
  } = useRoleBasedData<{ users: User[] }>({
    endpoint: '/users',
    filters: { per_page: 100 }
  });

  const users = usersData?.users || [];

  // Test endpoints based on role
  const getTestEndpoints = (user: User): { endpoint: string; method: string; expectedResult: string }[] => {
    const userRole = getStandardizedRole(user.role?.name);
    const roleLevel = getRoleLevel(userRole);

    const baseTests = [
      { endpoint: '/me', method: 'GET', expectedResult: 'success' },
      { endpoint: '/users', method: 'GET', expectedResult: roleLevel <= 5 ? 'success' : 'forbidden' },
      { endpoint: '/institutions', method: 'GET', expectedResult: roleLevel <= 5 ? 'success' : 'forbidden' },
      { endpoint: '/departments', method: 'GET', expectedResult: roleLevel <= 5 ? 'success' : 'forbidden' },
    ];

    // Role-specific tests
    const roleSpecificTests: { endpoint: string; method: string; expectedResult: string }[] = [];

    switch (userRole) {
      case 'superadmin':
        roleSpecificTests.push(
          { endpoint: '/admin/permissions/matrix', method: 'GET', expectedResult: 'success' },
          { endpoint: '/admin/system/settings', method: 'GET', expectedResult: 'success' },
          { endpoint: '/users', method: 'POST', expectedResult: 'success' },
          { endpoint: '/institutions', method: 'POST', expectedResult: 'success' }
        );
        break;

      case 'regionadmin':
        roleSpecificTests.push(
          { endpoint: '/regionadmin/dashboard', method: 'GET', expectedResult: 'success' },
          { endpoint: '/regionadmin/analytics', method: 'GET', expectedResult: 'success' },
          { endpoint: '/users', method: 'POST', expectedResult: 'success' }, // Can create lower roles
          { endpoint: '/admin/system/settings', method: 'GET', expectedResult: 'forbidden' }
        );
        break;

      case 'sektoradmin':
        roleSpecificTests.push(
          { endpoint: `/institutions/${user.institution_id}/departments`, method: 'GET', expectedResult: 'success' },
          { endpoint: '/admin/permissions/matrix', method: 'GET', expectedResult: 'forbidden' },
          { endpoint: '/regionadmin/dashboard', method: 'GET', expectedResult: 'forbidden' }
        );
        break;

      case 'məktəbadmin':
      case 'mektebadmin':
        roleSpecificTests.push(
          { endpoint: `/institutions/${user.institution_id}/students`, method: 'GET', expectedResult: 'success' },
          { endpoint: '/institutions', method: 'POST', expectedResult: 'forbidden' },
          { endpoint: '/admin/permissions/matrix', method: 'GET', expectedResult: 'forbidden' }
        );
        break;

      case 'müəllim':
        roleSpecificTests.push(
          { endpoint: '/teacher/classes', method: 'GET', expectedResult: 'success' },
          { endpoint: '/users', method: 'GET', expectedResult: 'forbidden' },
          { endpoint: '/institutions', method: 'POST', expectedResult: 'forbidden' }
        );
        break;
    }

    return [...baseTests, ...roleSpecificTests];
  };

  const simulateUserPermissions = async (user: User) => {
    setIsSimulating(true);
    setSimulationResults([]);
    setSelectedUser(user);

    const testEndpoints = getTestEndpoints(user);
    const results: SimulationResult[] = [];

    console.log(`🎭 Starting role simulation for user: ${user.username} (${user.role?.name})`);

    for (const test of testEndpoints) {
      try {
        const startTime = Date.now();
        
        // Simulate API call with user's token (in real implementation, you'd need impersonation)
        console.log(`🧪 Testing ${test.method} ${test.endpoint} for ${user.role?.name}`);
        
        const response = await api({
          method: test.method.toLowerCase() as any,
          url: test.endpoint,
          headers: {
            'X-Simulate-User': user.id.toString(), // Backend should handle this for testing
          }
        });

        const responseTime = Date.now() - startTime;
        
        results.push({
          ...test,
          actualResult: 'success',
          data: response.data,
          responseTime
        });

        console.log(`✅ ${test.endpoint}: Success (${responseTime}ms)`);
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        const isExpectedError = test.expectedResult === 'forbidden' && 
                               (error.response?.status === 403 || error.response?.status === 401);

        results.push({
          ...test,
          actualResult: isExpectedError ? 'forbidden' : 'error',
          error: error.response?.data?.message || error.message,
          responseTime
        });

        console.log(`${isExpectedError ? '✅' : '❌'} ${test.endpoint}: ${error.response?.status} - ${error.message}`);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setSimulationResults(results);
    setIsSimulating(false);
    
    console.log(`🏁 Role simulation completed for ${user.username}`);
  };

  const getResultIcon = (result: SimulationResult) => {
    const isExpected = result.actualResult === result.expectedResult;
    
    if (isExpected) {
      return <FiCheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <FiAlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getResultColor = (result: SimulationResult) => {
    const isExpected = result.actualResult === result.expectedResult;
    
    if (isExpected) {
      return result.expectedResult === 'success' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200';
    } else {
      return 'bg-red-50 border-red-200';
    }
  };

  const calculateSuccessRate = () => {
    if (simulationResults.length === 0) return 0;
    
    const successfulTests = simulationResults.filter(
      result => result.actualResult === result.expectedResult
    );
    
    return (successfulTests.length / simulationResults.length) * 100;
  };

  return (
    <RoleGuard roles={['superadmin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Role Simulator</h2>
            <p className="text-gray-600 mt-1">
              Müxtəlif rolların səlahiyyətlərini test edin
            </p>
          </div>
        </div>

        {/* User Selection */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FiUser className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Test ediləcək istifadəçini seçin</h3>
            </div>

            {usersLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
                <span className="ml-2">İstifadəçilər yüklənir...</span>
              </div>
            ) : usersError ? (
              <div className="text-red-600 text-center py-4">
                İstifadəçilər yüklənərkən xəta: {usersError}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                  <div
                    key={user.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedUserId === user.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-sm text-blue-600 mt-1">
                          {ROLE_DISPLAY_NAMES[user.role?.name] || user.role?.display_name}
                        </div>
                        {user.institution && (
                          <div className="text-xs text-gray-400 mt-1">
                            {user.institution.name}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-600">
                          Level {user.role?.level}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  const user = users.find(u => u.id === selectedUserId);
                  if (user) simulateUserPermissions(user);
                }}
                variant="primary"
                disabled={!selectedUserId || isSimulating}
              >
                {isSimulating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Test edilir...
                  </>
                ) : (
                  <>
                    <FiPlay className="w-4 h-4 mr-2" />
                    Testi Başlat
                  </>
                )}
              </Button>

              {simulationResults.length > 0 && (
                <Button
                  onClick={() => {
                    setSimulationResults([]);
                    setSelectedUser(null);
                  }}
                  variant="outline"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Təmizlə
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Simulation Results */}
        {simulationResults.length > 0 && selectedUser && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiSettings className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Test Nəticələri - {selectedUser.username}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {calculateSuccessRate().toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Uğur Nisbəti</div>
                </div>
              </div>

              <div className="space-y-3">
                {simulationResults.map((result, index) => {
                  const isExpected = result.actualResult === result.expectedResult;
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${getResultColor(result)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getResultIcon(result)}
                          <div>
                            <div className="font-medium text-gray-900">
                              {result.method} {result.endpoint}
                            </div>
                            <div className="text-sm text-gray-600">
                              Gözlənilən: {result.expectedResult} | 
                              Əsl: {result.actualResult}
                              {result.responseTime && ` (${result.responseTime}ms)`}
                            </div>
                            {result.error && (
                              <div className="text-sm text-red-600 mt-1">
                                {result.error}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isExpected 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isExpected ? 'Gözlənilən' : 'Gözlənilməz'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
};

export default RoleSimulator;