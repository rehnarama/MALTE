import RGA, {
  RGAJSON,
  RGAOperationJSON,
  rgaOperationFromJSON
} from "rga/dist/RGA";
import { editor as editorType, IDisposable } from "monaco-editor";
import mapOperations from "./MapOperations";
import { InternalOperation, Operation } from "malte-common/dist/Operations";
import Socket from "./Socket";
import Monaco from "../functions/Monaco";

interface BufferOperationData {
  path: string;
  operation: RGAOperationJSON;
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

  private contentChangedListener: IDisposable;
  private applyingRemote = false;

  constructor(path: string, content: RGAJSON, model: editorType.ITextModel) {
    this._path = path;
    this.rga = RGA.fromRGAJSON(content);
    this._model = model;
    model.setValue(this.toString());

    this.contentChangedListener = this.model.onDidChangeContent(
      (event: editorType.IModelContentChangedEvent) => {
        if (this.applyingRemote) {
          return;
        }

        const internalOps = event.changes.map(op => mapOperations(op)).flat();
        this.applyLocalOperations(internalOps);
        model.setEOL(
          Monaco.getInstance().getEditorNamespace().EndOfLineSequence.LF
        );
      }
    );

    Socket.getInstance()
      .getSocket()
      .on("buffer-operation", (data: BufferOperationData) => {
        if (data.path === this.path) {
          const operation = rgaOperationFromJSON(data.operation);
          const Range = Monaco.getInstance().getMonacoNamespace().Range;
          let edit: editorType.IIdentifiedSingleEditOperation;
          if ("content" in operation) {
            this.rga.insert(operation);

            // Have to apply operation before creating edit
            const index = this.rga.findPos(operation.id);
            const position = model.getPositionAt(index);
            const range = Range.fromPositions(position);
            edit = {
              range,
              text: operation.content
            };
          } else {
            // We have to create edit before applying RGA operation
            const index = this.rga.findPos(operation.reference);
            const position = model.getPositionAt(index);
            const nextPosition = model.getPositionAt(index + 1);
            const range = Range.fromPositions(position, nextPosition);
            edit = {
              range,
              text: null
            };

            this.rga.remove(operation);
          }
          this.applyingRemote = true;
          model.applyEdits([edit]);
          this.applyingRemote = false;
        }
      });
  }

  private internalToRGA(op: InternalOperation) {
    if (op.type === Operation.Insert) {
      return this.rga.createInsertPos(op.position, op.character);
    } else {
      return this.rga.createRemovePos(op.position);
    }
  }

  private applyLocalOperations(ops: InternalOperation[]) {
    for (const op of ops) {
      const rgaOp = this.internalToRGA(op);
      this.rga.applyOperation(rgaOp);
      const socket = Socket.getInstance().getSocket();
      socket.emit("buffer-operation", { path: this.path, operation: rgaOp });
    }
  }

  public close() {
    const socket = Socket.getInstance().getSocket();
    socket.emit("leave-buffer", { path: this.path });
    this.contentChangedListener.dispose();
    this.model.dispose();
  }

  public toString(): string {
    return this.rga.toString();
  }
}
