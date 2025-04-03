/**
 * Fallback blog data handler
 * This script provides local blog data to be used if the API fails
 */

// Fallback blog data
const fallbackBlogData = [
  {
    "id": "responsive-design",
    "title": "Mastering Responsive Web Design",
    "excerpt": "Learn the essential techniques and best practices for creating websites that look great on any device, from mobile phones to large desktop screens.",
    "author": "Hrvoje Matosevic",
    "date": "2025-03-28T14:30:00",
    "image": "/dev.png",
    "tags": ["Web Design", "CSS", "Frontend", "Mobile"],
    "published": true
  },
  {
    "id": "sample-post",
    "title": "Getting Started with Full-Stack Development",
    "excerpt": "Learn about the key technologies and concepts you need to know as a full-stack developer in today's web development landscape.",
    "author": "Hrvoje Matosevic",
    "date": "2025-03-25T12:00:00",
    "image": "/particle.png",
    "tags": ["Web Development", "Coding", "Frontend", "Backend"],
    "published": true
  }
];

// Export the fallback data
function getBlogFallbackData() {
  return fallbackBlogData;
}
