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
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<BlogPostType>('story');
  const [productTags, setProductTags] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : 'Could not publish your post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-[#14090c]">
          <Image
            src="/mockups/bloombox-open-box.png"
            alt="BloomBox care package editorial"
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-[#14090c]/82" />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-20">
            <div>
              <p className="w-fit border border-white/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#fed4c8]">BloomBox blog</p>
              <h1 className="mt-6 max-w-3xl font-serif text-5xl font-semibold leading-none text-white sm:text-6xl">
                Stories, product care, and real comfort rituals.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#fff5f0]">
                Community stories, menstrual cup guidance, shower and bath rituals, first-period kits, and short videos that make care easier to understand.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#community-posts" className="bg-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                  Watch and read
                </a>
                {!user ? (
                  <Link href="/signup?next=/blog" className="border border-[#fed4c8] px-6 py-3 text-center text-sm font-semibold text-[#fed4c8] transition hover:bg-[#fed4c8] hover:text-[#14090c]">
                    Create account to write
                  </Link>
                ) : (
                  <a href="#share-story" className="border border-[#fed4c8] px-6 py-3 text-center text-sm font-semibold text-[#fed4c8] transition hover:bg-[#fed4c8] hover:text-[#14090c]">
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
                <p className="mt-1 text-sm font-semibold text-white">A practical menstrual cup starter video, paired with BloomBox notes below.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="community-posts" className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-serif text-4xl font-semibold text-[#ae2f34]">Community reads</h2>
              <p className="mt-2 text-base leading-7 text-[#584140]">Stories and guides from BloomBox and the people using it.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', ...postTypes.map((item) => item.value)] as Array<'all' | BlogPostType>).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveType(item)}
                  className={`border px-4 py-2 text-sm font-semibold ${activeType === item ? 'border-[#ae2f34] bg-[#ae2f34] text-white' : 'border-stone-300 bg-white text-stone-700 hover:border-[#ae2f34] hover:text-[#ae2f34]'}`}
                >
                  {item === 'all' ? 'All' : getPostTypeLabel(item)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {filteredPosts.map((post) => {
              const embedUrl = post.videoUrl ? getVideoEmbedUrl(post.videoUrl) : '';

              return (
                <article key={post.id} className="border border-stone-300 bg-white p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#fff5f0] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#ae2f34]">{getPostTypeLabel(post.type)}</span>
                    <span className="text-xs text-stone-500">{getDate(post.createdAt)}</span>
                  </div>
                  <h3 className="mt-4 font-serif text-3xl font-semibold text-[#191c1d]">{post.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#584140]">{post.excerpt}</p>
                  <p className="mt-4 text-sm leading-7 text-stone-700">{post.body}</p>
                  {post.productTags.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {post.productTags.map((tag) => (
                        <span key={tag} className="border border-stone-200 bg-[#f8f9fa] px-3 py-1 text-xs font-semibold text-stone-600">{tag}</span>
                      ))}
                    </div>
                  ) : null}
                  {embedUrl ? (
                    <div className="mt-5 aspect-video overflow-hidden border border-stone-300 bg-stone-100">
                      <iframe src={embedUrl} title={post.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  ) : post.videoUrl ? (
                    <a href={post.videoUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex border border-[#ae2f34] px-4 py-2 text-sm font-semibold text-[#ae2f34] hover:bg-[#fff5f0]">
                      Watch linked video
                    </a>
                  ) : null}
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">By {post.authorName}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="share-story" className="border-y border-stone-300 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <Eyebrow>Write with us</Eyebrow>
              <h2 className="mt-5 font-serif text-4xl font-semibold text-[#191c1d]">Document a story or product note.</h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-[#584140]">
                Share a first-period memory, a product experience, a comfort ritual, or a helpful YouTube video that made menstrual care easier to understand.
              </p>
              {!user ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/signup?next=/blog" className="bg-[#ae2f34] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                    Create account
                  </Link>
                  <Link href="/login?next=/blog" className="border border-[#ae2f34] px-5 py-3 text-center text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]">
                    Log in
                  </Link>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="border border-stone-300 bg-[#fff5f0] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Share with the community</p>
              <div className="mt-4 grid gap-3">
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" className="border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#ae2f34]" />
                <input value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="Short summary" className="border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#ae2f34]" />
                <select value={type} onChange={(event) => setType(event.target.value as BlogPostType)} className="border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#ae2f34]">
                  {postTypes.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
                <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write your story, product thoughts, or care notes..." rows={5} className="resize-none border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#ae2f34]" />
                <input value={productTags} onChange={(event) => setProductTags(event.target.value)} placeholder="Tags, e.g. menstrual cups, shower bombs" className="border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#ae2f34]" />
                <input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="Optional YouTube link or playlist URL" className="border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#ae2f34]" />
                {error ? <p className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p> : null}
                {notice ? <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</p> : null}
                <button disabled={isSubmitting || !user} className="bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c1520] disabled:cursor-not-allowed disabled:opacity-60">
                  {user ? (isSubmitting ? 'Publishing...' : 'Publish post') : 'Log in to publish'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
