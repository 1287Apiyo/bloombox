'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createBlogPost, subscribeToBlogPosts, type BlogPost, type BlogPostType } from '@/lib/firestore';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';
import { useAuth } from '../components/AuthProvider';

const postTypes: { value: BlogPostType; label: string }[] = [
  { value: 'story', label: 'Personal story' },
  { value: 'product-guide', label: 'Product guide' },
  { value: 'discussion', label: 'Discussion' },
];

const starterPosts: BlogPost[] = [
  {
    id: 'starter-menstrual-cups',
    title: 'Trying a menstrual cup for the first time',
    excerpt: 'A gentle starter guide for insertion, comfort, and knowing when a cup might be right for you.',
    body: 'Menstrual cups can feel intimidating at first, but the learning curve becomes easier with patient practice. Start with clean hands, choose a fold, use water or water-based lubricant, and give yourself space to learn without pressure. Cups are reusable, discreet, and helpful for many people, but comfort matters most.',
    type: 'product-guide',
    authorId: 'bloombox',
    authorName: 'BloomBox team',
    authorEmail: null,
    videoUrl: 'https://www.youtube.com/watch?v=sNCFRK3gfPg',
    productTags: ['menstrual cups', 'reusable care'],
    status: 'published',
  },
  {
    id: 'starter-cup-removal',
    title: 'Removing a menstrual cup without panic',
    excerpt: 'A practical reminder that cup removal should be slow, calm, and based on breaking the seal first.',
    body: 'Cup removal is often the part people worry about most. The key is to relax the pelvic floor, pinch the base to break the seal, and avoid pulling from the stem. Go slowly, breathe, and treat it as a skill you get better at over time.',
    type: 'product-guide',
    authorId: 'bloombox',
    authorName: 'BloomBox team',
    authorEmail: null,
    videoUrl: 'https://www.youtube.com/watch?v=Ej7h8wpZcJQ',
    productTags: ['menstrual cups', 'beginner care'],
    status: 'published',
  },
  {
    id: 'starter-shower-bombs',
    title: 'Small rituals: shower bombs and period comfort',
    excerpt: 'How scent, warm water, and a five-minute reset can make a heavy day feel more manageable.',
    body: 'Shower bombs are not medical care, but they can support a comfort ritual. Pair them with warm water, soft lighting, clean sleepwear, and hydration. The point is not perfection. The point is a small moment that tells your body it is allowed to rest.',
    type: 'discussion',
    authorId: 'bloombox',
    authorName: 'BloomBox team',
    authorEmail: null,
    videoUrl: 'https://www.youtube.com/watch?v=d4i1VO-MzFE',
    productTags: ['shower bombs', 'comfort'],
    status: 'published',
  },
  {
    id: 'starter-bath-bombs',
    title: 'Bath bombs, bubble bars, and choosing a reset',
    excerpt: 'A product-care note for people who want comfort rituals that still feel simple.',
    body: 'Bath products are best when they match the body and the moment. Some days need scent, some need warmth, and some simply need a quiet bath without performance. The right add-on can turn an ordinary evening into a small recovery ritual.',
    type: 'product-guide',
    authorId: 'bloombox',
    authorName: 'BloomBox team',
    authorEmail: null,
    videoUrl: 'https://www.youtube.com/watch?v=GbGhQ50kG_s',
    productTags: ['bath bombs', 'self-care'],
    status: 'published',
  },
  {
    id: 'starter-first-period-kit',
    title: 'What belongs in a first period kit',
    excerpt: 'A warm, practical checklist for preparing without making the moment feel scary.',
    body: 'A first period kit should be clear and kind: pads, wipes, underwear, a small pouch, a note, and something comforting. The products matter, but the tone matters too. A kit can say: you are prepared, you are safe, and there is nothing shameful here.',
    type: 'story',
    authorId: 'bloombox',
    authorName: 'BloomBox team',
    authorEmail: null,
    videoUrl: 'https://www.youtube.com/watch?v=n68xPXeXUvI',
    productTags: ['first period', 'care kits'],
    status: 'published',
  },
  {
    id: 'starter-period-yoga',
    title: 'Gentle movement for cramp-heavy days',
    excerpt: 'A slow comfort note for using movement as support, not pressure.',
    body: 'Not every period day needs exercise. But gentle stretching, breath, and a soft floor routine can help some people feel less tense. Listen to your body first, pause when needed, and choose relief over achievement.',
    type: 'discussion',
    authorId: 'bloombox',
    authorName: 'BloomBox team',
    authorEmail: null,
    videoUrl: 'https://www.youtube.com/watch?v=rHb25925D0w',
    productTags: ['period comfort', 'movement'],
    status: 'published',
  },
];

function getDate(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return 'BloomBox note';
}

function getVideoEmbedUrl(value: string) {
  try {
    const url = new URL(value);

    if (url.hostname.includes('youtube.com')) {
      const playlistId = url.searchParams.get('list');

      if (playlistId) {
        return `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
      }

      const videoId = url.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    if (url.hostname.includes('youtu.be')) {
      const videoId = url.pathname.replace('/', '');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    return '';
  } catch {
    return '';
  }
}

function getPostTypeLabel(type: BlogPostType) {
  return postTypes.find((item) => item.value === type)?.label ?? 'Community post';
}

export default function BlogPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>(starterPosts);
  const [activeType, setActiveType] = useState<'all' | BlogPostType>('all');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [videoOpenIds, setVideoOpenIds] = useState<string[]>([]);
  const [writeOpen, setWriteOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<BlogPostType>('story');
  const [productTags, setProductTags] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleVideo = (id: string) => {
    setVideoOpenIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  useEffect(() => {
    const unsubscribe = subscribeToBlogPosts(
      (nextPosts) => {
        const starterIds = new Set(starterPosts.map((post) => post.id));
        setPosts([...starterPosts, ...nextPosts.filter((post) => !starterIds.has(post.id))]);
      },
      () => setPosts(starterPosts),
    );

    return unsubscribe;
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeType === 'all') return posts;
    return posts.filter((post) => post.type === activeType);
  }, [activeType, posts]);

  const resetForm = () => {
    setTitle('');
    setExcerpt('');
    setBody('');
    setType('story');
    setProductTags('');
    setVideoUrl('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setError('');

    if (!user) {
      setError('Create an account or log in to share a BloomBox story.');
      return;
    }

    if (title.trim().length < 5 || body.trim().length < 30) {
      setError('Add a clear title and at least a few sentences for the story.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createBlogPost(user, {
        title: title.trim(),
        excerpt: excerpt.trim() || body.trim().slice(0, 140),
        body: body.trim(),
        type,
        productTags: productTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        ...(videoUrl.trim() ? { videoUrl: videoUrl.trim() } : {}),
      });
      setNotice('Your post has been added to the BloomBox blog.');
      resetForm();
      setWriteOpen(false);
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : 'Could not publish your post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterOptions = (['all', ...postTypes.map((item) => item.value)] as Array<'all' | BlogPostType>);

  const writeForm = (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title"
        className="rounded-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:border-[#ae2f34] sm:rounded-md sm:px-4 sm:text-sm"
      />
      <input
        value={excerpt}
        onChange={(event) => setExcerpt(event.target.value)}
        placeholder="Short summary"
        className="rounded-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:border-[#ae2f34] sm:rounded-md sm:px-4 sm:text-sm"
      />
      <select
        value={type}
        onChange={(event) => setType(event.target.value as BlogPostType)}
        className="rounded-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:border-[#ae2f34] sm:rounded-md sm:px-4 sm:text-sm"
      >
        {postTypes.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Write your story, product thoughts, or care notes..."
        rows={4}
        className="resize-none rounded-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:border-[#ae2f34] sm:rounded-md sm:px-4 sm:text-sm"
      />
      <input
        value={productTags}
        onChange={(event) => setProductTags(event.target.value)}
        placeholder="Tags, e.g. menstrual cups, shower bombs"
        className="rounded-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:border-[#ae2f34] sm:rounded-md sm:px-4 sm:text-sm"
      />
      <input
        value={videoUrl}
        onChange={(event) => setVideoUrl(event.target.value)}
        placeholder="Optional YouTube link"
        className="rounded-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:border-[#ae2f34] sm:rounded-md sm:px-4 sm:text-sm"
      />
      {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800 sm:rounded-md sm:px-4 sm:py-3">{error}</p> : null}
      {notice ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900 sm:rounded-md sm:px-4 sm:py-3">{notice}</p> : null}
      <button
        disabled={isSubmitting || !user}
        className="rounded-lg bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c1520] disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-md"
      >
        {user ? (isSubmitting ? 'Publishing...' : 'Publish post') : 'Log in to publish'}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader />

      <main className="pb-[4.25rem] sm:pb-0">
        {/* Mobile compact hero — landing rhythm, dark editorial surface */}
        <section className="border-b border-white/10 bg-[#14090c] lg:hidden">
          <div className="bb-mobile-hero-inner">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#fed4c8]">BloomBox blog</p>
            <h1 className="bb-mobile-h1 text-white">Stories & care guides</h1>
            <p className="bb-mobile-lead text-[#fff5f0]">
              Cups, first-period kits, comfort rituals, and community notes.
            </p>
            <div className="bb-mobile-cta-row">
              <a href="#community-posts" className="rounded-md bg-[#ae2f34] px-3 py-2.5 text-center text-sm font-semibold text-white">
                Browse posts
              </a>
              {user ? (
                <button
                  type="button"
                  onClick={() => setWriteOpen(true)}
                  className="rounded-md border border-[#fed4c8] px-3 py-2.5 text-center text-sm font-semibold text-[#fed4c8]"
                >
                  Write a post
                </button>
              ) : (
                <Link
                  href="/signup?next=/blog"
                  className="rounded-md border border-[#fed4c8] px-3 py-2.5 text-center text-sm font-semibold text-[#fed4c8]"
                >
                  Join to write
                </Link>
              )}
            </div>

            {/* Featured video — collapsed until tapped on mobile */}
            <div className="mt-4 overflow-hidden rounded-md border border-white/20 bg-black/40">
              {videoOpenIds.includes('featured') ? (
                <div className="aspect-video bg-black">
                  <iframe
                    src="https://www.youtube.com/embed/sNCFRK3gfPg"
                    title="How to insert a menstrual cup"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleVideo('featured')}
                  className="flex w-full items-center gap-3 p-3 text-left"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ae2f34] text-lg text-white">
                    ▶
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#fed4c8]">
                      Featured guide
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold leading-snug text-white">
                      Menstrual cup starter video
                    </span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Desktop hero */}
        <section className="relative hidden overflow-hidden bg-[#14090c] lg:block">
          <Image
            src="/mockups/bloombox-open-box.png"
            alt="BloomBox care package editorial"
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-[#14090c]/82" />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-8 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="w-fit border border-white/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#fed4c8]">
                BloomBox blog
              </p>
              <h1 className="mt-6 max-w-3xl font-serif text-6xl font-semibold leading-none text-white">
                Stories, product care, and real comfort rituals.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#fff5f0]">
                Community stories, menstrual cup guidance, shower and bath rituals, first-period kits, and short videos that make care easier to understand.
              </p>
              <div className="mt-8 flex flex-row gap-3">
                <a href="#community-posts" className="rounded-md bg-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                  Watch and read
                </a>
                {!user ? (
                  <Link href="/signup?next=/blog" className="rounded-md border border-[#fed4c8] px-6 py-3 text-center text-sm font-semibold text-[#fed4c8] transition hover:bg-[#fed4c8] hover:text-[#14090c]">
                    Create account to write
                  </Link>
                ) : (
                  <a href="#share-story" className="rounded-md border border-[#fed4c8] px-6 py-3 text-center text-sm font-semibold text-[#fed4c8] transition hover:bg-[#fed4c8] hover:text-[#14090c]">
                    Share a story
                  </a>
                )}
              </div>
            </div>

            <div className="border border-white/25 bg-black/30 p-3">
              <div className="aspect-video overflow-hidden bg-black">
                <iframe
                  src="https://www.youtube.com/embed/sNCFRK3gfPg"
                  title="How to insert a menstrual cup"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="border-t border-white/15 bg-[#14090c] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#fed4c8]">Featured guide</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  A practical menstrual cup starter video, paired with BloomBox notes below.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="community-posts" className="bb-page-pad scroll-mt-28">
          <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-8">
            <div className="min-w-0">
              <h2 className="font-serif text-xl font-semibold text-[#ae2f34] sm:text-4xl">Community reads</h2>
              <p className="mt-1 hidden text-base leading-7 text-[#584140] sm:mt-2 sm:block">
                Stories and guides from BloomBox and the people using it.
              </p>
            </div>
            <p className="shrink-0 text-xs font-semibold text-stone-500 sm:hidden">
              {filteredPosts.length} post{filteredPosts.length === 1 ? '' : 's'}
            </p>
          </div>

          {/* Sticky filter chips */}
          <div className="sticky top-[var(--bb-header-offset,60px)] z-20 -mx-3 mb-3 border-b border-stone-200 bg-[#f8f9fa]/95 px-3 py-2 backdrop-blur sm:static sm:mx-0 sm:mb-6 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
            <div className="bb-mobile-scroll flex gap-1.5 pb-0.5 sm:flex-wrap sm:gap-2 sm:overflow-visible">
              {filterOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveType(item)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                    activeType === item
                      ? 'border-[#ae2f34] bg-[#ae2f34] text-white'
                      : 'border-stone-300 bg-white text-stone-700 hover:border-[#ae2f34] hover:text-[#ae2f34]'
                  }`}
                >
                  {item === 'all' ? 'All' : getPostTypeLabel(item)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2.5 sm:gap-5 lg:grid-cols-2">
            {filteredPosts.map((post) => {
              const embedUrl = post.videoUrl ? getVideoEmbedUrl(post.videoUrl) : '';
              const isExpanded = expandedIds.includes(post.id);
              const videoOpen = videoOpenIds.includes(post.id);

              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-md sm:border-stone-300 sm:shadow-sm"
                >
                  <div className="p-3.5 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#fff5f0] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#ae2f34] sm:px-2 sm:py-1 sm:text-[11px]">
                        {getPostTypeLabel(post.type)}
                      </span>
                      <span className="text-[11px] text-stone-500 sm:text-xs">{getDate(post.createdAt)}</span>
                      {post.videoUrl ? (
                        <span className="rounded-full border border-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
                          Video
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-2.5 font-serif text-lg font-semibold leading-snug text-[#191c1d] sm:mt-4 sm:text-3xl">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-[#584140] sm:mt-3">{post.excerpt}</p>

                    <div className={`${isExpanded ? 'mt-3' : 'mt-2'} sm:mt-4`}>
                      <p
                        className={`text-sm leading-7 text-stone-700 ${
                          isExpanded ? '' : 'line-clamp-2 sm:line-clamp-none'
                        }`}
                      >
                        {post.body}
                      </p>
                    </div>

                    {post.productTags.length > 0 ? (
                      <div className={`flex flex-wrap gap-1.5 ${isExpanded ? 'mt-3' : 'mt-2.5'} sm:mt-5 sm:gap-2`}>
                        {post.productTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-stone-200 bg-[#f8f9fa] px-2.5 py-0.5 text-[10px] font-semibold text-stone-600 sm:rounded-md sm:px-3 sm:py-1 sm:text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {/* Video: tap to load on mobile; always visible on desktop */}
                    {embedUrl ? (
                      <div className="mt-3 sm:mt-5">
                        {videoOpen ? (
                          <div className="aspect-video overflow-hidden rounded-md border border-stone-200 bg-stone-100 sm:border-stone-300">
                            <iframe
                              src={embedUrl}
                              title={post.title}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleVideo(post.id)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#ae2f34] bg-[#fff5f0] px-4 py-2.5 text-sm font-semibold text-[#ae2f34] sm:hidden"
                          >
                            ▶ Watch video
                          </button>
                        )}
                        {/* Desktop always show embed when not already opened via mobile button */}
                        {!videoOpen ? (
                          <div className="hidden aspect-video overflow-hidden rounded-md border border-stone-300 bg-stone-100 sm:block">
                            <iframe
                              src={embedUrl}
                              title={post.title}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : post.videoUrl ? (
                      <a
                        href={post.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md mt-3 inline-flex border border-[#ae2f34] px-4 py-2 text-sm font-semibold text-[#ae2f34] hover:bg-[#fff5f0] sm:mt-5"
                      >
                        Watch linked video
                      </a>
                    ) : null}

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-stone-100 pt-3 sm:mt-5 sm:border-0 sm:pt-0">
                      <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500 sm:text-xs sm:tracking-[0.14em]">
                        By {post.authorName}
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(post.id)}
                        className="shrink-0 text-sm font-semibold text-[#ae2f34] sm:hidden"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="rounded-xl border border-stone-200 bg-white p-6 text-center sm:p-10">
              <p className="text-sm text-stone-600">No posts in this category yet.</p>
              <button
                type="button"
                onClick={() => setActiveType('all')}
                className="mt-3 text-sm font-semibold text-[#ae2f34]"
              >
                Show all posts
              </button>
            </div>
          ) : null}
        </section>

        {/* Share section — desktop always; mobile uses bottom sheet */}
        <section id="share-story" className="border-y border-stone-300 bg-white">
          <div className="bb-page-pad grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <Eyebrow>Write with us</Eyebrow>
              <h2 className="mt-3 font-serif text-xl font-semibold text-[#191c1d] sm:mt-5 sm:text-4xl">
                Document a story or product note.
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-[#584140] sm:mt-4">
                Share a first-period memory, a product experience, a comfort ritual, or a helpful YouTube video.
              </p>
              {!user ? (
                <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:gap-3">
                  <Link
                    href="/signup?next=/blog"
                    className="rounded-md bg-[#ae2f34] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520]"
                  >
                    Create account
                  </Link>
                  <Link
                    href="/login?next=/blog"
                    className="rounded-md border border-[#ae2f34] px-5 py-3 text-center text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]"
                  >
                    Log in
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setWriteOpen(true)}
                  className="mt-4 w-full rounded-md bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white sm:hidden"
                >
                  Open write form
                </button>
              )}
            </div>

            {/* Desktop form */}
            <div className="hidden rounded-md border border-stone-300 bg-[#fff5f0] p-5 shadow-sm sm:block">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Share with the community</p>
              <div className="mt-4">{writeForm}</div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile write bottom sheet */}
      {writeOpen ? (
        <div className="fixed inset-0 z-[60] sm:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/40"
            aria-label="Close write form"
            onClick={() => setWriteOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-2xl border border-stone-200 bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-stone-300" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Write</p>
                <h2 className="font-serif text-xl font-semibold text-[#191c1d]">Share a post</h2>
              </div>
              <button
                type="button"
                onClick={() => setWriteOpen(false)}
                className="rounded-full border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700"
              >
                Close
              </button>
            </div>
            {!user ? (
              <div className="grid gap-2">
                <p className="text-sm text-stone-600">Log in or create an account to publish.</p>
                <Link href="/signup?next=/blog" className="rounded-lg bg-[#ae2f34] px-4 py-3 text-center text-sm font-semibold text-white">
                  Create account
                </Link>
                <Link href="/login?next=/blog" className="rounded-lg border border-stone-300 px-4 py-3 text-center text-sm font-semibold text-stone-800">
                  Log in
                </Link>
              </div>
            ) : (
              writeForm
            )}
          </div>
        </div>
      ) : null}

      {/* Mobile sticky actions */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-3 py-2 backdrop-blur sm:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-7xl gap-2">
          <a
            href="#community-posts"
            className="flex-1 rounded-lg border border-stone-300 py-2.5 text-center text-sm font-semibold text-stone-800"
          >
            Posts
          </a>
          <button
            type="button"
            onClick={() => setWriteOpen(true)}
            className="flex-1 rounded-lg bg-[#ae2f34] py-2.5 text-center text-sm font-semibold text-white"
          >
            Write
          </button>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
