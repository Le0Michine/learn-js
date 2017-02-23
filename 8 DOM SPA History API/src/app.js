const ROUTES = [
    { url: '/', templateUrl: '/src/templates/home.html' },
    { url: '/sign-in', templateUrl: '/src/templates/sign-in.html' },
    { url: '/sign-up', templateUrl: '/src/templates/sign-up.html' }
];

class Router {
  constructor(routes, basePath, onNavigation) {
    console.log('init router', location.pathname);

    this.routes = routes || [];
    this.basePath = basePath ? basePath.replace(/\/$/,'') : basePath;
    this.currentRoute = this.toShortPath(location.pathname);

    if (!this.routes.find(r => r.url === this.currentRoute)) {
      throw new Error(`Unknown path ${this.currentRoute}`);
    }

    document.querySelectorAll('a[route]')
      .forEach(link => {
        link.href = link.href.replace(location.origin, this.basePath || '');
        link.addEventListener('click', (event) => {
          event.preventDefault();
          history.pushState({ }, '', link.href);
          this.dispatchNavigationEvent();
        });
      });

      document.addEventListener('navigate', () => {
        const path = location.pathname;
        const route = this.routes.find(r => r.url === this.toShortPath(path));

        if (!route) {
          throw new Error(`Unknown path '${path}'`)
        } else {
          console.log('navigate to', path);
          this.currentRoute = this.toShortPath(path);
          onNavigation(this.toFullPath(route.templateUrl));
        }
      });

      window.addEventListener('popstate', () => {
        this.dispatchNavigationEvent();
      });

      onNavigation(this.toFullPath(this.routes.find(r => r.url === this.currentRoute).templateUrl));
  }

  toShortPath(path) {
    return path.replace(this.basePath, '');
  }

  toFullPath(path) {
    return (this.basePath || '') + path;
  }

  dispatchNavigationEvent() {
    document.dispatchEvent(new Event('navigate'));
  }
}


(function wd(rootName) {
  const root = document.querySelector('[wd-root=app]');

  if (!root) {
    throw new Error(`Unable to find root element with name ${rootName}`);
  } else {
    const router = new Router(ROUTES, location.pathname, (templateUrl) => {
      fetch(templateUrl).then(x => {
        const reader = x.body.getReader();
        let template = '';
        const bufferProcessor = (result) => {
          template += String.fromCharCode.apply(null, result.value);
          if (!result.done) {
            reader.read().then(bufferProcessor);
          } else {
            root.innerHTML = template;
          }
        };
        reader.read().then(bufferProcessor);
      });
    });
  }
})("app");