const ROUTES = [
    { url: '/', templateUrl: '/src/templates/home.html' },
    { url: '/sign-in', templateUrl: '/src/templates/sign-in.html' },
    { url: '/sign-up', templateUrl: '/src/templates/sign-up.html' }
];

wd.createRoot('app')
    .routes(ROUTES)
    // .component('Link', {
    //     template: '<a href="{href}">{label}</a>',
    //     beforeMount: function (app, template) {
    //         return template;
    //     }
    // });

wd.createRoot('header')
    .routes([{ url: '*', templateUrl: '/src/templates/header.html' }])
    .component('Link', {
        template: '<a route href="{href}">{label}</a>',
        beforeMount: function (app, template) {
            return template;
        }
    });