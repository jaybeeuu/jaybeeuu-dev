import type fsModule from "fs";
import type PathModule from "path";

const mocked = <T extends (...args: any[]) => any>(fn: T): jest.MockInstance<ReturnType<T>, Parameters<T>> => {
  const mockedFn = fn as unknown as jest.MockInstance<ReturnType<T>, Parameters<T>>;
  if (!mockedFn.mock) {
    throw new Error(`Expected a mock function but ${fn.name || "{anonymous function}"} had no mock property.`);
  }
  return mockedFn;
};

const isEmptyObject = (obj: Record<PropertyKey, unknown>): obj is Record<PropertyKey, never> => {
  return Object.keys(obj).length === 0;
};

const pathUtils = jest.requireActual<typeof PathModule>("path");

type FsModule = typeof fsModule;

const fs = jest.createMockFromModule<FsModule>("fs");
fs.promises = jest.createMockFromModule<FsModule["promises"]>("fs/promises");

type StatsPropsType
  = "file"
  | "directory"
  | "block-device"
  | "character-device"
  | "symbolic-link"
  | "fifo"
  | "socket";

interface StatsProps {
  type: StatsPropsType;
  dev: number;
  ino: number;
  mode: number;
  nlink: number;
  uid: number;
  gid: number;
  rdev: number;
  size: number;
  blksize: number;
  blocks: number;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;
}

class Stats implements fsModule.Stats {
  private readonly props: StatsProps;
  constructor(props: StatsProps) {
    this.props = props;
  }

  isFile(): boolean {
    return this.props.type === "file";
  }
  isDirectory(): boolean {
    return this.props.type === "directory";
  }
  isBlockDevice(): boolean {
    return this.props.type === "block-device";
  }
  isCharacterDevice(): boolean {
    return this.props.type === "character-device";
  }
  isSymbolicLink(): boolean {
    return this.props.type === "symbolic-link";
  }
  isFIFO(): boolean {
    return this.props.type === "fifo";
  }
  isSocket(): boolean {
    return this.props.type === "socket";
  }
  get dev(): number {
    return this.props.dev;
  }
  get ino(): number {
    return this.props.ino;
  }
  get mode(): number {
    return this.props.mode;
  }
  get nlink(): number {
    return this.props.nlink;
  }
  get uid(): number {
    return this.props.uid;
  }
  get gid(): number {
    return this.props.gid;
  }
  get rdev(): number {
    return this.props.rdev;
  }
  get size(): number {
    return this.props.size;
  }
  get blksize(): number {
    return this.props.blksize;
  }
  get blocks(): number {
    return this.props.blocks;
  }
  get atime(): Date {
    return this.props.atime;
  }
  get mtime(): Date {
    return this.props.mtime;
  }
  get ctime(): Date {
    return this.props.ctime;
  }
  get birthtime(): Date {
    return this.props.birthtime;
  }
  get atimeMs(): number {
    return this.atime.getMilliseconds();
  }
  get mtimeMs(): number {
    return this.mtime.getMilliseconds();
  }
  get ctimeMs(): number {
    return this.ctime.getMilliseconds();
  }
  get birthtimeMs(): number {
    return this.birthtime.getMilliseconds();
  }
}

interface File {
  type: "file";
  path: string;
  content: string;
  stats: fsModule.Stats;
  update: (newContent: string) => void;
  logAccess: () => void;
}

const makeFile = (
  path: string,
  content: string,
  stats: Partial<StatsProps> = {}
): File => {
  return {
    type: "file",
    path,
    content,
    stats: new Stats({
      type: "file",
      dev: 2114,
      ino: 48064969,
      mode: 33188,
      nlink: 1,
      uid: 85,
      gid: 100,
      rdev: 0,
      size: content.length,
      blksize: 4096,
      blocks: 8,
      atime: new Date(),
      mtime: new Date(),
      ctime: new Date(),
      birthtime: new Date(),
      ...stats
    }),
    update(newContent: string) {
      this.content = newContent;
      this.stats = new Stats({
        type: "file",
        ...this.stats,
        mtime: new Date()
      });
    },
    logAccess() {
      this.stats = new Stats({
        type: "file",
        ...this.stats,
        atime: new Date()
      });
    }
  };
};

interface Directory {
  type: "directory";
  path: string;
  entries: { [name: string]: DirectoryEntry; };
  stats: fsModule.Stats;
}

const makeDirectory = (
  path: string,
  entries: Directory["entries"],
  stats: Partial<StatsProps> = {}
): Directory => {
  return {
    type: "directory",
    path,
    entries,
    stats: new Stats({
      type: "directory",
      dev: 2114,
      ino: 48064969,
      mode: 33188,
      nlink: 1,
      uid: 85,
      gid: 100,
      rdev: 0,
      size: 0,
      blksize: 0,
      blocks: 0,
      atime: new Date(),
      mtime: new Date(),
      ctime: new Date(),
      birthtime: new Date(),
      ...stats
    })
  };
};

type DirectoryEntry = Directory | File;

const root: Directory = makeDirectory(".", {});

const resolvePath = (path: string): string => {
  return pathUtils.relative(process.cwd(), path);
};

type GetEntryFailed = {
  entry: File | undefined;
  existed: false;
  failedPath: string;
  parentDirectory: Directory;
};

type GetEntrySuccess = {
  entry: DirectoryEntry;
  existed: true;
  parentDirectory: Directory;
};

type GetEntryResult = GetEntryFailed | GetEntrySuccess;

const getEntry = (
  pathFragments: string[],
  directory: Directory,
  pathToHere: string
): GetEntryResult => {
  const [topPath, ...rest] = pathFragments;
  const currentEntryPath = pathUtils.join(pathToHere, topPath);
  const currentEntry = topPath === "." || topPath === ""
    ? directory
    : directory.entries[topPath];

  if (rest.length === 0 && currentEntry) {
    return {
      existed: true,
      parentDirectory: directory,
      entry: currentEntry
    };
  }

  return typeof currentEntry === "undefined" || currentEntry.type === "file"
    ? {
      existed: false,
      failedPath: currentEntryPath,
      parentDirectory: directory,
      entry: currentEntry
    }
    : getEntry(rest, currentEntry, pathUtils.join(pathToHere, topPath));
};

const maybeGetEntry = (
  path: string,
): GetEntryResult => {
  const resolvedPath = resolvePath(path);
  const directories = resolvedPath.split(pathUtils.sep);
  return getEntry(directories, root, "");
};

type MaybeGetDirectorySuccess = {
  directory: Directory;
  existed: true;
  parentDirectory: Directory;
};

type MaybeGetDirectoryFailure = {
  entry: File | undefined;
  existed: false;
  failedPath: string;
  message: string;
  parentDirectory: Directory;
};

type MaybeGetDirectoryResult = MaybeGetDirectorySuccess | MaybeGetDirectoryFailure;

const maybeGetDirectory = (
  path: string
): MaybeGetDirectoryResult => {
  const resolvedPath = resolvePath(path);
  const directories = resolvedPath.split(pathUtils.sep);
  const getEntryResult = getEntry(directories, root, "");

  if (getEntryResult.existed === false) {
    const wasAFile = getEntryResult.entry?.type === "file";
    return {
      ...getEntryResult,
      existed: false,
      message: `Could not get directory ${path}. Path ${getEntryResult.failedPath} ${wasAFile ? "was a file" : "did not exist."}`
    };
  }

  if (getEntryResult.entry.type === "file") {
    return {
      entry: getEntryResult.entry,
      existed: false,
      failedPath: path,
      message: `Could not get directory ${path}. The path refers to a file.`,
      parentDirectory: getEntryResult.parentDirectory
    };
  }

  return {
    directory: getEntryResult.entry,
    existed: true,
    parentDirectory: getEntryResult.parentDirectory
  };
};

const getDirectory = (path: string): Directory => {
  const maybeGetDirectoryResult = maybeGetDirectory(path);

  if (maybeGetDirectoryResult.existed === true) {
    return maybeGetDirectoryResult.directory;
  }

  throw new Error(maybeGetDirectoryResult.message);
};

type MaybeGetFileResult
  = { existed: true; file: File }
  | { existed: false; failedPath: string; message: string, entry: File | Directory | undefined; };
const maybeGetFile = (
  path: string
): MaybeGetFileResult => {
  const resolvedPath = resolvePath(path);
  const directories = resolvedPath.split(pathUtils.sep);
  const getEntryResult = getEntry(directories, root, "");

  if (getEntryResult.existed === false) {
    const wasAFile = getEntryResult.entry?.type === "file";
    return {
      ...getEntryResult,
      existed: false,
      message: `Could not get File ${path}. Path ${getEntryResult.failedPath} ${wasAFile ? "was a file" : "did not exist."}`
    };
  }

  if (getEntryResult.entry.type === "directory") {
    return {
      entry: getEntryResult.entry,
      failedPath: path,
      existed: false,
      message: `Could not get File ${path}. The path refers to a directory.`
    };
  }

  return {
    existed: true,
    file: getEntryResult.entry
  };
};

const getFile = (path: string): File => {
  const maybeGetFileResult = maybeGetFile(path);
  if (maybeGetFileResult.existed === true) {
    return maybeGetFileResult.file;
  }
  throw new Error(maybeGetFileResult.message);
};

const assertPathIsString: (path: fsModule.PathLike) => asserts path is string = (path) => {
  if (typeof path !== "string") {
    throw new Error("Cannot handle buffer paths - tht hasn't been mocked.");
  }
};

const assertIsSupportedCopyFileArguments: (
  args: Parameters<typeof fsModule.promises.copyFile>
) => asserts args is [string, string, undefined] = (args) => {
  const [source, destination, flags] = args;
  if (
    typeof source !== "string"
    || typeof destination !== "string"
    || typeof flags !== "undefined"
  ) {
    throw new Error("copyFIle mock only supports string source and destination and undefined flags.");
  }
};

mocked(
  fs.promises.copyFile
).mockImplementation(
  async (...args) => {
    assertIsSupportedCopyFileArguments(args);
    const [source, destination] = args;
    await Promise.resolve();
    const resolvedSource = resolvePath(source);
    const file = getFile(resolvedSource);
    await fs.promises.writeFile(destination, file.content, "utf8");
  }
);

const assertIsSupportedAccessArguments: (
  args: Parameters<typeof fs.promises.access>
) => asserts args is [string, undefined] = (
  args
) => {
  const [path, mode] = args;
  if (typeof path !== "string" && typeof mode === "undefined" ) {
    throw new Error("Only string path, undefined mode is supported. other argument types have not been implemented.");
  }
};

mocked(fs.promises.access).mockImplementation(async (...args): Promise<void> => {
  assertIsSupportedAccessArguments(args);
  await Promise.resolve();
  const [path] = args;
  const resolvedPath = resolvePath(path);
  const parentDirName = pathUtils.dirname(resolvedPath);
  const parentDir = getDirectory(parentDirName);
  const fileOrDirName = pathUtils.basename(resolvedPath);

  if (parentDir.entries[fileOrDirName]) {
    return;
  }

  throw new Error(`Could not access ${path}: Neither file nor directory called ${fileOrDirName} existed in ${parentDirName}`);
});

mocked(fs.accessSync).mockImplementation((...args): void => {
  assertIsSupportedAccessArguments(args);
  const [path] = args;
  const resolvedPath = resolvePath(path);
  const parentDirName = pathUtils.dirname(resolvedPath);
  const parentDir = getDirectory(parentDirName);
  const fileOrDirName = pathUtils.basename(resolvedPath);

  if (parentDir.entries[fileOrDirName]) {
    return;
  }

  throw new Error(`Could not access ${path}: Neither file nor directory called ${fileOrDirName} existed in ${parentDirName}`);
});

type LstatOptions
  = fsModule.StatOptions & { bigint?: false }
  | fsModule.StatOptions & { bigint: true }
  | fsModule.StatOptions;

type Lstat = (
  path: fsModule.PathLike,
  opts?: LstatOptions
) => Promise<fsModule.Stats | fsModule.BigIntStats>

const assertIsSupportedLstatArguments: (
  args: Parameters<Lstat>
) => asserts args is [string, undefined] = (args) => {
  const [path, options] = args;
  const isValidOptions = typeof options === "undefined";

  if (typeof path !== "string" || !isValidOptions) {
    throw new Error("Mkdir mock only supports string path and undefined options or the recursive option.");
  }
};

mocked(fs.promises.lstat as Lstat).mockImplementation(async (
  ...args
): Promise<fsModule.Stats | fsModule.BigIntStats> => {
  assertIsSupportedLstatArguments(args);
  const [path] = args;
  await Promise.resolve();
  const maybeGetEntryResult = maybeGetEntry(path);
  if (maybeGetEntryResult.existed === false) {
    throw new Error(`Could not lstat ${path}: Path ${maybeGetEntryResult.failedPath} ${maybeGetEntryResult.entry ? "was a file" : "did not exist"}.`);
  }
  return maybeGetEntryResult.entry.stats;
});

type MkdirOptions
  = fsModule.MakeDirectoryOptions & { recursive: true; }
  | fsModule.Mode | (fsModule.MakeDirectoryOptions & { recursive?: false; }
  | fsModule.Mode | fsModule.MakeDirectoryOptions | null)

type Mkdir = (
  path: fsModule.PathLike,
  options?: MkdirOptions
) => Promise<string | string[] | undefined>;

const assertIsSupportedMkdirArguments: (
  args: Parameters<Mkdir>
) => asserts args is [string, { recursive: boolean } | undefined] = (args) => {
  const [path, options] = args;
  const isValidOptions = typeof options === "undefined"
    || options
      && typeof options === "object"
      && Object.keys(options).length === 1
      && typeof options.recursive === "boolean";

  if (typeof path !== "string" || !isValidOptions) {
    throw new Error("Mkdir mock only supports string path and undefined options or the recursive option.");
  }
};

mocked(fs.promises.mkdir as Mkdir).mockImplementation(async (...args): Promise<string | string[] | undefined> => {
  assertIsSupportedMkdirArguments(args);
  const [path, options] = args;
  await Promise.resolve();
  const resolvedPath = resolvePath(path);
  const parentDirName = pathUtils.dirname(resolvedPath);
  const getParentDirResult = maybeGetDirectory(parentDirName);

  const targetDirName = pathUtils.basename(resolvedPath);

  if (getParentDirResult.existed === true) {
    const parentDir = getParentDirResult.directory;
    const existingEntry = parentDir.entries[targetDirName];

    if (existingEntry) {
      if (options?.recursive) {
        return undefined;
      }
      throw new Error(`Could not make dir ${path}: ${parentDirName} already contains a ${existingEntry.type} called ${targetDirName}.`);
    }

    parentDir.entries[targetDirName] = makeDirectory(
      pathUtils.join(parentDir.path, targetDirName),
      {}
    );

    return parentDirName;
  }

  if (getParentDirResult.entry) {
    throw new Error(`Could not make dir ${path}: ${getParentDirResult.failedPath} is a file.`);
  }

  if (!options?.recursive) {
    throw new Error(`Could not make dir ${path}: ${getParentDirResult.failedPath} does not exist. Did you mean to recurse?`);
  }

  const pathLeft = pathUtils.relative(getParentDirResult.parentDirectory.path, resolvedPath);
  const segments = pathLeft.split(pathUtils.sep);
  segments.reduce<Directory>(
    (dir, segment) => {
      const newDir = makeDirectory(
        pathUtils.join(dir.path, segment),
        {}
      );

      dir.entries[segment] = newDir;

      return newDir;
    },
    getParentDirResult.parentDirectory
  );

  return getParentDirResult.failedPath;
});

mocked(fs.promises.rm).mockImplementation(async (path, options) => {
  assertPathIsString(path);
  await Promise.resolve();
  const resolvedPath = resolvePath(path);
  const parentDirName = pathUtils.dirname(resolvedPath);

  if (path === "/" && options?.recursive && options?.force) {
    root.entries = {};
    return;
  }

  const getParentDirResult = maybeGetDirectory(parentDirName);
  if (getParentDirResult.existed === false) {
    if (!options?.force) {
      throw new Error(`Unable to rm ${path}: ${getParentDirResult.message}`);
    }
    return;
  }

  const parentDir = getParentDirResult.directory;
  const fileOrDirName = pathUtils.basename(resolvedPath);
  const entry = parentDir.entries[fileOrDirName];

  if (!entry && !options?.force) {
    throw new Error(`Unable to rm ${path}: that path did not exist.`);
  }

  if (!entry) {
    return;
  }

  if (entry.type === "file") {
    delete parentDir.entries[fileOrDirName];
    return;
  }

  if (
    !isEmptyObject(entry.entries)
    && !options?.recursive
  ) {
    throw new Error(`Unable to rm ${path}: the directory was not empty. Did you mean to recurse?`);
  }

  delete parentDir.entries[fileOrDirName];
});

type ReaddirOptions =
  | {
    encoding: BufferEncoding | null;
    withFileTypes?: false | undefined;
  }
  | BufferEncoding
  | undefined
  | null;

type Readdir = (
  path: fsModule.PathLike,
  options?: ReaddirOptions
) => Promise<string[] | Buffer[] | fsModule.Dirent[]>;

const assertIsSupportedReaddirArguments: (
  args: Parameters<Readdir>
) => asserts args is [string, undefined] = (args) => {
  const [path, options] = args;
  if (typeof path !== "string" || typeof options !== "undefined") {
    throw new Error("Readdir mock only supports string path and undefined options");
  }
};

mocked<Readdir>(
  fs.promises.readdir as Readdir
).mockImplementation(
  async (...args) => {
    assertIsSupportedReaddirArguments(args);
    const [path] = args;
    const resolvedPath = resolvePath(path);
    await Promise.resolve();
    const dir = getDirectory(resolvedPath);
    return Object.keys(dir.entries);
  }
);

const assertIsSupportedReadFileArguments: (
  args: Parameters<typeof fs.promises.readFile> | Parameters<typeof fs.readFileSync>
) => asserts args is [string, "utf8"] = (
  args
) => {
  const [path, options] = args;
  if (typeof path !== "string" || options !== "utf8" ) {
    throw new Error("Only string path and utf8 options is supported. other argument types have not been implemented.");
  }
};

mocked(fs.readFileSync).mockImplementation((...args) => {
  assertIsSupportedReadFileArguments(args);
  const [path] = args;
  const file = getFile(path);
  file.logAccess();
  return file.content;
});

mocked(fs.promises.readFile).mockImplementation(async (...args) => {
  assertIsSupportedReadFileArguments(args);
  const [path] = args;
  await Promise.resolve();
  const file = getFile(path);
  file.logAccess();
  return file.content;
});

const assertIsSupportedWriteFileArguments: (
  args: Parameters<typeof fs.promises.writeFile>
) => asserts args is [string, "utf8"] = (
  args
) => {
  const [path, data, options] = args;
  if (typeof path !== "string" && typeof data !== "string" || options !== "utf8" ) {
    throw new Error("Only string path, string data and utf8 options is supported. other argument types have not been implemented.");
  }
};

mocked(fs.promises.writeFile).mockImplementation(async (...args) => {
  assertIsSupportedWriteFileArguments(args);
  const [path, data] = args;
  await Promise.resolve();
  const resolvedPath = resolvePath(path);
  const fileName = pathUtils.basename(resolvedPath);
  const parentDirName = pathUtils.dirname(resolvedPath);
  const directory = getDirectory(parentDirName);
  const file = directory.entries[fileName];

  if (!file) {
    directory.entries[fileName] = makeFile(
      resolvedPath,
      data
    );
    return;
  }

  if (file.type === "directory") {
    throw new Error(`Failed to writeFile: ${resolvedPath} contains a directory called ${fileName}. You're not allowed to overwrite.`);
  }

  file.content = data;
});

export default fs;
