# RSS Feed Implementation Guide for Horizon Blog

This guide explains how to add an RSS feed to the Horizon blog using a local JSON file for data, ensuring minimal modification to existing files and allowing for "offline" loading.

## Prerequisites

Ensure the `rss` library is installed in your project:

```bash
npm install rss
```

---

## Step 1: Export Blog Data to JSON

To load the blog offline from a file, you first need to export your Firebase data to a local JSON file. 

1. **File Location**: `src/jsons/blogs.json` (I've created this for you with sample data).
2. **Data Format**: Ensure the file contains an array of blog objects. Example structure:
   ```json
   [
     {
       "slug": "blog-post-slug",
       "title": "Blog Post Title",
       "author": "Author Name",
       "date": 1700000000000,
       "body": "<p>Content...</p>",
       "headerImg": "https://...",
       "tags": ["tag1", "tag2"],
       "seo": {
         "description": "Short summary..."
       }
     }
   ]
   ```

---

## Step 2: Configure the RSS Generator Utility

I have already created the logic for you at `src/utils/generateRSSFeed.js`. This script reads from your local JSON and generates the `rss.xml` file in the `public` folder.

You don't need to create this file, just ensure the paths in it match your structure.

```javascript
import fs from 'fs';
import RSS from 'rss';
import blogs from '../jsons/blogs.json'; // Path to your local JSON

export default async function generateRssFeed() {
    const site_url = 'https://www.horizontrailers.com';

    // Sort blogs by date (newest first)
    const allPosts = blogs.sort(
        (a, b) => (new Date(b.date)).getTime() - (new Date(a.date)).getTime()
    );

    const feedOptions = {
        title: 'Horizon Trailers | Blog RSS Feed',
        description: 'Inside the trailer world. Read all the important news about Horizon Trailers.',
        site_url: site_url,
        feed_url: `${site_url}/rss.xml`,
        image_url: `${site_url}/logos/compressed_logo.webp`,
        pubDate: new Date(),
        copyright: `All rights reserved ${new Date().getFullYear()}, Horizon Trailers`,
    };

    const feed = new RSS(feedOptions);

    allPosts.forEach((post) => {
        // Strip HTML tags for the description snippet
        const descriptionSnippet = post.body.replace(/(<([^>]+)>)/gi, "").substring(0, 250) + "...";
        
        feed.item({
            title: post.title,
            description: post.seo?.description || descriptionSnippet,
            url: `${site_url}/blog/details/${post.slug}`,
            date: post.date,
            author: post.author,
            categories: post.tags || [],
            enclosure: post.headerImg ? { url: post.headerImg } : undefined,
        });
    });

    // Write the file to the public folder
    try {
        if (!fs.existsSync('./public')) {
            fs.mkdirSync('./public');
        }
        fs.writeFileSync('./public/rss.xml', feed.xml({ indent: true }));
    } catch (error) {
        console.error('Error writing RSS feed:', error);
    }
}
```

---

## Step 3: Trigger Generation in the Blog Page

To ensure the RSS feed stays updated, call the generator inside the main Blog server component.

**File:** `src/app/[locale]/blog/page.js`

1. Change the function to `async`.
2. Import and call the generator.

```javascript
import generateRssFeed from "@/utils/generateRSSFeed";
// ... other imports

async function Blog() {
    // This generates the rss.xml file on the server whenever this page is visited
    await generateRssFeed();

    return (
        <>
            <BlogNavbar />
            <BlogCarousel />
            <AllBlogContainer />
        </>
    );
}

export default Blog;
```

---

## Step 4: Add the RSS Link to the UI

Add a link to the generated XML file so users can subscribe.

**File:** `src/components/blog/all_blogs_container.js`

Add a link next to the "BLOG" title:

```jsx
import Link from "next/link";
// ...

// Inside the return block, near the <h2>{t('blog')}</h2>
<div className="flex items-center justify-between">
    <h2 className="..."> {t('blog')} </h2>
    <Link href="/rss.xml" target="_blank" className="flex items-center gap-2 text-[#f05a22]">
        <span className="material-symbols-outlined">rss_feed</span>
        <span className="hidden md:block">RSS Feed</span>
    </Link>
</div>
```

---

## Step 5: (Optional) Switching to Offline Data

To fully implement offline loading for the blog UI as well:

1. **In `src/services/firebase-service.js`**:
   Update `getBlogs` to return the JSON file instead of fetching from Firebase:
   ```javascript
   import blogsData from "../jsons/blogs.json";
   export const getBlogs = () => {
       return new Promise((resolve) => resolve(blogsData));
   };
   ```

2. **In `src/app/[locale]/blog/details/[slug]/page.js`**:
   Update the `generateMetadata` and `Page` functions to find the blog in `blogsData` instead of using `fetch()`.
