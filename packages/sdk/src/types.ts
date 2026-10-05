import type { StandardSchemaV1 } from "@standard-schema/spec";

export type ShortManifestResource =
  | "catalog"
  | "meta"
  | "stream"
  | "subtitles"
  | "addon_catalog"
  | "player"
  | "library";
export type Extra = "search" | "genre" | "skip" | "date";
export type ContentType = "movie" | "series" | "channel" | "tv";

export type DefaultConfig = Record<string, any> | undefined;
export type DefaultHandlerExtra = Record<string, any>;

/**
 * Extra properties for catalog handlers
 */
export type CatalogHandlerExtra = {
  /**
   * String to search for in the catalog
   */
  search?: string;

  /**
   * A string to filter the feed or search results by genres
   */
  genre?: string;

  /**
   * Used for catalog pagination, refers to the number of items skipped from the beginning of the catalog.
   * The standard page size in Stremio is 100, so the `skip` value will be a multiple of 100.
   * If you return less than 100 items, Stremio will consider this to be the end of the catalog.
   */
  skip?: number;

  /**
   * UTC calendar day (`YYYY-MM-DD`) of the [Native EPG](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/epg.md) guide page to load.
   * Only sent for catalogs that declare the `date` extra, and only when Stremio loads the guide grid; channel-list requests omit it.
   * Answer guide requests with `metasDetailed` instead of `metas`.
   * Guide pagination ends on an empty `metasDetailed`, not on a short page.
   */
  date?: string;
};

/**
 * Extra properties for subtitles handlers
 */
export type SubtitlesHandlerExtra = {
  /**
   * [OpenSubtitles file hash](http://trac.opensubtitles.org/projects/opensubtitles/wiki/HashSourceCodes) for the video
   */
  videoHash?: string;

  /**
   * Size of the video file in bytes
   */
  videoSize?: number;

  /**
   * Filename of the video file
   */
  filename?: string;
};

/**
 * Extra properties for player event handlers.
 *
 * Stremio (core 0.64+) sends these events to every installed addon whose `player` resource
 * matches the video's type and id prefix, and ignores the response body.
 */
export type PlayerHandlerExtra = {
  /**
   * `start` when playback begins or resumes, `pause` when it pauses, `stop` when the player
   * closes or the video ends. A seek re-sends the current state with the new time.
   */
  action: "start" | "pause" | "stop";
  /**
   * Playback position in milliseconds, as the decimal string from the URL.
   */
  currentTime: string;
  /**
   * Video duration in milliseconds, as the decimal string from the URL. `0` when not known yet.
   */
  duration: string;
};

/**
 * Extra properties for library event handlers.
 *
 * Stremio (core 0.64+) sends these events to every installed addon whose `library` resource
 * matches the item's type and id prefix, and ignores the response body.
 */
export type LibraryHandlerExtra = {
  /**
   * `libraryAdd` and `libraryRemove` when the item enters or leaves the library,
   * `watched` and `unwatched` when the item or some of its videos are marked.
   */
  action: "libraryAdd" | "libraryRemove" | "watched" | "unwatched";
  /**
   * For `watched` and `unwatched` on specific videos: their ids, comma-separated, at most 100
   * per event. Absent when the whole item was marked.
   */
  videoId?: string;
};

/**
 * Maps handler types to their specific Extra types
 */
export type HandlerExtraMap = {
  catalog: CatalogHandlerExtra;
  subtitles: SubtitlesHandlerExtra;
  meta: DefaultHandlerExtra;
  stream: DefaultHandlerExtra;
  addon_catalog: DefaultHandlerExtra;
  player: PlayerHandlerExtra;
  library: LibraryHandlerExtra;
};

/**
 * Conditional type that returns the appropriate Extra type based on the handler type
 */
export type GetHandlerExtra<T extends ShortManifestResource> =
  T extends keyof HandlerExtraMap ? HandlerExtraMap[T] : DefaultHandlerExtra;

/**
 * Generic handler arguments with conditional `Extra` typing
 */
export interface HandlerArgs<
  TResource extends ShortManifestResource = ShortManifestResource,
  TConfig = DefaultConfig,
  TExtra = GetHandlerExtra<TResource>,
> {
  type: ContentType;
  id: string;
  extra: TExtra;
  config: TConfig;
}

// Specific type aliases for each handler type
export type CatalogHandlerArgs<Config = DefaultConfig> = HandlerArgs<
  "catalog",
  Config,
  CatalogHandlerExtra
>;
export type MetaHandlerArgs<Config = DefaultConfig> = HandlerArgs<
  "meta",
  Config,
  DefaultHandlerExtra
>;
export type StreamHandlerArgs<Config = DefaultConfig> = HandlerArgs<
  "stream",
  Config,
  DefaultHandlerExtra
>;
export type SubtitlesHandlerArgs<Config = DefaultConfig> = HandlerArgs<
  "subtitles",
  Config,
  SubtitlesHandlerExtra
>;
export type AddonCatalogHandlerArgs<Config = DefaultConfig> = HandlerArgs<
  "addon_catalog",
  Config,
  DefaultHandlerExtra
>;
export type PlayerHandlerArgs<Config = DefaultConfig> = HandlerArgs<
  "player",
  Config,
  PlayerHandlerExtra
>;
export type LibraryHandlerArgs<Config = DefaultConfig> = HandlerArgs<
  "library",
  Config,
  LibraryHandlerExtra
>;

/**
 * A resolving object can also include the following cache related properties
 */
export interface Cache {
  /**
   * (in seconds) sets the Cache-Control header to max-age=$cacheMaxAge
   * and overwrites the global cache time set in serveHTTP options.
   */
  cacheMaxAge?: number;
  /**
   * (in seconds) sets the Cache-Control header to stale-while-revalidate=$staleRevalidate.
   */
  staleRevalidate?: number;
  /**
   * (in seconds) sets the Cache-Control header to stale-if-error=$staleError.
   */
  staleError?: number;
}

export type WithCache<T> = T & Cache;

/**
 * Summarized collection of meta items.
 *
 * Catalogs are displayed on the Stremio's Board, Discover and Search.
 */
export interface MetaPreview {
  /**
   * Universal identifier.
   * You may use a prefix unique to your addon.
   *
   * Example: 'yt_id:UCrDkAvwZum-UTjHmzDI2iIw'
   */
  id: string;
  /**
   * Type of the content.
   */
  type: ContentType;
  /**
   * Name of the content.
   */
  name: string;
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
  poster?: string;
  /**
   * Poster can be square (1:1 aspect) or poster (1:0.675) or landscape (1:1.77).
   *
   * Defaults to 'poster'.
   */
  posterShape?: "square" | "poster" | "landscape";
  /**
   * The background shown on the stremio detail page.
   *
   * Heavily encouraged if you want your content to look good.
   *
   * URL to PNG, max file size 500kb.
   */
  background?: string;
  /**
   * The logo shown on the stremio detail page.
   *
   * Encouraged if you want your content to look good.
   *
   * URL to PNG.
   */
  logo?: string;
  /**
   * A few sentences describing your content.
   */
  description?: string;
  /**
   * Array containing objects in the form of { "source": "P6AaSMfXHbA", "type": "Trailer" }.
   *
   * Where source is a YouTube Video ID and type can be either "Trailer" or "Clip".
   * Used for the Discover Page Sidebar.
   *
   * @deprecated This will soon be deprecated in favor of `meta.trailers` being an array of Stream Objects.
   */
  trailers?: Array<{ source: string; type: "Trailer" | "Clip" }>;
  behaviorHints?:
    | {
        /**
         * Set to a Video Object id in order to open the Detail page directly to that video's streams.
         *
         * Don't point this at a programme of a live channel: its playback identity is the channel itself.
         */
        defaultVideoId?: string;
        /**
         * Marks the item as a live channel whose playback identity is the channel itself, independent of the programme currently airing.
         *
         * `type: "tv"` is treated as live even when this is omitted.
         */
        isLive?: boolean;
        /**
         * Set to `true` when `videos` is a programme schedule ([Native EPG](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/epg.md)) rather than a list of episodes or uploads.
         */
        hasScheduledVideos?: boolean;
      }
    | undefined;
}

/**
 * Detailed description of a meta item.
 *
 * This description is displayed when the user selects an item from the catalog.
 */
export interface MetaDetail extends MetaPreview {
  /**
   * genre/categories of the content.
   *
   * e.g. ["Thriller", "Horror"]
   *
   * **WARNING: this will soon be deprecated, use 'links' instead**
   */
  genres?: string[];
  releaseInfo?: string;
  /**
   * Array of directors.
   *
   * Deprecated: use 'links' instead
   *
   * @deprecated
   */
  director?: string[];
  /**
   * Array of members of the cast.
   *
   * use 'links' instead
   *
   * @deprecated
   */
  cast?: string[];
  /**
   * IMDb rating, which should be a number from 0.0 to 10.0.
   */
  imdbRating?: string;
  /**
   * ISO 8601, initial release date.
   *
   * For movies, this is the cinema debut.
   *
   * e.g. "2010-12-06T05:00:00.000Z"
   */
  released?: string;
  /**
   * Array containing objects in the form of { "source": "P6AaSMfXHbA", "type": "Trailer" }.
   *
   * Where source is a YouTube Video ID and type can be either "Trailer" or "Clip".
   *
   * @deprecated This will soon be deprecated in favor of meta.trailers being an array of Stream Objects.
   */
  trailers?: Array<{ source: string; type: "Trailer" | "Clip" }>;
  /**
   * Can be used to link to internal pages of Stremio.
   *
   * example: array of actor / genre / director links.
   */
  links?: MetaLink[];
  /**
   * Used for channel and series.
   *
   * If you do not provide this (e.g. for movie), Stremio assumes this meta item has one video, and it's ID is equal to the meta item id.
   */
  videos?: MetaVideo[];
  /**
   * Human-readable expected runtime.
   *
   * e.g. "120m"
   */
  runtime?: string;
  /**
   * Spoken language.
   */
  language?: string;
  /**
   * Official country of origin.
   */
  country?: string;
  /**
   * Human-readable that describes all the significant awards.
   */
  awards?: string;
  /**
   * URL to official website.
   */
  website?: string;
}

export interface MetaLink {
  /**
   * Human readable name for the link.
   */
  name: string;
  /**
   * Any unique category name, links are grouped based on their category.
   *
   * Some recommended categories are: actor, director, writer,
   * while the following categories are reserved and should not be used: imdb, share, similar.
   */
  category: string;
  /**
   * An external URL or Meta Link.
   */
  url: string;
}

export interface MetaVideo {
  /**
   * ID of the video.
   */
  id: string;
  /**
   * Title of the video.
   */
  title: string;
  /**
   * ISO 8601, publish date of the video.
   *
   * for episodes, this should be the initial air date.
   *
   * e.g. "2010-12-06T05:00:00.000Z"
   */
  released: string;
  /**
   * URL to png of the video thumbnail, in the video's aspect ratio.
   *
   * max file size 5kb.
   */
  thumbnail?: string;
  /**
   * In case you can return links to streams while forming meta response,
   * you can pass and array of Stream Objects to point the video to a HTTP URL, BitTorrent,
   * YouTube or any other stremio-supported transport protocol.
   *
   * Note that this is exclusive: passing video.streams means that Stremio will not request any streams
   * from other addons for that video.
   * If you return streams that way, it is still recommended to implement the streams resource.
   */
  streams?: Stream[];
  /**
   * Set to true to explicitly state that this video is available for streaming, from your addon.
   *
   * No need to use this if you've passed stream.
   */
  available?: boolean;
  /**
   * Episode number, if applicable.
   */
  episode?: number;
  /**
   * Season number, if applicable.
   */
  season?: number;
  /**
   * YouTube ID of the trailer video; use if this is an episode for a series.
   */
  trailer?: string;
  /**
   * Array containing Stream Objects for trailers.
   */
  trailers?: Stream[];
  /**
   * Video overview/summary
   */
  overview?: string;
  /**
   * ISO 8601 start of a live TV programme.
   *
   * Together with `endTime`, marks the video as a scheduled broadcast shown in the [Native EPG](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/epg.md).
   */
  startTime?: string;
  /**
   * ISO 8601 end of a live TV programme, strictly later than `startTime`.
   */
  endTime?: string;
  /**
   * Human-readable duration.
   *
   * e.g. "45 min"
   */
  runtime?: string;
  /**
   * Original air year.
   *
   * e.g. "2026"
   */
  releaseInfo?: string;
  /**
   * Categories.
   *
   * e.g. ["News", "Sport"]
   */
  genres?: string[];
  /**
   * Names of the cast.
   */
  cast?: string[];
  /**
   * Names of the directors.
   */
  directors?: string[];
  links?: MetaLink[];
  /**
   * Content ratings.
   */
  ratings?: ContentRating[];
}

export interface ContentRating {
  /**
   * e.g. "PG"
   */
  value: string;
  /**
   * Rating system the value belongs to.
   *
   * e.g. "TVPG"
   */
  system?: string;
  /**
   * URL to an icon for the rating.
   */
  icon?: string;
}

/**
 * Tells Stremio how to obtain the media content.
 *
 * It may be torrent info hash, HTTP URL, etc.
 */
export interface Stream {
  /**
   * Direct http(s)/ftp(s)/rtmp link to a video stream.
   * Protocol support can vary depending on client app capabilities.
   */
  url?: string;
  /**
   * Youtube video ID, plays using the built-in YouTube player.
   */
  ytId?: string;
  /**
   * Info hash of a torrent file, and fileIdx is the index of the video file within the torrent.
   *
   * If fileIdx is not specified, the largest file in the torrent will be selected.
   */
  infoHash?: string;
  /**
   * A string representing a regex (example: `/.mkv$|.mp4$|.avi$|.ts$/i`) to match the video file within the nzb (from nzbUrl), rar (from rarUrls, zip (from zipUrls), 7zip (from 7zipUrls), tgz (from tgzUrls), tar (from tarUrls)); (not supported for torrents yet).
   */
  fileMustInclude?: string;
  /**
   * Http(s) or ftp(s) link to a NZB (usenet) file.
   * This source will also unpack any known archive files.
   */
  nzbUrl?: string;
  /**
   * List of strings that each represent a connection to a NNTP (usenet) server (for nzbUrl) in the form of `nntp(s)://{user}:{pass}@{nntpDomain}:{nntpPort}/{nntpConnections}` (nntps = SSL; nntp = no encryption)
   * @example `nntps://myuser:mypass@news.example.com:563/4`
   */
  servers?: string[];
  /**
   * Stream sources that lead to rar files (multi-volume supported).
   * Limitation: multi-volume and seeking in the video supported, decompression is not supported (decompression is not normally required for audio / video files).
   */
  rarUrls?: StreamSource[];
  /**
   * Stream sources that lead to zip files (multi-volume supported).
   * Limitation: multi-volume and decompression are supported, it does not support seeking in the video.
   */
  zipUrls?: StreamSource[];
  /**
   * Stream sources that lead to 7z files (multi-volume supported).
   * Limitation: multi-volume and LZMA decompression are support, it supports seeking only when compression is not used (decompression is not normally required for audio / video files)
   */
  "7zipUrls"?: StreamSource[];
  /**
   * Stream sources that lead to tgz files (multi-volume supported).
   * Limitation: multi-volume and decompression are supported, it does not support seeking in the video.
   */
  tgzUrls?: StreamSource[];
  /**
   * Stream sources that lead to tar files (TAR does not support multi-volume).
   * Limitation: does not support multi-volume and decompression by design (tar only merges multiple files into one without compressing), seeking is supported.
   */
  tarUrls?: StreamSource[];
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
  fileIdx?: number;
  /**
   * Meta Link or an external URL to the video, which should be opened in a browser (webpage).
   *
   * e.g. a link to Netflix.
   */
  externalUrl?: string;
  /**
   * Title of the stream
   *
   * Usually used for stream quality.
   *
   * @deprecated use `description` instead.
   */
  title?: string;
  /**
   * Description of the stream (previously `title`)
   */
  description?: string;
  /**
   * Name of the stream
   *
   * Usually used for stream quality.
   */
  name?: string;
  /**
   * Array of Subtitle objects representing subtitles for this stream.
   */
  subtitles?: Subtitle[];
  /**
   * Array of strings representing torrent tracker URLs and DHT network nodes.
   *
   * This attribute can be used to provide additional peer discovery options when `infoHash` is also specified.
   * Each element can be a tracker URL (tracker:<protocol>://<host>:<port>) where <protocol> can be either http or udp.
   * A DHT node (dht:<node_id/info_hash>) can also be included.
   *
   * WARNING: Use of DHT may be prohibited by some private trackers as it exposes torrent activity to a broader network.
   */
  sources?: string[];
  behaviorHints?:
    | {
        /**
         * Hints it's restricted to particular countries.
         *
         * Array of ISO 3166-1 alpha-3 country codes in lowercase in which the stream is accessible.
         */
        countryWhitelist?: string[];
        /**
         * Applies if the protocol of the url is http(s).
         *
         * Needs to be set to true if the URL does not support https or is not an MP4 file.
         */
        notWebReady?: boolean;
        /**
         * If defined, addons with the same behaviorHints.bingeGroup will be chosen automatically for binge watching.
         *
         * This should be something that identifies the stream's nature within your addon.
         * For example, if your addon is called "gobsAddon", and the stream is 720p, the bingeGroup should be "gobsAddon-720p".
         * If the next episode has a stream with the same bingeGroup, stremio should select that stream implicitly.
         */
        bingeGroup?: string;
        /**
         * @deprecated use `bingeGroup` instead.
         */
        group?: string;
        /**
         * Only applies to urls. When using this property, you must also set stream.behaviorHints.notWebReady: true.
         *
         * This is an object containing request and response headers that should be used for the stream.
         * Example: { "request": { "User-Agent": "Stremio" } }
         */
        proxyHeaders?:
          | {
              request?: Record<string, string>;
              response?: Record<string, string>;
            }
          | undefined;
        /**
         * The calculated OpenSubtitles hash of the video.
         *
         * This will be used when the streaming server is not connected (so the hash cannot be calculated locally).
         * This value is passed to subtitle addons to identify correct subtitles.
         */
        videoHash?: string;
        /**
         * Size of the video file in bytes.
         *
         * This value is passed to the subtitle addons to identify correct subtitles.
         */
        videoSize?: number;
        /**
         * Filename of the video file.
         *
         * Although optional, it is highly recommended to set it when using stream.url (when possible)
         * in order to identify correct subtitles. This value is passed to the subtitle addons to identify correct subtitles.
         */
        filename?: string;
      }
    | undefined;
}

/**
 * An object representing a streaming source.
 */
export interface StreamSource {
  /**
   * Direct http(s)/ftp(s) link to a file.
   * Depending on context: zip, rar, 7z, tar, tgz.
   */
  url: string;

  /**
   * Size of the file in bytes.
   * While optional, adding this can speed up the initial buffering.
   */
  bytes?: number;
}

/**
 * Subtitles resource for the chosen media.
 */
export interface Subtitle {
  /**
   * Unique identifier for each subtitle, if you have more than one subtitle with the same language, the id will differentiate them.
   */
  id: string;
  /**
   * Url to the subtitle file.
   * ASS/SSA subtitles are supported: serve the original file with a `.ass` or `.ssa` extension, or make sure it starts with the standard ASS sections (e.g. `[Script Info]`).
   * Do not wrap ASS files in the `http://127.0.0.1:11470/subtitles.vtt?from=` URL, as converting them to VTT drops the styling.
   */
  url: string;
  /**
   * Language code for the subtitle, if a valid ISO 639-2 code is not sent, the text of this value will be used instead.
   */
  lang: string;
  /**
   * Label shown in the subtitle picker instead of the language name, useful when providing multiple subtitles for the same language.
   * If omitted, the language name derived from `lang` is displayed.
   * @example "English [CC]", "eng #1 [opensubtitles] 1080p.BluRay"
   */
  label?: string;
}

/**
 * The addon description and capabilities.
 *
 * The first thing to define for your addon is the manifest, which describes it's name, purpose and some technical details.
 */
export interface Manifest {
  /**
   * Identifier, dot-separated, e.g. "com.stremio.filmon"
   */
  id: string;
  /**
   * Human readable name
   */
  name: string;
  /**
   *  Human readable description
   */
  description: string;
  /**
   * Semantic version of the addon
   */
  version: string;
  /**
   * Supported resources, defined as an array of objects (long version) or strings (short version).
   *
   * Example #1: [{"name": "stream", "types": ["movie"], "idPrefixes": ["tt"]}]
   *
   * Example #2: ["catalog", "meta", "stream", "subtitles", "addon_catalog"]
   */
  resources: Array<ShortManifestResource | FullManifestResource>;
  /**
   * Supported types.
   */
  types: string[];
  /**
   * Use this if you want your addon to be called only for specific content IDs.
   *
   * For example, if you set this to ["yt_id:", "tt"], your addon will only be called for id values that start with 'yt_id:' or 'tt'.
   */
  idPrefixes?: string[];
  /**
   * A list of the content catalogs your addon provides.
   *
   * Leave this an empty array ([]) if your addon does not provide the catalog resource.
   */
  catalogs: ManifestCatalog[];
  /**
   * Array of Catalog objects, a list of other addon manifests.
   *
   * This can be used for an addon to act just as a catalog of other addons.
   */
  addonCatalogs?: ManifestCatalog[];

  /**
   * A list of settings that users can set for your addon.
   */
  config?: ManifestConfig[];

  /**
   * Background image for the addon.
   *
   * URL to png/jpg, at least 1024x786 resolution.
   */
  background?: string;

  /**
   * @deprecated use `logo` instead.
   */
  icon?: string;

  /**
   * Logo icon, URL to png, monochrome, 256x256.
   */
  logo?: string;
  /**
   * Contact email for addon issues.
   * Used for the Report button in the app.
   * Also, the Stremio team may reach you on this email for anything relating your addon.
   */
  contactEmail?: string;
  behaviorHints?:
    | {
        /**
         * If the addon includes adult content.
         *
         * Defaults to false.
         */
        adult?: boolean;
        /**
         * If the addon includes P2P content, such as BitTorrent, which may reveal the user's IP to other streaming parties.
         *
         * Used to provide an adequate warning to the user.
         */
        p2p?: boolean;

        /**
         * Default is `false`. If the addon supports settings, it will add a button next to "Install" in Stremio that will point to the `/configure` path on the addon's domain. For more information, read [User Data](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md#user-data) (or if you are not using the Addon SDK, read: [Advanced User Data](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#using-user-data-in-addons) and [Creating Addon Configuration Pages](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#creating-addon-configuration-pages))
         */
        configurable?: boolean;

        /**
         * Default is `false`. If set to `true`, the "Install" button will not show for your addon in Stremio. Instead a "Configure" button will show pointing to the `/configure` path on the addon's domain. For more information, read [User Data](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md#user-data) (or if you are not using the Addon SDK, read: [Advanced User Data](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#using-user-data-in-addons) and [Creating Addon Configuration Pages](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#creating-addon-configuration-pages))
         */
        configurationRequired?: boolean;

        /**
         * Default is `false`. Set to `true` only if the addon returns a real live TV programme schedule, so Stremio shows the [Native EPG](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/epg.md) layout.
         *
         * Requires a `tv` catalog that declares the `date` extra, and `meta.videos` entries with `startTime` / `endTime`.
         * Leave it unset for live catalogs without a schedule.
         */
        epgProvider?: boolean;
      }
    | undefined;

  stremioAddonsConfig?: StremioAddonsConfig;
}

export type ManifestConfigType =
  | "text"
  | "number"
  | "password"
  | "checkbox"
  | "select";

/**
 * Addon setting.
 */
export interface ManifestConfig {
  /**
   * A key that will identify the user chosen value.
   */
  key: string;

  /**
   * The type of data that the setting stores.
   */
  type: ManifestConfigType;

  /**
   * The default value. For `type: "boolean"` this can be set to "checked" to default to enabled.
   */
  default?: string;

  /**
   * The title of the setting.
   */
  title?: string;

  /**
   * List of (string) choices for `type: "select"`
   */
  options?: string[];

  /**
   * If the value is required or not. Only applies to the following types: "string", "number". (default is `false`)
   */
  required?: boolean;
}

/**
 * Used as a response for defineResourceHandler.
 */
export interface AddonCatalog {
  /**
   * only http is currently officially supported.
   */
  transportName: string;
  /**
   * The URL of the addon's manifest.json file.
   */
  transportUrl: string;
  /**
   * Object representing the addon's Manifest Object.
   */
  manifest: Manifest;
}

export interface FullManifestResource {
  /**
   * Resource name.
   */
  name: ShortManifestResource;
  /**
   * Supported types.
   */
  types: string[];
  /**
   * Use this if you want your addon to be called only for specific content IDs
   *
   * For example, if you set this to ["yt_id:", "tt"], your addon will only be called for id values that start with 'yt_id:' or 'tt'.
   */
  idPrefixes?: string[];
}

export interface ManifestCatalog {
  /**
   *  This is the content type of the catalog.
   */
  type: string;
  /**
   * The id of the catalog, can be any unique string describing the catalog (unique per addon, as an addon can have many catalogs).
   *
   * For example: if the catalog name is "Favourite Youtube Videos", the id can be "fav_youtube_videos".
   */
  id: string;
  /**
   * Human readable name of the catalog.
   */
  name: string;
  /**
   * Use the 'options' property of 'extra' instead.
   * @deprecated
   */
  genres?: string[];
  /**
   * All extra properties related to this catalog.
   */
  extra?: ManifestExtra[];
}

export interface ManifestExtra {
  /**
   * The name of the property
   *
   * This name will be used in the extraProps argument itself.
   *
   * @example "search", "genre", "skip", "date"
   */
  name: string;
  /**
   * Set to true if this property must always be passed.
   */
  isRequired?: boolean;
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
  options?: string[];
  /**
   * The limit of values a user may select from the pre-set options list
   *
   * By default this is set to 1.
   */
  optionsLimit?: number;
}

export interface StremioAddonsConfig {
  issuer: "https://stremio-addons.net";
  signature: string;
}

/**
 * The addonInterface, as returned from builder.getInterface()
 */
export interface AddonInterface {
  manifest: Manifest;
  get: (
    resource: ShortManifestResource,
    type: ContentType,
    id: string,
    extra?: Record<string, any>,
    config?: Record<string, any>,
  ) => Promise<any>;
}

export type ManifestSchema = StandardSchemaV1<Manifest>;
