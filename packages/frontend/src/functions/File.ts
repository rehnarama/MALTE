import RGA, {
  RGAJSON,
  RGAOperationJSON,
  rgaOperationFromJSON
} from "rga/dist/RGA";
import { editor as editorType, IPosition } from "monaco-editor";
import mapOperations from "./MapOperations";
import { InternalOperation, Operation } from "malte-common/dist/Operations";
import Socket from "./Socket";
import RGAIdentifier from "rga/dist/RGAIdentifier";
import Monaco from "../functions/Monaco";

interface BufferOperationData {
  path: string;
  operations: RGAOperationJSON[];
}

export default class File {
  private _path: string;
  get path() {
    return this._path;
  }
  private rga: RGA;
  private _model: editorType.ITextModel;
  get model() {
    return this._model;
  }
  private _viewState: editorType.ICodeEditorViewState | null = null;

  private applyingRemote = false;

  constructor(path: string, content: RGAJSON, model: editorType.ITextModel) {
    this._path = path;
    this.rga = RGA.fromRGAJSON(content);
    this._model = model;
    model.setValue(this.toString());
    model.setEOL(
      Monaco.getInstance().getEditorNamespace().EndOfLineSequence.LF
    );

    this.model.onDidChangeContent(
      (event: editorType.IModelContentChangedEvent) => {
        if (this.applyingRemote) {
          return;
        }

        const internalOps = event.changes.map(op => mapOperations(op)).flat();
        this.applyLocalOperations(internalOps);
      }
    );

    Socket.getInstance()
      .getSocket()
      .on("buffer/operation", this.onBufferOperation);
  }

  private onBufferOperation = (data: BufferOperationData) => {
    if (data.path === this.path) {
      const edits: editorType.IIdentifiedSingleEditOperation[] = [];

      for (const op of data.operations) {
        const operation = rgaOperationFromJSON(op);
        const Range = Monaco.getInstance().getMonacoNamespace().Range;
        let edit: editorType.IIdentifiedSingleEditOperation;
        if ("content" in operation) {
          this.rga.insert(operation);

          // Have to apply operation before creating edit
          const index = this.rga.findPos(operation.id);
          const position = this.model.getPositionAt(index);
          const range = Range.fromPositions(position);
          edit = {
            range,
            text: operation.content,
            forceMoveMarkers: true
          };
          edits.push(edit);
        } else {
          // We have to create edit before applying RGA operation
          const index = this.rga.findPos(operation.reference, operation.offset);
          const position = this.model.getPositionAt(index);
          const nextPosition = this.model.getPositionAt(index + 1);
          const range = Range.fromPositions(position, nextPosition);
          edit = {
            range,
            text: null
          };
          edits.push(edit);

          this.rga.remove(operation);
        }
      }

      this.applyingRemote = true;
      this.model.applyEdits(edits);
      this.applyingRemote = false;
    }
  };

  private internalToRGA(op: InternalOperation) {
    if (op.type === Operation.Insert) {
      return this.rga.createInsertPos(op.position, op.character);
    } else {
      return this.rga.createRemovePos(op.position);
    }
  }

  private applyLocalOperations(ops: InternalOperation[]) {
    const data: BufferOperationData = {
      path: this.path,
      operations: []
    };
    for (const op of ops) {
      const rgaOp = this.internalToRGA(op);
      this.rga.applyOperation(rgaOp);
      data.operations.push(rgaOp);
    }
    const socket = Socket.getInstance().getSocket();
    socket.emit("buffer/operation", data);
  }

  public close() {
    const socket = Socket.getInstance().getSocket();
    socket.emit("buffer/leave", { path: this.path });
    socket.off("buffer/operation", this.onBufferOperation);
    this.model.dispose();
  }

  public toString(): string {
    return this.rga.toString();
  }

  public getIndex(id: RGAIdentifier, offset: number): number {
    return this.rga.findPos(id, offset);
  }

  public getPositionRGA(position: IPosition): [RGAIdentifier, number] {
    const [node, offset] = this.rga.findNodePosOffset(
      this.model.getOffsetAt(position)
    );
    // findNodePosOffset will return the "next" offset for a node, e.g.
    // finding simple node 'a' will return offset=1, but it's position is
    // represented with the offset it's on, i.e. offset=0, thus we have to do -1
    return [node.id, offset - 1];
  }

  public getViewState(): editorType.ICodeEditorViewState | null {
    return this._viewState;
  }
  public setViewState(newViewState: editorType.ICodeEditorViewState | null) {
    this._viewState = newViewState;
  }
}
