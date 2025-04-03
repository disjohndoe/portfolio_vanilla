# Portfolio Website with Blog

This is a portfolio website with an integrated blog system built with vanilla JavaScript and PHP.

## Features

- Responsive portfolio website
- Blog system with PHP backend
- Markdown support for blog posts
- Admin panel for content management
- Tag-based filtering for blog posts
- SEO-friendly URL structure

## Setup Instructions

### Prerequisites

- PHP 7.0 or higher (for backend)
- Web server with mod_rewrite enabled (Apache recommended)
- Node.js and npm (if using Vite for development)

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd portfolio_vanilla
```

2. Set up local PHP server (if testing locally):
```
php -S localhost:8000
```

3. Start the frontend development server (if using Vite):
```
npm run dev
```

### Deployment to Hosting

See `HOSTINGER_DEPLOYMENT.md` for detailed instructions on deploying to Hostinger or other PHP hosting providers.

### Directory Structure

- `api/` - PHP backend for the blog
  - `index.php` - Main API entry point
  - `posts.php` - Posts handler
  - `upload.php` - File upload handler
- `blog_data/` - Directory where blog posts are stored
- `blog_data/images/` - Directory for blog post images
- `blog.html` - Blog listing page
- `blog-post.html` - Individual blog post page
- `admin.html` - Blog admin panel
- `index.html` - Main portfolio page
- `.htaccess` - URL rewriting rules

## How to Use the Blog

### Accessing the Blog

- Visit `/blog.html` to view the blog
- Visit `/admin.html` to manage blog posts

### Creating a Blog Post

1. Go to `/admin.html`
2. Click "New Post"
3. Fill in the title, excerpt, and content (using Markdown)
4. Add tags and a featured image if desired
5. Toggle "Published" on or off
6. Click "Save Post"

### Markdown Tips

- Use `# Heading 1`, `## Heading 2`, `### Heading 3` for headings
- Use `**bold**` for bold text
- Use `*italic*` for italic text
- Use `[link text](url)` for links
- Use `![alt text](image-url)` for images
- Use ``` code ``` for code blocks

## Customization

### Changing API URL

If you're deploying to a different domain or port, update the API_URL constant in:
- `blog.html`
- `blog-post.html`
- `admin.html`

### Blog Storage

Blog posts are stored as JSON files in the `blog_data` directory. Images are stored in the `blog_data/images` directory.

## SEO Optimization

The blog system includes:
- Meta tags for title, description, and author
- Open Graph tags for social media sharing
- Semantic HTML structure
- Mobile-friendly responsive design
