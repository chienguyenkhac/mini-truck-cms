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
                            className={`flex flex-row gap-4 items-center p-2 transition-all hover:scale-105 ${idx !== 0 ? 'md:border-l md:border-slate-200 md:pl-6' : ''}`}
                        >
                            <div className="p-2 bg-primary/10 rounded-lg text-primary mr-3">
                                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <p className="text-slate-800 text-xl md:text-2xl font-bold tracking-tighter">{stat.value}</p>
                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default StatsSection
