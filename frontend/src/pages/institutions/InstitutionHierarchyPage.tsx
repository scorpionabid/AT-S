import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/Dashboard';
import StandardPageLayout from '../../components/layout/StandardPageLayout';
import { FiGitBranch, FiHome, FiUsers, FiMapPin, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface InstitutionNode {
  id: string;
  name: string;
  type: 'ministry' | 'region' | 'sector' | 'school';
  code: string;
  address?: string;
  directorName?: string;
  studentCount?: number;
  teacherCount?: number;
  children?: InstitutionNode[];
  expanded?: boolean;
}

const InstitutionHierarchyPage: React.FC = () => {
  const [hierarchyData, setHierarchyData] = useState<InstitutionNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'tree' | 'list'>('tree');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData: InstitutionNode[] = [
      {
        id: '1',
        name: 'Təhsil Nazirliyi',
        type: 'ministry',
        code: 'TN',
        children: [
          {
            id: '2', 
            name: 'Bakı Şəhər Təhsil İdarəsi',
            type: 'region',
            code: 'BTI',
            children: [
              {
                id: '3',
                name: 'Yasamal Rayon Təhsil Sektoru',
                type: 'sector', 
                code: 'YTS',
                children: [
                  {
                    id: '4',
                    name: '23 saylı məktəb',
                    type: 'school',
                    code: 'M023',
                    address: 'Yasamal rayonu, Şərifzadə küçəsi 15',
                    directorName: 'Əli Məmmədov',
                    studentCount: 850,
                    teacherCount: 45
                  },
                  {
                    id: '5',
                    name: '45 saylı məktəb',
                    type: 'school',
                    code: 'M045',
                    address: 'Yasamal rayonu, Nizami küçəsi 28',
                    directorName: 'Leyla Həsənova',
                    studentCount: 920,
                    teacherCount: 52
                  }
                ]
              }
            ]
          },
          {
            id: '6',
            name: 'Gəncə Şəhər Təhsil İdarəsi', 
            type: 'region',
            code: 'GTI',
            children: [
              {
                id: '7',
                name: 'Kəpəz Rayon Təhsil Sektoru',
                type: 'sector',
                code: 'KTS',
                children: [
                  {
                    id: '8',
                    name: '12 saylı məktəb',
                    type: 'school',
                    code: 'M012',
                    address: 'Kəpəz rayonu, Heydər Əliyev prospekti 45',
                    directorName: 'Rəşad Quliyev',
                    studentCount: 760,
                    teacherCount: 41
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
    
    setHierarchyData(mockData);
    setLoading(false);
  }, []);

  const toggleExpanded = (nodeId: string) => {
    const updateNodes = (nodes: InstitutionNode[]): InstitutionNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children) };
        }
        return node;
      });
    };
    
    setHierarchyData(updateNodes(hierarchyData));
  };

  const getTypeIcon = (type: InstitutionNode['type']) => {
    switch (type) {
      case 'ministry': return <FiHome className="w-4 h-4 text-purple-600" />;
      case 'region': return <FiMapPin className="w-4 h-4 text-blue-600" />;
      case 'sector': return <FiGitBranch className="w-4 h-4 text-green-600" />;
      case 'school': return <FiUsers className="w-4 h-4 text-orange-600" />;
      default: return <FiHome className="w-4 h-4" />;
    }
  };

  const getTypeName = (type: InstitutionNode['type']) => {
    switch (type) {
      case 'ministry': return 'Nazirlik';
      case 'region': return 'Regional İdarə';
      case 'sector': return 'Sektor';
      case 'school': return 'Məktəb';
      default: return 'Bilinməyən';
    }
  };

  const renderTreeNode = (node: InstitutionNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.expanded ?? true;

    return (
      <div key={node.id} className="mb-2">
        <div 
          className={`flex items-center p-3 rounded-lg border hover:bg-gray-50 cursor-pointer ${
            level > 0 ? 'ml-6' : ''
          }`}
          onClick={() => hasChildren && toggleExpanded(node.id)}
        >
          {hasChildren && (
            <div className="mr-2">
              {isExpanded ? (
                <FiChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <FiChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </div>
          )}
          
          {!hasChildren && <div className="w-6" />}
          
          {getTypeIcon(node.type)}
          
          <div className="ml-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{node.name}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{node.code}</span>
              <span className="text-xs text-gray-500">{getTypeName(node.type)}</span>
            </div>
            
            {node.address && (
              <p className="text-sm text-gray-600 mt-1">{node.address}</p>
            )}
            
            {node.directorName && (
              <p className="text-sm text-gray-600">
                Direktor: <span className="font-medium">{node.directorName}</span>
              </p>
            )}
            
            {(node.studentCount || node.teacherCount) && (
              <div className="flex gap-4 mt-1 text-sm text-gray-600">
                {node.studentCount && <span>Şagird: {node.studentCount}</span>}
                {node.teacherCount && <span>Müəllim: {node.teacherCount}</span>}
              </div>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {node.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Hierarchy yüklənir...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Müəssisə İerarxiyası"
        subtitle="Təhsil müəssisələrinin hierarchiyası və struktur baxışı"
        icon={<FiGitBranch className="w-6 h-6 text-green-600" />}
        actions={
          <div className="flex gap-2">
            <Button 
              variant={selectedView === 'tree' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('tree')}
            >
              Ağac Görünüşü
            </Button>
            <Button 
              variant={selectedView === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('list')}
            >
              Siyahı Görünüşü
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">1</p>
                <p className="text-sm text-gray-600">Nazirlik</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">2</p>
                <p className="text-sm text-gray-600">Regional İdarə</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">2</p>
                <p className="text-sm text-gray-600">Sektor</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">3</p>
                <p className="text-sm text-gray-600">Məktəb</p>
              </div>
            </Card>
          </div>

          {/* Hierarchy View */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">İerarxiya Strukturu</h3>
            <div className="space-y-2">
              {hierarchyData.map(node => renderTreeNode(node))}
            </div>
          </Card>
        </div>
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default InstitutionHierarchyPage;