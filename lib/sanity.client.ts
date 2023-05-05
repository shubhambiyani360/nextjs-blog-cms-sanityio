import {
  apiVersion,
  dataset,
  projectId,
  studioBasePath,
  useCdn,
} from 'lib/sanity.api'
import {
  indexQuery,
  type Post,
  postAndMoreStoriesQuery,
  postBySlugQuery,
  postSlugsQuery,
  type Settings,
  settingsQuery,
} from 'lib/sanity.queries'
import { ClientConfig, createClient } from 'next-sanity'

const config: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn,
  studioUrl: studioBasePath,
  // @TODO stop encoding source maps in development after finishing the migration
  encodeSourceMap: process.env.NEXT_PUBLIC_SANITY_ENV !== 'production',
}

/**
 * Checks if it's safe to create a client instance, as `@sanity/client` will throw an error if `projectId` is false
 */
const sanityClient = projectId ? createClient(config) : null
const getClient = (token: string | null) =>
  token
    ? sanityClient.withConfig({
        token,
        scope: 'previewDrafts',
        apiVersion: 'X',
      })
    : sanityClient

export async function getSettings(token: string | null): Promise<Settings> {
  if (sanityClient) {
    const client = getClient(token)
    return (await client.fetch(settingsQuery)) || {}
  }
  return {}
}

export async function getAllPosts(token: string | null): Promise<Post[]> {
  if (sanityClient) {
    const client = getClient(token)
    return (await client.fetch(indexQuery)) || []
  }
  return []
}

export async function getAllPostsSlugs(
  token: string | null
): Promise<Pick<Post, 'slug'>[]> {
  if (sanityClient) {
    const client = getClient(token)
    const slugs = (await client.fetch<string[]>(postSlugsQuery)) || []
    return slugs.map((slug) => ({ slug }))
  }
  return []
}

export async function getPostBySlug(
  slug: string,
  token: string | null
): Promise<Post> {
  if (sanityClient) {
    const client = getClient(token)
    return (await client.fetch(postBySlugQuery, { slug })) || ({} as any)
  }
  return {} as any
}

export async function getPostAndMoreStories(
  slug: string,
  token: string | null
): Promise<{ post: Post; morePosts: Post[] }> {
  if (sanityClient && token) {
    const client = getClient(token)
    return await client.fetch(postAndMoreStoriesQuery, { slug })
  }
  return { post: null, morePosts: [] }
}
