# WebDelivery - Do an Backend He thong Giao Do An Da Cua Hang

## 1. Gioi thieu
WebDelivery la backend API cho he thong giao do an da cua hang, xay dung bang NestJS.
He thong ho tro:
- Dang ky, dang nhap, phan quyen JWT (Customer/Admin)
- Quan ly nha hang, menu, danh muc nha hang
- Dat hang, xu ly thanh toan, ma giam gia (voucher)
- Quan ly tai xe
- Caching danh sach nha hang bang Redis
- Tai lieu API bang Swagger va bo suu tap Postman

## 2. Cong nghe su dung
- NestJS 10
- TypeScript 5
- TypeORM 0.3
- MySQL 8
- Redis (ioredis)
- JWT + Passport
- class-validator + class-transformer
- Swagger/OpenAPI
- Jest + ts-jest

## 3. Cau truc thu muc
```text
WebDelivery/
|-- backend/
|   |-- src/
|   |   |-- app.module.ts
|   |   |-- main.ts
|   |   |-- common/
|   |   |   |-- decorators/
|   |   |   |-- guards/
|   |   |   |-- filters/
|   |   |   |-- interceptors/
|   |   |   `-- middleware/
|   |   |-- config/
|   |   |-- entities/
|   |   `-- modules/
|   |       |-- auth/
|   |       |-- users/
|   |       |-- drivers/
|   |       |-- restaurants/
|   |       |-- restaurant-categories/
|   |       |-- menu-groups/
|   |       |-- menu-items/
|   |       |-- orders/
|   |       |-- payments/
|   |       |-- vouchers/
|   |       `-- redis/
|   `-- package.json
|-- shopeefood.sql
|-- Delivery.postman_collection.json
`-- Delivery.postman_environment.json
```

## 4. Kien truc he thong
- Global Prefix API: `/api/v1`
- Global Guard:
  - JwtAuthGuard: bao ve route mac dinh
  - RolesGuard: kiem tra role qua `@Roles(...)`
- Global Interceptor:
  - LoggingInterceptor: log request/response
  - TransformInterceptor: dong goi response thanh format thong nhat
- Global Filter:
  - HttpExceptionFilter: dong goi loi theo format thong nhat
- Middleware:
  - RequestLoggerMiddleware: log truoc/sau moi request

## 5. Cac module chinh
### Auth
- Dang ky tai khoan
- Dang nhap lay access token + refresh token
- Doi mat khau
- Refresh token

### Users
- Xem profile hien tai
- CRUD nguoi dung (admin)
- Kich hoat/vo hieu hoa user
- Thong ke dat hang theo user

### Restaurants
- CRUD nha hang (admin)
- Lay danh sach/chi tiet nha hang (public)
- Loc theo category
- Cache danh sach bang Redis

### Restaurant Categories
- CRUD danh muc nha hang
- Gan category cho nha hang theo many-to-many

### Menu Groups
- Quan ly nhom mon theo nha hang

### Menu Items
- Quan ly mon an theo nha hang/nhom mon

### Orders
- Tao don hang theo danh sach mon
- Ap voucher khi tao don
- Quan ly trang thai don hang
- Tu dong dong bo trang thai payment khi huy don

### Payments
- Tao payment cho don hang
- Confirm payment (admin)
- Cancel payment (customer)
- Refund payment (admin)

### Vouchers
- CRUD voucher
- Kiem tra voucher theo code
- Kich hoat/tat voucher
- Thong ke su dung voucher

### Drivers
- CRUD tai xe
- Cap nhat thong tin tai xe

### Redis
- Dich vu cache tong quat
- Dang dung cho restaurants list

## 6. Mo hinh du lieu (tom tat)
Cac entity chinh:
- User
- Driver
- Restaurant
- RestaurantCategory
- MenuGroup
- MenuItem
- Order
- OrderDetail
- Payment
- Voucher

Quan he noi bat:
- User 1-N Order
- Restaurant 1-N MenuGroup, 1-N MenuItem, 1-N Order
- Order 1-N OrderDetail
- Order 1-1 Payment
- Restaurant N-N RestaurantCategory
- Voucher 1-N Order (nullable)
- Driver 1-N Order (nullable)

## 7. Luong nghiep vu quan trong
### 7.1 Dat hang
1. User gui danh sach item + restaurant_id + voucher_id (neu co)
2. He thong validate item va voucher
3. Tinh tong tien va giam gia
4. Tao Order + OrderDetail trong transaction
5. Cap nhat thong ke voucher neu da dung

### 7.2 Thanh toan
1. Tao payment cho order voi status ban dau `PENDING`
2. Admin confirm payment -> `COMPLETED` va order duoc `CONFIRMED`
3. Customer co the huy payment khi con `PENDING` -> `FAILED`
4. Admin co the refund payment da `COMPLETED` -> `REFUNDED`

### 7.3 Huy don hang
- Khi order bi set `CANCELLED`:
  - payment `COMPLETED` -> `REFUNDED`
  - payment `PENDING` -> `FAILED`

## 8. Cai dat va chay du an
## 8.1 Yeu cau
- Node.js 18+ (khuyen nghi LTS)
- npm
- MySQL 8+
- Redis (khuyen nghi cho cache)

## 8.2 Cai dependency
```bash
cd backend
npm install
```

## 8.3 Tao file .env
Tao file `backend/.env` voi noi dung mau:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=shopeefood

JWT_SECRET=default-secret
JWT_EXPIRES_IN=7d

CORS_ORIGIN=*

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_CACHE_TTL=60
```

## 8.4 Khoi tao database
- Cach 1: Import file SQL
  - File: `shopeefood.sql`
- Cach 2: De TypeORM tu sync schema (chi nen dung moi truong dev)

## 8.5 Chay dev
```bash
cd backend
npm run start:dev
```

## 8.6 Build production
```bash
cd backend
npm run build
npm run start:prod
```

## 9. Tai lieu API
- Swagger UI: `http://localhost:3000/api/docs`
- Base URL: `http://localhost:3000/api/v1`

## 10. Nhom endpoint chinh
### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/change-password`
- `POST /auth/refresh`

### Users
- `GET /users` (admin)
- `GET /users/me`
- `GET /users/:id` (admin)
- `PATCH /users/me`
- `PATCH /users/:id` (admin)
- `PATCH /users/:id/activate` (admin)
- `PATCH /users/:id/deactivate` (admin)
- `GET /users/:id/statistics` (admin)
- `DELETE /users/:id` (admin)

### Restaurants
- `GET /restaurants`
- `GET /restaurants/:id`
- `POST /restaurants` (admin)
- `PATCH /restaurants/:id` (admin)
- `DELETE /restaurants/:id` (admin)

### Restaurant Categories
- `GET /restaurant-categories`
- `GET /restaurant-categories/:id`
- `POST /restaurant-categories` (admin)
- `PATCH /restaurant-categories/:id` (admin)
- `DELETE /restaurant-categories/:id` (admin)

### Menu Groups
- `GET /menu-groups/by-restaurant/:restaurantId`
- `GET /menu-groups/:id`
- `POST /menu-groups` (admin)
- `PATCH /menu-groups/:id` (admin)
- `DELETE /menu-groups/:id` (admin)

### Menu Items
- `GET /menu-items/by-restaurant/:restaurantId`
- `GET /menu-items/:id`
- `POST /menu-items` (admin)
- `PATCH /menu-items/:id` (admin)
- `DELETE /menu-items/:id` (admin)

### Orders
- `POST /orders`
- `GET /orders` (admin)
- `GET /orders/my-orders`
- `GET /orders/:id`
- `PATCH /orders/:id/status` (admin)

### Payments
- `POST /payments`
- `GET /payments` (admin)
- `GET /payments/my-payments`
- `GET /payments/by-order/:orderId`
- `GET /payments/:id`
- `PATCH /payments/:id/confirm` (admin)
- `PATCH /payments/:id/cancel`
- `PATCH /payments/:id/refund` (admin)

### Vouchers
- `GET /vouchers` (admin)
- `GET /vouchers/check?code=...`
- `POST /vouchers` (admin)
- `PATCH /vouchers/:id` (admin)
- `PATCH /vouchers/:id/activate` (admin)
- `PATCH /vouchers/:id/deactivate` (admin)
- `GET /vouchers/:id/statistics` (admin)
- `DELETE /vouchers/:id` (admin)

### Drivers
- `GET /drivers` (admin)
- `GET /drivers/:id`
- `POST /drivers` (admin)
- `PATCH /drivers/:id`
- `DELETE /drivers/:id` (admin)

## 11. Roles va bao mat
- Role:
  - `customer`
  - `admin`
- Route public duoc danh dau boi `@Public()`
- Route quan tri duoc bao ve boi `@Roles(Role.ADMIN)`
- JWT guard va roles guard duoc dang ky global

## 12. Test
Chay unit test:
```bash
cd backend
npm test -- --runInBand
```

Bao cao do phu:
```bash
npm run test:cov
```

Trang thai hien tai:
- Build: pass
- Test suites: 6/6 pass
- Tests: 46/46 pass

## 13. Postman
Tai lieu test API da co san:
- `Delivery.postman_collection.json`
- `Delivery.postman_environment.json`

Import 2 file nay vao Postman, sau do cap nhat base URL/environment theo may cua ban.

## 14. Ghi chu trien khai
- Nen tat `synchronize` khi dua len production va dung migration
- Dat `JWT_SECRET` manh trong production
- Cau hinh CORS theo domain frontend that
- Nen dung Redis de toi uu truy van danh sach nha hang

