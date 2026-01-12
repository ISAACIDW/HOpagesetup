import fs from 'fs';
import RSS from 'rss';
import blogs from '../jsons/blogs.json';

/**
 * Utility to generate an RSS feed (rss.xml) in the public folder.
 * This reads from the local src/jsons/blogs.json file for "offline" loading.
 */
export default async function generateRssFeed() {
    const site_url = 'https://www.horizontrailers.com';

    // Sort blogs by date (newest first)
    const allPosts = [...blogs].sort(
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
        const descriptionSnippet = post.body ? post.body.replace(/(<([^>]+)>)/gi, "").substring(0, 250) + "..." : "";

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
        console.log('RSS Feed generated successfully at public/rss.xml');
    } catch (error) {
        console.error('Error writing RSS feed:', error);
    }
}
