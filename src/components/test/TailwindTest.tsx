// ====================
// Tailwind CSS Test Component
// Design System Integration Validation
// ====================

import React, { useState } from 'react';
import { Button, ButtonGroup, IconButton, LinkButton } from '../ui/Button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  StatsCard,
  FeatureCard,
  CardGrid 
} from '../ui/Card';
import {
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  FormField,
  FormLabel,
  FormMessage,
  FormDescription,
  FormGroup,
  FormGrid,
} from '../ui/Form';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  ConfirmModal,
} from '../ui/Modal';
import {
  Spinner,
  DotsSpinner,
  Progress,
  Skeleton,
  LoadingOverlay,
  LoadingState,
} from '../ui/Loading';
import {
  Alert,
  Toast,
  ToastContainer,
  Notification,
} from '../ui/Alert';

const TailwindTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'components' | 'layout'>('colors');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [progress, setProgress] = useState(75);

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            ATİS Tailwind CSS Integration Test
          </h1>
          <p className="text-lg text-neutral-600">
            Design system validation və komponent test platforması
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-neutral-100 p-1 rounded-lg">
          {(['colors', 'typography', 'components', 'layout'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 rounded-md font-medium transition-all duration-200 capitalize
                ${activeTab === tab 
                  ? 'bg-white shadow-sm text-primary-600' 
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeTab === 'colors' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Color System</h2>
              
              {/* Primary Colors */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-neutral-700 mb-3">Primary Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div key={shade} className="text-center">
                      <div 
                        className={`h-16 w-full rounded-lg bg-primary-${shade} border border-neutral-200`}
                      />
                      <p className="text-xs text-neutral-600 mt-1">{shade}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semantic Colors */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                  <div className="w-8 h-8 bg-success-500 rounded mb-2"></div>
                  <h4 className="font-medium text-success-700">Success</h4>
                  <p className="text-sm text-success-600">İşləm uğurlu</p>
                </div>
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="w-8 h-8 bg-warning-500 rounded mb-2"></div>
                  <h4 className="font-medium text-warning-700">Warning</h4>
                  <p className="text-sm text-warning-600">Diqqət məlumat</p>
                </div>
                <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                  <div className="w-8 h-8 bg-error-500 rounded mb-2"></div>
                  <h4 className="font-medium text-error-700">Error</h4>
                  <p className="text-sm text-error-600">Xəta mesajı</p>
                </div>
                <div className="p-4 bg-info-50 border border-info-200 rounded-lg">
                  <div className="w-8 h-8 bg-info-500 rounded mb-2"></div>
                  <h4 className="font-medium text-info-700">Info</h4>
                  <p className="text-sm text-info-600">Məlumat mesajı</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Typography System</h2>
            
            {/* Headings */}
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-neutral-900">Heading 1 - 6xl</h1>
              <h2 className="text-5xl font-bold text-neutral-900">Heading 2 - 5xl</h2>
              <h3 className="text-4xl font-semibold text-neutral-900">Heading 3 - 4xl</h3>
              <h4 className="text-3xl font-semibold text-neutral-900">Heading 4 - 3xl</h4>
              <h5 className="text-2xl font-medium text-neutral-900">Heading 5 - 2xl</h5>
              <h6 className="text-xl font-medium text-neutral-900">Heading 6 - xl</h6>
            </div>

            {/* Body Text */}
            <div className="space-y-4">
              <p className="text-lg text-neutral-700">
                Body Large - Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p className="text-base text-neutral-700">
                Body Base - Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p className="text-sm text-neutral-600">
                Body Small - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <p className="text-xs text-neutral-500">
                Caption - Lorem ipsum dolor sit amet.
              </p>
            </div>

            {/* Font Weights */}
            <div className="space-y-2">
              <p className="text-base font-thin text-neutral-700">Font Weight Thin (100)</p>
              <p className="text-base font-light text-neutral-700">Font Weight Light (300)</p>
              <p className="text-base font-normal text-neutral-700">Font Weight Normal (400)</p>
              <p className="text-base font-medium text-neutral-700">Font Weight Medium (500)</p>
              <p className="text-base font-semibold text-neutral-700">Font Weight Semibold (600)</p>
              <p className="text-base font-bold text-neutral-700">Font Weight Bold (700)</p>
              <p className="text-base font-black text-neutral-700">Font Weight Black (900)</p>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Component Library</h2>
            
            {/* New Button Component System */}
            <div>
              <h3 className="text-lg font-medium text-neutral-700 mb-3">New Button System</h3>
              
              {/* Button Variants */}
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-2">Variants</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="error">Error</Button>
                    <LinkButton>Link Button</LinkButton>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-2">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                    <IconButton size="icon">⚙</IconButton>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-2">States</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button>Normal</Button>
                    <Button loading>Loading</Button>
                    <Button disabled>Disabled</Button>
                    <Button icon={<span>📧</span>}>With Icon</Button>
                    <Button endIcon={<span>→</span>}>End Icon</Button>
                    <Button fullWidth>Full Width Button</Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-2">Button Groups</h4>
                  <div className="space-y-3">
                    <ButtonGroup>
                      <Button variant="outline">Sol</Button>
                      <Button variant="outline">Orta</Button>
                      <Button variant="outline">Sağ</Button>
                    </ButtonGroup>
                    
                    <ButtonGroup orientation="vertical" className="w-48">
                      <Button variant="ghost">Üst</Button>
                      <Button variant="ghost">Orta</Button>
                      <Button variant="ghost">Alt</Button>
                    </ButtonGroup>
                  </div>
                </div>
              </div>

              {/* Legacy Buttons for Comparison */}
              <div>
                <h4 className="text-sm font-medium text-neutral-600 mb-2">Legacy Buttons (Comparison)</h4>
                <div className="flex flex-wrap gap-3">
                  <button className="btn btn-primary">Legacy Primary</button>
                  <button className="btn btn-secondary">Legacy Secondary</button>
                  <button className="btn bg-neutral-100 text-neutral-700 hover:bg-neutral-200">
                    Legacy Neutral
                  </button>
                </div>
              </div>
            </div>

            {/* New Card Component System */}
            <div>
              <h3 className="text-lg font-medium text-neutral-700 mb-3">New Card System</h3>
              
              {/* Card Variants */}
              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-3">Card Variants</h4>
                  <CardGrid cols={{ default: 1, md: 2, lg: 3 }}>
                    <Card variant="default">
                      <CardHeader>
                        <CardTitle>Default Card</CardTitle>
                        <CardDescription>Standard card with shadow</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-neutral-600">
                          Bu adi card komponentidir. Shadow və border ilə.
                        </p>
                      </CardContent>
                    </Card>

                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle>Elevated Card</CardTitle>
                        <CardDescription>Enhanced shadow card</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-neutral-600">
                          Bu elevated card komponentidir. Daha güclü shadow ilə.
                        </p>
                      </CardContent>
                    </Card>

                    <Card variant="gradient">
                      <CardHeader>
                        <CardTitle>Gradient Card</CardTitle>
                        <CardDescription>Colorful gradient background</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-primary-100">
                          Bu gradient card komponentidir. Primary color gradient ilə.
                        </p>
                      </CardContent>
                    </Card>
                  </CardGrid>
                </div>

                {/* Semantic Cards */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-3">Semantic Cards</h4>
                  <CardGrid cols={{ default: 1, md: 2, lg: 4 }}>
                    <Card variant="success" size="sm">
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <span className="text-success-600">✓</span>
                          <span className="text-sm font-medium text-success-700">Uğurlu əməliyyat</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card variant="warning" size="sm">
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <span className="text-warning-600">⚠</span>
                          <span className="text-sm font-medium text-warning-700">Diqqət məlumat</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card variant="error" size="sm">
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <span className="text-error-600">✕</span>
                          <span className="text-sm font-medium text-error-700">Xəta mesajı</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card variant="info" size="sm">
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <span className="text-info-600">ℹ</span>
                          <span className="text-sm font-medium text-info-700">Məlumat</span>
                        </div>
                      </CardContent>
                    </Card>
                  </CardGrid>
                </div>

                {/* Stats Cards */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-3">Statistics Cards</h4>
                  <CardGrid cols={{ default: 1, md: 2, lg: 4 }}>
                    <StatsCard
                      value="1,234"
                      label="Aktiv istifadəçi"
                      change={{ value: "+12%", type: "increase" }}
                      icon={<span className="text-xl">👥</span>}
                    />
                    <StatsCard
                      value="567"
                      label="Tamamlanmış anket"
                      change={{ value: "+5%", type: "increase" }}
                      icon={<span className="text-xl">📊</span>}
                    />
                    <StatsCard
                      value="89"
                      label="Aktiv məktəb"
                      change={{ value: "-2%", type: "decrease" }}
                      icon={<span className="text-xl">🏫</span>}
                    />
                    <StatsCard
                      value="456"
                      label="Aylıq hesabat"
                      change={{ value: "0%", type: "neutral" }}
                      icon={<span className="text-xl">📄</span>}
                    />
                  </CardGrid>
                </div>

                {/* Feature Cards */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-3">Feature Cards</h4>
                  <CardGrid cols={{ default: 1, md: 2, lg: 3 }}>
                    <FeatureCard
                      title="İstifadəçi İdarəetməsi"
                      description="Sistem istifadəçilərini idarə edin, rollar təyin edin və icazələri konfiqurasiya edin."
                      icon={<span className="text-xl">👤</span>}
                      status="active"
                      actions={
                        <Button size="sm" variant="outline" className="w-full">
                          İdarə et
                        </Button>
                      }
                    />
                    <FeatureCard
                      title="Anket Sistemi"
                      description="Müxtəlif anketlər yaradın, paylaşın və nəticələri analiz edin."
                      icon={<span className="text-xl">📋</span>}
                      status="active"
                      actions={
                        <Button size="sm" variant="primary" className="w-full">
                          Başla
                        </Button>
                      }
                    />
                    <FeatureCard
                      title="AI Analitika"
                      description="Süni intellekt ilə daha dərin analiz və proqnozlar əldə edin."
                      icon={<span className="text-xl">🤖</span>}
                      status="coming-soon"
                      actions={
                        <Button size="sm" variant="ghost" className="w-full" disabled>
                          Gözləyin
                        </Button>
                      }
                    />
                  </CardGrid>
                </div>

                {/* Interactive Cards */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-3">Interactive Cards</h4>
                  <CardGrid cols={{ default: 1, md: 2 }}>
                    <Card interactive onClick={() => alert('Card clicked!')}>
                      <CardHeader>
                        <CardTitle>Clickable Card</CardTitle>
                        <CardDescription>Bu card clickable-dır</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-neutral-600">
                          Bu card-ı click edin və alert görün.
                        </p>
                      </CardContent>
                    </Card>

                    <Card loading>
                      <CardHeader>
                        <CardTitle>Loading Card</CardTitle>
                        <CardDescription>Loading state göstərir</CardDescription>
                      </CardHeader>
                    </Card>
                  </CardGrid>
                </div>
              </div>

              {/* Legacy Cards for Comparison */}
              <div>
                <h4 className="text-sm font-medium text-neutral-600 mb-3">Legacy Cards (Comparison)</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="card p-6">
                    <h5 className="text-lg font-medium text-neutral-900 mb-2">Legacy Simple</h5>
                    <p className="text-neutral-600">Legacy card with old system.</p>
                  </div>
                  <div className="card-elevated p-6">
                    <h5 className="text-lg font-medium text-neutral-900 mb-2">Legacy Elevated</h5>
                    <p className="text-neutral-600">Legacy card with old system.</p>
                  </div>
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 rounded-lg">
                    <h5 className="text-lg font-medium mb-2">Legacy Gradient</h5>
                    <p className="text-primary-100">Legacy gradient card.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* New Form Component System */}
            <div>
              <h3 className="text-lg font-medium text-neutral-700 mb-3">New Form System</h3>
              
              <div className="space-y-8">
                {/* Input Variants */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-4">Input Variants</h4>
                  <FormGrid cols={{ default: 1, md: 2 }}>
                    <FormField>
                      <FormLabel>Default Input</FormLabel>
                      <Input placeholder="Enter text here..." />
                      <FormDescription>Bu default input komponentidir</FormDescription>
                    </FormField>

                    <FormField>
                      <FormLabel>Input with Icons</FormLabel>
                      <Input 
                        placeholder="Search..."
                        leftIcon={<span>🔍</span>}
                        rightIcon={<span>✨</span>}
                      />
                    </FormField>

                    <FormField>
                      <FormLabel>Success State</FormLabel>
                      <Input 
                        placeholder="Valid input..."
                        success
                        rightIcon={<span className="text-success-500">✓</span>}
                      />
                      <FormMessage success>Bu field düzgün doldurulub</FormMessage>
                    </FormField>

                    <FormField>
                      <FormLabel>Error State</FormLabel>
                      <Input 
                        placeholder="Invalid input..."
                        error
                        rightIcon={<span className="text-error-500">✕</span>}
                      />
                      <FormMessage error>Bu field xətalıdır</FormMessage>
                    </FormField>

                    <FormField>
                      <FormLabel>Loading Input</FormLabel>
                      <Input 
                        placeholder="Processing..."
                        loading
                      />
                    </FormField>

                    <FormField>
                      <FormLabel>Disabled Input</FormLabel>
                      <Input 
                        placeholder="Disabled..."
                        disabled
                        value="Read only value"
                      />
                    </FormField>
                  </FormGrid>
                </div>

                {/* Different Input Types */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-4">Input Types</h4>
                  <FormGrid cols={{ default: 1, md: 2, lg: 3 }}>
                    <FormField>
                      <FormLabel>Email</FormLabel>
                      <Input 
                        type="email" 
                        placeholder="user@example.com"
                        leftIcon={<span>📧</span>}
                      />
                    </FormField>

                    <FormField>
                      <FormLabel>Password</FormLabel>
                      <Input 
                        type="password" 
                        placeholder="********"
                        leftIcon={<span>🔒</span>}
                      />
                    </FormField>

                    <FormField>
                      <FormLabel>Number</FormLabel>
                      <Input 
                        type="number" 
                        placeholder="0"
                        leftIcon={<span>🔢</span>}
                      />
                    </FormField>

                    <FormField>
                      <FormLabel>Date</FormLabel>
                      <Input 
                        type="date"
                        leftIcon={<span>📅</span>}
                      />
                    </FormField>

                    <FormField>
                      <FormLabel>Time</FormLabel>
                      <Input 
                        type="time"
                        leftIcon={<span>⏰</span>}
                      />
                    </FormField>

                    <FormField>
                      <FormLabel>URL</FormLabel>
                      <Input 
                        type="url" 
                        placeholder="https://example.com"
                        leftIcon={<span>🌐</span>}
                      />
                    </FormField>
                  </FormGrid>
                </div>

                {/* Textarea & Select */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-4">Textarea & Select</h4>
                  <FormGrid cols={{ default: 1, md: 2 }}>
                    <FormField>
                      <FormLabel>Textarea</FormLabel>
                      <Textarea 
                        placeholder="Write your message here..."
                        rows={4}
                      />
                      <FormDescription>Maximum 500 characters</FormDescription>
                    </FormField>

                    <FormField>
                      <FormLabel required>Select Option</FormLabel>
                      <Select placeholder="Choose an option...">
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </Select>
                      <FormDescription>This field is required</FormDescription>
                    </FormField>
                  </FormGrid>
                </div>

                {/* Checkbox & Radio */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-4">Checkbox & Radio</h4>
                  <div className="space-y-6">
                    <div>
                      <FormLabel className="text-base mb-3 block">Checkbox Options</FormLabel>
                      <div className="space-y-3">
                        <Checkbox 
                          label="Default checkbox"
                          description="This is a basic checkbox"
                        />
                        <Checkbox 
                          label="Success checkbox"
                          description="This checkbox has success state"
                          success
                          defaultChecked
                        />
                        <Checkbox 
                          label="Error checkbox"
                          description="This checkbox has error state"
                          error
                        />
                        <Checkbox 
                          label="Large checkbox"
                          description="This is a large checkbox"
                          size="lg"
                        />
                        <Checkbox 
                          label="Disabled checkbox"
                          description="This checkbox is disabled"
                          disabled
                        />
                      </div>
                    </div>

                    <div>
                      <FormLabel className="text-base mb-3 block">Radio Options</FormLabel>
                      <div className="space-y-3">
                        <Radio 
                          name="radio-group"
                          label="Option 1"
                          description="First radio option"
                          value="option1"
                        />
                        <Radio 
                          name="radio-group"
                          label="Option 2"
                          description="Second radio option"
                          value="option2"
                          defaultChecked
                        />
                        <Radio 
                          name="radio-group"
                          label="Option 3"
                          description="Third radio option"
                          value="option3"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Groups & Layouts */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-4">Form Groups</h4>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle level={5}>User Information</CardTitle>
                        <CardDescription>Enter your personal details</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormGrid cols={{ default: 1, md: 2 }}>
                          <FormField>
                            <FormLabel required>First Name</FormLabel>
                            <Input placeholder="John" />
                          </FormField>
                          <FormField>
                            <FormLabel required>Last Name</FormLabel>
                            <Input placeholder="Doe" />
                          </FormField>
                          <FormField className="md:col-span-2">
                            <FormLabel required>Email Address</FormLabel>
                            <Input 
                              type="email" 
                              placeholder="john.doe@example.com"
                              leftIcon={<span>📧</span>}
                            />
                          </FormField>
                          <FormField className="md:col-span-2">
                            <FormLabel>Bio</FormLabel>
                            <Textarea 
                              placeholder="Tell us about yourself..."
                              rows={3}
                            />
                          </FormField>
                        </FormGrid>
                      </CardContent>
                      <CardFooter>
                        <FormGroup orientation="horizontal" gap="sm">
                          <Button variant="outline">Cancel</Button>
                          <Button>Save Information</Button>
                        </FormGroup>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Legacy Forms for Comparison */}
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <h4 className="text-sm font-medium text-neutral-600 mb-4">Legacy Forms (Comparison)</h4>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Legacy Text Input
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter text here..."
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Legacy Select
                    </label>
                    <select className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors">
                      <option>Legacy seçim...</option>
                      <option>Legacy Option 1</option>
                      <option>Legacy Option 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-700">Legacy checkbox</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* New Modal System */}
            <div>
              <h3 className="text-lg font-medium text-neutral-700 mb-3">Modal System</h3>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setShowModal(true)}>
                    Open Modal
                  </Button>
                  <Button 
                    variant="error" 
                    onClick={() => setShowConfirmModal(true)}
                  >
                    Confirm Dialog
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowLoadingOverlay(true)}
                  >
                    Loading Overlay
                  </Button>
                </div>

                <Modal open={showModal} onClose={() => setShowModal(false)}>
                  <ModalHeader onClose={() => setShowModal(false)}>
                    <ModalTitle>Modal Title</ModalTitle>
                    <ModalDescription>Bu modal test üçün yaradılmışdır</ModalDescription>
                  </ModalHeader>
                  <ModalContent>
                    <p className="text-neutral-700">
                      Bu modal komponenti Tailwind CSS ilə yaradılmışdır. 
                      Focus management, keyboard navigation və accessibility dəstəyi var.
                    </p>
                    <div className="mt-4 space-y-3">
                      <FormField>
                        <FormLabel>Test Input</FormLabel>
                        <Input placeholder="Modal içində input test..." />
                      </FormField>
                    </div>
                  </ModalContent>
                  <ModalFooter>
                    <Button variant="outline" onClick={() => setShowModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowModal(false)}>
                      Save Changes
                    </Button>
                  </ModalFooter>
                </Modal>

                <ConfirmModal
                  open={showConfirmModal}
                  onClose={() => setShowConfirmModal(false)}
                  title="Əmin misiniz?"
                  message="Bu əməliyyat geri alına bilməz. Davam etmək istədiyinizə əmin misiniz?"
                  confirmText="Bəli, davam et"
                  cancelText="Xeyr, ləğv et"
                  confirmVariant="error"
                  onConfirm={() => {
                    alert('Təsdiqləndi!');
                    setShowConfirmModal(false);
                  }}
                  onCancel={() => setShowConfirmModal(false)}
                />

                <LoadingOverlay
                  visible={showLoadingOverlay}
                  message="Yüklənir, zəhmət olmasa gözləyin..."
                  onClose={() => setShowLoadingOverlay(false)}
                />
              </div>
            </div>

            {/* New Loading System */}
            <div>
              <h3 className="text-lg font-medium text-neutral-700 mb-3">Loading System</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-3">Spinners</h4>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-center space-y-2">
                      <Spinner size="xs" />
                      <span className="text-xs text-neutral-500">XS</span>
                    </div>
                    <div className="text-center space-y-2">
                      <Spinner size="sm" />
                      <span className="text-xs text-neutral-500">SM</span>
                    </div>
                    <div className="text-center space-y-2">
                      <Spinner size="md" />
                      <span className="text-xs text-neutral-500">MD</span>
                    </div>
                    <div className="text-center space-y-2">
                      <Spinner size="lg" />
                      <span className="text-xs text-neutral-500">LG</span>
                    </div>
                    <div className="text-center space-y-2">
                      <Spinner size="xl" variant="success" />
                      <span className="text-xs text-neutral-500">Success</span>
                    </div>
                    <div className="text-center space-y-2">
                      <DotsSpinner size="md" variant="primary" />
                      <span className="text-xs text-neutral-500">Dots</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-3">Progress Bars</h4>
                  <div className="space-y-4 max-w-md">
                    <Progress 
                      value={progress} 
                      variant="primary" 
                      showValue 
                      label="Upload Progress"
                    />
                    <Progress 
                      value={85} 
                      variant="success" 
                      size="sm"
                    />
                    <Progress 
                      value={45} 
                      variant="warning" 
                      size="lg"
                    />
                    <Progress 
                      indeterminate 
                      variant="info" 
                      label="Processing..."
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => setProgress(Math.max(0, progress - 10))}
                      >
                        -10%
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => setProgress(Math.min(100, progress + 10))}
                      >
                        +10%
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-3">Skeletons</h4>
                  <div className="space-y-4">
                    <Card>
                      <CardContent>
                        <LoadingState layout="card" />
                      </CardContent>
                    </Card>
                    <div>
                      <LoadingState layout="list" lines={3} avatar />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">Custom Skeletons</h5>
                      <div className="flex items-center space-x-3">
                        <Skeleton width="3rem" height="3rem" className="rounded-full" shimmer />
                        <div className="space-y-2 flex-1">
                          <Skeleton height="1rem" width="60%" shimmer />
                          <Skeleton height="0.75rem" width="80%" shimmer />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* New Alert System */}
            <div>
              <h3 className="text-lg font-medium text-neutral-700 mb-3">Alert System</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-3">Alerts</h4>
                  <div className="space-y-3">
                    <Alert variant="success" title="Uğurlu əməliyyat" dismissible>
                      Məlumatlarınız uğurla yadda saxlanıldı.
                    </Alert>
                    <Alert variant="warning" title="Diqqət" dismissible>
                      Bu əməliyyat geri alına bilməz.
                    </Alert>
                    <Alert variant="error" title="Xəta baş verdi" dismissible>
                      Əlaqə serverləri ilə bağlantı problemi yaranıb.
                    </Alert>
                    <Alert variant="info" dismissible>
                      Sistem yenilənməsi 2 saat sonra başlayacaq.
                    </Alert>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-3">Notifications</h4>
                  <div className="space-y-3 max-w-md">
                    <Notification
                      variant="success"
                      title="Yeni mesaj"
                      message="Admininistratordan yeni mesajınız var"
                      avatar={
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm">
                          A
                        </div>
                      }
                      actions={[
                        { label: 'Oxu', onClick: () => alert('Oxundu'), variant: 'primary' },
                        { label: 'Sil', onClick: () => alert('Silindi') }
                      ]}
                    />
                    <Notification
                      variant="warning"
                      title="Sistem yenilənməsi"
                      message="5 dəqiqə sonra sistem texniki xidmətə gedəcək"
                      read={false}
                      timestamp={new Date(Date.now() - 300000)}
                    />
                    <Notification
                      title="Faydalı məlumat"
                      message="Yeni funksiyalar haqqında məlumat əldə edin"
                      read={true}
                      timestamp={new Date(Date.now() - 3600000)}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-neutral-600 mb-3">Toast Messages</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => setShowToast(true)}
                    >
                      Show Toast
                    </Button>
                  </div>
                  
                  {showToast && (
                    <div className="fixed top-4 right-4 z-50">
                      <Toast
                        variant="success"
                        title="Əməliyyat uğurlu"
                        description="Məlumatlarınız yadda saxlanıldı"
                        duration={3000}
                        onClose={() => setShowToast(false)}
                        action={{
                          label: 'Geri al',
                          onClick: () => alert('Geri alındı')
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Layout System</h2>
            
            {/* Grid System */}
            <div>
              <h3 className="text-lg font-medium text-neutral-700 mb-3">Grid System</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="bg-primary-100 p-4 rounded-lg text-center">
                    <span className="text-primary-700 font-medium">Grid {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Flexbox Layouts */}
            <div>
              <h3 className="text-lg font-medium text-neutral-700 mb-3">Flexbox Layouts</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-neutral-100 p-4 rounded-lg">
                  <span>Left aligned</span>
                  <span>Right aligned</span>
                </div>
                <div className="flex items-center justify-center bg-neutral-100 p-4 rounded-lg">
                  <span>Center aligned</span>
                </div>
                <div className="flex items-center space-x-4 bg-neutral-100 p-4 rounded-lg">
                  <div className="w-12 h-12 bg-primary-500 rounded-full"></div>
                  <div>
                    <h4 className="font-medium">İstifadəçi Adı</h4>
                    <p className="text-sm text-neutral-600">user@example.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Responsive Design */}
            <div>
              <h3 className="text-lg font-medium text-neutral-700 mb-3">Responsive Design</h3>
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white p-6 rounded-lg">
                <h4 className="text-xl font-semibold mb-2">Responsive Example</h4>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl">
                  Bu text ekran ölçüsünə görə dəyişir: 
                  <span className="hidden sm:inline"> tablet+</span>
                  <span className="hidden md:inline"> desktop+</span>
                  <span className="hidden lg:inline"> large desktop+</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="text-center text-neutral-500">
            <p className="text-sm">
              ATİS Tailwind CSS Integration Test • 
              <span className="font-medium text-primary-600"> Design System v1.0</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;