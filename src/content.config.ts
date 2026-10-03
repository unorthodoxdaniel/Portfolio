import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/*
  Content collections for danielabudu.com.

  Conventions
  - One Markdown file per entry. The file name is the slug (a `slug:` key in
    frontmatter overrides it). The Markdown body is the long-form text:
    a project's description, a book's notes, an essay.
  - Anything the legacy site does not always have is optional. Required fields
    are only the ones an entry cannot meaningfully exist without.

  Media (temporary representation)
  - Media has NOT been migrated yet. Every media field is a plain string that
    records where the file lives today: a repo-relative path such as
    `images/Kachie.webp`, or the exact URL the legacy HTML references.
    When media is migrated deliberately, these become `image()` fields / /public paths.
  - `legacy` objects hold information carried over from the Webflow export that is
    not yet resolved into the real fields (unresolved variants, provenance notes).
    They are temporary and should be emptied as decisions are made.
*/

// --- shared building blocks ---------------------------------------------------

const seo = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

// A video exactly as the legacy site referenced it.
const video = z.object({
  sources: z.array(z.string()).min(1), // URLs as written in the legacy HTML (mp4, webm, …)
  poster: z.string().optional(), // poster URL as written in the legacy HTML
  localFiles: z.array(z.string()).optional(), // copies that exist in this repo, if any
  caption: z.string().optional(),
});

// Visibility is always an explicit decision: there is no default.
//   published = shown, hidden = kept but not shown, draft = work in progress
const status = z.enum(['published', 'hidden', 'draft']);

const reading = ['reading', 'finished', 'unfinished'] as const;
const playing = ['playing', 'finished', 'unfinished'] as const;

// --- projects ---------------------------------------------------------------

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    // Identity
    title: z.string(), // the name the project is listed under
    client: z.string().optional(),
    headline: z.string().optional(),
    status,

    // What the work was
    engagement: z.enum(['client', 'contract', 'personal']).optional(),
    services: z.array(z.string()).default([]),
    collaborators: z
      .array(z.object({ name: z.string(), role: z.string().optional() }))
      .default([]),
    intermediary: z.object({ name: z.string(), url: z.url().optional() }).optional(),

    // Where it lives, and when (only where known)
    url: z.url().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),

    // Results: any number of stats, including none
    stats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),

    // Media (see note above). Testimonials live in their own collection.
    images: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
    video: video.optional(),

    // Presentation
    featured: z.boolean().default(false),
    order: z.number().optional(),
    seo: seo.optional(),

    // Temporary: unresolved or provenance information from the Webflow export.
    legacy: z
      .object({
        sources: z.array(z.string()).default([]), // legacy pages the block appears on
        variants: z
          .array(
            z.object({
              label: z.string(),
              title: z.string().optional(),
              tags: z.array(z.string()).optional(), // legacy tag pills, verbatim
              url: z.string().optional(),
            }),
          )
          .default([]),
        notes: z.array(z.string()).default([]),
      })
      .optional(),
  }),
});

// --- testimonials ---------------------------------------------------------------

// Independent of projects; may optionally point at one by slug.
const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z
    .object({
      author: z.string(),
      role: z.string().optional(),
      organization: z.string().optional(),
      relationship: z.string().optional(), // how the author relates to the work/context
      quote: z.string().optional(),
      image: z.string().optional(), // author photo (see media note above)
      video: video.optional(),
      project: reference('projects').optional(),
      status,
      legacy: z.object({ notes: z.array(z.string()).default([]) }).optional(),
    })
    .refine((t) => t.quote || t.video, {
      message: 'A testimonial needs a quote, a video, or both.',
    }),
});

// --- books --------------------------------------------------------------------

const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: z.object({
    // Optional only because one legacy cover carries no title anywhere in the export.
    title: z.string().optional(),
    author: z.string().optional(),
    cover: z.string().optional(), // see media note above
    status: z.enum(reading),
    order: z.number().optional(), // position in the legacy page order
    rating: z.number().int().min(1).max(5).optional(),
    startedDate: z.coerce.date().optional(),
    finishedDate: z.coerce.date().optional(),
    // Notes go in the Markdown body; an individual page can be added later
    // without changing this schema.
  }),
});

// --- games --------------------------------------------------------------------

const games = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/games' }),
  schema: z.object({
    title: z.string(),
    cover: z.string().optional(),
    status: z.enum(playing),
    order: z.number().optional(),
    rating: z.number().int().min(1).max(5).optional(),
    startedDate: z.coerce.date().optional(),
    finishedDate: z.coerce.date().optional(),
  }),
});

// --- notes and writing (intentionally simple) -----------------------------------

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, testimonials, books, games, notes, writing };
