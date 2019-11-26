export enum Operation {
    mkdir,
    rm,
    touch,
    mv
  }

export interface FileOperation {
    operation: Operation;
    dir?: string;
    name?: string;
}
