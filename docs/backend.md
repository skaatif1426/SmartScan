# Enterprise Spring Boot Architecture Blueprint (v1.0.0)

## 1. Project Architecture: Layered Enterprise Pattern
The backend follows a **Layered Architecture** to ensure strict separation of concerns and testability.

### Package Structure
- `com.nutriscan.api`: Controller layer (REST endpoints, Request/Response mapping).
- `com.nutriscan.service`: Business logic layer (Transactions, domain rules).
- `com.nutriscan.repository`: Data access layer (JPA/Hibernate).
- `com.nutriscan.domain`: Core entities and value objects.
- `com.nutriscan.dto`: Data Transfer Objects for API contracts.
- `com.nutriscan.exception`: Global exception handling logic.
- `com.nutriscan.config`: Security, CORS, and Bean configurations.

### DTO & Mapper Strategy
- **Pattern**: Never expose JPA Entities directly to the API.
- **Strategy**: Manual mapping in specialized `Mapper` classes for full control and performance, avoiding the "magic" overhead of MapStruct in high-throughput scenarios.

## 2. REST API Design Standards
- **Versioning**: All endpoints prefixed with `/api/v1/`.
- **Response Wrapper**: 
  ```json
  {
    "timestamp": "ISO-8601",
    "status": 200,
    "data": { ... },
    "errors": null
  }
  ```
- **Pagination**: Mandatory for all collection resources using `Pageable`.

## 3. Database Layer Design
- **Lazy Loading**: Default to `FetchType.LAZY` for all relationships to avoid memory bloat.
- **N+1 Prevention**: Use `EntityGraph` or `JOIN FETCH` queries for specific use cases.
- **Transaction Management**: `@Transactional(readOnly = true)` by default at the service level.

## 4. Security Architecture (Stateless JWT)
- **Spring Security**: Configured for `SessionCreationPolicy.STATELESS`.
- **JWT Flow**:
  1. Client sends credentials to `/api/v1/auth/login`.
  2. Server validates and returns an Access Token (Short-lived) and Refresh Token (Long-lived, stored in DB/Redis).
  3. Client includes `Authorization: Bearer <token>` in headers.
- **CORS**: Restricted to specific origins (e.g., your production domain) with `AllowCredentials(true)`.

## 5. Global Exception Handling
- **Mechanism**: `@RestControllerAdvice` capturing specific domain exceptions.
- **Hierarchy**: `BaseException` -> `EntityNotFoundException`, `UnauthorizedException`.

## 6. Performance & Scalability
- **Caching**: Spring Cache with Redis for product lookups.
- **Pools**: HikariCP for connection pooling; custom `ThreadPoolTaskExecutor` for `@Async` tasks.

## 7. Production Readiness
- **Docker**: Multi-stage builds for minimal image size.
- **Observability**: Spring Boot Actuator integrated with Prometheus/Grafana.
- **Documentation**: OpenAPI 3 (Swagger) enabled for `/swagger-ui.html`.
