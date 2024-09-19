import * as fs from 'fs'
import * as os from 'os'
import * as Path from 'path'
import { join } from 'path'

export namespace FileHelper {
  export function getRoot(): string {
    return Path.join(__dirname, '../../..')
  }

  export function findFileContent(path: string): string {
    return fs.readFileSync(path, 'utf-8')
  }

  export function writeFolder(path: string): void {
    fs.mkdirSync(path, { recursive: true })
  }

  export function writeFile(filePath: string, content: string | Buffer): void {
    const normalizedPath = Path.normalize(filePath);
    const dirPath = Path.dirname(normalizedPath);

    console.log({ dirPath })

    // Ensure the directory exists
    writeFolder(dirPath);

    // Write the content to the file
    fs.writeFileSync(normalizedPath, content);
  }
  export function joinPaths(...paths: string[]): string {
    return join(...paths)
  }

  export function createReadStream(path: string): fs.ReadStream {
    return fs.createReadStream(path)
  }

  export function buildTemporaryPath(path: string): string {
    const pathTemporary = Path.join(os.tmpdir(), 'marblism-tmp', path)
    return pathTemporary
  }

  export async function createReadStreamFromArrayBuffer(
    arrayBuffer: ArrayBuffer,
    filename: string,
  ) {
    const path = buildTemporaryPath(filename)

    const pathFolder = path.split('/').slice(0, -1).join('/')

    deleteFolder(pathFolder)

    writeFolder(pathFolder)

    fs.writeFileSync(path, Buffer.from(arrayBuffer))

    return fs.createReadStream(path)
  }

  export async function deleteFile(path: string): Promise<void> {
    fs.unlinkSync(path)
  }

  export function deleteFolder(path: string): void {
    try {
      fs.rmdirSync(path, { recursive: true })
    } catch (error) {
      // ignore
    }
  }
}
