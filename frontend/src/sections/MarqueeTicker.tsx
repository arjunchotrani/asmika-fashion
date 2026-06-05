'use client';

const ITEMS = [
  'Premium Ethnic Textiles',
  'Chudidar Materials',
  'Sarees',
  'Dupattas',
  'Kurti Sets',
  'Powered by Ajanta Silk Mills',
  'Crafted in Surat',
];

export function MarqueeTicker() {
  const repeated = [...ITEMS, ...ITEMS];

  return (
    <div className="overflow-hidden py-4 bg-[var(--bg-subtle)]"
      style={{ borderTop: '1px solid rgba(201, 168, 76, 0.2)', borderBottom: '1px solid rgba(201, 168, 76, 0.2)' }}
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center gap-6 mx-6">
            <span
              className="font-light"
              style={{
                fontSize: '0.8rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: i % 2 === 0 ? 'var(--brand-gold)' : 'var(--text-secondary)',
              }}
            >
              {item}
            </span>
            <span className="text-xs" style={{ color: 'rgba(201, 168, 76, 0.4)' }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
