import type {
  AddonInterface,
  CatalogHandlerArgs,
  DefaultConfig,
  HandlerArgs,
  LibraryHandlerArgs,
  Manifest,
  ManifestSchema,
  MetaDetail,
  MetaHandlerArgs,
  MetaPreview,
  PlayerHandlerArgs,
  ShortManifestResource,
  Stream,
  StreamHandlerArgs,
  Subtitle,
  SubtitlesHandlerArgs,
  WithCache,
} from "./types.js";
import { validate } from "./validator.js";

type Handler = (args: HandlerArgs) => Promise<unknown>;

export class AddonBuilder {
  protected readonly handlers = new Map<ShortManifestResource, Handler>();
  protected readonly manifest: Manifest;

  constructor(data: Manifest, schema?: ManifestSchema) {
    this.manifest = schema ? validate(schema, data) : data;
    Object.freeze(this.manifest);
  }

  defineResourceHandler(
    resource: ShortManifestResource,
    handler: Handler,
  ): this {
    if (this.handlers.has(resource)) {
      throw new Error(`Handler for resource "${resource}" is already defined`);
    }
    this.handlers.set(resource, handler);
    return this;
  }

  defineStreamHandler<Config = DefaultConfig>(
    handler: (
      args: StreamHandlerArgs<Config>,
    ) => Promise<WithCache<{ streams: Stream[] }>>,
  ): this {
    return this.defineResourceHandler("stream", handler as Handler);
  }

  defineMetaHandler<Config = DefaultConfig>(
    handler: (
      args: MetaHandlerArgs<Config>,
    ) => Promise<WithCache<{ meta: MetaDetail }>>,
  ): this {
    return this.defineResourceHandler("meta", handler as Handler);
  }

  defineCatalogHandler<Config = DefaultConfig>(
    handler: (
      args: CatalogHandlerArgs<Config>,
    ) => Promise<WithCache<{ metas: MetaPreview[] }>>,
  ): this {
    return this.defineResourceHandler("catalog", handler as Handler);
  }

  defineSubtitlesHandler<Config = DefaultConfig>(
    handler: (
      args: SubtitlesHandlerArgs<Config>,
    ) => Promise<WithCache<{ subtitles: Subtitle[] }>>,
  ): this {
    return this.defineResourceHandler("subtitles", handler as Handler);
  }

  /**
   * Receives playback events. Stremio ignores the response body, so return any object.
   */
  definePlayerHandler<Config = DefaultConfig>(
    handler: (
      args: PlayerHandlerArgs<Config>,
    ) => Promise<Record<string, unknown>>,
  ): this {
    return this.defineResourceHandler("player", handler as Handler);
  }

  /**
   * Receives library events. Stremio ignores the response body, so return any object.
   */
  defineLibraryHandler<Config = DefaultConfig>(
    handler: (
      args: LibraryHandlerArgs<Config>,
    ) => Promise<Record<string, unknown>>,
  ): this {
    return this.defineResourceHandler("library", handler as Handler);
  }

  getInterface(): AddonInterface {
    return {
      manifest: this.manifest,
      get: (resource, type, id, extra = {}, config = {}) => {
        const handler = this.handlers.get(resource);
        if (!handler) {
          return Promise.reject(`No handler for ${resource}`);
        }
        return handler({ type, id, extra, config });
      },
    };
  }
}
