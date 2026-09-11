import demo from '@/data/demo.json';

export default function Sparkline({ values = demo.pain, large = false }: { values?: number[]; large?: boolean }) {
  const points = values.map((v, i) => `${30 + i * (640 / Math.max(1, values.length - 1))},${190 - v * 15}`).join(' ');
  return (
    <svg className={large ? 'trend-chart' : 'sparkline'} viewBox="0 0 700 210" preserveAspectRatio="none" role="img" aria-label={`Pain trend from ${values[0]}/10 to ${values.at(-1)}/10`}>
      <defs>
        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#849466" stopOpacity=".2" />
          <stop offset="1" stopColor="#849466" stopOpacity="0" />
        </linearGradient>
      </defs>
      {large &&
        [0, 2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line x1="30" y1={190 - v * 15} x2="680" y2={190 - v * 15} stroke="#e8e8e1" strokeDasharray="3 5" />
            <text x="0" y={194 - v * 15} fill="#8c9084" fontSize="12">
              {v}
            </text>
          </g>
        ))}
      <polygon points={`30,200 ${points} 670,200`} fill="url(#chartFill)" />
      <polyline points={points} stroke="#738456" strokeWidth={large ? 3 : 5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {large &&
        values.map((v, i) => (
          <circle
            key={i}
            cx={30 + i * (640 / Math.max(1, values.length - 1))}
            cy={190 - v * 15}
            r="4"
            fill="#738456"
            stroke="#fbfbf7"
            strokeWidth="2"
          />
        ))}
    </svg>
  );
}
