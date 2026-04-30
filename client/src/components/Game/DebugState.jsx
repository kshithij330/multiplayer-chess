// client/src/components/Game/DebugState.jsx
import useGameStore from "../../store/gameStore";

export default function DebugState() {
  const state = useGameStore();
  
  return (
    <div className="fixed bottom-0 left-0 bg-black/80 text-green-400 font-mono text-xs p-4 z-50 max-w-sm overflow-auto max-h-64">
      <h3>Debug State:</h3>
      <p>playerColor: {state.playerColor}</p>
      <p>fen: {state.fen}</p>
      <p>isCheck: {state.isCheck ? "true" : "false"}</p>
      <p>botThinking: {state.botThinking ? "true" : "false"}</p>
      <p>reviewIndex: {state.reviewIndex}</p>
      <p>lobbyId: {state.lobbyId}</p>
    </div>
  );
}
