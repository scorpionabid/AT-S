// Z-Index Debug Script - Browser Console-də işlətmək üçün
console.log('=== Z-INDEX DEBUG ===');

// Bütün elementləri yoxla
const allElements = document.querySelectorAll('*');
const zIndexElements = [];

allElements.forEach(el => {
  const style = window.getComputedStyle(el);
  const zIndex = style.zIndex;
  
  if (zIndex !== 'auto' && zIndex !== '0') {
    zIndexElements.push({
      element: el,
      zIndex: zIndex,
      className: el.className,
      tagName: el.tagName,
      id: el.id,
      position: style.position
    });
  }
});

// Z-index-ə görə sırala
zIndexElements.sort((a, b) => parseInt(a.zIndex) - parseInt(b.zIndex));

console.table(zIndexElements.map(item => ({
  'Tag': item.tagName,
  'Z-Index': item.zIndex,
  'Position': item.position,
  'Class': item.className.substring(0, 50),
  'ID': item.id
})));

// Sidebar və page header-ı axtaraq spesifik yoxla
const sidebar = document.querySelector('.app-sidebar, [data-component="sidebar"]');
const pageHeader = document.querySelector('.standard-page-header-wrapper, [data-component="page-header"]');

if (sidebar) {
  const sidebarStyle = window.getComputedStyle(sidebar);
  console.log('SIDEBAR:', {
    zIndex: sidebarStyle.zIndex,
    position: sidebarStyle.position,
    className: sidebar.className
  });
}

if (pageHeader) {
  const headerStyle = window.getComputedStyle(pageHeader);
  console.log('PAGE HEADER:', {
    zIndex: headerStyle.zIndex,
    position: headerStyle.position,
    className: pageHeader.className
  });
}

console.log('=== DEBUG END ===');