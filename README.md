<div align="center">

# 🌟 VolunteerHub

**Nền tảng quản lý và kết nối tình nguyện viên hiện đại**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.8-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-tính-năng-chính) •
[Công nghệ](#-công-nghệ-sử-dụng) •
[Cài đặt](#-cài-đặt) •
[Sử dụng](#-sử-dụng) •
[API Documentation](#-api-documentation)

</div>

---

## 📋 Giới thiệu

**VolunteerHub** là một nền tảng web toàn diện giúp kết nối tình nguyện viên với các tổ chức, quản lý sự kiện tình nguyện, và tạo cộng đồng trao đổi sôi nổi. Hệ thống được xây dựng với kiến trúc hiện đại, giao diện thân thiện và tích hợp đầy đủ các tính năng từ quản lý người dùng đến thông báo realtime.

### 🎯 Mục tiêu

- 🤝 Kết nối tình nguyện viên với các sự kiện phù hợp
- 📊 Cung cấp công cụ quản lý chuyên nghiệp cho ban tổ chức
- 💬 Tạo không gian trao đổi và chia sẻ kinh nghiệm
- 📱 Thông báo tức thời về các sự kiện và hoạt động
- 📈 Theo dõi và báo cáo hiệu quả hoạt động tình nguyện

---

## ✨ Tính năng chính

### 👥 Người dùng chung
- ✅ Đăng ký và đăng nhập tài khoản
- ✅ Xác thực email với token
- ✅ Quản lý thông tin cá nhân
- ✅ Đổi mật khẩu và quên mật khẩu

### 🙋‍♀️ Tình nguyện viên
- 🔍 Xem và lọc danh sách sự kiện theo tiêu chí
- 📝 Đăng ký/Hủy đăng ký tham gia sự kiện
- 📅 Xem lịch sử tham gia và theo dõi trạng thái
- 🔔 Nhận thông báo về sự kiện (đăng ký, phê duyệt, hoàn thành)
- 💬 Tham gia kênh trao đổi: đăng bài, bình luận, thích
- 📊 Xem Dashboard cá nhân với thống kê hoạt động
- 👤 Follow các nhà tổ chức yêu thích

### 🎯 Nhà tổ chức sự kiện
- ➕ Tạo, sửa, xóa sự kiện
- ✔️ Duyệt/Từ chối đăng ký của tình nguyện viên
- ✅ Đánh dấu hoàn thành cho tình nguyện viên
- 📋 Xem báo cáo danh sách người tham gia
- 💬 Quản lý kênh trao đổi của sự kiện
- 📊 Dashboard với thống kê sự kiện

### 👨‍💼 Admin
- 🔍 Duyệt/Từ chối/Xóa sự kiện
- 👥 Quản lý người dùng (khóa/mở tài khoản, phân quyền)
- 📤 Xuất dữ liệu (CSV/JSON)
- 📊 Dashboard tổng quan toàn hệ thống
- 📝 Xem audit logs
- 🔔 Gửi thông báo hệ thống

### 🔔 Hệ thống
- 🔄 Tự động tạo kênh trao đổi cho sự kiện được duyệt
- 📧 Gửi email xác thực và thông báo
- 🔔 Push notification qua Web Push API
- 🔐 Bảo mật với JWT và Spring Security
- 📁 Upload và quản lý file/ảnh

---

## 🛠 Công nghệ sử dụng

### Backend
- **Framework**: Spring Boot 3.5.8
- **Ngôn ngữ**: Java 21
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA + Hibernate
- **Migration**: Flyway
- **Security**: Spring Security + JWT (JJWT 0.11.5)
- **Mapper**: MapStruct 1.5.5
- **Documentation**: SpringDoc OpenAPI 3
- **Push Notifications**: Web Push (nl.martijndwars)
- **Email**: Spring Mail
- **Build Tool**: Maven

### Frontend
- **Framework**: React 19.1.1
- **UI Library**: Material-UI (MUI) 7.3.4
- **Styling**: TailwindCSS 4.1.17
- **Routing**: React Router DOM 7.9.4
- **Form Handling**: React Hook Form 7.65.0 + Yup 1.7.1
- **HTTP Client**: Axios 1.12.2
- **Date Handling**: date-fns 4.1.0
- **Notifications**: React Toastify 11.0.5
- **Build Tool**: Vite (Rolldown)

### DevOps
- **Containerization**: Docker + Docker Compose
- **Database Management**: Adminer
- **Version Control**: Git

---

## 📦 Yêu cầu hệ thống

- **Java**: JDK 21 hoặc cao hơn
- **Node.js**: 18.x hoặc cao hơn
- **Docker**: 20.x hoặc cao hơn (khuyến nghị)
- **MySQL**: 8.0 hoặc cao hơn
- **Maven**: 3.6+ (nếu không dùng wrapper)
- **RAM**: Tối thiểu 4GB
- **Disk Space**: Tối thiểu 2GB

---

## 🚀 Cài đặt

### Phương pháp 1: Sử dụng Docker (Khuyến nghị)

1. **Clone repository**
```bash
git clone https://github.com/thanhphu25/VolunteerHub.git
cd VolunteerHub
```

2. **Khởi động database với Docker Compose**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

Dịch vụ sẽ chạy ở:
- MySQL: `localhost:3306`
- Adminer: `http://localhost:8081`

3. **Cấu hình biến môi trường Backend**

Tạo file `backend/src/main/resources/application-local.yml`:
```yaml
jwt:
  secret: your-secret-key-at-least-256-bits-long
  expirationMs: 3600000

spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

4. **Chạy Backend**
```bash
cd backend
./mvnw spring-boot:run
```

Backend sẽ chạy ở `http://localhost:8080`

5. **Cài đặt và chạy Frontend**
```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy ở `http://localhost:5173`

### Phương pháp 2: Cài đặt thủ công

1. **Cài đặt MySQL**
```bash
# Tạo database
CREATE DATABASE volunteerhub;
CREATE USER 'vh_user'@'localhost' IDENTIFIED BY 'vh_pass';
GRANT ALL PRIVILEGES ON volunteerhub.* TO 'vh_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Cấu hình Backend**
   
Cập nhật `backend/src/main/resources/application.yml` với thông tin database của bạn.

3. **Build và chạy Backend**
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

4. **Cài đặt và chạy Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 💻 Sử dụng

### Tài khoản mặc định

Sau khi khởi động, hệ thống sẽ tự động tạo dữ liệu mẫu (data initializer). Bạn có thể đăng nhập với:

**Admin:**
- Email: `admin@vh.test`
- Password: `password123`

**Organizer:**
- Email: `organizer@vh.test`
- Password: `password123`

**Volunteer:**
- Email: `volunteer@vh.test`
- Password: `password123`

### Luồng sử dụng cơ bản

1. **Đăng ký tài khoản mới** tại `/register`
2. **Xác thực email** qua link được gửi đến email
3. **Đăng nhập** tại `/login`
4. **Khám phá sự kiện** tại `/events`
5. **Đăng ký tham gia** sự kiện yêu thích
6. **Tham gia thảo luận** trên kênh trao đổi
7. **Xem dashboard** để theo dõi hoạt động

---

## 📁 Cấu trúc dự án

```
VolunteerHub/
├── backend/                    # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/volunteerhub/backend/
│   │   │   │   ├── config/           # Cấu hình (Security, CORS, WebPush, etc.)
│   │   │   │   ├── controller/       # REST Controllers
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── entity/          # JPA Entities
│   │   │   │   ├── exception/       # Exception Handlers
│   │   │   │   ├── mapper/          # MapStruct Mappers
│   │   │   │   ├── repository/      # JPA Repositories
│   │   │   │   ├── security/        # Security Components (JWT, etc.)
│   │   │   │   ├── service/         # Business Logic Services
│   │   │   │   └── util/            # Utility Classes
│   │   │   └── resources/
│   │   │       ├── application.yml   # Main configuration
│   │   │       ├── data/            # Sample data (JSON)
│   │   │       └── db/migration/    # Flyway migrations
│   │   └── test/                    # Unit & Integration Tests
│   └── pom.xml                      # Maven dependencies
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── api/                # API service clients
│   │   ├── components/         # Reusable React components
│   │   ├── context/            # React Context (Auth, Theme, Language)
│   │   ├── locales/            # i18n translations (en, vi)
│   │   ├── pages/              # Page components
│   │   ├── styles/             # CSS styles
│   │   ├── theme/              # MUI theme configuration
│   │   └── Utils/              # Utility functions
│   ├── public/
│   │   └── sw.js               # Service Worker for Push Notifications
│   └── package.json            # NPM dependencies
│
├── mysql-data/                 # Docker MySQL volume data
├── uploads/                    # Uploaded files storage
├── docker-compose.dev.yml      # Docker Compose configuration
└── README.md                   # This file
```

---

## 🔌 API Documentation

Sau khi khởi động backend, truy cập Swagger UI để xem đầy đủ API documentation:

**URL**: `http://localhost:8080/swagger-ui.html`

### Các API endpoints chính

#### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Làm mới access token
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/verify-email` - Xác thực email
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

#### Events
- `GET /api/events` - Lấy danh sách sự kiện (có filter)
- `GET /api/events/{id}` - Chi tiết sự kiện
- `POST /api/events` - Tạo sự kiện mới (ORGANIZER)
- `PUT /api/events/{id}` - Cập nhật sự kiện (ORGANIZER)
- `DELETE /api/events/{id}` - Xóa sự kiện (ORGANIZER/ADMIN)
- `GET /api/events/organizer/my` - Sự kiện của tôi (ORGANIZER)

#### Registrations
- `POST /api/registrations` - Đăng ký sự kiện
- `GET /api/registrations/my` - Danh sách đăng ký của tôi
- `DELETE /api/registrations/{id}` - Hủy đăng ký
- `PUT /api/registrations/{id}/approve` - Duyệt đăng ký (ORGANIZER)
- `PUT /api/registrations/{id}/complete` - Đánh dấu hoàn thành (ORGANIZER)

#### Posts (Discussion)
- `GET /api/posts` - Lấy danh sách bài viết
- `GET /api/posts/{id}` - Chi tiết bài viết
- `POST /api/posts` - Tạo bài viết mới
- `PUT /api/posts/{id}` - Cập nhật bài viết
- `DELETE /api/posts/{id}` - Xóa bài viết
- `POST /api/posts/{id}/like` - Thích bài viết
- `POST /api/posts/{id}/comments` - Bình luận

#### Admin
- `GET /api/admin/users` - Quản lý người dùng
- `PUT /api/admin/users/{id}/lock` - Khóa người dùng
- `PUT /api/admin/users/{id}/unlock` - Mở khóa người dùng
- `GET /api/admin/events/pending` - Sự kiện chờ duyệt
- `PUT /api/admin/events/{id}/approve` - Duyệt sự kiện
- `GET /api/admin/audit-logs` - Xem audit logs
- `POST /api/admin/notifications/broadcast` - Gửi thông báo

#### Profile
- `GET /api/profile` - Thông tin profile
- `PUT /api/profile` - Cập nhật profile
- `POST /api/profile/avatar` - Upload avatar
- `PUT /api/profile/password` - Đổi mật khẩu

#### Notifications
- `GET /api/notifications` - Danh sách thông báo
- `PUT /api/notifications/{id}/read` - Đánh dấu đã đọc
- `POST /api/notifications/subscribe` - Đăng ký push notification

#### Follow
- `POST /api/follows/{organizerId}` - Follow nhà tổ chức
- `DELETE /api/follows/{organizerId}` - Unfollow
- `GET /api/follows/my` - Danh sách đang follow

---

## 🔐 Bảo mật

Dự án triển khai nhiều lớp bảo mật:

- ✅ **JWT Authentication**: Access token + Refresh token
- ✅ **Password Hashing**: BCrypt với salt
- ✅ **CORS Configuration**: Chỉ cho phép domain được cấu hình
- ✅ **SQL Injection Prevention**: Sử dụng JPA Prepared Statements
- ✅ **XSS Protection**: Input validation và sanitization
- ✅ **CSRF Protection**: Token-based (cho form-based requests)
- ✅ **Role-based Access Control**: ADMIN, ORGANIZER, VOLUNTEER
- ✅ **Email Verification**: Xác thực email trước khi kích hoạt tài khoản
- ✅ **File Upload Security**: Kiểm tra MIME type và kích thước file

---

## 🌐 Đa ngôn ngữ (i18n)

Hệ thống hỗ trợ 2 ngôn ngữ:
- 🇻🇳 Tiếng Việt (vi)
- 🇬🇧 Tiếng Anh (en)

Người dùng có thể chuyển đổi ngôn ngữ qua menu trên thanh navigation.

---

## 🎨 Theme

Hỗ trợ 2 chế độ giao diện:
- ☀️ Light Mode
- 🌙 Dark Mode

Người dùng có thể toggle theme qua nút trên navbar.

---

## 📱 Progressive Web App (PWA)

- ✅ Service Worker đã được cấu hình
- ✅ Hỗ trợ Push Notifications
- ✅ Có thể cài đặt như app native (Add to Home Screen)
- ✅ Offline-ready (cache static assets)

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 📊 Database Schema

Hệ thống sử dụng **Flyway** để quản lý database migrations. Các file migration nằm trong `backend/src/main/resources/db/migration/`.

### Các bảng chính:

- **users** - Thông tin người dùng
- **events** - Sự kiện tình nguyện
- **registrations** - Đăng ký tham gia sự kiện
- **posts** - Bài viết trên kênh trao đổi
- **post_comments** - Bình luận
- **post_likes** - Lượt thích
- **notifications** - Thông báo
- **organizer_follows** - Follow nhà tổ chức
- **push_subscriptions** - Push notification subscriptions
- **refresh_tokens** - JWT refresh tokens
- **verification_tokens** - Email verification tokens
- **audit_logs** - Audit trail

---

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Quy tắc coding

- **Backend**: Tuân thủ Java Code Conventions
- **Frontend**: Sử dụng ESLint và Prettier
- **Commit messages**: Sử dụng Conventional Commits format


---

## 👥 Tác giả

- **Nhóm** - [VolunteerHub](https://github.com/thanhphu25/VolunteerHub)

---

## 🙏 Lời cảm ơn

- Spring Boot team
- React team
- Material-UI team
- Tất cả contributors của các open-source libraries được sử dụng

---

## 📞 Liên hệ

Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ:
- **GitHub Issues**: [VolunteerHub Issues](https://github.com/thanhphu25/VolunteerHub/issues)

---

## 📈 Roadmap

### Version 2.0 (Planned)
- [ ] Mobile app (React Native)
- [ ] Real-time chat
- [ ] Video conferencing integration
- [ ] Gamification (badges, points)
- [ ] Social media integration
- [ ] Advanced analytics dashboard
- [ ] AI-powered event recommendations
- [ ] Multi-language support (thêm ngôn ngữ)

---

<div align="center">

**⭐ Nếu dự án hữu ích, đừng quên cho một star nhé! ⭐**

Made with ❤️ by VolunteerHub Team

</div>