const floors = [
  { id: 'floor-2', label: 'L2' },
  { id: 'floor-1', label: 'L1' },
  { id: 'floor-0', label: 'G' },
]

export default function FloorIndicator({ activeFloor, onFloorClick }) {
  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4">
      {floors.map((floor) => {
        const isActive = activeFloor === floor.id
        return (
          <button
            key={floor.id}
            onClick={() => onFloorClick(floor.id)}
            className="group flex items-center gap-3"
          >
            {/* Circle */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]'
                  : 'bg-gray-400 text-white hover:bg-gray-500'
              }`}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
            >
              {floor.label}
            </div>
          </button>
        )
      })}
    </div>
  )
}
