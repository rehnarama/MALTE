export enum Operation {
    mkdir,
    rm,
    touch,
    mv
  }

export interface FileOperation {
    operation: Operation;
    path: string;
    name?: string;
}
