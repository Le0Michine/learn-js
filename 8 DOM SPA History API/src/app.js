const ROUTES = [
    { url: '/', templateUrl: '/src/templates/home.html' },
    { url: '/sign-in', templateUrl: '/src/templates/sign-in.html' },
    { url: '/sign-up', templateUrl: '/src/templates/sign-up.html' }
];

(function () {
  class Router {
    constructor(routes, basePath, onNavigation) {
      console.log('init router', location.pathname, basePath);

      this.routes = routes || [];
      this.basePath = basePath ? basePath.replace(/\/$/,'') : basePath;
      this.currentRoute = this.toShortPath(location.pathname);
      this.onNavigation = onNavigation || (() => void 0);

      if (!this.routes.find(r => r.url === this.currentRoute)) {
        throw new Error(`Unknown path ${this.currentRoute}`);
      }

      this.listenLinks()
      this.listenNavigationEvents();

      this.onNavigation(this.toFullPath(this.routes.find(r => r.url === this.currentRoute).templateUrl));
    }

    listenNavigationEvents() {
      document.addEventListener('navigate', () => {
        const path = location.pathname;
        const route = this.routes.find(r => r.url === this.toShortPath(path));

        if (!route) {
          throw new Error(`Unknown path '${path}'`)
        } else {
          console.log('navigate to', path);
          this.currentRoute = this.toShortPath(path);
          this.onNavigation(this.toFullPath(route.templateUrl));
        }
      });

      window.addEventListener('popstate', () => {
        this.dispatchNavigationEvent();
      });
    }

    listenLinks() {
      document.addEventListener('click', (event) => {
        if (event.target.hasAttribute('route')) {
          event.preventDefault();
          history.pushState({ }, '', event.target.href);
          this.dispatchNavigationEvent();
        }
      });
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

  class WD {
    constructor() {}

    static createRoot(rootName) {
      const root = document.querySelector(`[wd-root=${rootName}]`);
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
    }
  }

  const wd = new WD();
  WD.createRoot('app');
})();