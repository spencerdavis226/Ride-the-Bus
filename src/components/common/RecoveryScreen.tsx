import { Button } from './Button';

type RecoveryScreenProps = {
  message: string;
  onStartOver: () => void;
};

export function RecoveryScreen({ message, onStartOver }: RecoveryScreenProps) {
  return (
    <section className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-xl font-bold text-[#fff7e6]">Something went wrong</h2>
      <p className="max-w-sm text-sm text-[#fff7e6]/70">{message}</p>
      <Button className="w-full max-w-xs" onClick={onStartOver}>
        Start over
      </Button>
    </section>
  );
}
