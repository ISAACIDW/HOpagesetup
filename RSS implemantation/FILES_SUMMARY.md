# RSS Implementation File Summary

To implement the RSS feed and offline data source, you need to handle the following files:

## 🆕 Files to Create (2)
These files provide the data source and the generation logic.

1.  **`src/jsons/blogs.json`**
    - **Purpose**: Stores the blog posts locally.
    - **Status**: Sample provided in this folder.
2.  **`src/utils/generateRSSFeed.js`**
    - **Purpose**: Logic to generate `public/rss.xml`.
    - **Status**: Logic provided in this folder.

---

## 🛠️ Files to Modify (4)
These changes integrate the new logic into your existing application.

1.  **`src/app/[locale]/blog/page.js`**
    - **Change**: Import `generateRssFeed` and call it inside the component.
2.  **`src/components/blog/all_blogs_container.js`**
    - **Change**: Add the `<Link>` to `/rss.xml` next to the blog title.
3.  **`src/services/firebase-service.js`**
    - **Change**: Update `getBlogs` to return the data from `blogs.json`.
4.  **`src/app/[locale]/blog/details/[slug]/page.js`**
    - **Change**: Update `generateMetadata` and the `Page` component to retrieve blog data from the local JSON instead of Firebase.

---

**Detailed instructions for each file are available in `RSS_GUIDE.md`.**
