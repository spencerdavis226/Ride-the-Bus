export function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-12 flex justify-center overflow-hidden" aria-hidden="true">
      <div className="relative h-28 w-64">
        {Array.from({ length: 20 }, (_, index) => (
          <span
            key={index}
            className="absolute h-2 w-5 rounded-sm"
            style={{
              left: `${(index * 13) % 100}%`,
              top: `${(index * 29) % 70}%`,
              transform: `rotate(${index * 21}deg)`,
              background: index % 3 === 0 ? '#f5d99b' : index % 3 === 1 ? '#b72e35' : '#fff7e6'
            }}
          />
        ))}
      </div>
    </div>
  );
}
