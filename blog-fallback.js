/*
 * Fallback blog data for when the API is not available
 */

function getBlogFallbackData() {
    return [
        {
            id: 'welcome-post',
            title: 'Welcome to My Blog',
            date: '2025-04-01T12:00:00Z',
            author: 'Hrvoje Matosevic',
            excerpt: 'This is my first blog post where I will be sharing insights about web development, programming, and technology.',
            image: '/assets/blog/welcome-post.jpg',
            tags: ['Web Development', 'Introduction'],
            published: true,
            content: '# Welcome to My Blog\n\nHello and welcome to my personal blog! I\'m excited to share insights, tips, and experiences from my journey as a web developer.\n\n## What to Expect\n\nOn this blog, I\'ll be covering various topics related to web development, including:\n\n* Frontend technologies (HTML, CSS, JavaScript)\n* Backend development\n* Software architecture and design patterns\n* Performance optimization\n* Development tools and workflow\n\n## About Me\n\nI\'m Hrvoje, a passionate full-stack developer with experience in building modern web applications. I love exploring new technologies and sharing knowledge with the community.\n\n## Stay Connected\n\nFeel free to connect with me on Twitter or LinkedIn. I\'m always open to discussions, collaborations, or just a friendly chat about technology!\n\nThanks for reading, and I hope you\'ll find valuable content here.'
        }
    ];
}