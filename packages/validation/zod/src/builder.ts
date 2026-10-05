import {
  AddonBuilder as BaseAddonBuilder,
  validate,
  ValidationError,
  type ShortManifestResource,
} from "@stremio-addon/sdk";
import type z from "zod/v4";
import {
  addonCatalogResponseSchema,
  catalogResponseSchema,
  eventResponseSchema,
  manifestSchema,
  metaResponseSchema,
  streamResponseSchema,
  subtitlesResponseSchema,
} from "./manifest.js";

export interface AddonBuilderOptions {
  /**
   * Validate handler return values against the zod response schemas.
   *
   * Enable when you need strict runtime guarantees on every handler invocation.
   * Disabled by default for performance.
   */
  validateResponses?: boolean;
  /**
   * Called when `validateResponses` is enabled and a handler returns a value that fails validation.
   *
   * - If the callback returns normally, the original (unvalidated) value is passed through to the caller. Useful for log-only behavior.
   * - If the callback throws, that error propagates instead of the `ValidationError`.
   */
  onValidationError?: (
    error: ValidationError,
    ctx: { resource: ShortManifestResource; value: unknown },
  ) => void | Promise<void>;
}

const responseSchemas: Record<ShortManifestResource, z.ZodType> = {
  stream: streamResponseSchema,
  meta: metaResponseSchema,
  catalog: catalogResponseSchema,
  subtitles: subtitlesResponseSchema,
  addon_catalog: addonCatalogResponseSchema,
  player: eventResponseSchema,
  library: eventResponseSchema,
};

export class AddonBuilder extends BaseAddonBuilder {
  private readonly validateResponses: boolean;
  private readonly onValidationError?: AddonBuilderOptions["onValidationError"];

  constructor(
    manifest: z.infer<typeof manifestSchema>,
    options: AddonBuilderOptions = {},
  ) {
    super(manifest, manifestSchema);
    this.validateResponses = options.validateResponses ?? false;
    this.onValidationError = options.onValidationError;
  }

  override defineResourceHandler(
    resource: ShortManifestResource,
    handler: (args: any) => Promise<unknown>,
  ): this {
    if (!this.validateResponses) {
      return super.defineResourceHandler(resource, handler);
    }

    const schema = responseSchemas[resource];
    const onValidationError = this.onValidationError;
    const wrapped = async (args: any) => {
      const value = await handler(args);
      try {
        return validate(schema, value);
      } catch (error) {
        if (error instanceof ValidationError && onValidationError) {
          await onValidationError(error, { resource, value });
          return value;
        }
        throw error;
      }
    };
    return super.defineResourceHandler(resource, wrapped);
  }
}
