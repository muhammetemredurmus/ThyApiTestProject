---
name: API Test Automation Framework
overview: TypeScript ve Playwright kullanarak DummyJSON API'si için kapsamlı bir test otomasyon framework'ü oluşturulacak. TestContainers ile PostgreSQL entegrasyonu, design pattern'ler ve tüm CRUD test senaryoları implement edilecek.
todos:
  - id: setup-project
    content: Proje yapısını oluştur, package.json, tsconfig.json, playwright.config.ts dosyalarını hazırla
    status: completed
  - id: config-management
    content: Singleton pattern ile config management sistemi oluştur (property file + env var override)
    status: completed
    dependencies:
      - setup-project
  - id: database-service
    content: TestContainers ile PostgreSQL entegrasyonu, schema/table auto-creation, Singleton DB service
    status: completed
    dependencies:
      - setup-project
      - config-management
  - id: design-patterns
    content: Factory (UserFactory, RequestFactory), Builder (UserBuilder), Repository (ApiLogRepository) pattern'lerini implement et
    status: completed
    dependencies:
      - setup-project
  - id: api-client
    content: API client service oluştur, request/response intercepting ve DB logging ekle
    status: completed
    dependencies:
      - config-management
      - database-service
  - id: user-crud-tests
    content: User CRUD test senaryolarını yaz (@smoke ve @regression annotations ile)
    status: completed
    dependencies:
      - api-client
      - design-patterns
  - id: user-negative-tests
    content: User negative test senaryolarını yaz (validation, error handling)
    status: completed
    dependencies:
      - api-client
      - design-patterns
  - id: auth-tests
    content: Authentication test senaryolarını yaz (login flow validation)
    status: completed
    dependencies:
      - api-client
  - id: array-response-tests
    content: Array response validation test senaryolarını yaz
    status: completed
    dependencies:
      - api-client
  - id: documentation
    content: README.md oluştur (setup, architecture, design patterns açıklaması)
    status: completed
    dependencies:
      - user-crud-tests
      - auth-tests
      - array-response-tests
---

# API Test

Automation Framework - Implementation Plan

## Proje Yapısı

```javascript
ThyApiCase/
├── src/
│   ├── config/
│   │   ├── config.ts              # Singleton pattern - Config manager
│   │   └── database.config.ts     # DB connection config
│   ├── models/
│   │   ├── user.model.ts          # User entity model
│   │   └── api-response.model.ts  # API response models
│   ├── services/
│   │   ├── api-client.service.ts  # API client service
│   │   ├── database.service.ts    # Database service (Singleton)
│   │   └── auth.service.ts        # Authentication service
│   ├── factories/
│   │   ├── user.factory.ts        # Factory pattern - Test data generation
│   │   └── request.factory.ts     # Request builder factory
│   ├── builders/
│   │   └── user.builder.ts        # Builder pattern - User object construction
│   ├── repositories/
│   │   └── api-log.repository.ts  # Repository pattern - DB operations
│   ├── utils/
│   │   ├── database.util.ts       # DB schema/table creation utilities
│   │   └── validation.util.ts       # Response validation utilities
│   └── types/
│       └── index.ts                # TypeScript type definitions
├── tests/
│   ├── user/
│   │   ├── user-crud.spec.ts      # User CRUD tests
│   │   └── user-negative.spec.ts   # Negative test scenarios
│   ├── auth/
│   │   └── auth.spec.ts            # Authentication tests
│   └── array-response/
│       └── array-response.spec.ts  # Array response validation tests
├── config/
│   └── application.properties      # Configuration file
├── .env.example                     # Environment variables template
├── package.json
├── tsconfig.json
├── playwright.config.ts
└── README.md
```



## Implementation Details

### 1. Proje Kurulumu ve Dependencies

**Package.json dependencies:**

- `@playwright/test` - Test framework
- `typescript` - TypeScript support
- `testcontainers` - PostgreSQL container management
- `pg` - PostgreSQL client
- `dotenv` - Environment variable management
- `@types/node`, `@types/pg` - Type definitions

### 2. Configuration Management (Singleton Pattern)

**src/config/config.ts:**

- Singleton pattern ile config instance
- Property dosyasından okuma (`application.properties`)
- Environment variable override (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- Base URL ve test credentials yönetimi

### 3. Database Integration (TestContainers)

**src/services/database.service.ts:**

- Singleton pattern ile DB connection
- TestContainers ile PostgreSQL container başlatma
- Auto schema creation (`api_test` schema)
- Auto table creation:
- `api_requests` table (request logging)
- `api_responses` table (response logging)
- Connection pooling ve lifecycle management

**Database Schema:**

```sql
CREATE SCHEMA IF NOT EXISTS api_test;

CREATE TABLE IF NOT EXISTS api_test.api_requests (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(500),
    method VARCHAR(10),
    headers JSONB,
    body JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_test.api_responses (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES api_test.api_requests(id),
    status_code INTEGER,
    headers JSONB,
    body JSONB,
    response_time_ms INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```



### 4. Design Patterns Implementation

**Singleton:**

- `Config` class - Tek config instance
- `DatabaseService` class - Tek DB connection instance

**Factory:**

- `UserFactory` - Test user data generation
- `RequestFactory` - API request object creation

**Builder:**

- `UserBuilder` - Fluent interface ile user object construction
- Request builder pattern

**Repository:**

- `ApiLogRepository` - Database operations abstraction

### 5. API Client Service

**src/services/api-client.service.ts:**

- Playwright APIRequestContext kullanımı
- Request/Response intercepting ve database logging
- Error handling ve retry logic
- Base URL ve authentication token management

### 6. Test Senaryoları

**tests/user/user-crud.spec.ts:**

- `@smoke` annotation: Kritik testler (GET user, POST user)
- `@regression` annotation: Tüm testler
- User listeleme (pagination: limit, skip parametreleri)
- Tekil kullanıcı sorgulama (GET /users/:id)
- Kullanıcı oluşturma (POST /users/add)
- Kullanıcı güncelleme (PUT /users/:id, PATCH /users/:id)
- Kullanıcı silme (DELETE /users/:id)

**tests/user/user-negative.spec.ts:**

- Invalid user ID ile sorgulama
- Eksik required field'lar ile user creation
- Invalid data types ile user creation
- Non-existent user update/delete
- Invalid authentication scenarios

**tests/auth/auth.spec.ts:**

- `@smoke` annotation
- Login flow validasyonu (POST /auth/login)
- Token validation
- Invalid credentials scenarios

**tests/array-response/array-response.spec.ts:**

- GET /users array response validation
- Belirli bir user'ı array'den çekme ve doğrulama
- Pagination ile array response validation

### 7. Test Data Management

**src/factories/user.factory.ts:**

- Random user data generation
- Valid/Invalid user data scenarios
- Test data cleanup utilities

### 8. Playwright Configuration

**playwright.config.ts:**

- TypeScript configuration
- Test timeout settings
- HTML report configuration
- Test grouping configuration
- Global setup/teardown hooks (DB container lifecycle)

### 9. Utility Functions

**src/utils/database.util.ts:**

- Schema existence check ve creation
- Table existence check ve creation
- Migration utilities

**src/utils/validation.util.ts:**

- Response schema validation
- Status code validation
- Data type validation

### 10. Documentation

**README.md:**

- Proje açıklaması
- Architecture diagram (mermaid)
- Setup instructions
- Environment variables
- Test execution commands
- Design patterns açıklaması
- Database schema documentation

## Test Execution Strategy

1. **Smoke Tests:** `npx playwright test --grep @smoke`
2. **Regression Tests:** `npx playwright test --grep @regression`
3. **All Tests:** `npx playwright test`
4. **HTML Report:** `npx playwright show-report`

## Key Features

- ✅ TypeScript + Playwright
- ✅ Design Patterns (Singleton, Factory, Builder, Repository)
- ✅ TestContainers PostgreSQL integration
- ✅ Auto schema/table creation
- ✅ Config file + Environment variable override
- ✅ Request/Response database logging