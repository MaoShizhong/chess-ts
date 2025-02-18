import { HistorySegments, HistoryState } from '../types';
import * as FEN from '../parsers/FEN';
import { Chessboard } from '../board/board';

export class ChessHistory {
    #currentIndex: number;
    #history: { position: string; move?: string }[];

    constructor(FENState: string) {
        this.#currentIndex = 0;
        this.#history = [{ position: FENState }];
    }

    get length(): number {
        return this.#history.length;
    }

    get currentState(): HistoryState {
        return this.getState(this.#currentIndex);
    }

    getState(index: number): HistoryState {
        const [
            FENPosition,
            activeColour,
            castlingRights,
            enPassantTarget,
            halfMoves,
            fullMoves,
        ] = FEN.split(this.#history[index].position);
        const board = new Chessboard(FENPosition, castlingRights).board;

        return {
            board,
            activeColour,
            castlingRights,
            enPassantTarget,
            halfMoves,
            fullMoves,
        };
    }

    toPreviousState(): HistoryState {
        const hasPreviousState = this.#currentIndex > 0;
        if (hasPreviousState) {
            this.#currentIndex--;
        }

        return this.currentState;
    }

    toNextState(): HistoryState {
        const hasNextGridState = this.#currentIndex < this.#history.length - 1;
        if (hasNextGridState) {
            this.#currentIndex++;
        }

        return this.currentState;
    }

    record(move: string, ...toSerialise: HistorySegments): void {
        const FENState = FEN.serialise(...toSerialise);
        this.#currentIndex++;

        // If gone back some states and recording new state, overwrite "future" states
        this.#history.splice(this.#currentIndex, Infinity, {
            position: FENState,
            move: move,
        });
    }
}
