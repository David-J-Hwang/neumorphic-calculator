import type { HistoryItem } from '../hooks/useCalculator';

type HistoryPanelProps = {
  history: HistoryItem[];
  onUseHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
};

export function HistoryPanel({ history, onUseHistoryItem, onClearHistory }: HistoryPanelProps) {
  return (
    <aside className="history-panel soft-panel">
      <div className="history-panel-header">
        <h2 className="text-lg font-bold text-[#3f474d]">History</h2>
        <button
          className="soft-small-button px-4 text-sm font-bold text-[#cf6b4c] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={history.length === 0}
          onClick={onClearHistory}
          type="button"
        >
          Clear
        </button>
      </div>

      <div className="history-viewport soft-inset">
        {history.length === 0 ? (
          <div className="history-empty">No history yet</div>
        ) : (
          <div className="history-list scrollbar-soft">
            {history.map((item) => (
              <button
                className="soft-history-item text-left"
                key={item.id}
                onClick={() => onUseHistoryItem(item)}
                type="button"
              >
                <span className="history-expression block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-[#8a969d]">
                  {item.expression}
                </span>
                <span className="history-result mt-1 block overflow-hidden text-ellipsis whitespace-nowrap text-xl font-bold text-[#3f474d]">
                  {item.result}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
