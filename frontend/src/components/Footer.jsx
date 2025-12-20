import React from "react";
import { Link } from "react-router-dom";
// Giả định logo.jpg nằm trong thư mục assets tương tự như các ảnh khác trong project
import logo from "../assets/logo.jpg"; 

const Footer = () => {
  return (
    <footer className="bg-teal-50 text-slate-700 border-t border-slate-200 pt-10 pb-6" id="footer">
      <div className="container mx-auto px-4">
        <div className="md:flex md:justify-between">
          {/* Cột 1: Logo và Thông tin chính */}
          <div className="w-full md:w-1/2 mb-8 md:mb-0 pr-0 md:pr-8">
            <div className="site-footer__inner">
              {/* Hiển thị Logo và Tên thương hiệu */}
              <div className="flex items-center mb-6">
                <img 
                  src={logo} 
                  alt="VolunteerHub Logo" 
                  className="h-12 w-auto mr-3 rounded-lg shadow-sm" 
                />
                <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 tracking-tight">
                  VolunteerHub
                </p>
              </div>
              
              <p className="text-sm mb-6 text-slate-600 leading-relaxed max-w-md">
                Nền tảng kết nối tình nguyện viên với các tổ chức xã hội, lan tỏa tinh thần tương thân tương ái và xây dựng cộng đồng bền vững.
              </p>

              <div className="site-footer__info space-y-4">
                <dl className="flex items-start">
                  <dt className="mr-3 mt-1 text-teal-600">
                    <svg fill="none" height="15" viewBox="0 0 11 15" width="11" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.39141 14.5961C5.31141 14.5961 5.24141 14.5961 5.16141 14.5961C5.04141 14.4961 4.90141 14.4061 4.80141 14.2961C3.93141 13.2961 3.12141 12.2461 2.39141 11.1361C1.63141 9.98606 0.941415 8.79606 0.451415 7.49606C0.0914147 6.52606 -0.108585 5.53606 0.0614145 4.49606C0.271415 3.15606 0.891415 2.04606 1.94141 1.19606C3.12141 0.226059 4.49141 -0.153941 6.01141 0.0560593C7.56141 0.276059 8.79141 1.04606 9.66141 2.34606C10.5814 3.70606 10.7814 5.20606 10.3414 6.78606C10.0514 7.84606 9.57141 8.81606 9.03141 9.75606C8.10141 11.3761 6.98141 12.8761 5.76141 14.2961C5.65141 14.4061 5.51141 14.4961 5.39141 14.5961ZM5.28141 7.93606C6.74141 7.93606 7.93141 6.74606 7.93141 5.27606C7.93141 3.81606 6.74141 2.61606 5.28141 2.61606C3.82141 2.60606 2.61141 3.81606 2.62141 5.28606C2.62141 6.74606 3.82141 7.94606 5.28141 7.93606Z" fill="currentColor"></path>
                    </svg>
                  </dt>
                  <dd className="text-sm">Địa chỉ: 144 Xuân Thủy, Cầu Giấy, Hà Nội</dd>
                </dl>
                <dl className="flex items-start">
                  <dt className="mr-3 mt-1 text-teal-600">
                    <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.4486 16C11.1755 15.958 10.8814 15.916 10.6084 15.853C9.87313 15.7061 9.15892 15.4122 8.48671 15.0763C5.7979 13.7537 3.65525 11.8223 1.97474 9.345C1.23951 8.27432 0.67234 7.11966 0.273218 5.88103C0.0421483 5.16725 -0.08389 4.43247 0.0631547 3.6767C0.126174 3.3198 0.294225 3.0049 0.546301 2.73198C0.987435 2.29111 1.42857 1.85024 1.8697 1.40938C2.43688 0.863541 3.06707 0.863541 3.63424 1.40938C4.28544 2.03919 4.93663 2.71099 5.58783 3.36179C5.88192 3.6557 6.07098 3.9916 5.98695 4.41148C5.94494 4.72638 5.75588 4.97831 5.54582 5.18824C5.18871 5.54514 4.8106 5.92302 4.45349 6.27992C4.26443 6.46886 4.26443 6.51085 4.36946 6.76277C4.78959 7.70749 5.41978 8.48425 6.11299 9.21903C6.8062 9.95381 7.54142 10.6256 8.40269 11.1505C8.69677 11.3394 9.01187 11.4864 9.30596 11.6333C9.453 11.7173 9.55804 11.6543 9.64206 11.5493C10.0202 11.1714 10.3983 10.7936 10.7764 10.4157C10.8814 10.3107 11.0075 10.2057 11.1545 10.1218C11.5957 9.84885 12.0578 9.89083 12.4569 10.2267C12.5409 10.2897 12.604 10.3527 12.688 10.4367C13.2972 11.0455 13.9064 11.6543 14.5155 12.2631C14.6626 12.4101 14.8096 12.599 14.8937 12.788C15.0827 13.2078 15.0197 13.6067 14.7046 13.9426C14.2215 14.4675 13.7173 14.9713 13.2131 15.4752C12.9401 15.7481 12.5619 15.874 12.1838 15.937C12.1418 15.937 12.0998 15.958 12.0368 15.979C11.8477 16 11.6587 16 11.4486 16Z" fill="currentColor"></path>
                    </svg>
                  </dt>
                  <dd className="text-sm">Hotline: <a href="tel:02437547461" className="hover:text-teal-600 transition-colors font-medium">024.3754.7461</a></dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Cột 2 & 3: Liên kết nhanh (Được đẩy cao và thưa ra) */}
          <div className="w-full md:w-1/2 mt-4 md:mt-0">
            <div className="flex flex-wrap h-full content-start">
              {/* Cột Danh mục */}
              <div className="w-1/2 pr-4">
                <p className="text-base font-bold mb-6 text-teal-800 uppercase tracking-wider">
                  Cộng đồng
                </p>
                <ul className="text-sm space-y-4">
                  <li><Link to="/events" className="text-slate-600 hover:text-teal-600 transition-colors">Khám phá sự kiện</Link></li>
                  <li><Link to="/news" className="text-slate-600 hover:text-teal-600 transition-colors">Tin tức nổi bật</Link></li>
                  <li><Link to="/about" className="text-slate-600 hover:text-teal-600 transition-colors">Về chúng tôi</Link></li>
                  <li><Link to="/help" className="text-slate-600 hover:text-teal-600 transition-colors">Hướng dẫn đăng ký</Link></li>
                </ul>
              </div>
              
              {/* Cột Tổ chức */}
              <div className="w-1/2">
                <p className="text-base font-bold mb-6 text-teal-800 uppercase tracking-wider">
                  Dành cho Tổ chức
                </p>
                <ul className="text-sm space-y-4">
                  <li><Link to="/register?role=organizer" className="text-slate-600 hover:text-teal-600 transition-colors">Đăng ký thành viên</Link></li>
                  <li><Link to="/organizer/events/create" className="text-slate-600 hover:text-teal-600 transition-colors">Tạo chiến dịch mới</Link></li>
                  <li><Link to="/terms" className="text-slate-600 hover:text-teal-600 transition-colors">Quy định & Chính sách</Link></li>
                  <li><Link to="/contact" className="text-slate-600 hover:text-teal-600 transition-colors">Liên hệ hợp tác</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Phần chân Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} VolunteerHub. Phát triển với tâm huyết vì sự phát triển của cộng đồng.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;