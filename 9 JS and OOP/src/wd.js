wd = (function() {
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
            this.navigate(link.href);
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

    navigate(path) {
      history.pushState({ }, '', path);
      this.dispatchNavigationEvent();
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
    constructor (rootName) {
      if (!rootName) {
        throw new Error(`Root element name can't be empty`);
      }

      this.root = this.root = document.querySelector(`[wd-root=${rootName}]`);

      if (!this.root) {
        throw new Error(`Unable to find root element with name ${rootName}`);
      }
    }

    routes(routes) {
      if (!this.root) {
        throw new Error('Root element isn\'t initialized, call createRoot() method to perform initialization');
      }
      router = new Router(routes, location.pathname, (templateUrl) => {
        fetch(templateUrl).then(x => {
          const reader = x.body.getReader();
          let template = '';
          const bufferProcessor = (result) => {
            template += String.fromCharCode.apply(null, result.value);
            if (!result.done) {
              reader.read().then(bufferProcessor);
            } else {
              this.root.innerHTML = template;
            }
          };
          reader.read().then(bufferProcessor);
        });
      });
      return this;
    }

    navigate(path) {
      if (this.apps[rootName]) {
        throw new Error(`Router wasn't initialized yet`);
      }

      this.router.navigate(path);
    }

    root(rootName) {
      return WD.apps[rootName];
    }

    static createRoot(rootName) {
      if (WD.apps[rootName]) {
        throw new Error('Root element with the same name already exists');
      }

      WD.apps[rootName] = new WD(rootName);
      return WD.apps[rootName];
    }
  }

  WD.apps = {};

  return WD;
})();