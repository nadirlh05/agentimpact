import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: number;
    label: string;
  };
}

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  iconBgColor = "bg-primary/10", 
  iconColor = "text-primary",
  trend 
}: StatsCardProps) => {
  return (
    <Card className="border border-border bg-card shadow-soft hover:shadow-medium transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground mt-1">
                <span className={trend.value > 0 ? "text-green-600" : "text-red-600"}>
                  {trend.value > 0 ? "+" : ""}{trend.value}%
                </span>
                {" "}{trend.label}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;