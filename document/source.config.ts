import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.vercel.app/docs/mdx/collections#define-docs
export const docs = defineDocs({
  docs: {
    schema: frontmatterSchema.extend({
      title: z.string().default('Untitled')
    })
  },
  meta: {
    schema: metaSchema
  }
});

export default defineConfig({
  lastModifiedTime: 'git',
  mdxOptions: {
    // MDX options
  }
});