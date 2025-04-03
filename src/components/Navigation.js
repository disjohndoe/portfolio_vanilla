/**
 * Creates consistent navigation HTML for all pages
 * @param {string} currentPage - The current page ID to highlight active link
 * @returns {string} - Navigation HTML
 */
export function createNavigation(currentPage) {
  // Define all navigation links
  const navLinks = [
    { href: "/", text: "Home", id: "home" },
    { href: "/#about", text: "About", id: "about" },
    { href: "/#featured", text: "My Work", id: "featured" },
    { href: "/blog.html", text: "Blog", id: "blog" },
    { href: "/#contact", text: "Contact", id: "contact" }
  ];
  
  // Create desktop navigation HTML
  const desktopNavHTML = `
    <header class="header container">
      <nav>
        <div class="logo">HM</div>
        <ul class="header__menu">
          ${navLinks.map(link => 
            `<li class="header__link">
              <a href="${link.href}" ${currentPage === link.id ? 'class="active"' : ''}>${link.text}</a>
            </li>`
          ).join('')}
          <li class="header__line"></li>
          <li>
            <button id="theme-toggle" class="header__sun header__right">
              <i class="fas fa-sun"></i>
              <i class="fas fa-moon"></i>
            </button>
          </li>
        </ul>
        <button class="header__bars">
          <i class="fas fa-bars"></i>
        </button>
      </nav>
    </header>
  `;
  
  // Create mobile navigation HTML
  const mobileNavHTML = `
    <div class="mobile-nav">
      <div class="mobile-nav__close">
        <i class="fas fa-times"></i>
      </div>
      <nav>
        <ul class="mobile-nav__menu">
          ${navLinks.map(link => 
            `<li>
              <a class="mobile-nav__link ${currentPage === link.id ? 'active' : ''}" href="${link.href}">${link.text}</a>
            </li>`
          ).join('')}
          <li class="mobile-nav__link-line"></li>
          <li>
            <button id="mobile-theme-toggle" class="mobile-nav__sun">
              <i class="fas fa-sun"></i>
              <i class="fas fa-moon"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  `;
  
  return { desktopNavHTML, mobileNavHTML };
}
