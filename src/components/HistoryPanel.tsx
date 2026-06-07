import type { HistoryItem } from '../hooks/useCalculator';

type HistoryPanelProps = {
  history: HistoryItem[];
  onUseHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
};

export function HistoryPanel({ history, onUseHistoryItem, onClearHistory }: HistoryPanelProps) {
  return (
    <aside className="soft-panel flex h-full min-h-[360px] w-full flex-col gap-4 p-5 lg:w-[320px]">
      <div className="flex items-center justify-between gap-3">
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

      {history.length === 0 ? (
        <div className="soft-inset flex flex-1 items-center justify-center px-4 text-center text-sm font-semibold text-[#8a969d]">
          No history yet
        </div>
      ) : (
        <div className="scrollbar-soft -mx-2 flex flex-1 flex-col gap-4 overflow-y-auto px-2 pb-2 pt-1">
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
    </aside>
  );
}
