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
            image: null,
            tags: ['Web Development', 'Introduction'],
            published: true
        }
    ];
}