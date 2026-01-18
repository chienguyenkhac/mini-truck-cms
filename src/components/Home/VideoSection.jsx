const VideoSection = () => {
    return (
        <section className="py-12 md:py-24 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    {/* Card - shows first on mobile */}
                    <div className="relative group order-1 lg:order-2">
                        <div className="absolute -inset-4 bg-primary/20 rounded-[2.5rem] blur-2xl group-hover:bg-primary/30 transition-all"></div>
                        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border bg-white">
                            <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 md:mb-6">
                                    <span className="material-symbols-outlined text-4xl md:text-5xl text-primary">settings</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Phụ Tùng Xe Tải</h3>
                                <p className="text-slate-500 mb-4 text-sm md:text-base">HOWO • SITRAK • SINOTRUK</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {['Động cơ', 'Hộp số', 'Phanh', 'Cabin', 'Ly hợp', 'Điện'].map((item, i) => (
                                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs md:text-sm font-medium">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Content - shows second on mobile */}
                    <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
                        <div className="flex items-center gap-3 text-primary font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm">
                            <span className="w-8 md:w-12 h-[2px] bg-primary"></span>
                            Giới Thiệu
                        </div>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-800 leading-[1.1]">
                            Phụ Tùng Chính Hãng <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-600 via-primary to-sky-400">Chất Lượng Hàng Đầu</span>
                        </h2>

                        <p className="text-slate-500 text-base md:text-xl leading-relaxed">
                            Chuyên cung cấp phụ tùng chính hãng cho xe tải HOWO & SITRAK. Đầy đủ linh kiện từ động cơ, hộp số, phanh đến các chi tiết nhỏ nhất. Giao hàng toàn quốc.
                        </p>

                        <div className="grid grid-cols-2 gap-3 md:gap-6">
                            {[
                                { title: 'Chính Hãng 100%', desc: 'Nhập khẩu trực tiếp', icon: 'verified' },
                                { title: 'Bảo Hành Uy Tín', desc: 'Đổi trả nếu sai mẫu', icon: 'shield' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-gray-100 border border-gray-300 shadow-sm">
                                    <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <span className="material-symbols-outlined text-lg md:text-xl">{item.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm md:text-base">{item.title}</h4>
                                        <p className="text-slate-400 text-xs">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <a
                            href="tel:0382890990"
                            className="flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-primary hover:bg-primary/90 rounded-xl text-white font-bold transition-all group w-fit shadow-lg text-sm md:text-base"
                        >
                            <span className="material-symbols-outlined text-lg">call</span>
                            Hotline: 0382.890.990
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default VideoSection
