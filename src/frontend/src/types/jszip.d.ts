declare module "jszip" {
  interface JSZipObject {
    name: string;
    dir: boolean;
  }
  interface JSZipGeneratorOptions {
    type?:
      | "blob"
      | "arraybuffer"
      | "uint8array"
      | "base64"
      | "nodebuffer"
      | "binarystring";
    compression?: string;
    compressionOptions?: { level?: number };
  }
  interface JSZip {
    folder(name: string): JSZip | null;
    file(name: string, data: string | Blob | ArrayBuffer | Uint8Array): JSZip;
    generateAsync(options: JSZipGeneratorOptions): Promise<Blob>;
  }
  interface JSZipStatic {
    new (): JSZip;
    (): JSZip;
  }
  const JSZip: JSZipStatic;
  export default JSZip;
}
