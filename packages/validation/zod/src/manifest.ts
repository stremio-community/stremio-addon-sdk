import z from "zod/v4";
import type { ManifestSchema as StandardManifestSchema } from "@stremio-addon/sdk";

export const shortManifestResourceSchema = z.enum([
  "catalog",
  "meta",
  "stream",
  "subtitles",
  "addon_catalog",
  "player",
  "library",
]);
export type ShortManifestResourceSchema = z.infer<
  typeof shortManifestResourceSchema
>;

export const extraSchema = z.enum(["search", "genre", "skip", "date"]);
export type ExtraSchema = z.infer<typeof extraSchema>;

export const contentTypeSchema = z.enum(["movie", "series", "channel", "tv"]);
export type ContentTypeSchema = z.infer<typeof contentTypeSchema>;

export const manifestConfigTypeSchema = z.enum([
  "text",
  "number",
  "password",
  "checkbox",
  "select",
]);
export type ManifestConfigTypeSchema = z.infer<typeof manifestConfigTypeSchema>;

/**
 * A resolving object can also include the following cache related properties.
 */
export const cacheSchema = z.object({
  /**
   * (in seconds) sets the `Cache-Control` header to `max-age=$cacheMaxAge`
   * and overwrites the global cache time set in serveHTTP options.
   */
  cacheMaxAge: z.number().optional(),
  /**
   * (in seconds) sets the `Cache-Control` header to `stale-while-revalidate=$staleRevalidate`.
   */
  staleRevalidate: z.number().optional(),
  /**
   * (in seconds) sets the `Cache-Control` header to `stale-if-error=$staleError`.
   */
  staleError: z.number().optional(),
});
export type CacheSchema = z.infer<typeof cacheSchema>;

/**
 * Subtitles resource for the chosen media.
 */
export const subtitleSchema = z.object({
  /**
   * Unique identifier for each subtitle, if you have more than one subtitle with the same language, the id will differentiate them.
   */
  id: z.string(),
  /**
   * Url to the subtitle file.
   */
  url: z.string(),
  /**
   * Language code for the subtitle, if a valid ISO 639-2 code is not sent, the text of this value will be used instead.
   */
  lang: z.string(),
  /**
   * Label shown in the subtitle picker instead of the language name, useful when providing multiple subtitles for the same language.
   * If omitted, the language name derived from `lang` is displayed.
   * @example "English [CC]", "eng #1 [opensubtitles] 1080p.BluRay"
   */
  label: z.string().optional(),
});
export type SubtitleSchema = z.infer<typeof subtitleSchema>;

/**
 * An object representing a streaming source.
 */
export const streamSourceSchema = z.object({
  /**
   * Direct http(s)/ftp(s) link to a file.
   * Depending on context: zip, rar, 7z, tar, tgz.
   */
  url: z.string(),

  /**
   * Size of the file in bytes.
   * While optional, adding this can speed up the initial buffering.
   */
  bytes: z.number().optional(),
});
export type StreamSourceSchema = z.infer<typeof streamSourceSchema>;

/**
 * Tells Stremio how to obtain the media content.
 *
 * It may be torrent info hash, HTTP URL, etc.
 */
export const streamSchema = z.object({
  /**
   * Direct URL to a video stream - http, https, rtmp protocols are supported.
   */
  url: z.string().optional(),
  /**
   * Youtube video ID, plays using the built-in YouTube player.
   */
  ytId: z.string().optional(),
  /**
   * Info hash of a torrent file, and fileIdx is the index of the video file within the torrent.
   *
   * If fileIdx is not specified, the largest file in the torrent will be selected.
   */
  infoHash: z.string().optional(),
  /**
   * The index of the video file within the:
   * - torrent (from infoHash)
   * - nzb (from nzbUrl)
   * - rar (from rarUrls)
   * - zip (from zipUrls)
   * - 7zip (from 7zipUrls)
   * - tgz (from tgzUrls)
   * - tar (from tarUrls)
   *
   * If fileIdx is not specified, the largest file in the torrent will be selected (torrent only).
   */
  fileIdx: z.number().optional(),
  /**
   * Meta Link or an external URL to the video, which should be opened in a browser (webpage).
   *
   * e.g. a link to Netflix.
   */
  externalUrl: z.string().optional(),
  /**
   * Title of the stream
   *
   * Usually used for stream quality.
   *
   * @deprecated use `description` instead.
   */
  title: z.string().optional(),
  /**
   * Description of the stream (previously `title`)
   */
  description: z.string().optional(),
  /**
   * Name of the stream
   *
   * Usually used for stream quality.
   */
  name: z.string().optional(),
  /**
   * Array of Subtitle objects representing subtitles for this stream.
   */
  subtitles: z.array(subtitleSchema).optional(),
  /**
   * Array of strings representing torrent tracker URLs and DHT network nodes.
   *
   * This attribute can be used to provide additional peer discovery options when `infoHash` is also specified.
   * Each element can be a tracker URL (`tracker:<protocol>://<host>:<port>`) where <protocol> can be either http or udp.
   * A DHT node (`dht:<node_id/info_hash>`) can also be included.
   *
   * WARNING: Use of DHT may be prohibited by some private trackers as it exposes torrent activity to a broader network.
   */
  sources: z.array(z.string()).optional(),
  /**
   * A string representing a regex (example: `/.mkv$|.mp4$|.avi$|.ts$/i`) to match the video file within the nzb (from nzbUrl), rar (from rarUrls, zip (from zipUrls), 7zip (from 7zipUrls), tgz (from tgzUrls), tar (from tarUrls)); (not supported for torrents yet).
   */
  fileMustInclude: z.string().optional(),
  /**
   * Http(s) or ftp(s) link to a NZB (usenet) file.
   * This source will also unpack any known archive files.
   */
  nzbUrl: z.string().optional(),
  /**
   * List of strings that each represent a connection to a NNTP (usenet) server (for nzbUrl) in the form of `nntp(s)://{user}:{pass}@{nntpDomain}:{nntpPort}/{nntpConnections}` (nntps = SSL; nntp = no encryption)
   * @example `nntps://myuser:mypass@news.example.com/4`
   */
  servers: z.array(z.string()).optional(),
  /**
   * Stream sources that lead to rar files (multi-volume supported).
   * Limitation: multi-volume and seeking in the video supported, decompression is not supported (decompression is not normally required for audio / video files).
   */
  rarUrls: z.array(streamSourceSchema).optional(),
  /**
   * Stream sources that lead to zip files (multi-volume supported).
   * Limitation: multi-volume and decompression are supported, it does not support seeking in the video.
   */
  zipUrls: z.array(streamSourceSchema).optional(),
  /**
   * Stream sources that lead to 7z files (multi-volume supported).
   * Limitation: multi-volume and LZMA decompression are support, it supports seeking only when compression is not used (decompression is not normally required for audio / video files)
   */
  "7zipUrls": z.array(streamSourceSchema).optional(),
  /**
   * Stream sources that lead to tgz files (multi-volume supported).
   * Limitation: multi-volume and decompression are supported, it does not support seeking in the video.
   */
  tgzUrls: z.array(streamSourceSchema).optional(),
  /**
   * Stream sources that lead to tar files (TAR does not support multi-volume).
   * Limitation: does not support multi-volume and decompression by design (tar only merges multiple files into one without compressing), seeking is supported.
   */
  tarUrls: z.array(streamSourceSchema).optional(),
  behaviorHints: z
    .object({
      /**
       * Hints it's restricted to particular countries.
       *
       * Array of ISO 3166-1 alpha-3 country codes in lowercase in which the stream is accessible.
       */
      countryWhitelist: z.array(z.string()).optional(),
      /**
       * Applies if the protocol of the url is http(s).
       *
       * Needs to be set to true if the URL does not support https or is not an MP4 file.
       */
      notWebReady: z.boolean().optional(),
      /**
       * If defined, addons with the same behaviorHints.bingeGroup will be chosen automatically for binge watching.
       *
       * This should be something that identifies the stream's nature within your addon.
       * For example, if your addon is called "gobsAddon", and the stream is 720p, the bingeGroup should be "gobsAddon-720p".
       * If the next episode has a stream with the same bingeGroup, stremio should select that stream implicitly.
       */
      bingeGroup: z.string().optional(),
      /**
       * @deprecated use `bingeGroup` instead.
       */
      group: z.string().optional(),
      /**
       * Only applies to urls. When using this property, you must also set stream.behaviorHints.notWebReady: true.
       *
       * This is an object containing request and response headers that should be used for the stream.
       * Example: { "request": { "User-Agent": "Stremio" } }
       */
      proxyHeaders: z
        .object({
          request: z.record(z.string(), z.string()).optional(),
          response: z.record(z.string(), z.string()).optional(),
        })
        .optional(),
      /**
       * The calculated OpenSubtitles hash of the video.
       *
       * This will be used when the streaming server is not connected (so the hash cannot be calculated locally).
       * This value is passed to subtitle addons to identify correct subtitles.
       */
      videoHash: z.string().optional(),
      /**
       * Size of the video file in bytes.
       *
       * This value is passed to the subtitle addons to identify correct subtitles.
       */
      videoSize: z.number().optional(),
      /**
       * Filename of the video file.
       *
       * Although optional, it is highly recommended to set it when using stream.url (when possible)
       * in order to identify correct subtitles. This value is passed to the subtitle addons to identify correct subtitles.
       */
      filename: z.string().optional(),
    })
    .optional(),
});
export type StreamSchema = z.infer<typeof streamSchema>;

export const metaLinkSchema = z.object({
  /**
   * Human readable name for the link.
   */
  name: z.string(),
  /**
   * Any unique category name, links are grouped based on their category.
   *
   * Some recommended categories are: actor, director, writer,
   * while the following categories are reserved and should not be used: imdb, share, similar.
   */
  category: z.string(),
  /**
   * An external URL or Meta Link.
   */
  url: z.string(),
});
export type MetaLinkSchema = z.infer<typeof metaLinkSchema>;

export const contentRatingSchema = z.object({
  /**
   * e.g. "PG"
   */
  value: z.string(),
  /**
   * Rating system the value belongs to.
   *
   * e.g. "TVPG"
   */
  system: z.string().optional(),
  /**
   * URL to an icon for the rating.
   */
  icon: z.string().optional(),
});
export type ContentRatingSchema = z.infer<typeof contentRatingSchema>;

export const metaVideoSchema = z.object({
  /**
   * ID of the video.
   */
  id: z.string(),
  /**
   * Title of the video.
   */
  title: z.string(),
  /**
   * ISO 8601, publish date of the video.
   *
   * for episodes, this should be the initial air date.
   *
   * e.g. "2010-12-06T05:00:00.000Z"
   */
  released: z.string(),
  /**
   * URL to png of the video thumbnail, in the video's aspect ratio.
   *
   * max file size 5kb.
   */
  thumbnail: z.string().optional(),
  /**
   * In case you can return links to streams while forming meta response,
   * you can pass and array of Stream Objects to point the video to a HTTP URL, BitTorrent,
   * YouTube or any other stremio-supported transport protocol.
   *
   * Note that this is exclusive: passing video.streams means that Stremio will not request any streams
   * from other addons for that video.
   * If you return streams that way, it is still recommended to implement the streams resource.
   */
  streams: z.array(streamSchema).optional(),
  /**
   * Set to true to explicitly state that this video is available for streaming, from your addon.
   *
   * No need to use this if you've passed stream.
   */
  available: z.boolean().optional(),
  /**
   * Episode number, if applicable.
   */
  episode: z.number().optional(),
  /**
   * Season number, if applicable.
   */
  season: z.number().optional(),
  /**
   * YouTube ID of the trailer video; use if this is an episode for a series.
   */
  trailer: z.string().optional(),
  /**
   * Array containing Stream Objects for trailers.
   */
  trailers: z.array(streamSchema).optional(),
  /**
   * Video overview/summary
   */
  overview: z.string().optional(),
  /**
   * ISO 8601 start of a live TV programme.
   *
   * Together with `endTime`, marks the video as a scheduled broadcast shown in the [Native EPG](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/epg.md).
   */
  startTime: z.string().optional(),
  /**
   * ISO 8601 end of a live TV programme, strictly later than `startTime`.
   */
  endTime: z.string().optional(),
  /**
   * Human-readable duration.
   *
   * e.g. "45 min"
   */
  runtime: z.string().optional(),
  /**
   * Original air year.
   *
   * e.g. "2026"
   */
  releaseInfo: z.string().optional(),
  /**
   * Categories.
   *
   * e.g. ["News", "Sport"]
   */
  genres: z.array(z.string()).optional(),
  /**
   * Names of the cast.
   */
  cast: z.array(z.string()).optional(),
  /**
   * Names of the directors.
   */
  directors: z.array(z.string()).optional(),
  links: z.array(metaLinkSchema).optional(),
  /**
   * Content ratings.
   */
  ratings: z.array(contentRatingSchema).optional(),
});
export type MetaVideoSchema = z.infer<typeof metaVideoSchema>;

/**
 * Summarized collection of meta items.
 *
 * Catalogs are displayed on the Stremio's Board, Discover and Search.
 */
export const metaPreviewSchema = z.object({
  /**
   * Universal identifier.
   * You may use a prefix unique to your addon.
   *
   * Example: 'yt_id:UCrDkAvwZum-UTjHmzDI2iIw'
   */
  id: z.string(),
  /**
   * Type of the content.
   */
  type: contentTypeSchema,
  /**
   * Name of the content.
   */
  name: z.string(),
  /**
   * URL to PNG of poster.
   *
   * Accepted aspect ratios: 1:0.675 (IMDb poster type) or 1:1 (square).
   *
   * You can use any resolution, as long as the file size is below 100kb.
   * Below 50kb is recommended.
   *
   * Note: According to the Meta Preview Object documentation, this should be required for catalog responses,
   * but kept optional here for compatibility with Meta Object documentation.
   */
  poster: z.string().optional(),
  /**
   * Poster can be square (1:1 aspect) or poster (1:0.675) or landscape (1:1.77).
   *
   * Defaults to 'poster'.
   */
  posterShape: z.enum(["square", "poster", "landscape"]).optional(),
  /**
   * The background shown on the stremio detail page.
   *
   * Heavily encouraged if you want your content to look good.
   *
   * URL to PNG, max file size 500kb.
   */
  background: z.string().optional(),
  /**
   * The logo shown on the stremio detail page.
   *
   * Encouraged if you want your content to look good.
   *
   * URL to PNG.
   */
  logo: z.httpUrl().optional(),
  /**
   * A few sentences describing your content.
   */
  description: z.string().optional(),
  /**
   * Array containing objects in the form of { "source": "P6AaSMfXHbA", "type": "Trailer" }.
   *
   * Where source is a YouTube Video ID and type can be either "Trailer" or "Clip".
   * Used for the Discover Page Sidebar.
   *
   * @deprecated This will soon be deprecated in favor of `meta.trailers` being an array of Stream Objects.
   */
  trailers: z
    .array(
      z.object({
        source: z.string(),
        type: z.enum(["Trailer", "Clip"]),
      }),
    )
    .optional(),
  behaviorHints: z
    .object({
      /**
       * Set to a Video Object id in order to open the Detail page directly to that video's streams.
       *
       * Don't point this at a programme of a live channel: its playback identity is the channel itself.
       */
      defaultVideoId: z.string().optional(),
      /**
       * Marks the item as a live channel whose playback identity is the channel itself, independent of the programme currently airing.
       *
       * `type: "tv"` is treated as live even when this is omitted.
       */
      isLive: z.boolean().optional(),
      /**
       * Set to `true` when `videos` is a programme schedule ([Native EPG](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/epg.md)) rather than a list of episodes or uploads.
       */
      hasScheduledVideos: z.boolean().optional(),
    })
    .optional(),
});
export type MetaPreviewSchema = z.infer<typeof metaPreviewSchema>;

/**
 * Detailed description of a meta item.
 *
 * This description is displayed when the user selects an item from the catalog.
 */
export const metaDetailSchema = metaPreviewSchema.extend({
  /**
   * genre/categories of the content.
   *
   * e.g. ["Thriller", "Horror"]
   *
   * **WARNING: this will soon be deprecated, use 'links' instead**
   */
  genres: z.array(z.string()).optional(),
  releaseInfo: z.string().optional(),
  /**
   * Array of directors.
   *
   * Deprecated: use 'links' instead
   *
   * @deprecated
   */
  director: z.array(z.string()).optional(),
  /**
   * Array of members of the cast.
   *
   * use 'links' instead
   *
   * @deprecated
   */
  cast: z.array(z.string()).optional(),
  /**
   * IMDb rating, which should be a number from 0.0 to 10.0.
   */
  imdbRating: z.string().optional(),
  /**
   * ISO 8601, initial release date.
   *
   * For movies, this is the cinema debut.
   *
   * e.g. "2010-12-06T05:00:00.000Z"
   */
  released: z.string().optional(),
  /**
   * Can be used to link to internal pages of Stremio.
   *
   * example: array of actor / genre / director links.
   */
  links: z.array(metaLinkSchema).optional(),
  /**
   * Used for channel and series.
   *
   * If you do not provide this (e.g. for movie), Stremio assumes this meta item has one video, and it's ID is equal to the meta item id.
   */
  videos: z.array(metaVideoSchema).optional(),
  /**
   * Human-readable expected runtime.
   *
   * e.g. "120m"
   */
  runtime: z.string().optional(),
  /**
   * Spoken language.
   */
  language: z.string().optional(),
  /**
   * Official country of origin.
   */
  country: z.string().optional(),
  /**
   * Human-readable that describes all the significant awards.
   */
  awards: z.string().optional(),
  /**
   * URL to official website.
   */
  website: z.string().optional(),
});
export type MetaDetailSchema = z.infer<typeof metaDetailSchema>;

/**
 * Addon setting.
 */
export const manifestConfigSchema = z.object({
  /**
   * A key that will identify the user chosen value.
   */
  key: z.string(),
  /**
   * The type of data that the setting stores.
   */
  type: manifestConfigTypeSchema,
  /**
   * The default value. For `type: "boolean"` this can be set to "checked" to default to enabled.
   */
  default: z.string().optional(),
  /**
   * The title of the setting.
   */
  title: z.string().optional(),
  /**
   * List of (string) choices for `type: "select"`
   */
  options: z.array(z.string()).optional(),
  /**
   * If the value is required or not. Only applies to the following types: "string", "number". (default is `false`)
   */
  required: z.boolean().optional(),
});
export type ManifestConfigSchema = z.infer<typeof manifestConfigSchema>;

export const manifestExtraSchema = z.object({
  /**
   * The name of the property
   *
   * This name will be used in the extraProps argument itself.
   *
   * @example "search", "genre", "skip", "date"
   */
  name: z.string(),
  /**
   * Set to true if this property must always be passed.
   */
  isRequired: z.boolean().optional(),
  /**
   * Possible values for this property.
   * This is useful for things like genres, where you need the user to select from a pre-set list of options.
   *
   * e.g. { name: "genre", options: ["Action", "Comedy", "Drama"] }
   *
   * It's also useful if we want to specify a limited number of pages (for the skip parameter).
   *
   * e.g. { name: "skip", options: ["0", "100", "200"] }
   */
  options: z.array(z.string()).optional(),
  /**
   * The limit of values a user may select from the pre-set options list
   *
   * By default this is set to 1.
   */
  optionsLimit: z.number().optional(),
});
export type ManifestExtraSchema = z.infer<typeof manifestExtraSchema>;

export const manifestCatalogSchema = z.object({
  /**
   *  This is the content type of the catalog.
   */
  type: z.string(),
  /**
   * The id of the catalog, can be any unique string describing the catalog (unique per addon, as an addon can have many catalogs).
   *
   * For example: if the catalog name is "Favourite Youtube Videos", the id can be "fav_youtube_videos".
   */
  id: z.string(),
  /**
   * Human readable name of the catalog.
   */
  name: z.string(),
  /**
   * Use the 'options' property of 'extra' instead.
   * @deprecated
   */
  genres: z.array(z.string()).optional(),
  /**
   * All extra properties related to this catalog.
   */
  extra: z.array(manifestExtraSchema).optional(),
});
export type ManifestCatalogSchema = z.infer<typeof manifestCatalogSchema>;

export const fullManifestResourceSchema = z.object({
  /**
   * Resource name.
   */
  name: shortManifestResourceSchema,
  /**
   * Supported types.
   */
  types: z.array(z.string()),
  /**
   * Use this if you want your addon to be called only for specific content IDs
   *
   * For example, if you set this to ["yt_id:", "tt"], your addon will only be called for id values that start with 'yt_id:' or 'tt'.
   */
  idPrefixes: z.array(z.string()).optional(),
});
export type FullManifestResourceSchema = z.infer<
  typeof fullManifestResourceSchema
>;

/**
 * Used as a response for defineResourceHandler.
 */
export const addonCatalogSchema = z.object({
  /**
   * only http is currently officially supported.
   */
  transportName: z.string(),
  /**
   * The URL of the addon's manifest.json file.
   */
  transportUrl: z.string(),
  /**
   * Object representing the addon's Manifest Object.
   */
  manifest: z.lazy(() => manifestSchema),
});
export type AddonCatalogSchema = z.infer<typeof addonCatalogSchema>;

export const stremioAddonsConfigSchema = z.object({
  issuer: z.literal("https://stremio-addons.net"),
  signature: z.string(),
});
export type StremioAddonsConfigSchema = z.infer<
  typeof stremioAddonsConfigSchema
>;

/**
 * The addon description and capabilities.
 *
 * The first thing to define for your addon is the manifest, which describes it's name, purpose and some technical details.
 */
export const manifestSchema = z.object({
  /**
   * Identifier, dot-separated, e.g. "com.stremio.filmon"
   */
  id: z.string(),
  /**
   * Human readable name
   */
  name: z.string(),
  /**
   *  Human readable description
   */
  description: z.string(),
  /**
   * Semantic version of the addon
   */
  version: z.string(),
  /**
   * Supported resources, defined as an array of objects (long version) or strings (short version).
   *
   * Example #1: [{"name": "stream", "types": ["movie"], "idPrefixes": ["tt"]}]
   *
   * Example #2: ["catalog", "meta", "stream", "subtitles", "addon_catalog"]
   */
  resources: z.array(
    z.union([shortManifestResourceSchema, fullManifestResourceSchema]),
  ),
  /**
   * Supported types.
   */
  types: z.array(z.string()),
  /**
   * Use this if you want your addon to be called only for specific content IDs.
   *
   * For example, if you set this to ["yt_id:", "tt"], your addon will only be called for id values that start with 'yt_id:' or 'tt'.
   */
  idPrefixes: z.array(z.string()).optional(),
  /**
   * A list of the content catalogs your addon provides.
   *
   * Leave this an empty array ([]) if your addon does not provide the catalog resource.
   */
  catalogs: z.array(manifestCatalogSchema),
  /**
   * Array of Catalog objects, a list of other addon manifests.
   *
   * This can be used for an addon to act just as a catalog of other addons.
   */
  addonCatalogs: z.array(manifestCatalogSchema).optional(),
  /**
   * A list of settings that users can set for your addon.
   */
  config: z.array(manifestConfigSchema).optional(),
  /**
   * Background image for the addon.
   *
   * URL to png/jpg, at least 1024x786 resolution.
   */
  background: z.string().optional(),
  /**
   * @deprecated use `logo` instead.
   */
  icon: z.string().optional(),
  /**
   * Logo icon, URL to png, monochrome, 256x256.
   */
  logo: z.httpUrl().optional(),
  /**
   * Contact email for addon issues.
   * Used for the Report button in the app.
   * Also, the Stremio team may reach you on this email for anything relating your addon.
   */
  contactEmail: z.string().optional(),
  behaviorHints: z
    .object({
      /**
       * If the addon includes adult content.
       *
       * Defaults to false.
       */
      adult: z.boolean().optional(),
      /**
       * If the addon includes P2P content, such as BitTorrent, which may reveal the user's IP to other streaming parties.
       *
       * Used to provide an adequate warning to the user.
       */
      p2p: z.boolean().optional(),
      /**
       * Default is `false`. If the addon supports settings, it will add a button next to "Install" in Stremio that will point to the `/configure` path on the addon's domain. For more information, read [User Data](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md#user-data) (or if you are not using the Addon SDK, read: [Advanced User Data](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#using-user-data-in-addons) and [Creating Addon Configuration Pages](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#creating-addon-configuration-pages))
       */
      configurable: z.boolean().optional(),
      /**
       * Default is `false`. If set to `true`, the "Install" button will not show for your addon in Stremio. Instead a "Configure" button will show pointing to the `/configure` path on the addon's domain. For more information, read [User Data](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md#user-data) (or if you are not using the Addon SDK, read: [Advanced User Data](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#using-user-data-in-addons) and [Creating Addon Configuration Pages](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#creating-addon-configuration-pages))
       */
      configurationRequired: z.boolean().optional(),
      /**
       * Default is `false`. Set to `true` only if the addon returns a real live TV programme schedule, so Stremio shows the [Native EPG](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/epg.md) layout.
       *
       * Requires a `tv` catalog that declares the `date` extra, and `meta.videos` entries with `startTime` / `endTime`.
       * Leave it unset for live catalogs without a schedule.
       */
      epgProvider: z.boolean().optional(),
    })
    .optional(),
  stremioAddonsConfig: stremioAddonsConfigSchema.optional(),
}) satisfies StandardManifestSchema;

export type ManifestSchema = z.infer<typeof manifestSchema>;

export const streamResponseSchema = z
  .object({ streams: z.array(streamSchema) })
  .extend(cacheSchema.shape);
export type StreamResponseSchema = z.infer<typeof streamResponseSchema>;

export const metaResponseSchema = z
  .object({ meta: metaDetailSchema })
  .extend(cacheSchema.shape);
export type MetaResponseSchema = z.infer<typeof metaResponseSchema>;

export const catalogResponseSchema = z.union([
  z.object({ metas: z.array(metaPreviewSchema) }).extend(cacheSchema.shape),
  z
    .object({ metasDetailed: z.array(metaDetailSchema) })
    .extend(cacheSchema.shape),
]);
export type CatalogResponseSchema = z.infer<typeof catalogResponseSchema>;

export const subtitlesResponseSchema = z
  .object({ subtitles: z.array(subtitleSchema) })
  .extend(cacheSchema.shape);
export type SubtitlesResponseSchema = z.infer<typeof subtitlesResponseSchema>;

export const addonCatalogResponseSchema = z
  .object({ addons: z.array(addonCatalogSchema) })
  .extend(cacheSchema.shape);
export type AddonCatalogResponseSchema = z.infer<
  typeof addonCatalogResponseSchema
>;

/**
 * Stremio ignores the body of a `player` or `library` event response, so any object passes.
 */
export const eventResponseSchema = z.record(z.string(), z.unknown());
export type EventResponseSchema = z.infer<typeof eventResponseSchema>;
