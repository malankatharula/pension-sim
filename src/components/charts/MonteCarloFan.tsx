// src/components/charts/MonteCarloFan.tsx
import { View } from 'react-native';
import { Bar, CartesianChart } from 'victory-native';
import { COLORS } from '../../lib/theme';

interface Props {
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

export function MonteCarloFan({ p5, p25, p50, p75, p95 }: Props) {
  const data = [
    { label: 'P5', value: p5, color: COLORS.error },
    { label: 'P25', value: p25, color: COLORS.warning },
    { label: 'P50', value: p50, color: COLORS.primary },
    { label: 'P75', value: p75, color: COLORS.success },
    { label: 'P95', value: p95, color: '#8B5CF6' },
  ];

  return (
    <View style={{ height: 200, width: '100%' }}>
      <CartesianChart
        data={data}
        xKey="label"
        yKeys={['value']}
        domainPadding={{ left: 30, right: 30, top: 20, bottom: 10 }}
        axisOptions={{
          lineColor: COLORS.border,
          labelColor: COLORS.textSecondary,
        }}
      >
        {({ points, chartBounds }) => (
          <>
            {points.value.map((point, i) => (
              <Bar
                key={i}
                points={[point]}
                chartBounds={chartBounds}
                color={data[i].color}
                roundedCorners={{ topLeft: 6, topRight: 6 }}
                barWidth={36}
              />
            ))}
          </>
        )}
      </CartesianChart>
    </View>
  );
}