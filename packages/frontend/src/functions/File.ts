import RGA, { RGAJSON } from "rga/dist/RGA";
import { editor as editorType } from "monaco-editor";
import mapOperations from "./MapOperations";
import { InternalOperation, Operation } from "malte-common/dist/Operations";
import Socket from "./Socket";

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

  constructor(path: string, content: RGAJSON, model: editorType.ITextModel) {
    this._path = path;
    this.rga = RGA.fromRGAJSON(content);
    this._model = model;
    model.setValue(this.toString());

    this.model.onDidChangeContent(
      (event: editorType.IModelContentChangedEvent) => {
        const op = event.changes[0];
        const internalOps = mapOperations(op);
        this.applyLocalOperations(internalOps);
      }
    );
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

  public toString(): string {
    return this.rga.toString();
  }
}
