wd = (function() {
  class Router {
    constructor(basePath) {
      console.log('init router', location.pathname, basePath);

      this.routes = [];
      this.basePath = basePath ? basePath.replace(/\/$/,'') : basePath;
      this.apps = {};
      this.listenLinks();
      this.listenNavigationEvents();
    }

    refresh() {
      this.navigate(this.currentRoute);
    }

    matchRoute(url) {
      return this.routes.filter(r => r.url === this.toShortPath(url) || r.url === '*');
    }

    addRoutes(routes, appName, onNavigation) {
      this.routes = this.routes.concat(routes.map(r => Object.assign({}, r, { app: appName })));
      this.apps[appName] = onNavigation || (() => void 0);
      this.currentRoute = this.toShortPath(location.pathname);

      if (!this.routes.find(r => r.url === this.currentRoute)) {
        throw new Error(`Unknown path ${this.currentRoute}`);
      }

      this.apps[appName](this.toFullPath(this.matchRoute(this.currentRoute).find(r => r.app === appName).templateUrl));
    }

    listenNavigationEvents() {
      document.addEventListener('navigate', () => {
        const path = location.pathname;
        const route = this.routes.filter(r => r.url === this.toShortPath(path) || r.url === '*');

        if (!route.length) {
          throw new Error(`Unknown path '${path}'`)
        } else {
          Logger.logGroup('navigate to', route);
          this.currentRoute = this.toShortPath(path);
          route.forEach(r => this.apps[r.app](this.toFullPath(r.templateUrl)));
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
          this.navigate(event.target.href);
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

    navigate(path) {
      history.pushState({ }, '', path);
      this.dispatchNavigationEvent();
    }
  }

  class Logger {
    static logGroup(groupName, lines) {
      console.group(groupName);
      lines.forEach(l => console.log(l));
      console.groupEnd();
    }
  }

  class WD {
    /**
     * @typedef {Object} ComponentDescriptor
     * @property {string} template
     * @property {string} templateUrl
     * @property {function} beforeMount
     */

    constructor (rootName) {
      if (!rootName) {
        throw new Error(`Root element name can't be empty`);
      }

      this.root = document.querySelector(`[wd-root=${rootName}]`);
      this.rootName = rootName;
      this.components = [];

      if (!this.root) {
        throw new Error(`Unable to find root element with name ${rootName}`);
      }
    }

    routes(routes) {
      if (!this.root) {
        throw new Error('Root element isn\'t initialized, call createRoot() method to perform initialization');
      }
      WD.router.addRoutes(routes, this.rootName, (templateUrl) => this.renderApp(templateUrl));
      return this;
    }

    renderApp(templateUrl) {
      fetch(templateUrl).then(x => {
        const reader = x.body.getReader();
        let template = '';
        const bufferProcessor = (result) => {
          template += String.fromCharCode.apply(null, result.value);
          if (!result.done) {
            reader.read().then(bufferProcessor);
          } else {
            this.root.innerHTML = this.renderComponents(template);
          }
        };
        reader.read().then(bufferProcessor);
      });
    }

    /**
     * @param {string} template App html markup
     * @returns {string} App template with rendered components
     */
    renderComponents(template) {
      this.components.forEach(component => {
        const regex = new RegExp(`<${component.name}.*?>(.*?</${component.name}>)?`, 'gi');
        template = template.replace(regex, componentTemplate => component.descriptor.beforeMount(this, this.fillTemplate(componentTemplate, component.descriptor.template)));
      });
      return template;
    }

    fillTemplate(element, template) {
      return template.replace(
        /{(.*?)}/g,
        // extracts attr value <CompName attr="value">
        (m, name) => element.match(new RegExp(name + '=(["\'])([^"\']*?)\\1'))[2]);
    }

    navigate(path) {
      if (WD.apps[rootName]) {
        throw new Error(`Router wasn't initialized yet`);
      }

      WD.router.navigate(path);
    }

    /**
     * @param {string} name Name of the component
     * @param {ComponentDescriptor} descriptor Descriptor of the component
     * */
    component(name, descriptor) {
      this.components.push({ name, descriptor });
    }

    static root(rootName) {
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
  WD.router = new Router(location.host === 'le0michine.github.io' ? location.pathname : '');

  return WD;
})();