import { LucideIcon } from "lucide-react";


export interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  description?: string;
}

const StatsCardComponent = ({ icon: Icon, title, value, description }: StatsCardProps) => (
  <div className="flex items-start space-x-4 p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="bg-primary/10 p-2 rounded-full">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  </div>
);

export default StatsCardComponent;
