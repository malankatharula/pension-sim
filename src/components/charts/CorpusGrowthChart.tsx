// src/components/charts/CorpusGrowthChart.tsx
import { View, Dimensions } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { COLORS } from '../../lib/theme';
import type { PeriodResult } from '../../types/simulation';

interface Props {
  conservativePeriods: PeriodResult[];
  optimisticPeriods: PeriodResult[];
  dualVehicleBalances: number[]; // combinedBalance per period, same order
  startingAge: number;
}

export function CorpusGrowthChart({
  conservativePeriods,
  optimisticPeriods,
  dualVehicleBalances,
  startingAge,
}: Props) {
  const data = conservativePeriods.map((p, i) => ({
    age: p.ageEnd,
    conservative: p.closingBalance / 1e6,
    optimistic: (optimisticPeriods[i]?.closingBalance ?? 0) / 1e6,
    dualVehicle: (dualVehicleBalances[i] ?? 0) / 1e6,
  }));

  // Prepend a zero point at starting age so lines visibly start from 0
  const chartData = [
    { age: startingAge, conservative: 0, optimistic: 0, dualVehicle: 0 },
    ...data,
  ];

  return (
    <View style={{ height: 220, width: '100%' }}>
      <CartesianChart
        data={chartData}
        xKey="age"
        yKeys={['conservative', 'optimistic', 'dualVehicle']}
        domainPadding={{ left: 20, right: 20, top: 20, bottom: 10 }}
        axisOptions={{
          lineColor: COLORS.border,
          labelColor: COLORS.textSecondary,
        }}
      >
        {({ points }) => (
          <>
            <Line points={points.conservative} color={COLORS.primary} strokeWidth={3} />
            <Line points={points.optimistic} color={COLORS.success} strokeWidth={3} />
            <Line points={points.dualVehicle} color="#8B5CF6" strokeWidth={3} />
          </>
        )}
      </CartesianChart>
    </View>
  );
}