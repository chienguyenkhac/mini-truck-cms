import { useState } from 'react'
import { motion } from 'framer-motion'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setFormData({ name: '', phone: '', email: '', message: '' })

      setTimeout(() => setSubmitted(false), 3000)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <div className="relative py-10 md:py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white to-sky-50"></div>
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 tracking-tighter mb-2">
              LIÊN <span className="text-primary">HỆ</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-10 lg:px-20 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {[
                {
                  icon: 'location_on',
                  title: 'Địa chỉ',
                  content: 'Thôn 1, Xã Lại Yên, Hoài Đức, Hà Nội',
                  sub: '(Cách cầu vượt An Khánh 300m)'
                },
                {
                  icon: 'call',
                  title: 'Hotline 24/7',
                  content: '0382.890.990',
                  href: 'tel:0382890990'
                },
                {
                  icon: 'mail',
                  title: 'Email',
                  content: 'hnsinotruk@gmail.com',
                  href: 'mailto:hnsinotruk@gmail.com'
                },
                {
                  icon: 'schedule',
                  title: 'Giờ làm việc',
                  content: 'Thứ 2 - Chủ nhật: 7:00 - 21:00',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-5 p-6 bg-white border border-slate-200 rounded-2xl hover:border-primary/50 transition-all shadow-sm"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/30 flex-shrink-0">
                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-bold text-lg mb-1">{item.title}</h3>
                    {item.href ? (
                      <a href={item.href} className="text-slate-500 hover:text-primary transition-colors text-lg">
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-slate-500">{item.content}</p>
                    )}
                    {item.sub && <p className="text-slate-400 text-sm mt-1">{item.sub}</p>}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Gửi tin nhắn cho chúng tôi</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400">
                <span className="material-symbols-outlined">check_circle</span>
                Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm nhất.
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="text-slate-500 text-sm font-medium mb-2 block">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary transition-all"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="text-slate-500 text-sm font-medium mb-2 block">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary transition-all"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label className="text-slate-500 text-sm font-medium mb-2 block">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary transition-all"
                  placeholder="Nhập email (không bắt buộc)"
                />
              </div>

              <div>
                <label className="text-slate-500 text-sm font-medium mb-2 block">Tin nhắn *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary transition-all resize-none"
                  placeholder="Nhập nội dung tin nhắn"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary hover:brightness-110 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Gửi tin nhắn
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Map */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 rounded-3xl overflow-hidden border border-slate-200 shadow-sm"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.123456789!2d105.7!3d21.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAzJzAwLjAiTiAxMDXCsDQyJzAwLjAiRQ!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="SINOTRUK HÀ NỘI"
            className="grayscale-[50%] hover:grayscale-0 transition-all duration-500"
          ></iframe>
        </motion.div>
      </div>
    </div>
  )
}

export default Contact
