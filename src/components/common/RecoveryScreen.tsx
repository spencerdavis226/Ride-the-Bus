import { Button } from './Button';

type RecoveryScreenProps = {
  message: string;
  onStartOver: () => void;
};

export function RecoveryScreen({ message, onStartOver }: RecoveryScreenProps) {
  return (
    <section className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-xl font-bold text-[var(--rtb-text)]">Something went wrong</h2>
      <p className="max-w-sm text-sm text-[var(--rtb-text-muted)]">{message}</p>
      <Button className="w-full max-w-xs" onClick={onStartOver}>
        Start over
      </Button>
    </section>
  );
}
