import RGA, {
  RGAJSON,
  RGAOperationJSON,
  rgaOperationFromJSON
} from "rga/dist/RGA";
import { editor as editorType, IDisposable } from "monaco-editor";
import mapOperations from "./MapOperations";
import { InternalOperation, Operation } from "malte-common/dist/Operations";
import Socket from "./Socket";

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
        const op = event.changes[0];
        const internalOps = mapOperations(op);
        this.applyLocalOperations(internalOps);
      }
    );

    Socket.getInstance()
      .getSocket()
      .on("buffer-operation", (data: BufferOperationData) => {
        if (data.path === this.path) {
          const operation = rgaOperationFromJSON(data.operation);
          if ("content" in operation) {
            this.rga.insert(operation);
          } else {
            this.rga.remove(operation);
          }

          this.applyingRemote = true;
          model.setValue(this.toString());
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
