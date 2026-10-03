import { defineCollection } from 'astro:content';
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
  - Local images use Astro's `image()` helper so they are validated and optimised.
    Videos are plain strings (a /public path or a URL) because they are large and
    may be hosted elsewhere; only their poster is a validated image.
*/

// --- shared building blocks ---------------------------------------------------

const seo = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

const reading = ['reading', 'finished', 'unfinished'] as const;
const playing = ['playing', 'finished', 'unfinished'] as const;

// --- projects ---------------------------------------------------------------

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) => {
    const media = z.object({
      src: image(),
      alt: z.string(), // empty string is allowed for purely decorative images
    });

    const video = z.object({
      sources: z.array(z.string()).min(1), // e.g. mp4 + webm, as /public paths or URLs
      poster: image().optional(),
    });

    const testimonial = z
      .object({
        quote: z.string().optional(),
        author: z.string(),
        role: z.string().optional(),
        organization: z.string().optional(),
        relationship: z.string().optional(), // e.g. "Client", "Project Lead"
        image: image().optional(),
        video: video.optional(),
        // Preserved for every testimonial; whether it is shown is decided separately.
        display: z.boolean().default(false),
      })
      .refine((t) => t.quote || t.video, {
        message: 'A testimonial needs a quote, a video, or both.',
      });

    return z.object({
      // Identity
      title: z.string(), // the name the project is listed under
      client: z.string().optional(),
      headline: z.string().optional(),

      // Visibility is always an explicit decision: there is no default.
      //   published = shown, hidden = kept but not shown, draft = work in progress
      status: z.enum(['published', 'hidden', 'draft']),

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

      // Media and social proof
      images: z.array(media).default([]),
      video: video.optional(),
      testimonials: z.array(testimonial).default([]),

      // Presentation
      featured: z.boolean().default(false),
      order: z.number().optional(),
      seo: seo.optional(),
    });
  },
});

// --- books --------------------------------------------------------------------

const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: z.string().optional(),
      cover: image().optional(),
      status: z.enum(reading),
      order: z.number().optional(), // preserves a hand-set sequence where one matters
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
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      cover: image().optional(),
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

export const collections = { projects, books, games, notes, writing };
