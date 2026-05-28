import { motion } from 'framer-motion';
import { cansForDrinks } from '../../game/rules';
import { playFadeTransition } from './PlayLayout';

export function BusTotals({
  animate = true,
  className = '',
  drinksEach,
}: {
  animate?: boolean;
  className?: string;
  drinksEach: number;
}) {
  const stackClassName = `bus-total-stack ${className}`.trim();
  const content = (
    <>
      <div className="bus-total-counter">
        <span className="bus-total-value">{drinksEach}</span>
        <span className="bus-total-label">total</span>
      </div>
      <div className="bus-can-counter" aria-label={`${cansForDrinks(drinksEach)} cans`}>
        <span className="bus-can-value">{cansForDrinks(drinksEach)}</span>
        <span className="bus-can-label">cans</span>
      </div>
    </>
  );

  if (!animate) {
    return <div className={stackClassName}>{content}</div>;
  }

  return (
    <motion.div
      key={drinksEach}
      className={stackClassName}
      initial={{ scale: 0.92 }}
      animate={{ scale: 1 }}
      transition={playFadeTransition}
    >
      {content}
    </motion.div>
  );
}
