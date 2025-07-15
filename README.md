# ATİS - Azərbaycan Təhsil İdarəetmə Sistemi

[![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com)

## Layihə Haqqında

ATİS (Azərbaycan Təhsil İdarəetmə Sistemi) regional təhsil idarələrinin tam rəqəmsal transformasiyası üçün vahid, ierarxik idarəetmə platformasıdır. Sistem 700+ təhsil müəssisəsini əhatə edərək, məlumat toplama, təhlil və qərar qəbuletmə proseslərini avtomatlaşdırır.

## Texnoloji Stek

- **Backend**: Laravel 12 + PHP 8.2+
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Web Server**: Nginx
- **Container**: Docker + Docker Compose

## Sistemi İstifadəçilər

- **SuperAdmin** (1-2 istifadəçi) - Sistem administratoru
- **RegionAdmin** (10+ istifadəçi) - Regional idarəetmə rəhbəri
- **RegionOperator** (60+ istifadəçi) - Regional əməliyyat specialisti
- **SektorAdmin** (70+ istifadəçi) - Sektor rəhbəri
- **SchoolAdmin** (700 istifadəçi) - Təhsil müəssisəsi rəhbəri
- **Müəllim** (700+ istifadəçi) - Təhsil işçisi

## Lokal Quraşdırma

### Tələblər

- Docker Desktop 20.10+
- Docker Compose 2.0+
- Git
- 8GB RAM minimum (16GB tövsiyə olunur)

### Quraşdırma Addımları

1. **Repo-nu klonlayın:**
```bash
git clone [repository-url]
cd ATİS
```

2. **Sistemi Başladın:**
```bash
# Docker rejimində başladır
./start.sh

# Və ya lokal rejimində başladır
./start.sh local
```

3. **Environment fayllarını konfiqurasiya edin:**
```bash
# Backend environment
cp .env.example .env

# Frontend environment  
cp frontend/.env.example frontend/.env
```

3. **Docker konteynerləri başladın:**
```bash
docker-compose up -d
```

4. **Laravel dependency-ləri quraşdırın:**
```bash
docker-compose exec app composer install
```

5. **Application key yaradın:**
```bash
docker-compose exec app php artisan key:generate
```

6. **Database migrate edin:**
```bash
docker-compose exec app php artisan migrate
```

7. **Frontend dependency-ləri quraşdırın:**
```bash
cd frontend
npm install
```

### Giriş URL-ləri

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost/api/v1
- **Database**: localhost:5432
- **Redis**: localhost:6379

## Əsas Funksiyalar

### 1. Authentication & Authorization
- 6-səviyyəli ierarxik rol sistemi
- Laravel Sanctum authentication
- Session timeout: 8 saat
- Multi-device support (3 cihaz maksimum)

### 2. Sorğu Sistemi
- Dinamik form yaratma
- 8 növ sual tipi
- Target audience seçimi
- Approval workflow

### 3. Tapşırıq İdarəetməsi
- Task yaratma və təyinatı
- Progress tracking
- Deadline management
- File attachment

### 4. Sənəd İdarəetməsi
- PDF, Excel, Word dəstəyi
- Hierarchical access control
- Version control
- Link sharing

### 5. Real-time Bildirişlər
- In-app notifications
- Email notifications
- SMS alerts (kritik hallarda)

## Database Strukturu

### Əsas Cədvəllər
- `users` - İstifadəçi məlumatları
- `roles` - Rol və səlahiyyətlər
- `institutions` - Təhsil müəssisələri ierarxiyası
- `surveys` - Sorğu sistemi
- `survey_responses` - Sorğu cavabları
- `tasks` - Tapşırıq sistemi
- `documents` - Sənəd idarəetməsi

### İndekslər
Performance üçün optimize edilmiş indexing strategy:
- Composite indexes for complex queries
- Hierarchical queries optimization
- Time-based partitioning

## API Dokumentasiyası

### Base URL
```
http://localhost/api/v1/
```

### Authentication
```bash
# Login
POST /api/v1/auth/login
Content-Type: application/json
{
  "username": "admin",
  "password": "password"
}

# Response
{
  "token": "jwt_token_here",
  "user": {...},
  "permissions": [...]
}
```

### Əsas Endpoint-lər
- `GET /institutions` - Təhsil müəssisələri siyahısı
- `POST /surveys` - Sorğu yaratma
- `GET /surveys/{id}/responses` - Sorğu cavabları
- `POST /tasks` - Tapşırıq yaratma
- `GET /notifications` - Bildirişlər

## Performance Parametrləri

- **Concurrent Users**: 500 peak time
- **Page Load Time**: < 2 saniyə (95th percentile)
- **API Response Time**: < 300ms (orta)
- **Database Response**: < 100ms standard sorğular üçün
- **Uptime Target**: 99.8%

## Təhlükəsizlik

- TLS 1.3 encryption
- CORS policy configured
- XSS və CSRF protection
- File upload security scanning
- Rate limiting per role
- Audit logging

## Monitoring

### Performance Metrics
- Response time tracking
- Database query optimization
- Memory usage monitoring
- Redis cache hit ratio

### Business Metrics
- User adoption rate
- Survey response rate
- Task completion rate
- System usage analytics

## Test Etmə

```bash
# Backend testlər
docker-compose exec app php artisan test

# Frontend testlər
cd frontend
npm run test
```

## Production Deployment

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
Production üçün mütləq dəyişdirilməli dəyişənlər:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `DB_PASSWORD=secure_password`
- `REDIS_PASSWORD=secure_password`

## Backup Strategiyası

- **Database**: Gündəlik automated backup
- **Files**: Real-time sync to backup storage
- **Redis**: 6 saatda bir snapshot
- **Retention**: 30 gün

## Contribution Guidelines

1. Feature branch yaradın
2. Kod standartlarına uyğun yazın
3. Test yazın
4. Pull request göndərin
5. Code review gözləyin

## Support

- **Documentation**: `/documentation` qovluğu
- **Issues**: GitHub Issues
- **Email**: support@atis.edu.az

## License

ATİS - Azərbaycan Təhsil Nazirliyi üçün xüsusi hazırlanmış sistem.

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Developed by**: ATİS Development Team