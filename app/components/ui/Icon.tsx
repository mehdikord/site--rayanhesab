import {
  Calculator,
  ReceiptText,
  TrendingUp,
  GraduationCap,
  Users,
  BriefcaseBusiness,
  Landmark,
  Puzzle,
  type LucideProps,
} from 'lucide-react';

const map: Record<string, React.ComponentType<LucideProps>> = {
  Calculator,
  ReceiptText,
  TrendingUp,
  GraduationCap,
  Users,
  BriefcaseBusiness,
  Landmark,
  Puzzle,
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = map[name] ?? Calculator;
  return <Cmp {...props} />;
}
