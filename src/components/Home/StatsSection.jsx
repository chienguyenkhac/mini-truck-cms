const stats = [
    { label: 'Năm Kinh Nghiệm', value: '15+', icon: 'calendar_month' },
    { label: 'Xe Đã Bán', value: '5000+', icon: 'local_shipping' },
    { label: 'Khách Hàng Hài Lòng', value: '98%', icon: 'sentiment_satisfied' },
    { label: 'Hỗ Trợ Kỹ Thuật', value: '24/7', icon: 'build' },
]

const StatsSection = () => {
    return (
        <section className="bg-background relative z-20 -mt-16 pb-20 px-4">
            <div className="container mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 md:p-12 bg-surface border border-border rounded-3xl shadow-2xl">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className={`flex flex-col gap-2 items-center md:items-start p-4 transition-all hover:scale-105 ${idx !== 0 ? 'md:border-l md:border-border md:pl-8' : ''}`}
                        >
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-3">
                                <span className="material-symbols-outlined text-4xl">{stat.icon}</span>
                            </div>
                            <p className="text-white text-4xl font-bold tracking-tighter">{stat.value}</p>
                            <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default StatsSection
