const ROUTES = [
    { url: '/', templateUrl: '/src/templates/home.html' },
    { url: '/sign-in', templateUrl: '/src/templates/sign-in.html' },
    { url: '/sign-up', templateUrl: '/src/templates/sign-up.html' }
];

wd.createRoot('app').routes(ROUTES);