// src/components/charts/InflationErosionChart.tsx
import { View } from 'react-native';
import { Bar, CartesianChart } from 'victory-native';
import { COLORS } from '../../lib/theme';

interface Props {
  scenarios: { label: string; percentRetained: number }[];
}

export function InflationErosionChart({ scenarios }: Props) {
  const data = scenarios.map((s) => ({ label: s.label, value: s.percentRetained }));

  return (
    <View style={{ height: 160, width: '100%' }}>
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
                color={COLORS.error}
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