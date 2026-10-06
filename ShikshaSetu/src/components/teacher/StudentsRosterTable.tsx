import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Eye, ShieldCheck, Smartphone, Battery, BatteryMedium, BatteryLow, AlertCircle, CheckCircle2 } from 'lucide-react';

interface StudentsRosterTableProps {
  students: any[];
  onViewStudent: (studentId: string) => void;
  onAssignPractice: (studentId: string, topicName: string) => void;
}

export const StudentsRosterTable: React.FC<StudentsRosterTableProps> = ({
  students,
  onViewStudent,
  onAssignPractice,
}) => {
  const getBatteryIcon = (battery?: number) => {
    if (!battery) return null;
    if (battery < 20) return <BatteryLow className="w-3.5 h-3.5 text-red-500" />;
    if (battery < 60) return <BatteryMedium className="w-3.5 h-3.5 text-amber-500" />;
    return <Battery className="w-3.5 h-3.5 text-emerald-500" />;
  };

  const getMasteryColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-800 bg-amber-50 border-amber-300 font-bold';
  };

  return (
    <Card variant="elevated" className="border-slate-200">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
        <div>
          <CardTitle className="text-base sm:text-lg">Private Classroom Roster</CardTitle>
          <span className="text-xs text-slate-500">
            Individual student telemetry accessible exclusively by authorized educators.
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Non-Ranking Private Ledger</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 pr-4">Student</th>
                <th className="py-3 px-3">Class</th>
                <th className="py-3 px-2 text-center">Fractions</th>
                <th className="py-3 px-2 text-center">Equations</th>
                <th className="py-3 px-2 text-center">Science</th>
                <th className="py-3 px-3">Device / Signal</th>
                <th className="py-3 px-3">Support Status</th>
                <th className="py-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 pr-4 font-bold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={st.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'}
                        alt={st.name}
                        className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <span>{st.name}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {st.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">
                    {st.className}
                  </td>

                  <td className="py-3 px-2 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg border text-[11px] ${getMasteryColor(
                        st.fractionsMastery
                      )}`}
                    >
                      {st.fractionsMastery}%
                    </span>
                  </td>

                  <td className="py-3 px-2 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg border text-[11px] ${getMasteryColor(
                        st.algebraMastery
                      )}`}
                    >
                      {st.algebraMastery}%
                    </span>
                  </td>

                  <td className="py-3 px-2 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg border text-[11px] ${getMasteryColor(
                        st.scienceMastery
                      )}`}
                    >
                      {st.scienceMastery}%
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-slate-400" /> {st.deviceAccess}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        {getBatteryIcon(st.batteryLevel)}
                        <span>{st.batteryLevel}% battery • {st.connectivityLevel}</span>
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    {st.supportStatus === 'needs_support' ? (
                      <Badge variant="saffron" size="sm" dot>
                        Needs Support
                      </Badge>
                    ) : st.supportStatus === 'excellent' ? (
                      <Badge variant="brand" size="sm">
                        High Mastery
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        On Track
                      </Badge>
                    )}
                  </td>

                  <td className="py-3 pl-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewStudent(st.id)}
                        leftIcon={<Eye className="w-3 h-3" />}
                      >
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onAssignPractice(st.id, 'Fractions: Parts of a Whole')}
                      >
                        Practice
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
