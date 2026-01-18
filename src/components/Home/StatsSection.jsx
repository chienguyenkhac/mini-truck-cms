const stats = [
    { label: 'Năm Kinh Nghiệm', value: '15+', icon: 'calendar_month' },
    { label: 'Phụ Tùng Đã Bán', value: '50K+', icon: 'settings' },
    { label: 'Khách Hàng Hài Lòng', value: '98%', icon: 'sentiment_satisfied' },
    { label: 'Hỗ Trợ Kỹ Thuật', value: '24/7', icon: 'support_agent' },
]

const StatsSection = () => {
    return (
        <section className="bg-background relative z-20 mt-8 pb-20 px-4 md:px-10 lg:px-20">
            <div className="container mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 md:p-12 bg-white border border-slate-200 rounded-3xl shadow-xl">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className={`flex flex-col gap-1 md:gap-2 items-center md:items-start p-2 md:p-4 transition-all hover:scale-105 ${idx !== 0 ? 'md:border-l md:border-slate-200 md:pl-8' : ''}`}
                        >
                            <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl text-primary mb-2 md:mb-3">
                                <span className="material-symbols-outlined text-2xl md:text-4xl">{stat.icon}</span>
                            </div>
                            <p className="text-slate-800 text-2xl md:text-4xl font-bold tracking-tighter">{stat.value}</p>
                            <p className="text-slate-500 text-[10px] md:text-sm font-semibold uppercase tracking-wider text-center md:text-left">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default StatsSection
