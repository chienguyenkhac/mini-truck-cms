const stats = [
    { label: 'Năm Kinh Nghiệm', value: '15+', icon: 'calendar_month' },
    { label: 'Phụ Tùng Đã Bán', value: '50K+', icon: 'settings' },
    { label: 'Khách Hàng Hài Lòng', value: '98%', icon: 'sentiment_satisfied' },
    { label: 'Hỗ Trợ Kỹ Thuật', value: '24/7', icon: 'support_agent' },
]

const StatsSection = () => {
    return (
        <section className="bg-background relative z-20 mt-4 pb-20">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-6 bg-white border border-slate-200 rounded-3xl shadow-xl">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className={`flex flex-col gap-0.5 md:gap-1 items-center md:items-start p-1 md:p-2 transition-all hover:scale-105 ${idx !== 0 ? 'md:border-l md:border-slate-200 md:pl-6' : ''}`}
                        >
                            <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg md:rounded-xl text-primary mb-1 md:mb-1.5">
                                <span className="material-symbols-outlined text-xl md:text-2xl">{stat.icon}</span>
                            </div>
                            <p className="text-slate-800 text-xl md:text-2xl font-bold tracking-tighter">{stat.value}</p>
                            <p className="text-slate-500 text-[9px] md:text-xs font-semibold uppercase tracking-wider text-center md:text-left">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default StatsSection
