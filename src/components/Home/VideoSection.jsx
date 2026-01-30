const VideoSection = () => {
    return (
        <section className="pt-4 md:pt-8 pb-8 md:pb-16 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    {/* Card - shows first on mobile */}
                    <div className="relative group order-1 lg:order-2">
                        <div className="absolute -inset-4 bg-primary/20 rounded-[2.5rem] blur-2xl group-hover:bg-primary/30 transition-all"></div>
                        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border bg-white">
                            <div
                                className="relative w-full h-full flex flex-col items-center justify-between p-6 md:p-8 text-center bg-cover bg-center bg-no-repeat"
                                style={{ backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.2)), url('/images/part-service.png')" }}
                            >
                                <div className="flex flex-wrap justify-center gap-2 flex-shrink-0 mt-auto">
                                    {['Động cơ', 'Hộp số', 'Cầu', 'Dẫn động', 'Ly hợp'].map((item, i) => (
                                        <span key={i} className="px-4 py-2 bg-white/40 backdrop-blur-sm text-slate-800 font-semibold rounded-full text-xs md:text-sm border border-white/80 shadow-md">
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

                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-[1.1]">
                            Phụ Tùng Chính Hãng <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-600 via-primary to-sky-400">Chất Lượng Hàng Đầu</span>
                        </h3>

                        <p className="text-slate-500 text-base md:text-xl leading-relaxed">
                        Với sự hiểu biết sâu sắc về các chủng loại xe tải nặng do Trung Quốc sản xuất, phong cách phục vụ chuyên nghiệp và giá cả cạnh tranh cùng chế độ bảo hành cho sản phẩm, chúng tôi mong rằng sẽ trở thành đối tác tin cậy của Quý khách hàng trên toàn quốc.
                        </p>

                        <div className="space-y-3 md:space-y-4">
                            <div className="grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8">
                                {[
                                    { title: 'Nhập khẩu trực tiếp', desc: 'Chính hãng, Original Parts', icon: 'verified' },
                                    { title: 'Bảo Hành Uy Tín', desc: 'Đổi mới 100% nếu sai mẫu hoặc lỗi do nhà sản xuất', icon: 'shield' }
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

                            <div className="mt-6 md:mt-8">
                                <a
                                    href="tel:0382890990"
                                    className="flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-primary hover:bg-primary/90 rounded-xl text-white font-bold transition-all group w-fit shadow-lg text-xs md:text-sm"
                                >
                                    <span className="material-symbols-outlined text-base md:text-lg">call</span>
                                    Hotline: 0382.890.990
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default VideoSection

