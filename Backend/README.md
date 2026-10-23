# Pragati Nursery — Spring Boot 3 Backend

Production-ready REST API backend for the **Pragati Nursery** E-commerce platform built with **Java 21**, **Spring Boot 3**, **Spring Data JPA**, **Flyway**, **Spring Security**, and **MySQL 8**.

---

## 🚀 Technology Stack
- **Language**: Java 21 (LTS)
- **Framework**: Spring Boot 3.2.3
- **Database**: MySQL 8.0
- **Migrations**: Flyway Migration Tool
- **Security**: Spring Security + JWT Authentication
- **Build Tool**: Apache Maven
- **Containerization**: Docker & Docker Compose

---

## 📁 Package Architecture (`com.pragatinursery`)
```text
com.pragatinursery
├── config            # WebMvc static resource handlers & DataInitializer seeder
├── common            # Enums, Global Exception Handler & API Response wrappers
├── security          # Spring Security 6 & CORS Configuration
├── auth              # User & RefreshToken entities, repositories
├── catalog           # Category, Product, ProductImage, ProductVideo, Specs, Care
├── account           # Address management entities & repositories
├── cart              # Cart & CartItem persistence entities & repositories
├── wishlist          # Customer wishlist entity & repository
├── order             # Order & OrderItem entities & repositories
├── payment           # COD & Razorpay payment log entity & repository
└── media             # Direct upload file configuration structure
```

---

## 🛠️ Prerequisites
- JDK 21 (Java Development Kit)
- Apache Maven 3.8+
- MySQL 8.0 Server running on port `3306`

---

## ⚙️ Environment Configuration
1. Copy `.env.example` to `.env` or set environment variables:
   ```env
   DB_URL=jdbc:mysql://localhost:3306/pragati_nursery?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   DB_USERNAME=root
   DB_PASSWORD=your_password
   JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
   JWT_ACCESS_TOKEN_EXPIRATION=900000
   JWT_REFRESH_TOKEN_EXPIRATION=604800000
   UPLOAD_DIRECTORY=./backend-uploads
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   ```

---

## 🏃 Running Locally

### 1. Create MySQL Database
```sql
CREATE DATABASE IF NOT EXISTS pragati_nursery;
```

### 2. Build & Run Application
```bash
# Navigate to Backend folder
cd Backend

# Build project with Maven
mvn clean package -DskipTests

# Run Spring Boot application
mvn spring-boot:run
```

---

## 🐳 Running with Docker Compose
```bash
# From workspace root directory
docker compose up --build
```
This automatically starts MySQL 8 and the Spring Boot Backend server.

---

## 🏥 Health Check Endpoint
To verify server and database connectivity:
```bash
curl http://localhost:8080/actuator/health
```
**Expected Response**:
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL",
        "validationQuery": "isValid()"
      }
    }
  }
}
```

---

## 🌱 Development Data Seeding
On first startup when database tables are empty:
- Seeds 1 default Admin Account (`admin@pragatinursery.in` / `admin123`).
- Seeds 7 Nursery Categories & 8 Nursery Products matching `Frontend/types/product.ts`.
- `DataInitializer` checks existing counts and skips automatically on subsequent restarts to prevent duplicate records.
